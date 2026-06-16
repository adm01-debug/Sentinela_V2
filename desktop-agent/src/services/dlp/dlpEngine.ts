import log from "electron-log";

// ============================================================
// DLP Engine — avalia texto contra políticas e classifiers
// ============================================================

export interface DLPClassifier {
  code: string;
  name: string;
  pattern: string;
  validator?: string | null;
  default_severity: "low" | "medium" | "high" | "critical";
  default_action: "alert" | "redact" | "block";
}

export interface DLPPolicy {
  id: string;
  name: string;
  classifier_code?: string | null;
  custom_pattern?: string | null;
  keywords?: string[] | null;
  severity: "low" | "medium" | "high" | "critical";
  action: "alert" | "redact" | "block";
  scope: string[];
  is_active: boolean;
}

export interface DLPMatch {
  classifier_code: string;
  classifier_name: string;
  policy_id?: string;
  severity: "low" | "medium" | "high" | "critical";
  action: "alert" | "redact" | "block";
  start: number;
  end: number;
  preview: string; // partially masked
}

export interface DLPScanResult {
  matched: boolean;
  matches: DLPMatch[];
  highestAction: "none" | "alert" | "redact" | "block";
  highestSeverity: "low" | "medium" | "high" | "critical" | "none";
}

const ACTION_RANK: Record<string, number> = { none: 0, alert: 1, redact: 2, block: 3 };
const SEVERITY_RANK: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };

// ----- Validators -----
function validateCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cpf[10]);
}

function validateCNPJ(value: string): boolean {
  const cnpj = value.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (slice: string, weights: number[]) => {
    const sum = slice.split("").reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, ...w1];
  return (
    calc(cnpj.slice(0, 12), w1) === parseInt(cnpj[12]) &&
    calc(cnpj.slice(0, 13), w2) === parseInt(cnpj[13])
  );
}

function validateLuhn(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function runValidator(name: string | null | undefined, value: string): boolean {
  if (!name) return true;
  switch (name) {
    case "cpf":
      return validateCPF(value);
    case "cnpj":
      return validateCNPJ(value);
    case "luhn":
      return validateLuhn(value);
    default:
      return true;
  }
}

function maskPreview(value: string): string {
  if (value.length <= 4) return "****";
  return value.slice(0, 2) + "*".repeat(Math.max(0, value.length - 4)) + value.slice(-2);
}

// ----- Engine -----
export class DLPEngine {
  private classifiers = new Map<string, DLPClassifier>();
  private policies: DLPPolicy[] = [];
  private compiled = new Map<string, RegExp>();

  loadClassifiers(list: DLPClassifier[]): void {
    this.classifiers.clear();
    this.compiled.clear();
    for (const c of list) {
      this.classifiers.set(c.code, c);
      try {
        this.compiled.set(c.code, new RegExp(c.pattern, "gi"));
      } catch (err) {
        log.warn(`DLP: invalid regex for classifier ${c.code}`, err);
      }
    }
  }

  loadPolicies(list: DLPPolicy[]): void {
    this.policies = list.filter((p) => p.is_active);
    for (const p of this.policies) {
      if (p.custom_pattern) {
        const key = `policy:${p.id}`;
        try {
          this.compiled.set(key, new RegExp(p.custom_pattern, "gi"));
        } catch (err) {
          log.warn(`DLP: invalid custom regex on policy ${p.id}`, err);
        }
      }
    }
  }

  scan(text: string, scope: "clipboard" | "screenshot" | "file" = "clipboard"): DLPScanResult {
    const matches: DLPMatch[] = [];
    if (!text || text.length === 0) {
      return { matched: false, matches, highestAction: "none", highestSeverity: "none" };
    }

    for (const policy of this.policies) {
      if (!policy.scope.includes(scope)) continue;

      // 1. Classifier-based policy
      if (policy.classifier_code) {
        const cls = this.classifiers.get(policy.classifier_code);
        const re = this.compiled.get(policy.classifier_code);
        if (cls && re) {
          re.lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = re.exec(text)) !== null) {
            if (!runValidator(cls.validator, m[0])) continue;
            matches.push({
              classifier_code: cls.code,
              classifier_name: cls.name,
              policy_id: policy.id,
              severity: policy.severity,
              action: policy.action,
              start: m.index,
              end: m.index + m[0].length,
              preview: maskPreview(m[0]),
            });
            if (m.index === re.lastIndex) re.lastIndex++;
          }
        }
      }

      // 2. Custom pattern
      const customRe = this.compiled.get(`policy:${policy.id}`);
      if (customRe) {
        customRe.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = customRe.exec(text)) !== null) {
          matches.push({
            classifier_code: "CUSTOM",
            classifier_name: policy.name,
            policy_id: policy.id,
            severity: policy.severity,
            action: policy.action,
            start: m.index,
            end: m.index + m[0].length,
            preview: maskPreview(m[0]),
          });
          if (m.index === customRe.lastIndex) customRe.lastIndex++;
        }
      }

      // 3. Keywords
      if (policy.keywords && policy.keywords.length > 0) {
        const lower = text.toLowerCase();
        for (const kw of policy.keywords) {
          const k = kw.toLowerCase();
          let idx = lower.indexOf(k);
          while (idx !== -1) {
            matches.push({
              classifier_code: "KEYWORD",
              classifier_name: policy.name,
              policy_id: policy.id,
              severity: policy.severity,
              action: policy.action,
              start: idx,
              end: idx + k.length,
              preview: maskPreview(kw),
            });
            idx = lower.indexOf(k, idx + k.length);
          }
        }
      }
    }

    let highestAction: DLPScanResult["highestAction"] = "none";
    let highestSeverity: DLPScanResult["highestSeverity"] = "none";
    for (const m of matches) {
      if (ACTION_RANK[m.action] > ACTION_RANK[highestAction]) highestAction = m.action;
      if (SEVERITY_RANK[m.severity] > SEVERITY_RANK[highestSeverity]) highestSeverity = m.severity;
    }

    return { matched: matches.length > 0, matches, highestAction, highestSeverity };
  }

  hasPolicies(): boolean {
    return this.policies.length > 0;
  }
}

export const dlpEngine = new DLPEngine();
