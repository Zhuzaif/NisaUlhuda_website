import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Share2, Eye, X, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import type { DailyAyat as DailyAyatType } from '../types/ayat';
import { getAyats } from '../utils/ayatStorage';
import { initialAyats } from '../data/defaultAyats';

const defaultThemes = [
  'Sabr & Hope',
  'Peace & Healing',
  'Gratitude (Shukr)',
  'Mercy & Forgiveness',
  'Supplication (Dua)',
  'Guidance & Faith'
];

const DailyAyat: React.FC = () => {
  const [ayats, setAyats] = useState<DailyAyatType[]>(initialAyats);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalAyat, setActiveModalAyat] = useState<DailyAyatType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getAyats().then(data => {
      if (data && data.length > 0) {
        setAyats(data);
      }
    });
  }, []);

  // Dynamically compile categories from all posters + defaults
  const dynamicCategories = React.useMemo(() => {
    const presentCats = new Set<string>();
    let hasUncategorized = false;

    ayats.forEach(a => {
      const t = a.theme?.trim();
      if (t && t.toLowerCase() !== 'general' && t.toLowerCase() !== 'without category') {
        presentCats.add(t);
      } else {
        hasUncategorized = true;
      }
    });

    const merged = Array.from(new Set([...defaultThemes, ...Array.from(presentCats)]));
    return ['All', ...merged, ...(hasUncategorized ? ['Without Category'] : [])];
  }, [ayats]);

  // Filter logic
  const filteredAyats = ayats.filter(item => {
    let matchesCategory = true;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Without Category') {
      matchesCategory = !item.theme || item.theme.trim() === '' || item.theme.toLowerCase() === 'general' || item.theme.toLowerCase() === 'without category';
    } else {
      matchesCategory = item.theme === selectedCategory;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      item.surahName.toLowerCase().includes(q) ||
      item.ayatNumber.toString().includes(q) ||
      item.urduTranslation.toLowerCase().includes(q) ||
      item.arabicText.includes(q) ||
      Boolean(item.theme && item.theme.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  const handleCopyText = (ayat: DailyAyatType) => {
    const text = `📖 Surah ${ayat.surahName} (${ayat.ayatNumber})\n\n${ayat.arabicText}\n\n"${ayat.urduTranslation}"\n\n🕊️ Read & Download HD Posters on Nisa Ul Huda:\nhttps://nisa.hudalabs.app/daily-ayat`;
    navigator.clipboard.writeText(text);
    setCopiedId(ayat.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppShare = (ayat: DailyAyatType) => {
    const text = encodeURIComponent(
      `✨ *Daily Quranic Ayat* ✨\n\n📖 *Surah ${ayat.surahName} [${ayat.ayatNumber}]*\n\n${ayat.arabicText}\n\n"${ayat.urduTranslation}"\n\n📥 Download high-resolution poster:\nhttps://nisa.hudalabs.app${ayat.imageUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const getFullImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
  };

  return (
    <div className="overflow-x-hidden font-sans bg-slate-50 selection:bg-[#c29b62]/30 selection:text-slate-900 min-h-screen">
      
      {/* Dynamic Schema.org ImageGallery JSON-LD for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "Nisa Ul Huda Daily Quranic Ayat Posters & Quotes",
            "description": "Daily Quranic verses, calligraphy posters with authentic Urdu and Arabic text. Designed for spiritual reflection and sharing.",
            "url": "https://nisa.hudalabs.app/daily-ayat",
            "image": ayats.map(a => ({
              "@type": "ImageObject",
              "contentUrl": `https://nisa.hudalabs.app${a.imageUrl}`,
              "name": `Surah ${a.surahName} Ayat ${a.ayatNumber}`,
              "caption": `${a.arabicText} - ${a.urduTranslation}`,
              "description": a.altText,
              "keywords": a.tags.join(', ')
            }))
          })
        }}
      />

      {/* ========================================================================= */}
      {/* 1. HERO BANNER (Exact Matching Brand Design) */}
      {/* ========================================================================= */}
      <section className="relative w-full">
        {/* Dark Background Section */}
        <div className="relative pt-32 pb-24 lg:pt-40 lg:pb-28 bg-[#111421] flex flex-col items-center text-center px-4">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}download_hero_bg.webp)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c16]/90 via-[#111421]/80 to-[#070911]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c16]/90 via-transparent to-[#0a0c16]/90" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-16 h-16 rounded-full border border-[#c29b62]/40 flex items-center justify-center mb-8 bg-white/5 backdrop-blur-sm"
            >
              <BookOpen className="w-7 h-7 text-[#c29b62]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-5xl lg:text-7xl font-bold text-white mb-6 font-serif tracking-wide leading-tight drop-shadow-xl italic"
            >
              Daily Quranic <br className="hidden md:block" />
              <span className="text-[#c29b62]">Ayat & Posters</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md"
            >
              Authentic Quranic calligraphy posters with Urdu translations. Download in high-resolution, save for wallpaper, or share daily spiritual reminders.
            </motion.p>
          </div>
        </div>

        {/* Overlapping White Content Card (Search & Category Filters) */}
        <div className="relative z-20 max-w-[1000px] mx-auto px-6 -mt-20 lg:-mt-24 mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-slate-100 flex flex-col items-center text-center space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs text-[#c29b62] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
                <Sparkles size={14} />
                Spiritual Gallery
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 font-serif">
                Explore Quranic Wisdom
              </h2>
              <p className="text-slate-500 text-sm max-w-lg mx-auto">
                Filter by theme or search by Surah name to find daily posters for your home and status.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Surah, Ayat, or topic (e.g. Sabr, Baqarah, Rahman)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#c29b62] focus:bg-white focus:ring-2 focus:ring-[#c29b62]/20 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {dynamicCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#c29b62] text-white shadow-md shadow-[#c29b62]/30 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. GALLERY GRID (Pinterest-Style Masonry Waterfall Layout) */}
      {/* ========================================================================= */}
      <section className="pb-24 px-6 container mx-auto max-w-6xl">
        {filteredAyats.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-[#c29b62]">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-serif text-slate-900 font-bold">No Posters Found</h3>
            <p className="text-slate-500 text-sm">
              Koi poster is search se match nahi hua. Filter reset kar ke dobara check karein.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="bg-[#c29b62] hover:bg-[#b08b53] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {filteredAyats.map((ayat, idx) => (
              <motion.article
                key={ayat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.4) }}
                className="break-inside-avoid mb-6 group bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Poster Graphic Frame - Dynamic Natural Aspect Ratio */}
                <div 
                  onClick={() => setActiveModalAyat(ayat)}
                  className="relative overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img
                    src={getFullImageUrl(ayat.imageUrl)}
                    alt={ayat.altText}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 shadow-md">
                      Surah {ayat.surahName} : {ayat.ayatNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c29b62] text-[10px] font-bold text-white uppercase tracking-wider shadow">
                      HD Poster
                    </span>
                  </div>

                  {/* Hover Quick Action */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <span className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-2 shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                      <Eye size={16} className="text-[#c29b62]" />
                      Full Screen View
                    </span>
                  </div>
                </div>

                {/* Content & Action Area */}
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {ayat.theme && ayat.theme.trim() && ayat.theme.toLowerCase() !== 'general' && ayat.theme.toLowerCase() !== 'without category' ? (
                        <span className="text-[11px] font-bold text-[#c29b62] uppercase tracking-wider">
                          {ayat.theme}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Daily Ayat
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {ayat.date}
                      </span>
                    </div>

                    <p className="text-slate-800 text-sm line-clamp-2 font-serif leading-relaxed text-right pt-1" dir="rtl">
                      {ayat.arabicText}
                    </p>

                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-sans text-right" dir="rtl">
                      "{ayat.urduTranslation}"
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyText(ayat)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      title="Copy Ayat & Translation"
                    >
                      {copiedId === ayat.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedId === ayat.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppShare(ayat)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white text-xs font-semibold transition-all border border-[#25D366]/30"
                      title="Share on WhatsApp"
                    >
                      <Share2 size={14} />
                      <span>WhatsApp</span>
                    </button>

                    <a
                      href={getFullImageUrl(ayat.imageUrl)}
                      download={`NisaUlHuda-${ayat.id}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#c29b62] hover:bg-[#b08b53] text-white transition-colors shadow-md"
                      title="Download High-Res Poster"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. DETAIL MODAL (Matching Luxury Clean Style) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeModalAyat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalAyat(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto border border-slate-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalAyat(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-sm"
              >
                <X size={20} />
              </button>

              <div className="grid md:grid-cols-12 gap-0">
                {/* Left Column: Big Poster View */}
                <div className="md:col-span-6 bg-slate-900/5 p-4 sm:p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 min-h-[300px]">
                  <img
                    src={getFullImageUrl(activeModalAyat.imageUrl)}
                    alt={activeModalAyat.altText}
                    className="max-h-[70vh] w-auto max-w-full rounded-2xl shadow-xl object-contain border border-slate-200"
                  />
                </div>

                {/* Right Column: Text & Actions */}
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#c29b62]/15 text-[#c29b62] text-xs font-bold uppercase tracking-wider">
                        Surah {activeModalAyat.surahName} : {activeModalAyat.ayatNumber}
                      </span>
                      {activeModalAyat.theme && activeModalAyat.theme.trim() && activeModalAyat.theme.toLowerCase() !== 'general' && activeModalAyat.theme.toLowerCase() !== 'without category' && (
                        <span className="text-xs text-slate-500 font-medium">
                          {activeModalAyat.theme}
                        </span>
                      )}
                    </div>

                    {/* Arabic Text */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-right shadow-inner">
                      <p className="text-xl sm:text-2xl font-serif text-slate-900 leading-loose" dir="rtl">
                        {activeModalAyat.arabicText}
                      </p>
                    </div>

                    {/* Urdu Translation */}
                    <div className="space-y-1 text-right" dir="rtl">
                      <h4 className="text-[11px] text-[#c29b62] uppercase tracking-wider font-bold">
                        اردو ترجمہ:
                      </h4>
                      <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-sans">
                        "{activeModalAyat.urduTranslation}"
                      </p>
                    </div>

                    {/* English Translation if available */}
                    {activeModalAyat.englishTranslation && (
                      <div className="space-y-1 pt-1">
                        <h4 className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                          English Translation:
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed italic">
                          "{activeModalAyat.englishTranslation}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions & Sharing */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={getFullImageUrl(activeModalAyat.imageUrl)}
                        download={`NisaUlHuda-${activeModalAyat.id}.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#c29b62] hover:bg-[#b08b53] text-white py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <Download size={16} />
                        Download HD
                      </a>

                      <button
                        onClick={() => handleWhatsAppShare(activeModalAyat)}
                        className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
                      >
                        <Share2 size={16} />
                        Share Status
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyText(activeModalAyat)}
                      className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      {copiedId === activeModalAyat.id ? (
                        <>
                          <Check size={16} className="text-emerald-600" />
                          Ayat & Translation Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy Ayat & Urdu Translation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DailyAyat;
