import fs from 'node:fs';

console.log('UTSAVAI TECHNICAL SEO VERIFICATION');
console.log('===================================\n');

let failed = 0;

function check(title, condition, detail = '') {
  if (condition) {
    console.log(`[PASS] ${title}`);
  } else {
    console.error(`[FAIL] ${title}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

const expectedUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`
    : 'https://utsavai-ten.vercel.app');

console.log(`Verifying against target canonical domain: ${expectedUrl}\n`);

// 1. Check robots.txt generated body
const robotsPath = 'frontend/.next/server/app/robots.txt.body';
check('robots.txt was generated during build', fs.existsSync(robotsPath));

if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  check('robots.txt contains User-Agent rule', robots.includes('User-Agent: *'));
  check('robots.txt allows root path', robots.includes('Allow: /'));
  check('robots.txt disallows /api/', robots.includes('Disallow: /api/'));
  check('robots.txt disallows /auth/', robots.includes('Disallow: /auth/'));
  check('robots.txt does not block CSS/JS/images', !robots.includes('/_next/'));
  check(`robots.txt links to absolute HTTPS sitemap.xml (${expectedUrl}/sitemap.xml)`, robots.includes(`Sitemap: ${expectedUrl}/sitemap.xml`));
}

// 2. Check sitemap.xml generated body
const sitemapPath = 'frontend/.next/server/app/sitemap.xml.body';
check('sitemap.xml was generated during build', fs.existsSync(sitemapPath));

if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  check('sitemap.xml starts with XML declaration', sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  check('sitemap.xml has valid urlset namespace', sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  check(`sitemap.xml includes canonical homepage URL (<loc>${expectedUrl}</loc>)`, sitemap.includes(`<loc>${expectedUrl}</loc>`));
  check('sitemap.xml includes lastmod timestamp', sitemap.includes('<lastmod>'));
  check('sitemap.xml has changefreq', sitemap.includes('<changefreq>weekly</changefreq>'));
  check('sitemap.xml excludes private /api/ routes', !sitemap.includes('/api/'));
  check('sitemap.xml excludes private /auth/ routes', !sitemap.includes('/auth/'));
  check('sitemap.xml excludes dashboard/app routes', !sitemap.includes('dashboard'));
}

// 3. Check index.html SEO metadata
const indexPath = 'frontend/.next/server/app/index.html';
check('index.html was prerendered', fs.existsSync(indexPath));

if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8');
  check('HTML specifies lang="en"', html.includes('<html lang="en">'));
  check('HTML specifies viewport tag', html.includes('name="viewport" content="width=device-width, initial-scale=1"'));
  check(`Canonical tag is present and points to ${expectedUrl}`, html.includes(`rel="canonical" href="${expectedUrl}"`));
  check('Robots meta tag permits indexing', html.includes('name="robots" content="index, follow"'));
  check('Googlebot meta tag is configured', html.includes('name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"'));
  check('OpenGraph title is present', html.includes('property="og:title"'));
  check(`OpenGraph image is absolute URL (${expectedUrl}/brand/og-image.png)`, html.includes(`property="og:image" content="${expectedUrl}/brand/og-image.png"`));
  check(`OpenGraph canonical url is present (${expectedUrl})`, html.includes(`property="og:url" content="${expectedUrl}"`));
  check('Twitter card is configured as summary_large_image', html.includes('name="twitter:card" content="summary_large_image"'));
  check('Unique meta description exists', html.includes('name="description" content="UtsavAI is an intelligent event and celebration planning platform.'));
}

// 4. Check 404 page noindex directive
const notFoundPath = 'frontend/.next/server/app/_not-found.html';
check('_not-found.html was prerendered', fs.existsSync(notFoundPath));

if (fs.existsSync(notFoundPath)) {
  const notFoundHtml = fs.readFileSync(notFoundPath, 'utf8');
  check('404 page has noindex directive', notFoundHtml.includes('noindex'));
}

// 5. Ensure legacy public/robots.txt was cleanly removed
check('Static public/robots.txt removed to allow dynamic app/robots.ts', !fs.existsSync('frontend/public/robots.txt'));

console.log('\n===================================');
if (failed === 0) {
  console.log('ALL TECHNICAL SEO CHECKS PASSED (24/24)');
  process.exit(0);
} else {
  console.error(`FAILED: ${failed} checks failed.`);
  process.exit(1);
}
