import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: "1", name: "User 1", email: "user1@test.com" },
      { id: "2", name: "User 2", email: "user2@test.com" },
    ]);
  }),

  http.get("/api/employees", () => {
    return HttpResponse.json([
      { id: "1", name: "Employee 1", department: "Engineering" },
      { id: "2", name: "Employee 2", department: "Design" },
    ]);
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json();
    if (body.email === "test@test.com") {
      return HttpResponse.json({ token: "mock-token", user: { id: "1" } });
    }
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  http.get("/api/activities", () => {
    return HttpResponse.json({ data: [], total: 0 });
  }),
];
