import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

