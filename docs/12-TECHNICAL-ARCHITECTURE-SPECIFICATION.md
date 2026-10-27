# UtsavAI - Technical Architecture & Implementation Specification

**Document name:** 12-TECHNICAL-ARCHITECTURE-SPECIFICATION.md
**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Source documents:** `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`, `05-API-SPECIFICATION.md`, `06-AI-SPECIFICATION.md`, `07-UI-UX-SPECIFICATION.md`, `08-SECURITY-AUTHORIZATION-SPECIFICATION.md`, `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md`, `10-DEPLOYMENT-DEVOPS-SPECIFICATION.md`, `11-API-IMPLEMENTATION-SPECIFICATION.md`
**Purpose:** Define the technical blueprint for implementing UtsavAI. This document governs architecture style, layer responsibilities, module boundaries, data flow, state management, and the rules that govern every implementation decision.
**Intended audience:** Backend developers, frontend developers, QA engineers, DevOps.

---

## DOCUMENT SCOPE

This document defines how UtsavAI is built, not what it does.

It does NOT contain implementation code.

It does NOT modify application source files.

It does NOT introduce features not defined in source documents 01–11.

Unresolved decisions are marked explicitly as `OPEN DECISION`.

---

## 1. ARCHITECTURE OBJECTIVE

UtsavAI requires an architecture that is:

- **Production-capable** — handles real authentication, real data, real AI
- **Simple** — maintainable by a student or small team
- **Free-tier compatible** — deployable on Vercel + Supabase free tiers
- **Progressive** — existing frontend prototype can be migrated without a full rewrite

### Architecture Style: Modular Monolith

All application logic lives in a single Next.js application. Concerns are separated into well-defined modules. There are no separate backend services.

### What this architecture does NOT use

| Excluded | Reason |
|---|---|
| Microservices | Unnecessary complexity for this scale |
| Kubernetes | No container orchestration needed |
| Redis | Free-tier incompatible; no distributed caching needed |
| Elasticsearch | Not required for MVP search |
| Dedicated backend server | Next.js API routes and Server Actions handle backend |
| Message queues | No async job processing in MVP |
| GraphQL | REST is sufficient; simpler to implement and test |
| WebSockets | In-app notifications via polling or Supabase Realtime (OPEN DECISION) |

---

## 2. HIGH-LEVEL ARCHITECTURE

```
User Browser
     ↓
Next.js Application (Vercel)
     ↓
┌─────────────────────────────────────────┐
│  Presentation Layer                     │
│  (React Pages + Client Components)      │
├─────────────────────────────────────────┤
│  Application / Server Layer             │
│  (Next.js API Routes + Server Actions)  │
├─────────────────────────────────────────┤
│  Domain Modules                         │
│  (Event, Task, Budget, Vendor, Guest,   │
│   Timeline, Schedule, Notification, AI) │
├─────────────────────────────────────────┤
│  Data Access Layer                      │
│  (Supabase Client + Query Helpers)      │
├─────────────────────────────────────────┤
│  Supabase PostgreSQL                    │
│  (Database + Row Level Security)        │
└─────────────────────────────────────────┘

AI Path:
Next.js Server Layer
     ↓
AI Service Module
     ↓
Context Builder
     ↓
Prompt Builder
     ↓
Gemini API (server-to-server, key never exposed to browser)

Authentication Path:
Next.js
     ↓
Supabase Auth
     ↓
Session (JWT managed by Supabase)

Storage Path (if used):
Next.js
     ↓
Supabase Storage
     ↓
Scoped to authenticated user
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Presentation Layer** | Render UI, handle user interaction, display data from server, manage local UI state |
| **Application / Server Layer** | Handle HTTP requests, authenticate, authorize, validate input, coordinate domain modules, return responses |
| **Domain Modules** | Encapsulate business logic for each feature domain (events, tasks, budget, etc.) |
| **Data Access Layer** | Abstract Supabase queries, enforce ownership, provide typed query helpers |
| **Supabase PostgreSQL** | Persist data, enforce foreign keys, apply Row Level Security policies |
| **AI Service Module** | Build context, construct prompts, call Gemini, validate and return structured output |
| **Supabase Auth** | Issue and verify JWTs, manage sessions, handle registration and login |

---

## 3. FRONTEND ARCHITECTURE

### Technology Stack

| Technology | Role |
|---|---|
| Next.js (App Router) | Application framework — routing, rendering, API routes |
| React | UI component model |
| TypeScript | Type safety across all layers |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible, composable UI component library |
| Lucide React | Icon library |
| Recharts | Data visualisation (budget charts, task stats) |
| FullCalendar or equivalent | Timeline / calendar views |
| Client-side PDF/ICS library | Export (OPEN DECISION on library) |

### Pages and Routes

#### Public Routes (no authentication required)

| Path | Page |
|---|---|
| `/` | Home / Landing |
| `/about` | About UtsavAI |
| `/features` | Feature overview |
| `/faq` | Frequently asked questions |
| `/login` | User login |
| `/register` | User registration |
| `/privacy` | Privacy policy |
| `/terms` | Terms and conditions |

#### Protected Application Routes (authentication required)

| Path | Page |
|---|---|
| `/dashboard` | Dashboard — event overview, stats, upcoming deadlines |
| `/events/new` | Create new event |
| `/events/[id]` | Event overview |
| `/events/[id]/edit` | Edit event details |
| `/events/[id]/budget` | Budget overview |
| `/events/[id]/expenses` | Expense management |
| `/events/[id]/tasks` | Task management |
| `/events/[id]/timeline` | Timeline milestones |
| `/events/[id]/vendors` | Vendor management |
| `/events/[id]/guests` | Guest management |
| `/events/[id]/schedule` | Event-day schedule |
| `/events/[id]/assistant` | AI planning assistant |
| `/events/[id]/notifications` | Event notifications |
| `/events/[id]/settings` | Event settings |
| `/events/[id]/export` | Export event plan |

Unauthenticated users attempting to access a protected route must be redirected to `/login`.

After login, users are redirected to `/dashboard` or the originally requested route.

---

## 4. RECOMMENDED FRONTEND STRUCTURE

The following structure is the recommended target. If the existing repository already uses a consistent structure, the implementation adapts to it rather than forcing a rewrite.

```
frontend/
├── app/
│   ├── (marketing)/           # Public marketing pages — layout isolated from app shell
│   │   ├── page.tsx            # Home
│   │   ├── about/page.tsx
│   │   ├── features/page.tsx
│   │   └── faq/page.tsx
│   │
│   ├── (auth)/                # Authentication pages — no dashboard chrome
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/           # Protected application routes — dashboard chrome
│   │   ├── layout.tsx          # Sidebar + header shell, auth guard
│   │   ├── dashboard/page.tsx
│   │   └── events/
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx        # Event overview
│   │           ├── edit/page.tsx
│   │           ├── budget/page.tsx
│   │           ├── expenses/page.tsx
│   │           ├── tasks/page.tsx
│   │           ├── timeline/page.tsx
│   │           ├── vendors/page.tsx
│   │           ├── guests/page.tsx
│   │           ├── schedule/page.tsx
│   │           ├── assistant/page.tsx
│   │           ├── notifications/page.tsx
│   │           ├── settings/page.tsx
│   │           └── export/page.tsx
│   │
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   │
│   └── api/                   # Next.js API route handlers
│       ├── events/
│       │   └── [...]/route.ts
│       ├── tasks/
│       ├── vendors/
│       ├── guests/
│       ├── expenses/
│       ├── timeline/
│       ├── schedule/
│       ├── dependencies/
│       ├── notifications/
│       ├── dashboard/
│       ├── ai/
│       └── export/
│
├── components/
│   ├── ui/                    # shadcn/ui base components (Button, Dialog, etc.)
│   ├── layout/                # Sidebar, Header, Navigation, EventSelector
│   ├── dashboard/             # DashboardCard, StatsGrid, UpcomingEvents
│   ├── events/                # EventCard, EventForm, EventDeleteDialog
│   ├── budget/                # BudgetSummary, BudgetProgress, BudgetChart
│   ├── expenses/              # ExpenseTable, ExpenseForm, ExpenseCard
│   ├── tasks/                 # TaskCard, TaskForm, TaskTable, DependencyDialog
│   ├── timeline/              # TimelineItem, MilestoneForm, TimelineView
│   ├── vendors/               # VendorCard, VendorTable, VendorForm
│   ├── guests/                # GuestTable, GuestCard, GuestForm, RSVPBadge
│   ├── schedule/              # ScheduleItem, ScheduleForm, ScheduleTimeline
│   ├── ai/                    # AIChat, AIMessage, AIPlanPreview, AIGenerateButton
│   ├── notifications/         # NotificationItem, NotificationList
│   └── shared/                # EmptyState, LoadingState, ErrorState, ConfirmDialog
│
├── lib/
│   ├── supabase/              # Supabase client helpers (browser client, server client)
│   ├── api/                   # Frontend API call helpers (typed fetch wrappers)
│   ├── ai/                    # AI service: context-builder, prompt-builder, validators
│   ├── validation/            # Zod/Yup schemas for request/response validation
│   ├── calculations/          # Deterministic business logic — budget, stats, risk
│   └── utils/                 # Date helpers, formatting, type guards
│
├── hooks/                     # Reusable React hooks
│   ├── useEvents.ts
│   ├── useTasks.ts
│   ├── useBudget.ts
│   ├── useVendors.ts
│   ├── useGuests.ts
│   ├── useNotifications.ts
│   └── useAIChat.ts
│
├── types/                     # Shared TypeScript interfaces and types
│   ├── events.ts
│   ├── tasks.ts
│   ├── budget.ts
│   ├── vendors.ts
│   ├── guests.ts
│   ├── ai.ts
│   └── api.ts
│
├── public/                    # Static assets (images, icons)
├── .env.local                 # Local environment variables (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Adaptation rule:** If the existing project already uses a stable directory structure, preserve it. Add missing folders. Do not rename working directories without a documented reason.

---

## 5. ROUTING ARCHITECTURE

### App Router

All routing uses the Next.js App Router (`app/` directory). Pages Router (`pages/`) is not used.

### Route Groups

Next.js route groups (parenthesised folders) isolate layouts without affecting the URL:

| Group | Layout | Purpose |
|---|---|---|
| `(marketing)` | Marketing layout — no sidebar | Public pages |
| `(auth)` | Minimal layout — no sidebar | Login, register |
| `(dashboard)` | App shell — sidebar + header | All authenticated application pages |

### Auth Guard

The `(dashboard)` layout performs an authentication check server-side. If no valid session exists, the user is redirected to `/login` before any protected content renders.

The client must not be relied upon as the sole auth guard. The server always verifies the session.

### Dynamic Event Routes

All event-scoped pages follow the pattern:

```
/events/[id]/[feature]
```

The `[id]` segment is the event UUID. Every page in this subtree verifies:

1. User is authenticated.
2. The event with this ID exists.
3. The event belongs to the authenticated user.

If verification fails at step 2 or 3, the page renders a 404 state — it does not render a 403 or expose that the event exists.

### API Routes

All API routes live under `app/api/`. Route handlers use Next.js `route.ts` files. See `11-API-IMPLEMENTATION-SPECIFICATION.md` for the full endpoint contract.

---

## 6. SERVER COMPONENTS VS CLIENT COMPONENTS

### Default: Server Components

All Next.js App Router components are Server Components by default. Prefer Server Components unless the use case explicitly requires browser capabilities.

**Use Server Components for:**

- Initial page data loading
- Rendering data from the database
- SEO-relevant public pages
- Layouts that wrap authenticated content
- Secure operations that must not run in the browser

### Client Components (`'use client'`)

Add `'use client'` only when the component requires:

- `useState`, `useEffect`, or other React hooks
- Browser event listeners (`onClick`, `onChange`, `onSubmit`)
- Interactive forms with real-time validation
- Dialogs, drawers, modals
- Drag-and-drop interactions
- Charts (Recharts renders client-side)
- Calendar interaction
- AI chat (streaming or progressive rendering)
- Zustand store access
- Browser APIs (`localStorage`, `window`, etc.)

**Anti-patterns to avoid:**

| Anti-pattern | Correct approach |
|---|---|
| Mark an entire page `'use client'` for one interactive element | Extract the interactive element into a Client Component; keep the page as Server Component |
| Fetch data inside a Client Component with `useEffect` | Fetch in a Server Component; pass data as props |
| Put database queries inside a Client Component | Use Server Components, API routes, or Server Actions |

---

## 7. STATE MANAGEMENT

State is categorised into three distinct types. Each type has a different persistence contract.

### 7.1 Server State (Source of Truth: Database)

Server state is data that lives in Supabase PostgreSQL. The database is always the authoritative source.

Examples:

- Events, event preferences
- Tasks, task dependencies
- Budget (derived from event + expenses)
- Expenses
- Vendors
- Guests
- Timeline milestones
- Event-day schedule
- Notifications

**Management:** Server state is fetched via API routes or Server Components. Client-side state (Zustand or React state) holds a representation of server state. After any mutation, the client re-fetches or optimistically updates, then confirms with the server.

**Rule:** If the client's cached copy of server state contradicts the database after a round-trip, the database wins.

### 7.2 UI State (Ephemeral)

UI state is temporary and does not need to persist across page refreshes.

Examples:

- Dialog/drawer open or closed
- Active tab selection
- Active filter or sort selection
- Form field values (pre-submit)
- Loading indicator state
- Expanded/collapsed sections

**Management:** `useState` or `useReducer` in the relevant component. Zustand may be used for UI state that needs to cross component tree boundaries without prop-drilling (e.g., sidebar collapsed state, event selector).

### 7.3 AI State (Session-Scoped)

AI state is scoped to a user session on the assistant page.

Examples:

- Current chat message list
- Generation in-progress indicator
- Error from last generation attempt
- Last generated plan (for review before acceptance)
- Retry availability

**Management:** Component-level state (`useState`) or a scoped Zustand slice. AI state does not survive page refresh unless the conversation is persisted server-side (OPEN DECISION — see `11-API-IMPLEMENTATION-SPECIFICATION.md` OD-06).

### 7.4 Zustand Usage Rules

Zustand is present in the existing frontend. Its use must be bounded:

| Zustand MAY manage | Zustand must NOT manage |
|---|---|
| UI state crossing multiple components | Authoritative database records |
| Sidebar open/close, theme | Budget totals (always derived server-side) |
| Current event selection (session) | Guest counts (always derived server-side) |
| AI chat session state | Vendor status decisions |
| Notification unread count (cached) | Authorization state |

**Zustand is a cache and UI coordinator, not a database.**

---

## 8. DATA FLOW

### Standard CRUD Flow

```
User interaction in UI
     ↓
Client-side validation (immediate feedback only)
     ↓
API call to Next.js API Route / Server Action
     ↓
Server: Authenticate (Supabase Auth session)
     ↓
Server: Authorize (ownership check)
     ↓
Server: Validate input (authoritative validation)
     ↓
Server: Execute business logic (domain module)
     ↓
Server: Data Access Layer (Supabase query)
     ↓
Supabase PostgreSQL
     ↓
Response to client
     ↓
UI updates state from response
```

### AI Plan Generation Flow

```
User triggers "Generate Plan" in UI
     ↓
POST /api/ai/generate-plan { event_id }
     ↓
Server: Authenticate
     ↓
Server: Verify event ownership
     ↓
Context Builder: Load minimal event context from database
     ↓
Prompt Builder: Construct system instructions + event context
     ↓
Gemini API (server-to-server)
     ↓
Structured JSON output
     ↓
Schema Validation (types, enums, required fields)
     ↓
Business Validation (dates, monetary values, ordering)
     ↓
Return validated plan to client
     ↓
UI displays plan for user review
```

### AI Plan Acceptance Flow

```
User reviews generated plan
     ↓
User accepts (or edits then accepts)
     ↓
POST /api/ai/plans/:planId/accept
     ↓
Server: Authenticate + verify ownership
     ↓
Server: Re-validate all submitted items
     ↓
Server: Insert validated records into database (tasks, milestones, schedule)
     ↓
Server: Create "Plan accepted" notification
     ↓
Response: { tasksCreated, milestonesCreated, scheduleItemsCreated }
     ↓
UI refreshes affected views
```

### AI Chat Flow

```
User sends message in AI assistant
     ↓
POST /api/ai/chat { event_id, message }
     ↓
Server: Authenticate + verify event ownership
     ↓
Context Builder: Load relevant event context based on query
     ↓
Load bounded conversation history (if persisted)
     ↓
Prompt Builder: system instructions + context + history + message
     ↓
Gemini API
     ↓
Response validation
     ↓
Optionally persist to ai_messages
     ↓
Return response text to client
     ↓
UI appends message to chat view
```

---

## 9. DOMAIN MODULES

Domain modules encapsulate all business logic for a single feature domain. They are server-side only (not imported by Client Components).

Each domain module is responsible for its own:
- Input/output types
- Business rules
- Database queries (via the Data Access Layer)
- Validation

### 9.1 Event Module

**Location:** `lib/modules/events/` or `lib/services/events.ts`

**Responsible for:**
- Creating, reading, updating, deleting events
- Resolving event ownership
- Resolving event status transitions
- Loading event details including preferences
- Cascade deletion coordination

**Key functions (conceptual):**

```
createEvent(userId, data)
getEvent(userId, eventId)
updateEvent(userId, eventId, data)
deleteEvent(userId, eventId)
listEvents(userId, pagination)
verifyEventOwnership(userId, eventId) → boolean
```

---

### 9.2 Budget Module

**Location:** `lib/modules/budget/` or `lib/calculations/budget.ts`

**Responsible for:**
- Computing total expenses from expense records
- Computing remaining budget
- Computing utilization percentage
- Returning budget status (normal / warning / critical / over_budget)
- Computing by-category breakdown

**Budget thresholds (deterministic, application code, not AI):**

```
< 80%  → normal
≥ 80%  → warning
≥ 90%  → critical
> 100% → over_budget
```

**Key functions (conceptual):**

```
calculateBudgetUtilization(totalBudget, totalExpenses) → percentage
calculateRemainingBudget(totalBudget, totalExpenses) → amount
detectBudgetRisk(utilization) → 'normal' | 'warning' | 'critical' | 'over_budget'
getBudgetOverview(userId, eventId) → BudgetOverview
getExpensesByCategory(userId, eventId) → CategoryBreakdown[]
```

---

### 9.3 Task Module

**Location:** `lib/modules/tasks/`

**Responsible for:**
- Task CRUD
- Task status transitions
- Task priority management
- Task due date validation
- Task dependency creation and validation
- Circular dependency detection
- Overdue task identification

**Key functions (conceptual):**

```
createTask(userId, eventId, data)
updateTask(userId, taskId, data)
deleteTask(userId, taskId)
listTasks(userId, eventId, filters, pagination)
createDependency(userId, taskId, dependsOnTaskId)
deleteDependency(userId, dependencyId)
validateNoCycle(eventId, taskId, dependsOnTaskId) → boolean
getOverdueTasks(userId, eventId) → Task[]
```

---

### 9.4 Timeline Module

**Location:** `lib/modules/timeline/`

**Responsible for:**
- Milestone CRUD
- Milestone date validation relative to event date
- Milestone status management
- Upcoming milestone detection

**Key functions (conceptual):**

```
createMilestone(userId, eventId, data)
updateMilestone(userId, milestoneId, data)
deleteMilestone(userId, milestoneId)
listMilestones(userId, eventId, filters)
getUpcomingMilestones(userId, eventId, days) → Milestone[]
detectTimelineRisk(eventId) → RiskIndicator[]
```

---

### 9.5 Vendor Module

**Location:** `lib/modules/vendors/`

**Responsible for:**
- Vendor CRUD
- Vendor status transitions
- Vendor cost tracking
- Critical vendor (venue, catering) unbooked detection

**Key functions (conceptual):**

```
createVendor(userId, eventId, data)
updateVendor(userId, vendorId, data)
deleteVendor(userId, vendorId)
listVendors(userId, eventId, filters, pagination)
detectVendorRisk(userId, eventId) → RiskIndicator[]
```

---

### 9.6 Guest Module

**Location:** `lib/modules/guests/`

**Responsible for:**
- Guest CRUD
- RSVP status management
- Guest group management
- Dietary requirements tracking
- Guest statistics (total, accepted, pending, declined)

**Key functions (conceptual):**

```
createGuest(userId, eventId, data)
updateGuest(userId, guestId, data)
deleteGuest(userId, guestId)
listGuests(userId, eventId, filters, pagination)
calculateGuestStats(userId, eventId) → GuestStats
getGuestSummaryForAI(userId, eventId) → GuestSummary  // excludes PII
```

---

### 9.7 Schedule Module

**Location:** `lib/modules/schedule/`

**Responsible for:**
- Event-day schedule item CRUD
- Time slot ordering
- Chronological validation

**Key functions (conceptual):**

```
createScheduleItem(userId, eventId, data)
updateScheduleItem(userId, scheduleId, data)
deleteScheduleItem(userId, scheduleId)
listScheduleItems(userId, eventId)
```

---

### 9.8 Notification Module

**Location:** `lib/modules/notifications/`

**Responsible for:**
- Creating notifications (triggered by other modules)
- Listing notifications for a user
- Marking notifications as read
- Risk-based notification generation (budget warning, overdue tasks, unbooked vendors)

**Key functions (conceptual):**

```
createNotification(userId, eventId, type, title, message)
listNotifications(userId, filters, pagination)
markNotificationRead(userId, notificationId)
markAllNotificationsRead(userId)
generateRiskNotifications(userId, eventId)  // called after plan changes
```

---

### 9.9 AI Module

**Location:** `lib/ai/`

**Responsible for:**
- Building minimal event context
- Constructing system instructions and prompts
- Calling the Gemini API (server-side only)
- Parsing structured AI output
- Schema validation of AI output
- Business validation of AI output
- Managing AI chat conversation state
- Handling AI provider errors and retries

This module is the only module permitted to call Gemini. No other module or component calls Gemini directly.

See Section 15 for the detailed AI service architecture.

---

### 9.10 Export Module

**Location:** `lib/modules/export/`

**Responsible for:**
- Generating PDF event plans (client-side preferred)
- Generating ICS calendar files (client-side preferred)
- Verifying event ownership before export

If server-side export is implemented:
- Collecting all event data server-side
- Rendering to PDF or ICS format
- Streaming binary response

**OPEN DECISION:** Client-side vs server-side export library and implementation. See `11-API-IMPLEMENTATION-SPECIFICATION.md` OD-10.

---

## 10. BUSINESS LOGIC

Business logic must not be embedded inside React components, API route handlers, or database queries. It must live in dedicated domain module functions.

### Centralised Business Logic Functions

```
// Budget
calculateBudgetUtilization(totalBudget: number, totalExpenses: number): number
calculateRemainingBudget(totalBudget: number, totalExpenses: number): number
detectBudgetRisk(utilization: number): 'normal' | 'warning' | 'critical' | 'over_budget'

// Guest
calculateGuestStats(guests: Guest[]): GuestStats
// → { total, accepted, pending, declined, plusOnes }

// Risk
detectTimelineRisk(event: Event, milestones: Milestone[]): RiskIndicator[]
detectVendorRisk(event: Event, vendors: Vendor[]): RiskIndicator[]
detectBudgetRiskFromEvent(event: Event, expenses: Expense[]): RiskIndicator[]

// Task
isTaskOverdue(task: Task, today: Date): boolean
getOverdueTasks(tasks: Task[], today: Date): Task[]
detectCircularDependency(taskId: string, dependsOnTaskId: string, existingDeps: Dependency[]): boolean

// Timeline
validateMilestoneDate(milestoneDate: Date, eventDate: Date): boolean
getUpcomingMilestones(milestones: Milestone[], daysAhead: number): Milestone[]

// Date utilities
getDaysRemaining(eventDate: Date, today: Date): number
```

### Rules

1. These functions must be pure where possible — testable in isolation with no database calls.
2. They must be called by domain module functions, not directly from React components.
3. They must never call Gemini.
4. Their results must not be overridden by AI output.

---

## 11. DETERMINISTIC LOGIC

The following computations are ALWAYS performed by deterministic application code. AI may use the results to explain recommendations, but AI must never be the authoritative source.

| Computation | Authority |
|---|---|
| `total_budget - total_expenses` | Application code |
| Budget utilization percentage | Application code |
| Budget risk status (normal/warning/critical/over_budget) | Application code |
| Guest count (total, accepted, pending, declined) | Application code |
| Task overdue detection | Application code |
| Days remaining to event | Application code |
| Milestone upcoming detection | Application code |
| Vendor booking status counts | Application code |
| Task dependency cycle detection | Application code |
| Authorization decision (owns event?) | Application code + Supabase RLS |
| Status enum validation | Application code |
| Input validation | Application code |

**AI is for recommendations and natural-language conversation only.**

---

## 12. DATABASE ACCESS

### Supabase Client Types

| Client | Where used | Capabilities |
|---|---|---|
| Browser (anon key) | Client Components | RLS-restricted public reads; auth operations |
| Server (service role or session-scoped) | API routes, Server Components, Server Actions | Privileged server-side operations |

**The service-role key must never be exposed to the browser or included in any client-side bundle.**

### Access Rules

1. Every server-side query must include an ownership condition — do not rely solely on RLS.
2. Application-layer ownership verification is the primary security boundary. RLS is defense-in-depth.
3. Database queries must not be written directly inside React components.
4. Repeated query patterns must be abstracted into Data Access Layer helpers.
5. Avoid N+1 queries. Batch related reads.

### Data Access Layer

The Data Access Layer (`lib/supabase/`) provides typed helper functions for common queries:

```
getEventById(client, eventId, userId)
getTasksByEventId(client, eventId, filters)
getGuestsByEventId(client, eventId, filters)
getExpensesByEventId(client, eventId, filters)
// etc.
```

These helpers always include an ownership filter (`user_id = userId` or equivalent join).

---

## 13. AUTHENTICATION ARCHITECTURE

### Provider: Supabase Auth

UtsavAI uses Supabase Auth for all authentication. No custom authentication system is implemented.

### Registration Flow

```
User fills register form
     ↓
Client validates form (email format, password strength)
     ↓
POST to Supabase Auth (email + password)
     ↓
Supabase creates user record
     ↓
Supabase sends verification email (OPEN DECISION: required or optional for MVP)
     ↓
User is signed in / redirected to dashboard
```

### Login Flow

```
User fills login form
     ↓
POST to Supabase Auth (email + password)
     ↓
Supabase validates credentials
     ↓
Supabase issues JWT session
     ↓
Client stores session (Supabase manages cookies/localStorage)
     ↓
User redirected to dashboard
```

### Session Handling

- Supabase manages JWT issuance, expiry, and refresh.
- The Next.js server reads the session from cookies or headers using `@supabase/ssr`.
- Protected routes check for a valid session server-side before rendering.
- A 401 response from any API route triggers a client-side redirect to `/login`.

### Logout Flow

```
User clicks logout
     ↓
Supabase Auth signOut()
     ↓
Session invalidated
     ↓
Client redirected to /login
```

### Auth State in the Frontend

- Auth state is read server-side in the `(dashboard)` layout.
- Client Components may access auth state via Supabase's React context utilities.
- Auth state must not be stored in Zustand as the authoritative session source.

---

## 14. AUTHORIZATION ARCHITECTURE

### Principle: Server-Side Ownership

Every protected operation verifies that the authenticated user owns the requested resource. This is enforced at the API / Server Action layer, not in the UI.

### Three-Step Authorization (from `11-API-IMPLEMENTATION-SPECIFICATION.md`)

```
Step 1: Authenticate
  → Resolve user from Supabase Auth session
  → No valid session → 401

Step 2: Resolve Resource
  → Look up resource by ID in database
  → Not found → 404

Step 3: Verify Ownership
  → resource.user_id === authenticated user ID
  (for child resources: resolve parent event, then verify event.user_id)
  → Mismatch → 404 (not 403, to prevent leaking existence)
```

### Child Resource Authorization

```
Guest request → guest.event_id → event.user_id === authenticatedUserId
Task request → task.event_id → event.user_id === authenticatedUserId
Expense request → expense.event_id → event.user_id === authenticatedUserId
```

### Frontend Authorization

The frontend may hide controls the user cannot use (e.g., hiding an edit button on another user's event if they somehow navigated there). This is a UX courtesy only.

**The backend is always the authority.**

Frontend auth gates must not be the only protection.

### Row Level Security

Supabase RLS policies provide defense-in-depth. If an application-layer check is accidentally bypassed, RLS prevents unauthorized data access at the database level.

RLS must remain enabled on all tables. It must not be disabled to simplify queries.

---

## 15. AI SERVICE ARCHITECTURE

The AI service is an isolated server-side module. No UI component calls Gemini directly.

### Conceptual Structure

```
lib/ai/
├── client.ts             # Gemini API client — reads GEMINI_API_KEY from env
├── context-builder.ts    # Builds minimal event context from database
├── prompt-builder.ts     # Constructs system instructions + context + user input
├── plan-generator.ts     # Orchestrates generate-plan flow
├── chat-service.ts       # Orchestrates chat flow
├── schemas.ts            # Zod/Yup schemas for AI output validation
└── validators.ts         # Business validation for AI output
```

### AI Service Contract

The AI module:

1. **Accepts validated input** — receives event ID and authenticated user ID, not raw AI prompts from the client.
2. **Builds minimal context** — loads only what is needed from the database via the Context Builder.
3. **Constructs system instructions** — defines AI role, constraints, and output format.
4. **Calls Gemini** — server-to-server only; `GEMINI_API_KEY` is never sent to the browser.
5. **Parses structured output** — expects a specific JSON schema.
6. **Validates schema** — rejects output that does not match required types and fields.
7. **Applies business validation** — rejects logically invalid output (past dates, negative amounts).
8. **Returns safe, validated output** — or returns a typed error response.

### Gemini API Key Security

```
CORRECT:
Browser → Next.js API Route → AI Service → Gemini (server key)

INCORRECT:
Browser → Gemini directly (exposes GEMINI_API_KEY)
```

The `GEMINI_API_KEY` environment variable must not be prefixed with `NEXT_PUBLIC_`.

### Provider Abstraction

The AI client (`lib/ai/client.ts`) abstracts the Gemini API. If a different provider is needed later, only this file changes.

---

## 16. AI CONTEXT BUILDER

The Context Builder selects only the data relevant to the current AI task. It never loads the entire database state.

### Context Fields (plan generation)

```typescript
{
  eventType: string,
  eventName: string,
  eventDate: string,           // YYYY-MM-DD
  daysRemaining: number,
  guestCount: number,
  totalBudget: number,
  currency: string,
  theme: string | null,
  style: string | null,
  priorities: string | null,   // OPEN DECISION on representation
  specialRequirements: string | null,
  existingTaskCount: number,
  existingMilestoneCount: number,
  existingVendorCount: number,
  budgetUtilization: number,
  guestSummary: {
    total: number,
    accepted: number,
    pending: number,
    declined: number
  }
}
```

### Context Fields (chat — question-dependent)

For budget questions: total budget, expenses, utilization, by-category breakdown.
For task questions: upcoming deadlines, overdue tasks, critical tasks.
For vendor questions: vendor list summary, unbooked critical vendors.
For general planning: event summary, days remaining, key risks.

### What is NEVER sent to AI

| Data | Reason |
|---|---|
| Guest email addresses | Sensitive PII |
| Guest phone numbers | Sensitive PII |
| Vendor contact details | Sensitive PII |
| Authentication tokens | Security |
| Internal database UUIDs (except event ID where needed) | Unnecessary |
| Other users' data | Authorization boundary |
| `GEMINI_API_KEY` | Security |

### Context Size Control

If conversation history exceeds a practical limit, summarise older messages rather than sending the full history.

No vector database or RAG system is introduced for MVP.

---

## 17. AI FAILURE ARCHITECTURE

AI failures must not disrupt the core event-planning application.

### AI States

| State | Description | UI Behavior |
|---|---|---|
| `idle` | No generation in progress | Default state |
| `generating` | AI request in flight | Show spinner, disable generate button |
| `success` | Valid plan received | Show plan preview for review |
| `schema_invalid` | AI output failed schema validation | Show error, offer retry |
| `business_invalid` | AI output failed business validation | Show error, offer retry |
| `provider_error` | Gemini returned error | Show "AI temporarily unavailable", offer retry |
| `timeout` | Request exceeded timeout | Show timeout message, offer retry |
| `rate_limited` | 429 from Gemini or application | Show "Please wait" with Retry-After |

### Failure Principles

1. A failed AI request must not delete or corrupt existing user data.
2. The application is fully functional without AI — AI is an enhancement layer.
3. Retrying is always safe for generation (generates a new plan).
4. Retrying is always safe for chat (sends the message again).
5. AI errors are logged server-side; users see a friendly message, not a stack trace.

### Retry Strategy

- Transient errors (503, network timeout): OPEN DECISION on retry count and delay.
- Validation errors: Do not retry automatically — validation failures indicate a prompt or schema mismatch requiring investigation.
- Rate-limited: Honour the `Retry-After` header and surface it to the user.

---

## 18. FORM ARCHITECTURE

All forms must follow a consistent implementation pattern.

### Form Contract

Every form must provide:

| Concern | Implementation |
|---|---|
| Client-side validation | Immediate feedback on blur/submit (UX only — not the authority) |
| Server-side validation | Authoritative — always performed regardless of client result |
| Loading state | Disable submit button, show spinner |
| Success state | Close dialog, refresh data, optionally show toast |
| Error state | Display field-level errors from server `error.details` or generic message |
| Accessible labels | Every input has a corresponding `<label>` |
| Keyboard support | Tab order, Enter to submit, Escape to close dialogs |

### Validation Source of Truth

Client-side validation schema and server-side validation schema should align where practical (e.g., both using Zod). However, the server schema is always authoritative. The client schema provides fast feedback only.

---

## 19. ERROR BOUNDARIES

### Server-Side Errors

All API errors use the standard envelope from `11-API-IMPLEMENTATION-SPECIFICATION.md` Section 4.

Server error responses never contain:
- Stack traces
- SQL error messages
- API keys
- Internal file paths
- Database schema details

### Client-Side Error Handling

| Scenario | UI Behavior |
|---|---|
| 401 Unauthorized | Redirect to `/login` |
| 404 Not Found | Show `ErrorState` component with "not found" message |
| 400 Validation Error | Display field errors in form |
| 500 Internal Error | Show generic error with retry option |
| AI 503 | Show "AI temporarily unavailable", allow retry |
| Network failure | Show connectivity error, allow retry |

### Component-Level Error States

Every data-dependent component must handle three states:

```
Loading → LoadingState component (skeleton or spinner)
Error   → ErrorState component (message + retry)
Empty   → EmptyState component (helpful prompt, e.g. "No tasks yet — add one")
Data    → Rendered content
```

### Next.js Error Files

Use `error.tsx` at the route group level to catch unhandled rendering errors and display a safe error page instead of crashing the application.

Use `not-found.tsx` for 404 pages within the application shell.

---

## 20. COMPONENT ARCHITECTURE

Components must have single, clear responsibilities.

### Shared Components

| Component | Responsibility |
|---|---|
| `EmptyState` | Consistent empty-list view with icon and prompt text |
| `LoadingState` | Skeleton or spinner for data loading |
| `ErrorState` | Error message with retry action |
| `ConfirmDialog` | Generic confirmation modal (used for all destructive actions) |
| `PageHeader` | Consistent page title + action button area |

### Feature Components (examples)

| Component | Responsibility |
|---|---|
| `EventCard` | Display summary of one event |
| `BudgetSummary` | Total budget, spent, remaining |
| `BudgetProgress` | Visual utilization bar with risk color |
| `BudgetChart` | Category breakdown chart (Recharts) |
| `TaskCard` | Task title, status badge, priority, due date |
| `TaskDialog` | Create/edit task form in a dialog |
| `DependencyDialog` | Add or remove task dependencies |
| `TimelineItem` | Single milestone display |
| `MilestoneDialog` | Create/edit milestone form |
| `VendorCard` | Vendor name, category, status badge, cost |
| `GuestTable` | Paginated guest list with RSVP filter |
| `RSVPBadge` | Coloured badge for RSVP status |
| `ScheduleTimeline` | Visual event-day schedule |
| `AIChat` | Chat message list + input |
| `AIMessage` | Single AI or user message bubble |
| `AIPlanPreview` | Generated plan review before acceptance |
| `NotificationItem` | Notification title, type, read state |

### Component Rules

1. Components must not contain direct Supabase queries.
2. Components must not contain Gemini API calls.
3. Components must not calculate budget totals or guest statistics directly — these come from the server.
4. Components larger than ~200 lines of JSX should be decomposed.
5. Business logic extracted to `lib/` functions.

---

## 21. DESIGN SYSTEM ARCHITECTURE

### Source of Truth

The approved UtsavAI frontend design — as implemented in the existing frontend prototype — is the visual source of truth.

### Technology

- **Tailwind CSS** for all styling
- **shadcn/ui** for all interactive UI components (Button, Dialog, Select, Tabs, etc.)
- **Lucide React** for all icons

### Design Principles

| Principle | Detail |
|---|---|
| Consistent spacing | Use Tailwind spacing scale — do not use arbitrary pixel values |
| Consistent typography | Use defined font scale from Tailwind config |
| Consistent color | Use CSS custom properties / Tailwind theme tokens |
| Accessible components | shadcn/ui components are ARIA-compliant by default |
| Predictable behavior | Dialogs always closable with Escape; forms always submittable with Enter |

### What this design system does NOT use

| Excluded | Reason |
|---|---|
| Purple gradients everywhere | Not the approved design |
| Pill-shaped buttons as default | Not the approved design |
| Emoji as primary icons | Lucide React icons only |
| Excessive animations / cursor effects | Not appropriate for a planning tool |
| Fake testimonials or fake review counts | Dishonest, not permitted |
| Fake user counters or fake metrics | Dishonest, not permitted |
| AI-generated stock imagery | Not appropriate for this product |
| AI-slop marketing copy | Not appropriate for this product |

The UI must look and behave like a professional, functional planning tool.

---

## 22. ACCESSIBILITY ARCHITECTURE

UtsavAI must be built to WCAG 2.1 AA standards as the baseline.

### Requirements

| Area | Requirement |
|---|---|
| Semantic HTML | Use correct elements (`<main>`, `<nav>`, `<h1>`–`<h6>`, `<button>`, `<form>`, `<label>`) |
| Keyboard navigation | All interactive elements are reachable and usable by keyboard |
| Focus management | Dialogs trap focus while open; focus returns to trigger on close |
| Labels | Every form input has a visible or accessible label |
| Descriptions | Error messages are associated with their fields via `aria-describedby` |
| Color contrast | Text and UI elements meet WCAG 2.1 AA contrast ratios |
| Skip links | "Skip to main content" link at the top of every page |
| Dialogs | Use `role="dialog"` and `aria-modal="true"` (shadcn/ui handles this) |
| Tables | Guest and vendor tables use proper `<th>` and `scope` attributes |
| Screen readers | Interactive controls have meaningful accessible names |
| Responsive | Application is usable on all screen sizes without horizontal scroll |

---

## 23. RESPONSIVE ARCHITECTURE

UtsavAI must be usable on mobile, tablet, and desktop.

### Breakpoints (Tailwind defaults)

| Breakpoint | Viewport |
|---|---|
| `sm` | ≥ 640px |
| `md` | ≥ 768px |
| `lg` | ≥ 1024px |
| `xl` | ≥ 1280px |

### Screen-Specific Behavior

| Screen | Key screens | Adaptation |
|---|---|---|
| **Mobile** | Dashboard, Tasks, Guests, Vendors | Sidebar collapses to bottom nav or hamburger menu; tables become stacked cards; dialogs are full-screen drawers |
| **Tablet** | Budget, Expenses, Timeline | Sidebar may be collapsed; tables visible with horizontal scroll if necessary; dialogs are centered modals |
| **Desktop** | All screens | Full sidebar visible; tables fully visible; dashboard grid layout |

### Responsive Rules

1. Do not simply shrink a desktop table to mobile — use a card layout for narrow viewports.
2. The AI chat must be usable on mobile — input at bottom, messages scrollable.
3. Event-day schedule timeline must be readable on mobile.
4. Budget charts must degrade gracefully on small screens (smaller chart, same data).
5. Navigation must not require horizontal scroll on any viewport.

---

## 24. PERFORMANCE ARCHITECTURE

### Rendering Strategy

| Content type | Rendering |
|---|---|
| Public marketing pages | Server-side rendered (SSR) or statically generated (SSG) |
| Dashboard and event pages | Server-side rendered (fresh data per request) |
| Interactive forms and dialogs | Client Components |
| Charts | Client Components (Recharts) |

### Performance Rules

1. **No unnecessary client-side data fetching** — fetch data server-side in Server Components; pass as props.
2. **No polling** — do not use `setInterval` to poll the API. Use Supabase Realtime for live updates if required (OPEN DECISION), or rely on user-triggered refreshes.
3. **Minimal AI context** — the Context Builder must never send more data to Gemini than needed.
4. **No redundant AI requests** — generated plans are cached in state until the user explicitly discards or accepts them.
5. **Lazy loading** — heavy client components (charts, AI chat) use dynamic imports where practical.
6. **Efficient queries** — use indexed columns for filters; avoid SELECT * where specific fields are known.
7. **Image optimisation** — use Next.js `<Image>` for all images.
8. **No unnecessary dependencies** — do not add npm packages without a documented reason.

---

## 25. SECURITY ARCHITECTURE

Security is not a layer — it is present at every layer.

| Layer | Security control |
|---|---|
| Authentication | Supabase Auth JWT |
| Authorization | Three-step ownership check in every API handler |
| Input validation | Schema validation on every endpoint (server-side authoritative) |
| AI input | User content treated as untrusted; system instructions protected |
| AI output | Schema validation + business validation before any use |
| Database | Row Level Security enabled on all tables |
| Environment | Secrets in env vars; never committed to Git; service-role key server-only |
| Error responses | Safe generic messages; no stack traces; no internals |
| Rate limiting | AI endpoints rate-limited; lightweight implementation |
| CORS | Same-origin preferred; no unrestricted wildcard for authenticated APIs |
| Logging | Passwords, tokens, API keys never logged |

See `08-SECURITY-AUTHORIZATION-SPECIFICATION.md` for the complete security specification.

---

## 26. FILE / MODULE OWNERSHIP

| Layer | Location | Responsibility |
|---|---|---|
| **Presentation** | `app/(dashboard)/`, `components/` | UI rendering, user interaction, display state |
| **Client Hooks** | `hooks/` | Reusable client-side logic, data fetching wrappers |
| **API Handlers** | `app/api/` | HTTP request handling, auth, validation, module coordination |
| **Domain Modules** | `lib/modules/` or `lib/services/` | Business logic per domain |
| **AI Service** | `lib/ai/` | Context building, prompt construction, Gemini calls, output validation |
| **Calculations** | `lib/calculations/` | Pure deterministic business functions (budget, stats, risk) |
| **Validation Schemas** | `lib/validation/` | Input/output schema definitions |
| **Data Access** | `lib/supabase/` | Supabase query helpers, ownership-scoped queries |
| **Type Definitions** | `types/` | Shared TypeScript interfaces |
| **Utilities** | `lib/utils/` | Pure helper functions (formatting, date arithmetic) |
| **Database** | Supabase PostgreSQL | Persistence, foreign keys, Row Level Security |

**Nothing crosses ownership boundaries without passing through the defined interface of that layer.**

UI components do not query the database.
Domain modules do not call Gemini.
The AI module does not perform database mutations.

---

## 27. IMPLEMENTATION RULES

These rules apply to every implementation decision made during development.

1. **No database queries in presentation components.** All data access goes through API routes, Server Components, or Server Actions.
2. **No Gemini calls in UI components.** All AI calls go through `lib/ai/` and the API layer.
3. **No authoritative financial calculations in the UI.** Budget totals, utilization percentages, and risk statuses are computed server-side and provided to the UI as data.
4. **Never trust client-provided ownership.** Resolve ownership from the authenticated session and database.
5. **Do not duplicate business rules.** If a calculation exists in `lib/calculations/`, call it — do not reimplement it inline.
6. **Keep modules focused.** A module that handles tasks should not contain vendor logic.
7. **Prefer typed interfaces.** Every API request, response, domain entity, and function parameter has a TypeScript type.
8. **Validate all external input.** Input from the browser, AI output, and external APIs are all untrusted.
9. **Handle loading, error, and empty states.** Every data-dependent component has all three states.
10. **Persisted data lives on the server.** Do not treat Zustand or local state as a persistent store.
11. **Reuse existing components.** Before creating a new component, check if an existing one can be extended.
12. **No dependency added without a reason.** Every new package requires a documented justification.
13. **Remove `ignoreBuildErrors: true`** from `next.config.ts` before backend integration. This was a temporary scaffold setting.

---

## 28. TECHNICAL DEBT RULES

When a simpler solution exists alongside a more correct one, prefer the simpler solution and document the shortcut.

| Principle | Detail |
|---|---|
| Prefer simple | A working simple solution beats a theoretically optimal complex one |
| Avoid premature abstractions | Don't build a generic framework before needing it twice |
| Avoid over-engineering | The architecture must serve a student/hackathon project, not an enterprise |
| Avoid unnecessary infrastructure | No Redis, no queues, no separate servers |
| Document shortcuts | If a shortcut is taken, mark it `// TODO: [description]` in code |
| Mark future improvements | Use `POST-MVP` in documentation for known improvements |

### Known Technical Debt Items to Address

| Item | Action |
|---|---|
| `ignoreBuildErrors: true` in `next.config.ts` | Remove before backend integration |
| Mock/demo data in Zustand stores | Replace with real API calls progressively |
| Mock AI responses in frontend | Replace with real `POST /api/ai/generate-plan` and `POST /api/ai/chat` calls |
| Local-only state mutations | Replace with real API calls + server validation |

---

## 29. CURRENT FRONTEND MIGRATION

The existing frontend is a working interactive prototype. It demonstrates the intended UI/UX but uses mock data and local state instead of real backend services.

### Migration Strategy: Progressive, Non-Destructive

Do NOT rewrite the entire frontend. Preserve the visual design and component structure. Replace the data layer progressively.

```
Phase 1: Foundation
  Preserve visual design
  Fix TypeScript / lint errors (remove ignoreBuildErrors)
  Set up real Supabase connection
  Implement real authentication (replace mock auth with Supabase Auth)
  Implement protected routes with real session check

Phase 2: Core Data
  Connect Events CRUD to real API
  Connect Dashboard to real aggregated data
  Replace Zustand demo event data with real API responses

Phase 3: Feature Modules (one at a time)
  Connect Tasks (CRUD + dependencies)
  Connect Budget and Expenses
  Connect Vendors
  Connect Guests
  Connect Timeline Milestones
  Connect Event-Day Schedule
  Connect Notifications

Phase 4: AI Integration
  Replace mock AI plan with real POST /api/ai/generate-plan
  Replace mock AI chat with real POST /api/ai/chat
  Implement plan review → acceptance flow

Phase 5: Cleanup
  Remove all demo-only data, mock responses, and placeholder handlers
  Remove unused Zustand slices
  Enable strict TypeScript checks
  Run lint and fix all errors
  Test all flows end-to-end
```

### Preservation Rule

During migration, the visual appearance of the existing frontend must not change without a documented design decision. The goal is to keep everything looking the same while wiring up real data underneath.

---

## 30. SOURCE-OF-TRUTH REFERENCE

When implementation decisions arise, consult the authoritative source document.

| Concern | Source of Truth |
|---|---|
| What users can do | `01-PRD.md` |
| What features exist | `02-FRS.md` |
| Non-functional requirements | `03-NFR.md` |
| Database schema | `04-DATABASE.md` |
| API route contract | `11-API-IMPLEMENTATION-SPECIFICATION.md` |
| AI behavior and constraints | `06-AI-SPECIFICATION.md` |
| UI/UX design decisions | `07-UI-UX-SPECIFICATION.md` + existing frontend |
| Security rules | `08-SECURITY-AUTHORIZATION-SPECIFICATION.md` |
| Testing requirements | `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md` |
| Deployment configuration | `10-DEPLOYMENT-DEVOPS-SPECIFICATION.md` |
| Architecture (this document) | `12-TECHNICAL-ARCHITECTURE-SPECIFICATION.md` |

### Conflict Resolution

If two source documents appear to conflict, do not silently invent behavior. Instead:

1. Identify the conflict explicitly.
2. Determine which document is more specific (more specific wins).
3. If equally specific, flag as `OPEN DECISION` and document the conflict.
4. Do not implement anything until the conflict is resolved.

---

## 31. ARCHITECTURE DECISION RECORDS

### ADR-001 — Modular Monolith Instead of Microservices

**Decision:** All UtsavAI application code lives in a single Next.js application. No separate backend service.

**Reason:** Microservices introduce distributed systems complexity (service discovery, inter-service auth, deployment coordination, latency) that is not justified for a student/hackathon project with a single developer or small team.

**Alternatives considered:** Separate Express/Fastify backend. Rejected — adds deployment complexity and a second service to maintain.

**Consequences:** All domain modules share the same process and deployment unit. Scaling is per-Vercel-function. This is acceptable for free-tier constraints.

---

### ADR-002 — Supabase PostgreSQL as Database

**Decision:** All persistent data stored in Supabase PostgreSQL. Row Level Security enabled.

**Reason:** Supabase provides PostgreSQL + Auth + Storage on the free tier. No separate database server to manage. RLS provides defense-in-depth.

**Alternatives considered:** PlanetScale (MySQL), Railway PostgreSQL, SQLite (not production-suitable). Rejected in favour of Supabase's integrated offering.

**Consequences:** Application is coupled to Supabase's client library. Migrating to another database would require replacing `lib/supabase/` and updating auth integration.

---

### ADR-003 — Next.js API Routes / Server Actions as Backend

**Decision:** All backend logic implemented as Next.js API Route handlers (`route.ts`) or Server Actions. No dedicated Node.js/Go/Python backend.

**Reason:** Avoids a second deployment target. Next.js API routes run as serverless functions on Vercel. Zero additional infrastructure cost.

**Alternatives considered:** Express.js on Railway, Hono on Cloudflare Workers. Rejected — unnecessary infrastructure for this project scope.

**Consequences:** API routes share the same codebase as the frontend. There is no clear API versioning boundary by default — versioning strategy defined in `11-API-IMPLEMENTATION-SPECIFICATION.md` Section 34.

---

### ADR-004 — Gemini Accessed Through Server-Side AI Layer

**Decision:** The `GEMINI_API_KEY` is server-only. All calls to Gemini are made from `lib/ai/` invoked by API route handlers. The browser never sees the key.

**Reason:** Exposing an AI API key in the browser bundle allows any user to extract it and make unlimited requests at the project owner's expense.

**Alternatives considered:** Client-side Gemini SDK (rejected — key exposure risk). Per-user API key (rejected — adds complexity and user friction).

**Consequences:** AI features require a round-trip to the server. Streaming AI responses requires additional implementation effort (OPEN DECISION).

---

### ADR-005 — Deterministic Financial Calculations

**Decision:** All budget calculations (total, remaining, utilization, risk status) are performed by application code, not AI.

**Reason:** AI language models are not reliable calculators. Using AI for financial totals risks incorrect figures shown to users making real planning decisions. Deterministic code is testable.

**Alternatives considered:** AI-computed budget suggestions (accepted as suggestions only — not authoritative totals).

**Consequences:** A dedicated `lib/calculations/` module holds all financial functions. AI may explain budget status using figures provided to it in context; AI never computes the figures.

---

### ADR-006 — In-App Notifications for MVP

**Decision:** UtsavAI uses in-app notifications only. No SMS, no email notifications, no push notifications for MVP.

**Reason:** SMS requires a paid provider (Twilio). Email notification systems add complexity. In-app notifications are sufficient for a free-tier MVP.

**Alternatives considered:** Supabase + email (via Resend or SendGrid). Marked POST-MVP.

**Consequences:** Users must be in the application to receive notifications. Real-time delivery via Supabase Realtime is OPEN DECISION — polling-based notification refresh is acceptable for MVP.

---

### ADR-007 — Manual Git Commit and Push by Project Owner

**Decision:** All Git commits and pushes are performed manually by the project owner. AI must never run `git commit`, `git push`, `git reset`, or any destructive Git operation.

**Reason:** The project owner retains control of version history. AI tools should not create Git history entries, which would misrepresent authorship and could introduce unreviewed changes.

**Alternatives considered:** None. This is an absolute project rule.

**Consequences:** All AI-generated content (code, documentation) is staged for manual review and commit by the project owner.

---

## 32. ARCHITECTURE VERIFICATION CHECKLIST

- [x] Frontend architecture defined
- [x] Routing architecture defined (public, auth, protected, dynamic event routes, API routes)
- [x] Server Component vs Client Component strategy defined
- [x] State management strategy defined (server state, UI state, AI state, Zustand rules)
- [x] Data flow defined (CRUD, AI generate, AI accept, AI chat)
- [x] Domain modules defined (Event, Budget, Task, Timeline, Vendor, Guest, Schedule, Notification, AI, Export)
- [x] Business logic functions defined
- [x] Deterministic logic list defined
- [x] Database access rules defined
- [x] Data Access Layer defined
- [x] Authentication architecture defined
- [x] Authorization architecture defined (three-step, child resource authorization)
- [x] AI service architecture defined
- [x] AI context builder defined
- [x] AI failure architecture defined
- [x] Form architecture defined
- [x] Error boundaries defined
- [x] Component architecture defined
- [x] Design system architecture defined
- [x] Accessibility requirements defined
- [x] Responsive architecture defined
- [x] Performance rules defined
- [x] Security architecture defined
- [x] Module ownership matrix defined
- [x] Implementation rules defined
- [x] Technical debt rules defined
- [x] Frontend migration strategy defined
- [x] Source-of-truth reference table defined
- [x] Architecture Decision Records documented
- [x] Open decisions explicitly identified

---

## 33. OPEN TECHNICAL DECISIONS

The following items require explicit decisions during implementation. Mark each as resolved in this document when decided.

| # | Decision | Options | Impact |
|---|---|---|---|
| OTD-01 | AI streaming vs request/response | Streaming (more complex, better UX) vs full response (simpler) | AI chat UX |
| OTD-02 | Supabase Realtime for notifications | Realtime subscription vs polling vs user-triggered refresh | Notification freshness |
| OTD-03 | Email verification on registration | Required vs optional for MVP | User onboarding |
| OTD-04 | AI chat conversation persistence | Always / conditional / none | ai_conversations table usage |
| OTD-05 | Export implementation | Client-side vs server-side; which library | Export feature scope |
| OTD-06 | Rate limiting mechanism | In-process / Vercel middleware / Upstash | Abuse protection |
| OTD-07 | AI retry strategy | Count and delay for transient failures | AI resilience |
| OTD-08 | Pagination convention | `limit`/`offset` vs `page`/`perPage` | All paginated API endpoints |
| OTD-09 | Validation library | Zod vs Yup vs Valibot | All validation code |
| OTD-10 | Event preferences priorities field | string vs string[] vs JSONB | Database + API |

All items listed as `OPEN DECISION` in `11-API-IMPLEMENTATION-SPECIFICATION.md` also apply here.

---

## FINAL PROJECT RULES

The following rules apply absolutely to the entire UtsavAI project:

1. **UtsavAI uses a modular monolith.** No microservices.
2. **Architecture stays simple.** No infrastructure that is not justified by a documented requirement.
3. **Next.js is the primary application layer.** Frontend, API, and server logic all live here.
4. **Supabase is the primary backend platform.** PostgreSQL for data, Auth for authentication, Storage if file uploads are needed.
5. **Gemini is accessed server-side only.** The API key never reaches the browser.
6. **The database is the source of truth for persisted data.** Zustand and React state are caches only.
7. **AI is not the source of truth for any calculation.** AI explains; application code computes.
8. **Financial calculations are deterministic.** They live in `lib/calculations/` and are unit-testable.
9. **Authorization is enforced server-side.** Frontend guards are UX conveniences, not security controls.
10. **UI components must not contain database or business logic.**
11. **Preserve the approved frontend design during backend integration.** Visual changes require a documented decision.
12. **Remove demo-only behavior progressively.** One module at a time following the migration strategy.
13. **Do not introduce unnecessary infrastructure.** Every dependency requires a justification.
14. **Do not use fake product data in production.** No fake testimonials, metrics, or user counts.
15. **Do not use AI-slop UI or AI-generated marketing copy.** The product should look and read like a real tool.
16. **AI must never perform `git commit` or `git push`.**
17. **The project owner manually performs every Git commit and Git push.**

---

**IMPORTANT PROJECT RULE:**

AI must never perform Git commit or Git push operations. Git commit and Git push will always be performed manually by the project owner.

