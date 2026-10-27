# UtsavAI — Project Rules & Coding Agent Guidelines

**Document:** RULES.md  
**Product:** UtsavAI  
**Status:** Mandatory  
**Enforcement:** All coding agents, contributors, and subagents  
**Target:** Hackathon Submission & Production-Grade Development  

---

## 1. SOURCE OF TRUTH

Before making architectural, structural, or implementation decisions, coding agents **MUST** review and adhere to the relevant specifications inside the `docs/` directory.

### Documentation Suite:
- `01-PRD.md` — Product Requirements Document & Vision
- `02-FRS.md` — Functional Requirements Specification
- `03-NFR.md` — Non-Functional Requirements & Performance SLAs
- `04-DATABASE.md` — Conceptual Database & Data Model
- `05-API-SPECIFICATION.md` — REST API Specification & Endpoint Contracts
- `06-AI-SPECIFICATION.md` — AI Architecture & Behavioral Guardrails
- `07-UI-UX-SPECIFICATION.md` — UI/UX Design System, Typography & Theme Rules
- `08-SECURITY-AUTHORIZATION-SPECIFICATION.md` — Security, Auth & RLS Specification
- `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md` — Testing & QA Framework
- `10-DEPLOYMENT-DEVOPS-SPECIFICATION.md` — Deployment, CI/CD & DevOps Blueprint
- `11-API-IMPLEMENTATION-SPECIFICATION.md` — Concrete Next.js API Route Contracts
- `12-TECHNICAL-ARCHITECTURE-SPECIFICATION.md` — Modular Monolith Architecture
- `13-DATABASE-IMPLEMENTATION-SPECIFICATION.md` — Supabase PostgreSQL Schema & RLS Matrix
- `14-AI-IMPLEMENTATION-SPECIFICATION.md` — AI Planning Engine & Context Implementation
- `15-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md` — Master QA Matrix & Test Automation
- `16-AI-MEMORY.md` — AI Memory, Context Scoping & Personalization

### Rules:
1. Do not invent requirements that contradict or circumvent these documents.
2. If a requirement is ambiguous, inspect the existing documentation and existing codebase before proceeding.
3. Never silently alter product scope, architecture, or data schemas.

---

## 2. HACKATHON PREREQUISITES

Before preparing any hackathon submission:
- The selected AI coding platform must be installed, configured, and operational.
- Git must be installed and properly configured on the local system.
- The project owner must possess an active, verified GitHub account.
- The project owner must be able to create, configure, and manage public repositories.

---

## 3. HACKATHON REPOSITORY RULES

The final repository submission **MUST** strictly satisfy the following criteria:
1. **Public Repository**: The GitHub repository must be set to **Public**.
2. **Single Branch**: The repository must contain **only one branch** (`main`). No dangling or unmerged feature branches.
3. **Strict Size Constraint**: Total repository size must be **less than 10 MB**.
   - No committed `node_modules`.
   - No committed `.next` build caches or `.vercel` artifacts.
   - No heavy unoptimized media, raw video, or monolithic binary assets.
4. **Complete Source Code**: All required application code, styles, configuration files, and documentation must be present.
5. **Standardized README.md**: A comprehensive, production-grade `README.md` must be present at the root.
6. **Zero Secrets / Credentials**: Absolutely no `.env` secrets, API keys, passwords, or tokens in git history.
7. **Zero Junk Files**: No `.DS_Store`, `Thumbs.db`, `.log`, or scratch files.

---

## 4. THREE-ATTEMPT SUBMISSION LIMIT

The hackathon allows a maximum of **3 submission attempts**. Every attempt is high-stakes.

### Guardrails:
1. **Never Waste an Attempt**: Do not submit an untested build or incomplete candidate.
2. **Mandatory Pre-Submission Audit**: Execute the complete Pre-Commit Quality Gate before any submission.
3. **Zero Known Blockers**: Fix all critical defects, broken routes, and missing configurations prior to submission.
4. **Audit Evaluation Criteria**: Verify alignment with all six hackathon evaluation pillars before submitting.
5. **Treat Attempt #3 as Final**: Treat every attempt with the rigor of the final opportunity.

---

## 5. GIT RULE — CRITICAL & ABSOLUTE

All Git commit and push operations are under the exclusive manual control of the project owner.

### Prohibitions for AI Coding Agents:
Coding agents **MUST NEVER**:
- Execute `git commit`
- Execute `git push`
- Automatically commit changes in the background
- Automatically push changes to remotes
- Execute `git push --force`
- Rewrite Git history (`git rebase -i`, `git reset --hard`)
- Delete branches
- Merge branches
- Create arbitrary feature branches

### Allowed Actions:
- Inspect Git status (`git status`).
- Check diffs and branch names (`git diff`, `git branch`).
- Inspect repository size and file tracking (`git ls-files`).
- Propose exact Git command lines for the project owner to execute manually.

**Workflow:**  
The project owner manually runs `git add`, `git commit`, and `git push` only after all quality checks pass.

---

## 6. PRE-COMMIT QUALITY GATE

Prior to any manual commit by the project owner, the coding agent must verify the following six hackathon evaluation pillars:

### 6.1 Code Quality
- Code is clean, readable, well-commented, and maintainable.
- Naming conventions are consistent across types, components, functions, and files.
- UI components are modular, composable, and avoid bloated monolithic structures.
- Redundant and duplicated logic is extracted into shared utility or domain functions.
- Dead code, unused imports, console logs, and temporary debugging artifacts are purged.
- Robust error handling exists across all asynchronous flows.
- No unnecessary npm dependencies have been installed.
- `npm run lint` passes with **0 errors and 0 warnings**.
- `npx tsc --noEmit` passes with **0 type errors**.
- `npm run build` succeeds completely.

### 6.2 Security
- Zero committed secrets: `GEMINI_API_KEY`, Supabase `service_role` keys, and database passwords remain strictly in untracked environment variables.
- `.env` and `.env.local` are explicitly ignored in `.gitignore`.
- Authentication is enforced on all protected views and API endpoints via Supabase session verification.
- Authorization is strictly enforced server-side; client-provided `user_id` values are never trusted.
- Multi-tenant data isolation is guaranteed via Row Level Security (RLS) policies and `auth.uid()` checks.
- All incoming request bodies and query parameters pass runtime schema validation (Zod).
- Sensitive internal stack traces and SQL errors are never returned to clients.
- AI has no direct database mutation privileges and cannot bypass authorization.

### 6.3 Efficiency
- Free-tier infrastructure constraints (Vercel + Supabase) are strictly respected.
- Unnecessary AI calls are eliminated; deterministic logic handles calculations.
- Context payloads sent to Gemini are pruned (< 1,500 tokens) and stripped of PII.
- Database reads leverage indexed foreign keys and filter columns; avoid N+1 queries.
- Client-side bundles are optimized; dynamic imports used for heavy components (charts).
- Generated AI plans are staged and cached to avoid redundant generation calls.
- No heavy distributed infrastructure (Redis, Kafka, microservices) has been introduced.

### 6.4 Testing
- Core user workflows operate smoothly without client-side console errors.
- Authentication (registration, login, session persistence, logout) works cleanly.
- Event management (create, read, update, delete) works reliably.
- Deterministic budget calculations (spent, remaining, utilization %) are accurate.
- Task management and dependency cycle detection operate correctly.
- Timeline milestones, vendor tracking, and guest RSVP counters function as intended.
- AI plan generation and context-aware chat function cleanly or degrade gracefully.
- Export functionality (PDF/ICS) produces valid files without leaking database internals.
- UI components implement explicit Loading, Empty, Data, and Error-with-retry states.
- Mobile layouts display cleanly across responsive breakpoints without horizontal scroll.

### 6.5 Accessibility (WCAG 2.1 AA)
- Full keyboard operability: all interactive controls are reachable via `Tab` with no keyboard traps.
- Visible, high-contrast focus outlines across all active components.
- Semantic HTML tags used appropriately (`<main>`, `<nav>`, `<header>`, `<h1>`–`<h6>`, `<button>`).
- Every form input has an accessible, associated `<label>` via `htmlFor`.
- Dialogs implement focus trapping and close cleanly via the `Escape` key.
- Icon-only buttons contain descriptive `aria-label` attributes.
- Text contrast meets minimum 4.5:1 ratio (3.0:1 for large text).
- Color is never used as the sole indicator of status (icons and text accompany color states).

### 6.6 Problem Statement Alignment
- Demonstrates an intelligent, dynamic event planning assistant tailored for celebrations (weddings, birthdays, community events).
- Delivers context-grounded decision making based on the live state of the user's event.
- Exhibits practical real-world utility rather than synthetic novelty.
- Provides tangible cognitive relief to hosts and event organizers.
- Directly aligns with the hackathon problem statement and theme.

---

## 7. FINAL SUBMISSION CHECKLIST

Before authorizing a manual commit and push, verify every item:

```text
[ ] Selected AI platform installed and configured
[ ] Git configured locally
[ ] GitHub public repository verified
[ ] Single branch ('main') verified
[ ] Total repository size < 10 MB verified
[ ] Complete source code present
[ ] Production-ready README.md present
[ ] Zero secrets / credentials in code or history
[ ] No committed .env or .env.local files
[ ] Code Quality checks verified
[ ] Security & RLS checks verified
[ ] Efficiency & Free-tier bounds verified
[ ] Testing & Core user journeys verified
[ ] Accessibility (WCAG 2.1 AA) verified
[ ] Problem Statement Alignment verified
[ ] Lint passes (0 errors, 0 warnings)
[ ] TypeScript typecheck passes (0 errors)
[ ] Production build succeeds (npm run build)
[ ] Critical user flows verified manually / via tests
[ ] Mobile responsive layout verified (no horizontal scroll)
[ ] AI fallback behavior verified (works when AI offline)
[ ] UI Empty, Loading, and Error states verified
[ ] Legal pages (/privacy, /terms) present
```

**Rule:** If any single item fails or remains unverified:  
**STATUS = NOT READY**  
Do not submit until the blocker is resolved.

---

## 8. SUBMISSION STATUS REPORT FORMAT

Whenever a pre-submission audit is conducted, the agent must output this exact status report:

```text
==================================================
HACKATHON SUBMISSION AUDIT REPORT
==================================================

Code Quality:                 [PASS / FAIL]
Security:                     [PASS / FAIL]
Efficiency:                   [PASS / FAIL]
Testing:                      [PASS / FAIL]
Accessibility:                [PASS / FAIL]
Problem Statement Alignment:  [PASS / FAIL]

Repository Size (< 10 MB):    [PASS / FAIL]
Public Repository:            [PASS / FAIL]
Single Branch ('main'):       [PASS / FAIL]
README Completeness:          [PASS / FAIL]
Zero Secrets Check:           [PASS / FAIL]
ESLint Status:                [PASS / FAIL]
TypeScript Typecheck:         [PASS / FAIL]
Test Suite Status:            [PASS / FAIL]
Production Build:             [PASS / FAIL]

--------------------------------------------------
FINAL STATUS: [READY / NOT READY]
--------------------------------------------------
```

---

## 9. README.MD REQUIREMENTS

The repository root must contain a comprehensive `README.md` that includes:
- **Project Name & Tagline**: UtsavAI — Intelligent Celebration & Event Planner.
- **Hackathon Alignment**: Vertical/category, problem statement, and executive summary.
- **Proposed Solution**: How UtsavAI solves event planning chaos through AI co-piloting.
- **Key Features**: Event management, budget tracking, task dependencies, vendor/guest management, AI planning engine, context-aware assistant, run-of-show schedule, and PDF/ICS export.
- **AI Architecture & Decision Logic**: Explaining server-side Gemini integration, deterministic calculation boundaries, and context minimization.
- **Technology Stack**: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL, Auth, RLS), Google Gemini API.
- **System Architecture**: High-level component and data flow diagrams.
- **Local Setup & Installation**: Step-by-step instructions (`npm install`, environment variable configuration, `npm run dev`).
- **Environment Variables Reference**: Complete documentation of required keys (without real secrets).
- **Assumptions & Known Boundaries**: Explicit scope limitations.
- **Verification & Testing Instructions**: Commands to run linting, typechecking, tests, and builds.

---

## 10. AI DEVELOPMENT RULES

1. **AI is strictly an Advisory Co-Pilot**: AI proposes, drafts, and explains; deterministic application code computes and validates.
2. **Deterministic Financials**: Currency arithmetic, budget utilization percentages, and threshold risk flags (80%, 90%) must be computed in deterministic TypeScript code (`lib/calculations/`). AI must never perform authoritative financial calculations.
3. **Structured Machine-Readable Output**: AI plan generation must return strictly valid JSON conforming to defined schemas.
4. **Two-Tier Validation**:
   - *Tier 1*: Runtime schema validation (Zod) enforcing types, bounds, and enums.
   - *Tier 2*: Business validation checking chronological consistency and budget normalization.
5. **No Direct Database Mutations**: AI cannot directly modify PostgreSQL tables. Output is staged as a draft; database writes occur only after explicit user review and confirmation.
6. **Graceful Degradation**: 100% of core planning functionality (tasks, budget, vendors, guests, schedule, export) must work manually when the AI service is offline or rate-limited.

---

## 11. SECURITY & DATA PRIVACY RULES

1. **Zero Secret Exposure**: Never hardcode API keys, database credentials, or tokens. Access keys exclusively via server-side environment variables.
2. **Server-Side API Key Boundary**: The `GEMINI_API_KEY` and Supabase `service_role` key must remain server-only. Never prefix them with `NEXT_PUBLIC_`.
3. **Untrusted Client Identity**: Never trust client-supplied `user_id` values. Always resolve the user identity server-side from the verified Supabase Auth JWT.
4. **Three-Step Authorization Check**: Every protected endpoint must verify: (1) Valid session, (2) Resource existence, (3) Resource ownership (`user_id === auth.uid()`). Return `404 Not Found` on mismatch to prevent existence leakage.
5. **Data Minimization & PII Stripping**: Personal guest contact info (emails, phone numbers) must never be sent to the AI provider. Only aggregate headcounts are transmitted.
6. **Prompt Injection Defense**: Structural isolation of user input using clear boundary tags; prioritize system instructions over user-provided text.

---

## 12. UI/UX DESIGN SYSTEM RULES

The visual identity must present as a real, authentic, commercial-grade product conforming to `07-UI-UX-SPECIFICATION.md`:

### Prohibited Patterns:
- **No Purple Gradients**: Avoid stereotypical AI purple/violet gradient styling.
- **No Omnipresent Pill Buttons**: Use standard, accessible shadcn/ui button geometries.
- **No Fake Reviews or Testimonials**: Zero fabricated customer quotes or fake photos.
- **No Fake Metrics**: Zero "10,000+ Events Planned" marketing claims.
- **No Emoji Navigation Icons**: Use clean Lucide React SVG icons exclusively.
- **No AI-Slop Imagery or Copy**: No generic, synthetic stock illustrations or vague buzzword copy.
- **No Laggy Animations**: Avoid cursor-follow effects, scroll-jacking, or gratuitous motion.
- **No "Made with AI" Badges**: Present UtsavAI as a professional event management suite.

### Mandatory UX Standards:
- Complete state coverage: Every view must have clear **Loading**, **Empty**, **Data**, and **Error-with-retry** states.
- High contrast, legible typography using approved Tailwind design tokens.

---

## 13. DOCUMENTATION CONSISTENCY

1. All documentation must reside within the `docs/` folder.
2. If implementation changes affect database schemas, API routes, security policies, or UI behavior, the corresponding specification document must be updated synchronously.
3. Code and documentation must never drift apart.
4. The documentation suite represents the formal specification; code is its realization.

---

## 14. ZERO-COST DEVELOPMENT PRINCIPLE

To ensure free-tier viability and reproducibility:
- Rely strictly on free and open-source packages and runtime tiers:
  - Vercel Free Hobby Tier (Hosting & Edge Functions)
  - Supabase Free Tier (PostgreSQL, Auth, RLS)
  - Google Gemini API Free Tier
- **Prohibited Infrastructure**:
  - No paid third-party APIs (e.g., Twilio SMS, paid email delivery services).
  - No payment gateway integrations (Stripe, Razorpay) in the MVP.
  - No Redis, Memcached, Elasticsearch, or standalone caching clusters.
  - No container orchestration (Kubernetes, Docker Swarm) in production.
  - No microservices or multi-server distributed architectures.

---

## 15. DEVELOPMENT WORKFLOW PRINCIPLE

Before making any modification to the codebase:
1. **Read**: Inspect the relevant specification in `docs/`.
2. **Inspect**: Review the existing code structure and active imports.
3. **Scope**: Identify the exact minimal change required to satisfy the requirement.
4. **Implement**: Make the smallest appropriate, typed change.
5. **Verify**: Test the change locally; check for side effects and regressions.
6. **Audit**: Verify linting, typechecking, and build commands succeed.
7. **Document**: Update specifications if architectural decisions were refined.

*Never perform sweeping refactors or replace working code without an explicit documented requirement.*

---

## 16. DEFINITION OF DONE (DOD)

A feature or task is considered complete **ONLY** when:
- [ ] Requirement is fully satisfied in accordance with source specifications.
- [ ] UI is responsive across desktop, tablet, and mobile viewports.
- [ ] Server-side authentication and ownership authorization are enforced.
- [ ] Database interactions respect constraints and Row Level Security.
- [ ] Loading, empty, and error states are implemented and tested.
- [ ] No regression occurs in existing workflows.
- [ ] Automated tests pass where applicable.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npx tsc --noEmit` passes with 0 type errors.
- [ ] `npm run build` succeeds completely.
- [ ] Relevant documentation in `docs/` is updated and synchronized.

---

## 17. FINAL PRINCIPLE

Optimize UtsavAI relentlessly for the six hackathon evaluation pillars:

$$\text{Hackathon Success} = \text{Code Quality} + \text{Security} + \text{Efficiency} + \text{Testing} + \text{Accessibility} + \text{Problem Alignment}$$

Deliver a rock-solid, demonstrable, and secure product that works flawlessly.

Keep the architecture clean.  
Keep the AI grounded and verified.  
Protect user data at all costs.  
Test rigorously before submission.  

**Remember:** Git commit and push operations are strictly manual. The project owner executes all Git actions.

