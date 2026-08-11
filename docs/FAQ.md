# FAQ

## General

### What is Sentinela?
Sentinela is an employee monitoring platform that tracks activity, productivity, and security.

### Is it legal to monitor employees?
Laws vary by country. Generally, employers can monitor company devices with proper notice.

### How is employee privacy protected?
- Screenshots can be blurred
- Personal applications can be excluded
- Data is encrypted at rest and in transit

## Technical

### What platforms are supported?
- Windows 10/11
- macOS 12+
- Linux (Ubuntu, Fedora)
- iOS 14+
- Android 10+

### How much bandwidth does the agent use?
- Activity data: ~50KB/hour
- Screenshots: ~500KB each (configurable quality)

### Can employees disable tracking?
No, the agent runs as a service and requires admin privileges to stop.

## Troubleshooting

### Agent not connecting?
1. Check internet connection
2. Verify API URL in settings
3. Check firewall rules
4. Restart the agent

### Screenshots not capturing?
1. Check screenshot interval setting
2. Verify screen capture permissions
3. Check disk space