# UtsavAI - API Implementation Specification

**Document name:** 11-API-IMPLEMENTATION-SPECIFICATION.md
**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Source documents:** `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`, `05-API-SPECIFICATION.md`, `06-AI-SPECIFICATION.md`, `07-UI-UX-SPECIFICATION.md`, `08-SECURITY-AUTHORIZATION-SPECIFICATION.md`, `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md`, `10-DEPLOYMENT-DEVOPS-SPECIFICATION.md`
**Purpose:** Define the concrete API contract that the UtsavAI frontend will use when the real backend is connected. This document governs what endpoints exist, what requests they accept, what responses they return, and what rules they enforce.
**Intended audience:** Backend developers, frontend developers, QA engineers.

---

## DOCUMENT SCOPE

This document defines the implementation-level API contract for UtsavAI.

It does NOT contain implementation code.

It does NOT introduce features not specified in source documents 01–10.

It does NOT modify application source files.

Unresolved decisions are marked explicitly as `OPEN DECISION`.

---

## 1. PURPOSE

This specification provides a precise, testable API contract that:

- Is grounded in `05-API-SPECIFICATION.md` and `04-DATABASE.md`
- Covers all resource domains: authentication, events, preferences, budget, expenses, tasks, task dependencies, timeline, schedule, vendors, guests, notifications, AI plan generation, AI plan acceptance, AI chat, export, and dashboard
- Defines request/response shapes, HTTP status codes, validation rules, authorization requirements, and error handling for every endpoint
- Confirms the route conventions established in `05-API-SPECIFICATION.md`
- Serves as the single source of truth during backend implementation

The API must be simple enough for a student or hackathon project while being architecturally sound, secure, and maintainable.

---

## 2. API PRINCIPLES

Every API endpoint must adhere to the following principles:

**Validate all input.**
Every request body, query parameter, and path parameter must be validated before use.

**Authenticate protected requests.**
The server derives the authenticated user from the session context (Supabase Auth JWT). No endpoint trusts a `user_id` supplied by the browser.

**Authorize access to every resource.**
Every read or write operation on an event or child resource must verify that the authenticated user owns that event. See Section 25 for the three-step authorization model.

**Return predictable JSON.**
All responses use the standard response envelope defined in Section 4.

**Use appropriate HTTP status codes.**
See Section 5.

**Never expose secrets.**
`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, session tokens, and other secrets must never appear in responses.

**Never trust client-provided user IDs.**
The server always resolves identity from the auth context, never from a request body or query string.

**Never allow AI output to directly modify the database.**
AI-generated content is always validated and persisted by application code only after user confirmation. See Section 15.

**Handle errors consistently.**
All error responses use the standard error envelope defined in Section 4.

**Financial calculations are always deterministic and server-side.**
AI must never be the authoritative source for budget totals, utilization percentages, or risk thresholds.

---

## 3. ARCHITECTURE

### Deployment

UtsavAI uses a modular-monolith architecture built on Next.js.

There are no microservices.

All API routes are Next.js API Routes located under:

```
/api/...
```

### Infrastructure

```
Developer
↓
Local Development (localhost:3000)
↓
GitHub
↓
Vercel (Next.js Application)
↓
Supabase (PostgreSQL + Auth + Storage)

Next.js Server
↓
Gemini API
```

### No Redis

Do not introduce Redis for rate limiting or caching solely for theoretical scalability. Use lightweight in-process or Vercel-compatible solutions.

### Next.js File-System Routing vs REST Notation

API routes use Next.js file-system bracket syntax internally (e.g., `[id]`, `[eventId]`).

This specification document uses standard REST `:param` notation throughout for readability (e.g., `:id`, `:eventId`).

| REST Notation | Next.js File |
|---|---|
| `/api/events/:id` | `app/api/events/[id]/route.ts` |
| `/api/tasks/:taskId` | `app/api/tasks/[taskId]/route.ts` |
| `/api/events/:eventId/tasks` | `app/api/events/[eventId]/tasks/route.ts` |

---

## 4. STANDARD RESPONSE FORMAT

All responses use a standard JSON envelope.

### Success — Single Resource

```json
{
  "success": true,
  "data": {}
}
```

### Success — Collection

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

The `pagination` object is included when the endpoint supports pagination.

### Success — No Body (e.g., DELETE)

HTTP 204 No Content. No response body.

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data.",
    "details": {}
  }
}
```

The `details` field is optional. It may contain field-level validation messages in development. It must never contain stack traces, SQL errors, API keys, or internal paths in production.

### Standard Error Codes

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Request body or query params failed validation |
| `AUTHENTICATION_REQUIRED` | No valid session |
| `FORBIDDEN` | Authenticated but not authorized for this resource |
| `NOT_FOUND` | Resource does not exist or user does not own it |
| `CONFLICT` | Duplicate or conflicting state (e.g. duplicate dependency) |
| `RATE_LIMITED` | Too many requests |
| `AI_PROVIDER_UNAVAILABLE` | AI provider is down |
| `AI_TIMEOUT` | AI request timed out |
| `AI_RATE_LIMITED` | AI provider rate limit hit |
| `AI_SCHEMA_INVALID` | AI output failed schema validation |
| `AI_BUSINESS_INVALID` | AI output failed business validation |
| `AI_EMPTY_RESPONSE` | AI returned empty or null output |
| `AI_TEMPORARY_FAILURE` | Transient AI failure |
| `INTERNAL_ERROR` | Unexpected server error |

---

## 5. HTTP STATUS CODES

| Status | Usage |
|---|---|
| 200 | Successful read or update |
| 201 | Successful creation |
| 204 | Successful delete or no-content response |
| 400 | Bad request — validation failure |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found (or not owned by user) |
| 409 | Conflict — e.g., self-referential dependency, circular dependency, duplicate |
| 422 | Unprocessable entity — e.g., AI output failed validation |
| 429 | Rate limited |
| 500 | Unexpected server error |
| 503 | External service unavailable (AI provider, database) |

Do not return 403 when the correct behavior is 404. If the user does not own the resource, return 404 to avoid leaking resource existence.

---

## 6. AUTHENTICATION MODEL

### Provider

Authentication is handled by **Supabase Auth**.

### Session Resolution

Every protected endpoint reads the authenticated user from the Supabase session JWT.

The server does NOT accept `user_id` from:
- Request body
- Query parameters
- Custom headers

### Supabase Client

Use the Supabase server-side client (`createServerClient` or equivalent) to resolve the current user in Next.js API routes or Server Actions.

### Unauthenticated Access

Public pages (home, about, features, FAQ, login, register) require no authentication.

All `/api/` routes except health-check endpoints require authentication.

### Session Expiry

Supabase Auth handles token refresh. The server must return `401` when the session is expired or invalid. The frontend is responsible for redirecting to login on receipt of `401`.

---

## 7. EVENTS API

Events are the top-level resource. Every child resource (tasks, vendors, guests, etc.) belongs to an event.

### 7.1 List Events

```
GET /api/events
```

**Auth:** Required
**Ownership:** Only events owned by the authenticated user are returned.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "string",
      "type": "Wedding | Birthday | Community Event | Family Celebration | Custom Event",
      "event_date": "2025-12-01",
      "start_time": "10:00:00 | null",
      "end_time": "22:00:00 | null",
      "location": "string | null",
      "description": "string | null",
      "guest_count": 100,
      "total_budget": 500000.00,
      "currency": "INR",
      "status": "Planning | Active | Completed | Cancelled",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Notes:**
- `type` enum: `Wedding`, `Birthday`, `Community Event`, `Family Celebration`, `Custom Event`
- `status` enum: `Planning`, `Active`, `Completed`, `Cancelled`

---

### 7.2 Create Event

```
POST /api/events
```

**Auth:** Required
**Ownership:** Created event is associated with the authenticated user.

**Request body:**

```json
{
  "name": "string (required, 1–200 chars)",
  "type": "string (required, valid enum)",
  "event_date": "YYYY-MM-DD (required)",
  "start_time": "HH:MM:SS (optional)",
  "end_time": "HH:MM:SS (optional)",
  "location": "string (optional, max 300 chars)",
  "description": "string (optional, max 2000 chars)",
  "guest_count": "integer (optional, min 0)",
  "total_budget": "number (optional, min 0)",
  "currency": "string (optional, default INR)"
}
```

**Validation:**
- `name`: required, string, 1–200 characters
- `type`: required, must be valid event type enum value
- `event_date`: required, must be a valid date, must not be in the past (OPEN DECISION: enforce server-side or allow past dates for retrospective events)
- `total_budget`: optional, must be ≥ 0 if provided
- `guest_count`: optional, must be integer ≥ 0 if provided

**Response 201:**

```json
{
  "success": true,
  "data": { /* created event object */ }
}
```

---

### 7.3 Get Event

```
GET /api/events/:id
```

**Auth:** Required
**Ownership:** Verified — returns 404 if not owned by user.

**Response 200:**

```json
{
  "success": true,
  "data": { /* event object */ }
}
```

---

### 7.4 Update Event

```
PATCH /api/events/:id
```

**Auth:** Required
**Ownership:** Verified — returns 404 if not owned by user.

**Request body:** All fields optional. Only provided fields are updated.

```json
{
  "name": "string (optional)",
  "type": "string (optional)",
  "event_date": "YYYY-MM-DD (optional)",
  "start_time": "HH:MM:SS (optional)",
  "end_time": "HH:MM:SS (optional)",
  "location": "string (optional)",
  "description": "string (optional)",
  "guest_count": "integer (optional)",
  "total_budget": "number (optional)",
  "currency": "string (optional)",
  "status": "string (optional)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { /* updated event object */ }
}
```

---

### 7.5 Delete Event

```
DELETE /api/events/:id
```

**Auth:** Required
**Ownership:** Verified — returns 404 if not owned by user.

**Cascade:** Deleting an event removes all associated records:
- tasks and task_dependencies
- vendors
- guests
- expenses
- timeline_milestones
- event_schedules
- ai_conversations and ai_messages
- notifications

**OPEN DECISION:** Cascade deletion enforced at PostgreSQL level (ON DELETE CASCADE) or at application layer. Final decision deferred to implementation. One explicit strategy must be chosen and tested.

**Response 204:** No body.

---

## 8. EVENT PREFERENCES API

Event preferences are a child resource of events. Each event has at most one preferences record.

### 8.1 Get Preferences

```
GET /api/events/:eventId/preferences
```

**Auth:** Required
**Ownership:** Verified via event.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "event_id": "uuid",
    "theme": "string | null",
    "style": "string | null",
    "priorities": "OPEN DECISION — string, array, or JSONB",
    "special_requirements": "string | null",
    "created_at": "ISO 8601",
    "updated_at": "ISO 8601"
  }
}
```

**Notes:**
- Returns 404 if no preferences record exists yet. Alternatively, returns a null-filled default object. **OPEN DECISION.**

---

### 8.2 Upsert Preferences

```
PUT /api/events/:eventId/preferences
```

**Auth:** Required
**Ownership:** Verified via event.

Creates or replaces the preferences record for the event. All fields optional.

**Request body:**

```json
{
  "theme": "string (optional, max 200 chars)",
  "style": "string (optional, max 200 chars)",
  "priorities": "OPEN DECISION",
  "special_requirements": "string (optional, max 2000 chars)"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { /* preferences object */ }
}
```

---

## 9. BUDGET API

The budget is derived from the event's `total_budget` and the sum of all expenses. There is no separate budget table — budget data is computed server-side.

AI must never be the authoritative source for budget calculations.

### 9.1 Get Budget Overview

```
GET /api/events/:id/budget
```

**Auth:** Required
**Ownership:** Verified.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total_budget": 500000.00,
    "total_expenses": 320000.00,
    "remaining_budget": 180000.00,
    "utilization_percentage": 64.0,
    "status": "normal | warning | critical | over_budget",
    "currency": "INR",
    "by_category": [
      {
        "category": "Catering",
        "total": 120000.00,
        "percentage_of_budget": 24.0
      }
    ]
  }
}
```

**Budget utilization thresholds (deterministic, server-side):**

| Utilization | Status |
|---|---|
| < 80% | `normal` |
| ≥ 80% | `warning` |
| ≥ 90% | `critical` |
| > 100% | `over_budget` |

These thresholds are fixed application logic, not AI output.

---

## 10. EXPENSES API

### 10.1 List Expenses

```
GET /api/events/:eventId/expenses
```

**Auth:** Required
**Ownership:** Verified.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter by expense category |
| `date_from` | YYYY-MM-DD | Filter expenses from this date |
| `date_to` | YYYY-MM-DD | Filter expenses to this date |
| `limit` | integer | Pagination limit (default 50, max 100) |
| `offset` | integer | Pagination offset (default 0) |

**Response 200:** Collection envelope with expense objects and pagination.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "category": "string",
      "description": "string",
      "amount": 15000.00,
      "expense_date": "YYYY-MM-DD",
      "vendor_id": "uuid | null",
      "notes": "string | null",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "pagination": { "total": 10, "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### 10.2 Create Expense

```
POST /api/events/:eventId/expenses
```

**Auth:** Required
**Ownership:** Verified.

**Request body:**

```json
{
  "category": "string (required)",
  "description": "string (required, max 500 chars)",
  "amount": "number (required, min 0.01)",
  "expense_date": "YYYY-MM-DD (required)",
  "vendor_id": "uuid (optional)",
  "notes": "string (optional, max 1000 chars)"
}
```

**Validation:**
- `amount`: required, must be > 0
- `expense_date`: required, valid date
- If `vendor_id` provided, vendor must exist and belong to the same event

**Response 201:** Created expense object.

---

### 10.3 Update Expense

```
PATCH /api/expenses/:expenseId
```

**Auth:** Required
**Ownership:** Verified via the expense's parent event.

**Request body:** All fields optional (partial update).

**Response 200:** Updated expense object.

---

### 10.4 Delete Expense

```
DELETE /api/expenses/:expenseId
```

**Auth:** Required
**Ownership:** Verified.

**Response 204:** No body.

---

## 11. TASKS API

### 11.1 List Tasks

```
GET /api/events/:eventId/tasks
```

**Auth:** Required
**Ownership:** Verified.

**Query parameters:**

| Parameter | Type | Values |
|---|---|---|
| `status` | string | `Not Started`, `In Progress`, `Completed` |
| `priority` | string | `Low`, `Medium`, `High`, `Critical` |
| `due_before` | YYYY-MM-DD | Filter tasks with due date ≤ this date |
| `sort` | string | e.g., `due_date_asc`, `priority_desc` |
| `limit` | integer | Default 50, max 100 |
| `offset` | integer | Default 0 |

**Response 200:** Collection envelope with task objects.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "title": "string",
      "description": "string | null",
      "category": "string | null",
      "status": "Not Started | In Progress | Completed",
      "priority": "Low | Medium | High | Critical",
      "due_date": "YYYY-MM-DD | null",
      "assigned_to": "string | null",
      "notes": "string | null",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "pagination": { "total": 25, "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### 11.2 Create Task

```
POST /api/events/:eventId/tasks
```

**Auth:** Required
**Ownership:** Verified.

**Request body:**

```json
{
  "title": "string (required, max 300 chars)",
  "description": "string (optional, max 1000 chars)",
  "category": "string (optional)",
  "status": "string (optional, default 'Not Started')",
  "priority": "string (optional, default 'Medium')",
  "due_date": "YYYY-MM-DD (optional)",
  "assigned_to": "string (optional)",
  "notes": "string (optional, max 1000 chars)"
}
```

**Validation:**
- `title`: required, string, 1–300 characters
- `status`: must be valid enum value if provided
- `priority`: must be valid enum value if provided
- `due_date`: must be a valid date if provided

**Response 201:** Created task object.

---

### 11.3 Update Task

```
PATCH /api/tasks/:taskId
```

**Auth:** Required
**Ownership:** Verified via task's parent event.

**Request body:** All fields optional (partial update). Same field rules as create.

**Response 200:** Updated task object.

---

### 11.4 Delete Task

```
DELETE /api/tasks/:taskId
```

**Auth:** Required
**Ownership:** Verified.

**Cascade:** Associated task_dependencies (where this task is either `task_id` or `depends_on_task_id`) must be deleted.

**Response 204:** No body.

---

## 12. TASK DEPENDENCIES API

Task dependencies express that one task must be completed before another can begin.

### 12.1 List Dependencies for a Task

```
GET /api/tasks/:taskId/dependencies
```

**Auth:** Required
**Ownership:** Verified via task's parent event.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "depends_on_task_id": "uuid",
      "depends_on_task_title": "string",
      "created_at": "ISO 8601"
    }
  ]
}
```

---

### 12.2 Create Dependency

```
POST /api/tasks/:taskId/dependencies
```

**Auth:** Required
**Ownership:** Verified.

**Request body:**

```json
{
  "depends_on_task_id": "uuid (required)"
}
```

**Validation:**
- `depends_on_task_id`: required, must be a valid task UUID
- `task_id` (from path) and `depends_on_task_id` must belong to the same event
- `task_id` must not equal `depends_on_task_id` (no self-dependency) → 409 Conflict
- Creating this dependency must not introduce a circular dependency → 409 Conflict
- Duplicate dependency between the same pair → 409 Conflict

**Response 201:** Created dependency object.

---

### 12.3 Delete Dependency

```
DELETE /api/dependencies/:dependencyId
```

**Auth:** Required
**Ownership:** Verified via parent task's event.

**Response 204:** No body.

---

## 13. TIMELINE MILESTONES API

### 13.1 List Milestones

```
GET /api/events/:eventId/timeline
```

**Auth:** Required
**Ownership:** Verified.

**Query parameters:**

| Parameter | Type | Values |
|---|---|---|
| `date` | YYYY-MM-DD | Filter milestones on this date |
| `status` | string | Filter by milestone status |
| `sort` | string | e.g., `date_asc`, `date_desc` |

**Response 200:** Collection envelope.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "title": "string",
      "description": "string | null",
      "milestone_date": "YYYY-MM-DD",
      "status": "string",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

---

### 13.2 Create Milestone

```
POST /api/events/:eventId/timeline
```

**Auth:** Required
**Ownership:** Verified.

**Request body:**

```json
{
  "title": "string (required, max 300 chars)",
  "description": "string (optional, max 1000 chars)",
  "milestone_date": "YYYY-MM-DD (required)",
  "status": "string (optional)"
}
```

**Response 201:** Created milestone object.

---

### 13.3 Update Milestone

```
PATCH /api/timeline/:milestoneId
```

**Auth:** Required
**Ownership:** Verified.

**Request body:** All fields optional.

**Response 200:** Updated milestone object.

---

### 13.4 Delete Milestone

```
DELETE /api/timeline/:milestoneId
```

**Auth:** Required
**Ownership:** Verified.

**Response 204:** No body.

---

## 14. EVENT-DAY SCHEDULE API

### 14.1 List Schedule Items

```
GET /api/events/:eventId/schedule
```

**Auth:** Required
**Ownership:** Verified.

**Response 200:** Collection envelope.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "activity": "string",
      "start_time": "HH:MM:SS",
      "end_time": "HH:MM:SS | null",
      "description": "string | null",
      "responsible_person": "string | null",
      "notes": "string | null",
      "order_index": 1,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

---

### 14.2 Create Schedule Item

```
POST /api/events/:eventId/schedule
```

**Auth:** Required
**Ownership:** Verified.

**Request body:**

```json
{
  "activity": "string (required, max 300 chars)",
  "start_time": "HH:MM:SS (required)",
  "end_time": "HH:MM:SS (optional)",
  "description": "string (optional, max 1000 chars)",
  "responsible_person": "string (optional)",
  "notes": "string (optional)",
  "order_index": "integer (optional)"
}
```

**Response 201:** Created schedule item object.

---

### 14.3 Update Schedule Item

```
PATCH /api/schedule/:scheduleId
```

**Auth:** Required
**Ownership:** Verified.

**Request body:** All fields optional.

**Response 200:** Updated schedule item object.

---

### 14.4 Delete Schedule Item

```
DELETE /api/schedule/:scheduleId
```

**Auth:** Required
**Ownership:** Verified.

**Response 204:** No body.

---

## 15. VENDORS API

### 15.1 List Vendors

```
GET /api/events/:eventId/vendors
```

**Auth:** Required
**Ownership:** Verified.

**Query parameters:**

| Parameter | Type | Values |
|---|---|---|
| `category` | string | Filter by vendor category |
| `status` | string | Filter by vendor status |
| `sort` | string | e.g., `name_asc`, `status_asc` |
| `limit` | integer | Default 50, max 100 |
| `offset` | integer | Default 0 |

**Vendor Category enum:** `Venue`, `Catering`, `Photography`, `Decoration`, `Music`, `Transportation`, `Security`, `Entertainment`, `Other`

**Vendor Status enum:** `Researching`, `Shortlisted`, `Contacted`, `Negotiating`, `Booked`, `Completed`, `Cancelled`

**Response 200:** Collection envelope.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "name": "string",
      "category": "string",
      "status": "string",
      "contact_name": "string | null",
      "contact_phone": "string | null",
      "contact_email": "string | null",
      "website": "string | null",
      "quoted_price": 50000.00,
      "agreed_price": 45000.00,
      "notes": "string | null",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "pagination": { "total": 8, "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### 15.2 Create Vendor

```
POST /api/events/:eventId/vendors
```

**Auth:** Required
**Ownership:** Verified.

**Request body:**

```json
{
  "name": "string (required, max 200 chars)",
  "category": "string (required, valid enum)",
  "status": "string (optional, default 'Researching')",
  "contact_name": "string (optional)",
  "contact_phone": "string (optional)",
  "contact_email": "string (optional, valid email format)",
  "website": "string (optional, valid URL format)",
  "quoted_price": "number (optional, min 0)",
  "agreed_price": "number (optional, min 0)",
  "notes": "string (optional, max 1000 chars)"
}
```

**Response 201:** Created vendor object.

---

### 15.3 Update Vendor

```
PATCH /api/vendors/:vendorId
```

**Auth:** Required
**Ownership:** Verified via vendor's parent event.

**Request body:** All fields optional.

**Response 200:** Updated vendor object.

---

### 15.4 Delete Vendor

```
DELETE /api/vendors/:vendorId
```

**Auth:** Required
**Ownership:** Verified.

**Response 204:** No body.

---

## 16. GUESTS API

### 16.1 List Guests

```
GET /api/events/:eventId/guests
```

**Auth:** Required
**Ownership:** Verified.

**Query parameters:**

| Parameter | Type | Values |
|---|---|---|
| `rsvp` | string | `Pending`, `Accepted`, `Declined` |
| `group_name` | string | Filter by guest group |
| `limit` | integer | Default 50, max 100 |
| `offset` | integer | Default 0 |

**RSVP Status enum:** `Pending`, `Accepted`, `Declined`

**Response 200:** Collection envelope.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "name": "string",
      "email": "string | null",
      "phone": "string | null",
      "rsvp_status": "Pending | Accepted | Declined",
      "group_name": "string | null",
      "dietary_requirements": "string | null",
      "plus_one": false,
      "notes": "string | null",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "pagination": { "total": 250, "limit": 50, "offset": 0, "hasMore": true }
}
```

**Data minimization:** Guest contact details (email, phone) must not be sent to AI. The AI context builder sends aggregate summaries only (total, accepted, pending, declined).

---

### 16.2 Create Guest

```
POST /api/events/:eventId/guests
```

**Auth:** Required
**Ownership:** Verified.

**Request body:**

```json
{
  "name": "string (required, max 200 chars)",
  "email": "string (optional, valid email)",
  "phone": "string (optional)",
  "rsvp_status": "string (optional, default 'Pending')",
  "group_name": "string (optional)",
  "dietary_requirements": "string (optional)",
  "plus_one": "boolean (optional, default false)",
  "notes": "string (optional, max 500 chars)"
}
```

**Response 201:** Created guest object.

---

### 16.3 Update Guest

```
PATCH /api/guests/:guestId
```

**Auth:** Required
**Ownership:** Verified via guest's parent event.

**Request body:** All fields optional.

**Response 200:** Updated guest object.

---

### 16.4 Delete Guest

```
DELETE /api/guests/:guestId
```

**Auth:** Required
**Ownership:** Verified.

**Response 204:** No body.

---

## 17. NOTIFICATIONS API

Notifications are scoped to the authenticated user. The server only returns notifications belonging to the current user.

### 17.1 List Notifications

```
GET /api/notifications
```

**Auth:** Required
**Ownership:** Server filters by authenticated user ID automatically.

**Query parameters:**

| Parameter | Type | Values |
|---|---|---|
| `unread_only` | boolean | `true` to return only unread notifications |
| `limit` | integer | Default 50, max 100 |
| `offset` | integer | Default 0 |

**Notification Types:** `Task overdue`, `Budget warning`, `Vendor warning`, `RSVP warning`, `Task completed`, `Vendor booked`, `Plan generated`, `Plan accepted`

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "event_id": "uuid | null",
      "type": "string",
      "title": "string",
      "message": "string",
      "read": false,
      "created_at": "ISO 8601"
    }
  ],
  "pagination": { "total": 12, "limit": 50, "offset": 0, "hasMore": false }
}
```

---

### 17.2 Update Notification (Mark Read)

```
PATCH /api/notifications/:id
```

**Auth:** Required
**Ownership:** Verified — notification must belong to the authenticated user.

**Request body:**

```json
{
  "read": true
}
```

**Response 200:** Updated notification object.

---

### 17.3 Mark All Read (Optional)

```
POST /api/notifications/mark-all-read
```

**Auth:** Required
**Ownership:** Marks all of the authenticated user's notifications as read.

**OPEN DECISION:** This endpoint is optional. It may be deferred if the per-notification PATCH endpoint is sufficient for MVP.

**Response 200:**

```json
{
  "success": true,
  "data": { "updated": 8 }
}
```

---

## 18. AI PLAN GENERATION API

This endpoint generates a structured event plan using the AI provider. The AI must not write to the database. The generated plan is returned to the frontend for user review before acceptance.

### 18.1 Generate Plan

```
POST /api/ai/generate-plan
```

**Auth:** Required
**Ownership:** Verified — the `event_id` in the request body must belong to the authenticated user.

**Rate Limited:** Yes — this is the most expensive AI operation. See Section 26.

**Request body:**

```json
{
  "event_id": "uuid (required)"
}
```

The server builds the full AI context server-side using the Event Context Builder (Section 20). The frontend does not supply the event context directly.

**AI Context (assembled server-side, sent to AI provider):**

```json
{
  "eventType": "Wedding",
  "eventName": "string",
  "eventDate": "YYYY-MM-DD",
  "startTime": "HH:MM | null",
  "endTime": "HH:MM | null",
  "location": "string | null",
  "daysRemaining": 90,
  "guestCount": 250,
  "totalBudget": 500000.00,
  "currency": "INR",
  "theme": "string | null",
  "style": "Traditional | null",
  "priorities": "OPEN DECISION",
  "specialRequirements": "string | null",
  "existingTaskCount": 5,
  "existingMilestoneCount": 2,
  "existingVendorCount": 3,
  "budgetUtilization": 24.0,
  "guestSummary": {
    "total": 250,
    "accepted": 0,
    "pending": 250,
    "declined": 0
  }
}
```

**Sensitive data excluded from AI context:**
- Guest email addresses
- Guest phone numbers
- Vendor contact details
- Internal database IDs (where not needed)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "planId": "uuid",
    "generatedAt": "ISO 8601",
    "tasks": [
      {
        "title": "string",
        "description": "string",
        "category": "string",
        "priority": "Low | Medium | High | Critical",
        "suggestedDueDate": "YYYY-MM-DD | null"
      }
    ],
    "milestones": [
      {
        "title": "string",
        "date": "YYYY-MM-DD",
        "description": "string | null"
      }
    ],
    "budgetAllocations": [
      {
        "category": "string",
        "suggestedAmount": 100000.00,
        "reasoning": "string"
      }
    ],
    "vendorCategories": [
      {
        "category": "Venue | Catering | ...",
        "recommendation": "string",
        "priority": "High | Medium | Low"
      }
    ],
    "eventDaySchedule": [
      {
        "activity": "string",
        "time": "HH:MM",
        "description": "string | null"
      }
    ],
    "recommendations": [
      {
        "recommendation": "string",
        "reason": "string",
        "priority": "string"
      }
    ],
    "risks": [
      {
        "risk": "string",
        "severity": "Low | Medium | High",
        "mitigation": "string"
      }
    ]
  }
}
```

**AI Output Validation (server-side, before response):**

1. **Schema validation:** Required fields present, correct types, valid enum values, valid date formats, non-negative monetary values, valid array structures.
2. **Business validation:** Suggested dates are not before current date or after event date, budget allocations are non-negative, event-day schedule is chronologically ordered, no impossible planning scenarios.

If either validation fails, the server returns an error response. It does not return invalid AI output to the frontend.

**Error responses:**

| Scenario | HTTP | Error Code |
|---|---|---|
| AI provider unavailable | 503 | `AI_PROVIDER_UNAVAILABLE` |
| AI request timed out | 503 | `AI_TIMEOUT` |
| AI provider rate limit | 429 | `AI_RATE_LIMITED` |
| AI output failed schema validation | 422 | `AI_SCHEMA_INVALID` |
| AI output failed business validation | 422 | `AI_BUSINESS_INVALID` |
| AI returned empty output | 422 | `AI_EMPTY_RESPONSE` |
| Transient AI failure | 503 | `AI_TEMPORARY_FAILURE` |

---

## 19. AI PLAN ACCEPTANCE API

After the user reviews the generated plan, they may accept it. Acceptance triggers persistence of the plan items into the database.

### 19.1 Accept Plan

```
POST /api/ai/plans/:planId/accept
```

**Auth:** Required
**Ownership:** Verified — the plan must be associated with an event owned by the authenticated user.

**Request body:**

The frontend may send the full plan or a subset (if the user edited items before accepting). The server re-validates all items before insertion.

```json
{
  "event_id": "uuid (required)",
  "tasks": [ /* array of task objects from the generated plan */ ],
  "milestones": [ /* array of milestone objects */ ],
  "eventDaySchedule": [ /* array of schedule items */ ]
}
```

**Server behavior:**
1. Authenticate and verify event ownership.
2. Re-validate all submitted items against schema and business rules.
3. Insert validated items into the database using application-layer logic.
4. Use a transaction where possible to ensure atomicity.
5. Generate a `Plan accepted` notification for the user.
6. Return summary of created records.

**AI never performs the insertion.** Only application code performs database writes.

**Response 201:**

```json
{
  "success": true,
  "data": {
    "tasksCreated": 8,
    "milestonesCreated": 4,
    "scheduleItemsCreated": 6
  }
}
```

---

## 20. AI CHAT API

The AI assistant answers questions about the user's event using context loaded server-side. It does not write to the database.

### 20.1 Chat

```
POST /api/ai/chat
```

**Auth:** Required
**Ownership:** Verified — the `event_id` must belong to the authenticated user.

**Rate Limited:** Yes. See Section 26.

**Request body:**

```json
{
  "event_id": "uuid (required)",
  "message": "string (required, max 2000 chars)"
}
```

**Server behavior:**
1. Authenticate and verify event ownership.
2. Load minimal relevant event context via the Event Context Builder based on message intent.
3. Retrieve recent conversation history from `ai_conversations` / `ai_messages` where persistence is enabled.
4. Build prompt including system instructions, event context, conversation history, and the user's message.
5. Send to AI provider.
6. Validate response.
7. Optionally persist the new message and response to `ai_messages`.
8. Return the AI response.

**AI receives (sensitive data minimized):**
- Event summary (type, date, guest count, budget summary, utilization)
- Relevant context based on the question (tasks, milestones, vendors, budget — not raw guest contact data)
- Recent conversation history (bounded, not unlimited)

**OPEN DECISION:** Chat conversation persistence policy — always persisted, persisted only if conversation already exists, or optional.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "response": "string",
    "conversationId": "uuid | null"
  }
}
```

**Error responses:** Same AI error codes as Section 18.

---

## 21. EVENT CONTEXT BUILDER

The Event Context Builder is a server-side module (not an API endpoint) responsible for assembling the minimal context sent to the AI provider.

It must:
- Never send the entire database state
- Never send guest email addresses or phone numbers
- Never send raw authentication tokens
- Send summarized guest data (counts by RSVP status)
- Send task counts and critical/overdue tasks, not all task details unless relevant
- Load only the fields required to answer the AI's task

For budget questions, it loads: total budget, actual expenses, by-category breakdown, utilization percentage.

For prioritization questions, it loads: upcoming deadlines, overdue tasks, critical tasks, unbooked critical vendors.

For general planning questions, it loads: event summary including type, date, guest count, budget, theme, style.

The context builder is responsible for data minimization required by `08-SECURITY-AUTHORIZATION-SPECIFICATION.md` Section 22.

---

## 22. DASHBOARD API

The dashboard aggregates data across the user's events. It returns a summary view without paginating through all records individually.

### 22.1 Get Dashboard

```
GET /api/dashboard
```

**Auth:** Required
**Ownership:** Returns data scoped to the authenticated user only.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "upcomingEvents": [
      {
        "id": "uuid",
        "name": "string",
        "event_date": "YYYY-MM-DD",
        "type": "string",
        "status": "string",
        "daysRemaining": 45
      }
    ],
    "eventSummaries": [
      {
        "event_id": "uuid",
        "event_name": "string",
        "budgetUtilization": 64.0,
        "budgetStatus": "normal | warning | critical | over_budget",
        "totalTasks": 20,
        "completedTasks": 8,
        "overdueTasks": 2,
        "totalGuests": 250,
        "acceptedGuests": 120,
        "totalVendors": 6,
        "bookedVendors": 3,
        "upcomingDeadlines": []
      }
    ],
    "recentActivity": [],
    "riskIndicators": []
  }
}
```

**Notes:**
- Budget calculations in dashboard use the same deterministic server-side logic as the budget endpoint.
- The `upcomingEvents` list is bounded (OPEN DECISION: top 5 or top 10 nearest events by date).

---

## 23. EXPORT API

### Preferred approach: Client-side generation

The preferred approach is client-side generation with no backend endpoint required. The frontend retrieves event data via existing API endpoints and generates the PDF or ICS file using open-source client-side libraries.

This eliminates the need for a server-side export endpoint and avoids additional infrastructure.

### Optional: Server-side export

If client-side export is insufficient, the following server-side endpoints may be implemented:

```
POST /api/export/event/:id/pdf
POST /api/export/event/:id/ics
```

**Auth:** Required
**Ownership:** Verified — the event must belong to the authenticated user.

**Security:** A user must not be able to generate an export by providing another user's event ID.

**Response:** Binary file download with appropriate `Content-Type` and `Content-Disposition` headers.

**OPEN DECISION:** Whether server-side export is required for MVP or whether client-side is sufficient.

---

## 24. AUTHORIZATION MODEL

Every protected API endpoint follows a strict three-step authorization check:

```
Step 1: Authenticate
  → Resolve authenticated user from Supabase Auth session
  → If no valid session → 401 Unauthorized

Step 2: Resolve Resource
  → Look up the requested resource by ID
  → If not found → 404 Not Found

Step 3: Verify Ownership
  → Confirm resource belongs to authenticated user
  → If user does not own resource → 404 Not Found (not 403, to avoid leaking existence)
```

For child resources (tasks, vendors, guests, etc.):

```
  → Look up child resource
  → Resolve parent event from child
  → Verify event.user_id = authenticated user ID
  → If mismatch → 404 Not Found
```

**IDOR prevention:** A user changing the event ID or resource ID in a request URL must not gain access to another user's data.

**Server-side authority:** The server is always the authoritative decision maker. Frontend visibility controls (hiding edit buttons, filtering lists) are UX only — they are not security controls.

**Row Level Security:** Supabase RLS policies provide defense-in-depth. Application-layer authorization is the primary security boundary.

---

## 25. VALIDATION RULES

All input must be validated before use. Validation failures return HTTP 400 with error code `VALIDATION_ERROR`.

### General Rules

| Rule | Detail |
|---|---|
| Required fields | Must be present and non-null |
| String fields | Must be strings; trim whitespace before validation |
| String length | Enforce per-field maximums as defined in this document |
| Enum fields | Must match one of the allowed values |
| Date fields | Must be valid ISO 8601 dates (YYYY-MM-DD) |
| Time fields | Must be valid ISO 8601 times (HH:MM or HH:MM:SS) |
| Numeric fields | Must be numbers; min/max enforced as per field |
| UUID fields | Must be valid UUIDs |
| Email fields | Must be valid email format if provided |
| URL fields | Must be valid URL format if provided |

### OPEN DECISION — Validation Library

The specific validation library (Zod, Yup, Valibot, or other) is an implementation decision. Any library that supports schema definition and produces structured error messages is acceptable.

### Field-level Constraints Summary

| Field | Max Length |
|---|---|
| Event name | 200 characters |
| Event description | 2000 characters |
| Event location | 300 characters |
| Task title | 300 characters |
| Task description | 1000 characters |
| Milestone title | 300 characters |
| Vendor name | 200 characters |
| Guest name | 200 characters |
| Expense description | 500 characters |
| Notes fields | 1000 characters |
| AI chat message | 2000 characters |

### AI Output Validation

AI output is subject to two separate validation stages (Section 18 and Section 9 of `06-AI-SPECIFICATION.md`):

1. Schema validation — type correctness, required fields, enum correctness, numeric bounds
2. Business validation — dates relative to event, non-negative monetary values, chronological ordering

Invalid AI output is rejected. The server does not pass invalid AI output to the frontend.

---

## 26. RATE LIMITING

Rate limiting is applied at the API layer. No Redis is introduced.

Priority targets:

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/ai/generate-plan` | OPEN DECISION | OPEN DECISION |
| `POST /api/ai/chat` | OPEN DECISION | OPEN DECISION |
| `POST /api/export/...` (if server-side) | OPEN DECISION | OPEN DECISION |

**OPEN DECISION:** Exact rate limit thresholds. The implementation must use a lightweight approach compatible with Vercel's serverless function model (e.g., in-memory rate limiting per edge function instance, or Vercel's built-in rate limiting features if available).

Rate-limited responses return HTTP 429 with:
- Error code `RATE_LIMITED`
- `Retry-After` header indicating when to retry

---

## 27. PAGINATION

Pagination applies to collection endpoints that may return large result sets.

### Convention

| Parameter | Type | Default | Maximum |
|---|---|---|---|
| `limit` | integer | 50 | 100 |
| `offset` | integer | 0 | unbounded |

**OPEN DECISION:** `limit`/`offset` vs `page`/`perPage` convention. This document uses `limit`/`offset`. Whichever is chosen must be consistent across all paginated endpoints.

### Paginated Endpoints

- `GET /api/events`
- `GET /api/events/:eventId/tasks`
- `GET /api/events/:eventId/expenses`
- `GET /api/events/:eventId/vendors`
- `GET /api/events/:eventId/guests`
- `GET /api/notifications`
- AI chat message history (if persisted and exposed)

### Pagination Response

```json
"pagination": {
  "total": 250,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

---

## 28. ERROR HANDLING

All errors must use the standard error envelope (Section 4).

### General Error Rules

- Never return stack traces in production responses
- Never return SQL error messages in responses
- Never return API keys, tokens, or credentials in error responses
- Never reveal internal database structure
- Log detailed errors server-side; return safe messages client-side

### Safe User-Facing Messages

| Scenario | User-facing message |
|---|---|
| Validation failure | "Invalid request data. Please check your input." |
| Not authenticated | "Please log in to continue." |
| Not authorized | "The requested resource was not found." |
| Server error | "Something went wrong. Please try again later." |
| AI unavailable | "The AI assistant is temporarily unavailable. Please try again shortly." |

Detailed field-level validation messages may be included in the `details` object for `VALIDATION_ERROR` responses to assist frontend form rendering.

### AI-Specific Error Handling

When the AI provider fails:
- Implement retry with bounded back-off for transient failures (OPEN DECISION: retry count and delay)
- Do not retry on validation failures
- Return appropriate error codes from the table in Section 4
- Notify the user that AI is temporarily unavailable, not that the application has failed

---

## 29. IDEMPOTENCY

| Endpoint | Idempotent? | Notes |
|---|---|---|
| GET (all read endpoints) | Yes | Always safe to retry |
| POST /api/events | No | Creates a new record each call |
| POST /api/events/:id/tasks | No | Creates a new record each call |
| POST /api/tasks/:taskId/dependencies | Partial | Returns 409 on duplicate |
| POST /api/ai/generate-plan | No | Generates a new plan each call |
| POST /api/ai/plans/:planId/accept | OPEN DECISION | Should guard against double-acceptance |
| PATCH (all update endpoints) | Yes (partial update) | Re-applying same patch is safe |
| DELETE (all delete endpoints) | Partial | Deleting a non-existent resource returns 404 |

**OPEN DECISION:** Whether `POST /api/ai/plans/:planId/accept` implements an explicit idempotency check to prevent double-acceptance of the same plan.

---

## 30. SECURITY CHECKLIST

This checklist is grounded in `08-SECURITY-AUTHORIZATION-SPECIFICATION.md`.

### Authentication

- [ ] All protected routes require valid Supabase Auth session
- [ ] Session resolution is server-side only
- [ ] Client-supplied `user_id` is never trusted
- [ ] 401 returned for invalid or expired sessions

### Authorization

- [ ] Three-step auth check (authenticate → resolve → verify ownership) on every protected route
- [ ] Child resources verified via parent event ownership
- [ ] 404 returned for unauthorized resources (not 403)
- [ ] IDOR attack surface validated

### Input Validation

- [ ] All request bodies validated against schema before use
- [ ] All path parameters are valid UUIDs before database lookup
- [ ] String lengths enforced
- [ ] Enum values validated
- [ ] Date formats validated

### AI Security

- [ ] `GEMINI_API_KEY` is server-side only, never in browser bundle
- [ ] AI requests require authentication and event ownership check
- [ ] AI output is schema-validated before any use
- [ ] AI output is business-validated before persistence
- [ ] User prompt content treated as untrusted input
- [ ] System instructions cannot be overridden by user input
- [ ] No SQL, JavaScript, HTML, or shell commands from AI output are executed
- [ ] Guest contact data (email, phone) excluded from AI context

### Secrets & Environment

- [ ] No secrets committed to Git
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only
- [ ] `GEMINI_API_KEY` is server-only
- [ ] Client-side env vars (`NEXT_PUBLIC_*`) are intentionally public
- [ ] `.env.local` is in `.gitignore`

### Error Handling

- [ ] No stack traces in production responses
- [ ] No SQL errors exposed to clients
- [ ] No API keys in error responses
- [ ] Server-side error logging implemented

### Rate Limiting

- [ ] AI generation endpoint rate-limited
- [ ] AI chat endpoint rate-limited
- [ ] `Retry-After` header returned on 429

### Logging

- [ ] Passwords not logged
- [ ] Auth tokens not logged
- [ ] API keys not logged
- [ ] Full guest contact information not logged unnecessarily

### Data Deletion

- [ ] Event deletion cascades to all child records
- [ ] One explicit cascade strategy chosen and tested

### Export Security

- [ ] Export endpoints verify event ownership before generating data

### Notifications Security

- [ ] Notifications scoped to authenticated user only

---

## 31. API TEST MATRIX

This test matrix is grounded in `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md`.

### Authentication Tests

| ID | Endpoint | Scenario | Expected |
|---|---|---|---|
| T-AUTH-01 | Any protected route | No session token | 401 |
| T-AUTH-02 | Any protected route | Expired token | 401 |
| T-AUTH-03 | Any protected route | Valid token | Proceeds to authorization |

### Event Tests

| ID | Endpoint | Scenario | Expected |
|---|---|---|---|
| T-EVT-01 | `POST /api/events` | Valid request | 201, event created |
| T-EVT-02 | `POST /api/events` | Missing `name` | 400 VALIDATION_ERROR |
| T-EVT-03 | `POST /api/events` | Missing `type` | 400 VALIDATION_ERROR |
| T-EVT-04 | `POST /api/events` | Invalid `type` enum | 400 VALIDATION_ERROR |
| T-EVT-05 | `POST /api/events` | Missing `event_date` | 400 VALIDATION_ERROR |
| T-EVT-06 | `GET /api/events/:id` | Own event | 200 |
| T-EVT-07 | `GET /api/events/:id` | Another user's event | 404 |
| T-EVT-08 | `PATCH /api/events/:id` | Partial update | 200, updated |
| T-EVT-09 | `DELETE /api/events/:id` | Own event | 204 |
| T-EVT-10 | `DELETE /api/events/:id` | Another user's event | 404 |

### Authorization / IDOR Tests

| ID | Scenario | Expected |
|---|---|---|
| T-IDOR-01 | Access event with another user's event ID | 404 |
| T-IDOR-02 | Access task via path param pointing to another user's task | 404 |
| T-IDOR-03 | Access guest via path param pointing to another user's guest | 404 |
| T-IDOR-04 | Generate AI plan for another user's event | 404 |
| T-IDOR-05 | Export another user's event | 404 |

### Task Dependency Tests

| ID | Scenario | Expected |
|---|---|---|
| T-DEP-01 | Create valid dependency between two tasks in same event | 201 |
| T-DEP-02 | Create self-dependency (task depends on itself) | 409 CONFLICT |
| T-DEP-03 | Create circular dependency | 409 CONFLICT |
| T-DEP-04 | Create dependency between tasks in different events | 400 or 404 |
| T-DEP-05 | Create duplicate dependency | 409 CONFLICT |

### AI Tests

| ID | Endpoint | Scenario | Expected |
|---|---|---|---|
| T-AI-01 | `POST /api/ai/generate-plan` | Valid event | 200, plan returned |
| T-AI-02 | `POST /api/ai/generate-plan` | Another user's event | 404 |
| T-AI-03 | `POST /api/ai/generate-plan` | AI provider down | 503 AI_PROVIDER_UNAVAILABLE |
| T-AI-04 | `POST /api/ai/generate-plan` | AI returns invalid schema | 422 AI_SCHEMA_INVALID |
| T-AI-05 | `POST /api/ai/chat` | Valid message | 200, response |
| T-AI-06 | `POST /api/ai/chat` | Message exceeds 2000 chars | 400 VALIDATION_ERROR |
| T-AI-07 | AI chat | Budget question | Response does not invent financial totals |

### Budget Tests

| ID | Scenario | Expected |
|---|---|---|
| T-BUD-01 | Budget utilization < 80% | Status `normal` |
| T-BUD-02 | Budget utilization ≥ 80% | Status `warning` |
| T-BUD-03 | Budget utilization ≥ 90% | Status `critical` |
| T-BUD-04 | Budget utilization > 100% | Status `over_budget` |

---

## 32. FRONTEND INTEGRATION CONTRACT

This section defines the commitments the backend API makes to the frontend.

### Commitments

1. **All responses use the standard envelope** defined in Section 4. The frontend may unconditionally read `response.success`, `response.data`, `response.error`, and `response.pagination`.

2. **HTTP status codes are used consistently** per Section 5. The frontend may use status codes for error routing.

3. **401 means the session is expired or missing.** The frontend redirects to the login page.

4. **404 for missing or unauthorized resources.** The frontend shows a "not found" state.

5. **400 for validation errors.** The `error.details` object may contain field-level messages for form display.

6. **The `data` array is always an array for collection endpoints**, even if empty. The frontend never needs to null-check an expected array.

7. **The `pagination` object is always present for paginated endpoints**, even if all records fit on one page (`hasMore: false`).

8. **The frontend never receives invalid AI output.** If AI output fails validation, the server returns an error response. The frontend does not need to validate AI plan content.

9. **Dates are always ISO 8601 strings** (YYYY-MM-DD for dates, ISO 8601 for timestamps).

10. **Monetary values are always numbers** (not strings). Currency is always a separate string field.

### Breaking Change Policy

No URL versioning for MVP (see Section 34). Any endpoint that changes its response shape must be coordinated between frontend and backend at the same deployment.

---

## 33. API LOGGING

Safe API logging must record:

- Request method and path
- HTTP response status code
- Request timing / latency
- Non-sensitive resource identifiers (event ID, not user personal data)
- AI provider outcomes (success, failure type)

API logs must NOT contain:

- Passwords or authentication credentials
- Session tokens or refresh tokens
- API keys (Gemini, Supabase)
- Guest email addresses or phone numbers
- Full request bodies of mutation endpoints unless sanitized

---

## 34. API VERSIONING

**MVP decision:** No URL versioning (`/v1/` prefix) is required for the initial release.

Rationale: Minimal end-user-visible breaking changes are expected. Zero-cost MVP constraint favors simplicity.

If a v2 scope materializes, adopt `/api/v2/` prefix with a documented deprecation window.

---

## 35. API TRACEABILITY

| FRS ID | Method | Endpoint | Purpose |
|---|---|---|---|
| FR-AUTH-001 | (Supabase Auth) | — | Authentication passthrough |
| FR-EVENT-001 | GET | `/api/events` | List user events |
| FR-EVENT-001 | POST | `/api/events` | Create event |
| FR-EVENT-002 | GET | `/api/events/:id` | View event |
| FR-EVENT-003 | PATCH | `/api/events/:id` | Edit event |
| FR-EVENT-004 | DELETE | `/api/events/:id` | Delete event |
| FR-BUDGET-001 | GET | `/api/events/:id/budget` | Budget overview |
| FR-EXPENSE-001 | GET | `/api/events/:id/expenses` | List expenses |
| FR-EXPENSE-001 | POST | `/api/events/:id/expenses` | Add expense |
| FR-EXPENSE-002 | PATCH | `/api/expenses/:expenseId` | Edit expense |
| FR-EXPENSE-003 | DELETE | `/api/expenses/:expenseId` | Delete expense |
| FR-TASK-001 | GET | `/api/events/:id/tasks` | List tasks |
| FR-TASK-001 | POST | `/api/events/:id/tasks` | Create task |
| FR-TASK-002 | PATCH | `/api/tasks/:taskId` | Update task |
| FR-TASK-003 | DELETE | `/api/tasks/:taskId` | Delete task |
| FR-TASK-006 | POST | `/api/tasks/:taskId/dependencies` | Create dependency |
| FR-TASK-006 | DELETE | `/api/dependencies/:dependencyId` | Remove dependency |
| FR-TASK-006 | GET | `/api/tasks/:taskId/dependencies` | List dependencies |
| FR-TIMELINE-001 | GET | `/api/events/:id/timeline` | List milestones |
| FR-TIMELINE-001 | POST | `/api/events/:id/timeline` | Add milestone |
| FR-TIMELINE-002 | PATCH | `/api/timeline/:milestoneId` | Update milestone |
| FR-TIMELINE-003 | DELETE | `/api/timeline/:milestoneId` | Delete milestone |
| FR-VENDOR-001 | GET | `/api/events/:id/vendors` | List vendors |
| FR-VENDOR-001 | POST | `/api/events/:id/vendors` | Create vendor |
| FR-VENDOR-002 | PATCH | `/api/vendors/:vendorId` | Update vendor |
| FR-VENDOR-003 | DELETE | `/api/vendors/:vendorId` | Delete vendor |
| FR-GUEST-001 | GET | `/api/events/:id/guests` | List guests |
| FR-GUEST-001 | POST | `/api/events/:id/guests` | Create guest |
| FR-GUEST-002 | PATCH | `/api/guests/:guestId` | Update guest (RSVP) |
| FR-GUEST-003 | DELETE | `/api/guests/:guestId` | Delete guest |
| FR-SCHEDULE-001 | GET | `/api/events/:id/schedule` | List schedule |
| FR-SCHEDULE-001 | POST | `/api/events/:id/schedule` | Add schedule item |
| FR-SCHEDULE-002 | PATCH | `/api/schedule/:scheduleId` | Update schedule item |
| FR-SCHEDULE-003 | DELETE | `/api/schedule/:scheduleId` | Delete schedule item |
| FR-AI-001 | POST | `/api/ai/generate-plan` | Generate AI plan |
| FR-AI-005 | POST | `/api/ai/plans/:planId/accept` | Accept AI plan |
| FR-AI-006 | POST | `/api/ai/chat` | AI assistant chat |
| FR-NOTIFY-001 | GET | `/api/notifications` | List notifications |
| FR-NOTIFY-001 | PATCH | `/api/notifications/:id` | Mark notification read |
| FR-NOTIFY-002 | POST | `/api/notifications/mark-all-read` | Bulk mark read (optional) |
| FR-EXPORT-001 | (client-side) | — | Export event plan |
| FR-DASH-001 | GET | `/api/dashboard` | Dashboard aggregates |

---

## 36. ENDPOINT SUMMARY TABLE

| Method | Endpoint | Auth | Ownership | Rate Limited |
|---|---|---|---|---|
| GET | `/api/dashboard` | Yes | Yes | No |
| GET | `/api/events` | Yes | Yes | No |
| POST | `/api/events` | Yes | Yes | No |
| GET | `/api/events/:id` | Yes | Yes | No |
| PATCH | `/api/events/:id` | Yes | Yes | No |
| DELETE | `/api/events/:id` | Yes | Yes | No |
| GET | `/api/events/:eventId/preferences` | Yes | Yes | No |
| PUT | `/api/events/:eventId/preferences` | Yes | Yes | No |
| GET | `/api/events/:id/budget` | Yes | Yes | No |
| GET | `/api/events/:eventId/expenses` | Yes | Yes | No |
| POST | `/api/events/:eventId/expenses` | Yes | Yes | No |
| PATCH | `/api/expenses/:expenseId` | Yes | Yes | No |
| DELETE | `/api/expenses/:expenseId` | Yes | Yes | No |
| GET | `/api/events/:eventId/tasks` | Yes | Yes | No |
| POST | `/api/events/:eventId/tasks` | Yes | Yes | No |
| PATCH | `/api/tasks/:taskId` | Yes | Yes | No |
| DELETE | `/api/tasks/:taskId` | Yes | Yes | No |
| GET | `/api/tasks/:taskId/dependencies` | Yes | Yes | No |
| POST | `/api/tasks/:taskId/dependencies` | Yes | Yes | No |
| DELETE | `/api/dependencies/:dependencyId` | Yes | Yes | No |
| GET | `/api/events/:eventId/timeline` | Yes | Yes | No |
| POST | `/api/events/:eventId/timeline` | Yes | Yes | No |
| PATCH | `/api/timeline/:milestoneId` | Yes | Yes | No |
| DELETE | `/api/timeline/:milestoneId` | Yes | Yes | No |
| GET | `/api/events/:eventId/vendors` | Yes | Yes | No |
| POST | `/api/events/:eventId/vendors` | Yes | Yes | No |
| PATCH | `/api/vendors/:vendorId` | Yes | Yes | No |
| DELETE | `/api/vendors/:vendorId` | Yes | Yes | No |
| GET | `/api/events/:eventId/guests` | Yes | Yes | No |
| POST | `/api/events/:eventId/guests` | Yes | Yes | No |
| PATCH | `/api/guests/:guestId` | Yes | Yes | No |
| DELETE | `/api/guests/:guestId` | Yes | Yes | No |
| GET | `/api/events/:eventId/schedule` | Yes | Yes | No |
| POST | `/api/events/:eventId/schedule` | Yes | Yes | No |
| PATCH | `/api/schedule/:scheduleId` | Yes | Yes | No |
| DELETE | `/api/schedule/:scheduleId` | Yes | Yes | No |
| GET | `/api/notifications` | Yes | Yes | No |
| PATCH | `/api/notifications/:id` | Yes | Yes | No |
| POST | `/api/notifications/mark-all-read` | Yes | Yes | No |
| POST | `/api/ai/generate-plan` | Yes | Yes | Yes |
| POST | `/api/ai/plans/:planId/accept` | Yes | Yes | No |
| POST | `/api/ai/chat` | Yes | Yes | Yes |
| POST | `/api/export/event/:id/pdf` | Yes | Yes | OPEN DECISION |
| POST | `/api/export/event/:id/ics` | Yes | Yes | OPEN DECISION |

---

## 37. OPEN DECISIONS

The following items are unresolved and must be decided during implementation. Each must be resolved explicitly — no silent defaults.

| # | Decision | Options | Impact |
|---|---|---|---|
| OD-01 | Validation library | Zod, Yup, Valibot, custom | All validation code |
| OD-02 | Pagination convention | `limit`/`offset` vs `page`/`perPage` | All paginated endpoints |
| OD-03 | Event delete cascade | PostgreSQL ON DELETE CASCADE vs application-layer | Event deletion behavior |
| OD-04 | AI retry count and back-off | e.g., 2 retries with 1s/2s delay | AI resilience |
| OD-05 | AI plan acceptance idempotency | Enforce server-side check vs trust planId | Double-acceptance prevention |
| OD-06 | Chat conversation persistence | Always / conditional / none | ai_conversations and ai_messages tables |
| OD-07 | Rate limit thresholds | Exact req/min or req/hour values | Abuse protection |
| OD-08 | Rate limiting mechanism | Vercel Edge Config / in-process / middleware | Infrastructure |
| OD-09 | Event preferences — priorities field | string, string[], or JSONB | Database schema and API |
| OD-10 | Server-side export endpoints | Required for MVP vs client-side only | Backend scope |
| OD-11 | Past event dates | Allow or reject `event_date` in the past | Event creation validation |
| OD-12 | Notification mark-all-read | Implement endpoint or defer | Notifications scope |
| OD-13 | Preferences — not found behavior | Return 404 or return empty default object | Preferences API |
| OD-14 | Dashboard — upcoming events count | Top 5 or top 10 by nearest event date | Dashboard UX |
| OD-15 | Exact additional sort options | Field/direction combinations per resource | Filtering/sorting |

---

## QUALITY RULES

This document is:

- Professional, precise, and testable
- Consistent with `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`, `05-API-SPECIFICATION.md`, `06-AI-SPECIFICATION.md`, `07-UI-UX-SPECIFICATION.md`, `08-SECURITY-AUTHORIZATION-SPECIFICATION.md`, `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md`, `10-DEPLOYMENT-DEVOPS-SPECIFICATION.md`
- Free of implementation code
- Free of invented features not in source documents
- Free of duplicate endpoints
- Free of microservice architecture
- Readable by backend developers, frontend developers, and QA engineers

---

**IMPORTANT PROJECT RULE:**

AI must never perform Git commit or Git push operations. Git commit and Git push will always be performed manually by the project owner.

