/**
 * Guest RSVP & Catering Metrics Aggregator for UtsavAI
 * Source: docs/15-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md Section 4.3
 */

export interface GuestInput {
  id: string;
  rsvp: "pending" | "accepted" | "declined" | string;
  plusOnes?: number;
  mealPreference?: "veg" | "non-veg" | "jain" | "vegan" | string;
}

export interface GuestMetricsSummary {
  totalInvited: number;
  acceptedCount: number;
  declinedCount: number;
  pendingCount: number;
  totalAttending: number; // accepted guests + their plus-ones
  plusOnesTotal: number;
  mealBreakdown: {
    veg: number;
    nonVeg: number;
    jain: number;
    vegan: number;
    unspecified: number;
  };
}

/**
 * Aggregates RSVP response statuses, plus-one headcount, and catering dietary splits.
 */
export function calculateGuestMetrics(guests: GuestInput[]): GuestMetricsSummary {
  let acceptedCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;
  let plusOnesTotal = 0;

  const mealBreakdown = {
    veg: 0,
    nonVeg: 0,
    jain: 0,
    vegan: 0,
    unspecified: 0,
  };

  for (const guest of guests) {
    const rsvp = String(guest.rsvp || "").toLowerCase();
    if (rsvp === "accepted") {
      acceptedCount++;
      const plusOnes = Math.max(0, Number(guest.plusOnes) || 0);
      plusOnesTotal += plusOnes;

      const meal = String(guest.mealPreference || "").toLowerCase();
      if (meal === "veg" || meal === "vegetarian") {
        mealBreakdown.veg++;
      } else if (meal === "non-veg" || meal === "non_veg" || meal === "non vegetarian") {
        mealBreakdown.nonVeg++;
      } else if (meal === "jain") {
        mealBreakdown.jain++;
      } else if (meal === "vegan") {
        mealBreakdown.vegan++;
      } else {
        mealBreakdown.unspecified++;
      }
    } else if (rsvp === "declined") {
      declinedCount++;
    } else {
      pendingCount++;
    }
  }

  return {
    totalInvited: guests.length,
    acceptedCount,
    declinedCount,
    pendingCount,
    totalAttending: acceptedCount + plusOnesTotal,
    plusOnesTotal,
    mealBreakdown,
  };
}

