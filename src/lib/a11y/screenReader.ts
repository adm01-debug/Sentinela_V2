// Screen reader support utilities
export const screenReader = {
  srOnly: { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 },
  notSrOnly: { position: 'static', width: 'auto', height: 'auto', padding: 0, margin: 0, overflow: 'visible', clip: 'auto', whiteSpace: 'normal' },
};

export const headingLevels = {
  validate: (html: string) => {
    const headings = html.match(/<h([1-6])/g)?.map(h => parseInt(h[2])) || [];
    for (let i = 1; i < headings.length; i++) { if (headings[i] - headings[i - 1] > 1) return false; }
    return true;
  },
  getStructure: (html: string) => {
    const headings = html.match(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi) || [];
    return headings.map(h => ({ level: parseInt(h[2]), text: h.replace(/<[^>]+>/g, '') }));
  }
};

export const formLabels = {
  ensureLabels: (formElement: HTMLFormElement) => {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    const unlabeled: HTMLElement[] = [];
    inputs.forEach(input => { if (!input.id || !document.querySelector(`label[for="${input.id}"]`)) unlabeled.push(input as HTMLElement); });
    return unlabeled;
  },
  createLabel: (inputId: string, text: string) => { const label = document.createElement('label'); label.htmlFor = inputId; label.textContent = text; return label; }
};

export const errorMessages = {
  announce: (message: string) => { const el = document.createElement('div'); el.setAttribute('role', 'alert'); el.textContent = message; document.body.appendChild(el); setTimeout(() => el.remove(), 5000); },
  linkToField: (errorId: string, inputId: string) => { const input = document.getElementById(inputId); if (input) input.setAttribute('aria-describedby', errorId); }
};
