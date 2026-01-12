export * from "./auth";

export const testUsers = {
  admin: { email: "admin@example.com", password: "admin123" },
  user: { email: "user@example.com", password: "user123" },
  viewer: { email: "viewer@example.com", password: "viewer123" },
};

export const testData = {
  employee: { name: "Test Employee", email: "employee@test.com" },
  team: { name: "Engineering", description: "Engineering team" },
  report: { name: "Weekly Report", type: "productivity" },
};
