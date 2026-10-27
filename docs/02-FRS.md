# UtsavAI - Functional Requirements Specification

**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Purpose:** Convert UtsavAI PRD into precise, testable functional requirements.
**Source:** UtsavAI PRD (`docs/01-PRD.md`)
**Intended audience:** Developers, QA, product reviewers.

---

## 1. Document Information

- **Document name:** 02-FRS.md
- **Product:** UtsavAI
- **Version:** 1.0
- **Status:** Draft
- **Source document:** UtsavAI PRD
- **Intended audience:** Development team, QA team

---

## 2. Functional Requirement Convention

Each functional requirement uses unique identifier:

```text
FR-<MODULE>-<NNN>
```

Examples:

```text
FR-AUTH-001
FR-EVENT-001

FR-DASH-001

FR-BUDGET-001

FR-EXPENSE-001

FR-TASK-001

FR-TIMELINE-001

FR-VENDOR-001

FR-GUEST-001

FR-SCHEDULE-001

FR-AI-001

FR-NOTIFY-001

FR-EXPORT-001

FR-SETTINGS-001
```

Each requirement must be:

- Specific
- Testable
- Unambiguous
- Implementation-independent where possible

---

## 3. User Roles

### Guest User

Capabilities:

- View public pages (Home, About, Features, FAQ)
- Explore product
- Start planning (navigate to registration/login)

### Registered User

Capabilities:

- Create events
- Edit events
- Delete events
- Manage budget
- Manage expenses
- Manage tasks
- Manage timeline
- Manage vendors
- Manage guests
- Manage event-day schedule
- Use AI planning
- Use AI assistant
- View notifications
- Export event plan
- Manage settings

### Administrator

Optional / Future scope unless required by PRD.

- Marked MVP / Optional / Future where applicable.

---

## 4. Authentication Requirements

Requirements for:

- Registration
- Login
- Logout
- Session state
- Protected application routes
- Authentication errors
- Form validation
- Password handling
- Password reset
- Unauthorized access
- Authentication persistence

Each requirement explains:

- Actor
- Preconditions
- Trigger
- Expected behavior
- Error behavior
- Postcondition

Implementation-specific details deferred to later docs; PRD does not mandate a specific authentication implementation.

### FR-AUTH-001: User Registration

- **Actor:** Guest
- **Preconditions:** None (public route)
- **Trigger:** User submits registration form
- **Expected behavior:** Valid name, email, password accepted; account created; user authenticated; data persisted.
- **Error behavior:** Invalid email, weak password, missing fields -> field-level errors.
- **Postcondition:** User has session; can access protected pages.

### FR-AUTH-002: User Login

- **Actor:** Guest / Registered User
- **Preconditions:** Account exists
- **Trigger:** User submits credentials
- **Expected behavior:** Valid credentials -> session established; invalid -> error.
- **Error behavior:** Invalid credentials -> clear error message; rate limits if configured.
- **Postcondition:** Session active.

### FR-AUTH-003: User Logout

- **Actor:** Registered User
- **Preconditions:** Authenticated session
- **Trigger:** User logs out
- **Expected behavior:** Session ended; protected content inaccessible.
- **Postcondition:** User returned to public state.

### FR-AUTH-004: Protected Routes

- **Actor:** Registered User
- **Preconditions:** Authenticated session required
- **Trigger:** User navigates to protected route without session
- **Expected behavior:** Redirect to login; return URL preserved.
- **Postcondition:** Authenticated user only.

### FR-AUTH-005: Unauthorized Access

- **Actor:** Registered User
- **Preconditions:** Authenticated user, but not owner
- **Trigger:** User attempts access to another user's event
- **Expected behavior:** Access denied; no data exposed.
- **Postcondition:** Ownership enforced.

---

## 5. Event Management Requirements

Requirements for:

- Create event
- View event
- Edit event
- Delete event
- Event selector
- Multiple events
- Event type
- Event name
- Description
- Date
- Start time
- End time
- Location
- Expected guests
- Total budget
- Theme
- Style
- Priorities
- Special requirements

### FR-EVENT-001: Create Event

- **Actor:** Registered User
- **Preconditions:** Authenticated
- **Trigger:** User creates event
- **Expected behavior:** Event created and associated with authenticated user.
- **Required info:** Event name, event type, event date.
- **Optional info:** Description, location, start/end time, guest count, budget, preferences.
- **Postcondition:** Event appears in event list; dashboard updated.

### FR-EVENT-002: View Event

- **Actor:** Registered User
- **Preconditions:** Event exists, owned by user
- **Trigger:** User opens event
- **Expected behavior:** Event details displayed.
- **Postcondition:** User sees event record.

### FR-EVENT-003: Edit Event

- **Actor:** Registered User
- **Preconditions:** Event owned by user
- **Trigger:** User updates event
- **Expected behavior:** Changes persisted.
- **Postcondition:** Event reflects changes.

### FR-EVENT-004: Delete Event

- **Actor:** Registered User
- **Preconditions:** Event owned by user
- **Trigger:** User deletes event
- **Expected behavior:** Event and related data removed or orphaned per product decision.
- **Postcondition:** Event removed from user's list.

### FR-EVENT-005: Event Validation

- **Actor:** Registered User
- **Preconditions:** Creating/editing event
- **Trigger:** User submits input
- **Expected behavior:** Required fields, valid date, valid time range, valid guest count enforced.
- **Postcondition:** Invalid data not persisted.

---

## 6. Onboarding Requirements

Complete onboarding flow:

- Step 1: Event type
- Step 2: Event details
- Step 3: Budget
- Step 4: Preferences
- Step 5: AI plan generation
- Step 6: Plan review
- Step 7: Accept plan

### Onboarding Requirements

- Navigation between steps must be supported; validation per step; back navigation allowed; loading/error/retry states handled; generated plan structure defined; review and accept behavior defined.

### When AI Plan Accepted

- Tasks, timeline milestones, budget allocations, notifications must be created/managed accordingly.
- Duplicate plan insertion prevented where applicable.

---

## 7. Dashboard Requirements

Dashboard must provide immediate overview of:

- Events
- Event progress
- Budget
- Tasks
- Upcoming deadlines
- Guests
- Vendors
- Notifications
- Planning risks

### FR-DASH-001: Dashboard Overview

- **Actor:** Registered User
- **Preconditions:** User has events
- **Trigger:** User opens dashboard
- **Expected behavior:** Dashboard shows event overview, budget progress, task progress, upcoming deadlines, warnings, notifications, recent activity.
- **Postcondition:** Dashboard reflects current event state; metrics deterministic.

Metrics must be calculated, not hardcoded.

---

## 8. Budget Requirements

### FR-BUDGET-001: Budget Overview

- **Actor:** Registered User
- **Preconditions:** Event exists
- **Trigger:** User views budget
- **Expected behavior:** Total budget, categories, planned allocations, actual spending, remaining, utilization displayed.

### FR-BUDGET-002: Deterministic Calculations

- **Formula:** Remaining Budget = Total Budget - Actual Expenses
- **Formula:** Budget Utilization = Actual Expenses / Total Budget × 100

- Calculations performed by application code, not AI.
- AI may recommend adjustments, not authoritative.

### FR-BUDGET-003: Budget Warnings

- Below 80%: Normal
- 80% to below 90%: Approaching limit
- 90% or above: Critical

---

## 9. Expense Requirements

### FR-EXPENSE-001: Add Expense

- **Actor:** Registered User
- **Preconditions:** Event exists
- **Trigger:** User adds expense
- **Expected behavior:** Expense category, planned amount, actual amount, date, notes stored.

### FR-EXPENSE-002: Edit Expense

- **Actor:** Registered User
- **Preconditions:** Expense exists
- **Trigger:** User edits expense
- **Expected behavior:** Expense updated; budget totals recomputed.

### FR-EXPENSE-003: Delete Expense

- **Actor:** Registered User
- **Preconditions:** Expense exists
- **Trigger:** User deletes expense
- **Expected behavior:** Expense removed; budget totals recalculated.

### FR-EXPENSE-004: Expense Validation

- Negative values rejected; invalid numbers rejected; missing required fields rejected; excessive values rejected; invalid dates rejected.

---

## 10. Task Requirements

### FR-TASK-001: Create Task

- **Actor:** Registered User
- **Preconditions:** Event exists
- **Trigger:** User creates task
- **Expected behavior:** Task name, description, category, owner, due date, priority, status stored.

### FR-TASK-002: Task Status Management

- Statuses: Not Started, In Progress, Completed.

### FR-TASK-003: Task Priority Management

- Priorities: Low, Medium, High, Critical.

### FR-TASK-004: Task Completion

- **Trigger:** User marks task completed
- **Expected behavior:** Status -> Completed; downstream effects handled deterministically.

### FR-TASK-005: Overdue Behavior

- Task past due date and not completed -> overdue state / notification.

---

## 11. Task Dependency Requirements

### FR-TASK-006: Task Dependency Management

- Creating dependency supported.
- Removing dependency supported.
- Displaying dependency supported.
- Dependency validation applied.
- Invalid dependencies prevented.
- Circular dependencies prevented.
- Dependency-aware task ordering applied.

---

## 12. Timeline Requirements

### FR-TIMELINE-001: Planning Timeline

- Supports milestones, dates, descriptions, status, ordering, add/edit/delete.
- Weeks/months before event.

### FR-TIMELINE-002: Event-Day Schedule

- Hour-by-hour execution on event day.
- Time, activity, description, ordering, responsible person/vendor where applicable.

---

## 13. Vendor Requirements

### FR-VENDOR-001: Vendor CRUD

- Add, view, edit, delete vendor records.
- Fields: vendor name, category, contact, estimated cost, actual cost, status, notes, booking date.

### FR-VENDOR-002: Vendor Status Management

- Statuses: Researching, Shortlisted, Contacted, Negotiating, Booked, Completed, Cancelled.

### FR-VENDOR-003: Vendor MVP Scope

- User-entered records only; no marketplace; no payment system for MVP.

---

## 14. Guest Requirements

### FR-GUEST-001: Guest CRUD

- Add, view, edit, delete guest records.
- Fields: guest name, group/family, contact, RSVP, meal preference, special requirements, notes.

### FR-GUEST-002: RSVP Management

- Statuses: Pending, Accepted, Declined.

### FR-GUEST-003: Guest Statistics

- Based on actual guest records; computed from records.

---

## 15. Event-Day Schedule Requirements

### FR-SCHEDULE-001: Schedule Item CRUD

- Add, edit, delete schedule items.
- Fields: time, activity, description, ordering, responsible person/vendor where applicable.

### FR-SCHEDULE-002: Schedule Ordering

- Must support chronological ordering.

---

## 16. AI Event Plan Generation Requirements

### FR-AI-001: AI Event Plan Generation

Flow:

- User input
- Validation
- Structured event data
- Planning rules
- Prompt builder
- AI model
- Structured response
- Schema validation
- Business rule validation
- User review
- User acceptance
- Database persistence

### FR-AI-002: AI-Generated Output

Must support:

- Suggested tasks
- Timeline
- Budget allocation suggestions
- Vendor categories
- Guest-management checklist
- Event-day schedule
- Planning recommendations
- Risk reminders

### FR-AI-003: AI Output Validation

- AI output must not directly modify authoritative data.
- Application validates AI output before persistence.
- AI output must pass business rules.

### FR-AI-004: AI Plan Acceptance

- User accepts plan.
- User may edit/reject.
- Persistence only after acceptance (or adjusted acceptance).

---

## 17. AI Assistant Requirements

### FR-AI-005: AI Planning Assistant

- Chat, user message, assistant response, conversation history.
- Uses current event context.
- Context may include: event type, guest count, budget, actual spending, tasks, timeline, vendors, guests, remaining time.

- Do not send irrelevant application data unnecessarily.

### FR-AI-006: AI Assistant Constraints

- Must not invent vendor availability, real-time prices, booking confirmations, external facts.
- Must not override application calculations.

---

## 18. Personalization Requirements

### FR-PERSONALIZE-001: Recommendations

- May consider: event type, guest count, budget, location, style, priorities, user preferences, remaining planning time.

- Personalization affects recommendations without making AI authoritative.

---

## 19. Risk Detection Requirements

### FR-RISK-001: Deterministic Risk Rules

- Budget: utilization >= 90% -> Critical; >= 80% and < 90% -> Approaching.
- Timeline: critical task overdue -> Critical timeline warning.
- Guest: significant number of guests pending -> RSVP warning.
- Vendor: event date approaching AND required vendor not booked -> Vendor warning.

### FR-RISK-002: Risk Source Separation

- Deterministic system rules separate from AI recommendations.

---

## 20. Notification Requirements

### FR-NOTIFY-001: In-App Notifications

- Creation, read/unread, display, dismissal if supported, priority.
- Examples: task overdue, budget warning, vendor warning, RSVP warning, task completed, vendor booked, plan generated, plan accepted.

- No paid SMS/WhatsApp for MVP.

---

## 21. Export Requirements

### FR-EXPORT-001: Event Summary Export

- Includes: event info, budget, expenses, tasks, timeline, vendors, guests, event-day schedule.

### FR-EXPORT-002: Export Formats

- PDF expected content defined.
- ICS expected calendar events defined.

- If export cannot be implemented in environment, must be marked unavailable, not falsely presented as working.

---

## 22. Settings Requirements

### FR-SETTINGS-001: Settings Scope

- User profile, account settings, event preferences, notification preferences where applicable, appearance preferences if implemented.

- Do not introduce unnecessary settings.

---

## 23. Search / Filter / Sort Requirements

Include only where supported by PRD or product concept.

- For applicable modules, define: search, filter, sort, clear filters, empty search result state.
- Do not add unnecessary complexity.

---

## 24. Validation Requirements

Common validation rules:

- Required fields
- Valid dates
- Valid time ranges
- Non-negative financial amounts
- Valid guest counts
- Valid task due dates
- Valid event dates
- Maximum reasonable text lengths
- Duplicate prevention where applicable

Validation before persistence.

---

## 25. Error Handling Requirements

Expected behavior for:

- Network failure
- Authentication failure
- Database failure
- AI failure
- Validation failure
- Export failure
- Missing event
- Deleted record
- Unauthorized request

Every important user action should provide clear user-facing result.

---

## 26. Loading States Requirements

Loading behavior for:

- Login
- Registration
- Event creation
- Event loading
- Plan generation
- AI chat
- Saving changes
- Deleting records
- Export generation

Avoid unnecessary blocking loaders.

---

## 27. Empty States Requirements

Meaningful empty states for:

- No events
- No tasks
- No vendors
- No guests
- No expenses
- No notifications
- No timeline milestones
- No event-day schedule items
- No AI conversation

Empty states explain what user can do next.

---

## 28. Permission Requirements

Ownership rules:

- Registered user only accesses/modifies own events and related records.
- Event-related data inherits event ownership.
- Frontend authorization not relied upon alone; backend authorization must eventually enforce.

---

## 29. Data Consistency Requirements

Consistency expectations:

- Changing expense updates: budget, remaining amount, utilization, warnings, dashboard metrics.
- Changing task updates: task counts, deadlines, timeline, notifications.
- Changing RSVP updates: guest statistics, dashboard, warnings.
- Changing vendor status updates: vendor statistics, dashboard, vendor risks.

---

## 30. Non-Functional Cross-References

- Performance, security, reliability, scalability, maintainability, accessibility -> future `03-NFR.md`.

---

## 31. Acceptance Criteria

### FR-EVENT-001: Create Event

- Authenticated user can open Create Event.
- Required fields validated.
- Invalid input shows understandable error.
- Valid event can be created.
- Created event appears in user's event list.
- Dashboard reflects new event.
- User cannot access another user's event.
- Duplicate submission prevented.

(Repeat pattern for each major feature: create, manage tasks, budget, AI plan.)

---

## 32. Requirement Traceability

| PRD Requirement | FRS ID | Feature | Acceptance Criteria | Priority |
|---|---|---|---|---|
| FR-01 User Registration | FR-AUTH-001 | Authentication | ... | MVP |
| FR-02 User Login | FR-AUTH-002 | Authentication | ... | MVP |
| FR-03 User Logout | FR-AUTH-003 | Authentication | ... | MVP |
| FR-04 Event Creation | FR-EVENT-001 | Events | ... | MVP |
| FR-05 Event Viewing | FR-EVENT-002 | Events | ... | MVP |
| FR-06 Event Editing | FR-EVENT-003 | Events | ... | MVP |
| FR-07 Event Deletion | FR-EVENT-004 | Events | ... | MVP |
| FR-08 Budget Management | FR-BUDGET-001 | Budget | ... | MVP |
| FR-09 Expense Tracking | FR-EXPENSE-001 | Expenses | ... | MVP |
| FR-10 Task Management | FR-TASK-001 | Tasks | ... | MVP |
| FR-11 Task Dependencies | FR-TASK-006 | Tasks | ... | MVP |
| FR-12 Planning Timeline | FR-TIMELINE-001 | Timeline | ... | MVP |
| FR-13 Vendor Management | FR-VENDOR-001 | Vendors | ... | MVP |
| FR-14 Guest Management | FR-GUEST-001 | Guests | ... | MVP |
| FR-15 Event-Day Schedule | FR-SCHEDULE-001 | Schedule | ... | MVP |
| FR-16 AI Event Plan Generation | FR-AI-001 | AI | ... | MVP |
| FR-17 AI Planning Assistant | FR-AI-005 | AI | ... | MVP |
| FR-18 Personalization | FR-PERSONALIZE-001 | AI | ... | Post-MVP |
| FR-19 Risk Detection | FR-RISK-001 | Risks | ... | MVP |
| FR-20 In-App Notifications | FR-NOTIFY-001 | Notifications | ... | MVP |
| FR-21 Plan Export | FR-EXPORT-001 | Export | ... | MVP |
| FR-22 Dashboard | FR-DASH-001 | Dashboard | ... | MVP |

---

## 33. MVP Boundary

### MVP

Required for first usable version.

- Authentication: register, login, logout
- Events: create, view, edit, delete
- Dashboard: overview
- Budget: categories, planned, actual, remaining, utilization
- Tasks: CRUD, status, priority, due dates, dependencies
- Timeline: planning timeline, event-day schedule
- Vendors: CRUD, status, cost tracking
- Guests: CRUD, RSVP
- AI: event plan generation, assistant
- Notifications: in-app
- Export: event plan export

### Post-MVP

Useful but not required initially.

- Administrator features
- Settings management depth
- Advanced personalization
- Advanced exports (PDF/ICS details)

### Future

Potential later functionality.

- Public event sharing
- Collaboration
- Mobile app
- Advanced AI
- Advanced analytics

---

## 34. Final Requirement Summary

- Total functional requirements defined: 21
- MVP requirements: 21
- Post-MVP requirements: 2 (personalization, administrator/settings depth)
- Future requirements: rest

### Critical Dependencies

- Deterministic budget calculations must remain in application code.
- AI output must be validated before persistence.

### Open Questions

- No unresolved product decisions silently decided.
- Genuinely unspecified items marked `OPEN DECISION` where needed.

---

## Quality Rules

The document must be:

- Professional
- Developer-readable
- QA-readable
- Structured
- Testable
- Consistent
- Free of duplicate requirements
- Free of vague requirements
- Free of implementation code
- Based on the UtsavAI PRD

- No marketing copy
- No unnecessary technology decisions
- No change to product vision

Save final document as:

```text
docs/02-FRS.md
```

No application source code changes while creating this document.
