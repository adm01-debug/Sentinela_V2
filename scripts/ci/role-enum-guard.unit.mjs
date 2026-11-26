import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  analyze,
  extractRoleFilters,
  parseAppRoleEnum,
  resolveConstant,
} from "./role-enum-guard.mjs";

const TYPES = `
      app_role: "admin" | "user" | "Admin" | "Analyst" | "Manager" | "User"
      ...
        app_role: ["admin", "user", "Admin", "Analyst", "Manager", "User"],
`;

const ROLES_QUERY = `supabase.from("user_roles").select("role").eq("user_id", id)`;

test("parseAppRoleEnum le a lista de valores do tipo gerado", () => {
  assert.deepEqual(parseAppRoleEnum(TYPES), [
    "admin",
    "user",
    "Admin",
    "Analyst",
    "Manager",
    "User",
  ]);
  assert.equal(parseAppRoleEnum("sem enum aqui"), null);
});

test("extractRoleFilters le lista literal, inclusive em varias linhas", () => {
  const source = `${ROLES_QUERY}
    .in("role", [
      "admin",
      "super_admin",
    ])
    .maybeSingle();`;
  const filters = extractRoleFilters(source);
  assert.equal(filters.length, 1);
  assert.deepEqual(filters[0].values, ["admin", "super_admin"]);
});

test("extractRoleFilters resolve constante do proprio arquivo", () => {
  const source = `const ELEVATED_ROLES = ["admin", "Admin", "Manager"];
${ROLES_QUERY}.in("role", ELEVATED_ROLES);`;
  assert.deepEqual(extractRoleFilters(source)[0].values, ["admin", "Admin", "Manager"]);
});

test("extractRoleFilters resolve spread de constante do proprio arquivo", () => {
  const source = `const ELEVATED_ROLES = ["admin", "Admin", "Manager"] as const;
${ROLES_QUERY}.in("role", [...ELEVATED_ROLES]).order("role").limit(1).maybeSingle();`;
  assert.deepEqual(extractRoleFilters(source)[0].values, ["admin", "Admin", "Manager"]);
});

test("extractRoleFilters acusa spread de constante inexistente no arquivo", () => {
  const source = `${ROLES_QUERY}.in("role", [...PAPEIS_ELEVADOS]);`;
  assert.equal(extractRoleFilters(source)[0].values, null);
});

test("extractRoleFilters marca expressao dinamica como nao verificavel", () => {
  const source = `${ROLES_QUERY}.eq("role", role.name.toLowerCase() as never);`;
  assert.equal(extractRoleFilters(source)[0].values, "dinamico");
});

test("resolveConstant devolve null quando a constante nao esta no arquivo", () => {
  assert.equal(resolveConstant(`const OUTRA = 1;`, "PAPEIS"), null);
});

test("analyze acusa valor inexistente no enum", () => {
  const documents = [
    {
      path: "src/providers/AuthProvider.tsx",
      source: `${ROLES_QUERY}.in("role", ["admin", "supervisor"]).maybeSingle();`,
    },
    {
      path: "supabase/functions/send-webhook/index.ts",
      source: `${ROLES_QUERY}.in("role", ["admin"]);`,
    },
  ];
  const violations = analyze({ documents, allowed: ["admin", "user"] });
  assert.deepEqual(violations, [
    { path: "src/providers/AuthProvider.tsx", line: 1, value: "supervisor" },
  ]);
});

test("analyze acusa has_role com valor fora do enum", () => {
  const documents = [{ path: "src/guards/index.tsx", source: `has_role(user.id, 'super_admin')` }];
  assert.deepEqual(analyze({ documents, allowed: ["admin", "user"] }), [
    { path: "src/guards/index.tsx", line: 1, value: "super_admin" },
  ]);
});

test("analyze ignora arquivo que nao consulta user_roles", () => {
  const documents = [
    { path: "src/outro.ts", source: `.from("reports").in("role", ["supervisor"])` },
  ];
  assert.deepEqual(analyze({ documents, allowed: ["admin", "user"] }), []);
});

test("analyze nao acusa filtro dinamico nem lista de valores validos", () => {
  const documents = [
    { path: "src/hooks/useRoles.ts", source: `${ROLES_QUERY}.eq("role", role.name.toLowerCase())` },
    { path: "src/services/authService.ts", source: `${ROLES_QUERY}.eq("role", "admin")` },
  ];
  assert.deepEqual(analyze({ documents, allowed: ["admin", "user"] }), []);
});

test("analyze acusa constante nao resolvida em vez de silenciar", () => {
  const documents = [
    { path: "supabase/functions/x/index.ts", source: `${ROLES_QUERY}.in("role", PAPEIS_ELEVADOS)` },
  ];
  const violations = analyze({ documents, allowed: ["admin", "user"] });
  assert.equal(violations.length, 1);
  assert.equal(violations[0].value, "PAPEIS_ELEVADOS");
});

test("o tipo gerado do repositorio declara os valores reais do enum", () => {
  const typesText = fs.readFileSync(
    path.join(process.cwd(), "src/integrations/supabase/types.ts"),
    "utf8"
  );
  const allowed = parseAppRoleEnum(typesText);
  assert.ok(allowed.includes("admin"), "admin precisa estar na lista");
  assert.ok(!allowed.includes("super_admin"), "super_admin nao existe em app_role");
});
