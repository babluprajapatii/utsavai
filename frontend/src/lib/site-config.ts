/**
 * UtsavAI - Production Site Configuration
 * Single source of truth for SEO, canonical URLs, and metadata.
 */

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.startsWith('http')
      ? envUrl.replace(/\/+$/, '')
      : `https://${envUrl.replace(/\/+$/, '')}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`;
  }
  return 'https://utsavai.app';
}

export const SITE_URL = getSiteUrl();

export const SITE_CONFIG = {
  name: 'UtsavAI',
  title: 'UtsavAI - Plan your entire celebration in one place',
  description:
    'UtsavAI is an intelligent event and celebration planning platform. Manage budgets, tasks, timelines, vendors, and guests for weddings, birthdays, community events, and family celebrations.',
  ogImage: '/brand/og-image.png',
  locale: 'en_US',
};

