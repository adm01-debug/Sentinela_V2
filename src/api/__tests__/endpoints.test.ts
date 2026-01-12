import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi, usersApi, employeesApi, reportsApi } from "../endpoints";
import { api } from "../client";

vi.mock("../client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("API Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authApi", () => {
    it("calls login endpoint", async () => {
      await authApi.login({ email: "test@test.com", password: "password" });
      expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "test@test.com", password: "password" });
    });

    it("calls logout endpoint", async () => {
      await authApi.logout();
      expect(api.post).toHaveBeenCalledWith("/auth/logout");
    });
  });

  describe("usersApi", () => {
    it("lists users", async () => {
      await usersApi.list({ page: "1" });
      expect(api.get).toHaveBeenCalledWith("/users", { params: { page: "1" } });
    });

    it("gets user by id", async () => {
      await usersApi.get("123");
      expect(api.get).toHaveBeenCalledWith("/users/123");
    });
  });

  describe("employeesApi", () => {
    it("creates employee", async () => {
      const data = { name: "John", email: "john@test.com" };
      await employeesApi.create(data);
      expect(api.post).toHaveBeenCalledWith("/employees", data);
    });
  });
});
