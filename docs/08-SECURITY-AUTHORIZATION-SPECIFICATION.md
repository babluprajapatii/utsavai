# UtsavAI - Security, Authentication & Authorization Specification

**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Source documents:** `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`, `05-API-SPECIFICATION.md`, `06-AI-SPECIFICATION.md`, `07-UI-UX-SPECIFICATION.md`
**Purpose:** Define security architecture and authorization rules for UtsavAI.
**Intended audience:** Backend developers, security engineers, QA, DevOps.

---

## 1. Document Information

- **Document name:** 08-SECURITY-AUTHORIZATION-SPECIFICATION.md
- **Product:** UtsavAI
- **Version:** 1.0
- **Status:** Draft
- **Source documents:** All preceding technical documents
- **Purpose:** Define security and authorization architecture
- **Intended audience:** Backend, security, QA, DevOps

---

## 2. Security Objectives

Primary objectives:

- Protect user accounts
- Protect event data
- Prevent unauthorized event access
- Protect API endpoints
- Protect AI credentials
- Protect database credentials
- Prevent accidental cross-user data access
- Validate all user input
- Protect sensitive data
- Maintain secure authentication state
- Provide safe error handling

Security must not unnecessarily complicate the MVP.

---

## 3. Threat Model

### Account Threats

- Credential theft
- Weak passwords
- Unauthorized login attempts
- Session misuse

### Application Threats

- Broken authorization
- IDOR / insecure direct object references
- Malicious input
- XSS
- CSRF where applicable
- API abuse
- Enumeration
- Unauthorized mutations

### Data Threats

- Cross-user event access
- Unauthorized guest/vendor information access
- Accidental exposure of private event data

### AI Threats

- Prompt injection
- Sensitive data leakage
- AI-generated malicious content
- AI hallucination
- Provider credential exposure
- Excessive AI usage

### Infrastructure Threats

- Exposed environment variables
- Misconfigured deployment
- Insecure database access

Do not claim protection against threats that are not actually implemented.

---

## 4. Security Principles

- Least privilege
- Defense in depth
- Secure by default
- Server-side authorization
- Input validation
- Output validation
- Minimal data exposure
- Fail safely
- Never trust client-side authorization
- Never expose secrets to the browser

---

## 5. Authentication

Uses architecture from project documents.

Primary authentication: Email/password via Supabase Auth.

Google authentication may be supported if configured.

### Registration

User provides:

- Name
- Email
- Password

Authentication provider manages credentials.

Application must not store plaintext passwords.

### Login

User provides:

- Email
- Password

### Logout

Session must be invalidated appropriately.

---

## 6. Session Management

- Authenticated session handling
- Session expiration behavior
- Logout behavior
- Unauthorized request behavior
- Session persistence

Do not expose authentication tokens unnecessarily to client code.

Use authentication provider's recommended secure session mechanism.

---

## 7. Authorization Model

Basic rule:

**A registered user can access only the events and event-related records they are authorized to access.**

Ownership chain:

```
User
↓
Event
↓
Tasks
↓
Expenses
↓
Vendors
↓
Guests
↓
Timeline
↓
Notifications
↓
AI conversations
```

A user must not access another user's event data by changing an event ID or record ID.

---

## 8. Event Ownership

Every event belongs to a user.

```text
events.user_id → authenticated user
```

For every event operation:

1. Authenticate the user.
2. Resolve the requested event.
3. Verify event ownership.
4. Only then perform the requested action.

Never rely only on frontend hiding.

Server-side enforcement is mandatory.

---

## 9. Child Resource Authorization

Resources such as tasks, vendors, guests, expenses, milestones, notifications, AI conversations must be authorized through parent event.

Example:

User requests:

```text
/api/tasks/:taskId
```

Server must verify:

```
Task
↓
Event
↓
Authenticated User
```

If event does not belong to authenticated user:

Return appropriate authorization / not-found response.

Do not leak whether another user's record exists.

---

## 10. API Security

Every protected API route must:

- Verify authentication
- Validate input
- Verify authorization
- Perform business validation
- Execute operation
- Return safe response

Do not trust:

- User IDs supplied by client
- Event ownership supplied by client
- Role information supplied by client
- Calculated budget values supplied by client
- AI-generated authorization decisions

Authenticated identity must come from trusted authentication context.

---

## 11. Input Validation

Validate all incoming data.

Examples:

### Event

- Name
- Type
- Date
- Time
- Guest count
- Budget
- Location

### Task

- Title
- Priority
- Status
- Due date

### Vendor

- Name
- Category
- Cost
- Status

### Guest

- Name
- RSVP status
- Contact information

### Expense

- Category
- Amount
- Date

Validation should include:

- Required fields
- Type checking
- Enum validation
- Length limits
- Numeric limits
- Date validity
- Safe string handling

Use validation approach from implementation architecture.

---

## 12. Output Safety

User-generated content must not be blindly rendered as executable HTML.

Protect against:

- XSS
- Malicious markup
- Unsafe URLs
- Unsafe HTML

Prefer rendering user content as text.

If rich HTML is ever introduced, use trusted sanitization mechanism.

---

## 13. Database Security

Use PostgreSQL through Supabase.

Database access must enforce user/event ownership.

Where appropriate, use Supabase Row Level Security.

Core principle:

A database request must not allow one user to read or modify another user's event records.

Define security considerations for:

- events
- tasks
- task_dependencies
- budget_categories
- expenses
- vendors
- guests
- event_schedules
- ai_conversations
- ai_messages
- notifications

Do not assume frontend filtering is database security.

---

## 14. SUPABASE ROW LEVEL SECURITY

Expected authorization model conceptually:

```text
Authenticated user
↓
Can access event
IF
event.user_id = authenticated user ID
```

Child resources:

```text
Child.event_id
↓
Parent event
↓
Parent.user_id = authenticated user ID
```

Do not provide fabricated SQL unless explicitly required by another document.

If exact policies remain an implementation decision, mark:

`OPEN DECISION`

---

## 15. ROLE MODEL

Current roles:

### Registered User

Primary product user.

Can:

- Manage own events
- Manage own event data
- Use AI planning
- Export own plans

### Administrator

Optional role from the PRD.

Potential capabilities:

- Manage event templates
- Manage categories
- Manage reported content
- Monitor system health
- Manage AI configuration

Do not give administrator functionality to normal users.

Do not build complex RBAC system unless required.

---

## 16. ADMIN SECURITY

If an admin panel is implemented:

- Admin access must be server-side authorized.
- Admin role must not come from client-controlled field.
- Admin APIs must perform explicit role checks.
- Admin pages must not merely be hidden from navigation.

If admin functionality is deferred:

Mark it:

`POST-MVP`

---

## 17. ENVIRONMENT VARIABLES

Define secret handling.

Never commit secrets to Git.

Examples of secrets/configuration:

- Supabase service credentials
- AI provider API key
- Authentication secrets
- Production configuration

Client-exposed configuration must be intentionally public.

Server-only secrets must never be bundled into browser code.

Use environment variables.

---

## 18. AI API KEY SECURITY

Gemini API key must remain server-side.

Correct:

```
Browser
↓
Application API
↓
Server
↓
Gemini
```

Incorrect:

```
Browser
↓
Gemini API directly with secret key
```

Frontend must never contain private AI provider API key.

---

## 19. AI AUTHORIZATION

Before AI request:

1. Authenticate user.
2. Verify event ownership.
3. Retrieve permitted event context.
4. Build minimal context.
5. Send request to AI provider.

AI must not be allowed to retrieve arbitrary database records.

User cannot use AI request to bypass normal authorization.

---

## 20. AI PROMPT INJECTION

Treat user-controlled content as untrusted.

Potential injection sources:

- Chat messages
- Event descriptions
- Task descriptions
- Vendor notes
- Guest notes

User content must not override:

- System instructions
- Security rules
- Authorization rules
- Application policies

Never reveal:

- System prompts
- Internal instructions
- API keys
- Environment variables
- Database credentials
- Hidden security configuration

---

## 21. AI OUTPUT SECURITY

AI output must be treated as untrusted data.

Before use:

```
AI output
↓
Schema validation
↓
Business validation
↓
Application logic
```

Do not directly execute AI-generated:

- SQL
- JavaScript
- HTML
- Shell commands
- Database operations

AI-generated monetary values must be validated.

AI-generated dates must be validated.

---

## 22. SENSITIVE DATA MINIMIZATION

Only send required information to AI provider.

Avoid unnecessarily sending:

- Guest phone numbers
- Guest email addresses
- Vendor contact details
- Private notes
- Authentication information
- Internal identifiers

Use summarized data where possible.

Example:

Instead of sending all 250 guest records:

Send:

```json
{
  "guest_count": 250,
  "accepted": 180,
  "pending": 50,
  "declined": 20
}
```

unless individual records are actually required.

---

## 23. ERROR HANDLING

Do not expose internal implementation details to users.

Avoid exposing:

- Stack traces
- SQL errors
- API keys
- Provider internals
- Database structure
- Internal paths

User-facing errors should be simple.

Example:

Instead of:

```text
PostgreSQL error: relation public.events...
```

show:

"Something went wrong while loading this event."

Detailed errors may be logged securely on server.

---

## 24. RATE LIMITING / ABUSE PROTECTION

Consider rate limiting for:

- Login
- Registration
- AI generation
- AI chat
- Expensive API operations

Exact limits should not be invented if not defined elsewhere.

Mark exact values:

`OPEN DECISION`

Because project targets free infrastructure, use lightweight protection rather than introducing Redis.

---

## 25. CSRF

Define CSRF protection according to selected authentication/session architecture.

Do not invent a custom CSRF mechanism if framework/provider already provides appropriate protections.

Any state-changing endpoint must follow security model of selected Next.js/Supabase architecture.

---

## 26. CORS

The application should not expose APIs to arbitrary origins unnecessarily.

If APIs are same-origin:

Prefer same-origin architecture.

If cross-origin access becomes necessary:

Explicitly configure allowed origins.

Do not use unrestricted wildcard access for authenticated APIs unless there is a documented reason.

---

## 27. SECURITY HEADERS

Define appropriate production security headers where supported.

Consider:

- Content Security Policy
- X-Content-Type-Options
- Referrer-Policy
- Frame protection
- Permissions Policy

Do not claim a header is implemented unless actually configured.

Separate:

`Required`
from
`Recommended`
from
`OPEN DECISION`

---

## 28. FILE / STORAGE SECURITY

If Supabase Storage is used:

- Files must belong to an authorized event/user.
- Storage access must follow ownership rules.
- Users must not access another user's private files.
- File type and size should be validated.
- Never trust the client-provided file type alone.

Do not build file upload functionality unless required by product documents.

---

## 29. DATA PRIVACY

Define privacy principles:

- Collect only required information.
- Store only required information.
- Restrict access by ownership.
- Avoid unnecessary third-party data sharing.
- Do not expose private event information publicly by default.

Privacy Policy and Terms pages are required before production launch.

---

## 30. DATA DELETION

Define expected deletion behavior.

When a user deletes an event:

Determine how related tasks, expenses, vendors, guests, milestones, notifications, AI conversations are handled.

Do not silently invent cascade behavior.

If not specified by database document:

Mark:

`OPEN DECISION`

The final implementation must use one explicit, tested strategy.

---

## 31. LOGGING

Security logs may include:

- Authentication failures
- Authorization failures
- API failures
- AI provider failures
- Validation failures

Never log sensitive information unnecessarily.

Do not log:

- Passwords
- API keys
- Auth tokens
- Full sensitive personal information

---

## 32. CLIENT-SIDE SECURITY

Never consider client-side checks sufficient.

Examples:

```text
if (userCanEdit) {
   showEditButton()
}
```

The server must independently verify authorization.

The frontend may hide unavailable actions for UX, but the backend remains authoritative.

---

## 33. SECURITY FOR EXPORT

PDF and ICS export must only include data the authenticated user is authorized to access.

Export must verify event ownership.

A user must not generate an export by providing another user's event ID.

---

## 34. SECURITY FOR NOTIFICATIONS

Notifications must be scoped to the authenticated user/event.

Users must not be able to read or manipulate another user's notifications.

---

## 35. SECURITY FOR SEARCH / FILTERING

If search or filtering is implemented:

Filtering must happen within the authorized dataset.

Do not retrieve all users' data and filter it in the browser.

---

## 36. SECURITY TEST SCENARIOS

### Authentication

- Invalid credentials
- Expired session
- Logged-out access
- Registration validation

### Authorization

- User A accesses User B's event
- User A edits User B's task
- User A deletes User B's vendor
- User A reads User B's guests
- User A accesses User B's AI conversation

All must fail safely.

### Input

- Invalid dates
- Negative budget
- Invalid status
- Excessive string lengths
- Malformed IDs

### AI

- Prompt injection
- Invalid AI JSON
- AI provider failure
- AI timeout
- AI rate limit
- AI-generated invalid date
- AI-generated negative amount

### Export

- Unauthorized event export
- Invalid event ID

---

## 37. SECURITY REQUIREMENTS TRACEABILITY

Create:

```text
| Requirement | Security Control | Layer | Verification |
```

Map relevant FRS/NFR requirements to security controls.

---

## 38. SECURITY CHECKLIST

### Authentication

- [ ] Secure registration
- [ ] Secure login
- [ ] Secure logout
- [ ] No plaintext passwords
- [ ] Session handling defined

### Authorization

- [ ] Event ownership enforced
- [ ] Child resources protected
- [ ] Server-side authorization
- [ ] Admin authorization defined

### API

- [ ] Authentication checked
- [ ] Input validated
- [ ] Authorization checked
- [ ] Safe errors
- [ ] Abuse protection considered

### Database

- [ ] Ownership model defined
- [ ] RLS considered
- [ ] Cross-user access prevented

### AI

- [ ] API key server-side
- [ ] Context access authorized
- [ ] Prompt injection considered
- [ ] Output validated
- [ ] AI cannot directly mutate DB

### Privacy

- [ ] Data minimization
- [ ] Privacy Policy
- [ ] Terms and Conditions
- [ ] Sensitive data protected

### Production

- [ ] HTTPS
- [ ] Environment variables
- [ ] Security headers reviewed
- [ ] Secrets excluded from Git

Do not mark `[x]` unless actually verified.

---

## 39. OPEN SECURITY DECISIONS

List unresolved decisions explicitly.

Examples:

- Exact password policy
- Exact session duration
- Exact rate limits
- Exact RLS policies
- Admin implementation
- Storage upload requirements
- Security header configuration
- Event deletion/cascade strategy
- Log retention period

Use:

`OPEN DECISION`

Do not silently invent values.

---

## 40. FINAL PROJECT RULE

This document is a security specification.

It must be implementation-ready but must not contain unnecessary complexity.

Prefer the existing stack:

- Next.js
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase RLS
- Vercel
- Gemini through a server-side API

Do NOT introduce:

- Kubernetes
- Microservices
- Redis
- Elasticsearch
- Dedicated authentication servers
- Paid security infrastructure

unless a later project requirement explicitly requires them.

IMPORTANT:

**AI must never perform Git commit or Git push operations. Git commit and Git push will always be performed manually by the project owner.**

Save as:

```text
docs/08-SECURITY_AUTHORIZATION-SPECIFICATION.md
```

---

**Document complete.**