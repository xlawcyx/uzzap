# Production Readiness Test Checklist

This checklist is tailored to the current Expo + Supabase app architecture (auth onboarding, buddy graph, chatrooms, realtime messaging, media upload, notifications, settings, and multi-platform delivery).

## 1) Build, static quality, and release artifact tests

- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run typecheck` passes with zero TypeScript errors.
- [ ] `npm run doctor` passes (Expo health checks).
- [ ] `npm run build:web` succeeds and generated web export launches correctly.
- [ ] `npm run build:ios` succeeds for release profile.
- [ ] `npm run build:android` succeeds for release profile.
- [ ] Release app starts without redboxes/warnings in production mode.
- [ ] Verify source maps/symbol upload flow for crash diagnostics.

## 2) Environment and configuration tests

- [ ] App fails gracefully if required env vars are missing (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- [ ] `.env.local` values map correctly in local, preview, and production channels.
- [ ] App identifies the correct Supabase project per environment.
- [ ] No secrets are hardcoded in client code, logs, or static bundles.
- [ ] Deep links and redirects are configured for web and native auth flows.

## 3) Authentication and onboarding flow tests

### Login/register/recovery
- [ ] New user registration succeeds with valid values.
- [ ] Duplicate/invalid email registration shows clear errors.
- [ ] Login succeeds and stores session across app restarts.
- [ ] Invalid credentials produce user-safe error messaging.
- [ ] Forgot-password flow sends reset and reset link works.
- [ ] Account recovery status screen behavior is correct for all states.
- [ ] Email verification screen handles verified/unverified states.

### Onboarding steps
- [ ] Welcome -> username-check -> complete-profile flow is navigable end-to-end.
- [ ] Username availability check handles success, taken, and network errors.
- [ ] Interests selection persists and reloads correctly.
- [ ] Location permission prompt handles allow/deny/limited cases.
- [ ] Invite-friends step can be skipped/completed without breaking profile creation.

## 4) Profile and identity tests

- [ ] Profile fetch/create/update paths work and reflect in UI immediately.
- [ ] Presence updates (`is_online`, `last_seen`) are written correctly.
- [ ] Sign-out clears session and protected routes redirect to auth.
- [ ] Public profile pages render correctly for self and other users.
- [ ] Avatar/image upload (if enabled) handles large files and failures.

## 5) Buddy system tests

- [ ] Buddy search returns expected users and excludes harmful false positives.
- [ ] Sending buddy request creates exactly one pending request.
- [ ] Accepting request creates reciprocal buddy rows and updates UI.
- [ ] Declining request updates status and removes pending badge.
- [ ] Relationship status query returns `accepted`/`pending`/`none` correctly.
- [ ] Removing buddy removes both relationship edges.
- [ ] Concurrent accept/decline actions are conflict-safe (idempotent outcomes).

## 6) Chatroom lifecycle tests

- [ ] Discover/recent/saved/search/category screens load expected room sets.
- [ ] Create chatroom validates required fields and saves correctly.
- [ ] Edit chatroom applies changes and respects permissions.
- [ ] Join/leave chatroom updates membership and visibility instantly.
- [ ] Members list reflects current membership accurately.
- [ ] Join-request flow behaves correctly where approval is required.
- [ ] Direct chat creation is idempotent (same pair yields same room slug).

## 7) Messaging tests

- [ ] Message list loads in descending backend order and displays chronologically.
- [ ] Pagination (`before`) fetches older messages without duplicates/gaps.
- [ ] Sending text message succeeds and appears for all members.
- [ ] Mark-as-read upsert tracks read status once per user/message.
- [ ] Soft delete sets `is_deleted` and renders deleted state appropriately.
- [ ] Image upload to `message-images` storage works and URL is accessible by intended audience.
- [ ] Failed message sends/uploads show retry UI and never silently disappear.
- [ ] Realtime updates recover correctly after network interruption.

## 8) Notification tests

- [ ] Permission flow works on iOS and Android (grant/deny paths).
- [ ] Expo push token registration succeeds and is stored server-side if required.
- [ ] Android notification channel is created with expected importance/vibration.
- [ ] Local notification scheduling works and payload data routes correctly.
- [ ] Web behavior degrades gracefully where push is unavailable.

## 9) Settings, preferences, and persistence tests

- [ ] All settings routes open without runtime errors.
- [ ] Appearance/language/accessibility values persist across restart.
- [ ] Data saver, app controls, privacy toggles correctly affect app behavior.
- [ ] Backup/export flows complete and output expected format.
- [ ] Diagnostics/storage usage screens show accurate values.

## 10) Offline, latency, and resilience tests

- [ ] App boot with no connectivity shows recoverable offline UI.
- [ ] Authenticated user can reopen app offline without crash.
- [ ] Message compose/send during outage queues or fails with clear user feedback.
- [ ] State stores recover after process kill and resume.
- [ ] Slow network conditions do not break navigation or create duplicate actions.

## 11) Data integrity and backend contract tests

- [ ] Supabase row-level security policies enforce least privilege for every table used.
- [ ] Unauthorized reads/writes are rejected for profiles, buddy tables, chatrooms, messages.
- [ ] Storage bucket permissions for message images match product policy.
- [ ] DB indexes cover common filters (`chatroom_id`, `created_at`, membership lookups).
- [ ] Migration rollback plan verified on staging data snapshot.
- [ ] Referential integrity holds under deletes (no orphaned memberships/messages).

## 12) Security and abuse-prevention tests

- [ ] Input sanitization prevents script/markup injection in names/messages.
- [ ] Rate limits exist for login attempts, buddy requests, and message send spikes.
- [ ] Authentication tokens are rotated/expired as expected.
- [ ] Sensitive data is excluded from logs and analytics events.
- [ ] App handles blocked/reported users according to policy.
- [ ] Community guideline and legal screens are reachable and current.

## 13) Performance and scalability tests

- [ ] Cold start and time-to-interactive meet targets on low-end devices.
- [ ] Memory usage remains stable during long chat sessions.
- [ ] Scroll performance in long message lists stays smooth (no dropped-frame spikes).
- [ ] Large chatroom member lists render efficiently.
- [ ] Server-side load test validates expected concurrent user/message throughput.
- [ ] Battery/network usage acceptable during idle realtime connection.

## 14) Cross-platform UX and accessibility tests

- [ ] iOS, Android, and Web core flows pass with equivalent behavior.
- [ ] Safe area, keyboard avoidance, and gesture navigation all behave correctly.
- [ ] Screen reader labels/roles are present for interactive controls.
- [ ] Dynamic text scaling does not break layouts.
- [ ] Color contrast meets WCAG for text and controls.
- [ ] Haptics/animation degrade gracefully on unsupported devices.

## 15) Observability and operations readiness tests

- [ ] Crash reporting captures JS/native crashes with release metadata.
- [ ] Key funnel analytics events fire exactly once with correct properties.
- [ ] Alerting thresholds for auth failures, send failures, and crash spikes are configured.
- [ ] On-call runbook exists for Supabase outage, push outage, and release rollback.
- [ ] Feature flags (if any) can disable risky features without redeploy.

## 16) Manual smoke suite for every release candidate

- [ ] Register -> onboard -> login -> logout.
- [ ] Send/accept buddy request between two users.
- [ ] Create/join chatroom and send text + image.
- [ ] Read receipts and message deletion behavior.
- [ ] Receive local/push notification and deep-link into target screen.
- [ ] Update profile and verify data persistence.
- [ ] Verify critical settings and legal/support pages.
- [ ] Run 15-minute exploratory session looking for regressions.

## Suggested test gates before production rollout

- **Gate A (CI quality):** lint + typecheck + unit/integration suite green.
- **Gate B (staging quality):** smoke suite green on iOS/Android/Web.
- **Gate C (release quality):** production build artifacts signed + install tested.
- **Gate D (operational readiness):** monitoring, alerting, and rollback validated.
