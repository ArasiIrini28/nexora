# NEXORA master source delivery · 2.0.0

This archive continues the existing application and preserves its six subjects, original foundations, age experiences, private Site identity, and version-1 guest/account progress. It is the entire editable project, with no external runtime dependency folders or real credentials.

## Implemented

- Shared visible NEXORA logo/name/tagline and responsive header on dashboard, preferences, subject paths, learning screens, account pages, and AI overlay. Dashboard, all six subjects, tutor, progress, preferences, signup/login, profile, and logout are accessible. Four navigation/presentation variants retain navy/blue/amber branding.
- Six topics in each of six subjects: 36 expanded topics with prerequisites, explanations, two examples, working models, real-world investigations, three checks, misconception feedback, project notebooks, and rubrics. Two completion milestones per topic, sequential unlocking, continuation, and persistence. Existing 24 age-specific foundation treatments remain intact.
- Primary model-first stories, narration controls, simple choices and 36 concrete projects; middle-school prediction experiments; secondary technical lessons and JavaScript investigations; advanced theory, assumptions, parameter sweeps and CSV export. Captioned models and reduced-motion alternatives.
- XP, milestones, accuracy/hint-based practice recommendations, age-scoped mastery estimates, topic counts, notes, saved foundations, backups, weekly goals, configurable focus duration and break reminders, and completed focus-session history.
- Real server-side Supabase integration: validated registration, unique usernames, email/username login, confirmation, recovery/reset, HttpOnly sessions and refresh, profile name/initials avatar, logout, account-separated progress and conflict-aware sync. SQL schema, RLS policies and exact email templates included. Guest mode works independently.
- Real server-side OpenAI Responses API integration: canonical lesson context, age-adaptive instructions, hints, explanations, coding help, summaries, generated practice and follow-up conversations; loading, retry, timeout and service-error handling. Keys stay on the server. No fixture answers are shipped as app behavior.
- Production build, configuration examples, installation/deployment guides, source-packaging script, and automated checks.

## Verification actually completed

| Check | Result |
| --- | --- |
| `npm test` | **107 passed, 0 failed** |
| `npm run build` | Passed; all frontend/backend JS modules syntax-checked; deployable `build/` produced |
| `node tests/production-smoke.cjs` | Built server serves frontend and models; `.env` cannot be downloaded; missing AI and auth return honest 503 errors |
| `tests/course-browser.cjs` | **144 topic/age journeys**, **432 answers**, **288 persisted completions**, **14,400 XP**; model controls, code, projects, locks, reload, mobile and reduced motion passed |
| `tests/browser-test.cjs` | All **24 foundation age/subject journeys**, code execution, feedback, persistence and responsive/reduced-motion checks passed |
| `tests/navigation-browser.cjs` | Four ages × 1440/820/390 px = **12 responsive cases**; **72 subject links**, brand, preferences, dashboard, progress and tutor links passed |
| `tests/course-tools-browser.cjs` | Discovery prediction feedback, changing model frames, topic continuation, advanced CSV, focus preferences and progress navigation passed |
| `tests/auth-browser.cjs` | Registration, duplicate username, invalid credentials, password controls, profile, login/logout, account switching and progress isolation/restoration passed with explicit API fixtures |
| `tests/recovery-browser.cjs` | Honest missing configuration and recovery/reset form behavior passed; recovery transport explicitly mocked |
| `tests/tutor-browser.cjs` | Missing provider, loading, follow-up, lesson context, error/retry and mobile UI passed with explicit provider fixtures |
| Source ZIP | Integrity/required-file/exclusion checks performed by `scripts/package.py`; fresh-extraction install/test/build/runtime verification performed for delivery |

Machine-readable evidence is in `verification/`. Chromium browser testing used Playwright. No JavaScript console errors were reported by the journey/navigation suites. The production build is plain JavaScript; no TypeScript or lint command is configured, so neither is claimed as run.

## Setup required and limits

1. **Live external services are unverified.** No OpenAI or Supabase credentials were configured. Real registration, recovery email delivery, SQL/RLS execution, cross-device sync, and generated AI answer quality must be tested against the configured services. Transport/UI fixture tests are not live-service tests.
2. **Deploy the Node backend to activate accounts and AI.** The existing private Sites publication is static: guest learning and ZIP download work there, but Node API routes do not run. The README explains same-origin Node deployment, HTTPS, SMTP, schema migration, server-only environment variables and provider billing.
3. **The curriculum has defined bounds.** Six authored topic paths per subject are implemented, not every possible subtopic or a complete school/university syllabus. Older groups share factual core text with distinct activities/scaffolding and advanced extensions. Advanced content does not constitute a full university course. Educator review and broader assessments remain future work. Projects are saved self-assessments, not automated grading or certified mastery.
4. **Adaptation is rule-based.** Recommendations use accuracy, retries and hints; the question bank is finite (three checks per topic/age) and not a calibrated personalized tutoring engine. Initial placement covers mathematics only.
5. **Browser capabilities have limits.** Narration depends on installed voices; actual audible playback was not verified by headless tests. Focus is an in-app timer/reminder and cannot block other apps. The code worker supports bounded synchronous JavaScript, not an isolated general-purpose IDE. Advanced CSVs contain model computations, not external research measurements.
6. **Account scope:** initials avatars are implemented; image uploads, MFA, email changes and account deletion UI are not. Account caches are not encrypted. Progress is learner-managed and not tamper-proof certification. Process-local auth/AI limits need durable per-user controls for a large public deployment.

The archive excludes secrets, `.env`, private learner data, `.git`, node_modules, build caches, temporary screenshots/logs and nested archives. `.env.example` contains blank/default configuration values only. The existing Site remains owner-private.
