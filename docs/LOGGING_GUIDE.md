# Logging Guide

## Log Levels
- `debug`: Development
- `info`: General info
- `warn`: Warnings
- `error`: Errors

## Format
```json
{
  "timestamp": "ISO8601",
  "level": "info",
  "message": "Event occurred",
  "context": {}
}
```