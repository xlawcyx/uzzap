# App Flow Analysis (Uzzap Buddy Chat)

## 1) Current flow

1. App starts in `app/index.tsx`, waits for auth store bootstrap, then redirects based on auth state.
2. Root layout initializes auth state and applies route guards between auth and protected areas.
3. Authenticated users land in `(tabs)` and can open chatrooms.
4. Chatroom screen joins room membership, loads room/messages, restores draft, and subscribes to realtime updates.

## 2) Resolved gaps

- Login no longer force-navigates to tabs after sign-in; it relies on root auth guard.
- Chatroom setup now has guarded async flow with error handling and loading state cleanup.
- Typing timeout is cleared during unmount cleanup.

## 3) Remaining risks and missing pieces

### A) Service error contract is inconsistent
Service methods return `null`/`[]` in some failures, while other flows throw errors. This makes UI retry and specific error messaging harder.

**Where seen**
- `services/authService.ts`
- `services/chatroomService.ts`
- `services/messageService.ts`
- `services/buddyService.ts`

### B) Backend guarantees are implicit
Room counters/activity consistency appears to depend on DB-side logic that is not represented in this repo (no migrations/schema/policies committed).

**Where seen**
- `services/chatroomService.ts`

### C) Missing backend artifacts in repository
No migration/schema or policy files are present, making reproducible environments and audits difficult.

**Suggested priority**
1. Standardize service error result types (P1)
2. Add schema/migration/policy artifacts to repo (P1)
3. Add integration checks against staging Supabase (P2)
