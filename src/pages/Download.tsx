import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, QrCode, Star, Download as DownloadIcon } from 'lucide-react';

const AmazonIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M15.93 17.09c-2.83 2.08-6.94 3.19-10.51 3.19-4.99 0-9.49-1.93-12.89-5.15-.27-.25-.03-.6.29-.41 3.67 2.13 8.16 3.41 12.83 3.41 3.16 0 6.69-.69 9.87-2.12.48-.22.89.34.41.68zm1.3-1.46c-.36-.46-2.38-.22-3.3-.11-.28.03-.32-.2-.07-.37 1.62-1.12 4.28-.8 4.59-.41.32.41-.09 3.11-1.63 4.35-.24.19-.46.09-.35-.16.36-.82 1.12-2.84.76-3.3zM13.25 3.5c-3.13 0-5.78 2.02-5.78 5.64 0 3.2 2.08 5.17 4.96 5.17 1.95 0 3.42-.92 4.23-2.19v1.94c0 .17.1.32.27.32h2.24c.17 0 .27-.15.27-.32V8.94c0-3.66-2.52-5.44-6.19-5.44zm.44 8.78c-1.69 0-3.03-1.25-3.03-3.35 0-2.07 1.34-3.32 3.03-3.32 1.67 0 2.95 1.25 2.95 3.32 0 2.1-1.28 3.35-2.95 3.35z"/>
  </svg>
);

const UptodownIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 3.1l6.5 3.6v7.6L12 19.9 5.5 16.3V8.7L12 5.1zm-1 3.9v5H8l4 4 4-4h-3V9h-2z"/>
  </svg>
);

const HuaweiIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
    <path d="M12 14v4" />
    <path d="m10 16 2-2 2 2" />
  </svg>
);

const PlayStoreIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 512 512" fill="currentColor" className={className} {...props}>
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
  </svg>
);

const features = [
  {
    image: `${import.meta.env.BASE_URL}feature_prayer_times.webp`,
    title: 'Accurate Prayer Times',
    description: 'Get precise prayer timings based on your current location with multiple convention settings available.'
  },
  {
    image: `${import.meta.env.BASE_URL}feature_quran.webp`,
    title: 'The Holy Quran',
    description: 'Read the Quran in Arabic with beautiful fonts, alongside translations in 40+ languages and audio recitations.'
  },
  {
    image: `${import.meta.env.BASE_URL}feature_qibla.webp`,
    title: 'Qibla Finder',
    description: 'An interactive AR compass to show you the exact direction to the Kaaba from anywhere in the world.'
  },
  {
    image: `${import.meta.env.BASE_URL}feature_adhkar.webp`,
    title: 'Daily Adhkar & Duas',
    description: 'A comprehensive collection of daily supplications, Hisnul Muslim, and morning/evening adhkar.'
  },
  {
    image: `${import.meta.env.BASE_URL}feature_calendar.webp`,
    title: 'Hijri Calendar',
    description: 'Track Islamic dates, upcoming events like Ramadan and Eid, and convert between Gregorian and Hijri dates.'
  },
  {
    image: `${import.meta.env.BASE_URL}feature_adhan.webp`,
    title: 'Adhan Notifications',
    description: 'Beautiful visual and audio notifications with voices of famous muezzins for the call to prayer.'
  }
];

const reviews = [
  {
    name: 'Ahmad M.',
    role: 'London, UK',
    content: 'The most beautiful and ad-free Islamic app I have ever used. The prayer times are extremely accurate and the UI is incredibly soothing.',
    rating: 5
  },
  {
    name: 'Fatima Z.',
    role: 'Lahore, Pakistan',
    content: 'Boht hi zabardast app hai! No annoying ads during prayer times and the interface is very clean. Highly recommended for everyone.',
    rating: 5
  },
  {
    name: 'Omar Al-Saeed',
    role: 'Riyadh, Saudi Arabia',
    content: 'Mashallah, the accuracy of the prayer times and the beauty of the Quran font is unmatched. May Allah reward the developers.',
    rating: 5
  },
  {
    name: 'Sarah K.',
    role: 'Dubai, UAE',
    content: 'I love the Qibla AR feature and the elegant typography in the Quran section. It makes reading daily a joy.',
    rating: 5
  },
  {
    name: 'Tariq H.',
    role: 'New York, USA',
    content: 'Finally, an app that doesn\'t overwhelm you with clutter. Clean, minimal, and has everything a Muslim needs for daily worship.',
    rating: 5
  },
  {
    name: 'Zainab R.',
    role: 'Karachi, Pakistan',
    content: 'I have tried many apps but this one stands out. The Hisnul Muslim section is so well organized and easy to read. Love it!',
    rating: 5
  },
  {
    name: 'Abdullah Q.',
    role: 'Jeddah, Saudi Arabia',
    content: 'Very reliable and simple to use. The Adhan notifications are soothing and not overly loud or abrupt like other apps.',
    rating: 4
  },
  {
    name: 'Bilal J.',
    role: 'Islamabad, Pakistan',
    content: 'Alhamdulillah, such a peaceful experience. The Hijri calendar is very accurate. Will definitely keep this on my phone.',
    rating: 5
  },
  {
    name: 'Ayesha N.',
    role: 'Manchester, UK',
    content: 'The purity tracking feature is exactly what I needed. It handles things with such privacy and elegance. Thank you!',
    rating: 5
  },
  {
    name: 'Hassan F.',
    role: 'Dammam, Saudi Arabia',
    content: 'Best Islamic companion app. The dark mode is beautiful and easy on the eyes when reading Quran at night or during Tahajjud.',
    rating: 5
  },
  {
    name: 'Nadia M.',
    role: 'Toronto, Canada',
    content: 'I was looking for a completely ad-free experience, and Nisa Ul Huda delivered perfectly. 10/10.',
    rating: 5
  },
  {
    name: 'Usman T.',
    role: 'Rawalpindi, Pakistan',
    content: 'App ki speed boht achi hai aur Qibla finder bilkul theek kaam karta hai. Best app for daily use without distractions.',
    rating: 5
  },
  {
    name: 'Yusuf W.',
    role: 'Istanbul, Turkey',
    content: 'A truly beautiful interface. It feels like a premium app but it is completely free of ads. May Allah bless this project.',
    rating: 5
  },
  {
    name: 'Khadija S.',
    role: 'Mecca, Saudi Arabia',
    content: 'Using this app every day for my daily adhkar. It is so easy to navigate and the Arabic text is very clear and legible.',
    rating: 5
  },
  {
    name: 'Hamza K.',
    role: 'Sydney, Australia',
    content: 'Fantastic app! The widget for prayer times is super helpful and beautifully designed on my home screen.',
    rating: 4
  },
  {
    name: 'Mariam A.',
    role: 'Cairo, Egypt',
    content: 'I am so impressed with the quality of the recitations included. It brings so much peace to my daily commute.',
    rating: 5
  },
  {
    name: 'Salman R.',
    role: 'Multan, Pakistan',
    content: 'Bhai, kya kamal ki app banayi hai. Har cheez perfectly kaam kar rahi hai. JazakAllah khair!',
    rating: 5
  },
  {
    name: 'Lina H.',
    role: 'Kuala Lumpur, Malaysia',
    content: 'The best part is that it respects your privacy. No unnecessary tracking, just pure Islamic knowledge and tools.',
    rating: 5
  }
];

const Download: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-x-hidden font-sans bg-slate-50 selection:bg-[#c29b62]/30 selection:text-slate-900">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full">
        {/* Dark Background Section */}
        <div className="relative pt-32 pb-24 lg:pt-40 lg:pb-28 bg-[#111421] flex flex-col items-center text-center px-4">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}download_hero_bg.webp)` }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c16]/90 via-[#111421]/80 to-[#070911]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c16]/90 via-transparent to-[#0a0c16]/90"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-16 h-16 rounded-full border border-[#c29b62]/40 flex items-center justify-center mb-8"
            >
              <DownloadIcon className="w-6 h-6 text-[#c29b62]" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-5xl lg:text-7xl font-bold text-white mb-6 font-serif tracking-wide leading-tight drop-shadow-xl italic"
            >
              Carry Tranquility <br className="hidden md:block" />
              <span className="text-[#c29b62]">In Your Pocket</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md"
            >
              Experience the full potential of your spiritual journey with our meticulously designed, ad-free mobile companion.
            </motion.p>
          </div>
        </div>

        {/* Overlapping White Content Card (Store Links) */}
        <div className="relative z-20 max-w-[1000px] mx-auto px-6 -mt-20 lg:-mt-24 mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-10 lg:p-16 border border-slate-100 flex flex-col items-center text-center">
            
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 font-serif">
               Choose Your Platform
            </h2>
            <p className="text-slate-500 mb-10 max-w-lg mx-auto">
               Nisa Ul Huda is available across major Android app stores. Select your preferred platform below.
            </p>

            {/* Primary Featured Stores: Google Play & Amazon Appstore */}
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center mb-10">
              <a 
                href="https://play.google.com/store/apps/details?id=com.nisaulhuda.hudalabs" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-4 bg-[#c29b62] hover:bg-[#b08b53] text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto min-w-[250px]"
              >
                <PlayStoreIcon className="w-8 h-8" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs text-white/90 uppercase tracking-wider">Get it on</span>
                  <span className="text-xl font-semibold leading-none mt-1">Google Play</span>
                </div>
              </a>

              <a 
                href="https://www.amazon.com/gp/product/B0HHXF3P7C" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-4 bg-[#111421] hover:bg-black text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto min-w-[250px]"
              >
                <AmazonIcon className="w-8 h-8 text-[#ff9900]" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs text-slate-300 uppercase tracking-wider">Available at</span>
                  <span className="text-xl font-semibold leading-none mt-1">Amazon Appstore</span>
                </div>
              </a>
            </div>

            {/* Other Stores & Mirrors (Uptodown & Huawei AppGallery) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mx-auto border-t border-slate-100 pt-8">
              {/* Uptodown Store */}
              <a 
                href="https://nisa-ul-huda-islam-for-women.en.uptodown.com/android" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3.5 px-4 rounded-xl transition-colors border border-slate-200 group"
              >
                <UptodownIcon className="w-6 h-6 text-[#002f6c] group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Download APK on</span>
                  <span className="text-sm font-bold leading-none text-slate-800">Uptodown</span>
                </div>
              </a>

              {/* Huawei AppGallery (Under Review) */}
              <div 
                className="flex items-center justify-center gap-3 bg-slate-50/80 text-slate-600 py-3.5 px-4 rounded-xl border border-dashed border-slate-300 relative cursor-default"
                title="Under Review by Huawei AppGallery — Link coming very soon!"
              >
                <HuaweiIcon className="w-6 h-6 text-[#cf0a2c]" />
                <div className="flex flex-col items-start text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Explore on</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">In Review</span>
                  </div>
                  <span className="text-sm font-bold leading-none text-slate-800">Huawei AppGallery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. EXTRA DATA: SYSTEM REQ & QR CODE (From existing design) */}
      {/* ========================================================================= */}
      <section className="relative max-w-[1000px] mx-auto px-6 mb-24 z-10">
        <div className="grid md:grid-cols-2 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                <Smartphone className="text-[#c29b62]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">System Requirements</h3>
            </div>
            <ul className="space-y-4 text-slate-600 font-medium text-sm">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#c29b62]"></span> 
                Android 8.0 and up (Phones & Tablets)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#c29b62]"></span> 
                Optimized for Android 14 & 15
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#c29b62]"></span> 
                Minimum 150MB free storage recommended
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="w-24 h-24 flex-shrink-0 relative group">
              <div className="w-full h-full bg-white border-2 border-[#c29b62]/30 p-1.5 rounded-xl shadow-sm">
                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.nisaulhuda.hudalabs&color=0f172a')] bg-cover bg-center rounded-lg" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <QrCode className="text-[#c29b62]" size={20} />
                <h3 className="text-xl font-bold text-slate-900 font-serif">Instant Download</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                Open your camera and scan the QR code to instantly download the Nisa Ul Huda app directly to your mobile device.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE FEATURES (From template) */}
      {/* ========================================================================= */}
      <section id="features" className="pb-24 bg-slate-50 pt-10">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-[#c29b62] font-semibold tracking-widest uppercase text-xs mb-3">Core Features</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-serif">Everything you need for your faith.</h3>
            <p className="text-lg text-slate-600">
              Nisa Ul Huda is designed to be an all-in-one companion for your Islamic journey, featuring a clean, ad-free interface that respects your focus.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 overflow-hidden bg-slate-50">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 font-serif">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TESTIMONIALS (From template) */}
      {/* ========================================================================= */}
      <section id="reviews" className="py-24 bg-[#111421] relative overflow-hidden">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee {
            animation: marquee 50s linear infinite;
          }
          .animate-marquee-reverse {
            animation: marquee-reverse 50s linear infinite;
          }
          .animate-marquee:hover, .animate-marquee-reverse:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        {/* Decorative Islamic Geometric Pattern Hint */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="islamic" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="white" strokeWidth="1"/>
                 <path d="M20 10L30 20L20 30L10 20Z" fill="none" stroke="white" strokeWidth="0.5"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#islamic)" />
          </svg>
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 mb-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-[#c29b62] font-semibold tracking-widest uppercase text-xs mb-3">Community Love</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">Trusted by the Ummah</h3>
          </div>
        </div>
          
        <div className="relative flex flex-col gap-6 overflow-hidden w-full">
          
          {/* Row 1 (Moves Left) */}
          <div className="flex gap-6 animate-marquee w-max">
            {[...reviews.slice(0, 9), ...reviews.slice(0, 9)].map((review, idx) => (
              <div 
                key={`r1-${idx}`}
                className="w-[350px] shrink-0 bg-white/5 backdrop-blur border border-white/10 p-8 rounded-3xl flex flex-col hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c29b62] text-[#c29b62]" />
                  ))}
                </div>
                <p className="text-white/80 text-[15px] leading-relaxed mb-8 flex-grow">"{review.content}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-white/10 flex items-center justify-center text-[#c29b62] font-bold text-lg font-serif">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-white font-medium text-sm">{review.name}</h5>
                    <p className="text-white/50 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 (Moves Right) */}
          <div className="flex gap-6 animate-marquee-reverse w-max">
            {[...reviews.slice(9, 18), ...reviews.slice(9, 18)].map((review, idx) => (
              <div 
                key={`r2-${idx}`}
                className="w-[350px] shrink-0 bg-white/5 backdrop-blur border border-white/10 p-8 rounded-3xl flex flex-col hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c29b62] text-[#c29b62]" />
                  ))}
                </div>
                <p className="text-white/80 text-[15px] leading-relaxed mb-8 flex-grow">"{review.content}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-white/10 flex items-center justify-center text-[#c29b62] font-bold text-lg font-serif">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-white font-medium text-sm">{review.name}</h5>
                    <p className="text-white/50 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>

    </div>
  );
};

export default Download;
