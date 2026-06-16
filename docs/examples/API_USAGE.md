# Example: API Usage

```javascript
const response = await fetch("/api/v1/employees", {
  headers: { Authorization: `Bearer ${apiKey}` },
});
const employees = await response.json();
// Create employee
await fetch("/api/v1/employees", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John", email: "john@example.com" }),
});
```
