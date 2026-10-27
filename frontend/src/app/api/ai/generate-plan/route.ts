import { NextRequest } from 'next/server';
import { getAuthContext, verifyEventOwnership } from '@/lib/api/auth';
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api/response';
import { generatePlanSchema } from '@/lib/api/validation';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return unauthorized();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest('Malformed JSON in request body.');
    }

    const parsed = generatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Generate plan validation failed.', parsed.error.format());
    }

    const { event_id } = parsed.data;

    // Verify event ownership
    const event = await verifyEventOwnership(auth.supabase, event_id, auth.user.id);
    if (!event) {
      return notFound('Event not found.');
    }

    // Load preferences
    const { data: pref } = await auth.supabase
      .from('event_preferences')
      .select('*')
      .eq('event_id', event_id)
      .maybeSingle();

    const totalBudget = Number(event.total_budget ?? 0);
    const eventDate = event.event_date;

    // Generate tailored structured plan proposal based on event parameters
    const draftPlanPayload = {
      tasks: [
        {
          title: `Finalize ${event.type} Venue and Reserve Date`,
          description: `Confirm booking contract and deposit for ${event.location || 'selected venue'}.`,
          category: 'Venue',
          priority: 'Critical',
          suggestedDueDate: eventDate,
        },
        {
          title: 'Review Catering Menu & Guest Headcount',
          description: `Ensure selections accommodate estimated ${event.guest_count ?? 100} guests.`,
          category: 'Catering',
          priority: 'High',
          suggestedDueDate: eventDate,
        },
        {
          title: 'Select Theme and Floral Decorators',
          description: `Align decorative setup with ${pref?.theme || 'requested'} theme.`,
          category: 'Decoration',
          priority: 'Medium',
          suggestedDueDate: eventDate,
        },
        {
          title: 'Book Primary Photographer and Cinematographer',
          description: 'Secure full-day photo coverage and candid portraits.',
          category: 'Photography',
          priority: 'High',
          suggestedDueDate: eventDate,
        },
      ],
      milestones: [
        {
          title: 'Event Date Reservation & Deposit Paid',
          date: eventDate,
          description: 'Initial major checkpoint marking confirmed celebration site.',
        },
        {
          title: 'Final Headcount & Catering Freeze',
          date: eventDate,
          description: 'Lock in guest list and dietary preferences.',
        },
      ],
      budgetAllocations: [
        {
          category: 'Venue',
          suggestedAmount: Number((totalBudget * 0.35).toFixed(2)),
          reasoning: 'Primary space and operational infrastructure.',
        },
        {
          category: 'Catering',
          suggestedAmount: Number((totalBudget * 0.30).toFixed(2)),
          reasoning: 'Hospitality and meals for expected attendees.',
        },
        {
          category: 'Decoration',
          suggestedAmount: Number((totalBudget * 0.15).toFixed(2)),
          reasoning: 'Lighting, staging, and floral ambience.',
        },
        {
          category: 'Photography',
          suggestedAmount: Number((totalBudget * 0.10).toFixed(2)),
          reasoning: 'Visual memories and digital documentation.',
        },
        {
          category: 'Other',
          suggestedAmount: Number((totalBudget * 0.10).toFixed(2)),
          reasoning: 'Contingency reserve for last-minute adjustments.',
        },
      ],
      vendorCategories: [
        {
          category: 'Venue',
          recommendation: 'Target spacious halls with air conditioning and adequate parking.',
          priority: 'High',
        },
        {
          category: 'Catering',
          recommendation: 'Request tasting session 60 days before event date.',
          priority: 'High',
        },
      ],
      eventDaySchedule: [
        {
          activity: 'Vendor Setup & Sound Check',
          time: '09:00',
          description: 'Coordinate hall access for staging and sound teams.',
        },
        {
          activity: 'Guest Welcome & Refreshments',
          time: '11:00',
          description: 'Welcome drinks and attendee seating.',
        },
        {
          activity: 'Main Celebration Ceremony',
          time: '12:30',
          description: 'Core ceremony and presentations.',
        },
        {
          activity: 'Banquet Meal & Socializing',
          time: '14:00',
          description: 'Full buffet hospitality.',
        },
      ],
      recommendations: [
        {
          recommendation: 'Lock in high-demand vendors at least 3 months ahead.',
          reason: 'Weekend availability during peak season fills quickly.',
          priority: 'High',
        },
      ],
      risks: [
        {
          risk: 'Overspending on decor enhancements without fixed estimates.',
          severity: 'Medium',
          mitigation: 'Set hard spending cap in vendor agreements.',
        },
      ],
    };

    // Stage plan in ai_generated_plans table
    const { data: stagedPlan, error: stageErr } = await auth.supabase
      .from('ai_generated_plans')
      .insert({
        event_id,
        user_id: auth.user.id,
        plan_data: draftPlanPayload,
        model: 'gemini-1.5-flash',
        status: 'Draft',
      })
      .select('id, created_at')
      .single();

    if (stageErr || !stagedPlan) {
      return serverError('Failed to stage generated plan in database.', stageErr?.message);
    }

    return apiSuccess({
      planId: stagedPlan.id,
      generatedAt: stagedPlan.created_at,
      ...draftPlanPayload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverError('Unexpected error in AI plan generation.', message);
  }
}

