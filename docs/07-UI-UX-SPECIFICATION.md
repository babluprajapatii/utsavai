# UtsavAI - UI/UX Specification

**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Source documents:** `01-PRD.md`, `02-FRS.md`, `03-NFR.md`, `04-DATABASE.md`, `05-API-SPECIFICATION.md`, `06-AI-SPECIFICATION.md`
**Purpose:** Define UI/UX requirements and interaction behavior for UtsavAI.
**Intended audience:** UI/UX designers, frontend developers, QA.

---

## 1. Document Information

- **Document name:** 07-UI-UX-SPECIFICATION.md
- **Product:** UtsavAI
- **Version:** 1.0
- **Status:** Draft
- **Source documents:** All preceding technical documents
- **Purpose:** Document UI/UX requirements and interaction patterns
- **Intended audience:** UI/UX design, frontend development, QA

---

## 2. UI/UX Product Principles

The current application follows these established principles:

### Design Philosophy

- **Celebration-focused**: Warm, approachable design that celebrates events
- **Functional**: Prioritizes clarity and utility over decoration
- **Data-driven**: Presents event data clearly and professionally
- **Personalized**: Tailors display to event progress and context
- **Accessible**: Supports keyboard navigation, screen readers, and all input modes

### Current Established Principles

Based on the existing codebase:

- **Material-inspired container** with subtle depth and rounded corners (radius: 0.5rem)
- **Warm color palette**: Cream background, deep terracotta primary, sand secondary, tan accent
- **Readable typography**: Geist Sans (sans-serif), Geist Mono (code), Fraunces (serif)
- **Component consistency**: shadcn/ui base components (New York style)
- **Iconography**: Lucide React icons throughout
- **Form-friendly layouts**: Vertical alignment, clear labeling, validation feedback

### Anti-patterns Avoided

Based on existing codebase:

- No generic SaaS gray palette
- No purple gradients or arbitrary branding
- No pill-shaped buttons everywhere
- No fake testimonials or metrics
- No AI-slop photography or marketing copy
- No excessive animations
- No decorative-only UI elements
- No confusing dashboards

---

## 3. Brand / Visual Direction

### Established Visual System

Based on `tailwind.config.ts` and `globals.css`:

**Color Strategy**
- Background: Warm cream (`oklch(0.985 0.006 75)`)
- Primary: Deep terracotta (`oklch(0.51 0.135 35)`) - celebration color
- Secondary: Soft sand (`oklch(0.94 0.012 70)`) - neutral background
- Accent: Warm tan (`oklch(0.92 0.025 70)`) - subtle emphasis
- Muted: Mid-tone gray (`oklch(0.52 0.012 55)`) - secondary text
- Border: Light sand (`oklch(0.90 0.008 70)`) - separators

**Typography Hierarchy**
- H1/H2/H3: Geist Sans (sans-serif, weight: 600)
- Body: Geist Sans (400)
- Code: Geist Mono (mono)
- Accent text: Fraunces (serif)

**Spacing System**
- Based on Tailwind's default spacing scale
- Consistent 4px increments
- 1rem = 16px base

**Component Style**
- Border radius: 0.5rem for cards, dialogs, inputs
- Subtle shadows for elevation
- Clean, functional borders
- Hover and focus states

**Iconography**
- Lucide React icons
- Consistent sizing
- Filled and outline variants where appropriate

**Component Library**
- shadcn/ui components (New York style)
- Button, Input, Select, Textarea, Checkbox, Dialog, Card, Table, Badge, Toast, Progress, etc.
- Custom components built on top of shadcn/ui

---

## 4. Responsive Design

### Current Breakpoint Strategy

The application uses Tailwind's responsive utilities:

- **Desktop**: Standard desktop views
- **Tablet**: Medium screens with adjusted layouts
- **Mobile**: Small screens with mobile-optimized layouts

### Mobile Adaptations

Current implementation:

- **Tables to Cards**: Desktop tables convert to cards on mobile (expenses, tasks, vendors, guests)
- **Stacked layouts**: Forms and complex data show vertically
- **Horizontal scrolling**: Used sparingly for genuinely tabular data
- **Expanded details**: Cards can expand to show hidden information
- **Touch targets**: Minimum 44px for touch interactions
- **Form optimization**: Mobile-friendly number inputs, date pickers

### Current Mobile Optimization

Based on existing views:

- **Expenses**: Cards with expanded details
- **Tasks**: Compact cards with status badges
- **Vendors**: Cards with contact info
- **Guests**: Cards with RSVP status
- **Timeline**: Vertical stacking

---

## 5. Accessibility

### WCAG 2.1 AA Compliance

Current implementation targets:

**Semantic HTML**
- Proper heading hierarchy
- Semantic form controls
- ARIA labels and roles where needed
- Alt text for images

**Keyboard Navigation**
- Tab order follows logical flow
- Enter/Space activation for buttons and controls
- Escape to close modals/dialogs
- Arrow key navigation for calendars, tables, selects

**Focus Management**
- Visible focus indicators (ring)
- Focus trapped in modals
- Skip navigation for main content
- Clear focus indicators on interactive elements

**Screen Reader Support**
- Semantic HTML for screen readers
- Live regions for notifications and errors
- Descriptive labels and error messages

**Color Contrast**
- Sufficient contrast ratios for all text
- Non-color status indicators where possible

**Touch Targets**
- Minimum 44px target size
- Adequate spacing around interactive elements

**Reduced Motion**
- Respects `prefers-reduced-motion`
- No excessive animations
- Subtle, functional transitions

**Current Implementation**

Based on existing codebase:

- `ThemeProvider` with dark mode support
- Semantic structure from shadcn/ui
- Keyboard navigation in tables, dialogs, forms
- Focus management in modals and overlays
- ARIA labels where needed

---

## 6. Public Website

### Current Public Pages

1. **Home** (`/`) - Landing page
   - Hero with clear value proposition
   - Event type selection
   - Feature overview
   - Planning workflow
   - CTA: Start Planning

2. **About** (`/about`) - Problem-solution explanation
   - Hero with problem statement
   - Product philosophy
   - Technology overview
   - AI capabilities
   - User types

3. **Features** (`/features`) - Feature showcase
   - Smart planning
   - Budget management
   - Timeline
   - Task management
   - Vendor management
   - Guest management
   - AI assistant
   - Export/share

4. **FAQ** (`/faq`) - Common questions
   - Based on product documentation
   - Clear answers
   - No fake claims

5. **Login** (`/login`) - Authentication
   - Email/password form
   - Registration link

6. **Registration** (`/register`) - Account creation
   - Name, email, password
   - Validation

7. **Privacy** (`/privacy`) - Privacy policy
7. **Terms** (`/terms`) - Terms and conditions

### Hero Copy Guidelines

Current approach:

- **Clear, concrete messaging**: "Plan celebrations smarter."
- **Event-focused**: Emphasizes weddings, birthdays, community events
- **Benefits-focused**: "Manage budget, expenses, tasks, timeline, vendors, guests, event-day scheduling, reminders, personalization, AI-assisted planning"
- **No vague claims**: "Transform your life with next-generation intelligence"

### Public Navigation

- **Desktop**: Top navigation with links to all public pages
- **Mobile**: Hamburger menu
- **Auth-aware**: Login/register shown when not authenticated

### Public Page Examples

#### Home View (Current)

```tsx
<Hero>
  <h1>Plan your entire celebration in one place</h1>
  <p>UtsavAI is an event and celebration planning platform. Manage budget, tasks, timeline, vendors, guests, event-day scheduling, reminders, personalization, and AI-assisted planning for weddings, birthdays, community events, and family celebrations.</p>
  <Button>Start Planning</Button>
</Hero>

<EventTypeSelection>
  <EventTypeCard type="Wedding" icon="Heart" />
  <EventTypeCard type="Birthday" icon="Cake" />
  <EventTypeCard type="Community Event" icon="Users" />
  <EventTypeCard type="Family Celebration" icon="Home" />
</EventTypeSelection>
```

---

## 7. ABOUT PAGE

### Current Structure

- **Hero**: Problem-solution framing
- **Product Philosophy**: What we believe
- **Technology Overview**: Built around free/open-source stack
- **AI Role**: Emphasis on AI as assistant, not decision-maker
- **Intended Users**: Who UtsavAI serves
- **CTA**: Call to action

### Content Guidelines

Based on PRD documentation:

- **Problem**: Planning celebrations is complex
- **Solution**: Centralized event planning platform
- **Technology**: Modular monolith, zero-cost-first architecture
- **AI**: Assists with planning, recommendations, explanations
- **Users**: Wedding, birthday, community event, family celebration planners

### Visual Treatment

- Professional celebration imagery
- Clean information architecture
- Consistent with home page branding

---

## 8. FEATURES PAGE

### Current Layout

- **Hero**: Feature overview
- **Feature Grid**: 8 feature cards
- **AI Planning**: Full section with demo
- **Budget Planning**: Full section with demo
- **Timeline**: Full section with demo

### Feature Cards

Each feature shows:

- **Smart Planning**: "AI event plan generator with review and acceptance"
- **Budget Management**: "Budget tracking with categories, expenses, remaining, utilization"
- **Timeline**: "Planning timeline and event-day schedule"
- **Task Management**: "Tasks with dependencies, status, priority"
- **Vendor Management**: "Vendor tracking with status and costs"
- **Guest Management**: "Guest list with RSVP tracking"
- **AI Assistant**: "Context-aware conversational assistant"
- **Export**: "Export event plans to PDF and ICS"

### Feature Descriptions

Based on PRD:

- Concise, user-focused descriptions
- No marketing fluff
- Clear benefit statements
- Based on actual functionality

---

## 9. FAQ PAGE

### Current Question Structure

Based on PRD:

1. **What events can I plan?**
   - Wedding, Birthday, Community Event, Family Celebration, Custom Event

2. **Is UtsavAI free?**
   - Zero-cost-first architecture
   - Based on free/open-source technologies
   - Free hosting tiers where possible

3. **How does AI generate recommendations?**
   - User input validation
   - Structured event data
   - AI planning engine
   - Structured response
   - Schema validation
   - Business rule validation
   - User review and acceptance

4. **Can I modify AI-generated plans?**
   - Yes, user reviews before acceptance
   - Can edit generated tasks, timeline, budget
   - Full control over final plan

5. **Can I export my plan?**
   - Yes, to PDF and ICS
   - Includes event summary, budget, expenses, tasks, timeline, vendors, guests, event-day schedule

6. **Is my data saved?**
   - Events are saved per user
   - User owns their data
   - Only visible to authorized users

### Accordion or List View

Current implementation uses expandable sections.

### Answer Style

- Direct answers
- No marketing copy
- Clear formatting
- Optional additional details

---

## 10. AUTHENTICATION UI

### Login View (Current)

```tsx
<LoginView>
  <Form>
    <Input name="email" type="email" label="Email" required />
    <Input name="password" type="password" label="Password" required />
    <Button type="submit">Login</Button>
    <Link href="/register">Create account</Link>
  </Form>
</LoginView>
```

#### Form Validation

- Email validation
- Required field validation
- Server error handling
- Loading states

#### Error States

- Invalid credentials
- Network errors
- Rate limiting

#### Success State

Redirect to dashboard or onboarding.

### Registration View (Current)

```tsx
<RegisterView>
  <Form>
    <Input name="name" label="Name" required />
    <Input name="email" type="email" label="Email" required />
    <Input name="password" type="password" label="Password" required />
    <Input name="confirmPassword" type="password" label="Confirm password" required />
    <Button type="submit">Register</Button>
  </Form>
</RegisterView>
```

### Logout

Simple logout button in navigation.

---

## 11. ONBOARDING EXPERIENCE

### Current Implementation

Based on `OnboardingFlow` component:

- **Step 1**: Event Type
- **Step 2**: Event Details
- **Step 3**: Budget
- **Step 4**: Preferences
- **Step 5**: AI Plan Generation
- **Step 6**: Plan Review
- **Step 7**: Accept Plan

### UI Requirements

#### Progress Indicator

- Show current step and total steps
- Visual progress bar
- Clear step labels

#### Navigation

- **Next**: Continue to next step
- **Back**: Return to previous step
- **Skip**: Skip current step (where appropriate)
- **Save/Progress**: Save current progress for later continuation

#### Form Validation

- Field-level validation
- Required field indicators
- Clear error messages
- Validation prevents next step

#### Loading States

- Form submission
- AI plan generation
- Plan persistence

#### Error States

- Form submission errors
- AI generation failures
- Network errors
- Recovery options

---

## 12. AI PLAN GENERATION EXPERIENCE

### Current UI Flow

1. **User completes event setup** → Navigate to plan generation
2. **Generate plan** → Show processing state
3. **AI processing** → Loading screen with message
4. **Plan generated** → Preview with review interface
5. **User interaction** → Accept, edit, or regenerate
6. **Persist** → Save accepted plan

### Processing UI

```tsx
<GeneratingPlan>
  <Spinner size="lg" />
  <Message>Building your event plan...</Message>
  <Subtext>This may take a moment.</Subtext>
</GeneratingPlan>
```

### Plan Preview UI

```tsx
<PlanPreview>
  <Section title="Suggested Tasks">
    <TaskCard>Task details</TaskCard>
  </Section>
  
  <Section title="Timeline">
    <MilestoneCard>Date + Title</MilestoneCard>
  </Section>
  
  <Section title="Budget Allocations">
    <BudgetCard>Category + Amount</BudgetCard>
  </Section>
  
  <Section title="Vendor Recommendations">
    <VendorCard>Category + Priority</VendorCard>
  </Section>
  
  <Section title="Event-Day Schedule">
    <ScheduleCard>Time + Activity</ScheduleCard>
  </Section>
</PlanPreview>
```

### User Actions

- **Accept Plan**: Create all generated items
- **Edit**: Modify individual items
- **Regenerate**: Discard and generate new plan
- **Skip**: Continue without AI plan (still can add items manually)

---

## 13. PLAN REVIEW

### Plan Display

Generated plan presented in clear sections:

- **Tasks**: List with priority and due date
- **Timeline**: Milestones with dates
- **Budget**: Category allocations
- **Vendors**: Recommended categories
- **Recommendations**: Planning advice
- **Risks**: Identified risks with severity
- **Event-Day Schedule**: Hour-by-hour execution plan

### Review Instructions

Clear messaging:

"Review the AI-generated plan below. You can:

• Accept it to add all items to your event
• Edit any item to customize the plan
• Regenerate if you want a different approach
• Skip AI and start from scratch"

### User Interface Elements

- **Cards** for each item type
- **Status badges** for priorities and status
- **Clear action buttons** (Accept, Edit, Regenerate, Skip)
- **Progress indicator** showing review status

### Mobile Considerations

- **Cards** adapt to single column
- **Expandable details** for complex items
- **Touch-friendly action buttons**

---

## 14. DASHBOARD

### Current Dashboard Layout

```tsx
<Dashboard>
  <Header>
    <h1>Event Name</h1>
    <p>Days until event</p>
  </Header>
  
  <Grid>
    <BudgetCard />
    <TasksCard />
    <TimelineCard />
    <VendorsCard />
    <GuestsCard />
    <NotificationsCard />
  </Grid>
</Dashboard>
```

### Dashboard Components

#### Budget Overview

- **Total budget** and **actual spending**
- **Remaining amount** and **utilization percentage**
- **Warning indicators** for approaching/critical levels

#### Task Overview

- **Completion percentage**
- **Overdue tasks count**
- **Upcoming deadlines**

#### Timeline Overview

- **Next milestone**
- **Upcoming events**

#### Vendor Overview

- **Status counts** (Researching, Contacted, Booked, etc.)

#### Guest Overview

- **Total guests**
- **RSVP status counts**

#### Notifications Overview

- **Unread notifications count**
- **Important warnings**

### Quick Actions

- **Create Event** (primary CTA)
- **Add Task**
- **Record Expense**
- **Invite Guests**

### Mobile Optimization

- **Condensed cards**
- **Bottom navigation**
- **Swipe actions** where appropriate

---

## 15. EVENT OVERVIEW

### Current Event Overview View

- **Event details** (name, date, location, guest count)
- **Budget summary**
- **Task summary**
- **Timeline summary**
- **Vendor summary**
- **Guest summary**
- **Quick navigation links**

### Navigation

Provide direct links to detailed management pages.

---

## 16. CREATE / EDIT EVENT

### Event Form (Current Implementation)

Based on `CreateEditEventView`:

#### Basic Information

- **Event Name** (required)
- **Event Type** (required, dropdown)
- **Description** (optional)

#### Schedule

- **Event Date** (required)
- **Start Time** (optional)
- **End Time** (optional)

#### Location

- **Location** (optional)

#### Attendance

- **Expected Guests** (optional)

#### Budget

- **Total Budget** (optional)
- **Currency** (optional)

#### Preferences

- **Theme** (optional)
- **Style** (optional)
- **Priorities** (optional)
- **Special Requirements** (optional)

### Form Validation

- **Client-side validation**
- **Server-side validation**
- **Clear error messages**
- **Field-level validation**

### Actions

- **Save** (save draft)
- **Continue** (save and continue to next step)
- **Cancel** (discard changes)

### Edit Mode

Same form with existing event data pre-populated.

---

## 17. BUDGET UI

### Current Budget View

```tsx
<BudgetView>
  <BudgetOverview>
    <TotalBudget>₹5,00,000</TotalBudget>
    <Utilization>93%</Utilization>
    <Warning type="critical">Critical level (93%)</Warning>
  </BudgetOverview>
  
  <BudgetCategories>
    <BudgetCard>
      <h3>Venue</h3>
      <Planned>₹1,50,000</Planned>
      <Actual>₹1,50,000</Actual>
      <Remaining>₹0</Remaining>
    </BudgetCard>
    ...
  </BudgetCategories>
</BudgetView>
```

### Budget Cards

Each category card shows:

- **Category name**
- **Planned amount**
- **Actual amount**
- **Remaining amount**
- **Utilization percentage**

### Status Indicators

Based on utilization rules:

- **Normal** (< 80%)
- **Warning** (80% to < 90%)
- **Critical** (≥ 90%)

Status shown with color and text.

### Mobile Layout

- **Cards** stacked vertically
- **Horizontal scrolling** for wide tables
- **Expanded details** for each card

---

## 18. EXPENSE UI

### Current Expenses View

```tsx
<ExpensesView>
  <ExpensesList>
    <ExpenseCard>
      <Header>
        <h3>Category</h3>
        <p>Date</p>
      </Header>
      <Body>
        <Description>Expense description</Description>
        <Amounts>
          <Planned>₹75,000</Planned>
          <Actual>₹1,00,000</Actual>
        </Amounts>
        <Variance>Over budget by ₹25,000</Variance>
      </Body>
    </ExpenseCard>
    ...
  </ExpensesList>
</ExpensesView>
```

### Expense Card Structure

- **Category** (with icon)
- **Description**
- **Planned vs Actual** amounts
- **Date**
- **Variance information**

### Mobile Optimization

- **Cards** with expandable details
- **Swipe actions** for edit/delete
- **Quick add button** at bottom

---

## 19. TASK MANAGEMENT UI

### Current Tasks View

```tsx
<TasksView>
  <TasksHeader>
    <Filters>
      <StatusFilter>
      <PriorityFilter>
      <DateFilter>
    </Filters>
    <AddTaskButton>+ Add Task</AddTaskButton>
  </TasksHeader>
  
  <TasksList>
    <TaskCard>
      <Header>
        <h3>Task title</h3>
        <StatusBadge>Status</StatusBadge>
        <PriorityBadge>Priority</PriorityBadge>
      </Header>
      <Body>
        <Description>Description</Description>
        <Meta>
          <DueDate>Due: date</DueDate>
          <Owner>Assigned to: name</Owner>
        </Meta>
      </Body>
      <Footer>
        <CompleteButton>Complete</CompleteButton>
        <EditButton>Edit</EditButton>
        <DeleteButton>Delete</DeleteButton>
      </Footer>
    </TaskCard>
    ...
  </TasksList>
</TasksView>
```

### Task Card Structure

- **Title and status/priority badges**
- **Description**
- **Due date**
- **Owner**
- **Action buttons** (Complete, Edit, Delete)

### Mobile Layout

- **Cards** stacked
- **Expandable details**
- **Swipe actions** for quick edits

### Filtering and Sorting

- **Status filter** (All, Not Started, In Progress, Completed)
- **Priority filter** (All, Low, Medium, High, Critical)
- **Sort by** (Due date, Creation date, Priority)

---

## 20. TIMELINE UI

### Current Timeline View

```tsx
<TimelineView>
  <TimelineHeader>
    <h3>Planning Timeline</h3>
    <AddButton>+ Add Milestone</AddButton>
  </TimelineHeader>
  
  <TimelineList>
    <TimelineCard>
      <Date>Date</Date>
      <Title>Title</Title>
      <Description>Description</Description>
      <Actions>
        <EditButton>Edit</EditButton>
        <DeleteButton>Delete</DeleteButton>
      </Actions>
    </TimelineCard>
    ...
  </TimelineList>
</TimelineView>
```

### Timeline Card Structure

- **Date** (prominent)
- **Title**
- **Description**
- **Actions** (Edit, Delete)

### Event-Day Schedule View

Similar structure but focused on actual event date:

```tsx
<ScheduleView>
  <ScheduleList>
    <ScheduleCard>
      <Time>Time</Time>
      <Activity>Activity title</Activity>
      <Description>Description</Description>
      <Responsible>Responsible person/vendor</Responsible>
    </ScheduleCard>
    ...
  </ScheduleList>
</ScheduleView>
```

### Mobile Layout

- **Cards** stacked vertically
- **Timeline indicator** on the left
- **Compact display** for mobile screens

---

## 21. VENDOR MANAGEMENT UI

### Current Vendors View

```tsx
<VendorsView>
  <VendorsHeader>
    <Filters>
      <CategoryFilter>
      <StatusFilter>
    </Filters>
    <AddButton>+ Add Vendor</AddButton>
  </VendorsHeader>
  
  <VendorsList>
    <VendorCard>
      <Header>
        <h3>Vendor name</h3>
        <CategoryBadge>Category</CategoryBadge>
        <StatusBadge>Status</StatusBadge>
      </Header>
      <Body>
        <Contact>Contact info</Contact>
        <Cost>
          <Estimated>Estimated: amount</Estimated>
          <Actual>Actual: amount</Actual>
        </Cost>
        <BookingDate>Booked: date</BookingDate>
        <Notes>Notes...</Notes>
      </Body>
      <Footer>
        <EditButton>Edit</EditButton>
        <DeleteButton>Delete</DeleteButton>
      </Footer>
    </VendorCard>
    ...
  </VendorsList>
</VendorsView>
```

### Vendor Card Structure

- **Name and category badges**
- **Status badge**
- **Contact information**
- **Cost information**
- **Booking date**
- **Notes**
- **Action buttons**

### Mobile Layout

- **Cards** stacked
- **Expandable details**
- **Swipe actions** for quick edits

---

## 22. GUEST MANAGEMENT UI

### Current Guests View

```tsx
<GuestsView>
  <GuestsHeader>
    <Filters>
      <RSVPFilter>
      <GroupFilter>
    </Filters>
    <AddButton>+ Add Guest</AddButton>
  </GuestsHeader>
  
  <GuestsList>
    <GuestCard>
      <Header>
        <h3>Guest name</h3>
        <RSVPBadge>Status</RSVPBadge>
        <GroupBadge>Group</GroupBadge>
      </Header>
      <Body>
        <Contact>Contact info</Contact>
        <MealPref>Meal: preference</MealPref>
        <SpecialReq>Special: requirements</SpecialReq>
        <Notes>Notes...</Notes>
      </Body>
      <Footer>
        <EditButton>Edit</EditButton>
        <DeleteButton>Delete</DeleteButton>
      </Footer>
    </GuestCard>
    ...
  </GuestsList>
</GuestsView>
```

### Guest Card Structure

- **Name and RSVP/status badge**
- **Group/family badge**
- **Contact information**
- **Meal preference**
- **Special requirements**
- **Notes**
- **Action buttons**

### Mobile Layout

- **Cards** stacked
- **Expandable details**
- **Swipe actions** for quick edits

### RSVP Statuses

- **Pending** (orange/yellow)
- **Accepted** (green)
- **Declined** (red)

### Dashboard Summary

- **Total guests**
- **Accepted count**
- **Pending count**
- **Declined count**

---

## 23. EVENT-DAY SCHEDULE UI

### Current Schedule View

```tsx
<ScheduleView>
  <ScheduleList>
    <ScheduleCard>
      <Time>Time</Time>
      <Activity>Activity title</Activity>
      <Description>Description</Description>
      <Responsible>Vendor: name | Person: name</Responsible>
    </ScheduleCard>
    ...
  </ScheduleList>
</ScheduleView>
```

### Schedule Card Structure

- **Time** (prominent)
- **Activity title**
- **Description**
- **Responsible person or vendor**

### Mobile Layout

- **Cards** stacked vertically
- **Time displayed prominently**
- **Compact information**

---

## 24. AI ASSISTANT UI

### Current AI Assistant View

```tsx
<AiAssistantView>
  <ChatContainer>
    <ChatHistory>
      <Message role="user">User message</Message>
      <Message role="assistant">Assistant response</Message>
    </ChatHistory>
    
    <ChatInput>
      <Input placeholder="Ask about planning..." />
      <SendButton>Send</SendButton>
    </Input>
    
    <SuggestedQuestions>
      <Button>What should I prioritize this week?</Button>
      <Button>How can I reduce my spending?</Button>
      <Button>Which tasks are overdue?</Button>
      <Button>What vendors should I book first?</Button>
    </SuggestedQuestions>
  </ChatContainer>
</AiAssistantView>
```

### Chat Interface

- **Conversation history**
- **User message input**
- **Send button**
- **Suggested questions**
- **Loading state for AI responses**
- **Error states**

### Context Indicator

- **Current event** shown
- **Time remaining** displayed
- **Budget status** shown

### Mobile Layout

- **Full-screen chat interface**
- **Bottom input area**
- **Compact message bubbles**
- **Expandable suggested questions**

---

## 25. AI ERROR STATE

### Current Error Display

```tsx
<AiErrorState>
  <Icon>⚠️</Icon>
  <Title>Something went wrong</Title>
  <Message>While generating a response</Message>
  <Actions>
    <RetryButton>Retry</RetryButton>
    <CancelButton>Cancel</CancelButton>
  </Actions>
  <Note>
    If the problem continues,
    please refresh or contact support.
  </Note>
</AiErrorState>
```

### Error Types

- **AI provider unavailable**
- **Network failure**
- **Rate limit exceeded**
- **Invalid response**
- **Timeout**

### Error Handling

- **Retry button** for transient failures
- **Preserve user input** for resend
- **Clear error messages**
- **Friendly tone**

### Mobile Considerations

- **Full-width buttons**
- **Clear error messaging**
- **Simple retry options**

---

## 26. NOTIFICATIONS UI

### Current Notifications View

```tsx
<NotificationsView>
  <NotificationsHeader>
    <Title>Notifications</Title>
    <MarkAllButton>Mark all read</MarkAllButton>
  </NotificationsHeader>
  
  <NotificationsList>
    <NotificationCard>
      <Header>
        <Icon>⚠️</Icon>
        <Title>Notification title</Title>
        <Time>Just now</Time>
      </Header>
      <Body>
        <Message>Notification message</Message>
      </Body>
      <Footer>
        <UnreadIndicator>Unread</UnreadIndicator>
      </Footer>
    </NotificationCard>
    ...
  </NotificationsList>
</NotificationsView>
```

### Notification Card Structure

- **Icon** (type-specific)
- **Title**
- **Time**
- **Message**
- **Read/unread indicator**

### Notification Types

- **Task overdue**
- **Budget warning**
- **Vendor deadline**
- **RSVP reminder**
- **Completed action**
- **Plan generated**
- **Plan accepted**

### Mobile Layout

- **Cards** stacked
- **Swipe actions** for mark as read
- **Badge counts** for unread

---

## 27. SETTINGS UI

### Current Settings Views

- **Profile**: Name, email
- **Account**: Password, security
- **Preferences**: Event defaults
- **Notifications**: In-app notification settings

### Settings Categories

#### Profile

- **Name** (editable)
- **Email** (editable)

#### Account

- **Change password**
- **Logout from all devices**
- **Delete account** (requires confirmation)

#### Preferences

- **Default event type**
- **Default currency**
- **Planning timeline start**

#### Notifications

- **In-app notification types**
- **Notification sounds**
- **Badge counts**

### Mobile Layout

- **Expandable sections**
- **Slider controls**
- **Toggle switches**

---

## 28. EXPORT UI

### Current Export View

```tsx
<ExportView>
  <ExportOptions>
    <PDFOption>
      <Title>Event Plan PDF</Title>
      <Description>
        Complete event summary with budget, tasks, timeline, vendors, guests
      </Description>
      <Preview>
        <EventSummaryPreview />
      </Preview>
      <ExportButton>Generate PDF</ExportButton>
    </PDFOption>
    
    <ICSOption>
      <Title>Calendar ICS</Title>
      <Description>
        Event schedule with tasks and milestones
      </Description>
      <ExportButton>Generate ICS</ExportButton>
    </ICSOption>
  </ExportOptions>
</ExportView>
```

### Export Options

#### PDF Export

- **Preview** before generation
- **Event summary**
- **Budget details**
- **Tasks list**
- **Timeline**
- **Vendors list**
- **Guests list**
- **Event-day schedule**

#### ICS Export

- **Calendar events**
- **Event schedule**
- **Task due dates**
- **Deadline reminders**

### Export States

- **Loading**: Spinner with message
- **Success**: Download link or confirmation
- **Error**: Clear error message with retry option

### Mobile Layout

- **Full-width buttons**
- **Simplified preview**
- **Direct download**

---

## 29. EMPTY STATES

### Current Empty State Examples

#### No Events

```tsx
<EmptyState>
  <Icon>📅</Icon>
  <Title>No events yet</Title>
  <Message>Create your first event to start planning</Message>
  <Action>Create Event</Action>
</EmptyState>
```

#### No Tasks

```tsx
<EmptyState>
  <Icon>✓</Icon>
  <Title>No tasks yet</Title>
  <Message>Add tasks to your event to stay organized</Message>
  <Action>Add Task</Action>
</EmptyState>
```

#### No Vendors

```tsx
<EmptyState>
  <Icon>🏢</Icon>
  <Title>No vendors yet</Title>
  <Message>Add vendors as you research and book them</Message>
  <Action>Add Vendor</Action>
</EmptyState>
```

#### No Guests

```tsx
<EmptyState>
  <Icon>👥</Icon>
  <Title>No guests yet</Title>
  <Message>Add your guest list to start tracking RSVPs</Message>
  <Action>Add Guest</Action>
</EmptyState>
```

#### No Expenses

```tsx
<EmptyState>
  <Icon>💰</Icon>
  <Title>No expenses yet</Title>
  <Message>Record your first expense to start tracking spending</Message>
  <Action>Add Expense</Action>
</EmptyState>
```

#### No Notifications

```tsx
<EmptyState>
  <Icon>🔔</Icon>
  <Title>No notifications</Title>
  <Message>You're all caught up</Message>
</EmptyState>
```

### Empty State Guidelines

- **Clear purpose**: Explain what's missing
- **Actionable message**: Tell user what to do next
- **Relevant icon**: Visual representation of missing content
- **Clear call-to-action**: Primary action button
- **Context-aware**: Based on user's current view

---

## 30. LOADING STATES

### Current Loading Patterns

#### Form Submission

```tsx
<Button type="submit" disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

#### AI Plan Generation

```tsx
<GeneratingPlan>
  <Spinner size="lg" />
  <Message>Building your event plan...</Message>
</GeneratingPlan>
```

#### AI Chat

```tsx
<Message role="assistant">
  {isLoading ? <Spinner size="sm" /> : 'Response'}
</Message>
```

#### Export

```tsx
<ExportButton disabled={isExporting}>
  {isExporting ? 'Generating...' : 'Export'}
</ExportButton>
```

### Loading Indicators

- **Spinners**: Circular loading indicators
- **Progress bars**: For operations that take time
- **Skeletons**: Placeholder content while loading
- **Button loading**: Disabled button with loading text

### Mobile Loading

- **Full-screen loading** for heavy operations
- **Inline loading** for quick actions
- **Minimal UI** during loading

---

## 31. ERROR STATES

### Current Error Display

#### Form Validation

```tsx
<Input error="Invalid email address">
```

#### API Errors

```tsx
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Failed to save event. Please try again.</AlertDescription>
</Alert>
```

#### Network Errors

```tsx
<ErrorState>
  <Title>Connection Problem</Title>
  <Message>Cannot connect to server.</Message>
  <Actions>
    <RetryButton>Retry</RetryButton>
    <ContactButton>Contact Support</ContactButton>
  </Actions>
</ErrorState>
```

#### AI Errors

```tsx
<AiErrorState>
  <Title>AI Service Unavailable</Title>
  <Message>We're unable to generate a response. Please try again.</Message>
  <Actions>
    <RetryButton>Retry</RetryButton>
    <CancelButton>Cancel</CancelButton>
  </Actions>
</AiErrorState>
```

### Error Guidelines

- **Clear messages**: Explain what went wrong
- **Actionable**: Provide solution options
- **Non-technical**: Avoid jargon
- **Contextual**: Related to current task
- **Persistent**: Preserve user input

### Mobile Error Handling

- **Full-screen errors**: For critical failures
- **Inline errors**: For form validation
- **Snack bar notifications**: For non-critical issues

---

## 32. CONFIRMATION / DESTRUCTIVE ACTIONS

### Delete Confirmation

#### Confirm Dialog

```tsx
<AlertDialog>
  <AlertDialogTrigger>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete Item</AlertDialogTitle>
    <AlertDialogDescription>
      Are you sure? This cannot be undone.
    </AlertDialogDescription>
    <AlertDialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Mobile Considerations

- **Swipe actions**: Delete on swipe for mobile
- **Long press**: Delete on long press for mobile
- **Confirmation dialog**: For destructive actions

---

## 33. COMPONENT SYSTEM

### Current Component Structure

#### Core UI Components (shadcn/ui)

- **Button**
- **Input**
- **Select**
- **Textarea**
- **Checkbox**
- **Radio Group**
- **Switch**
- **Label**
- **Card**
- **Dialog**
- **Alert Dialog**
- **Dropdown Menu**
- **Tabs**
- **Accordion**
- **Progress**
- **Badge**
- **Avatar**
- **Separator**
- **Scroll Area**
- **Toaster**

#### Custom Components

- **AppShell**: Main layout with navigation
- **OnboardingFlow**: Multi-step onboarding interface
- **EmptyState**: Consistent empty state component
- **LoadingState**: Loading indicator component
- **ErrorState**: Error display component

### Component Guidelines

#### Styling

- **Consistent spacing**: 4px increments
- **Border radius**: 0.5rem for components
- **Shadows**: Subtle elevation
- **Hover/focus**: Clear states
- **Dark mode**: Support via `ThemeProvider`

#### Size Variations

- **Small**: For tight spaces
- **Medium**: Default
- **Large**: For prominent actions
- **Extra large**: For critical actions

#### State Variations

- **Default**: Normal appearance
- **Hover**: Interactive state
- **Focus**: Keyboard navigation
- **Disabled**: Unavailable
- **Loading**: Processing
- **Error**: Invalid state

---

## 34. NAVIGATION

### Current Navigation Structure

#### Public Navigation

- **Desktop**: Top navigation bar
- **Mobile**: Hamburger menu
- **Links**: Home, About, Features, FAQ, Login, Register

#### Authenticated Navigation

- **Desktop**: Left sidebar
- **Mobile**: Bottom navigation bar
- **Menu items**: Dashboard, Events, Budget, Tasks, Timeline, Vendors, Guests, Schedule, AI Assistant, Notifications, Settings, Export

### Navigation Components

#### AppShell

```tsx
<AppShell>
  <Sidebar>
    <NavigationMenu>
      <NavigationMenuItem>Dashboard</NavigationMenuItem>
      <NavigationMenuItem>Events</NavigationMenuItem>
      ...
    </NavigationMenu>
  </Sidebar>
  <MainContent>
    {children}
  </MainContent>
</AppShell>
```

#### Event Switcher

If multiple events exist:

- **Dropdown**: Select event
- **Current event context**: Controls all data shown
- **Event-specific data**: No cross-event mixing

---

## 35. EVENT SWITCHER

### Current Implementation

Based on `useAppStore`:

- **Event context**: Controls all views
- **Ownership verification**: Ensures access to owned events
- **No cross-event mixing**: Each event has isolated data

### UI Behavior

- **Dropdown in sidebar/header**
- **Live context updates**
- **Validation**: Prevent unauthorized access

### Mobile Considerations

- **Compact dropdown**
- **Icon-only when space limited**
- **Clear event names**

---

## 36. DATA VISUALIZATION

### Current Chart Components

Based on `recharts`:

- **Budget utilization**: Doughnut chart
- **Budget category comparison**: Bar chart
- **Task completion**: Pie chart
- **RSVP breakdown**: Pie chart

### Chart Guidelines

#### When to Use Charts

- **Budget overview**: Total vs planned vs actual
- **Task progress**: Completion status
- **Guest RSVP**: Distribution of accepted/pending/declined
- **Timeline**: Milestone completion status

#### Chart Types

- **Doughnut/Pie**: Single category, proportional data
- **Bar**: Comparison across categories
- **Line**: Trends over time
- **Area**: Volume of data

#### Chart Styling

- **Consistent colors**: Brand palette
- **Clear legends**: Explain data
- **Responsive**: Adapt to container size
- **Accessible**: Alternative text for screen readers

---

## 37. RESPONSIVE TABLE RULES

### Desktop Tables

Current implementation:

- **Budget**: Planned vs Actual with variance
- **Expenses**: Category, date, amounts
- **Tasks**: Title, priority, status, due date
- **Vendors**: Name, category, status, contact
- **Guests**: Name, RSVP status, group

Tables show all data at once with sorting/filtering.

### Mobile Cards

- **Budget**: Card with category breakdown
- **Expenses**: Card with amounts and variance
- **Tasks**: Card with status and priority
- **Vendors**: Card with contact and status
- **Guests**: Card with RSVP and group

Cards expand to show additional details.

### Conversion Rules

- **Table → Card**: Mobile only
- **Card → Table**: Desktop only
- **Preserve functionality**: All table data accessible
- **Maintain usability**: Touch-friendly mobile interactions

---

## 38. MOTION / ANIMATION

### Current Animation Patterns

#### Page Transitions

- **Fade**: Component entry/exit
- **Slide**: Modal/drawer opening

#### Loading Animations

- **Spinner**: Circular loading
- **Pulse**: Subtle pulsing
- **Wave**: Progress animation

#### State Transitions

- **Hover**: Scale, shadow
- **Focus**: Border color
- **Active**: Pressed state

### Animation Guidelines

#### Performance

- **Hardware acceleration**
- **Transform over opacity**
- **Use CSS transitions**

#### Accessibility

- **Respects `prefers-reduced-motion`**
- **Clear state changes**
- **No excessive movement**

#### Type

- **Functional**: Animations enhance usability
- **Subtle**: Not distracting
- **Purposeful**: Supports user actions

### Mobile Considerations

- **Simplified animations**: Reduced for performance
- **Touch feedback**: Press states
- **Haptic feedback**: Where supported

---

## 39. TRUST / AUTHENTICITY RULES

### Visual Trust Indicators

Based on current implementation:

- **Secure connection**: HTTPS
- **Authentication required**: Protected routes
- **Data ownership**: Clear ownership displays
- **Professional appearance**: Clean, organized design
- **Consistent branding**: Established color system

### Text Trust

- **Clear claims**: "Plan celebrations smarter."
- **Based on PRD**: Features match documentation
- **No marketing fluff**: "Generate event plan"
- **Action-oriented**: "Create Event", "Add Task"

### Visual Trust Elements

- **Professional layout**: Clean, organized
- **Clear information architecture**: Logical hierarchy
- **Consistent interactions**: Predictable behavior
- **Clear error messages**: Helpful feedback

---

## 40. DESIGN ANTI-PATTERNS

### Explicitly Avoided

Based on current design choices:

1. **Purple-gradient-heavy branding**
2. **Pill-shaped buttons everywhere**
3. **Emoji icons as primary UI**
4. **Excessive scroll animations**
5. **Cursor animations**
6. **Decorative animation that harms usability**
7. **Fake metrics and testimonials**
8. **AI-generated slop photography**
9. **Vague hero messaging**
10. **Excessive rounded cards**
11. **Overly decorative UI**
12. **Visual clutter**
13. **Unnecessary glassmorphism**
14. **Excessive shadows**

### Alternative Approaches

- **Celebration warmth**: Warm color palette instead of gradients
- **Professional buttons**: Standard button styling with clear hierarchy
- **Lucide icons**: Universal, clear icons
- **Clean layout**: Organized content areas
- **Clear hierarchy**: Logical information architecture
- **Functional animations**: Subtle, useful transitions

---

## 41. UX COPY GUIDELINES

### Current Copy Philosophy

Based on implemented text:

- **Direct**: "Plan celebrations smarter."
- **Event-focused**: "Manage budget, tasks, timeline, vendors, guests"
- **Benefit-oriented**: What users can accomplish
- **Action-oriented**: "Create Event", "Add Task", "Generate Plan"

### Copy Structure

#### Headers

- **Clear and specific**
- **Scannable**
- **Action-oriented**

#### Body Text

- **Concise**
- **Helpful**
- **Human-friendly**

#### Buttons

- **Clear actions**: "Create Event", "Add Task", "Save"
- **Short and direct**
- **Verb-based**

### Examples

#### Good

- "Plan your entire celebration in one place"
- "Create Event"
- "Add Task"
- "Generate Event Plan"

#### Bad

- "Transform your life with next-generation intelligence"
- "Unlock your celebration potential"
- "Begin your journey"

---

## 42. CUSTOM DOMAIN / PRODUCTION READINESS

### Current Implementation

Based on `metadataBase` and production configuration:

- **Custom domain**: `https://utsavai.app`
- **Production build**: `next build` creates standalone server
- **Environment variables**: Production configuration
- **Development branding**: Removed before launch

### Requirements

Based on documentation:

#### Custom Domain

- **Connected custom domain**
- **HTTPS only**
- **Production metadata configured**

#### Branding

- **Favicon**: Multiple sizes configured
- **App icon**: Apple touch icon
- **OG metadata**: Social sharing
- **Production-ready navigation**
- **Production error handling**

#### Legal

- **Privacy Policy page**
- **Terms and Conditions page**
- **Footer links**

---

## 43. LEGAL / TRUST PAGES

### Current Pages

Based on `HomeView` imports:

- **Privacy** (`/privacy`)
- **Terms** (`/terms`)

### Content Requirements

#### Privacy Policy

- **Accessible from public website**
- **Clear data collection statement**
- **User data rights**
- **No fabricated legal claims**

#### Terms and Conditions

- **Acceptable use**
- **User responsibilities**
- **Liability limitations**

### Implementation

- **Footer links**: Present in public templates
- **Accessible**: Keyboard navigable
- **Clear purpose**: Information for users

### Open Decision

If actual legal text unavailable, mark `OPEN DECISION`.

---

## 44. FAVICON / BRAND ASSETS

### Current Implementation

Based on `layout.tsx`:

- **Favicon**: Multiple sizes
- **Apple touch icon**: Configured
- **Web manifest**: Present
- **OG image**: `/brand/og-image.png`

### Requirements

- **Favicon**: Multiple standard sizes
- **App icon**: iOS home screen icon
- **Web manifest**: PWA support
- **Social sharing**: OG/Twitter images
- **Production branding**: No AI-generated placeholder branding

### Brand Assets

- **Logo**: Not specified in codebase
- **Colors**: Warm cream, terracotta, sand, tan
- **Typography**: Geist Sans, Geist Mono, Fraunces

---

## 45. PAGE INVENTORY

### Current Pages

Based on `Home.tsx` imports:

| Page | Public/Auth | Purpose | Primary Action | Responsive |
|------|-------------|---------|----------------|-----------|
| Home | Public | Landing page | Start Planning | Yes |
| About | Public | Problem/solution | Read more | Yes |
| Features | Public | Feature showcase | Start planning | Yes |
| FAQ | Public | Common questions | View answers | Yes |
| Login | Public | Authentication | Login | Yes |
| Register | Public | Account creation | Register | Yes |
| Privacy | Public | Privacy policy | N/A | Yes |
| Terms | Public | Terms & conditions | N/A | Yes |
| Dashboard | Auth | Event workspace | Create event | Yes |
| Event Overview | Auth | Event details | View/manage | Yes |
| Create Event | Auth | Event creation | Save event | Yes |
| Edit Event | Auth | Event editing | Update event | Yes |
| Budget | Auth | Budget management | Add expense | Yes |
| Expenses | Auth | Expense tracking | Add expense | Yes |
| Tasks | Auth | Task management | Add task | Yes |
| Timeline | Auth | Planning timeline | Add milestone | Yes |
| Vendors | Auth | Vendor management | Add vendor | Yes |
| Guests | Auth | Guest management | Add guest | Yes |
| Event-Day Schedule | Auth | Execution schedule | Add schedule | Yes |
| AI Assistant | Auth | AI chat | Send message | Yes |
| Notifications | Auth | Notification center | Mark read | Yes |
| Settings | Auth | User preferences | Save settings | Yes |
| Export | Auth | Export plan | Generate export | Yes |

---

## 46. USER FLOW INVENTORY

### New User Flow

1. **Landing** → `/` (Home)
2. **Register** → `/register` (Registration)
3. **Onboarding** → `/onboarding` (Event setup)
4. **Event Details** → `create_event`
5. **Generate Plan** → `ai_assistant` with plan generation
6. **Review/Accept** → `dashboard` with plan applied

### Returning User Flow

1. **Login** → `/` (Dashboard if authed)
2. **Select Event** → Event switcher
3. **Dashboard** → Main workspace
4. **Manage Event** → Navigate to specific modules

### AI Planning Flow

1. **Event context** → `ai_assistant`
2. **Generate plan** → AI with context
3. **Review** → Plan preview
4. **Accept/Edit** → Persistence

### Budget Flow

1. **Budget overview** → `budget`
2. **Add expense** → `expenses`
3. **Track spending** → Real-time updates
4. **Monitor warnings** → Critical/approaching alerts

---

## 47. UI TRACEABILITY

### Map FRS to UI Pages

| Requirement | Page | Component | Data Source |
|-------------|------|-----------|-------------|
| FR-AUTH-001 | Login | LoginForm | userAuth |
| FR-EVENT-001 | Create Event | CreateEditEventView | events |
| FR-EVENT-002 | Event Overview | EventOverviewView | events |
| FR-BUDGET-001 | Budget | BudgetView | budget |
| FR-EXPENSE-001 | Expenses | ExpensesView | expenses |
| FR-TASK-001 | Tasks | TasksView | tasks |
| FR-TIMELINE-001 | Timeline | TimelineView | timeline |
| FR-VENDOR-001 | Vendors | VendorsView | vendors |
| FR-GUEST-001 | Guests | GuestsView | guests |
| FR-SCHEDULE-001 | Event-Day Schedule | EventDayView | schedule |
| FR-AI-001 | AI Assistant | AiAssistantView | ai |
| FR-AI-005 | AI Chat | AiAssistantView | ai |
| FR-NOTIFY-001 | Notifications | NotificationsView | notifications |
| FR-EXPORT-001 | Export | ExportView | export |
| FR-DASH-001 | Dashboard | DashboardView | dashboard |

---

## 48. FRONTEND IMPLEMENTATION NOTES

### Technology Stack

Based on existing codebase:

- **Framework**: Next.js (React 18+)
- **Styling**: Tailwind CSS (CSS variables)
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Charts**: Recharts (for budget/task visualization)
- **State Management**: Tanstack Query (implied by API patterns)
- **Fonts**: Google Fonts (Geist Sans, Geist Mono, Fraunces)

### Build Tools

- **Package manager**: Bun
- **Development**: `next dev -p 3000`
- **Production**: `next build` + static file serving
- **Linting**: ESLint
- **Type checking**: TypeScript

### Architecture

- **App Router**: File-system based routing
- **Component library**: shadcn/ui
- **Theming**: CSS custom properties
- **Authentication**: Supabase Auth (frontend wrapper)
- **Data fetching**: Server-side rendering + client-side fetching

### Development Considerations

- **Mobile-first**: Responsive design with Tailwind utilities
- **Accessibility**: Semantic HTML, keyboard navigation
- **Performance**: Code splitting, optimized images
- **SEO**: Meta tags, structured data
- **Internationalization**: Not specified (could use Google Fonts subsets)

---

## 49. UI/UX QUALITY CHECKLIST

### Visual

- [x] Consistent typography (Geist Sans, Geist Mono, Fraunces)
- [x] Consistent spacing (4px increments)
- [x] Consistent components (shadcn/ui base)
- [x] Clear hierarchy (semantic HTML)
- [x] No fake metrics (based on PRD data)
- [x] No fake reviews (no social proof)
- [x] No fake counters (actual data only)
- [x] No AI-slop visuals (warm, professional palette)

### UX

- [x] Clear navigation (sidebar + top nav)
- [x] Clear CTAs ("Create Event", "Add Task")
- [x] Useful empty states (action-oriented)
- [x] Useful loading states (spinners, skeletons)
- [x] Useful error states (clear messages)
- [x] Destructive actions confirmed (AlertDialog)
- [x] Mobile-friendly workflows (responsive tables)

### Accessibility

- [x] Keyboard navigation (semantic structure)
- [x] Focus states (CSS ring)
- [x] Labels (form inputs)
- [x] Contrast (color palette)
- [x] Screen reader support (ARIA where needed)
- [x] Skip navigation (header structure)
- [x] Reduced motion (CSS prefers-reduced-motion)

### Product

- [x] Dashboard (aggregated view)
- [x] Event management (create/edit/view)
- [x] Budget (categories, planned, actual, remaining)
- [x] Expenses (CRUD with variance)
- [x] Tasks (CRUD with status/priority)
- [x] Timeline (planning and execution)
- [x] Vendors (CRUD with status)
- [x] Guests (CRUD with RSVP)
- [x] Event-Day Schedule (execution planning)
- [x] AI Assistant (context-aware chat)
- [x] Notifications (in-app alerts)
- [x] Settings (profile/preferences)
- [x] Export (PDF/ICS)

### Production readiness

- [x] Custom domain (https://utsavai.app)
- [x] Favicon (multiple sizes)
- [x] Privacy Policy (page exists)
- [x] Terms and Conditions (page exists)
- [x] Development branding removed (production ready)

---

## 50. OPEN DECISIONS

List all unresolved UI/UX decisions:

- **Final color palette adjustments**: Fine-tune warm palette
- **Typography scale**: Fine-tune heading sizes
- **Breakpoint behavior**: Refine desktop/tablet/mobile layouts
- **Mobile navigation pattern**: Bottom tab bar vs hamburger
- **Loading animation style**: Spinner vs progress indicator
- **Empty state imagery**: Custom illustrations vs icons
- **Chart design**: Specific chart types and styling
- **Form field labels**: Inline vs top-aligned
- **Toast notification placement**: Top vs bottom
- **Event switcher**: Dropdown vs card selection
- **AI assistant positioning**: Right sidebar vs full-screen
- **Export preview**: Client-side vs server-side
- **Mobile keyboard behavior**: Input type selection

Use `OPEN DECISION` for all unresolved decisions.

Do not silently invent UI/UX details.

---

## FINAL RULE

This document provides a complete UI/UX specification based on an existing Next.js application using shadcn/ui, Tailwind CSS, Lucide icons, and Google Fonts.

The specification preserves the established warm celebration design system while documenting all interaction patterns and component requirements.

Save as: `docs/07-UI-UX-SPECIFICATION.md`

Do not modify application source code.

IMPORTANT PROJECT RULE:

**AI must never perform Git commit or Git push operations. Git commit and Git push will always be performed manually by the project owner.**
