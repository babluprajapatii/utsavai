import { getSiteUrl, SITE_CONFIG } from './site-config';

/**
 * UtsavAI - Structured Data (JSON-LD) Generator
 * Generates valid Schema.org entities linked via @graph.
 *
 * Supported schemas:
 * 1. Organization - Identity, canonical URL, logo, description.
 * 2. WebSite - Canonical website entity with publisher reference.
 * 3. WebApplication (SoftwareApplication) - Browser-based event planning workspace.
 * 4. FAQPage - Verified, visible questions and answers for event planning and AI assistance.
 */
export function getStructuredData() {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: SITE_CONFIG.name,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${siteUrl}/#logo`,
          url: `${siteUrl}/brand/logo-mark.png`,
          caption: `${SITE_CONFIG.name} Logo`,
        },
        description: SITE_CONFIG.description,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#webapp`,
        name: SITE_CONFIG.name,
        url: siteUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        description: SITE_CONFIG.description,
        provider: {
          '@id': `${siteUrl}/#organization`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        isPartOf: {
          '@id': `${siteUrl}/#website`,
        },
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What kinds of events does UtsavAI support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Weddings, birthdays, community events, family celebrations, and custom events. The same interface works for all of them, with categories and recommendations that adapt to the occasion.',
            },
          },
          {
            '@type': 'Question',
            name: 'What does the AI actually do?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The AI generates a starter plan based on your event details, and answers questions in the assistant using your event context. It can suggest priorities, surface overdue tasks, and propose budget trade-offs.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is UtsavAI a vendor marketplace?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. UtsavAI is a planning and management workspace. You research, shortlist, and book vendors on your own terms. The product helps you track them, not sell to you.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does event budget tracking and contingency work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'UtsavAI lets you set an overall target budget and distribute planned amounts across essential categories: venue, food/catering, decoration, photography, entertainment, transportation, and contingency. It compares planned vs. actual expenses and includes a dedicated contingency line to absorb unexpected expenses and price variations.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the difference between the Planning Timeline and the Event-Day Schedule?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Planning Timeline tracks major milestones across weeks or months leading up to the celebration. The Event-Day Schedule is an hour-by-hour, mobile-optimized operational run sheet designed for coordinators and family leads on the day of the event.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does guest management handle RSVPs and meal preferences?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'You can track real-time response statuses (Attending, Declined, Pending), plus-ones, family groups, and dietary preferences (vegetarian, non-vegetarian, or special needs) for accurate catering calculations.',
            },
          },
        ],
      },
    ],
  };
}

