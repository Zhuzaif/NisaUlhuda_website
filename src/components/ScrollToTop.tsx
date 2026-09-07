import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Nisa Ul Huda | 100% Ad-Free Islamic Companion',
    description: 'Nisa Ul Huda: Your trusted, ad-free Islamic mobile companion for Muslim women. Featuring Ask Aalima, Purity Tracker, Holy Quran, and Prayer Times.'
  },
  '/download': {
    title: 'Download App | Nisa Ul Huda (Android)',
    description: 'Download the Nisa Ul Huda app for free. 100% ad-free, private, and offline-capable Islamic worship companion.'
  },
  '/contact': {
    title: 'Contact Us | Nisa Ul Huda Support & Guidance',
    description: 'Get in touch with the Nisa Ul Huda team for technical assistance, app feedback, or Islamic inquiries.'
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Nisa Ul Huda',
    description: 'Read our strict privacy policy. Zero advertising, zero tracking, and local device-only storage.'
  },
  '/terms': {
    title: 'Terms & Conditions | Nisa Ul Huda',
    description: 'Understand the terms of service, guidelines, and user agreement for Nisa Ul Huda.'
  },
  '/sitemap': {
    title: 'Website Sitemap | Nisa Ul Huda',
    description: 'Complete directory of all pages, Islamic features, and legal policies on Nisa Ul Huda.'
  }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Scroll window to top instantly on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // 2. Set dynamic document title for true URL-based page feel
    const meta = routeMeta[pathname] || {
      title: 'Nisa Ul Huda - Islamic Companion',
      description: 'Your trusted, ad-free Islamic mobile companion.'
    };

    document.title = meta.title;

    // 3. Update meta description tag
    let metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (!metaDescriptionTag) {
      metaDescriptionTag = document.createElement('meta');
      metaDescriptionTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionTag);
    }
    metaDescriptionTag.setAttribute('content', meta.description);

  }, [pathname]);

  return null;
};

export default ScrollToTop;
