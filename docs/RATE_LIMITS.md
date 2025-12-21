# Rate Limits

## API Limits
- Standard: 100 req/min
- Premium: 1000 req/min
- Enterprise: Custom

## Headers
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Handling
Implement exponential backoff