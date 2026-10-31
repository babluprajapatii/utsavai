import { getSiteUrl, SITE_CONFIG } from './site-config';

/**
 * UtsavAI - Structured Data (JSON-LD) Generator
 * Generates valid Schema.org entities linked via @graph.
 *
 * Supported schemas:
 * 1. Organization - Identity, canonical URL, logo, description.
 * 2. WebSite - Canonical website entity with publisher reference.
 * 3. WebApplication (SoftwareApplication) - Browser-based event planning workspace.
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
    ],
  };
}

