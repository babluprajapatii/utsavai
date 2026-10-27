import { z } from 'zod';
import type { EventContextSummary } from './context-builder';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

// ============================================================================
// Tier 1: Zod Schema Validation
// ============================================================================

export const taskProposalSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(1000).optional().default(''),
  category: z.string().trim().max(100).optional().default('General'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  suggested_due_date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD').optional(),
});

export const milestoneProposalSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(1000).optional().default(''),
  suggested_date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD').optional(),
});

export const budgetCategoryProposalSchema = z.object({
  category: z.string().trim().min(1).max(100),
  suggested_amount: z.number().min(0),
  percentage_of_budget: z.number().min(0).max(100).optional(),
  reasoning: z.string().trim().max(500).optional().default(''),
});

export const vendorCategoryProposalSchema = z.object({
  category: z.string().trim().min(1).max(100),
  importance: z.enum(['Critical', 'Recommended', 'Optional']).optional().default('Recommended'),
  recommendation: z.string().trim().max(1000).optional().default(''),
});

export const scheduleItemProposalSchema = z.object({
  activity: z.string().trim().min(1).max(300),
  start_time: z.string().regex(timeRegex, 'Time must be HH:MM'),
  end_time: z.string().regex(timeRegex, 'Time must be HH:MM').optional(),
  description: z.string().trim().max(1000).optional().default(''),
  responsible_party: z.string().trim().max(100).optional().default(''),
});

export const riskItemProposalSchema = z.object({
  risk: z.string().trim().min(1).max(300),
  severity: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  mitigation: z.string().trim().max(1000).optional().default(''),
});

export const generatedPlanSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  recommendations: z.array(z.string().trim().max(500)).default([]),
  tasks: z.array(taskProposalSchema).min(1, 'At least one task required'),
  milestones: z.array(milestoneProposalSchema).min(1, 'At least one milestone required'),
  budget_categories: z.array(budgetCategoryProposalSchema).default([]),
  vendor_categories: z.array(vendorCategoryProposalSchema).default([]),
  guest_checklist: z.array(z.string().trim().max(500)).default([]),
  event_day_schedule: z.array(scheduleItemProposalSchema).default([]),
  risks: z.array(riskItemProposalSchema).default([]),
});

export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;

// ============================================================================
// Tier 2: Business Validation & Normalization
// ============================================================================

export interface PlanValidationResult {
  valid: boolean;
  plan?: GeneratedPlan;
  errors?: string[];
  warnings?: string[];
}

/**
 * Validates raw Gemini plan output against schema (Tier 1) and business rules (Tier 2).
 * Normalizes budget totals and sanitizes dates to guarantee consistency with event constraints.
 */
export function validateAndNormalizePlan(
  rawJson: unknown,
  context: EventContextSummary
): PlanValidationResult {
  const parsed = generatedPlanSchema.safeParse(rawJson);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map(
      (iss) => `${iss.path.join('.')}: ${iss.message}`
    );
    return {
      valid: false,
      errors: errorDetails,
    };
  }

  const plan = parsed.data;
  const warnings: string[] = [];

  const today = new Date().toISOString().slice(0, 10);
  const eventDate = context.eventDate;

  // 1. Budget Normalization: Ensure sum of categories matches totalBudget within 5% tolerance
  if (context.totalBudget > 0 && plan.budget_categories.length > 0) {
    const currentSum = plan.budget_categories.reduce(
      (acc, cat) => acc + cat.suggested_amount,
      0
    );

    const tolerance = context.totalBudget * 0.05;
    if (Math.abs(currentSum - context.totalBudget) > tolerance) {
      warnings.push(
        `Budget allocations rebalanced to match event budget ₹${context.totalBudget.toLocaleString('en-IN')}.`
      );
      const ratio = currentSum > 0 ? context.totalBudget / currentSum : 1;

      plan.budget_categories = plan.budget_categories.map((cat) => {
        const rebalanced = Math.round(cat.suggested_amount * ratio);
        return {
          ...cat,
          suggested_amount: rebalanced,
          percentage_of_budget: Number(
            ((rebalanced / context.totalBudget) * 100).toFixed(1)
          ),
        };
      });
    }
  }

  // 2. Chronological Sanity: Clamps task due dates between today and eventDate
  plan.tasks = plan.tasks.map((task) => {
    let date = task.suggested_due_date || eventDate;
    if (date > eventDate) date = eventDate;
    if (date < today) date = today;
    return { ...task, suggested_due_date: date };
  });

  // 3. Chronological Sanity: Clamps milestones between today and eventDate
  plan.milestones = plan.milestones.map((ms) => {
    let date = ms.suggested_date || eventDate;
    if (date > eventDate) date = eventDate;
    if (date < today) date = today;
    return { ...ms, suggested_date: date };
  });

  // 4. Deduplicate task titles
  const seenTasks = new Set<string>();
  plan.tasks = plan.tasks.filter((t) => {
    const key = t.title.toLowerCase();
    if (seenTasks.has(key)) return false;
    seenTasks.add(key);
    return true;
  });

  // 5. Deduplicate budget categories
  const seenCategories = new Set<string>();
  plan.budget_categories = plan.budget_categories.filter((c) => {
    const key = c.category.toLowerCase();
    if (seenCategories.has(key)) return false;
    seenCategories.add(key);
    return true;
  });

  return {
    valid: true,
    plan,
    warnings,
  };
}

// ============================================================================
// Deterministic Contextual Fallback Plan Generator
// ============================================================================

/**
 * Generates an intelligent, deterministic plan tailored to the event parameters.
 * Used when Gemini API is unconfigured or in offline development modes.
 */
export function generateDeterministicPlan(context: EventContextSummary): GeneratedPlan {
  const total = context.totalBudget || 500000;
  const eventDateObj = new Date(context.eventDate);

  const daysBefore = (days: number): string => {
    const d = new Date(eventDateObj);
    d.setDate(d.getDate() - days);
    const today = new Date();
    if (d.getTime() < today.getTime()) {
      return today.toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  };

  // Budget Splits
  const budgetAllocations = [
    {
      category: 'Venue & Infrastructure',
      suggested_amount: Math.round(total * 0.32),
      percentage_of_budget: 32.0,
      reasoning: 'Primary celebration venue and hall rental fees.',
    },
    {
      category: 'Catering & Hospitality',
      suggested_amount: Math.round(total * 0.30),
      percentage_of_budget: 30.0,
      reasoning: `Food, beverages, and banquet service for ${context.guestCount} guests.`,
    },
    {
      category: 'Decoration & Theme Ambience',
      suggested_amount: Math.round(total * 0.15),
      percentage_of_budget: 15.0,
      reasoning: `Stage setup, lighting, and floral styling${context.theme ? ` aligned with ${context.theme}` : ''}.`,
    },
    {
      category: 'Photography & Media',
      suggested_amount: Math.round(total * 0.12),
      percentage_of_budget: 12.0,
      reasoning: 'Photo and cinematic video coverage for key moments.',
    },
    {
      category: 'Contingency & Miscellaneous',
      suggested_amount: Math.round(total * 0.11),
      percentage_of_budget: 11.0,
      reasoning: 'Emergency operational reserve for last-minute adjustments.',
    },
  ];

  // Tailored Tasks
  const tasks = [
    {
      title: `Finalize & Contract ${context.type} Venue`,
      description: `Inspect capacity for ${context.guestCount} attendees and confirm sound permit timings.`,
      category: 'Venue',
      priority: 'Critical' as const,
      suggested_due_date: daysBefore(Math.min(context.daysRemaining, 45)),
    },
    {
      title: 'Tasting & Final Catering Menu Selection',
      description: `Confirm veg/non-veg split and dietary requirements${context.specialRequirements ? ` (${context.specialRequirements})` : ''}.`,
      category: 'Catering',
      priority: 'Critical' as const,
      suggested_due_date: daysBefore(Math.min(context.daysRemaining, 30)),
    },
    {
      title: 'Contract Lead Photographer & Videographer',
      description: 'Review portfolio, shot checklist, and album delivery terms.',
      category: 'Photography',
      priority: 'High' as const,
      suggested_due_date: daysBefore(Math.min(context.daysRemaining, 30)),
    },
    {
      title: 'Theme & Stage Decor Briefing',
      description: `Provide decorator with palette and references${context.style ? ` for a ${context.style} atmosphere` : ''}.`,
      category: 'Decoration',
      priority: 'High' as const,
      suggested_due_date: daysBefore(Math.min(context.daysRemaining, 21)),
    },
    {
      title: 'Send Digital Invitations with RSVP Tracking',
      description: `Distribute invitations to ${context.guestCount} target attendees and set response deadline.`,
      category: 'Guests',
      priority: 'High' as const,
      suggested_due_date: daysBefore(Math.min(context.daysRemaining, 21)),
    },
    {
      title: 'Final Headcount Handover to Caterer',
      description: 'Lock in guaranteed minimum plate count based on received RSVPs.',
      category: 'Catering',
      priority: 'Critical' as const,
      suggested_due_date: daysBefore(Math.min(context.daysRemaining, 7)),
    },
    {
      title: 'Distribute Event-Day Schedule to Vendors',
      description: 'Ensure arrival, setup, and soundcheck slots are clear to all coordinators.',
      category: 'Logistics',
      priority: 'Medium' as const,
      suggested_due_date: daysBefore(Math.min(context.daysRemaining, 3)),
    },
  ];

  // Milestones
  const milestones = [
    {
      title: 'Core Bookings Sealed (Venue & Catering)',
      description: 'Primary location confirmed and major hospitality retainer paid.',
      suggested_date: daysBefore(Math.min(context.daysRemaining, 35)),
    },
    {
      title: 'Creative Setup Finalized (Decor & Media)',
      description: 'Audio, visuals, and theme ambience design approved.',
      suggested_date: daysBefore(Math.min(context.daysRemaining, 20)),
    },
    {
      title: 'RSVP Cutoff & Operations Freeze',
      description: 'Headcount locked and event-day run-of-show shared with coordinators.',
      suggested_date: daysBefore(Math.min(context.daysRemaining, 5)),
    },
  ];

  // Schedule
  const schedule = [
    {
      activity: 'Vendor Load-In & Audio/Visual Checks',
      start_time: '14:00',
      end_time: '16:00',
      description: 'Stage decoration setup, lighting test, and audio calibration.',
      responsible_party: 'Decor Coordinator',
    },
    {
      activity: 'Guest Arrival & Welcome Hospitality',
      start_time: '17:30',
      end_time: '18:30',
      description: 'Welcome refreshments, registration, and seating assistance.',
      responsible_party: 'Hospitality Lead',
    },
    {
      activity: `Main ${context.type} Ceremony & Celebrations`,
      start_time: '18:30',
      end_time: '20:30',
      description: 'Key traditional rites, stage presentations, and family felicitations.',
      responsible_party: 'Family Emcee',
    },
    {
      activity: 'Banquet Dinner & Socializing',
      start_time: '20:30',
      end_time: '22:30',
      description: 'Full buffet dinner service and candid photo sessions.',
      responsible_party: 'Catering Captain',
    },
  ];

  return {
    summary: `Structured ${context.type} plan tailored for "${context.name}" on ${context.eventDate} in ${context.location || 'designated venue'} with ${context.guestCount} guests and a ₹${total.toLocaleString('en-IN')} target budget.`,
    recommendations: [
      `Lock in the venue deposit immediately to safeguard the date against competing bookings.`,
      `Hold catering to approximately 30% of total expenditure to maintain a safe contingency reserve.`,
      `Finalize high-impact priorities (${context.priorities.slice(0, 3).join(', ') || 'Venue, Catering'}) before non-essential items.`,
    ],
    tasks,
    milestones,
    budget_categories: budgetAllocations,
    vendor_categories: [
      {
        category: 'Venue',
        importance: 'Critical',
        recommendation: 'Verify power backup, sound restrictions, and parking capacity before signing.',
      },
      {
        category: 'Catering',
        importance: 'Critical',
        recommendation: 'Request a menu tasting and verify live food counter requirements.',
      },
      {
        category: 'Photography',
        importance: 'Recommended',
        recommendation: 'Provide shot list of key family members and ceremony milestones.',
      },
    ],
    guest_checklist: [
      'Compile initial guest contact numbers and family groups.',
      'Dispatch digital save-the-date cards 30 days prior.',
      'Follow up with pending RSVPs one week before final catering lock.',
    ],
    event_day_schedule: schedule,
    risks: [
      {
        risk: 'Vendor arrival delays due to event-day traffic',
        severity: 'Medium',
        mitigation: 'Schedule vendor load-in at least 3 hours before guest arrival.',
      },
      {
        risk: 'Catering plate overages from unregistered attendees',
        severity: 'Medium',
        mitigation: 'Buffer plate estimate by 5-8% over confirmed RSVPs.',
      },
    ],
  };
}

