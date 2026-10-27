# UtsavAI — AI Memory & Context Specification

**Document:** docs/16-AI-MEMORY.md  
**Version:** 1.0  
**Status:** Draft  
**Product:** UtsavAI  
**Source documents:** `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`, `05-API-SPECIFICATION.md`, `06-AI-SPECIFICATION.md`, `07-UI-UX-SPECIFICATION.md`, `08-SECURITY-AUTHORIZATION-SPECIFICATION.md`, `09-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md`, `10-DEPLOYMENT-DEVOPS-SPECIFICATION.md`, `11-API-IMPLEMENTATION-SPECIFICATION.md`, `12-TECHNICAL-ARCHITECTURE-SPECIFICATION.md`, `13-DATABASE-IMPLEMENTATION-SPECIFICATION.md`, `14-AI-IMPLEMENTATION-SPECIFICATION.md`, `15-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md`  
**Purpose:** Define the AI memory model, context assembly, state persistence, retrieval pipelines, personalization strategies, and security isolation boundaries for UtsavAI.  
**Intended audience:** AI engineers, backend developers, frontend developers, security engineers, QA.

---

## DOCUMENT SCOPE

This specification governs **AI memory, context persistence, retrieval mechanisms, and personalization rules** exclusively.

It does NOT modify application source code.  
It does NOT install dependencies.  
It does NOT create migration scripts or alter UI designs.  
It does NOT execute Git commit or Git push operations.

All Git operations are managed manually by the project owner.

---

## 1. PURPOSE OF AI MEMORY

In event planning, users interact with the assistant across multiple sessions over several weeks or months. Without memory, a conversational assistant is blind to earlier decisions, requiring users to repeatedly explain fundamental event parameters in every prompt:

> **Without Memory:**  
> *User (Turn 1):* "My wedding is on December 15 in Jaipur with 350 guests and a ₹15,00,000 budget."  
> *User (Turn 2 - next week):* "What should I prioritize this week?"  
> *Assistant (blind):* "When is your event, where is it taking place, and what is your budget?" *(Poor user experience).*

> **With UtsavAI Memory Architecture:**  
> *User (Turn 2 - next week):* "What should I prioritize this week?"  
> *Assistant (context-aware):* "With your Jaipur wedding 54 days away on December 15, your top priority is finalizing the catering menu for 350 guests and confirming the royal palace sound curfew."

### Core Objectives of AI Memory:
- **Personalization**: Grounding recommendations in the user's specific cultural style, theme, and priorities.
- **Continuity**: Providing unbroken conversational coherence across planning sessions.
- **Cognitive Relief**: Eliminating repetitive user input and re-explanation.
- **Contextual Precision**: Generating proactive warnings based on live budget spending and upcoming task deadlines.
- **Actionable Guidance**: Recommending timely trade-offs based on historical user choices.

---

## 2. MEMORY PRINCIPLES

1. **Store Only Useful, Actionable Data**: Ephemeral conversational pleasantries must never pollute persistent memory.
2. **Normalized Relational Data as Primary Memory**: Authoritative application records (`events`, `tasks`, `expenses`, `budget_categories`, `event_preferences`) serve as the primary long-term memory.
3. **No Inference as Fact**: AI guesses or conversational inferences must never be treated as verified application facts without user confirmation.
4. **Strict Multi-Tenant Isolation**: Memory belonging to User A must never bleed into User B's context under any circumstances.
5. **Strict Event Scoping**: Memory belonging to Event 1 (e.g., Wedding) must never bleed into Event 2 (e.g., Birthday), even for the same user.
6. **User Control and Deletion**: Memory must be modifiable or erasable by the user via standard CRUD interfaces.
7. **PII and Secret Exclusion**: Personal phone numbers, emails, passwords, and API keys must never enter AI memory or prompt context.
8. **Minimalist Context Assembly**: Never dump the entire database into a prompt; extract only the subset relevant to the user's immediate question.
9. **Authoritative Overrides**: Authoritative database records always override conversational recollections or stale AI context.
10. **Zero-Cost / Free-Tier Friendly**: Memory retrieval relies on PostgreSQL indexes and bounded conversational windows—no costly vector databases or third-party memory services for the MVP.

---

## 3. WHAT UTSAVAI SHOULD REMEMBER

AI memory is organized into four distinct operational categories:

### 3.1 User-Level Preferences (Global User Memory)
- Preferred communication tone (e.g., concise, highly detailed, formal).
- High-level planning persona (e.g., budget-conscious, premium/luxury-oriented, traditional, DIY).
- Accessibility or locale preferences.

### 3.2 Event Context (Core Relational Memory)
- `event_type`: Wedding, Birthday, Community Event, Family Celebration, Custom Event.
- `name`: Celebration title.
- `event_date`: Calendar date of the event.
- `location`: City/venue context (e.g., "Jaipur, Rajasthan").
- `guest_count`: Total estimated headcount.
- `total_budget`: Overall spending ceiling.
- `currency`: ISO code (default `'INR'`).

### 3.3 Event Planning Preferences (`event_preferences`)
- `theme`: Visual and decorative concept (e.g., "Royal Rajasthani", "Floral Pastels").
- `style`: Atmosphere (e.g., "Traditional", "Contemporary", "Fusion").
- `priorities`: Ordered list of high-importance departments (e.g., `["Catering", "Photography", "Decor"]`).
- `special_requirements`: Cultural customs, dietary restrictions (e.g., pure Jain menu), lodging needs.

### 3.4 Conversational Session Context (`ai_conversations` + `ai_messages`)
- The active conversational topic (e.g., negotiating vendor contracts).
- Recent user questions and assistant answers (bounded to the last 6 turns).
- Transient planning alternatives explored during the active session.

---

## 4. WHAT AI MUST NEVER REMEMBER

The following information is strictly prohibited from entering persistent AI memory, conversation logs, or prompt contexts:

- **Authentication Secrets**: Passwords, hashed passwords, session JWTs, refresh tokens, CSRF tokens.
- **Provider & Infrastructure Keys**: `GEMINI_API_KEY`, Supabase `service_role` keys, database connection strings.
- **Guest Sensitive Contact PII**: Guest phone numbers, residential addresses, and email addresses (only aggregate headcounts are sent).
- **Payment & Financial Secrets**: Credit/debit card numbers, UPI PINs, bank account details.
- **Internal Server Traces**: Database table schemas, stack traces, internal server IPs, environment variable dumps.
- **Cross-Event / Cross-User Data**: Details from any event other than the currently authorized `event_id`.

---

## 5. SOURCE OF TRUTH HIERARCHY

When conflicting values exist across the application ecosystem, UtsavAI enforces a strict 6-tier precedence hierarchy:

```text
┌────────────────────────────────────────────────────────┐
│ 1. Supabase PostgreSQL Database (Authoritative Truth)   │
├────────────────────────────────────────────────────────┤
│ 2. Live Event State (Current Expenses, Tasks, RSVPs)   │
├────────────────────────────────────────────────────────┤
│ 3. Explicit User Preferences (event_preferences table) │
├────────────────────────────────────────────────────────┤
│ 4. Stored AI Memory / Accepted Plans                   │
├────────────────────────────────────────────────────────┤
│ 5. Recent Conversational History (ai_messages)         │
├────────────────────────────────────────────────────────┤
│ 6. AI Inferences & Unverified Suggestions (Untrusted)  │
└────────────────────────────────────────────────────────┘
```

### Precedence Example:
- If an old chat message states *"The budget is ₹6,00,000"*, but the database `events.total_budget` record shows `₹5,00,000`:  
  **The database value of ₹5,00,000 wins unconditionally.**  
  The assistant must answer based on ₹5,00,000 and explicitly clarify the authoritative figure if asked.

---

## 6. SHORT-TERM VS. LONG-TERM MEMORY

| Memory Dimension | Short-Term Memory (Working Session) | Long-Term Memory (Persistent) |
|---|---|---|
| **Storage Medium** | React component state / Bounded `ai_messages` window | PostgreSQL tables (`events`, `tasks`, `event_preferences`) |
| **Scope** | Current chat exchange (last 4–6 messages) | Across all sessions for the lifetime of the event |
| **Typical Contents** | "Tell me more about the second option you mentioned", active prompt context | Event date, total budget, confirmed vendors, guest counts |
| **Lifecycle** | Pruned as the conversation progresses | Persists until explicitly edited or deleted by the user |
| **Cost Impact** | Bounds prompt token usage (prevents token bloat) | Single indexed SQL query execution |

---

## 7. EVENT MEMORY & MULTI-EVENT ISOLATION

UtsavAI is strictly **event-centric**. A single user may manage multiple concurrent events (e.g., a Wedding in December, a Family Birthday in October, and a Community Gala in November).

```text
User Account (auth.users.id)
     │
     ├── Event A: "Rohan & Priya Wedding" (Dec 15)
     │     ├── Preferences: Traditional, Regal, Food priority
     │     ├── Budget: ₹15,00,000 (Spent: ₹8,00,000)
     │     └── Chat Thread: Wedding planning assistant
     │
     └── Event B: "Vikram's 50th Birthday" (Nov 02)
           ├── Preferences: Modern, Casual, Music priority
           ├── Budget: ₹1,50,000 (Spent: ₹20,000)
           └── Chat Thread: Birthday planning assistant
```

### Isolation Invariant:
When the user opens the AI Assistant on **Event B**:
- The context builder loads records where `event_id = Event_B_ID`.
- Zero context from Event A is queried, assembled, or transmitted.
- The assistant is completely unaware of Event A during Event B interactions.

---

## 8. MEMORY RETRIEVAL PIPELINE

Memory retrieval is intent-driven. The Context Builder queries only the domain data needed to answer the specific prompt category:

| Inferred Intent | Targeted Domain Tables Retrieved | Suppressed Tables |
|---|---|---|
| **Budget & Cost Questions** | `events`, `budget_categories`, `expenses` | `guests`, `event_schedule_items` |
| **Timeline & Deadlines** | `events`, `tasks`, `event_milestones` | Detailed `expenses`, guest meal preferences |
| **Vendor Questions** | `events`, `vendors`, `budget_categories` | `guests`, task dependency graphs |
| **Guest & RSVP Inquiries**| `events`, aggregate `guests` stats (accepted, pending, declined) | Line-item `expenses`, vendor contracts |
| **Day Schedule Inquiries**| `events`, `event_schedule_items`, assigned vendor names | Long-term prep tasks, budget categories |
| **General Plan Advice** | `events`, `event_preferences`, high-level summaries | Raw individual expense receipts |

---

## 9. CONTEXT BUILDING PIPELINE

Every AI invocation follows this structured context assembly pipeline:

```text
1. Receive Request: POST /api/ai/chat { event_id, message }
                 ↓
2. Authenticate: Verify Supabase Auth JWT (resolve auth.uid())
                 ↓
3. Authorize: Verify events.user_id === auth.uid() (404 on failure)
                 ↓
4. Extract Intent: Analyze user query for domain keywords
                 ↓
5. Query Database: Fetch live authoritative records using indexed queries
                 ↓
6. Minimize Context: Strip PII; aggregate counts; clamp lists to top 5-10 items
                 ↓
7. Retrieve History: Query last 6 messages from ai_messages where event_id matches
                 ↓
8. Compile Prompt: System Instructions + Planning Rules + Minimal Context + History + Query
                 ↓
9. Execute Call: Server-to-server request to Google Gemini API
                 ↓
10. Validate & Return: Guard check response; log turns in ai_messages; return to UI
```

---

## 10. MEMORY PRIORITY & WEIGHTING

When assembling prompts within strict token limits, data elements are prioritized in descending order:

```text
┌─────────────────────────────────────────────────────────────────┐
│ HIGH PRIORITY (Always included in context)                      │
│ - Event Type, Days Remaining, Event Date, Location              │
│ - Total Budget, Total Spent, Remaining Balance, Utilization %   │
│ - Overdue Critical Tasks, Pending Critical Decisions            │
│ - User's Explicitly Stated Priorities (e.g., "Food First")      │
├─────────────────────────────────────────────────────────────────┤
│ MEDIUM PRIORITY (Included when relevant to query)               │
│ - Category-level budget breakdowns                              │
│ - Upcoming milestones (within next 30 days)                     │
│ - Unbooked critical vendor categories                           │
│ - Aggregate guest headcount (Confirmed vs Pending)              │
├─────────────────────────────────────────────────────────────────┤
│ LOW PRIORITY (Included only if token window permits)            │
│ - Recent chat conversation turns                                │
│ - Completed tasks and historical expenses                       │
│ - Detailed vendor notes                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. MEMORY CONFLICT RESOLUTION

### Rule: Database Always Trumps Conversational Recollection

| Scenario | Stored Memory / Chat turn | Live Database State | Resolution & Assistant Response |
|---|---|---|---|
| **Budget Mismatch** | Chat turn says: "You have ₹2,00,000 left." | User logged ₹1,50,000 expense; remaining is ₹50,000. | Assistant uses ₹50,000: *"Your remaining budget is ₹50,000 following your recent expense entry."* |
| **Headcount Mismatch**| Chat turn says: "Planning for 200 guests." | User updated `events.guest_count = 350`. | Assistant uses 350: *"Based on your updated guest count of 350..."* |
| **Date Shift** | Chat turn says: "Event is on Nov 10." | User postponed date to `Dec 15`. | Assistant uses Dec 15: *"With your event now scheduled for December 15..."* |

Under no circumstances may the assistant argue with authoritative database records or use outdated chat turns over current database values.

---

## 12. MEMORY UPDATE RULES

### Unidirectional Mutation Flow
AI cannot directly write to persistent memory or database tables:

```text
PROHIBITED:
User: "Change my budget to ₹10,00,000"
AI Assistant ──(Direct DB Update)──> public.events (total_budget = 1000000)

PERMITTED (Authoritative Flow):
User updates budget in Settings/Budget UI
                 ↓
Application validates and updates public.events
                 ↓
Database record commits
                 ↓
Next Context Builder query reads updated total_budget
                 ↓
AI Assistant reflects new ₹10,00,000 budget
```

The AI may provide a deep link or interactive UI button prompting the user: *"Would you like to update your budget to ₹10,00,000 in your event settings?"* but the user must trigger the change through validated application controls.

---

## 13. AI-GENERATED MEMORY VS. VERIFIED FACTS

The system rigorously separates **verified facts** from **AI inferences**:

```text
[Verified Application Facts]
- Created by user or validated system actions
- Stored in normalized tables (events, tasks, expenses)
- Authoritative, permanent until changed by user

[AI Inferences / Assumptions]
- Derived from conversational cues (e.g., "User seems interested in outdoor lighting")
- Stored ephemerally or marked as unconfirmed drafts
- Advisory only; never written to core preferences without explicit user acceptance
```

*Example:* If a user asks *"What are cheap flower options?"*, the assistant must not permanently flag the event preference as `budget_decor = true`. It simply answers the immediate inquiry.

---

## 14. MEMORY SECURITY & MULTI-TENANCY

Memory security is enforced at the server layer using three non-negotiable checks:

```text
Client Request
      ↓
[Check 1: Authenticate] ──> Valid Supabase JWT? If NO ──> 401 Unauthorized
      ↓
[Check 2: Authorize]    ──> Does event_id belong to auth.uid()? If NO ──> 404 Not Found
      ↓
[Check 3: Scoped Query] ──> SELECT ... FROM public.events WHERE id = event_id AND user_id = auth.uid()
      ↓
Assemble Context ──> Call Gemini ──> Return Response
```

### Attack Defenses:
- **IDOR Defense**: Passing another user's `event_id` in a chat payload returns `404 Not Found`.
- **Session Poisoning Defense**: The user ID is strictly extracted from the verified server JWT context, never from client-controlled JSON bodies.
- **SQL / Prompt Leakage**: Context Builder values are injected as parameterized data, never concatenated into raw SQL strings.

---

## 15. PRIVACY & DATA MINIMIZATION

UtsavAI practices strict privacy by design:
1. **No Third-Party PII Exposure**: Personal guest names and contact info are withheld from the AI provider.
2. **Aggregated Headcounts**: Headcount data is transmitted as numerical summaries:
   ```json
   { "total_invited": 250, "accepted": 180, "pending": 50, "declined": 20 }
   ```
3. **No External Training**: Requests to Google Gemini API via enterprise/developer keys are not used to train global foundation models.
4. **Data Deletion Rights**: Deleting an event immediately purges all associated conversational logs and memory context.

---

## 16. MEMORY RETENTION POLICIES

| Memory Category | Retention Duration | Cleanup Mechanism |
|---|---|---|
| **Authoritative Event Records** | Active until user deletes event or account | PostgreSQL `ON DELETE CASCADE` |
| **Conversational Chat Logs** | Retained while parent event exists | Deleted with event cascade |
| **Active Chat Context Window** | Last 6 messages | Dynamically filtered during query execution |
| **Staged AI Draft Plans** | Retained until accepted or discarded (max 30 days) | Status updated to `Accepted` or `Discarded` |

---

## 17. MEMORY DELETION & CASCADE CLEANUP

When a user deletes an event, all associated AI memory and conversational context is purged immediately via PostgreSQL foreign key constraints:

```sql
-- Deleting an event cascades to all AI memory artifacts:
DELETE FROM public.events WHERE id = target_event_id;
  └── CASCADE: public.event_preferences (deleted)
  └── CASCADE: public.ai_conversations (deleted)
        └── CASCADE: public.ai_messages (deleted)
  └── CASCADE: public.ai_generated_plans (deleted)
```

**Verification:** Immediately following event deletion, any query to `/api/ai/chat` for that `event_id` returns `404 Not Found`. No orphaned memories or chat logs remain in the system.

---

## 18. AI CHAT CONTEXT PAYLOAD CONTRACT

The structured JSON payload prepared by the Context Builder and injected into the system prompt adheres to this schema:

```json
{
  "event": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Rohan & Priya Wedding",
    "type": "Wedding",
    "date": "2026-12-15",
    "days_remaining": 54,
    "location": "Jaipur, Rajasthan",
    "currency": "INR"
  },
  "budget": {
    "total": 1500000.00,
    "spent": 850000.00,
    "remaining": 650000.00,
    "utilization_percentage": 56.7,
    "status": "normal"
  },
  "tasks": {
    "total_count": 34,
    "completed_count": 18,
    "overdue_count": 1,
    "critical_pending": [
      { "title": "Finalize Palace Sound Permit", "due_date": "2026-10-25" }
    ]
  },
  "vendors": {
    "total_count": 8,
    "booked_count": 5,
    "unbooked_categories": ["Transportation", "Security", "DJ/Music"]
  },
  "guests": {
    "total_invited": 350,
    "accepted": 220,
    "pending": 100,
    "declined": 30
  },
  "preferences": {
    "theme": "Royal Rajasthani Heritage",
    "style": "Traditional",
    "priorities": ["Catering", "Photography", "Decor"],
    "special_requirements": "Separate pure-vegetarian catering section required."
  }
}
```

---

## 19. CONTEXT SIZE CONTROL & TOKEN BUDGETING

To optimize response latency and ensure cost efficiency on the Gemini Free Tier:

- **Target Context Token Size**: Maximum 1,500 tokens for context payload.
- **Dynamic List Truncation**:
  - Overdue tasks: Capped at top 5 items (ordered by priority and urgency).
  - Unbooked vendor categories: Listed as simple category name strings.
  - Category budget breakdown: Include only categories with active spend or top 5 largest allocations.
  - Conversation turns: Bounded strictly to the last 6 messages.
- **No Wildcard Bloat**: Never send raw notes, lengthy contract text, or redundant metadata.

---

## 20. AI MEMORY & BUDGET INTEGRATION

The AI assistant utilizes budget memory strictly in an **advisory capacity**:

```text
[Database: Authoritative]
total_budget = ₹15,00,000
total_expenses = ₹8,50,000

[Application Logic: Deterministic Calculation]
remaining = ₹6,50,000
utilization = 56.7%
status = "normal"

[Injected into AI Memory Context]
{ "total": 1500000, "spent": 850000, "remaining": 650000, "status": "normal" }

[AI Assistant: Explanations & Advice]
"You have ₹6,50,000 remaining (56.7% spent). With your core venue and catering secured,
you have sufficient funds to cover your unbooked transportation and music vendors."
```

The AI never performs additions, subtractions, or authoritative financial ledger entries.

---

## 21. AI MEMORY & TASKS INTEGRATION

- **Memory Role**: Context Builder feeds open tasks, critical deadlines, and overdue alerts into prompt memory.
- **Assistant Guidance**: Recommends which task to tackle first based on days remaining and dependency status.
- **Operational Boundary**: When a user says *"Mark the venue task as complete"*, the assistant replies with a confirmation button or guidance directing the user to click the task checkbox in the Tasks UI.

---

## 22. AI MEMORY & VENDORS INTEGRATION

- **Memory Role**: Context Builder feeds vendor category statuses (`Researching`, `Shortlisted`, `Booked`).
- **Assistant Guidance**: Flags unbooked critical services as the event date nears.
- **Anti-Hallucination Boundary**: The assistant never claims external vendors have open calendar dates or guarantees quotes. It bases guidance exclusively on the user's recorded quotes in the database.

---

## 23. AI MEMORY & GUESTS INTEGRATION

- **Memory Role**: Injects aggregate RSVP counts and special meal/dietary notes into context.
- **Assistant Guidance**: Identifies catering headcount checkpoints (e.g., *"You have 100 pending RSVPs with 30 days left; advise sending an RSVP reminder to finalize banquet numbers"*).
- **Privacy Boundary**: Individual guest names and contact channels are never injected into memory.

---

## 24. MEMORY & PERSONALIZATION ENGINE

Personalization is derived dynamically from stored event preferences and cultural context:

```text
Scenario A:
Event Type: Wedding | Location: Jaipur | Theme: Royal Rajasthani | Style: Traditional
Assistant Tone & Guidance:
- Focuses on multi-day ceremonial timelines (Mehndi, Sangeet, Baraat).
- Suggests traditional Rajasthani catering elements (Dal Baati Churma, Ghewar).
- Recommends booking brass bands and folk performers early.

Scenario B:
Event Type: Birthday | Location: Bengaluru | Theme: Superhero | Style: Casual
Assistant Tone & Guidance:
- Focuses on single-afternoon run of show.
- Suggests kid-friendly catering, themed cake cutting, and interactive games.
- Recommends booking face painters and balloon artists 2 weeks out.
```

---

## 25. MEMORY FAILURE & RESILIENCE BEHAVIOR

| Failure Mode | System Response & Fallback Behavior |
|---|---|
| **Context Query Timeout** | Gracefully degrades context to basic metadata (`type`, `date`, `total_budget`); omits granular breakdowns; chat remains functional. |
| **Corrupted Preference JSON** | Reverts to default neutral planning rules; logs non-fatal warning; does not crash UI. |
| **Missing Event Date** | Assistant politely prompts user: *"I noticed your event date isn't set yet. What date are you aiming for?"* |
| **Complete AI Outage** | Core application remains 100% operational; users manage tasks, budgets, and guests manually without disruption. |

---

## 26. TESTING AI MEMORY & CONTEXT INTEGRATION

The following integration test cases must pass in the automated testing suite:

| Test ID | Test Scenario | Execution Details | Expected Result |
|---|---|---|---|
| `MEM-01` | **Event Multi-Tenant Isolation** | User has Event 1 (Wedding) and Event 2 (Birthday). Ask chat in Event 2: "What is my event?" | Assistant answers "Birthday"; zero reference to Wedding data. |
| `MEM-02` | **Live Budget Sync** | User adds ₹1,00,000 expense in UI → Immediately asks chat: "How much have I spent?" | Assistant quotes the updated total spending figure immediately. |
| `MEM-03` | **Guest Count Sync** | User changes guest count from 200 to 350 → Asks chat for catering advice. | Assistant uses 350 headcount in catering advice. |
| `MEM-04` | **Deleted Event Purge** | Delete Event 1 → Query `/api/ai/chat` for Event 1 ID. | Returns `404 Not Found`; no cached context returned. |
| `MEM-05` | **Unauthorized Context Access** | User A calls `/api/ai/chat` using User B's `event_id`. | Returns `404 Not Found`; context builder never executes. |
| `MEM-06` | **Inference Guard** | User asks: "Are yellow flowers good?" → Next prompt: "What is my decor theme?" | Assistant does not claim theme is "Yellow flowers" unless saved in `event_preferences`. |

---

## 27. OBSERVABILITY & AUDIT LOGGING

### Safe Log Schema:
```json
{
  "timestamp": "2026-10-26T21:49:09.123Z",
  "event_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "action": "ai_context_assembled",
  "context_tokens_approx": 420,
  "domains_included": ["event", "budget", "tasks"],
  "history_turns_included": 4,
  "latency_ms": 38
}
```

### Prohibited in Logs:
- Plaintext user prompts or assistant answers (unless opt-in debugging is active).
- `GEMINI_API_KEY` or session JWTs.
- Guest phone numbers or emails.

---

## 28. FUTURE MEMORY ROADMAP (POST-MVP)

The following advanced capabilities are deliberately deferred to Post-MVP to preserve simplicity and zero infrastructure costs:

- **Explicit "Remember This" Command**: Allowing users to pin custom unstructured facts (e.g., *"Remember that Uncle Ramesh needs wheelchair access"*).
- **User Memory Management UI**: A settings view where users can browse, edit, and delete discrete AI memory nodes.
- **Semantic Vector Memory (RAG / pgvector)**: Vector similarity search across hundreds of past chat messages or supplier PDF contracts.
- **Global User Learning**: Transferring planning preferences across multiple events created by the same host.

---

## 29. PRACTICAL MEMORY ARCHITECTURE DIAGRAM

```text
                        USER INTERACTION
                               ↓
                      AI ASSISTANT PROMPT
                               ↓
               Authentication & Ownership Guard
             (auth.uid() verifies events.user_id)
                               ↓
                   CURRENT EVENT IDENTIFIER
                               ↓
         ┌─────────────────────┴─────────────────────┐
         ▼                                           ▼
[Normalized Database State]                 [Conversational State]
  - events (date, budget)                     - ai_conversations
  - budget_categories & expenses              - ai_messages (last 6 turns)
  - tasks & dependencies                      - event_preferences
  - vendors & guests (aggregates)
         └─────────────────────┬─────────────────────┘
                               ↓
                     CONTEXT BUILDER ENGINE
               - Intent-based domain pruning
               - Strict PII stripping (no emails/phones)
               - Token budget enforcement (< 1,500 tokens)
                               ↓
                   STRUCTURED PROMPT PIPELINE
                  System Prompt + Context + Query
                               ↓
                       GOOGLE GEMINI API
                               ↓
                   OUTPUT GUARD & VALIDATION
                               ↓
                PERSONALIZED ASSISTANT RESPONSE
                               ↓
                              USER
```

---

## 30. IMPLEMENTATION RESPONSIBILITY BOUNDARIES

```text
┌────────────────────────────────────────────────────────┐
│ APPLICATION RUNTIME OWNS:                              │
│ - Identity, sessions, and authentication (Supabase Auth)│
│ - Multi-tenant security and RLS policy enforcement      │
│ - Authoritative database storage (PostgreSQL)          │
│ - Mathematical calculations (Budget, Remaining, Spend) │
│ - Task states, deadlines, and dependencies             │
│ - Context assembly, PII scrubbing, and token limits    │
│ - Memory cascade deletion on event removal             │
├────────────────────────────────────────────────────────┤
│ AI MODEL OWNS:                                         │
│ - Natural-language phrasing and tone                   │
│ - Explaining trade-offs and options                    │
│ - Advisory planning suggestions                        │
│ - Cultural synthesis and theme ideas                   │
│ - Formatting structured draft proposals for user review│
└────────────────────────────────────────────────────────┘
```

The AI model is an advisory client to the application, never the owner of application data.

---

## 31. FINAL ACCEPTANCE CRITERIA

The AI Memory system is accepted as complete and compliant when:
1. The assistant accurately recalls the current event's date, budget, guest count, and preferences without re-prompting.
2. Complete data isolation is proven between different events owned by the same user.
3. Multi-tenant isolation is proven between different users (zero cross-user leakage).
4. Updating budget, tasks, or guest counts in the application immediately updates subsequent AI responses.
5. Authoritative database records unconditionally override contradictory conversational statements.
6. Casual AI inferences are never automatically saved as authoritative application preferences.
7. Secrets, API keys, passwords, and guest PII are strictly excluded from memory contexts and logs.
8. Deleting an event cleanly cascades and purges all conversational memory records.
9. If memory retrieval or Gemini encounters an outage, core planning features remain 100% operational.
10. The memory architecture requires zero external paid memory services, operating entirely within the free-tier Next.js + Supabase foundation.

---

## 32. FINAL PROJECT RULES

1. **AI memory is strictly advisory; PostgreSQL is the sole source of truth.**
2. **Deterministic business logic and database records always override AI context.**
3. **Memory is scoped strictly to the authenticated user and active `event_id`.**
4. **Never send secrets, tokens, or personal contact PII into AI memory.**
5. **Never allow AI to directly mutate application state without explicit user confirmation.**
6. **Core event planning functionality must remain 100% operational when AI is offline.**
7. **Keep context payloads minimal (< 1,500 tokens) to ensure fast, low-cost operations.**
8. **Preserve the approved UtsavAI UI/UX design without modification.**
9. **AI must never execute `git commit` or `git push` commands.**
10. **The project owner manually performs all Git commits and pushes.**

---

## 33. AI DEVELOPMENT MEMORY RULE

> ### PERMANENT AI AGENT INSTRUCTION
>
> Every completed or partially completed development task must update this `docs/16-AI-MEMORY.md` document.
>
> The AI agent must read this document before starting the next task.
>
> **Never create another memory file** (e.g., `memory.md`, `AI-Memory.md`, `MEMORY.md` are strictly prohibited).
>
> Each progress entry should contain:
> - **Date**
> - **Step/task**
> - **What was implemented**
> - **Files changed**
> - **Verification status**
> - **Known issues**
> - **Remaining work**
> - **Next step**
> - **Recommended Git commit message**
>
> The AI agent must never execute `git commit` or `git push` automatically.
> The developer will manually review and commit the changes.

---

## 34. MANDATORY PROJECT RULES FOR CODING AGENTS

Future AI coding agents working on UtsavAI must strictly obey these mandatory rules:

1. **Preserve Existing Frontend**: The existing frontend, UI/UX designs, component hierarchy, and styling in `frontend/src/` must be preserved. Do not redesign UI/UX or unnecessarily rebuild completed screens.
2. **Supabase PostgreSQL as Sole Authoritative Database**: All application state belongs in normalized PostgreSQL tables. Client state is transient presentation only.
3. **Supabase Auth for Identity**: Supabase Auth handles all sessions and identities. The application never stores passwords or rolls custom auth crypto.
4. **Row Level Security (RLS) Mandatory**: Every public schema table must have RLS enabled with explicit policies. Never use `USING (true)` for user-scoped entities.
5. **Server-Side AI/Gemini Execution**: Gemini API calls and `GEMINI_API_KEY` must remain strictly on the server (Route Handlers/Server Actions). Never expose AI keys or prompt templates to the browser.
6. **Validate AI Output**: AI-generated structured plans must be validated against schemas and stored in `ai_generated_plans` for user review before writing to authoritative application tables (`tasks`, `budget_categories`, etc.).
7. **Protect Secrets**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components or browsers. Never commit secrets, tokens, or environment files containing real credentials.
8. **Never Execute Automated Git Commit/Push**: AI agents must never run `git commit`, `git push`, `git reset`, or `git rebase`. All Git operations are manually managed by the developer.
9. **Update AI Memory After Every Task**: After every implementation task, update this same document (`docs/16-AI-MEMORY.md`).
10. **Provide Recommended Commit Message**: After every task, provide the exact recommended Git commit message for the developer to execute manually.

---

## 35. PROJECT IMPLEMENTATION STATUS & PROGRESS LOG

### Current Implementation Status

| Stage / Step | Module Name | Status |
|---|---|---|
| **Step 1** | **Supabase + Database Foundation** | **COMPLETED** |
| **Step 2** | **API Route Handlers** | **PENDING** |
| **Step 3** | **Authentication & Session Management** | **PENDING** |
| **Step 4** | **AI Planning Engine (Gemini 1.5 Flash)** | **PENDING** |
| **Step 5** | **Frontend State & Real Data Migration** | **PENDING** |
| **Step 6** | **End-to-End Testing & Hardening** | **PENDING** |
| **Step 7** | **Production Deployment & DevOps** | **PENDING** |

---

### Progress Entry: Step 1 — Supabase + Database Foundation

- **Date:** 2026-10-27
- **Step / Task:** STEP 1 — SUPABASE + DATABASE FOUNDATION
- **Status:** **COMPLETED**

#### What Was Implemented:
1. **Installed Supabase Client SDKs**:
   - Installed `@supabase/supabase-js` (`^2.118.0`) and `@supabase/ssr` (`^0.12.7`) in `frontend/package.json`.
2. **Supabase Client Factories**:
   - **Browser Client** (`frontend/src/lib/supabase/client.ts`): Uses `createBrowserClient` with `Database` types for safe client-side operations.
   - **Server Client** (`frontend/src/lib/supabase/server.ts`): Uses `createServerClient` with Next.js 15+ async `cookies()` context (`getAll`/`setAll`) for Server Components, Route Handlers, and Server Actions.
   - **Server-Only Admin Client** (`frontend/src/lib/supabase/admin.ts`): Uses `SUPABASE_SERVICE_ROLE_KEY` with strict runtime window guard throwing an error if called in a browser environment.
   - **Module Barrel Export** (`frontend/src/lib/supabase/index.ts`): Exports `createBrowserClient`, `createServerClient`, `createAdminClient`, and re-exports database types.
3. **Database Schema & Migration**:
   - Created reproducible initial schema migration (`20261026000000_initial_schema.sql`) in both `frontend/supabase/migrations/` and `supabase/migrations/`.
   - Defines all 15 normalized tables:
     1. `profiles`
     2. `events`
     3. `event_preferences`
     4. `budget_categories`
     5. `vendors`
     6. `expenses`
     7. `tasks`
     8. `task_dependencies`
     9. `event_milestones`
     10. `event_schedule_items`
     11. `guests`
     12. `notifications`
     13. `ai_conversations`
     14. `ai_messages`
     15. `ai_generated_plans`
   - **UUID Primary Keys**: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` across all tables.
   - **Foreign Keys**: `ON DELETE CASCADE` on event-parent relationships, `ON DELETE SET NULL` on optional references (`expenses.category_id`, `expenses.vendor_id`, `event_schedule_items.responsible_vendor_id`).
   - **Data Constraints**: Controlled string `CHECK` constraints on enums (`type`, `status`, `priority`, `role`), non-negative amount checks (`total_budget >= 0`, `planned_amount >= 0`, `actual_amount >= 0`, `quoted_price >= 0`, `guest_count >= 0`), valid event time order (`end_time > start_time`), non-self task dependency (`task_id <> depends_on_task_id`), and uniqueness constraints (`budget_categories(event_id, name)`, `task_dependencies(task_id, depends_on_task_id)`).
   - **Monetary Precision**: Exact `NUMERIC(12, 2)` on all monetary fields.
   - **Indexes**: 28 targeted indexes for high-frequency queries, foreign key joins, chronological sorting, and RLS lookups.
   - **Automated Triggers**: `update_updated_at_column()` attached to all mutable tables; `handle_new_user()` trigger on `auth.users AFTER INSERT` to provision `public.profiles` automatically.
4. **Row Level Security (RLS)**:
   - Enabled RLS on all 15 public schema tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
   - Implemented strict ownership policies verifying `auth.uid()` directly or via parent `events.user_id = auth.uid()`. Zero `USING (true)`.
5. **TypeScript Database Types**:
   - Created `frontend/src/types/database.ts` with complete `Database`, `Row`, `Insert`, `Update`, and union enum type definitions.
6. **Environment Configuration**:
   - Created `frontend/.env.example` and `.env.example` with placeholders for Supabase and Gemini.
   - Appended local Supabase placeholders to `frontend/.env` while preserving existing `DATABASE_URL`.

#### Files Changed / Created:
- `frontend/src/lib/supabase/client.ts` (created)
- `frontend/src/lib/supabase/server.ts` (created)
- `frontend/src/lib/supabase/admin.ts` (created)
- `frontend/src/lib/supabase/index.ts` (created)
- `frontend/src/types/database.ts` (created)
- `frontend/supabase/migrations/20261026000000_initial_schema.sql` (created)
- `supabase/migrations/20261026000000_initial_schema.sql` (created)
- `frontend/.env.example` (created)
- `.env.example` (created)
- `frontend/package.json` (modified — added `@supabase/supabase-js`, `@supabase/ssr`)
- `frontend/package-lock.json` (modified)
- `frontend/.env` (modified — appended local placeholder variables)

#### Verification Status:
- **TypeScript**: All newly created files in `frontend/src/lib/supabase/*` and `frontend/src/types/database.ts` pass strict TypeScript verification without errors.
- **ESLint**: Passed with 0 errors and 0 warnings on new files.
- **Frontend Stability**: Existing frontend components, views, and Zustand store preserved completely without regression.

#### Known Issues (Pre-existing, Non-blocking):
- 3 pre-existing React 19 ESLint warnings in `carousel.tsx`, `timeline.tsx`, and `use-mobile.ts` (`react-hooks/set-state-in-effect`).
- Missing dependencies in scaffolded example directory `examples/websocket/`.

#### Scope Boundaries & What Is NOT Completed Yet:
- **Authentication**: Supabase Auth login/signup UI, session cookies, and middleware protection are **NOT** implemented yet (scheduled for Step 3).
- **API Implementation**: Next.js route handlers connecting real Supabase queries to endpoints are **NOT** implemented yet (scheduled for Step 2).
- **Gemini / AI Integration**: Gemini 1.5 Flash assistant and plan generator are **NOT** implemented yet (scheduled for Step 4).
- **Frontend Store Migration**: UI components currently continue reading mock data until API handlers and client data fetching are wired up in Step 5.
- **Deployment**: Production deployment and CI/CD pipelines are **NOT** executed yet (scheduled for Step 7).

#### Remaining Work / Next Step:
- **Next Step:** `STEP 2 — API ROUTE HANDLERS` (Implementing Next.js App Router API endpoints for Events, Preferences, Budget, Tasks, Vendors, Guests, and Notifications using Supabase server client and Zod validation).

#### Recommended Git Commit Message:
```text
docs: update AI memory with verified Supabase foundation
```


