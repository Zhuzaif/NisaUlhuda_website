const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const routes = [
  {
    path: 'download',
    title: 'Download App | Nisa Ul Huda (Android)',
    description: 'Download the Nisa Ul Huda app for free. 100% ad-free, private, and offline-capable Islamic worship companion.'
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy | Nisa Ul Huda',
    description: 'Read our strict privacy policy. Zero advertising, zero tracking, and local device-only storage.'
  },
  {
    path: 'terms',
    title: 'Terms & Conditions | Nisa Ul Huda',
    description: 'Understand the terms of service, guidelines, and user agreement for Nisa Ul Huda.'
  },
  {
    path: 'contact',
    title: 'Contact Us | Nisa Ul Huda Support & Guidance',
    description: 'Get in touch with the Nisa Ul Huda team for technical assistance, app feedback, or Islamic inquiries.'
  },
  {
    path: 'daily-ayat',
    title: 'Daily Quranic Ayat Posters & Quotes | Nisa Ul Huda',
    description: 'Explore and download high-resolution daily Quranic Ayat calligraphy posters in Urdu and Arabic. 100% free for spiritual reflection and WhatsApp sharing.'
  },
  {
    path: 'sitemap',
    title: 'Website Sitemap | Nisa Ul Huda',
    description: 'Complete directory of all pages, Islamic features, and legal policies on Nisa Ul Huda.'
  }
];

// 1. Generate route-specific index.html files
routes.forEach(route => {
  const routeDir = path.join(distDir, route.path);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  let customizedHtml = baseHtml;
  
  // Replace title
  customizedHtml = customizedHtml.replace(
    /<title>.*?<\/title>/i,
    `<title>${route.title}</title>`
  );

  // Replace meta description
  customizedHtml = customizedHtml.replace(
    /<meta name="description" content=".*?" \/>/i,
    `<meta name="description" content="${route.description}" />`
  );

  // Replace Canonical Link
  customizedHtml = customizedHtml.replace(
    /<link rel="canonical" href=".*?" \/>/i,
    `<link rel="canonical" href="https://nisa.hudalabs.app/${route.path}" />`
  );

  // Replace Open Graph Tags
  customizedHtml = customizedHtml.replace(
    /<meta property="og:url" content=".*?" \/>/i,
    `<meta property="og:url" content="https://nisa.hudalabs.app/${route.path}" />`
  );
  customizedHtml = customizedHtml.replace(
    /<meta property="og:title" content=".*?" \/>/i,
    `<meta property="og:title" content="${route.title}" />`
  );
  customizedHtml = customizedHtml.replace(
    /<meta property="og:description" content=".*?" \/>/i,
    `<meta property="og:description" content="${route.description}" />`
  );

  // Replace Twitter Card Tags
  customizedHtml = customizedHtml.replace(
    /<meta name="twitter:url" content=".*?" \/>/i,
    `<meta name="twitter:url" content="https://nisa.hudalabs.app/${route.path}" />`
  );
  customizedHtml = customizedHtml.replace(
    /<meta name="twitter:title" content=".*?" \/>/i,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  customizedHtml = customizedHtml.replace(
    /<meta name="twitter:description" content=".*?" \/>/i,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  const outputPath = path.join(routeDir, 'index.html');
  fs.writeFileSync(outputPath, customizedHtml, 'utf8');
  console.log(`Generated route HTML: dist/${route.path}/index.html`);
});

// 2. Generate dist/404.html for SPA fallback
const notFoundPath = path.join(distDir, '404.html');
fs.writeFileSync(notFoundPath, baseHtml, 'utf8');
console.log('Generated dist/404.html for SPA fallback');

console.log('All static route HTML files created successfully!');
