# ADR 005: React Query vs Zustand

## Status

Accepted

## Context

The application uses both React Query (for server state) and Zustand (for client state). There is significant overlap where Zustand is being used to store data that is already managed by React Query.

## Decision

- **Server State:** Use React Query exclusively for data fetched from the backend. Do not copy React Query data into Zustand stores.
- **Global UI State:** Use Zustand for pure client-side state (sidebar open/close, theme, modals, current selection).
- **Caching:** Leverage React Query's `staleTime` and `gcTime` for caching rather than manual persistence in stores.

## Consequences

- Reduced boilerplate.
- Better data consistency (no manual syncing needed).
- Clearer separation of concerns.
