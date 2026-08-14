import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Share2, X } from 'lucide-react';

// ─── Smooth easing ─────────────────────────────────────────────────────
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const ScrollingSVG: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const tickingRef = useRef(false);
  
  const [isClickable, setIsClickable] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isClickableRef = useRef(false);

  useEffect(() => {
    const animate = () => {
      tickingRef.current = false;
      const container = containerRef.current;
      const img = imgRef.current;
      if (!container || !img) return;

      const heroEl = document.getElementById('svg-wp-hero');
      const womanEl = document.getElementById('svg-wp-woman');
      if (!heroEl || !womanEl) return;

      const scrollY = window.scrollY;
      const vpH = window.innerHeight;
      const vpW = window.innerWidth;

      // Get absolute page positions
      const heroRect = heroEl.getBoundingClientRect();
      const heroPageY = heroRect.top + scrollY + heroRect.height / 2;
      const heroCenterX = heroRect.left + heroRect.width / 2;

      const womanRect = womanEl.getBoundingClientRect();
      const womanPageY = womanRect.top + scrollY;
      const womanFaceX = womanRect.left + womanRect.width * 0.35;
      const womanFaceY = womanPageY + womanRect.height * 0.1;

      // ─── Define 3 phases ─────────────────────────────────────────
      const phase1Start = heroPageY;
      const phase1End = heroPageY + vpH * 1.2;
      const phase2End = womanPageY - vpH * 1.5;
      const phase3End = womanPageY - vpH * 0.2;

      const sideX = vpW - 80;
      const sideY = vpH * 0.35;
      const vpTrigger = scrollY + vpH * 0.45;

      let x: number, y: number, scale: number, rotation: number;
      let currentPhaseClickable = false;

      if (vpTrigger <= phase1Start) {
        x = heroCenterX;
        y = heroPageY - scrollY;
        scale = 1;
        rotation = 0;
      } else if (vpTrigger <= phase1End) {
        const t = (vpTrigger - phase1Start) / (phase1End - phase1Start);
        const eased = easeInOutCubic(t);
        x = heroCenterX + (sideX - heroCenterX) * eased;
        y = (heroPageY - scrollY) + (sideY - (heroPageY - scrollY)) * eased;
        scale = 1 + 0.15 * Math.sin(t * Math.PI);
        rotation = t * 180;
      } else if (vpTrigger <= phase2End) {
        x = sideX;
        y = sideY + Math.sin(scrollY * 0.005) * 8;
        scale = 1;
        rotation = Math.sin(scrollY * 0.003) * 10;
        currentPhaseClickable = true; // Clickable only while on the side
      } else if (vpTrigger <= phase3End) {
        const t = (vpTrigger - phase2End) / (phase3End - phase2End);
        const eased = easeInOutCubic(t);
        const targetX = womanFaceX;
        const targetY = womanFaceY - scrollY;
        x = sideX + (targetX - sideX) * eased;
        y = sideY + (targetY - sideY) * eased;
        scale = 1 + 0.2 * Math.sin(t * Math.PI);
        rotation = t * 360;
      } else {
        x = womanFaceX;
        y = womanFaceY - scrollY;
        scale = 1.1;
        rotation = Math.sin(scrollY * 0.004) * 5;
      }

      // Update clickability state if changed
      if (currentPhaseClickable !== isClickableRef.current) {
        isClickableRef.current = currentPhaseClickable;
        setIsClickable(currentPhaseClickable);
        if (!currentPhaseClickable) setIsOpen(false); // Auto close if it moves away
      }

      // We only translate the container, so the popover doesn't rotate/scale
      container.style.transform = `translate3d(${x - 25}px, ${y - 25}px, 0)`;
      container.style.opacity = '1';
      
      // We apply rotation and scale to the image itself
      img.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(animate);
        tickingRef.current = true;
      }
    };

    const timer = setTimeout(animate, 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', animate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', animate);
    };
  }, []);

  const copyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + "/download");
    alert("App download link copied to clipboard!");
  };

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 z-[9999] opacity-0 hidden md:block will-change-transform ${isClickable ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{ width: 50, height: 50, transition: 'opacity 0.8s ease' }}
    >
      {/* SVG Image Wrapper */}
      <div 
        className={`w-full h-full relative ${isClickable ? 'cursor-pointer group' : ''}`}
        onClick={() => isClickable && setIsOpen(!isOpen)}
      >
        <img
          ref={imgRef}
          src={`${import.meta.env.BASE_URL}A Theme For Every Mood.svg`}
          alt=""
          className={`w-full h-full will-change-transform ${isClickable ? 'group-hover:scale-110 transition-transform' : ''}`}
          draggable={false}
          style={{
            filter: 'drop-shadow(0 0 12px rgba(218, 60, 120, 0.5)) drop-shadow(0 0 5px rgba(218, 60, 120, 0.35))',
          }}
        />
        
        {/* Pulsing indicator when clickable but closed */}
        {isClickable && !isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-pink-400/40 -z-10 scale-150"></span>
        )}
      </div>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: -280, scale: 1 }} // position it to the left of the icon
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-1/2 -translate-y-1/2 w-[260px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-pink-100 flex flex-col gap-4 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-serif font-bold text-slate-800 text-lg">Explore More</h4>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-slate-400 hover:text-pink-500 transition-colors p-1 rounded-md hover:bg-pink-50">
                <X size={16} />
              </button>
            </div>

            {/* Noor Ul Huda Link */}
            <a href="https://noorulhuda.com" target="_blank" rel="noreferrer" className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all border border-pink-100 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-pink-500">
                  <Globe className="group-hover:rotate-12 transition-transform duration-500" size={16} />
                </div>
                <span className="font-semibold text-sm text-slate-800">Noor Ul Huda Web</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></div>
            </a>
            
            {/* Social Media Links */}
            <div className="flex items-center justify-between px-1 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect</span>
              <div className="flex gap-2">
                <a href="#" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-pink-50 border border-slate-100 hover:border-pink-200 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-pink-50 border border-slate-100 hover:border-pink-200 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-pink-50 border border-slate-100 hover:border-pink-200 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
              </div>
            </div>

            {/* Share App Link Button */}
            <button 
              onClick={copyShareLink} 
              className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Share2 size={16} className="text-pink-400" />
              Share App Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrollingSVG;
