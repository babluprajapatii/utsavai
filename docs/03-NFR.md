# UtsavAI - Non-Functional Requirements

**Version:** 1.0
**Status:** Draft
**Product:** UtsavAI
**Source documents:** UtsavAI PRD (`docs/01-PRD.md`), UtsavAI FRS (`docs/02-FRS.md`)
**Purpose:** Define quality, security, performance, reliability, accessibility, maintainability, and deployment expectations for UtsavAI.
**Intended audience:** Development team, QA team, DevOps, technical stakeholders.

---

## 1. Document Information

- **Document name:** 03-NFR.md
- **Product:** UtsavAI
- **Version:** 1.0
- **Status:** Draft
- **Source documents:** `01-PRD.md`, `02-FRS.md`
- **Purpose:** Define NFRs for UtsavAI
- **Intended audience:** Development, QA, DevOps, technical stakeholders

---

## 2. NFR Identification

Each non-functional requirement uses unique identifier:

```text
NFR-<DOMAIN>-<NNN>
```

Examples:

```text
NFR-PERF-001
NFR-SEC-001
NFR-REL-001
NFR-SCALE-001
NFR-MAINT-001
NFR-ACC-001
NFR-DEP-001
NFR-AI-001
```

Each requirement must be:

- Specific
- Testable
- Implementation-independent where possible

---

## 3. PERFORMANCE REQUIREMENTS

### NFR-PERF-001: Page Load Performance

- **Priority:** P2
- **Verification:** Automated performance testing, manual review
- **Preconditions:** Developed application
- **Trigger:** User navigates to pages
- **Expected behavior:** Initial page load under 3 seconds on broadband, 5 seconds on mobile
- **Details:** Fast initial page load, optimized assets, appropriate lazy loading, minimal unnecessary client-side JavaScript
- **Open decision:** Exact thresholds not defined by PRD

### NFR-PERF-002: Dashboard Performance

- **Priority:** P1
- **Verification:** Performance testing
- **Expected behavior:** Dashboard renders within 2 seconds with events < 100 guests
- **Details:** Efficient database queries, pagination for large datasets

### NFR-PERF-003: CRUD Performance

- **Priority:** P2
- **Verification:** Load testing
- **Expected behavior:** CRUD operations complete within 1 second
- **Details:** Optimized backend responses, efficient database indexing

### NFR-PERF-004: AI Plan Generation Performance

- **Priority:** P2
- **Verification:** Performance testing
- **Expected behavior:** AI plan generation completes within 30 seconds
- **Details:** Cache generated plans when possible, limit repeated AI calls

### NFR-PERF-005: AI Chat Performance

- **Priority:** P2
- **Verification:** Performance testing
- **Expected behavior:** AI chat responses within 5 seconds
- **Details:** Use efficient context building, avoid sending entire database

### NFR-PERF-006: Mobile Performance

- **Priority:** P1
- **Verification:** Manual testing on devices
- **Expected behavior:** Application usable on mobile with 4G connection
- **Details:** Touch-friendly interface, efficient data transfer

### NFR-PERF-007: Large Dataset Performance

- **Priority:** P2
- **Verification:** Load testing with test data
- **Expected behavior:** Application usable with 10,000 guests, 10,000 tasks, 10,000 expenses
- **Details:** Pagination, efficient filtering, server-side computation

---

## 4. RESPONSIVENESS

### NFR-RESP-001: Desktop Responsiveness

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Full desktop functionality on screens > 1024px
- **Details:** Optimized desktop interface, comprehensive feature set

### NFR-RESP-002: Tablet Responsiveness

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Optimized tablet experience on screens 768-1024 px
- **Details:** Two-column layouts, touch targets, horizontal scrolling where appropriate

### NFR-RESP-003: Mobile Responsiveness

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Functional experience on screens < 768 px
- **Details:** Single-column layouts, bottom navigation, expanded touch targets

### NFR-RESP-004: Component Responsiveness

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** All components usable across device types
- **Details:** Tables, forms, dialogs, sidebars, budget, expenses, guests, vendors, timeline, AI assistant, event-day schedule

---

## 5. ACCESSIBILITY

### NFR-ACC-001: WCAG 2.1 AA Compliance

- **Priority:** P0
- **Verification:** Automated accessibility testing, manual review
- **Expected behavior:** Meets WCAG 2.1 AA principles
- **Details:**
  - Semantic HTML
  - Keyboard navigation
  - Focus management
  - Visible focus states
  - Screen reader support
  - Form labels
  - Error messages
  - Accessible dialogs
  - Proper color contrast
  - Alt text
  - Skip-to-content navigation
  - Reduced motion

### NFR-ACC-002: Keyboard Navigation

- **Priority:** P0
- **Verification:** Manual testing
- **Expected behavior:** Complete navigation without mouse
- **Details:** Focus order, tab stops, Enter/Space activation, escape handling

### NFR-ACC-003: Screen Reader Compatibility

- **Priority:** P1
- **Verification:** Screen reader testing
- **Expected behavior:** Screen readers can access all content
- **Details:** ARIA labels, live regions, announcements

### NFR-ACC-004: Focus Management

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Clear focus indicators, logical focus order
- **Details:** Focus visible, no focus traps

---

## 6. SECURITY REQUIREMENTS

### NFR-SEC-001: Authentication Security

- **Priority:** P0
- **Verification:** Security review
- **Expected behavior:** Secure authentication, session handling
- **Details:**
  - Secure password handling
  - Session timeout
  - Secure logout
  - Protected routes

### NFR-SEC-002: Authorization

- **Priority:** P0
- **Verification:** Security review, penetration testing
- **Expected behavior:** User can only access own data
- **Details:**
  - Backend authorization checks
  - No reliance on frontend-only security
  - Ownership enforcement

### NFR-SEC-003: Data Protection

- **Priority:** P0
- **Verification:** Security review
- **Expected behavior:** User data protected
- **Details:**
  - Event information protected
  - Guest information protected
  - Expense information protected
  - Vendor information protected
  - AI conversations protected

### NFR-SEC-004: Input Validation

- **Priority:** P1
- **Verification:** Security testing
- **Expected behavior:** All user input validated and sanitized
- **Details:**
  - Injection protection
  - XSS prevention
  - SQL injection prevention
  - Input format validation

### NFR-SEC-005: Secrets Management

- **Priority:** P1
- **Verification:** Security review
- **Expected behavior:** No secrets in client code
- **Details:**
  - No API keys in browser
  - Environment variables for secrets
  - No secrets in Git

### NFR-SEC-006: AI Data Handling

- **Priority:** P1
- **Verification:** Data flow review
- **Expected behavior:** AI receives minimal necessary data
- **Details:**
  - No private data sent unnecessarily
  - AI output treated as untrusted
  - Validation before persistence

---

## 7. AI SAFETY AND RELIABILITY

### NFR-AI-001: AI Context Usage

- **Priority:** P2
- **Verification:** Code review
- **Expected behavior:** AI uses relevant event context only
- **Details:**
  - Only necessary data sent to AI
  - Current event context only
  - No global data sent

### NFR-AI-002: AI Output Validation

- **Priority:** P0
- **Verification:** Testing
- **Expected behavior:** AI output validated before persistence
- **Details:**
  - Schema validation
  - Business rule validation
  - Never direct DB writes

### NFR-AI-003: AI Error Handling

- **Priority:** P1
- **Verification:** Error handling review
- **Expected behavior:** AI failures handled gracefully
- **Details:**
  - Fallback UI for AI failures
  - User-friendly error messages
  - Retry behavior where appropriate

### NFR-AI-004: AI Constraints

- **Priority:** P0
- **Verification:** Code review
- **Expected behavior:** AI follows strict constraints
- **Details:**
  - No inventing vendor availability
  - No inventing prices
  - No claiming external access
  - No overriding application calculations

---

## 8. RELIABILITY

### NFR-REL-001: API Reliability

- **Priority:** P1
- **Verification:** Automated testing, monitoring
- **Expected behavior:** Failed API requests handled gracefully
- **Details:**
  - Retry logic where appropriate
  - User-friendly error messages
  - Offline functionality where possible

### NFR-REL-002: Database Reliability

- **Priority:** P1
- **Verification:** Testing
- **Expected behavior:** Database failures handled gracefully
- **Details:**
  - Transaction support
  - Recovery from transient failures
  - Data integrity checks

### NFR-REL-003: AI Reliability

- **Priority:** P2
- **Verification:** Testing
- **Expected behavior:** AI provider failures handled gracefully
- **Details:**
  - Fallback UI
  - User-friendly messages
  - Retry behavior

### NFR-REL-004: Export Reliability

- **Priority:** P2
- **Verification:** Testing
- **Expected behavior:** Export failures handled gracefully
- **Details:**
  - User-friendly error messages
  - Retry where appropriate

### NFR-REL-005: Authentication Reliability

- **Priority:** P0
- **Verification:** Testing
- **Expected behavior:** Authentication failures handled gracefully
- **Details:**
  - Clear error messages
  - Recovery options
  - Rate limiting protection

---

## 9. DATA INTEGRITY

### NFR-DINT-001: Budget Integrity

- **Priority:** P0
- **Verification:** Automated testing
- **Expected behavior:** Budget calculations always accurate
- **Details:**
  - Remaining budget always correct
  - Utilization always correct
  - Warnings always accurate
  - Dashboard metrics always accurate

### NFR-DINT-002: Task Integrity

- **Priority:** P0
- **Verification:** Testing
- **Expected behavior:** Task states always consistent
- **Details:**
  - Completion counts accurate
  - Deadlines accurate
  - Overdue status accurate
  - Notifications accurate

### NFR-DINT-003: Guest Integrity

- **Priority:** P0
- **Verification:** Testing
- **Expected behavior:** Guest RSVP always consistent
- **Details:**
  - Statistics accurate
  - Dashboard accurate
  - Risk indicators accurate

### NFR-DINT-004: Vendor Integrity

- **Priority:** P0
- **Verification:** Testing
- **Expected behavior:** Vendor status always consistent
- **Details:**
  - Statistics accurate
  - Risk indicators accurate

### NFR-DINT-005: AI Plan Integrity

- **Priority:** P0
- **Verification:** Testing
- **Expected behavior:** AI plans validated before persistence
- **Details:**
  - Schema validation
  - Business rule validation
  - Persistence validation

---

## 10. DATA PERSISTENCE

### NFR-PERST-001: Production Persistence

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Data persists in production
- **Details:**
  - Not demo-only persistence
  - Real database operations
  - Proper backup and recovery

### NFR-PERST-002: Production vs Demo

- **Priority:** P2
- **Verification:** Documentation review
- **Expected behavior:** Clear distinction between demo and production
- **Details:**
  - Clear marking of demo data
  - Not claiming demo persistence is production

---

## 11. SCALABILITY

### NFR-SCALE-001: Monolith Architecture

- **Priority:** P1
- **Verification:** Architecture review
- **Expected behavior:** Modular monolith, not microservices
- **Details:**
  - Single codebase
  - Shared database
  - No microservices
  - No Kubernetes
  - No Redis
  - No Elasticsearch

### NFR-SCALE-002: Future Growth

- **Priority:** P2
- **Verification:** Architecture review
- **Expected behavior:** Architecture allows future growth
- **Details:**
  - Modular design
  - Clear boundaries
  - Scalable within monolith

---

## 12. MAINTAINABILITY

### NFR-MAINT-001: Code Structure

- **Priority:** P1
- **Verification:** Code review
- **Expected behavior:** Clean, modular code
- **Details:**
  - TypeScript
  - Modular structure
  - Reusable components
  - Clear boundaries

### NFR-MAINT-002: Naming and Typing

- **Priority:** P1
- **Verification:** Code review
- **Expected behavior:** Clear naming and strong typing
- **Details:**
  - Consistent naming
  - Strong TypeScript
  - Clear interfaces

### NFR-MAINT-003: Validation and Config

- **Priority:** P1
- **Verification:** Code review
- **Expected behavior:** Proper validation and config
- **Details:**
  - Validation schemas
  - Environment configuration
  - Error handling

### NFR-MAINT-004: Documentation

- **Priority:** P1
- **Verification:** Documentation review
- **Expected behavior:** Adequate documentation
- **Details:**
  - Code documentation
  - Architecture documentation
  - README files

---

## 13. CODE QUALITY

### NFR-CODE-001: Code Health

- **Priority:** P1
- **Verification:** Linting, type checking
- **Expected behavior:** Clean code
- **Details:**
  - No unused code
  - No dead controls
  - No broken interactions
  - No magic values
  - No duplicated logic
  - No hardcoded secrets
  - No unnecessary dependencies
  - Clear error handling
  - Type-safe data flow

### NFR-CODE-002: Testing

- **Priority:** P1
- **Verification:** Automated testing
- **Expected behavior:** Core business logic testable
- **Details:**
  - Unit tests for critical logic
  - Integration tests
  - Test coverage where appropriate

---

## 14. UI/UX QUALITY

### NFR-UI-001: Production Feel

- **Priority:** P1
- **Verification:** UX review
- **Expected behavior:** Real product feel
- **Details:**
  - Meaningful product copy
  - No marketing fluff
  - No fake metrics
  - No slop branding
  - Production-ready navigation

### NFR-UI-002: No AI Slop

- **Priority:** P2
- **Verification:** Review
- **Expected behavior:** No AI-generated fluff
- **Details:**
  - No purple gradients
  - No pill buttons everywhere
  - No fake reviews
  - No emoji icons primary
  - No excessive animations
  - Meaningful copy

### NFR-UI-003: Real Metrics

- **Priority:** P2
- **Verification:** Review
- **Expected behavior:** All metrics from real data
- **Details:**
  - No fake customer counters
  - No fake statistics
  - No social proof

---

## 15. BRANDING AND PRODUCTION READINESS

### NFR-BRAND-001: Production Branding

- **Priority:** P0
- **Verification:** Manual review
- **Expected behavior:** Production-ready branding
- **Details:**
  - Custom domain
  - Favicon
  - Proper metadata
  - Privacy Policy
  - Terms and Conditions
  - No "Made with AI" branding
  - Production navigation
  - Production error handling

---

## 16. RESPONSIBLE DEMO DATA

### NFR-DEMO-001: Demo Data Rules

- **Priority:** P2
- **Verification:** Manual review
- **Expected behavior:** Demo data clearly marked
- **Details:**
  - Clearly demo data
  - No implying real customers
  - No implying real relationships
  - No fake statistics
  - No social proof

---

## 17. DEPLOYMENT REQUIREMENTS

### NFR-DEPLOY-001: Zero-Cost Architecture

- **Priority:** P0
- **Verification:** Architecture review
- **Expected behavior:** Zero-cost-first architecture
- **Details:**
  - GitHub
  - Vercel
  - Next.js
  - Supabase PostgreSQL
  - Supabase Auth
  - Supabase Storage
  - Gemini API
  - No client-side AI credentials

### NFR-DEPLOY-002: Environment Configuration

- **Priority:** P0
- **Verification:** Deployment review
- **Expected behavior:** Environment variables for configuration
- **Details:**
  - No secrets in code
  - Environment variables for all config
  - Proper deployment process

---

## 18. ZERO-COST CONSTRAINTS

### NFR-ZERO-001: Free Infrastructure

- **Priority:** P1
- **Verification:** Architecture review
- **Expected behavior:** Free infrastructure only
- **Details:**
  - Free/open-source tech
  - Free hosting tiers
  - No paid infrastructure
  - Exclude: paid SMS, email, payment gateway, dedicated servers, Kubernetes, microservices, Redis, Elasticsearch, paid load balancer

### NFR-ZERO-002: Tiers Available

- **Priority:** P2
- **Verification:** Manual review
- **Expected behavior:** Dependencies replaceable if free tiers unavailable
- **Details:**
  - Design for tier changes
  - Multiple provider options where possible

---

## 19. ERROR AND OBSERVABILITY REQUIREMENTS

### NFR-OBSERV-001: Error Handling

- **Priority:** P0
- **Verification:** Manual testing
- **Expected behavior:** Graceful error handling
- **Details:**
  - No internal stack traces exposed
  - User-friendly error messages
  - No sensitive info exposed
  - Proper logging

### NFR-OBSERV-002: Monitoring

- **Priority:** P2
- **Verification:** Manual review
- **Expected behavior:** Failures detectable and loggable
- **Details:**
  - Error logging
  - Performance monitoring
  - User behavior tracking

---

## 20. BROWSER COMPATIBILITY

### NFR-BROWSER-001: Modern Browsers

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Current modern browsers supported
- **Details:**
  - Chrome
  - Edge
  - Firefox
  - Safari
- **Open decision:** Exact version requirements not specified

---

## 21. MOBILE REQUIREMENTS

### NFR-MOBILE-001: Core Mobile Support

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Core workflows work on mobile
- **Details:**
  - Login, registration, event creation
  - Dashboard, tasks, budget
  - Expenses, vendors, guests
  - Timeline, schedule, AI assistant

### NFR-MOBILE-002: Mobile UI

- **Priority:** P1
- **Verification:** Manual testing
- **Expected behavior:** Mobile-friendly UI
- **Details:**
  - Single-column layouts
  - Bottom navigation
  - Expanded touch targets
  - Tables mobile-optimized

---

## 22. PRIVACY REQUIREMENTS

### NFR-PRIV-001: Privacy Protection

- **Priority:** P1
- **Verification:** Privacy review
- **Expected behavior:** User data protected
- **Details:**
  - Collect only necessary data
  - Restrict access by ownership
  - Avoid unnecessary AI data exposure
  - Privacy Policy page

---

## 23. BACKUP AND RECOVERY

### NFR-BACKUP-001: Backup Expectations

- **Priority:** P2
- **Verification:** Documentation review
- **Expected behavior:** Clear backup strategy
- **Details:**
  - Document what backup capability is available
  - Document what's outside application control
  - Document recovery strategy
- **Open decision:** Exact backup requirements depend on free tier

---

## 24. RATE LIMITING AND RESOURCE PROTECTION

### NFR-RATE-001: AI Usage Limits

- **Priority:** P2
- **Verification:** Monitoring setup
- **Expected behavior:** Economical AI usage
- **Details:**
  - Avoid unnecessary AI calls
  - Cache generated plans
  - Reuse results
  - Efficient context building

### NFR-RATE-002: Protection Against Abuse

- **Priority:** P1
- **Verification:** Security review
- **Expected behavior:** Protection against excessive usage
- **Details:**
  - Rate limiting for AI calls
  - Protection for authentication
  - Protection for expensive operations
  - Protection for export generation

---

## 25. AVAILABILITY

### NFR-AVAIL-001: Reasonable Availability

- **Priority:** P2
- **Verification:** Monitoring
- **Expected behavior:** Reasonable availability for MVP
- **Details:**
  - No enterprise-level promises
  - Clear distinction of responsibilities
  - Free tier limitations understood

---

## 26. NFR PRIORITY

| ID | Requirement | Priority | Priority Notes |
|---|---|---|---|
| NFR-PERF-001 | Page Load Performance | P2 | Open decision on exact thresholds |
| NFR-PERF-002 | Dashboard Performance | P1 | Critical for UX |
| NFR-PERF-003 | CRUD Performance | P2 | Good performance needed |
| NFR-PERF-004 | AI Plan Generation Performance | P2 | Performance important but not critical |
| NFR-PERF-005 | AI Chat Performance | P2 | Performance important but not critical |
| NFR-PERF-006 | Mobile Performance | P1 | Important for mobile users |
| NFR-PERF-007 | Large Dataset Performance | P2 | Not required for MVP |
| NFR-RESP-001 | Desktop Responsiveness | P1 | Core functionality |
| NFR-RESP-002 | Tablet Responsiveness | P1 | Growing user base |
| NFR-RESP-003 | Mobile Responsiveness | P1 | Important market segment |
| NFR-RESP-004 | Component Responsiveness | P1 | Complete feature set |
| NFR-ACC-001 | WCAG 2.1 AA Compliance | P0 | Legal and ethical requirement |
| NFR-ACC-002 | Keyboard Navigation | P0 | Critical for accessibility |
| NFR-ACC-003 | Screen Reader Compatibility | P1 | Important for accessibility |
| NFR-ACC-004 | Focus Management | P1 | Important for usability |
| NFR-SEC-001 | Authentication Security | P0 | Critical security requirement |
| NFR-SEC-002 | Authorization | P0 | Critical security requirement |
| NFR-SEC-003 | Data Protection | P0 | Critical security requirement |
| NFR-SEC-004 | Input Validation | P1 | Important security requirement |
| NFR-SEC-005 | Secrets Management | P1 | Important security requirement |
| NFR-SEC-006 | AI Data Handling | P1 | Important data protection |
| NFR-AI-001 | AI Context Usage | P2 | Important for AI quality |
| NFR-AI-002 | AI Output Validation | P0 | Critical for data integrity |
| NFR-AI-003 | AI Error Handling | P1 | Important for reliability |
| NFR-AI-004 | AI Constraints | P0 | Critical for safety |
| NFR-REL-001 | API Reliability | P1 | Important for usability |
| NFR-REL-002 | Database Reliability | P1 | Important for data integrity |
| NFR-REL-003 | AI Reliability | P2 | Important for AI quality |
| NFR-REL-004 | Export Reliability | P2 | Not critical feature |
| NFR-REL-005 | Authentication Reliability | P0 | Critical for access |
| NFR-DINT-001 | Budget Integrity | P0 | Critical for financial accuracy |
| NFR-DINT-002 | Task Integrity | P0 | Critical for planning accuracy |
| NFR-DINT-003 | Guest Integrity | P0 | Critical for guest tracking |
| NFR-DINT-004 | Vendor Integrity | P0 | Critical for vendor management |
| NFR-DINT-005 | AI Plan Integrity | P0 | Critical for data integrity |
| NFR-PERST-001 | Production Persistence | P1 | Important for functionality |
| NFR-PERST-002 | Production vs Demo | P2 | Documentation requirement |
| NFR-SCALE-001 | Monolith Architecture | P1 | Architectural decision |
| NFR-SCALE-002 | Future Growth | P2 | Architectural requirement |
| NFR-MAINT-001 | Code Structure | P1 | Development requirement |
| NFR-MAINT-002 | Naming and Typing | P1 | Development requirement |
| NFR-MAINT-003 | Validation and Config | P1 | Development requirement |
| NFR-MAINT-004 | Documentation | P1 | Development requirement |
| NFR-CODE-001 | Code Health | P1 | Development requirement |
| NFR-CODE-002 | Testing | P1 | Development requirement |
| NFR-UI-001 | Production Feel | P1 | User experience requirement |
| NFR-UI-002 | No AI Slop | P2 | Brand requirement |
| NFR-UI-003 | Real Metrics | P2 | Content requirement |
| NFR-BRAND-001 | Production Branding | P0 | Launch requirement |
| NFR-DEMO-001 | Demo Data Rules | P2 | Documentation requirement |
| NFR-DEPLOY-001 | Zero-Cost Architecture | P0 | Architecture decision |
| NFR-DEPLOY-002 | Environment Configuration | P0 | Security requirement |
| NFR-ZERO-001 | Free Infrastructure | P1 | Architecture constraint |
| NFR-ZERO-002 | Tiers Available | P2 | Architecture requirement |
| NFR-OBSERV-001 | Error Handling | P0 | Critical for usability |
| NFR-OBSERV-002 | Monitoring | P2 | Operational requirement |
| NFR-BROWSER-001 | Modern Browsers | P1 | Compatibility requirement |
| NFR-MOBILE-001 | Core Mobile Support | P1 | Market requirement |
| NFR-MOBILE-002 | Mobile UI | P1 | UX requirement |
| NFR-PRIV-001 | Privacy Protection | P1 | Legal requirement |
| NFR-BACKUP-001 | Backup Expectations | P2 | Operational requirement |
| NFR-RATE-001 | AI Usage Limits | P2 | Cost control requirement |
| NFR-RATE-002 | Protection Against Abuse | P1 | Security requirement |
| NFR-AVAIL-001 | Reasonable Availability | P2 | Operational requirement |

---

## 27. VERIFICATION METHOD

| ID | Requirement | Priority | Verification Method |
|---|---|---|---|
| NFR-PERF-001 | Page Load Performance | P2 | Automated performance testing |
| NFR-PERF-002 | Dashboard Performance | P1 | Performance testing |
| NFR-PERF-003 | CRUD Performance | P2 | Load testing |
| NFR-PERF-004 | AI Plan Generation Performance | P2 | Performance testing |
| NFR-PERF-005 | AI Chat Performance | P2 | Performance testing |
| NFR-PERF-006 | Mobile Performance | P1 | Manual device testing |
| NFR-PERF-007 | Large Dataset Performance | P2 | Load testing with test data |
| NFR-RESP-001 | Desktop Responsiveness | P1 | Manual testing |
| NFR-RESP-002 | Tablet Responsiveness | P1 | Manual testing |
| NFR-RESP-003 | Mobile Responsiveness | P1 | Manual testing |
| NFR-RESP-004 | Component Responsiveness | P1 | Manual testing |
| NFR-ACC-001 | WCAG 2.1 AA Compliance | P0 | Automated testing, manual review |
| NFR-ACC-002 | Keyboard Navigation | P0 | Manual testing |
| NFR-ACC-003 | Screen Reader Compatibility | P1 | Screen reader testing |
| NFR-ACC-004 | Focus Management | P1 | Manual testing |
| NFR-SEC-001 | Authentication Security | P0 | Security review |
| NFR-SEC-002 | Authorization | P0 | Security review, penetration testing |
| NFR-SEC-003 | Data Protection | P0 | Security review |
| NFR-SEC-004 | Input Validation | P1 | Security testing |
| NFR-SEC-005 | Secrets Management | P1 | Security review |
| NFR-SEC-006 | AI Data Handling | P1 | Data flow review |
| NFR-AI-001 | AI Context Usage | P2 | Code review |
| NFR-AI-002 | AI Output Validation | P0 | Testing |
| NFR-AI-003 | AI Error Handling | P1 | Error handling review |
| NFR-AI-004 | AI Constraints | P0 | Code review |
| NFR-REL-001 | API Reliability | P1 | Automated testing, monitoring |
| NFR-REL-002 | Database Reliability | P1 | Testing |
| NFR-REL-003 | AI Reliability | P2 | Testing |
| NFR-REL-004 | Export Reliability | P2 | Testing |
| NFR-REL-005 | Authentication Reliability | P0 | Testing |
| NFR-DINT-001 | Budget Integrity | P0 | Automated testing |
| NFR-DINT-002 | Task Integrity | P0 | Testing |
| NFR-DINT-003 | Guest Integrity | P0 | Testing |
| NFR-DINT-004 | Vendor Integrity | P0 | Testing |
| NFR-DINT-005 | AI Plan Integrity | P0 | Testing |
| NFR-PERST-001 | Production Persistence | P1 | Manual testing |
| NFR-PERST-002 | Production vs Demo | P2 | Documentation review |
| NFR-SCALE-001 | Monolith Architecture | P1 | Architecture review |
| NFR-SCALE-002 | Future Growth | P2 | Architecture review |
| NFR-MAINT-001 | Code Structure | P1 | Code review |
| NFR-MAINT-002 | Naming and Typing | P1 | Code review |
| NFR-MAINT-003 | Validation and Config | P1 | Code review |
| NFR-MAINT-004 | Documentation | P1 | Documentation review |
| NFR-CODE-001 | Code Health | P1 | Linting, type checking |
| NFR-CODE-002 | Testing | P1 | Automated testing |
| NFR-UI-001 | Production Feel | P1 | UX review |
| NFR-UI-002 | No AI Slop | P2 | Review |
| NFR-UI-003 | Real Metrics | P2 | Review |
| NFR-BRAND-001 | Production Branding | P0 | Manual review |
| NFR-DEMO-001 | Demo Data Rules | P2 | Manual review |
| NFR-DEPLOY-001 | Zero-Cost Architecture | P0 | Architecture review |
| NFR-DEPLOY-002 | Environment Configuration | P0 | Deployment review |
| NFR-ZERO-001 | Free Infrastructure | P1 | Architecture review |
| NFR-ZERO-002 | Tiers Available | P2 | Manual review |
| NFR-OBSERV-001 | Error Handling | P0 | Manual testing |
| NFR-OBSERV-002 | Monitoring | P2 | Manual review |
| NFR-BROWSER-001 | Modern Browsers | P1 | Manual testing |
| NFR-MOBILE-001 | Core Mobile Support | P1 | Manual testing |
| NFR-MOBILE-002 | Mobile UI | P1 | Manual testing |
| NFR-PRIV-001 | Privacy Protection | P1 | Privacy review |
| NFR-BACKUP-001 | Backup Expectations | P2 | Documentation review |
| NFR-RATE-001 | AI Usage Limits | P2 | Monitoring setup |
| NFR-RATE-002 | Protection Against Abuse | P1 | Security review |
| NFR-AVAIL-001 | Reasonable Availability | P2 | Monitoring |

---

## 28. NFR TRACEABILITY

| PRD/FRS Requirement | NFR ID | Quality Area | Priority |
|---|---|---|---|
| FR-AUTH-001 | NFR-SEC-001 | Security | P0 |
| FR-AUTH-002 | NFR-SEC-001 | Security | P0 |
| FR-AUTH-003 | NFR-SEC-001 | Security | P0 |
| FR-AUTH-004 | NFR-SEC-001 | Security | P0 |
| FR-AUTH-005 | NFR-SEC-002 | Security | P0 |
| FR-EVENT-001 | NFR-PERF-002 | Performance | P1 |
| FR-EVENT-002 | NFR-PERF-002 | Performance | P1 |
| FR-EVENT-003 | NFR-PERF-003 | Performance | P2 |
| FR-EVENT-004 | NFR-PERF-003 | Performance | P2 |
| FR-DASH-001 | NFR-PERF-002 | Performance | P1 |
| FR-BUDGET-001 | NFR-DINT-001 | Data Integrity | P0 |
| FR-BUDGET-002 | NFR-DINT-001 | Data Integrity | P0 |
| FR-EXPENSE-001 | NFR-DINT-001 | Data Integrity | P0 |
| FR-EXPENSE-002 | NFR-DINT-001 | Data Integrity | P0 |
| FR-EXPENSE-003 | NFR-DINT-001 | Data Integrity | P0 |
| FR-TASK-001 | NFR-DINT-002 | Data Integrity | P0 |
| FR-TASK-002 | NFR-DINT-002 | Data Integrity | P0 |
| FR-TASK-003 | NFR-DINT-002 | Data Integrity | P0 |
| FR-TASK-004 | NFR-DINT-002 | Data Integrity | P0 |
| FR-TASK-005 | NFR-DINT-002 | Data Integrity | P0 |
| FR-TASK-006 | NFR-DINT-002 | Data Integrity | P0 |
| FR-TIMELINE-001 | NFR-DINT-002 | Data Integrity | P0 |
| FR-TIMELINE-002 | NFR-DINT-002 | Data Integrity | P0 |
| FR-VENDOR-001 | NFR-DINT-004 | Data Integrity | P0 |
| FR-VENDOR-002 | NFR-DINT-004 | Data Integrity | P0 |
| FR-GUEST-001 | NFR-DINT-003 | Data Integrity | P0 |
| FR-GUEST-002 | NFR-DINT-003 | Data Integrity | P0 |
| FR-SCHEDULE-001 | NFR-DINT-002 | Data Integrity | P0 |
| FR-SCHEDULE-002 | NFR-DINT-002 | Data Integrity | P0 |
| FR-AI-001 | NFR-AI-002 | AI Safety | P0 |
| FR-AI-002 | NFR-AI-002 | AI Safety | P0 |
| FR-AI-003 | NFR-AI-002 | AI Safety | P0 |
| FR-AI-004 | NFR-AI-003 | AI Reliability | P1 |
| FR-AI-005 | NFR-AI-001 | AI Context | P2 |
| FR-AI-006 | NFR-AI-004 | AI Constraints | P0 |
| FR-PERSONALIZE-001 | NFR-ZERO-001 | Architecture | P1 |
| FR-RISK-001 | NFR-DINT-001 | Data Integrity | P0 |
| FR-RISK-002 | NFR-DINT-001 | Data Integrity | P0 |
| FR-NOTIFY-001 | NFR-OBSERV-001 | Error Handling | P0 |
| FR-EXPORT-001 | NFR-PERF-001 | Performance | P2 |
| FR-SETTINGS-001 | NFR-MAINT-001 | Maintainability | P1 |

---

## 29. MVP NFR CHECKLIST

### Security
- [x] Secure authentication (NFR-SEC-001)
- [x] Authorization enforcement (NFR-SEC-002)
- [x] Data protection (NFR-SEC-003)
- [x] Input validation (NFR-SEC-004)
- [x] Secrets management (NFR-SEC-005)
- [x] AI data handling (NFR-SEC-006)

### Accessibility
- [x] WCAG 2.1 AA compliance (NFR-ACC-001)
- [x] Keyboard navigation (NFR-ACC-002)
- [x] Screen reader compatibility (NFR-ACC-003)
- [x] Focus management (NFR-ACC-004)

### Performance
- [x] Dashboard performance (NFR-PERF-002)
- [x] CRUD performance (NFR-PERF-003)
- [x] Mobile performance (NFR-PERF-006)

### Reliability
- [x] API reliability (NFR-REL-001)
- [x] Database reliability (NFR-REL-002)
- [x] Authentication reliability (NFR-REL-005)

### Data Integrity
- [x] Budget integrity (NFR-DINT-001)
- [x] Task integrity (NFR-DINT-002)
- [x] Guest integrity (NFR-DINT-003)
- [x] Vendor integrity (NFR-DINT-004)
- [x] AI plan integrity (NFR-DINT-005)

### AI Reliability
- [x] AI output validation (NFR-AI-002)
- [x] AI constraints (NFR-AI-004)

### Mobile
- [x] Core mobile support (NFR-MOBILE-001)
- [x] Mobile UI (NFR-MOBILE-002)

### Deployment
- [x] Zero-cost architecture (NFR-DEPLOY-001)
- [x] Environment configuration (NFR-DEPLOY-002)

### Branding
- [x] Production branding (NFR-BRAND-001)

### Privacy
- [x] Privacy protection (NFR-PRIV-001)

### Maintainability
- [x] Code structure (NFR-MAINT-001)
- [x] Naming and typing (NFR-MAINT-002)
- [x] Validation and config (NFR-MAINT-003)
- [x] Documentation (NFR-MAINT-004)

---

## 30. FINAL SUMMARY

### Critical NFRs (P0)
- Security requirements (authentication, authorization, data protection)
- Accessibility (WCAG 2.1 AA compliance)
- Data integrity (budget, tasks, guests, vendors, AI plans)
- AI safety (output validation, constraints)
- Error handling
- Production branding
- Privacy protection

### High-priority NFRs (P1)
- Performance (dashboard, CRUD, mobile)
- Reliability (API, database, authentication)
- Responsiveness (all devices)
- Maintainability (code structure, documentation)
- Zero-cost architecture
- Mobile support

### Medium-priority NFRs (P2)
- Scalability (monolith architecture)
- Code quality
- UI/UX quality
- Demo data rules
- Rate limiting
- Availability
- Backup expectations

### Low-priority NFRs (P3)
- Large dataset performance
- Browser compatibility (exact versions)
- AI reliability
- Export reliability
- Environment tiers
- Monitoring

### Dependencies
- Zero-cost architecture enables many constraints
- Security and accessibility are non-negotiable
- Data integrity is critical for financial accuracy
- AI safety is essential for user trust

### Open Decisions
- Exact performance thresholds
- Browser version support
- Backup requirements (dependent on free tier)

### Verification Requirements
- Automated testing for critical paths
- Manual testing for UX and accessibility
- Security review for authentication
- Performance testing for dashboard

---

## QUALITY RULES

This document must be:

- Professional
- Precise
- Testable
- Developer-readable
- QA-readable
- Consistent with `01-PRD.md` and `02-FRS.md`
- Free of duplicate requirements
- Free of vague statements
- Free of implementation code
- Free of marketing language

Save the final document as:

```text
docs/03-NFR.md
```

Do not modify application source code while creating this document.

The `docs` folder is the single location for project documentation.

Remember: AI must never perform Git commits or Git push operations. Git commits and pushes will always be performed manually by the project owner.
