# UtsavAI - Deployment, DevOps & Production Specification

**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI

---

## 1. Document Information

- **Document name:** 10-DEPLOYMENT-DEVOPS-SPECIFICATION.md
- **Version:** 1.0
- **Status:** Draft
- **Product:** UtsavAI — AI-powered Celebration & Event Planning Platform
- **Source documents:**
  - `01-PRD.md` — Product Requirements Document
  - `02-FRS.md` — Functional Requirements Specification
  - `03-NFR.md` — Non-Functional Requirements
  - `04-DATABASE.md` — Database & Data Model Specification
  - `05-API-SPECIFICATION.md` — API Specification
  - `06-AI-SPECIFICATION.md` — AI Architecture & Behavior Specification
  - `07-UI-UX-SPECIFICATION.md` — UI/UX Specification
  - `08-SECURITY-AUTHORIZATION-SPECIFICATION.md` — Security & Authorization Specification
  - `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md` — Testing & QA Specification
- **Purpose:** Define how UtsavAI is developed, configured, built, deployed, and maintained in production. This document is the authoritative reference for environment setup, deployment pipeline, infrastructure configuration, production readiness, and operational concerns.
- **Intended audience:** Developer, project owner, QA, any contributor working on UtsavAI deployment.

---

## 2. Deployment Objective

UtsavAI must be deployable using free-tier infrastructure wherever practical.

The target initial cost is **₹0**.

### Primary Architecture

```text
Developer
    ↓
Local Development (localhost:3000)
    ↓
Git commit + push (manual, by project owner only)
    ↓
GitHub (source control)
    ↓
Vercel (build + deployment)
    ↓
Next.js Application (frontend + API routes)
    ↓
Supabase
    ↓
PostgreSQL + Auth + Storage
```

### AI Integration Architecture

```text
Browser (user action)
    ↓
Next.js Server (API route or server action)
    ↓
Gemini API (Google AI)
    ↓
Validated response
    ↓
Application state / database
```

**The AI API key must never be exposed to the browser. All Gemini calls must be made server-side.**

### Guiding Constraints

- Prefer free tiers of existing services.
- Avoid microservices, Kubernetes, Redis, Elasticsearch, and dedicated paid infrastructure.
- The application must remain a modular monolith.
- Optimize the application itself before adding infrastructure.
- The project owner performs all Git operations manually. The AI must not run `git commit` or `git push`.

---

## 3. Technology Stack

### Application

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI library | React 19 |
| Styling | Tailwind CSS v4 |
| Component system | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Charts | Recharts |
| Form handling | React Hook Form + Zod |
| State (client) | Zustand |
| Calendar | `OPEN DECISION` — FullCalendar or equivalent open-source library |
| PDF export | `OPEN DECISION` — client-side or server-side open-source PDF solution |

### Backend (within Next.js)

| Layer | Technology |
|---|---|
| API layer | Next.js API Routes (`/api/*`) |
| Server actions | Next.js Server Actions (where appropriate) |
| ORM | Prisma |
| Runtime | Node.js (production via Vercel) |

### Infrastructure

| Service | Role | Tier |
|---|---|---|
| GitHub | Source control, Vercel deployment trigger | Free |
| Vercel | Build, deployment, hosting, preview environments | Free (Hobby tier) |
| Supabase | PostgreSQL, Auth, Storage | Free tier |
| Google Gemini API | AI plan generation and chat | Free tier where available |

### Existing `package.json` (frontend directory)

The current `frontend/package.json` lists the following key runtime dependencies that are relevant to deployment:

- `next` — Next.js application framework
- `react`, `react-dom` — React runtime
- `@prisma/client`, `prisma` — Database ORM
- `zustand` — Client state management
- `react-hook-form`, `zod` — Form and validation
- `recharts` — Charts
- `lucide-react` — Icons
- `tailwindcss` — CSS framework
- `sonner` — Toast notifications
- `next-themes` — Theme switching
- `@tanstack/react-query` — Server state / data fetching
- `date-fns` — Date utilities

**Note on build script:** The current `package.json` build script (`next build && cp -r ...`) uses Unix `cp` commands. On Windows, this step fails after `next build` completes. See section 12 for the corrected cross-platform build approach.

---

## 4. Environments

### Local Development

- **URL:** `http://localhost:3000`
- **Purpose:** Active feature development and debugging
- **Database:** Local Supabase instance or development Supabase project
- **AI:** Uses development `GEMINI_API_KEY` from `.env.local`
- **Auth:** Uses development Supabase Auth configuration
- **Data:** Development or seed data; not production data
- **Hot reload:** Enabled via Next.js Turbopack development server

### Preview (Vercel)

- **URL:** Automatically assigned per-branch URL (e.g., `utsavai-feature-xyz.vercel.app`)
- **Purpose:** Testing pull requests and feature branches before merging to production
- **Database:** `OPEN DECISION` — use a dedicated staging Supabase project or connect to development project
- **AI:** Uses preview environment variable configuration in Vercel
- **Auth:** Preview redirect URLs must be configured in Supabase Auth
- **Data:** Not production data

### Production

- **URL:** Custom domain (`OPEN DECISION` — see section 18)
- **Purpose:** Live UtsavAI application serving real users
- **Database:** Supabase production project
- **AI:** Production `GEMINI_API_KEY` stored in Vercel environment variables
- **Auth:** Supabase Auth configured for production domain
- **Data:** Real persistent user data; must not be modified or seeded manually

### Environment Differences

| Concern | Local | Preview | Production |
|---|---|---|---|
| Database | Dev Supabase project | `OPEN DECISION` | Dedicated production Supabase project |
| Auth redirect URLs | `http://localhost:3000/**` | Preview Vercel URL | Custom domain |
| AI API key | Dev key in `.env.local` | Preview key in Vercel | Production key in Vercel |
| `NODE_ENV` | `development` | `production` | `production` |
| Error verbosity | Full errors, stack traces | Full errors | Safe error messages only |
| Analytics | Off | `OPEN DECISION` | `OPEN DECISION` |

---

## 5. Local Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm (bundled with Node.js)
- A Supabase account and development project
- A Google Gemini API key (free tier)
- Git

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd utsavai
   ```

2. **Navigate to the application directory**

   The Next.js application lives in the `frontend/` directory:

   ```bash
   cd frontend
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Configure environment variables**

   Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the values in `.env.local` (see section 7). Never commit `.env.local`.

5. **Generate Prisma client**

   ```bash
   npm run db:generate
   ```

6. **Push database schema (development)**

   ```bash
   npm run db:push
   ```

   This pushes the Prisma schema to the configured Supabase PostgreSQL database.

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. **Verify**

   Open `http://localhost:3000` in a browser. The home page should load without errors.

9. **Run lint check**

   ```bash
   npm run lint
   ```

### Notes

- The `start` script in `package.json` currently calls `bun` directly. For local development, use `npm run dev`. For production startup, Vercel manages the runtime — the `start` script is not required in Vercel-hosted deployments.
- The `build` script uses Unix `cp` commands. On Windows, the standalone copy step will fail; however, Vercel runs builds in a Linux environment where this works. For local production build testing on Windows, consider running in WSL or replacing the `cp` commands with cross-platform alternatives.

---

## 6. Project Structure

The actual repository structure at the time of this document:

```text
utsavai/
├── docs/                          ← All project documentation
│   ├── 01-PRD.md
│   ├── 02-FRS.md
│   ├── 03-NFR.md
│   ├── 04-DATABASE.md
│   ├── 05-API-SPECIFICATION.md
│   ├── 06-AI-SPECIFICATION.md
│   ├── 07-UI-UX-SPECIFICATION.md
│   ├── 08-SECURITY-AUTHORIZATION-SPECIFICATION.md
│   ├── 09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md
│   └── 10-DEPLOYMENT-DEVOPS-SPECIFICATION.md
├── frontend/                      ← Next.js application
│   ├── src/
│   │   ├── app/                   ← Next.js App Router pages and API routes
│   │   ├── components/            ← UI components
│   │   ├── lib/                   ← Shared utilities, store, data helpers
│   │   └── hooks/                 ← Custom React hooks
│   ├── public/                    ← Static assets
│   ├── prisma/                    ← Prisma schema and migrations
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.example               ← Template for required environment variables
├── db/                            ← Local SQLite/database files (dev only)
├── .gitignore
└── README.md
```

**Notes on current state observed during audit:**
- Some documentation files exist at the repository root alongside `docs/`. The `docs/` folder should be the canonical home for all project documentation.
- The `frontent/` directory (note: typo in the directory name) was the original scaffold directory. The `frontend/` directory is the corrected active application directory.
- `prisma/`, `scripts/`, `tests/`, and `mini-services/` directories exist at the repo root. Their role should be documented or consolidated as backend integration progresses.

---

## 7. Environment Variables

### `.env.example` Template

The repository must include an `.env.example` file in the `frontend/` directory listing all required variable names without real values. This file is committed to Git.

```text
# ─────────────────────────────────────────────
# UtsavAI — Environment Variables Template
# Copy this file to .env.local and fill in values.
# Never commit .env.local.
# ─────────────────────────────────────────────

# ── PUBLIC VARIABLES ─────────────────────────
# These are exposed to the browser. Never put secrets here.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# ── SERVER-ONLY VARIABLES ─────────────────────
# These must NEVER appear in client-side JavaScript.
# Vercel server environment only.

SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
DATABASE_URL=

# ── OPTIONAL ─────────────────────────────────
# NODE_ENV is set by the runtime (development/production).
# Do not set it manually in .env files.
```

### Public Variables

| Variable | Purpose | Exposed to Browser |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for client-side Supabase calls | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key for client auth and RLS | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL for link generation | Yes |

These variables are intentionally public. The Supabase `anon` key is designed to be public — Row Level Security is the authorization layer, not key secrecy.

### Server-Only Variables

| Variable | Purpose | Exposed to Browser |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Full Supabase admin access (bypasses RLS) | **Never** |
| `GEMINI_API_KEY` | Google Gemini AI API credential | **Never** |
| `DATABASE_URL` | Supabase PostgreSQL connection string | **Never** |

**Security rules:**
- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side API routes or server actions where necessary. It must never be imported in any `"use client"` component.
- `GEMINI_API_KEY` must never appear in client-side code. All Gemini API calls must be made in Next.js API routes or server actions.
- `DATABASE_URL` must never be exposed to the browser.

### Critical Rule

**Never put secrets directly in source code.** If a secret is hardcoded in source code, assume it is compromised and rotate it immediately.

---

## 8. Environment Variable Management

### Local Development

- Store local values in `frontend/.env.local`
- `.env.local` must appear in `.gitignore` and must never be committed
- If `.env.local` is accidentally committed, rotate all secrets immediately

### Production and Preview (Vercel)

- Configure all environment variables in the Vercel project dashboard under **Settings → Environment Variables**
- Assign each variable to the appropriate environment scope: Production, Preview, and/or Development
- Production secrets must only be scoped to Production
- Never copy production values into `.env.local` of a development machine unless the developer has appropriate access and understands the risk

### Variable Rotation

- If a secret is exposed (committed to Git, logged, visible in error output): rotate it immediately in both Vercel and Supabase dashboard
- After rotation, revoke the old key if the provider supports it

### What Must Never Happen

- Secret values must not appear in documentation files
- Secret values must not appear in code comments
- Secret values must not appear in error messages
- Secret values must not be logged

---

## 9. GitHub Workflow

GitHub serves as:

- Primary source control
- Version history
- Deployment trigger for Vercel
- Collaboration and change review mechanism

### Critical Rule: Git Operations

**The AI must never perform `git commit` or `git push` operations.**

All Git commit and push operations are performed manually by the project owner:

```bash
git status
git add <files>
git commit -m "<message>"
git push
```

The AI may inspect code, suggest changes, and create or modify files in the workspace. The project owner reviews and commits those changes.

### Repository Access

The Vercel integration connects to the GitHub repository. When the project owner pushes to the configured branch, Vercel automatically triggers a build.

---

## 10. Branching Strategy

Keep the strategy simple and appropriate for a single-developer or small team project.

### Main Branch

**`main`** — the production branch. Code on `main` is considered deployable.

Vercel is configured to deploy the `main` branch to production.

### Feature Branches (optional)

**`feature/<feature-name>`** — for isolating work on a specific feature before merging to `main`.

Examples:
- `feature/backend-auth`
- `feature/ai-plan-generation`
- `feature/export-pdf`

Feature branches trigger Vercel preview deployments automatically.

### Merge Process

1. Develop on a feature branch
2. Test locally and verify via Vercel preview deployment
3. Merge to `main` (directly or via pull request)
4. Vercel triggers production build and deployment

### Guidelines

- Do not maintain long-lived branches that diverge significantly from `main`
- Do not introduce a complex GitFlow (no `develop`, `release`, `hotfix` branches) for this project
- Merge small, working increments rather than large batches
- Write clear commit messages

---

## 11. Vercel Deployment

### Integration Setup

1. Sign in to [vercel.com](https://vercel.com) with a GitHub account
2. **Import project** from GitHub repository
3. Configure the project settings

### Project Configuration

| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | `frontend/` |
| Build command | `OPEN DECISION` — verify against actual repository structure; default `next build` may apply if Vercel detects Next.js in the root directory |
| Output directory | `.next` (default for Next.js) |
| Install command | `npm install` |
| Node.js version | LTS (20.x recommended) |

> **OPEN DECISION:** Confirm the exact Vercel root directory setting. If the Next.js application is inside `frontend/`, the root directory must be set to `frontend/`. If it is at the repository root, no setting is needed.

### Environment Variables

Add all variables from section 7 to Vercel via **Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL` — Production + Preview + Development
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Production + Preview + Development
- `NEXT_PUBLIC_APP_URL` — set to actual domain per environment
- `SUPABASE_SERVICE_ROLE_KEY` — Production + Preview (server-only)
- `GEMINI_API_KEY` — Production + Preview (server-only)
- `DATABASE_URL` — Production + Preview (server-only)

### Production Branch

Set the production branch to `main` in Vercel project settings.

### Preview Deployments

Vercel automatically creates preview deployments for all branches pushed to GitHub. Preview URLs follow the pattern:

```text
utsavai-<branch-hash>.vercel.app
```

Preview deployments are useful for testing features before merging to `main`.

### Custom Domain

Connect the custom domain after registering it. See section 18.

`OPEN DECISION` — exact domain name not yet determined.

### Automatic Deployment Flow

```text
Project owner runs: git push origin main
    ↓
GitHub webhook notifies Vercel
    ↓
Vercel clones repository
    ↓
Vercel runs: npm install
    ↓
Vercel runs: next build
    ↓
Vercel deploys to production URL
    ↓
Previous deployment remains on standby for rollback
```

---

## 12. Build Process

### Development Build

```bash
npm run dev
```

Starts the Next.js development server with Turbopack hot reload on `http://localhost:3000`.

### Production Build (Local)

```bash
npm run build
```

Current build script in `package.json`:

```json
"build": "next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/"
```

**Windows compatibility issue:** The `cp -r` commands are Unix-only. On Windows PowerShell they will fail after `next build` completes. Since Vercel runs builds in a Linux environment, this issue does not affect Vercel deployments. For local Windows testing, consider:

- Running in WSL2 (Windows Subsystem for Linux)
- Replacing `cp -r` with `xcopy /E /I` or using `shx` as a cross-platform alternative

**Recommended cross-platform build script:**

```json
"build": "next build",
"postbuild": "shx cp -r .next/static .next/standalone/.next/ && shx cp -r public .next/standalone/"
```

Install `shx` as a dev dependency: `npm install --save-dev shx`

### Build Quality Gates

The build must enforce the following quality checks before deployment:

```text
npm install
    ↓
TypeScript type check (tsc --noEmit)
    ↓
ESLint lint check (npm run lint)
    ↓
Unit tests (if configured)
    ↓
next build
    ↓
Deploy to Vercel
```

### Critical: Remove `ignoreBuildErrors`

The current `next.config.ts` contains:

```ts
typescript: {
  ignoreBuildErrors: true,
}
```

**This must be removed before production backend integration.** With this setting, TypeScript compilation errors are silently skipped during `next build`. Type errors would reach production invisibly. The correct production configuration is:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
};
```

Remove `ignoreBuildErrors`. Fix all TypeScript errors. This is a prerequisite for a reliable production build.

### Build Failure Handling

If the build fails:

- Vercel does not deploy the broken build
- The previous deployment remains live
- The project owner reviews the Vercel build logs
- Fixes are committed and pushed; Vercel retriggers automatically

---

## 13. Database Deployment

### Database Provider

Supabase PostgreSQL is the production database.

### Supabase Project Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project for the production environment
3. Note the project URL, anon key, service role key, and database connection string
4. Configure these values in Vercel environment variables (see section 7)

### Schema Management

The Prisma schema (`prisma/schema.prisma`) defines all tables and relationships.

#### Schema Deployment Approaches

| Approach | When to Use | Notes |
|---|---|---|
| `prisma db push` | Early development, schema exploration | Pushes schema directly without migration history. Use only in development. |
| `prisma migrate dev` | Generating migration files during development | Creates versioned migration SQL files in `prisma/migrations/`. |
| `prisma migrate deploy` | Applying migrations to production or staging | Applies pending migrations without prompting. Safe for CI/production. |

**Production rule:** Use `prisma migrate deploy` for production schema changes. Do not use `db push --accept-data-loss` in production under any circumstances.

### Schema Change Process

1. Modify `prisma/schema.prisma` locally
2. Run `npx prisma migrate dev --name <migration-name>` to generate migration SQL
3. Review the generated SQL in `prisma/migrations/`
4. Test the migration against a development database
5. Commit the migration files to Git
6. Deploy to preview; verify migration runs correctly
7. Merge to `main`; migration runs automatically via `prisma migrate deploy` in the deploy step

**Never apply schema changes to production directly from the Supabase dashboard without corresponding migration files in Git.**

### Entity Summary

Core database entities as defined in `04-DATABASE.md`:

- `users` — linked to Supabase Auth `auth.users`
- `events` — owned by users
- `event_preferences` — per event
- `budget_categories` — per event
- `expenses` — per event
- `tasks` — per event
- `task_dependencies` — cross-task
- `timeline_milestones` — per event
- `vendors` — per event
- `guests` — per event
- `schedule_items` — per event (event-day schedule)
- `ai_conversations` — per event
- `ai_messages` — per conversation
- `notifications` — per user/event

### Data Integrity

- Every event must be owned by a user (`events.user_id` references `auth.users.id`)
- All child resources must reference their parent event and be validated through the ownership chain at the API layer
- Referential integrity must be enforced at the database level via foreign keys and cascade rules

---

## 14. Supabase Configuration

### Authentication

| Setting | Value |
|---|---|
| Provider | Email/password (enabled by default) |
| Google OAuth | `OPEN DECISION` — configure if required |
| Site URL | Set to production domain (e.g., `https://utsavai.com`) |
| Redirect URLs | Allowlist production domain, preview domain patterns |
| Email confirmation | `OPEN DECISION` — enable for production |
| Password minimum length | 8 characters recommended |

**Critical:** After deploying to a custom domain, update the Supabase **Site URL** and **Redirect URLs** to include the production domain. Authentication will break if these are left pointing to `localhost`.

### PostgreSQL

| Setting | Value |
|---|---|
| Database | Supabase-managed PostgreSQL |
| Connection | Via `DATABASE_URL` (Prisma connection string) |
| Pooling | Use Supabase connection pooler URL for serverless environments (Vercel) |
| SSL | Required in production |

**Note for Vercel/serverless:** Use the Supabase **transaction pooler** connection string (port 6543) for Prisma in serverless environments, not the direct connection (port 5432). Configure Prisma connection URL accordingly:

```text
DATABASE_URL="postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:6543/<database>?pgbouncer=true"
```

### Row Level Security (RLS)

RLS must be enabled on all tables that hold user data:

- `events`
- `tasks`
- `task_dependencies`
- `budget_categories`
- `expenses`
- `vendors`
- `guests`
- `timeline_milestones`
- `schedule_items`
- `ai_conversations`
- `ai_messages`
- `notifications`

RLS policies must enforce that a user can only read and modify their own records.

Example pattern for `events`:

```sql
-- Users can only see their own events
CREATE POLICY "Users can view own events"
ON events FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert events for themselves
CREATE POLICY "Users can insert own events"
ON events FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

The API layer provides a second authorization layer (see `08-SECURITY-AUTHORIZATION-SPECIFICATION.md`). RLS is a defense-in-depth measure.

**OPEN DECISION:** Determine whether the application uses the Supabase client directly (relying on RLS) or exclusively routes through Next.js API routes using the service role key with manual authorization checks. Both approaches are valid. If the service role key is used in API routes, RLS remains a safety net for direct database access.

### Storage

`POST-MVP` — Supabase Storage is not required for the MVP.

If file attachments are added in a future version:

- Create a private bucket per user or per event
- Apply storage policies matching event ownership
- Restrict file types and sizes
- Serve files through Supabase Storage URLs with access control

---

## 15. Authentication Deployment

### Required Verification After Deployment

After every environment change (new preview deployment, production launch, domain change):

1. **Registration** — create a new account; verify email/password accepted; verify redirect to onboarding
2. **Login** — sign in with existing credentials; verify session established; verify redirect to dashboard
3. **Logout** — verify session is destroyed; verify redirect to home/login; verify protected routes no longer accessible without re-auth
4. **Session persistence** — reload the page while authenticated; verify session survives a browser refresh
5. **Protected route access** — attempt to access `/dashboard` or any app route when unauthenticated; verify redirect to login
6. **Password behavior** — `OPEN DECISION` — determine whether password reset flow is required for MVP

### Supabase Auth Redirect URL Configuration

For each environment, the following redirect URLs must be allowlisted in Supabase Auth:

| Environment | Redirect URL |
|---|---|
| Local development | `http://localhost:3000/**` |
| Vercel preview | `https://*.vercel.app/**` |
| Production | `https://<custom-domain>/**` |

Without correct redirect URL configuration, OAuth callbacks and email confirmation links will fail.

### Google OAuth

`OPEN DECISION` — Google OAuth is not required for MVP.

If enabled:

1. Configure a Google Cloud OAuth 2.0 client ID and secret
2. Enable Google provider in Supabase Auth dashboard
3. Add the Supabase callback URL to the Google Cloud authorized redirect URIs
4. Add production domain to Google OAuth authorized origins
5. Test the complete Google sign-in flow in preview before enabling in production

Do not mark Google OAuth as implemented until it has been tested end-to-end.

---

## 16. Gemini API Deployment

### Architecture

All Gemini API calls must be made server-side:

```text
Browser (user triggers action)
    ↓
Next.js API route (e.g., /api/ai/generate-plan)
    ↓
Event context construction (server-side only)
    ↓
Gemini API (using GEMINI_API_KEY from environment)
    ↓
Structured response validation
    ↓
Response to browser (sanitized, validated)
```

**Never:**
```text
Browser
    ↓
Gemini API with GEMINI_API_KEY embedded in client bundle
```

### API Key Configuration

- Store `GEMINI_API_KEY` as a server-only environment variable in Vercel
- Never use `NEXT_PUBLIC_` prefix for the Gemini key
- Never import the key in a `"use client"` component
- Never log the key in server logs

### Model Selection

`OPEN DECISION` — The specific Gemini model to use (e.g., `gemini-1.5-flash`, `gemini-2.0-flash-exp`, etc.) is not yet finalized. Select a model that:

- Supports the required context window for event data
- Supports structured output (JSON mode) for plan generation
- Is available on the free tier

### Rate Limits and Free-Tier Constraints

Gemini API free tier limits change over time. The application must be designed to handle:

- Rate limit errors (HTTP 429) — return a user-friendly message; do not retry immediately in a loop
- Quota exhaustion — inform the user the AI is temporarily unavailable; non-AI features continue to work
- Provider outages — graceful degradation; core planning features (tasks, budget, vendors, guests) function without AI

### Error Handling

AI route error responses must:

- Not expose the raw API error message to the user
- Not expose the API key or provider details
- Return a safe, user-friendly error message
- Log the full error server-side for debugging

### Fallback Behavior

If the AI API is unavailable:

- The application continues to function for all non-AI features
- The event plan generation step shows a clear error message with a retry option
- The AI chat responds with a graceful unavailability message
- No data corruption or broken state results from an AI failure

---

## 17. AI Usage Control

Unnecessary AI calls increase latency, consume quota, and increase cost. The following patterns must be followed.

### Plan Generation

```text
User completes onboarding
    ↓
User triggers "Generate Plan"
    ↓
Single AI API call with event context
    ↓
AI returns structured plan (tasks, timeline, budget suggestions)
    ↓
Plan is displayed for user review
    ↓
User accepts or edits
    ↓
Accepted plan is persisted to database
    ↓
Subsequent views read from database — NO further AI calls
```

A generated plan must not be regenerated on every page load. Once accepted and stored, the plan is served from the database.

### AI Chat

```text
User sends message
    ↓
Server constructs relevant context only:
  - Current event details
  - Budget summary (totals, not every transaction)
  - Upcoming task count and overdue count
  - Vendor count and statuses
  - Guest RSVP summary
    ↓
Context + user message sent to Gemini
    ↓
Response returned to user
```

Do not send the full database contents for every chat message. Build a focused, minimal context object server-side.

### Protections Against Excessive Usage

- Implement per-user rate limiting on AI endpoints (e.g., N chat messages per hour, N plan generations per event per day)
- Cache generated plans — do not allow unlimited regeneration in a tight loop
- Validate that the AI request is meaningful before sending (e.g., reject empty messages)
- Log AI usage (without sensitive content) for monitoring

`OPEN DECISION` — exact rate limit thresholds to be determined based on API tier limits.

---

## 18. Production Domain

The application is not considered production-ready until a custom domain is connected and verified.

### Domain Requirements

- HTTPS must be active (Vercel provides automatic TLS via Let's Encrypt)
- The domain must resolve to the Vercel deployment
- Supabase Auth `Site URL` must be updated to the production domain
- All OAuth redirect URLs must include the production domain
- The `NEXT_PUBLIC_APP_URL` environment variable must be set to the production domain

### Configuration Steps

1. Register a domain (`OPEN DECISION` — domain name not yet selected)
2. Add the domain in Vercel: **Project → Settings → Domains → Add**
3. Update DNS records as instructed by Vercel (A record or CNAME)
4. Wait for DNS propagation
5. Verify HTTPS is active
6. Update Supabase Auth `Site URL` and redirect URL allowlist
7. Update `NEXT_PUBLIC_APP_URL` in Vercel production environment variables
8. Run post-deployment verification (section 34)

**OPEN DECISION:** Production domain name.

**OPEN DECISION:** DNS provider and registrar.

---

## 19. Favicon

A proper UtsavAI favicon must be present before production launch.

### Requirements

- Favicon file exists at `public/favicon.ico` or configured via Next.js metadata
- The browser tab displays the UtsavAI favicon (not the default Next.js or framework favicon)
- Favicon is visible on desktop and mobile browser tabs
- Apple touch icon configured for iOS home screen saves

### Verification

After production deployment:

1. Open the site in Chrome, Firefox, and Safari
2. Confirm the browser tab shows the UtsavAI favicon
3. On iOS Safari, use "Add to Home Screen" and verify the icon
4. No default framework favicon remains

The application is not considered launch-ready until this is verified.

---

## 20. Branding and AI Label Removal

Before production launch, the following must be removed or replaced:

### Remove

- Any "Made with AI", "Generated by AI", or similar development-era labels applied to the product itself (not to AI-generated content within the product)
- Generator-tool branding (e.g., scaffold tool names in page titles or footers)
- Temporary demo branding such as "Demo interface. Not a real product launch." in the public footer
- Placeholder logos or icon sets from templates
- Any hardcoded demo disclaimers not appropriate for a production launch

### Keep

- The `AiGeneratedBanner` within the onboarding plan review step — this correctly marks AI-generated content as such, which is required behavior per `06-AI-SPECIFICATION.md`
- All third-party open-source license notices where legally required
- Honest product disclaimers about AI limitations

### Replace

- Temporary demo copy with production-appropriate copy
- Placeholder UtsavAI logo with the final UtsavAI logo
- Template color palettes with the final brand palette (the existing warm terracotta/sand theme is appropriate if confirmed as the final brand palette)

---

## 21. Privacy Policy

A Privacy Policy page must exist before production launch.

### URL

`/privacy` — accessible without authentication

### Minimum Content

The Privacy Policy must address:

- **What data is collected:** Account information (name, email), event data, guest information, vendor information, expense data
- **How data is used:** To provide the event planning service
- **AI processing:** User inputs and event context are sent to Google Gemini API for plan generation and chat responses
- **Third-party services:** Supabase (database and authentication), Google Gemini (AI), Vercel (hosting)
- **Data storage:** Where data is stored (Supabase PostgreSQL, Supabase's infrastructure)
- **User rights:** What users can do with their data (view, export, delete)
- **Data retention:** How long data is kept
- **Contact:** How to reach the product owner for privacy concerns

### Legal Note

Do not claim GDPR, CCPA, or other specific regulatory compliance unless it has been verified and implemented correctly. The Privacy Policy should be honest about what data is collected and why, without overpromising legal guarantees that have not been validated.

---

## 22. Terms and Conditions

A Terms and Conditions page must exist before production launch.

### URL

`/terms` — accessible without authentication

### Minimum Content

The Terms and Conditions must address:

- **Service description:** UtsavAI is a celebration and event planning tool
- **User accounts:** Users are responsible for their account credentials and account security
- **User content:** Users own their event data; by using the service they grant necessary permissions for data processing
- **AI limitations:** AI-generated plans and suggestions are provided for planning assistance and must be reviewed by the user; UtsavAI does not guarantee accuracy of AI output
- **Acceptable use:** The service must not be used for unlawful purposes, spam, or harassment
- **Service limitations:** No uptime guarantee; free-tier infrastructure has limitations
- **Vendor and guest information:** Users are responsible for the accuracy of guest and vendor data they enter
- **Account termination:** Circumstances under which accounts may be suspended
- **Disclaimer:** Not legal, financial, or professional event management advice

Do not present this document as legal advice. The project owner should review with a qualified legal source if commercial use is planned.

---

## 23. Security Configuration

Production security must implement the requirements defined in `08-SECURITY-AUTHORIZATION-SPECIFICATION.md`.

### HTTPS

- HTTPS is enforced by default on Vercel
- All traffic must use HTTPS
- HTTP requests should redirect to HTTPS

### Environment Variables

- All secrets stored in Vercel environment variables (never in code)
- `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are server-only
- No `NEXT_PUBLIC_` prefix on secrets

### Authentication

- Supabase Auth handles credential storage
- Passwords are never stored by the application
- Sessions use Supabase's secure token mechanism

### Authorization

- Every API route must verify authentication and event ownership before processing
- Client-side route guards are UI conveniences only — server-side authorization is mandatory
- RLS is enabled on all user data tables in Supabase

### API Security

- All protected API endpoints return `401` for unauthenticated requests
- All protected API endpoints return `403` (or `404` for privacy) for unauthorized access
- Input validation is applied on all mutation endpoints
- Calculated financial values are never trusted from client input

### AI Key Protection

- `GEMINI_API_KEY` must never appear in client-side bundles
- Verify using browser DevTools: search for the key value in the JavaScript bundle after production build
- All AI routes are server-side (`/api/ai/*` or server actions)

### Error Handling

- Internal error details, stack traces, and Prisma/database error messages must not be returned to the browser
- Safe, generic error messages are returned to the client
- Full errors are logged server-side

### Security Headers

`OPEN DECISION` — Evaluate adding security headers in `next.config.ts`:

```ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

---

## 24. CORS and Origin Configuration

### Same-Origin API

Because UtsavAI uses Next.js API routes hosted at the same origin as the frontend, the application uses same-origin API requests by default. No CORS configuration is required for the primary API.

### Cross-Origin Considerations

If any requests are made cross-origin (e.g., to Supabase directly from the browser):

- Supabase handles CORS for its own endpoints using the configured `Site URL` and `Redirect URLs`
- Restrict allowed origins to the production domain and preview domain patterns
- Avoid wildcard (`*`) CORS policies for authenticated requests

### Vercel Origin Configuration

No special CORS configuration is required in `next.config.ts` for a standard Next.js deployment on Vercel, as all API routes are same-origin.

---

## 25. Storage Deployment

Supabase Storage is **`POST-MVP`** and is not required for the initial production release.

If Storage is added in a future version:

### Bucket Configuration

- Create a private bucket per user or named `event-attachments`
- Do not use public buckets for user-uploaded content
- Apply Supabase Storage policies matching the event ownership model

### Access Policies

```sql
-- Users can only access their own event attachments
CREATE POLICY "Users can access own attachments"
ON storage.objects FOR ALL
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### File Restrictions

- Allowlist file types (e.g., `image/jpeg`, `image/png`, `application/pdf`)
- Set a maximum file size limit
- Scan file names for path traversal attempts

---

## 26. Notification Deployment

MVP notifications are in-app only.

### Requirements

- Notifications are stored in the `notifications` database table
- Notifications are fetched server-side for the authenticated user
- Notifications are displayed in the app's notification panel
- Mark as read and mark all as read operations persist to the database

### What is Not Required for MVP

- Email notifications — **not required** (avoids paid email infrastructure)
- SMS notifications — **not required**
- WhatsApp notifications — **not required**
- Push notifications — **not required**

These may be considered in future versions using appropriate free-tier services if available.

---

## 27. Export Deployment

The export feature (PDF and ICS) must function correctly in production.

### PDF Export

The current frontend implementation simulates PDF export with a toast notification. The production implementation must:

- Generate an actual PDF file server-side or client-side
- Include event summary, budget breakdown, task list, and timeline as defined in `02-FRS.md`
- Use INR currency formatting
- Handle events with large guest lists or task lists without crashing
- Be downloadable by the authenticated user who owns the event

`OPEN DECISION` — PDF library selection: evaluate `@react-pdf/renderer`, `jsPDF`, or a server-side approach.

### ICS Export

- Generate a valid `.ics` file conforming to the iCalendar standard
- Include event date, time, location, and key milestone dates
- File must be importable into Google Calendar, Apple Calendar, and Microsoft Outlook
- Be downloadable by the authenticated user who owns the event

### Security

- Export requests must verify authentication and event ownership
- A user must not be able to export another user's event data by supplying a different event ID

---

## 28. Logging

### What to Log (Server-Side)

Log the following for observability and debugging:

- API errors with context (route, operation, error type — not sensitive data)
- AI API failures (provider error type, not the API key or prompt content)
- Database operation failures (operation type, table — not query parameters containing user data)
- Authentication failures (type of failure — not passwords or tokens)
- Authorization failures (user attempted unauthorized access — log the fact, not the target data)
- Export generation errors

### What Must Never Be Logged

- Passwords or password hashes
- API keys or authentication tokens
- Full JWT tokens or session secrets
- Sensitive user-generated content (guest contact details, personal notes)
- `GEMINI_API_KEY` or any other secret environment variable
- Full AI prompts containing personal event data (log anonymized metadata only)
- Stack traces exposed to the client

### Log Access

- Local development: console logs visible in the terminal
- Vercel production: accessible via **Vercel Dashboard → Project → Logs**
- Logs are not persisted indefinitely on free tier; act on errors promptly

---

## 29. Error Monitoring

### MVP Approach

For the MVP, use the following without paid external monitoring services:

- **Vercel runtime logs** — visible in the Vercel dashboard; captures server errors in real time
- **Browser console** — for client-side errors during development and QA
- **Application error states** — the UI displays graceful error states when API calls fail
- **User-reported bugs** — reproducible bug reports from users or testers

### Future Consideration

`POST-MVP` — External error monitoring (e.g., Sentry free tier) may be added if:

- Bug reproduction from logs becomes difficult
- The application grows beyond the project owner's ability to monitor manually
- A free tier is available that fits the zero-cost constraint

Do not add external monitoring infrastructure until it is genuinely needed.

---

## 30. Backups and Recovery

### Database Backup

Supabase provides automatic database backups on paid plans. The free tier backup behavior is:

`OPEN DECISION` — Verify current Supabase free-tier backup policy at [supabase.com/docs](https://supabase.com/docs). Free-tier backup availability and retention period changes over time. Do not assume daily backups are included on the free tier.

### User-Level Backup

The Export feature serves as a user-level data backup mechanism:

- Users can export their event data as PDF (human-readable summary)
- Users can export their event calendar as ICS

These exports provide user-facing data portability but are not a substitute for database-level backups.

### Recovery Limitations

- If the Supabase free tier does not include automatic backups, there is no automated recovery mechanism for data loss
- The project owner should evaluate upgrading the Supabase plan if data durability is a requirement
- Schema changes applied without migration files may be unrecoverable

### What Is Outside Application Control

- Supabase infrastructure reliability
- Vercel infrastructure reliability
- Google Gemini API availability
- DNS provider reliability

---

## 31. Rollback Strategy

### Application Rollback

Vercel maintains deployment history. If a production deployment introduces a regression:

1. Go to **Vercel Dashboard → Project → Deployments**
2. Find the last known-good deployment
3. Click **Promote to Production** or **Redeploy**

This instantly restores the previous build to the production URL without requiring a new Git push.

### Code Rollback

If a rollback via Vercel UI is not sufficient:

1. Identify the last good Git commit
2. Create a new commit reverting the problematic change
3. Push to `main`
4. Vercel triggers a new build from the reverted code

Avoid `git reset --hard` on `main` unless you are certain no other collaborators have pulled the commits.

### Database Rollback

**Database rollback must be treated separately from application rollback.**

- Reverting application code does not revert database schema changes
- If a Prisma migration was applied and introduces a problem:
  1. Write a corrective migration to undo the schema change
  2. Apply the corrective migration via `prisma migrate deploy`
  3. Roll back the application code separately
- Do not use `prisma migrate reset` in production — it drops all data

### Environment Variable Rollback

If an environment variable change caused an issue:

1. Go to **Vercel Dashboard → Settings → Environment Variables**
2. Restore the previous value
3. Redeploy the current code (Vercel requires a redeploy to pick up env var changes)

---

## 32. Production Checklist

### Application

- [ ] Production build succeeds without TypeScript errors (after removing `ignoreBuildErrors`)
- [ ] No critical console errors in browser
- [ ] No broken routes or navigation
- [ ] No placeholder content
- [ ] No fake metrics
- [ ] No fake reviews or testimonials
- [ ] No fake customer counters
- [ ] No AI-slop copy
- [ ] No AI-slop images or stock photos
- [ ] No "Made with AI" development branding on the product itself
- [ ] No demo disclaimers ("Not a real product launch") in production UI
- [ ] No hardcoded demo user data visible in production

### Authentication

- [ ] Registration works with real Supabase credentials
- [ ] Login works
- [ ] Logout destroys session correctly
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Session persists across browser refresh
- [ ] Supabase Auth `Site URL` set to production domain
- [ ] Redirect URLs configured for production domain

### Database

- [ ] Production Supabase project configured
- [ ] Schema applied via `prisma migrate deploy`
- [ ] RLS enabled on all user data tables
- [ ] RLS policies verified (user cannot access another user's events)
- [ ] Data persists correctly across sessions
- [ ] No cross-user data access possible

### AI

- [ ] `GEMINI_API_KEY` configured as server-only in Vercel
- [ ] AI key does not appear in client-side JavaScript bundle
- [ ] AI plan generation works end-to-end
- [ ] AI chat works end-to-end
- [ ] AI errors handled gracefully (no raw errors shown to user)
- [ ] AI output validated before being persisted
- [ ] Application functions correctly when AI is unavailable
- [ ] Free-tier rate limits considered

### UI/UX

- [ ] Desktop layout verified (Chrome, Firefox, Safari, Edge)
- [ ] Tablet layout verified
- [ ] Mobile layout verified
- [ ] Keyboard navigation verified for core flows
- [ ] Accessibility issues from QA audit addressed
- [ ] No horizontal overflow on mobile for tables (expenses, budget)

### Production Branding

- [ ] Custom domain connected and HTTPS active
- [ ] Favicon added and verified in browser tab
- [ ] Development/demo branding removed
- [ ] Final UtsavAI logo in place
- [ ] Privacy Policy page exists and is accessible
- [ ] Terms and Conditions page exists and is accessible
- [ ] Footer links to Privacy Policy and Terms

### Exports

- [ ] PDF export generates and downloads a real file
- [ ] ICS export generates and downloads a valid calendar file
- [ ] Export is limited to the authenticated user's own events

### Performance

- [ ] Initial page load under 3 seconds on broadband (NFR-PERF-001)
- [ ] Dashboard renders within 2 seconds for standard event size (NFR-PERF-002)
- [ ] CRUD operations complete within 1 second (NFR-PERF-003)

---

## 33. Pre-Launch QA Gate

No deployment to production should bypass this gate:

```text
Development complete on feature branch
    ↓
npm run lint — must pass (0 errors)
    ↓
TypeScript check (tsc --noEmit) — must pass (0 errors)
    ↓
Unit tests — must pass (if configured)
    ↓
npm run build — must succeed
    ↓
Push to feature branch — Vercel preview deployment
    ↓
Manual QA on preview deployment:
  - Core user journeys (registration → onboarding → plan → manage)
  - Mobile and desktop verification
  - AI features
  - Authentication
    ↓
Security verification:
  - API key not in client bundle
  - RLS policies tested
  - Authorization tested
    ↓
Merge to main — Vercel production deployment
    ↓
Post-deployment verification (section 34)
```

Do not skip the preview deployment step. Production should not receive code that has not been validated on preview.

---

## 34. Post-Deployment Verification

Immediately after each production deployment, verify the following manually:

| Feature | Steps |
|---|---|
| Homepage | Loads correctly; public nav works; all links functional |
| Registration | Create a new account; reaches onboarding |
| Login | Sign in with existing account; reaches dashboard |
| Onboarding | Complete all 7 steps; plan generated; event created |
| Dashboard | Event data displays; stats accurate; quick links work |
| AI plan generation | Generate a plan for a new event; review screen shows |
| Plan acceptance | Accept plan; tasks, timeline, budget populated |
| Budget | Category add/edit/delete; chart renders |
| Tasks | Add/edit/delete/status change; overdue highlighting |
| Timeline | Milestones visible; toggle complete; add milestone |
| Vendors | Add/edit/delete/status; mobile card view |
| Guests | Add/edit/delete/RSVP; group tracking |
| Expenses | Add/edit/delete; planned vs actual |
| Event-Day Schedule | Add/edit/delete items; status toggle |
| AI assistant | Send a message; receive a response |
| Notifications | Mark read; mark all read |
| Settings | Profile update; appearance settings |
| Export | PDF download works; ICS download works |
| Logout | Session ends; redirect to home |
| Privacy Policy | Page loads at `/privacy` |
| Terms and Conditions | Page loads at `/terms` |
| Favicon | Browser tab shows UtsavAI favicon |
| Custom domain | Domain resolves; HTTPS active |

If any item fails: do not consider the deployment complete. Investigate, fix, and re-verify.

---

## 35. Performance and Free-Tier Constraints

### Free-Tier Limits (Reference)

These limits are approximate and subject to change by each provider. Verify current limits on provider documentation before launch.

| Provider | Free Tier Relevant Limits |
|---|---|
| Vercel (Hobby) | 100 GB bandwidth/month; 6,000 minutes of serverless function execution/month; no team features |
| Supabase (Free) | 500 MB database storage; 1 GB file storage; 50,000 monthly active users; 2 GB bandwidth; pauses after 1 week of inactivity |
| Gemini API | Free tier request limits vary by model; check [ai.google.dev](https://ai.google.dev) for current quotas |

**Supabase inactivity pause:** Supabase free projects pause after 1 week of inactivity. This is not appropriate for a production application with real users. Consider:

- Keeping the project active with periodic usage
- Upgrading to a paid Supabase plan for production
- Configuring a simple health check to prevent inactivity pauses

**OPEN DECISION:** Determine whether a Supabase paid plan is required for production given the inactivity pause behavior.

### Performance Optimization Before Adding Infrastructure

Before adding any paid infrastructure, exhaust these free optimizations:

- Efficient database queries with proper indexes (defined in Prisma schema)
- Server-side data fetching with React Query caching
- Pagination for large lists (guests, tasks, expenses)
- Lazy loading for heavy components (charts, AI chat)
- Image optimization via Next.js Image component (if images are added)
- Minimal JavaScript bundle via Next.js code splitting
- Focused AI context to reduce token usage and latency

---

## 36. Cost Control

### Target Cost

**₹0 for initial deployment** using free-tier infrastructure.

### Free Tier Stack

| Service | Free Tier | Constraint |
|---|---|---|
| GitHub | Free for public and private repos | No meaningful limit for this project |
| Vercel (Hobby) | Free | One production deployment per project; bandwidth limits |
| Supabase (Free) | Free | 500 MB storage; inactivity pause |
| Gemini API | Free tier with request quotas | Quota limits per model |
| Domain registration | `OPEN DECISION` — domain may cost ~₹1,000–2,000/year | Not free |

### Cost Escalation Triggers

Monitor and evaluate upgrading if:

- Supabase database storage exceeds 500 MB
- Vercel serverless execution minutes approach the monthly limit
- Gemini API free quota is consistently exhausted
- Supabase inactivity pause becomes a problem for production

### Paid Tier Evaluation

If cost escalation is required:

- Supabase Pro: approximately $25/month — removes storage limits, adds daily backups, no inactivity pause
- Vercel Pro: approximately $20/month — higher bandwidth, team features
- These are operational decisions for the project owner

**Do not add paid infrastructure prematurely.** Optimize the application first.

---

## 37. Deployment Troubleshooting

### Build Failure

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `Type error` in build output | TypeScript errors (if `ignoreBuildErrors` removed) | Fix type errors identified in build log |
| `Module not found` | Missing dependency or incorrect import path | Run `npm install`; check import paths |
| `Cannot find module '@/...'` | Path alias misconfiguration | Verify `tsconfig.json` `paths` and `next.config.ts` |
| `cp: command not found` | Unix `cp` used on Windows | Use WSL or replace with cross-platform tool |
| ESLint errors | Lint rule violations | Fix errors in identified files; run `npm run lint` locally |
| Environment variable missing | Variable not set in Vercel | Add to Vercel environment variables and redeploy |

### Database Failure

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `P1001: Can't reach database` | Incorrect `DATABASE_URL` | Verify connection string in Vercel env vars; use pooler URL for serverless |
| `P1002: Database timed out` | Database paused (Supabase free tier) | Wake the database in Supabase dashboard; consider upgrading |
| `P2002: Unique constraint violation` | Duplicate data on insert | Check business logic; verify upsert vs insert logic |
| `RLS policy violation` | Row Level Security blocking access | Verify RLS policies; check auth context in request |
| Schema mismatch | Prisma schema out of sync | Run `prisma migrate deploy`; regenerate Prisma client |

### Authentication Failure

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Redirect loop on login | Redirect URL not in Supabase allowlist | Add URL to Supabase Auth → URL Configuration |
| `Invalid redirect URL` | Domain not allowlisted | Add production domain to Supabase redirect allowlist |
| Session not persisting | Cookie/session configuration issue | Verify Supabase client configuration in Next.js middleware |
| Google OAuth callback fails | Redirect URI mismatch | Add correct callback URL to Google Cloud OAuth config |

### AI Failure

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `401 Unauthorized` from Gemini | Invalid or missing API key | Verify `GEMINI_API_KEY` in Vercel env vars |
| `429 Too Many Requests` | Rate limit exceeded | Implement backoff; check usage vs free tier quota |
| AI response not structured as expected | Prompt or model change | Review prompt template; validate response schema |
| AI key visible in browser | Key used in client component | Move all AI calls to server routes; remove `NEXT_PUBLIC_` prefix |

### Production UI Issue

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Blank page | JavaScript error preventing render | Check Vercel function logs; check browser console |
| Styles missing | CSS not included in production build | Verify Tailwind configuration; check `next.config.ts` |
| API returns 500 | Server-side error | Check Vercel function logs for error details |
| Data not loading | Auth or database issue | Check network tab; verify auth token being sent |
| Mobile layout broken | Responsive classes not applied | Test with browser DevTools device simulation |

---

## 38. CI/CD

### Current Setup

The current CI/CD pipeline is minimal and appropriate for this project:

```text
Project owner: git push origin main
    ↓
GitHub webhook notifies Vercel
    ↓
Vercel: npm install
    ↓
Vercel: next build
    ↓
Vercel: deploy to production
```

Preview deployments trigger automatically for all branches.

### Recommended Enhancement (No CI Tool Required)

Before merging to `main`, the project owner should run the following locally:

```bash
npm run lint          # ESLint check
npx tsc --noEmit      # TypeScript check
npm run build         # Production build
```

These three checks catch the most common issues before they reach production.

### Future: GitHub Actions (Optional)

`OPEN DECISION` — GitHub Actions are not required for the MVP.

If added later, a workflow could run on every push to `main` or on pull requests:

```yaml
# Example: .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
        working-directory: frontend
      - run: npm run lint
        working-directory: frontend
      - run: npx tsc --noEmit
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
```

Do not introduce GitHub Actions infrastructure unless the manual approach becomes insufficient.

---

## 39. Deployment Traceability

| Requirement | Deployment/DevOps Control | Environment | Verification |
|---|---|---|---|
| NFR-DEPLOY-001: Zero-cost architecture | GitHub + Vercel + Supabase free tiers | All | Architecture review |
| NFR-DEPLOY-002: Environment configuration | Secrets in Vercel env vars; `.env.local` gitignored | All | Deployment review |
| NFR-SEC-001: Authentication security | Supabase Auth; HTTPS enforced by Vercel | Production | Auth flow testing |
| NFR-SEC-002: Authorization | Server-side ownership checks in API routes + RLS | Production | Security review |
| NFR-SEC-003: Data protection | RLS on all tables; service role key server-only | Production | Security review |
| NFR-SEC-005: Secrets management | No secrets in code; all in Vercel env vars | All | Build artifact inspection |
| NFR-SEC-006: AI data handling | AI calls server-side only; `GEMINI_API_KEY` server-only | Production | Bundle inspection |
| NFR-AI-003: AI error handling | Graceful fallback; safe error messages to client | Production | Error scenario testing |
| NFR-REL-005: Authentication reliability | Supabase Auth SLA; session persistence | Production | Auth testing |
| NFR-PERST-001: Production persistence | Real Supabase PostgreSQL; data survives refresh | Production | Manual testing |
| NFR-BRAND-001: Production branding | Custom domain; favicon; Privacy Policy; T&C | Production | Launch checklist |
| NFR-ZERO-001: Free infrastructure | Free tiers of all services | All | Architecture review |
| NFR-OBSERV-001: Error handling | Server-side logging; safe client error messages | Production | Error testing |
| NFR-RATE-001: AI usage limits | Plan cached after generation; per-user rate limits | Production | Load testing |
| NFR-BACKUP-001: Backup expectations | Supabase backup policy documented; user export available | Production | Documentation review |
| NFR-AVAIL-001: Reasonable availability | Vercel + Supabase managed infrastructure | Production | Monitoring |
| SEC-08: AI key protection | `GEMINI_API_KEY` server-only; not in client bundle | Production | Bundle inspection |
| QA-09: Pre-launch QA gate | Preview deployment + manual QA before merge to main | Preview → Production | QA checklist |

---

## 40. Open Deployment Decisions

The following items are explicitly unresolved and must be decided before or during production launch.

| # | Decision | Notes |
|---|---|---|
| OD-01 | **Production custom domain** | Domain name not yet selected or registered |
| OD-02 | **DNS provider and registrar** | Choose registrar; configure DNS to point to Vercel |
| OD-03 | **Vercel root directory setting** | Confirm whether Next.js is in `frontend/` or repo root; set Vercel root directory accordingly |
| OD-04 | **Vercel build command** | Confirm if Vercel auto-detects `next build` or requires manual configuration |
| OD-05 | **Production Supabase project** | Create a dedicated production Supabase project separate from development |
| OD-06 | **Supabase inactivity pause** | Evaluate whether free tier inactivity pause is acceptable for production; consider paid plan |
| OD-07 | **Preview environment database** | Decide whether preview deployments use development Supabase project or a dedicated staging project |
| OD-08 | **Gemini model selection** | Select specific model (`gemini-1.5-flash`, `gemini-2.0-flash`, etc.) based on context window, structured output, and free-tier availability |
| OD-09 | **Google OAuth** | Decide whether Google sign-in is required for MVP or deferred |
| OD-10 | **Email confirmation on registration** | Decide whether Supabase email confirmation is enabled; requires SMTP configuration or Supabase built-in email |
| OD-11 | **PDF library** | Select PDF generation approach: `@react-pdf/renderer`, `jsPDF`, server-side `puppeteer`, or alternative |
| OD-12 | **Calendar library** | Select calendar library for timeline view: FullCalendar, or custom implementation |
| OD-13 | **Supabase connection pooler** | Confirm use of Supabase transaction pooler URL for Vercel serverless; configure Prisma accordingly |
| OD-14 | **RLS implementation approach** | Decide: application uses Supabase client with RLS, or all data access via service role key with API-layer checks, or both |
| OD-15 | **Password reset flow** | Decide whether MVP includes password reset via Supabase email |
| OD-16 | **AI rate limiting thresholds** | Define per-user limits for plan generation and AI chat calls |
| OD-17 | **Error monitoring service** | Evaluate Sentry free tier or remain with Vercel logs only |
| OD-18 | **Backup policy** | Verify Supabase free tier backup retention; decide if paid plan needed for backup guarantees |
| OD-19 | **GitHub Actions CI** | Decide whether to add automated lint/typecheck/build on push |
| OD-20 | **Security headers** | Evaluate and configure `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` in `next.config.ts` |
| OD-21 | **Analytics** | Decide whether to add Vercel Analytics (free tier available) or remain without analytics for MVP |

---

*End of document. Version 1.0 — Draft.*

