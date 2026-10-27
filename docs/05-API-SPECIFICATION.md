# UtsavAI - API Specification

**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Source documents:** `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`
**Purpose:** Define the API contract for UtsavAI resource operations, AI integration, and notifications.
**Intended audience:** Backend developers, frontend engineers, QA, DevOps.

---

## 1. Document Information

- **Document name:** 05-API-SPECIFICATION.md
- **Product:** UtsavAI
- **Version:** 1.0
- **Status:** Draft
- **Source documents:** PRD, FRS, NFR, DATABASE
- **Purpose:** Define API contract
- **Intended audience:** Backend, Frontend, QA, DevOps

---

## 2. API Design Principles

- REST-style resource CRUD under `/api`
- JSON request/response format
- Authentication required for protected resources
- Server-side authorization on every protected resource
- User ownership enforced in API layer, not only frontend
- Input validation on every mutation endpoint
- Consistent error response structure
- Type-safe contracts; structured DTOs where helpful
- No sensitive information exposed in responses
- No API secrets exposed to browser
- Deterministic calculations; AI never computes authoritative financial figures

---

## 3. Base API Structure

```text
/api
├── /events
├── /tasks
├── /timeline
├── /vendors
├── /guests
├── /budget
├── /expenses
├── /schedule
├── /ai
├── /notifications
└── /dashboard
```

Multi-tenant isolation by event ownership: every resource endpoint accepts an event context or resource identifier derived from a user's event and verifies that the requesting user owns that event before responding or mutating.

---

## 4. Authentication

Authentication is handled through Supabase Auth. The server extracts the authenticated Supabase user from the request context (e.g., via the auth header / middleware) and never trusts a client-supplied user identifier.

Endpoints concerned with authentication identity are not listed here; identity is surfaced to clients through a stable JWT / session token on protected requests.

Protected requests require an authenticated session. Unauthenticated access returns `401`.

---

## 5. Authorization

Every protected resource route enforces three checks in order:

1. Authenticated user
2. Resource belongs to authenticated user's event
3. Operation authorized (read/update/delete permitted per endpoint)

A user cannot change an event ID in the request to gain access to another user's data. Server-side ownership verification is mandatory.

Authorization behaviors:

| Resource   | Read allowed           | Update allowed | Delete allowed |
|------------|------------------------|----------------|----------------|
| Event      | own events             | own events     | own events     |
| Task       | own event tasks        | own tasks      | own tasks      |
| Timeline   | own event milestones   | own milestones | own milestones |
| Vendor     | own event vendors      | own vendors    | own vendors    |
| Guest      | own event guests       | own guests     | own guests     |
| Expense    | own event expenses     | own expenses   | own expenses   |
| Schedule   | own event schedules    | own schedules  | own schedules  |
| Notification | notifications of own user | read state | mark read      |

---

## 6. Standard Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

Exclude from responses:

- Stack traces
- Database errors
- API keys
- Internal infrastructure details
- Sensitive user information

Error codes map directly to HTTP status codes (see Section 7). Clients handle errors generically; individual status code documentation is authoritative.

---

## 7. HTTP Status Codes

| Code | Meaning                                    | When to use                                |
|------|--------------------------------------------|-------------------------------------------|
| 200  | Successful request                        | GET / successful                           |
| 201  | Resource created                           | POST with id returned                      |
| 204  | Successful deletion                       | DELETE when no body returned              |
| 400  | Bad request                                | Malformed JSON, missing required fields    |
| 401  | Unauthenticated                           | Missing session or invalid credentials    |
| 403  | Forbidden                                  | Ownership check failed                    |
| 404  | Resource not found                         | Valid auth but missing resource           |
| 409  | Conflict                                   | Duplicate key, circular dependency, etc.  |
| 422  | Validation error                           | Value fails business validation            |
| 429  | Rate limited                               | Too many requests                         |
| 500  | Internal server error                      | Unexpected failure                       |
| 503  | Temporary dependency/service failure        | AI provider down, DB unavailable          |

---

## 8. EVENT API

### `GET /api/events`

Returns events owned by the authenticated user. Empty array if none.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "type": "...",
      "event_date": "...",
      "guest_count": ...,
      "total_budget": ...
    }
  ]
}
```

### `POST /api/events`

Create an event. Required fields: `name`, `type`, `event_date`. Allowed types: Wedding, Birthday, Community Event, Family Celebration, Custom Event.

Request body examples:

```json
{
  "name": "Sam & Priya Wedding",
  "type": "Wedding",
  "event_date": "2026-08-15",
  "description": "...",
  "location": "...",
  "start_time": "10:00",
  "end_time": "18:00",
  "guest_count": 250,
  "total_budget": 500000
}
```

### `GET /api/events/:id`

Returns a single owned event after ownership verification.

### `PATCH /api/events/:id`

Update event details. Requested fields validated against event schema and current values; updated fields persisted as a new version of the event record.

### `DELETE /api/events/:id`

Delete an event. Child records (tasks, vendors, guests, expenses, timeline, schedule, conversations, notifications) handled per `04-DATABASE.md` delete strategy. Response `204` on success, `403` if not owner, `404` if not found.

Validation:

- No deleting non-owned event
- No deleting non-existent event

---

## 9. TASK API

### `GET /api/events/:eventId/tasks`

List tasks for an owned event. Supports optional query params `status`, `priority`, `due_before`, `sort`. Chronological order by `due_date` then `created_at`.

### `POST /api/events/:eventId/tasks`

Create a task. Required: `title`, `priority`, `status`. Optional: `description`, `category`, `due_date`, `assigned_to`.

Validation rules:

- Priority must be one of Low, Medium, High, Critical
- Status must be one of Not Started, In Progress, Completed
- Due date optional but if provided must be valid date

### `PATCH /api/tasks/:taskId`

Update task. Ownership verified against task `event_id`. Allowed fields: `title`, `description`, `category`, `priority`, `status`, `due_date`.

### `DELETE /api/tasks/:taskId`

Delete task. Returns `204` on success. `403` if not owner.

---

## 10. TASK DEPENDENCY API

### `POST /api/events/:eventId/tasks/:taskId/dependencies`

Create a dependency from `taskId` to prerequisite `depends_on_task_id`.

Validation:

- Both tasks exist and belong to same event
- Cannot depend on self
- No circular dependency
- No duplicate dependency row

### `DELETE /api/dependencies/:dependencyId`

Remove a dependency. Returns `204` on success, `404` if missing.

### `GET /api/events/:eventId/tasks/:taskId/dependencies`

List dependencies affecting the given task (both outgoing and incoming). Sorted by `created_at`.

---

## 11. TIMELINE API

### `GET /api/events/:eventId/timeline`

Return planning timeline milestones for an owned event. Chronological by `date`, ascending.

### `POST /api/events/:eventId/timeline`

Add a milestone. Required: `title`, `date`. Optional: `description`, `status`.

### `PATCH /api/timeline/:milestoneId`

Update milestone. Allowed: `title`, `date`, `description`, `status`.

### `DELETE /api/timeline/:milestoneId`

Delete milestone. `204` on success, `403` if not owner, `404` if missing.

---

## 12. VENDOR API

### `GET /api/events/:eventId/vendors`

List vendors for owned event. Sorted by `category` then `booking_date`.

### `POST /api/events/:eventId/vendors`

Create vendor. Required: `name`, `category`. Optional: `contact`, `estimated_cost`, `actual_cost`, `notes`, `booking_date`.

Statuses: Researching, Shortlisted, Contacted, Negotiating, Booked, Completed, Cancelled.

### `PATCH /api/vendors/:vendorId`

Update vendor. Allowed fields: `name`, `category`, `contact`, `estimated_cost`, `actual_cost`, `status`, `notes`, `booking_date`.

### `DELETE /api/vendors/:vendorId`

Delete vendor. `204` on success, `403` if not owner, `404` if missing.

No marketplace or payment functionality.

---

## 13. GUEST API

### `GET /api/events/:eventId/guests`

List guests. Sorted by `name` then `group_name`. Supports query param `rsvp` filter (`pending`, `accepted`, `declined`) optionally.

### `POST /api/events/:eventId/guests`

Create guest. Required: `name`. Optional: `group_name`, `contact`, `meal_preference`, `special_requirements`, `notes`.

Validation:

- RSVP defaults to Pending; settable immediately after creation

### `PATCH /api/guests/:guestId`

Update guest. Allowed: `name`, `group_name`, `contact`, `rsvp_status`, `meal_preference`, `special_requirements`, `notes`.

### `DELETE /api/guests/:guestId`

Delete guest. `204` on success, `403` if not owner, `404` if missing.

---

## 14. BUDGET API

### `GET /api/events/:eventId/budget`

Return budget overview for owned event. Response includes:

- Total budget (from `events.total_budget`)
- Planned amount per category
- Actual spending per category
- Remaining budget
- Utilization percentage
- Budget categories list
- Budget warnings (one per rule if triggered)

All financial values computed deterministically by application logic from source data stored in `budget_categories` and `expenses` tables. Never ask AI to calculate these totals.

Response example:

```json
{
  "success": true,
  "data": {
    "total_budget": 500000,
    "planned_categories": [...],
    "actual_spent": 465000,
    "remaining": 35000,
    "utilization": 93.0,
    "warnings": ["Budget approaching critical level (93%)"]
  }
}
```

Categories returned include both `global` predefined categories and any event-specific additions. The predefined enum values are global defaults.

---

## 15. EXPENSE API

### `POST /api/events/:eventId/expenses`

Create expense. Required: `description`. Optional: `category`, `planned_amount`, `actual_amount`, `date`, `notes`.

Validation:

- Amounts cannot be negative
- `planned_amount` and `actual_amount` defaults to 0 when provided
- `category` must reference existing budget category for that event
- `date` valid date

### `GET /api/events/:eventId/expenses`

List expenses sorted by `date` descending. Supports `category`, `limit`, `offset` query params.

### `PATCH /api/expenses/:expenseId`

Update expense. Allowed fields: `description`, `category`, `planned_amount`, `actual_amount`, `date`, `notes`. Recomputes budget totals server-side.

### `DELETE /api/expenses/:expenseId`

Delete expense. Server recompute affected budget fields; if no remaining expenses, clear `actual_amount`. `204` on success, `403` if not owner, `404` if missing.

---

## 16. EVENT-DAY SCHEDULE API

### `GET /api/events/:eventId/schedule`

Return event-day schedule entries chronological by `scheduled_time`. Requires matching `event_date` to today for filtering relevance; broader retrieval allowed so client can render date range regardless.

### `POST /api/events/:eventId/schedule`

Add schedule entry. Required: `activity`, `scheduled_time`. Optional: `description`, `responsible_vendor_id`, `responsible_person`.

### `PATCH /api/schedule/:scheduleId`

Update schedule entry. Allowed: `activity`, `scheduled_time`, `description`, `responsible_vendor_id`, `responsible_person`.

### `DELETE /api/schedule/:scheduleId`

Delete schedule entry. `204` on success, `403` if not owner, `404` if missing.

Distinguish from planning timeline: this endpoint operates on the actual event date, returns hourly entries, and never exposes pre-planning milestones.

---

## 17. AI PLAN GENERATION API

### `POST /api/ai/generate-plan`

Generate an event planning proposal from structured event input. The request body contains event summary data only — names, dates, budget totals, desired priorities, etc.

Request:

```json
{
  "eventSummary": {
    "name": "...",
    "type": "...",
    "event_date": "...",
    "guest_count": ...,
    "total_budget": ...,
    "preferences": {...}
  }
}
```

Conceptual flow:

```
Client
↓ POST
API
↓ Authenticate + validate
↓ Build context from eventSummary
↓ Apply planning rules
↓ Build prompt
↓ AI provider
↓ Structured response
↓ Schema validation
↓ Business validation
↓ Return plan
```

The generated plan may contain: tasks, milestones, budget allocations, vendor recommendations, guest checklist, risk reminders. Return the validated payload for client review.

The AI must NOT write to the database.

Responses:

```json
{
  "success": true,
  "data": {
    "planId": "...",
    "generatedAt": "...",
    "tasks": [...],
    "milestones": [...],
    "budgetAllocations": [...],
    "recommendations": "...",
    "riskReminders": [...]
  }
}
```

Error codes:

- `AI_PROVIDER_UNAVAILABLE` -> `503`
- `AI_TIMEOUT` -> `503`
- `AI_RATE_LIMITED` -> `429`
- `AI_SCHEMA_INVALID` -> `422`
- `AI_BUSINESS_INVALID` -> `422`

---

## 18. ACCEPT AI PLAN API

### `POST /api/ai/plans/:planId/accept`

Persist AI-generated plan after user acceptance. Generated tasks/milestones/budget allocations inserted into their respective tables with references resolved to the event. Schema validation and business validation applied during insertion; invalid items skipped or rejected with explicit errors attached to the plan.

The important behavior:

```
Generated plan
↓ User reviews
↓ User accepts (or partially edits)
↓ Application validates
↓ Application persists tasks, milestones, budget allocations
```

AI model itself never executes persistence; this endpoint calls application-side persistence services.

Response:

```json
{
  "success": true,
  "data": {
    "planId": "...",
    "status": "accepted",
    "persistedAt": "..."
  }
}
```

Error handling:

- Persistence failure propagates validation errors back as `422` with specific item-level errors
- Already-existing conflicting entities reported as `409` with message indicating conflict reason

Open decision: exact response shape and behavior detail — acceptable draft definition; can adjust at implementation phase.

---

## 19. AI CHAT API

### `POST /api/ai/chat`

Conversational assistant endpoint. Request:

```json
{
  "eventId": "...",
  "message": "What should I prioritize this week?"
}
```

Server flow:

1. Authenticate
2. Verify event ownership for given `eventId`
3. Load relevant structured context: event type, guest count, budget, spent amounts, categories, tasks, timeline, vendors, guests, remaining time
4. Apply planning rules
5. Build prompt with relevant data only
6. Call AI provider
7. Validate response schema
8. Return sanitized response to client
9. If conversation state required, persist conversation + user message (optional; response instructs client whether conversation was recorded)

Do not send entire database per request; load only context relevant to event.

Responses follow standard success/error format. Error codes correspond to AI provider failures as defined above.

---

## 20. AI ERROR HANDLING

Defined behaviors:

| Failure scenario               | HTTP | Code                  | Client guidance                |
|-------------------------------|------|----------------------|--------------------------------|
| AI provider unavailable       | 503  | `AI_PROVIDER_UNAVAILABLE` | Show error state; suggest retry |
| Timeout                       | 503  | `AI_TIMEOUT`         | Show transient state; retry available |
| Rate limit                    | 429  | `AI_RATE_LIMITED`    | Retry after backoff hint       |
| Invalid AI response           | 422  | `AI_SCHEMA_INVALID` | Show partial result if schema matches |
| Schema validation failure     | 422  | `AI_SCHEMA_INVALID`  | Surface user-visible error     |
| Business validation failure   | 422  | `AI_BUSINESS_INVALID`| Allow manual correction         |
| Empty response                | 422  | `AI_EMPTY_RESPONSE`  | Show retry prompt              |
| Temporary provider failure    | 503  | `AI_TEMPORARY_FAILURE` | Retry later                  |

Frontend must preserve user input during AI states and provide appropriate feedback states.

---

## 21. NOTIFICATION API

### `GET /api/notifications`

List notifications for authenticated user. Sorted by `created_at` descending. Supports `unread_only` query param. Returns 200 with array or empty array.

### `PATCH /api/notifications/:id`

Update notification. Only field updatable: `read` boolean. `200` on success, `403` if notification does not belong to user, `404` if missing.

### `POST /api/notifications/:id/mark-all-read` (optional)

Bulk mark all unread notifications as read. One per requirement only if FRS supports it explicitly. Otherwise omitted.

---

## 22. DASHBOARD API

Dedicated aggregation endpoint justified because dashboard data requires many queries combined into one payload.

### `GET /api/dashboard`

Return aggregated dashboard data for authenticated user. Response includes:

- Upcoming events summary
- Budget overview ( totals, utilization, warnings )
- Task progress counts (not started / in progress / completed )
- Upcoming deadlines list
- Risk indicators
- Guest overview counts
- Vendor overview counts
- Recent activity feed

This endpoint intentionally combines multiple read operations into one network round trip.

---

## 23. EXPORT API

Export requirements come from PRD Section 6.15. Export formats: PDF and ICS calendar file.

Export possibilities:

- Client-side generation: client collects all required data, generates export locally using free open-source libraries. No dedicated API endpoint required.
- Server-side export: dedicated export endpoint produces downloadable files.

Recommended approach: prefer client-side generation to avoid backend complexity and licensing cost. Document chosen approach as OPEN DECISION only if server-side export becomes required by roadmap.

If server-side export IS used: define endpoint e.g. `POST /api/export/event/:id/pdf` and `POST /api/export/event/:id/ics`. Response includes file bytes or redirect to hosted URL. `503` if generation exceeds resource threshold.

Supported exports always include at minimum: event summary, event info, budget, expenses, tasks, timeline, vendors, guests, event-day schedule.

ICS file must produce valid calendar events with proper UID, DTSTART, SUMMARY, DESCRIPTION fields. Date range bounded to event `event_date`.

PDF content must include structured event summary sections with section headings and tables, no copy-pasted UI layout.

---

## 24. PAGINATION

Pagination defined for collections potentially large:

- Guests
- Tasks
- Expenses
- Vendors
- Notifications
- AI messages (where applicable)

Mechanism: query parameters `limit` and `offset` (and modern equivalents `page` and `perPage`). Response includes `pagination`:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

MVP consideration: expected data sizes small; pagination still implemented for scale but pages typically yield <50 items. Simple offset pagination sufficient.

No complex cursor pagination unless data grows significantly.

---

## 25. SORTING AND FILTERING

Endpoints support filters where UI requires them:

Tasks endpoint: `status`, `priority`, `due_before`, `sort`
Guests endpoint: `rsvp` (`pending`, `accepted`, `declined`), `group_name`
Expenses endpoint: `category`, `date`, `date_from`, `date_to`
Vendors endpoint: `category`, `status`, `sort`
Timeline endpoint: `date`, `status`, `sort`
Notifications endpoint: `unread_only`

Additional filters supported where justified by product need documented elsewhere. Do not invent filters not requested by FRS/PRD.

---

## 26. VALIDATION

Every mutation endpoint validates:

- Required fields present
- Field types correct
- Enum values match supported enumerations
- Dates valid and within reasonable ranges
- Numeric values non-negative where required
- String lengths within limits
- Foreign keys reference valid records
- Ownership satisfied
- Relationships consistent (no orphan records)

Validation performed on both request parsing and database insert stages. Second stage catches cases bypassing first stage.

Enums are centralized definitions shared between API and database models (see DATABASE document).

---

## 27. RATE LIMITING

Rate limiting prioritized for:

- AI plan generation
- AI chat
- Authentication-sensitive operations (login is mostly Supabase Auth)
- Export generation if server-side

Exact thresholds unknown; OPEN DECISION where not specified by source documents. Implement basic token-bucket rate limiting at API gateway boundary; do not introduce Redis solely for theoretical scalability.

Expected token bucket: generous MVP budget, strict against abuse, backoff with `Retry-After` header for `429` responses.

---

## 28. API SECURITY

- Authentication via Supabase session token
- Authorization on every route
- Input validation on every endpoint
- Output sanitization escaping known dangerous payloads
- CSRF protection: stateless bearer tokens preferred for API; session cookies with SameSite
- Secrets managed via environment variables; never committed or served to browser
- User data isolation enforced at API layer
- Secure error handling never leaks internals
- No unauthenticated internal network access from browser

---

## 29. API LOGGING

Safe logging of API operations includes:

- Request type
- Endpoint path
- Success/failure status
- Timing and latency
- Non-sensitive identifiers where appropriate

Logs must NOT contain:

- Passwords or login credentials
- Session tokens or refresh tokens
- API keys
- Sensitive guest contact information
- Full private AI conversations unless explicitly required

Avoid logging full bodies of mutation requests; log sanitized bodies if necessary for debugging.

---

## 30. API PERFORMANCE

Expectations:

- Efficient queries, index usage reflected in 25 indexes
- Avoid N+1 queries; batch related reads
- Minimize redundant requests across resource views
- Appropriate payload size; strip unnecessary fields
- Pagination where required
- AI request efficiency: load only context needed, never whole dataset
- Caching only where justified (e.g. dashboard aggregates potentially stale but bounded windows)

No Redis cache added solely for theoretical scalability.

---

## 31. API VERSIONING

MVP decision: no URL versioning (`/v1/` prefix) required for initial release.

Rationale: minimal end-user visible breaking changes expected; zero-cost MVP constraint favors simplicity. Any breaking change gets Bump API version concurrently with release and minor deprecation window documented in release notes.

If v2 scope materializes later, adopt `/v2/` pattern with deprecation window documented publicly.

---

## 32. API TRACEABILITY

| FRS ID | API Endpoint | Method | Purpose | Auth | Ownership Check |
|---|---|---|---|---|---|
| FR-AUTH-001 | (auth passthrough) | `GET` | Resolve current user | Yes | N/A |
| FR-EVENT-001 | `/api/events` | `GET` | List user events | Yes | Yes |
| FR-EVENT-001 | `/api/events` | `POST` | Create event | Yes | Yes |
| FR-EVENT-002 | `/api/events/:id` | `GET` | View event | Yes | Yes |
| FR-EVENT-003 | `/api/events/:id` | `PATCH` | Edit event | Yes | Yes |
| FR-EVENT-004 | `/api/events/:id` | `DELETE` | Delete event | Yes | Yes |
| FR-BUDGET-001 | `/api/events/:id/budget` | `GET` | Budget overview | Yes | Yes |
| FR-EXPENSE-001 | `/api/events/:id/expenses` | `POST` | Add expense | Yes | Yes |
| FR-TASK-001 | `/api/events/:id/tasks` | `GET` | List tasks | Yes | Yes |
| FR-TASK-001 | `/api/events/:id/tasks` | `POST` | Create task | Yes | Yes |
| FR-TASK-006 | `/api/tasks/:taskId/dependencies` | `POST` | Create dependency | Yes | Yes |
| FR-TASK-006 | `/api/dependencies/:dependencyId` | `DELETE` | Remove dependency | Yes | Yes |
| FR-TASK-006 | `/api/events/:id/tasks/:taskId/dependencies` | `GET` | List dependencies | Yes | Yes |
| FR-TIMELINE-001 | `/api/events/:id/timeline` | `GET` | List milestones | Yes | Yes |
| FR-TIMELINE-001 | `/api/events/:id/timeline` | `POST` | Add milestone | Yes | Yes |
| FR-VENDOR-001 | `/api/events/:id/vendors` | `GET` | List vendors | Yes | Yes |
| FR-VENDOR-001 | `/api/events/:id/vendors` | `POST` | Create vendor | Yes | Yes |
| FR-GUEST-001 | `/api/events/:id/guests` | `GET` | List guests | Yes | Yes |
| FR-GUEST-001 | `/api/events/:id/guests` | `POST` | Create guest | Yes | Yes |
| FR-SCHEDULE-001 | `/api/events/:id/schedule` | `GET` | List schedules | Yes | Yes |
| FR-SCHEDULE-001 | `/api/events/:id/schedule` | `POST` | Create schedule | Yes | Yes |
| FR-AI-001 | `/api/ai/generate-plan` | `POST` | Generate plan | Yes | Yes |
| FR-AI-006 | `/api/ai/chat` | `POST` | Assistant chat | Yes | Yes |
| FR-NOTIFY-001 | `/api/notifications` | `GET` | List notifications | Yes | Yes |
| FR-NOTIFY-001 | `/api/notifications/:id` | `PATCH` | Update notification | Yes | Yes |
| FR-NOTIFY-001 | `/api/notifications/:id/mark-all-read` | `POST` | Bulk mark read (optional) | Yes | Yes |
| FR-EXPORT-001 | (client-side) | — | Export event plan | No | N/A |
| FR-DASH-001 | `/api/dashboard` | `GET` | Dashboard aggregate | Yes | Yes |
| FR-PERSONALIZE-001 | (cached suggestions) | `GET` | Personalized preferences | Yes | Yes |

---

## 33. API ENDPOINT SUMMARY

| Method | Endpoint | Purpose | Auth | Ownership Check |
|---|---|---|---|---|
| GET | `/api/dashboard` | Aggregated dashboard data | Yes | Yes |
| GET | `/api/events` | List user events | Yes | Yes |
| POST | `/api/events` | Create event | Yes | Yes |
| GET | `/api/events/:id` | Get event | Yes | Yes |
| PATCH | `/api/events/:id` | Update event | Yes | Yes |
| DELETE | `/api/events/:id` | Delete event | Yes | Yes |
| GET | `/api/events/:id/budget` | Budget overview | Yes | Yes |
| GET | `/api/events/:id/expenses` | List expenses | Yes | Yes |
| POST | `/api/events/:id/expenses` | Create expense | Yes | Yes |
| PATCH | `/api/expenses/:expenseId` | Update expense | Yes | Yes |
| DELETE | `/api/expenses/:expenseId` | Delete expense | Yes | Yes |
| GET | `/api/events/:id/tasks` | List tasks | Yes | Yes |
| POST | `/api/events/:id/tasks` | Create task | Yes | Yes |
| PATCH | `/api/tasks/:taskId` | Update task | Yes | Yes |
| DELETE | `/api/tasks/:taskId` | Delete task | Yes | Yes |
| POST | `/api/tasks/:taskId/dependencies` | Create dependency | Yes | Yes |
| DELETE | `/api/dependencies/:dependencyId` | Remove dependency | Yes | Yes |
| GET | `/api/tasks/:taskId/dependencies` | List dependencies | Yes | Yes |
| GET | `/api/events/:id/timeline` | List milestones | Yes | Yes |
| POST | `/api/events/:id/timeline` | Add milestone | Yes | Yes |
| PATCH | `/api/timeline/:milestoneId` | Update milestone | Yes | Yes |
| DELETE | `/api/timeline/:milestoneId` | Delete milestone | Yes | Yes |
| GET | `/api/events/:id/vendors` | List vendors | Yes | Yes |
| POST | `/api/events/:id/vendors` | Create vendor | Yes | Yes |
| PATCH | `/api/vendors/:vendorId` | Update vendor | Yes | Yes |
| DELETE | `/api/vendors/:vendorId` | Delete vendor | Yes | Yes |
| GET | `/api/events/:id/guests` | List guests | Yes | Yes |
| POST | `/api/events/:id/guests` | Create guest | Yes | Yes |
| PATCH | `/api/guests/:guestId` | Update guest | Yes | Yes |
| DELETE | `/api/guests/:guestId` | Delete guest | Yes | Yes |
| GET | `/api/events/:id/schedule` | List schedules | Yes | Yes |
| POST | `/api/events/:id/schedule` | Add schedule | Yes | Yes |
| PATCH | `/api/schedule/:scheduleId` | Update schedule | Yes | Yes |
| DELETE | `/api/schedule/:scheduleId` | Delete schedule | Yes | Yes |
| POST | `/api/ai/generate-plan` | Generate AI plan | Yes | Yes |
| POST | `/api/ai/plans/:planId/accept` | Accept AI plan | Yes | Yes |
| POST | `/api/ai/chat` | AI assistant chat | Yes | Yes |
| GET | `/api/notifications` | List notifications | Yes | Yes |
| PATCH | `/api/notifications/:id` | Update notification | Yes | Yes |
| POST | `/api/notifications/:id/mark-all-read` | Mark all read (optional) | Yes | Yes |
| POST | `/api/export/event/:id/pdf` | Server-side PDF export (optional) | Yes | Yes |
| POST | `/api/export/event/:id/ics` | Server-side ICS export (optional) | Yes | Yes |

---

## 34. OPEN DECISIONS

- Exact pagination parameter convention (`limit`/`offset` vs `page`/`perPage`)
- Whether server-side export endpoint required for MVP
- Rate limit exact thresholds
- Chat conversation persistence policy (always persisted, conditional, or skipped)
- Exact additional filters supported by collection endpoints
- Error message text (safe default set here; detailed per-endpoint can refine later)
- Whether some health-check or system metrics endpoint needed later

---

## 35. FINAL API CHECKLIST

### Authentication

- [x] Authentication defined
- [x] Protected routes defined
- [x] Authorization defined

### CRUD

- [x] Events
- [x] Tasks
- [x] Timeline
- [x] Vendors
- [x] Guests
- [x] Expenses
- [x] Schedule
- [x] Notifications

### AI

- [x] Plan generation
- [x] Plan validation
- [x] Plan acceptance
- [x] Context-aware chat
- [x] Error handling
- [x] Retry behavior

### Security

- [x] Ownership checks
- [x] Input validation
- [x] Safe errors
- [x] Secret protection
- [x] Rate limiting requirements

### Quality

- [x] Consistent response format
- [x] Status codes
- [x] Traceability
- [x] Performance considerations

Do not mark items `[x]` unless already verified against source documents.

---

## QUALITY RULES

Professional, precise, testable, developer-readable, frontend-readable, backend-readable, QA-readable.

Consistent with PRD, FRS, NFR, DATABASE specification.

Free of duplicate endpoints.

Free of unnecessary APIs.

Free of implementation code.

Free of invented features.

Save as:

```text
docs/05-API-SPECIFICATION.md
```

Do not modify application source code.

IMPORTANT PROJECT RULE:

**AI must never perform Git commit or Git push operations. Git commit and Git push will always be performed manually by the project owner.**
