# Example: Automation Rule

```json
{
  "name": "Block Games During Work Hours",
  "trigger": {
    "type": "app_launch",
    "conditions": [{ "field": "category", "operator": "equals", "value": "games" }]
  },
  "schedule": { "days": [1, 2, 3, 4, 5], "startTime": "09:00", "endTime": "18:00" },
  "actions": [
    { "type": "block", "message": "Gaming apps are not allowed during work hours" },
    { "type": "notify", "recipients": ["manager"] }
  ]
}
```
