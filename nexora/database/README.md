# Configure Supabase Auth and progress

1. Create a Supabase project and enable the Email provider in Authentication. Keep email confirmation enabled for production. Set password minimum length to 12 (the app enforces 12–128 characters). Configure production SMTP/email sending with the provider before opening registration to real learners.
2. Run `001_auth_progress.sql` once in the project's SQL editor as the project database owner. It creates profiles, unique lowercase usernames, progress rows, row-level security policies, an Auth signup trigger, and two narrowly scoped functions. This migration is not intended to be run twice unchanged.
3. Copy `.env.example` to `.env` on the Node server. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY` (the legacy anon JWT key), and `SUPABASE_SERVICE_ROLE_KEY` (the legacy service-role JWT key). These values are all server-only in this implementation. Never paste the service-role key into the browser, `dist/`, a public build variable, a URL, or the source archive.
4. Set the Supabase Authentication Site URL to your Node application's origin, e.g. `http://127.0.0.1:3000` for local development or your HTTPS deployment URL. The origin must match the app you run, not a static-only preview.
5. In Authentication → Email Templates → Confirm signup, set the confirmation link to:

```html
<a href="{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}">Confirm your NEXORA account</a>
```

The server verifies the one-time token with Supabase, sets HttpOnly session cookies, and redirects to `/`. Tokens are not placed in the browser's localStorage. The default Supabase template also confirms the email, but the learner must then manually log in; the custom template provides a server-managed session immediately.
6. In Authentication → Email Templates → Reset Password, use:

```html
<a href="{{ .SiteURL }}/api/auth/recovery/confirm?token_hash={{ .TokenHash }}">Reset your NEXORA password</a>
```

The recovery handler verifies the one-time token, sets protected session cookies, and opens the reset form. Saving the new password delegates to Supabase, clears the current browser session, and asks the learner to log in again. Supabase controls token expiry. Test expired/used links and email delivery with your SMTP configuration. Configure server/proxy logs to redact the `token_hash` query string.

7. Start with `npm ci` and `npm start` (Node 22.9+). For production, deploy the Node server behind HTTPS; set `NODE_ENV=production`, `COOKIE_SECURE=true`, `HOST=0.0.0.0` as appropriate to your host, and the host's assigned `PORT`. Keep the API and browser app on the same origin. Preserve the real Host and Origin through the reverse proxy. Session cookies use HttpOnly, SameSite=Lax, Secure in production, and Path=/api.
8. Test with two real accounts after configuration: register/confirm each, log in by email and username, verify unique username rejection, complete different lessons, reload, log out, and use a second browser to confirm cross-device restoration. Check that account A cannot select/update account B's rows using its own access token. These live tests were not run in the build environment because no Supabase credentials were supplied.

## Data and isolation

Supabase Auth hashes and stores passwords. NEXORA stores no password in its database or browser storage. The profiles table stores full name and unique username linked to `auth.users.id`. The progress table stores selected age, completions, attempt evidence, XP-derived achievements, preferences, notes, bookmarks, topic/project evidence, focus history, and revision metadata. The server normalizes all saved progress and recalculates XP from completion records. Achievements are derived from those records rather than stored as a second inconsistent copy.

RLS restricts profile and progress access to `auth.uid()`. Profile names can be edited; usernames cannot be changed by authenticated clients. A security-definer lookup function joins username to the current Auth email and is executable only with the service-role key. The server uses it only for signup collision checks and username login; it never exposes the resolved email. Progress calls use the learner's JWT and anon API key, never the service-role key.

Guest progress stays under `nexora-v1`. Signed-in pending work is cached under a separate per-account key and never shown to another account or a guest. Successful logout clears the synchronized account cache. If a network failure prevents sync, a pending copy remains for the same account to recover after reauthentication. As with other browser-local data, someone with direct access to browser developer tools can inspect that cache; do not treat shared browser storage as encrypted storage. Export a backup before clearing browser data.

On login, cloud state is restored; unsubmitted local edits for that same account merge with it. Completed lessons are unioned and XP is deduplicated. Concurrent writes use revision comparison and retry after merging. Local pending preferences and notes take precedence during a conflict; attempt histories use the record with the greater attempt count rather than adding duplicate evidence. Simultaneous bookmark removals may reappear during a merge. Guest-to-account import is explicit from Profile Settings, preventing accidental mixing on a shared device.

## Operational limits

Auth attempts are limited to 20 per IP per 10 minutes in each Node process; also enable Supabase's auth rate limits and optional bot protection for public deployments. The Node limiter is not a distributed or durable abuse-control system. Shared proxies may share an IP bucket. Cookie sessions refresh automatically via Supabase. Logging out revokes the local Supabase refresh session and clears cookies; an already issued access JWT can remain valid until its expiry, per Supabase's session model.

Password recovery and reset are implemented through the email flow above. MFA enrollment, email changes, account deletion UI, and profile image uploads remain outside this release. The avatar is generated from the learner's initials. Use Supabase administrative tools for those remaining account operations. No cloud-sync success is claimed until a request succeeds against the configured service.
