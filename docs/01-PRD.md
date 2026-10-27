# UtsavAI — Product Requirements Document

**Version:** 1.0
**Status:** Draft for review
**Product:** UtsavAI — AI-powered Celebration & Event Planning Platform

---

# 1. Project Identity

## 1.1 Product Name

**UtsavAI**

## 1.2 Product Category

AI-powered Celebration & Event Planning Platform

## 1.3 Product Tagline

**Plan celebrations smarter.**

UtsavAI helps people plan and manage celebrations:

- Weddings
- Birthdays
- Community events
- Family celebrations
- Custom events

Product reduces planning workload by bringing event setup, budgeting, expenses, tasks, timelines, vendors, guests, event-day scheduling, reminders, personalization, and AI-assisted planning into one application.

---

# 2. Product Vision

## 2.1 Core Journey

```text
"I need to organize an event"
        ↓
  Create Event
        ↓
  Enter Event Details
        ↓
      Set Budget
        ↓
 Generate Event Plan
        ↓
   Review & Edit
        ↓
 Manage Timeline
        ↓
   Manage Tasks
        ↓
  Manage Vendors
        ↓
 Manage Guests
        ↓
  Track Expenses
        ↓
Prepare Event-Day Schedule
        ↓
   AI Planning Assistant
        ↓
     Export / Share
```

Ultimate goal: user moves from event idea to clear, actionable, manageable event plan.

---

# 3. Important Product Principles

### Principle 1 — Simplicity

Build useful product, not unnecessarily complex platform.

### Principle 2 — AI assists, user controls

AI recommends, generates, explains, assists.

User always able to:

- Review AI output
- Edit it
- Reject it
- Create information manually

AI never sole source of truth.

### Principle 3 — Deterministic logic stays in code

Application code handles:

- Money calculations
- Date calculations
- Task dependencies
- Authentication
- Authorization
- Database operations
- Validation
- Permission checks
- Status transitions
- Risk rules

AI not responsible for authoritative operations.

### Principle 4 — Zero-cost-first architecture

MVP designed around free/open-source technologies and free hosting tiers.

No paid infrastructure unless genuinely necessary.

### Principle 5 — Build only what creates user value

Avoid unnecessary infrastructure and features.

---

# 4. Target Users

## 4.1 Guest User

Visitor who has not created account.

Capabilities:

- View landing page
- Understand UtsavAI
- Explore example event plans
- Start planning
- Register/login when persistence required

## 4.2 Registered User

Primary application user.

Capabilities:

- Create events
- Edit events
- Delete events
- Set budgets
- Track expenses
- Create and manage tasks
- Manage planning timelines
- Manage vendors
- Manage guests
- Manage event-day schedule
- Receive in-app notifications
- Generate AI event plans
- Chat with AI planning assistant
- Export event plans

## 4.3 Administrator

Optional, secondary for MVP.

Potential capabilities:

- View users
- Manage reported content
- Manage event templates
- Manage predefined categories
- Monitor system health
- Manage AI configuration

Administrator functionality marked optional unless required for MVP.

---

# 5. Event Types

Initial event types:

- Wedding
- Birthday
- Community Event
- Family Celebration
- Custom Event

Product architecture allows additional event types later without major redesign.

---

# 6. Core Product Features

## 6.1 Authentication

Requirements:

- User registration
- Login
- Logout
- Session handling
- Password management
- Protected application routes
- Authorization
- Optional Google authentication if supported by selected free configuration

Social login not mandatory for MVP.

## 6.2 Event Management

Users can:

- Create an event
- View an event
- Edit an event
- Delete an event
- Switch between events

Event information includes:

- Event name
- Event type
- Description
- Event date
- Start time
- End time
- Location
- Expected guest count
- Total budget
- Currency
- Theme
- Style
- Priorities
- Special requirements

Example:

```text
Event:
Wedding

Date:
15 December 2026

Guests:
250

Budget:
₹5,00,000

Priority:
Food + Decoration

Style:
Traditional
```

## 6.3 Dashboard

Dashboard must provide immediate overview of user's event.

Must show relevant information such as:

- Upcoming events
- Event progress
- Budget overview
- Budget utilization
- Task progress
- Upcoming deadlines
- Vendor status
- Guest/RSVP status
- Important warnings
- Recent activity
- Relevant notifications

User should not navigate through multiple screens simply to understand current state of event.

## 6.4 AI Event Plan Generator

Primary differentiating feature.

After event information entered, system may generate:

- Suggested tasks
- Planning timeline
- Budget allocation suggestions
- Vendor categories
- Guest-management checklist
- Event-day schedule
- Planning recommendations
- Risk reminders

Required conceptual flow:

```text
User Input
    ↓
Validation
    ↓
Structured Event Object
    ↓
AI Planning Engine
    ↓
Structured AI Output
    ↓
Schema Validation
    ↓
Business Rule Validation
    ↓
Database
    ↓
Dashboard
```

Critical requirement:

**AI must never directly modify database.**

AI output must pass through validation and business rules before persistence.

User should review and modify generated content.

## 6.5 Budget Planner

Budget system must be deterministic.

Users can:

- Define total budget
- Create budget categories
- Set planned amounts
- Record expenses
- Edit expenses
- Delete expenses
- Compare planned vs actual spending
- View remaining budget
- View utilization percentage
- View expense history
- Receive budget warnings

Example:

```text
Total Budget: ₹5,00,000

Venue             ₹1,50,000
Food              ₹1,25,000
Decoration          ₹75,000
Photography         ₹50,000
Entertainment       ₹30,000
Transportation      ₹20,000
Contingency         ₹50,000
--------------------------------
Total              ₹5,00,000
```

Authoritative calculations:

```text
Remaining Budget =
Total Budget - Actual Expenses

Budget Utilization =
Actual Expenses / Total Budget × 100
```

Calculations must be performed by application code, not AI.

PRD must define edge cases:

- Zero budget
- Negative values
- Expense exceeding budget
- Deleted categories with existing expenses
- Decimal currency values
- Currency changes after expenses exist

## 6.6 Task Management

Tasks support:

- Task name/title
- Description
- Category
- Owner/assignee
- Due date
- Priority
- Status
- Dependencies

Statuses:

```text
Not Started
In Progress
Completed
```

Priorities:

```text
Low
Medium
High
Critical
```

Example:

| Task | Deadline | Priority | Status |
|---|---|---|---|
| Book venue | 30 Nov | Critical | Completed |
| Confirm caterer | 5 Dec | High | In Progress |
| Send invitations | 7 Dec | High | Not Started |
| Final decoration | 14 Dec | Medium | Not Started |

Tasks can depend on other tasks.

Example:

```text
Select Venue
      ↓
Book Caterer
      ↓
Finalize Menu
      ↓
Confirm Guest Count
```

PRD defines dependency behavior, including invalid/circular dependencies.

## 6.7 Planning Timeline

Product supports long-term planning timeline based on event date.

Example:

```text
90 Days Before
    ↓
Book venue

60 Days Before
    ↓
Confirm catering
    ↓
Book photographer

45 Days Before
    ↓
Send invitations

30 Days Before
    ↓
Finalize guest list

14 Days Before
    ↓
Confirm vendors

7 Days Before
    ↓
Final event checklist

1 Day Before
    ↓
Venue inspection

Event Day
    ↓
Execute schedule
```

Timeline combines:

- Predefined planning rules
- Event-specific information
- AI suggestions where useful

PRD must clearly distinguish:

### Planning Timeline

Weeks/months before event.

### Event-Day Schedule

Hour-by-hour execution on event day.

## 6.8 Vendor Management

Users maintain vendor records.

Fields:

- Vendor name
- Category
- Contact information
- Estimated cost
- Actual cost
- Status
- Notes
- Booking date

Categories:

- Venue
- Catering
- Photography
- Decoration
- Music
- Transportation
- Security
- Entertainment
- Other

Statuses:

```text
Researching
Shortlisted
Contacted
Negotiating
Booked
Completed
Cancelled
```

For MVP:

**No vendor marketplace.**

Vendor module is personal event-management workspace.

## 6.9 Guest Management

Guest records include:

- Guest name
- Group/family
- Contact
- RSVP status
- Meal preference
- Special requirements
- Notes

RSVP statuses:

```text
Pending
Accepted
Declined
```

Dashboard summary:

```text
Total Guests: 250
Confirmed: 180
Pending: 50
Declined: 20
```

No SMS, WhatsApp, or paid invitation delivery for MVP.

## 6.10 Event-Day Schedule

Users create and manage event-day schedule.

Example:

```text
09:00  Decoration setup
10:30  Vendor arrival
11:00  Photography begins
12:00  Guest arrival
12:30  Ceremony
14:00  Lunch
16:00  Entertainment
18:00  Main celebration
20:00  Closing
```

Schedule supports:

- Time
- Activity
- Description
- Responsible person/vendor where applicable
- Notes
- Ordering

## 6.11 AI Planning Assistant

AI assistant must understand current event context.

Not generic chatbot disconnected from application.

Conceptual flow:

```text
User
 ↓
Chat Interface
 ↓
Authenticated API
 ↓
Current Event Context
 ↓
Planning Rules
 ↓
Prompt Builder
 ↓
AI Model
 ↓
Response
 ↓
User
```

Example user question:

> "My budget is getting too high. What should I reduce?"

AI may receive relevant structured context such as:

```json
{
  "event_type": "wedding",
  "guest_count": 250,
  "budget": 500000,
  "spent": 465000,
  "categories": {
    "venue": 150000,
    "food": 125000,
    "decoration": 95000,
    "photography": 55000
  }
}
```

Assistant should make recommendations based on actual application data.

AI must not:

- Invent vendor availability
- Invent current vendor prices
- Claim access to unavailable external information
- Override application calculations
- Bypass authorization
- Directly write arbitrary database data

## 6.12 Personalization

Recommendations may consider:

- Event type
- Guest count
- Budget
- Location
- Style
- Priorities
- User preferences
- Time remaining

Example:

```text
Budget-conscious wedding
+
250 guests
+
Traditional style
+
60 days remaining
```

should produce different recommendations from:

```text
Luxury wedding
+
100 guests
+
Modern style
+
180 days remaining
```

PRD defines personalization requirements without overengineering MVP.

## 6.13 Risk Detection

Application identifies common planning risks using deterministic rules.

### Budget Risk

```text
Actual spending > 90% of total budget
```

→ Show budget warning.

### Timeline Risk

```text
Critical task is overdue
```

→ Show timeline warning.

### Guest Risk

```text
Large number of guests remain pending
```

→ Show RSVP warning.

### Vendor Risk

```text
Event date approaching
AND
required vendor not booked
```

→ Show vendor warning.

Clearly distinguish:

- Deterministic system warnings
- AI recommendations

## 6.14 Notifications

MVP prioritizes in-app notifications.

Examples:

```text
⚠ Your catering task is overdue.

⚠ You have used 92% of your budget.

✓ Venue booking completed.

⏰ Photography booking is due tomorrow.
```

No paid SMS, WhatsApp APIs, transactional email infrastructure for MVP.

## 6.15 Export

Users export event plan.

Export includes:

- Event summary
- Event information
- Budget
- Expenses
- Tasks
- Planning timeline
- Vendors
- Guests
- Event-day schedule

Potential formats:

- PDF
- `.ics` calendar file

Prefer free/open-source/client-side approaches.

---

# 7. Public Pages

## 7.1 Home

Sections may include:

- Hero
- Product explanation
- Event type selection
- Key features
- How it works
- AI planning demonstration
- Budget planning demonstration
- Timeline demonstration
- Call to action
- Footer

Primary CTA:

**Start Planning**

## 7.2 About

Explain:

- Problem
- Solution
- Technology
- AI capabilities
- Intended users

## 7.3 Features

Show:

- Smart planning
- Budget management
- Timeline
- Task management
- Vendor management
- Guest management
- AI assistant
- Export/share

## 7.4 FAQ

Include questions such as:

- What events can I plan?
- Is UtsavAI free?
- How does AI generate recommendations?
- Can I modify AI-generated plans?
- Can I export my plan?
- Is my data saved?

## 7.5 Login

- Email/password
- Optional Google authentication

## 7.6 Registration

Fields:

- Name
- Email
- Password

---

# 8. Authenticated Application Pages

PRD defines requirements for:

- Dashboard
- Events
- Create Event
- Event Overview
- Budget
- Expenses
- Tasks
- Timeline
- Vendors
- Guests
- Event-Day Schedule
- AI Assistant
- Notifications
- Export

Do not define detailed UI implementation here. That belongs in `02-DESIGN.md`.

---

# 9. Functional Requirements

Create uniquely identifiable functional requirements.

At minimum define:

```text
FR-01 User Registration
FR-02 User Login
FR-03 User Logout
FR-04 Event Creation
FR-05 Event Viewing
FR-06 Event Editing
FR-07 Event Deletion
FR-08 Budget Management
FR-09 Expense Tracking
FR-10 Task Management
FR-11 Task Dependencies
FR-12 Planning Timeline
FR-13 Vendor Management
FR-14 Guest Management
FR-15 Event-Day Schedule
FR-16 AI Event Plan Generation
FR-17 AI Planning Assistant
FR-18 Personalization
FR-19 Risk Detection
FR-20 In-App Notifications
FR-21 Plan Export
FR-22 Dashboard
```

For every functional requirement, define:

- Description
- User
- Preconditions
- Main behavior
- Expected result
- Important edge cases

---

# 10. Non-Functional Requirements

## 10.1 Performance

- Fast initial page load
- Optimized assets
- Appropriate lazy loading
- Minimal unnecessary client-side JavaScript
- Efficient database access
- Appropriate server-side rendering

## 10.2 Security

- HTTPS
- Secure authentication
- Authorization checks
- User data isolation
- Database access policies
- Input validation
- Output sanitization
- Secure environment variables
- No exposed API keys
- Protection against common web vulnerabilities

## 10.3 Reliability

- Graceful API failures
- Graceful AI failures
- Database error handling
- Retry behavior where appropriate
- User-friendly errors

## 10.4 Maintainability

- TypeScript
- Modular code
- Reusable components
- Consistent naming
- Validation
- Clear data contracts
- Git version control

## 10.5 Accessibility

Target WCAG 2.1 AA principles.

Include:

- Semantic HTML
- Keyboard navigation
- Accessible forms
- Proper labels
- Focus states
- Screen-reader support
- Sufficient contrast
- Responsive design

---

# 11. Zero-Cost Technology Constraints

Product designed around:

```text
Frontend:
Next.js + React + TypeScript

Styling:
Tailwind CSS

UI:
shadcn/ui

Backend:
Next.js API Routes / Server Actions

Database:
Supabase PostgreSQL

Authentication:
Supabase Auth

Storage:
Supabase Storage

AI:
Google Gemini API free tier, subject to current availability

Source Control:
GitHub

Deployment:
Vercel free tier

Icons:
Lucide React

Charts:
Recharts

Calendar:
Open-source calendar library

PDF:
Client-side/open-source solution
```

No free tier assumed unlimited or permanent.

PRD documents assumptions around external service limits.

---

# 12. Architectural Direction

Product uses **modular monolith**, not microservices.

Conceptually:

```text
User Browser
      ↓
Next.js Application
      ↓
Application Modules
      ├── Authentication
      ├── Events
      ├── Budget
      ├── Tasks
      ├── Timeline
      ├── Vendors
      ├── Guests
      ├── AI
      ├── Notifications
      └── Export
      ↓
Supabase / PostgreSQL

AI Module
      ↓
Gemini API
```

Do not turn PRD into detailed architecture document.

`03-ARCHITECTURE.md` defines technical architecture later.

---

# 13. Database Requirements

PRD identifies major data concepts, does not produce final database schema.

Expected concepts include:

- Users
- Events
- Event preferences
- Budget categories
- Expenses
- Tasks
- Task dependencies
- Vendors
- Guests
- Event schedules
- AI conversations
- AI messages
- Notifications

Detailed schema belongs in:

```text
docs/04-DATABASE.md
```

---

# 14. AI Requirements

AI responsibilities separate from application responsibilities.

## AI can handle

- Planning suggestions
- Natural-language explanations
- Personalized recommendations
- Draft event plans
- Alternative planning strategies
- Conversational assistance
- Risk explanations

## Application code must handle

- Money calculations
- Date calculations
- Task dependencies
- Authentication
- Authorization
- Database writes
- Validation
- Permission checks
- State transitions
- Deterministic risk rules

AI output must be structured and validated where it affects application data.

---

# 15. AI Cost Control

Product must use AI economically.

Avoid:

```text
AI call for every button click
```

Prefer:

```text
Generate plan
      ↓
Validate
      ↓
Store
      ↓
Reuse
```

For chat:

```text
User question
      ↓
Relevant event context
      ↓
AI
```

Do not send entire database with every request.

PRD identifies where AI usage may become expensive or rate-limited.

---

# 16. MVP Scope

### MVP must include:

#### Authentication

- Register
- Login
- Logout

#### Event Management

- Create
- View
- Edit
- Delete

#### Event Details

- Event type
- Name
- Date
- Time
- Location
- Guest count
- Budget
- Preferences

#### Dashboard

- Event overview
- Budget progress
- Task progress
- Upcoming deadlines
- Important warnings

#### Budget

- Categories
- Planned amounts
- Actual expenses
- Remaining budget
- Utilization

#### Tasks

- CRUD
- Status
- Priority
- Due dates
- Dependencies

#### Timeline

- Planning timeline
- Event-day schedule

#### Vendors

- CRUD
- Status
- Cost tracking

#### Guests

- CRUD
- RSVP tracking

#### AI

- AI event plan generation
- Context-aware AI planning assistant

#### Notifications

- In-app notifications

#### Export

- Event plan export

---

# 17. Out of Scope for MVP

Explicitly exclude:

- Payment gateway
- E-commerce checkout
- Vendor marketplace
- Vendor payment processing
- SMS
- WhatsApp messaging APIs
- Paid email infrastructure
- Mobile application
- Microservices
- Kubernetes
- Redis
- Elasticsearch
- Dedicated servers
- Dedicated load balancers
- Video calling
- Blockchain
- Social network
- Complex real-time collaboration
- Complex recommendation infrastructure

---

# 18. Edge Cases

PRD explicitly considers edge cases such as:

- User creates event without budget
- Event date is in past
- Event date is very close
- Event has zero guests
- Event has very large guest count
- Budget is zero
- Expenses exceed budget
- User deletes event containing tasks/vendors/guests
- Task dependency becomes invalid
- Circular task dependency
- AI request fails
- AI returns malformed output
- AI provider rate limit is reached
- User loses network connection
- Duplicate guest records
- Duplicate vendors
- Missing vendor information
- No tasks exist
- No expenses exist
- No guests exist
- No vendors exist
- User has multiple events
- User attempts to access another user's event
- Export contains incomplete data

---

# 19. Empty, Loading, and Error States

PRD defines product requirements for:

- Loading dashboard
- Empty event list
- Empty tasks
- Empty vendors
- Empty guests
- Empty expenses
- AI loading
- AI failure
- Database failure
- Unauthorized access
- Not found
- Export failure
- Network failure

These states should be useful and actionable rather than displaying generic errors.

---

# 20. Success Criteria

PRD defines measurable MVP success criteria.

At minimum:

- User can register/login.
- User can create an event.
- User can manage event information.
- User can configure a budget.
- Budget calculations remain accurate.
- User can manage expenses.
- User can create/manage tasks.
- Task dependencies work correctly.
- User can manage vendors.
- User can manage guests.
- User can create/view planning timelines.
- User can manage an event-day schedule.
- User can generate an AI event plan.
- AI output is validated before persistence.
- User can modify AI-generated content.
- AI assistant can answer using current event context.
- Deterministic warnings work correctly.
- Dashboard accurately reflects event state.
- User can export an event plan.
- Application is responsive.
- Core functionality can be tested automatically.
- MVP can be deployed using intended zero-cost architecture.

---

# 21. Future Features

Possible future improvements, not committed requirements:

- Public event sharing
- Collaborative event planning
- Multiple event members
- Advanced calendar integrations
- Vendor discovery
- Vendor reviews
- Invitation management
- Email invitations
- WhatsApp integration
- SMS notifications
- Advanced analytics
- Mobile application
- Advanced AI planning
- Voice-based planning
- Multi-language support
- AI-generated event themes
- Advanced recommendation engine

---

# 22. Product Decisions

Important decisions made in this PRD.

```text
Decision:
Use a modular monolith.

Reason:
Project is a student/hackathon application and does not require microservices.
```

```text
Decision:
Use deterministic application logic for financial calculations.

Reason:
Financial calculations must be reliable and reproducible.
```

```text
Decision:
AI cannot directly write to the database.

Reason:
AI output must be validated before persistence.
```

```text
Decision:
Use in-app notifications for MVP.

Reason:
Avoid paid messaging infrastructure.
```

```text
Decision:
No vendor marketplace in MVP.

Reason:
Core product is event planning, not vendor commerce.
```

---

# 23. Assumptions

PRD explicitly lists assumptions.

For every assumption:

- State the assumption.
- Explain why it is needed.
- Identify whether it may need confirmation later.

---

# 24. Open Questions

Unresolved decisions to be answered later.

PRD does not block on these questions.

Use sensible defaults where possible, clearly mark them.

---

# 25. Document Dependencies

Later documents derive from this PRD.

Documentation chain:

```text
01-PRD.md
    ↓
02-DESIGN.md
    ↓
03-ARCHITECTURE.md
    ↓
04-DATABASE.md
    ↓
05-API.md
    ↓
06-AGENTS.md
    ↓
07-PLAN.md
    ↓
08-SETUP.md
    ↓
09-FEATURES.md
    ↓
10-AUTHENTICATION.md
    ↓
11-MCP.md
    ↓
12-INTEGRATIONS.md
    ↓
13-TESTING.md
    ↓
14-DEBUGGING.md
    ↓
15-DEPLOYMENT.md
    ↓
16-AI-MEMORY.md
```

Important:

- Do not duplicate detailed technical content from future documents.
- Establish requirements and product decisions here.
- Later documents should treat this PRD as source of truth.
- If later document needs to deviate from PRD, deviation must be explicitly documented.

---

# 26. Writing Requirements

PRD must be professional and clear.

Use:

- Headings
- Tables
- Bullet points
- Numbered requirements
- Requirement IDs
- Examples
- Clear acceptance criteria

Avoid:

- Marketing fluff
- Repetition
- Vague statements
- Unnecessary technical complexity
- Unnecessary code
- Fake statistics
- Unsupported claims
- Invented integrations

PRD must be detailed enough for another AI coding agent to understand intended product without guessing basic requirements.

---

# 27. Final Output Rule

Return **only the complete Markdown content** for:

```text
docs/01-PRD.md
```

Do not include:

- Explanation before the document
- Explanation after the document
- Code implementation
- Git commands
- Git commits
- Git pushes

Document itself must be ready to save directly as `docs/01-PRD.md`.