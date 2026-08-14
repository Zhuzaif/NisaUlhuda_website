import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollingSVG from '../components/ScrollingSVG';

export const Home: React.FC = () => {
  // 5 Core Features with Custom Generated High-Res Photography inside Arch Cards
  const archFeatures = [
    { title: 'Ask Aalima', subtitle: 'Scholar Guidance', src: '/ask_aalima_photo.png' },
    { title: 'Purity Tracker', subtitle: 'Ghusl & Period Mode', src: '/purity_tracker_photo.png' },
    { title: 'Prayer & Qibla', subtitle: 'Adhan & Compass', src: '/qibla_compass_photo.png' },
    { title: 'Al-Quran', subtitle: 'Translations & Audio', src: '/quran_rehal.png' },
    { title: 'Tasbeeh', subtitle: 'Haptic Dhikr Beads', src: '/tasbeeh_dhikr_photo.png' },
  ];

  return (
    <div className="overflow-x-hidden font-sans text-slate-800 bg-white">

      {/* Scroll-Driven SVG Animation (desktop only) */}
      <ScrollingSVG />

      {/* ========================================================================= */}
      {/* 1. HERO BANNER (Full-Width Dusk Mosque Photography + Calligraphy) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-20 px-4 bg-slate-900">

        {/* Full-width Mosque Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}mosque_hero.png`}
            alt="Majestic Mosque Background"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto max-w-4xl relative z-10 text-center text-white space-y-6">

          <div className="pt-8"></div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl sm:text-5xl text-[#e5c158] font-bold tracking-widest pt-2"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </motion.div>

          <p className="font-serif italic text-lg sm:text-2xl text-slate-300 tracking-wide">
            In the name of “Allah”
          </p>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif italic font-bold leading-tight text-white">
            Nisa Ul Huda: Your Ad-Free Islamic Companion
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-sans leading-relaxed pt-2">
            Ask Aalima Q&A, Purity & Ghusl Tracker, Daily Goals, Quran Reader, and Haptic Tasbeeh—100% ad-free & private.
          </p>

          {/* SVG flower animation starts from this position */}
          <div id="svg-wp-hero" className="pt-8" />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 2: ABOUT NISA & 4-IMAGE PHOTO/SCREENSHOT COLLAGE */}
      {/* ========================================================================= */}
      <section id="about" className="py-24 bg-white relative">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: About Copy */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 space-y-6"
            >
              <div>
                <span className="font-serif italic text-[#c59d5f] text-lg font-bold block mb-1">
                  “Nisa Ul Huda” Islamic Mobile Companion
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                  Designed for Peace, Privacy & Daily Worship
                </h2>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                Nisa Ul Huda is built from the ground up to provide a distraction-free Islamic experience. With zero commercial ads and complete offline support, you can focus entirely on your worship and daily Islamic learning.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                  <CheckCircle2 size={18} className="text-[#c59d5f]" />
                  <span>100% Ad-Free & Zero Personal Data Tracking</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                  <CheckCircle2 size={18} className="text-[#c59d5f]" />
                  <span>Ask Aalima (Private Scholar Q&A) & Purity Tracker</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                  <CheckCircle2 size={18} className="text-[#c59d5f]" />
                  <span>Full Offline Access for Quran, Prayer & Tasbeeh</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-6">
                <Link to="/download" className="btn-solid-gold text-xs uppercase tracking-widest">
                  DOWNLOAD NISA UL HUDA
                </Link>
              </div>
            </motion.div>

            {/* Right Column: 4-Image Photo/Screenshot Collage */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4 items-center mt-12 lg:mt-0"
            >

              {/* Left Column: Real Nisa App Screenshot */}
              <div className="flex justify-center">
                <img
                  id="svg-wp-about-phone"
                  src={`${import.meta.env.BASE_URL}2.png`}
                  alt="Nisa Ul Huda Dashboard"
                  className="w-full max-w-[280px] sm:max-w-[320px] h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Right Column: High-Res AI Photography Assets */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 h-[185px]">
                  <img
                    src={`${import.meta.env.BASE_URL}mosque_arch.png`}
                    alt="Mosque Arch View"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100 h-[185px]">
                  <img
                    src={`${import.meta.env.BASE_URL}quran_rehal.png`}
                    alt="Holy Quran on Stand"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 3: 5 MIHRAB ARCH CARDS WITH CUSTOM AI PHOTOGRAPHY */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 bg-[#f9f8f6] border-y border-slate-200/60 relative">
        <div className="container mx-auto max-w-6xl px-4">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-2"
          >
            <span className="font-serif italic text-[#c59d5f] text-lg font-bold">
              Photographic Feature Highlights
            </span>
            <h2 id="svg-wp-modules" className="text-3xl font-serif font-bold text-slate-900">
              5 Core Nisa Ul Huda Modules
            </h2>
            <p className="text-slate-500 text-xs">
              Custom photographic imagery showcasing Nisa Ul Huda's key features.
            </p>
          </motion.div>

          {/* 5 Arch Cards Grid with Custom AI Photography inside */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {archFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="arch-card p-4 flex flex-col items-center text-center space-y-3 group"
              >
                {/* Arch-cropped photograph */}
                <div className="w-full aspect-[9/14] rounded-t-[3rem] rounded-b-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm mt-1">
                  <img
                    src={feat.src}
                    alt={feat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">{feat.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{feat.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURE DEEP-DIVES (AI PHOTOGRAPHY + APP SCREENSHOTS SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      <div className="flex flex-col">

        {/* Feature 1: Al-Quran */}
        <section className="relative w-full flex items-center py-8 text-white bg-slate-900 overflow-hidden shadow-xl">
          <img
            src={`${import.meta.env.BASE_URL}quran_rehal.png`}
            alt="Al-Quran Background"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="container mx-auto max-w-6xl px-4 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 space-y-4"
              >
                <span className="font-serif italic text-[#e5c158] text-lg font-bold block">
                  Complete Holy Quran
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                  Al-Quran Reader & Audio
                </h2>
                <p className="text-slate-200 text-sm leading-relaxed font-sans">
                  Read the Holy Quran with translations, transliteration, and listen to beautiful recitations from world-renowned reciters. Easily bookmark your progress.
                </p>
                <div className="space-y-2 pt-2 text-sm text-slate-200 font-semibold">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#e5c158]" />
                    <span>Multiple translations and transliterations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#e5c158]" />
                    <span>High-quality audio recitations</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-5 flex justify-center mt-8 lg:mt-0"
              >
                <img
                  id="svg-wp-quran-phone"
                  src={`${import.meta.env.BASE_URL}7.png`}
                  alt="Al-Quran Screen"
                  className="w-full max-w-[250px] h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature 2: Women's Purity & Ghusl Tracker */}
        <section className="py-12 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-6 lg:order-2 space-y-5"
              >
                <span className="font-serif italic text-[#c59d5f] text-lg font-bold block">
                  Dedicated Women's Module
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                  Purity & Ghusl Tracker
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed font-sans">
                  Track Haiz, Nifas, Istihaza, and Ghusl. Enable "Period Mode" to automatically pause prayer notifications and receive step-by-step purification guides.
                </p>
                <div className="space-y-2 pt-2 text-sm text-slate-700 font-semibold">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#c59d5f]" />
                    <span>Automatic prayer exemption handling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#c59d5f]" />
                    <span>Detailed step-by-step Ghusl instructions</span>
                  </div>
                </div>
              </motion.div>

              {/* Side-by-Side: Custom AI Photograph + Real Screenshot */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-6 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4 items-center mt-8 lg:mt-0"
              >
                <div className="flex justify-center order-2 sm:order-1">
                  <img
                    id="svg-wp-purity-phone"
                    src={`${import.meta.env.BASE_URL}6.png`}
                    alt="Purity Tracker Screen"
                    className="w-full max-w-[250px] h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-[360px] order-1 sm:order-2">
                  <img
                    src={`${import.meta.env.BASE_URL}purity_tracker_photo.png`}
                    alt="Purity Water & Flowers"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature 3: Prayer Times & Qibla Compass */}
        <section className="relative w-full flex items-center py-8 text-white bg-slate-900 overflow-hidden shadow-xl">
          <img
            src={`${import.meta.env.BASE_URL}qibla_compass_photo.png`}
            alt="Qibla Compass Photo"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="container mx-auto max-w-6xl px-4 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 space-y-4"
              >
                <span className="font-serif italic text-[#e5c158] text-lg font-bold block">
                  Precise Location Calculation
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                  Prayer Times & Qibla Compass
                </h2>
                <p className="text-slate-200 text-sm leading-relaxed font-sans">
                  Automatic calculations for Fajr, Dhuhr, Asr, Maghrib, and Isha with Adhan alerts and an offline Qibla direction finder pointing to Kaaba.
                </p>
                <div className="space-y-2 pt-2 text-sm text-slate-200 font-semibold">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#e5c158]" />
                    <span>Works completely offline without Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#e5c158]" />
                    <span>Customizable calculation methods (ISNA, MWL)</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-5 flex justify-center mt-8 lg:mt-0"
              >
                <img
                  id="svg-wp-prayer-phone"
                  src={`${import.meta.env.BASE_URL}3.png`}
                  alt="Prayer Schedule Screen"
                  className="w-full max-w-[250px] h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature 4: Digital Tasbeeh & Dhikr */}
        <section className="py-12 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-6 lg:order-2 space-y-5"
              >
                <span className="font-serif italic text-[#c59d5f] text-lg font-bold block">
                  Daily Remembrance
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                  Digital Tasbeeh & Azkar
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed font-sans">
                  Haptic vibration counter allowing you to count Azkar hands-free. Includes authentic supplications from Hisn al-Muslim.
                </p>
                <div className="space-y-2 pt-2 text-sm text-slate-700 font-semibold">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#c59d5f]" />
                    <span>Vibration feedback for counting without looking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#c59d5f]" />
                    <span>Preset targets (33, 100, custom)</span>
                  </div>
                </div>
              </motion.div>

              {/* Side-by-Side: Custom AI Photograph + Real Screenshot */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-6 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4 items-center mt-8 lg:mt-0"
              >
                <div className="flex justify-center order-2 sm:order-1">
                  <img
                    id="svg-wp-tasbeeh-phone"
                    src={`${import.meta.env.BASE_URL}9.png`}
                    alt="Tasbeeh Counter Screen"
                    className="w-full max-w-[250px] h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-[360px] order-1 sm:order-2">
                  <img
                    src={`${import.meta.env.BASE_URL}tasbeeh_dhikr_photo.png`}
                    alt="Tasbeeh Beads Photo"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature 5: Authentic Fiqh Library Banner */}
        <section className="relative w-full flex items-center py-8 text-white bg-slate-900 overflow-hidden shadow-2xl">
          <img
            src={`${import.meta.env.BASE_URL}fiqh_library_photo.png`}
            alt="Islamic Library Books"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="container mx-auto max-w-6xl px-4 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-7 space-y-4"
              >
                <span className="font-serif italic text-[#e5c158] text-lg font-bold block">
                  Authentic Islamic Knowledge
                </span>
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                  Searchable Fiqh Topics Library
                </h3>
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  Access verified rulings covering daily worship, purification, family life, fasts, and zakat—sourced from classical Islamic jurisprudence.
                </p>
                <Link to="/download" className="btn-solid-gold uppercase text-xs tracking-widest inline-flex items-center gap-2 pt-2">
                  EXPLORE FIQH LIBRARY
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-5 flex justify-center mt-8 lg:mt-0"
              >
                <img id="svg-wp-fiqh-phone" src={`${import.meta.env.BASE_URL}8.png`} alt="Fiqh Library Screen" className="w-full max-w-[250px] h-auto drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500" />
              </motion.div>
            </div>
          </div>
        </section>

      </div>


      {/* ========================================================================= */}
      {/* 6. DOWNLOAD BANNER (Full Width Overlapping Layout) */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-white shadow-2xl border-y border-slate-200 mt-32 mb-20">

        {/* Banner Background Image (White Mosque) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={`${import.meta.env.BASE_URL}white_mosque_bg.png`}
            alt="White Mosque Banner Background"
            className="w-full h-full object-cover opacity-30 mix-blend-multiply"
          />
          {/* Vibrant bright gradient overlay that keeps text readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        </div>

        <div className="container mx-auto max-w-6xl px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center min-h-[300px]">

            {/* Left Column: Text & Buttons */}
            <div className="w-full md:w-7/12 py-12 md:py-16 space-y-6 text-center md:text-left z-20">
              <div className="w-14 h-14 rounded-full border-[2px] border-[#c59d5f] flex items-center justify-center bg-white overflow-hidden shadow-sm mx-auto md:mx-0">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Nisa Logo" className="w-full h-full object-contain p-1" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold italic text-slate-900 leading-tight">
                Download Nisa Ul Huda Free
              </h2>

              <p className="text-slate-600 text-sm max-w-md mx-auto md:mx-0 leading-relaxed font-sans">
                Experience a distraction-free Islamic journey. 100% Ad-Free • Zero Data Tracking • Works Completely Offline.
              </p>

              <div className="pt-2 flex justify-center md:justify-start">
                <Link to="/download" className="bg-[#e5c158] hover:bg-[#d4b047] text-slate-900 font-bold py-3 px-6 rounded-lg uppercase text-xs tracking-widest flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                  <Smartphone size={16} />
                  GET STARTED NOW
                </Link>
              </div>
            </div>

            {/* Right Column: Transparent AI Generated Woman holding App */}
            {/* Using absolute positioning so she beautifully overflows out of the top of the banner! */}
            <div className="w-full md:w-5/12 h-72 sm:h-80 md:h-full relative mt-12 md:mt-0 flex justify-center md:block">
              <img
                id="svg-wp-woman"
                src={`${import.meta.env.BASE_URL}woman_cutout_banner.png`}
                alt="Muslim woman holding Nisa Ul Huda app"
                className="relative md:absolute bottom-0 md:right-0 w-auto h-full md:h-[520px] max-w-none object-contain object-bottom drop-shadow-2xl z-30 md:-mb-[205px]"
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
