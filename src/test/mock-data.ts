export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "admin",
  avatar: "https://example.com/avatar.jpg",
  createdAt: new Date().toISOString(),
};

export const mockEmployee = {
  id: "emp-1",
  name: "John Doe",
  email: "john@company.com",
  department: "Engineering",
  status: "active",
  hireDate: "2023-01-15",
};

export const mockActivity = {
  id: "act-1",
  userId: "user-1",
  type: "login",
  timestamp: new Date().toISOString(),
  metadata: { ip: "192.168.1.1" },
};

export const mockReport = {
  id: "rep-1",
  name: "Weekly Report",
  type: "productivity",
  dateRange: { start: "2024-01-01", end: "2024-01-07" },
  data: [],
};

export const mockOrganization = {
  id: "org-1",
  name: "Test Company",
  plan: "enterprise",
  seats: 100,
  usedSeats: 45,
};
