# ADR 007: Edge Functions Pattern

## Status
Accepted

## Context
The project has 68 edge functions. There is a need for standardized error handling, validation, and shared logic.

## Decision
- **Structure:** Use a `_shared` folder for common utilities (auth, validation, cors).
- **Validation:** Use Zod for input validation in every edge function.
- **Error Handling:** Standardize JSON error responses with `status` and `error` fields.
- **Logging:** Use `console.error` and `console.warn` structured logs for centralized tracking.
- **Security:** Always verify JWT (except for public endpoints) and use `service_role` client for elevated DB operations.

## Consequences
- Predictable API behavior.
- Easier maintenance of common logic.
- Faster development of new functions.
