import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#061a14] pt-24 pb-8 overflow-hidden border-t-4 border-[#c59d5f]">

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* 1. Brand & About */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-[#c59d5f] flex items-center justify-center bg-white shadow-xl overflow-hidden">
                <img src="/logo.png" alt="Nisa Ul Huda Logo" className="w-full h-full object-contain p-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white font-serif tracking-wider">
                  NISA UL HUDA
                </span>
                <span className="text-[10px] text-[#c59d5f] tracking-widest font-sans uppercase">
                  Islamic Companion
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-sans pr-4">
              Your trusted, 100% ad-free Islamic mobile companion. Built with privacy, peace, and daily worship in mind for the modern Muslim.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-[#0b291e] border border-[#c59d5f]/30 flex items-center justify-center text-[#c59d5f] hover:bg-[#c59d5f] hover:text-[#061a14] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0b291e] border border-[#c59d5f]/30 flex items-center justify-center text-[#c59d5f] hover:bg-[#c59d5f] hover:text-[#061a14] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0b291e] border border-[#c59d5f]/30 flex items-center justify-center text-[#c59d5f] hover:bg-[#c59d5f] hover:text-[#061a14] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0b291e] border border-[#c59d5f]/30 flex items-center justify-center text-[#c59d5f] hover:bg-[#c59d5f] hover:text-[#061a14] hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="lg:pl-8">
            <h4 className="text-white font-serif font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59d5f]"></span>
              Quick Links
            </h4>
            <ul className="space-y-3 font-sans">
              <li><Link to="/" className="text-slate-400 hover:text-[#c59d5f] transition-colors text-sm flex items-center gap-2"><span className="text-[#c59d5f]/50">›</span> Home</Link></li>
              <li><Link to="/download" className="text-slate-400 hover:text-[#c59d5f] transition-colors text-sm flex items-center gap-2"><span className="text-[#c59d5f]/50">›</span> Download</Link></li>
            </ul>
          </div>

          {/* 3. Support & Legal */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59d5f]"></span>
              Support & Legal
            </h4>
            <ul className="space-y-3 font-sans">
              <li><Link to="/contact" className="text-slate-400 hover:text-[#c59d5f] transition-colors text-sm flex items-center gap-2"><span className="text-[#c59d5f]/50">›</span> Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="text-slate-400 hover:text-[#c59d5f] transition-colors text-sm flex items-center gap-2"><span className="text-[#c59d5f]/50">›</span> Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-[#c59d5f] transition-colors text-sm flex items-center gap-2"><span className="text-[#c59d5f]/50">›</span> Terms & Conditions</Link></li>
              <li><Link to="/faq" className="text-slate-400 hover:text-[#c59d5f] transition-colors text-sm flex items-center gap-2"><span className="text-[#c59d5f]/50">›</span> FAQ</Link></li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h4 className="text-white font-serif font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c59d5f]"></span>
              Get in Touch
            </h4>
            <ul className="space-y-5 font-sans">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <Mail size={18} className="text-[#c59d5f] mt-1 shrink-0" />
                <span className="leading-relaxed">infohudalabs@gmail.com<br />huzaifasura970@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <Phone size={18} className="text-[#c59d5f] mt-0.5 shrink-0" />
                <span>+92 343 4797817</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin size={18} className="text-[#c59d5f] mt-0.5 shrink-0" />
                <span className="leading-relaxed">Lahore,Pakistan<br /></span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#c59d5f]/50 to-transparent mb-8"></div>

        {/* Copyright */}
        <div className="text-center flex flex-col items-center justify-center space-y-2">
          <p className="text-slate-400 text-sm font-sans">
            &copy; {new Date().getFullYear()} Nisa Ul Huda. All rights reserved.
          </p>
          <p className="text-[#c59d5f]/80 text-[10px] uppercase tracking-[0.3em] font-bold">
            Designed for Peace, Privacy & Daily Worship
          </p>
        </div>
      </div>

      {/* Custom Mosque Silhouette (minrates.svg) at the bottom background */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none flex justify-center overflow-visible translate-y-[80%] lg:translate-y-[13%]">
        <img
          src="/minrates.svg"
          alt="Minarets Silhouette"
          className="w-full h-auto object-bottom opacity-80"
          style={{ filter: 'drop-shadow(0px -5px 15px rgba(0,0,0,0.4))' }}
        />
      </div>

    </footer>
  );
};

export default Footer;
