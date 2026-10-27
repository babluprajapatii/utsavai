# UtsavAI - AI Architecture & AI Behavior Specification

**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Source documents:** `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`, `05-API-SPECIFICATION.md`
**Purpose:** Define complete AI behavior, architecture, boundaries, data flow, prompt strategy, validation, and safety rules.
**Intended audience:** Backend, frontend, QA, DevOps.

---

## 1. Document Information

- **Document name:** 06-AI-SPECIFICATION.md
- **Product:** UtsavAI
- **Version:** 1.0
- **Status:** Draft
- **Source documents:** PRD, FRS, NFR, DATABASE, API
- **Purpose:** Define AI architecture and behavior
- **Intended audience:** Backend, frontend, QA, DevOps

---

## 2. AI Product Role

AI is responsible for:
- Event planning suggestions
- Personalized recommendations
- Draft task generation
- Draft timeline generation
- Budget allocation suggestions
- Vendor category suggestions
- Guest-management recommendations
- Event-day planning suggestions
- Risk reminders
- Natural-language planning assistance
- Alternative planning strategies
- Context-aware conversational assistance

AI is NOT responsible for:
- Authentication
- Authorization
- Database permissions
- Financial calculations
- Final budget totals
- Task dependency enforcement
- Date validation
- User permissions
- Database mutations without validation
- Vendor availability
- Real-world vendor prices
- Real-world bookings
- Payment processing
- SMS/WhatsApp
- Inventing external facts

---

## 3. AI Architecture

Three flows defined.

### Event-plan generation flow:

```
User
 ↓
Frontend
 ↓
AI API
 ↓
Authentication
 ↓
Event Context Builder
 ↓
Planning Rules
 ↓
Prompt Builder
 ↓
AI Provider
 ↓
Structured Output
 ↓
Schema Validation
 ↓
Business Validation
 ↓
User Review
 ↓
User Acceptance
 ↓
Database
```

### AI chat flow:

```
User
 ↓
Chat UI
 ↓
AI API
 ↓
Authentication
 ↓
Event Ownership Check
 ↓
Relevant Event Context
 ↓
Prompt Builder
 ↓
AI Provider
 ↓
Response Validation
 ↓
Assistant Response
 ↓
Conversation Persistence
```

Every stage explained.

---

## 4. AI Provider

Initial implementation may use **Google Gemini API**.

Provider must be treated as replaceable.

Do not tightly couple to a single model.

Conceptual abstraction:

```
AI Provider
↓
Generate structured plan
↓
Generate chat response
```

Free-tier usage respected; application must not assume unlimited AI requests.

---

## 5. AI Context Model

AI can receive event context:

- Event type
- Event name
- Event date
- Start time / End time
- Location
- Guest count
- Total budget
- Theme
- Style
- Priorities
- Special requirements
- Existing tasks
- Existing milestones
- Existing vendors
- Existing guest summary
- Budget summary
- Current expenses
- Upcoming deadlines
- Relevant risks

Only relevant context sent; never entire database.

---

## 6. Context Builder

Layer that selects relevant information.

Example:

User asks:

"What should I prioritize this week?"

Context builder selects:

- Event date
- Current date
- Remaining days
- Incomplete tasks
- Critical tasks
- Overdue tasks
- Upcoming milestones
- Budget utilization
- Unbooked critical vendors

Unrelated guest details not included unless relevant.

Context builder produces structured context before prompt generation.

---

## 7. AI Plan Generation

AI output can contain:

### Tasks

- title
- description
- category
- priority
- suggested due date

### Milestones

- title
- date
- description

### Budget suggestions

- category
- suggested allocation
- reasoning

### Vendor categories

- category
- recommendation
- priority

### Event-day schedule

- activity
- time
- description

### Recommendations

- recommendation
- reason
- priority

### Risks

- risk
- severity
- mitigation

AI output must not be trusted input.

---

## 8. Structured AI Output

Generated plans must use structured output.

Conceptual JSON schema:

```json
{
  "tasks": [],
  "milestones": [],
  "budget_allocations": [],
  "vendor_categories": [],
  "event_day_schedule": [],
  "recommendations": [],
  "risks": []
}
```

Exact schema must align with database and API specifications.

---

## 9. AI Output Validation

Two validation stages.

### Schema validation

Verify:
- Required fields
- Data types
- Allowed enum values
- Valid date formats
- Valid numeric values
- String limits
- Array structures

### Business validation

Verify:
- Dates make sense relative to event
- No negative monetary values
- Budget allocations do not violate business rules
- Tasks belong to the event
- Dependencies are valid
- Event-day schedule is chronologically valid
- No impossible planning dates
- No duplicate records where inappropriate

Invalid AI output must be rejected or safely repaired by deterministic application logic.

---

## 10. AI Database Boundary

Mandatory rule:

**AI must never directly mutate the database.**

Correct flow:

```
AI
 ↓
JSON
 ↓
Schema validation
 ↓
Business validation
 ↓
Application service
 ↓
Database
```

Incorrect flow:

```
AI
 ↓
Database
```

Explanation: AI does not receive unrestricted database credentials.

---

## 11. User Acceptance Flow

Generated plans must be reviewable before persistence.

Flow:

```
Generate
 ↓
Preview
 ↓
User reviews
 ↓
User accepts
 ↓
Validate again
 ↓
Persist
```

If user rejects plan:
- Do not persist generated records.

If user edits plan:
- Persist edited version after validation.

---

## 12. Plan Persistence

When user accepts AI plan, application may create:

- Tasks
- Timeline milestones
- Planned budget allocations
- Vendor category recommendations
- Event-day schedule entries
- Notifications

Persistence follows `04-DATABASE.md`; AI itself never performs insertion.

---

## 13. AI Chat Assistant

Context-aware assistant example:

User question:

"My budget is getting too high. What should I reduce?"

AI receives: total budget, actual spending, planned spending, category-level spending, remaining budget, event type, guest count, priorities.

Assistant explains recommendations based on supplied data only.

---

## 14. Chat Memory

Assistant remembers relevant conversation context through:

- Current conversation
- Event context
- Stored conversation messages where required

Avoid sending unlimited historical messages.

If conversation history large, summarize rather than sending everything.

No complex vector database or RAG system for MVP unless source document requires it.

---

## 15. Personalization

AI recommendations adapt to:

- Event type
- Guest count
- Budget
- Location
- Style
- Theme
- Priorities
- Special requirements
- Remaining time
- Existing progress

Example:

Wedding, 250 guests, ₹5,00,000 budget, Traditional style, 60 days remaining → different recommendations than Wedding, 100 guests, ₹15,00,000 budget, Modern style, 180 days remaining.

---

## 16. Deterministic Business Logic

Application code must calculate:

### Budget

Remaining Budget = Total Budget - Actual Expenses

Budget Utilization = Actual Expenses / Total Budget × 100

### Risk

Budget ≥ 80% → Warning

Budget ≥ 90% → Critical

### Timeline

Overdue tasks, upcoming deadlines, event-date comparisons, dependency validation

### Guests

Total guests, accepted, pending, declined

### Vendors

Booking status, upcoming vendor deadlines

AI may explain results; must not be authoritative calculator.

---

## 17. AI Safety and Hallucination Control

AI must:

- Use supplied application data
- Distinguish suggestions from facts
- Avoid claiming real-time availability
- Avoid inventing vendor prices
- Avoid inventing bookings
- Avoid inventing external services
- Avoid claiming actions it did not perform

If information unavailable, assistant must say it does not have that information.

---

## 18. AI Response Style

Assistant should be:
- Clear
- Practical
- Concise
- Action-oriented
- Context-aware
- Honest about uncertainty

Avoid:
- Generic motivational text
- Excessive verbosity
- Repeated recommendations
- Fake statistics
- Fake vendor information
- Unnecessary jargon
- Claims of real-world actions that did not happen

---

## 19. AI Prompt Architecture

Prompt layers:

### System Instructions

Stable AI behavior and safety rules.

### Application Rules

Product-specific planning rules.

### Event Context

Current structured event information.

### Relevant Database Context

Only necessary information for request.

### Conversation Context

Relevant recent messages.

### User Request

Current user question.

Conceptually:

```
SYSTEM
+
RULES
+
EVENT
+
RELEVANT DATA
+
CONVERSATION
+
USER REQUEST
```

Do not blindly concatenate entire database into prompt.

---

## 20. Prompt Injection Protection

Treat user-provided content as untrusted:

- Event descriptions
- Vendor notes
- Guest notes
- Task descriptions
- User messages

User content must not override system-level AI rules.

Assistant must not reveal:
- System prompts
- Internal instructions
- API credentials
- Hidden application configuration
- Internal security rules

---

## 21. AI Error Handling

Defined errors:

| Failure scenario         | HTTP | Code                      | Client guidance                          |
|-------------------------|------|--------------------------|-----------------------------------------|
| Provider failure        | 503  | `AI_PROVIDER_UNAVAILABLE`| Show error state; suggest retry         |
| Timeout                 | 503  | `AI_TIMEOUT`             | Allow retry                             |
| Rate limit              | 429  | `AI_RATE_LIMITED`        | Retry after backoff; no provider details  |
| Invalid output          | 422  | `AI_SCHEMA_INVALID`      | Reject response; retry controlled        |
| Empty response          | 422  | `AI_EMPTY_RESPONSE`      | Safe fallback                           |
| Network failure         | 503  | `AI_TEMPORARY_FAILURE`   | Preserve user input; retry              |

UI must provide retry mechanism.

---

## 22. Retry Strategy

Retries must be controlled.

Do not create infinite retries.

Use small bounded retry strategy.

Avoid automatically generating duplicate plans.

If plan generation succeeds but client fails to receive response, avoid blind duplicate database records.

---

## 23. AI Usage Economics

Zero-cost project guidance:

Prefer:
- Generate complete plan
- Store/reuse generated result

Avoid:
- AI call for every UI interaction

For chat: send only relevant context.

Do not repeatedly send unnecessary historical data.

Document that provider free-tier limits may change.

---

## 24. AI Caching / Reuse

Define when AI results can be reused:

- Previously generated plan
- Existing recommendations
- Repeated dashboard information

Do not add Redis.

Use database persistence or simple application-level strategies where appropriate.

---

## 25. AI Observability

Define safe monitoring information:

- Request type
- Success/failure
- Latency
- Provider error category
- Validation failures

Do not log:
- API keys
- Authentication tokens
- Passwords
- Sensitive personal data unnecessarily
- Complete private conversations unless explicitly required

---

## 26. AI Cost / Quota Protection

Define protections against excessive AI usage:

- Per-user request limits
- Cooldowns
- Maximum input size
- Maximum output size
- Retry limits
- Generation limits

Mark unresolved limits as `OPEN DECISION`.

---

## 27. AI Data Privacy

Only necessary event information should be sent to external AI provider.

Avoid sending unnecessary:
- Guest contact information
- Vendor contact information
- Personal notes
- Sensitive information

Application should minimize data sent to model.

---

## 28. AI Provider Failure Fallback

Application should remain usable if AI is unavailable.

Core features must continue to work:
- Events
- Tasks
- Budget
- Expenses
- Vendors
- Guests
- Timeline
- Notifications
- Export

AI is an enhancement, not a dependency for basic event management.

---

## 29. AI Feature Boundaries

| Capability                 | AI      | Application Code | Database |
|---------------------------|---------|------------------|----------|
| Budget calculation        | Explain | Authoritative    | Store    |
| Task creation             | Suggest | Validate/create  | Store    |
| Timeline                  | Suggest | Validate dates   | Store    |
| Vendor availability       | No      | No               | No       |
| Guest totals              | Explain | Calculate        | Store    |
| Authentication            | No      | Authoritative    | Store    |
| Authorization             | No      | Authoritative    | Enforce  |
| Recommendations           | Generate| Validate         | Store if needed |
| Chat                      | Generate| Context/security   | Store messages |

Separation made explicit.

---

## 30. AI Traceability

| FRS ID | AI Feature       | Input Context | Output | Validation       |
|--------|-----------------|---------------|--------|-----------------|
| FR-AI-001 | Plan generation | Structured data | Plan JSON | Schema + business |
| FR-AI-005 | AI chat         | Event context + message | Response | Schema + business |
| FR-AI-002 | Plan validation | Plan JSON | Validation result | Two-stage |
| FR-AI-004 | Accept plan     | User acceptance | Persisted records | DB insert validation |
| FR-NOTIFY-001 | Risk reminders | Structured risks | Notifications | DB constraint |

Map every AI requirement to this specification.

---

## 31. MVP AI Scope

### MVP

- AI event plan generation
- AI planning assistant
- Context-aware recommendations
- Structured plan output
- Validation
- User acceptance
- Error/retry handling

### Post-MVP

Only features that naturally extend existing product.

### Future

Advanced personalization, external vendor integrations, calendar integrations, advanced recommendation systems.

Do not add unnecessary AI complexity.

---

## 32. Open Decisions

List all unresolved decisions:

- Exact Gemini model
- Exact token limits
- Exact request quotas
- Exact retry count
- Conversation summarization threshold
- AI provider fallback
- AI telemetry retention

Mark with `OPEN DECISION`.

Do not silently invent decisions.

---

## 33. Final AI Checklist

### Architecture

- [ ] AI provider isolated
- [ ] Context builder defined
- [ ] Prompt builder defined
- [ ] Structured output defined
- [ ] Validation defined

### Security

- [ ] Authentication required
- [ ] Ownership checked
- [ ] Prompt injection considered
- [ ] Secrets protected
- [ ] Sensitive data minimized

### Reliability

- [ ] Provider errors handled
- [ ] Invalid output handled
- [ ] Retry behavior defined
- [ ] Duplicate generation considered
- [ ] Application works without AI

### Business logic

- [ ] Financial calculations deterministic
- [ ] Date calculations deterministic
- [ ] Permissions deterministic
- [ ] AI cannot directly mutate database

### Product

- [ ] Plan generation defined
- [ ] AI chat defined
- [ ] Personalization defined
- [ ] Context-aware recommendations defined
- [ ] User acceptance defined

Do not mark `[x]` unless verified.

---

## QUALITY RULES

Professional, precise, implementation-ready, developer-readable, backend-readable, frontend-readable, QA-readable.

Consistent with PRD, FRS, NFR, DATABASE, API specification.

Free of hallucinated requirements, unnecessary AI complexity, implementation code.

Save as: `docs/06-AI-SPECIFICATION.md`

Do not modify application source code.

IMPORTANT PROJECT RULE:

**AI must never perform Git commit or Git push operations. Git commit and Git push will always be performed manually by the project owner.**