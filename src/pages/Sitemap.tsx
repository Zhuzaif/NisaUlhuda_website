import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Network, 
  Home, 
  Download, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Compass, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Calendar, 
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SitemapItem {
  title: string;
  url: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  isExternal?: boolean;
  badge?: string;
  category: 'Main Pages' | 'Legal & Policies' | 'App Features';
}

const sitemapData: SitemapItem[] = [
  // Main Pages
  {
    title: 'Home',
    url: '/',
    description: 'Nisa Ul Huda official homepage, app highlights, spiritual tools, and community mission.',
    icon: Home,
    category: 'Main Pages',
    badge: 'Core'
  },
  {
    title: 'Download App',
    url: '/download',
    description: 'Get Nisa Ul Huda for Android. 100% free, private, and ad-free Islamic companion.',
    icon: Download,
    category: 'Main Pages',
    badge: 'Popular'
  },
  {
    title: 'Contact Us',
    url: '/contact',
    description: 'Direct communication for technical support, inquiries, and app suggestions.',
    icon: Mail,
    category: 'Main Pages',
  },

  // Legal & Policies
  {
    title: 'Privacy Policy',
    url: '/privacy-policy',
    description: 'Comprehensive details on our zero-data selling, local device storage, and privacy practices.',
    icon: ShieldCheck,
    category: 'Legal & Policies',
  },
  {
    title: 'Terms & Conditions',
    url: '/terms',
    description: 'App usage terms, community guidelines, intellectual property, and service agreements.',
    icon: FileText,
    category: 'Legal & Policies',
  },

  // App Features
  {
    title: 'Prayer Times & Adhan',
    url: '/download',
    description: 'Precise location-based prayer timings with audio Adhan alerts tailored for Muslim women.',
    icon: Clock,
    category: 'App Features',
    badge: 'App Feature'
  },
  {
    title: 'Holy Quran & Recitations',
    url: '/download',
    description: 'Complete Quran Kareem with Urdu translation, word-by-word analysis, and tranquil recitations.',
    icon: BookOpen,
    category: 'App Features',
    badge: 'App Feature'
  },
  {
    title: 'Accurate Qibla Compass',
    url: '/download',
    description: 'High-precision magnetic Qibla locator showing direct heading towards the Holy Kaaba.',
    icon: Compass,
    category: 'App Features',
    badge: 'App Feature'
  },
  {
    title: 'Digital Tasbeeh & Azkar',
    url: '/download',
    description: 'Morning and evening authentic supplications with haptic digital bead counting.',
    icon: Sparkles,
    category: 'App Features',
    badge: 'App Feature'
  },
  {
    title: 'Purity & Cycle Tracker',
    url: '/download',
    description: 'Discreet Islamic menstrual and purity (Haidh/Tuhr) tracking strictly stored on your own device.',
    icon: Calendar,
    category: 'App Features',
    badge: 'Exclusive'
  },
  {
    title: 'Fiqh Library & Ask Aalima',
    url: '/download',
    description: 'Authentic Hanafi fiqh guidance on women’s matters and direct verified scholarly answers.',
    icon: HelpCircle,
    category: 'App Features',
    badge: 'Scholarly'
  }
];

const Sitemap: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const xmlSitemapUrl = 'https://nisa.hudalabs.app/sitemap.xml';

  const handleCopyXmlUrl = () => {
    navigator.clipboard.writeText(xmlSitemapUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredItems = sitemapData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: Array<'Main Pages' | 'Legal & Policies' | 'App Features'> = [
    'Main Pages',
    'Legal & Policies',
    'App Features'
  ];

  return (
    <div className="overflow-x-hidden font-sans text-gray-800 bg-gray-100 min-h-screen">
      
      {/* Hero Section with Islamic Architectural Ambience */}
      <section className="relative bg-[#111827] min-h-[70vh] flex flex-col">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}image for privacy and terms.webp`} 
            alt="Islamic Architecture Geometric Pattern - Nisa Ul Huda Website Sitemap" 
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/95"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pb-20 pt-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-14 h-14 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <Network size={26} strokeWidth={2} />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-serif text-5xl md:text-6xl text-white font-bold mb-2 drop-shadow-lg"
          >
            Website Sitemap
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-gray-300 max-w-2xl text-lg md:text-xl font-light"
          >
            Explore all pages, app features, and legal documentation for Nisa Ul Huda in one organized directory.
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="relative z-20 max-w-6xl mx-auto -mt-24 px-6 lg:px-8 pb-24">
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 sm:p-10 md:p-12 border border-slate-100">
          
          {/* Top Utility Bar: Search + XML Sitemap Quick Action */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-8 border-b border-slate-200">
            {/* Search Box */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search pages or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59d5f] focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* XML Sitemap CTA Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                href={`${import.meta.env.BASE_URL}sitemap.xml`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#061a14] text-[#c59d5f] text-xs font-semibold hover:bg-[#0b291e] transition-colors shadow-md border border-[#c59d5f]/30"
              >
                <span>Raw XML Sitemap</span>
                <ExternalLink size={14} />
              </a>

              <button
                onClick={handleCopyXmlUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors border border-slate-200"
                title="Copy XML Sitemap URL"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span className="text-green-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Categorized Sitemap Sections */}
          <div className="space-y-12 pt-8">
            {categories.map((category) => {
              const categoryItems = filteredItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <section key={category} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c59d5f]"></span>
                    <h2 className="text-2xl font-serif font-bold text-[#061a14] tracking-wide">
                      {category}
                    </h2>
                    <span className="text-xs bg-[#c59d5f]/15 text-[#916e34] font-semibold px-2.5 py-0.5 rounded-full">
                      {categoryItems.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.title}
                          to={item.url}
                          className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#c59d5f]/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 rounded-xl bg-[#061a14]/5 text-[#061a14] group-hover:bg-[#061a14] group-hover:text-[#c59d5f] flex items-center justify-center transition-colors duration-300">
                                <IconComponent size={20} strokeWidth={2} />
                              </div>
                              {item.badge && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#c59d5f]/15 text-[#856530]">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-[#061a14] transition-colors mb-1.5 flex items-center gap-1.5">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#c59d5f] group-hover:text-[#061a14]">
                            <span className="text-[11px] text-slate-400 font-mono group-hover:text-slate-600">
                              {item.url}
                            </span>
                            <div className="flex items-center gap-1">
                              <span>Visit</span>
                              <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">No pages or features found matching &quot;{searchQuery}&quot;.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-[#c59d5f] font-semibold underline hover:text-[#061a14]"
                >
                  Clear search filter
                </button>
              </div>
            )}
          </div>

          {/* Bottom Info Banner */}
          <div className="mt-14 rounded-2xl bg-[#061a14] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#c59d5f]/30">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-serif text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c59d5f]"></span>
                Looking for Web Crawler XML Sitemap?
              </h4>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-sans">
                Search engines such as Google, Bing, and Yandex can automatically parse our valid XML sitemap at:
                <code className="block mt-1 text-[#c59d5f] font-mono text-[11px]">https://nisa.hudalabs.app/sitemap.xml</code>
              </p>
            </div>
            <a
              href={`${import.meta.env.BASE_URL}sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-2.5 rounded-xl bg-[#c59d5f] hover:bg-[#b08b50] text-[#061a14] font-bold text-xs tracking-wider uppercase transition-colors shadow-lg"
            >
              Open sitemap.xml
            </a>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Sitemap;
