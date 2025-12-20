# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email security concerns to: security@sentinela.app
3. Include detailed steps to reproduce the vulnerability
4. Allow up to 48 hours for initial response

## Security Measures

### Authentication
- JWT-based authentication with Supabase
- MFA support available
- Session management with refresh tokens

### Data Protection
- All data encrypted in transit (TLS 1.3)
- Row Level Security (RLS) on all database tables
- Input validation with Zod schemas
- Rate limiting on all API endpoints

### Infrastructure
- Supabase hosted infrastructure
- Regular security updates
- Automated vulnerability scanning

## Responsible Disclosure

We appreciate responsible disclosure and will:
- Acknowledge receipt within 48 hours
- Provide regular updates on remediation
- Credit reporters (if desired) after fix
- Not pursue legal action for good-faith reports

Thank you for helping keep Sentinela secure!
