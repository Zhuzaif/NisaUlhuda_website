import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Sunset, Download } from 'lucide-react';
import { useState } from 'react';
import Footer from './Footer';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'TERMS & CONDITIONS', path: '/terms' },
    { name: 'DOWNLOAD', path: '/download' },
    { name: 'PRIVACY POLICY', path: '/privacy-policy' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans relative selection:bg-[#c59d5f] selection:text-white">
      
      {/* 1. TOP UTILITY BAR (Prayer Ticker like template) */}
      <div className="bg-[#151e2b] text-slate-300 py-2 px-4 border-b border-slate-700/50 relative z-50">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-4 sm:gap-6 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun size={14} className="text-[#c59d5f] w-3 h-3 sm:w-[14px] sm:h-[14px]" />
              SUNRISE: <strong className="text-white">5:44 AM</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sunset size={14} className="text-[#c59d5f] w-3 h-3 sm:w-[14px] sm:h-[14px]" />
              SUNSET: <strong className="text-white">6:45 PM</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
            <span className="text-[#c59d5f] font-semibold">Nisa Ul Huda</span>
            <span className="text-slate-600">|</span>
            <Link to="/download" className="hover:text-[#c59d5f] transition-colors font-medium flex items-center gap-1">
              <Download size={12} />
              Get App
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & NAVIGATION (Overlay) */}
      <header className="absolute top-9 left-0 right-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center border-b border-white/20 pb-4">
            
            {/* Logo matching Azan template style */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#c59d5f] flex items-center justify-center bg-white shadow-xl overflow-hidden">
                <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Nisa Ul Huda Logo" className="w-full h-full object-contain p-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white font-serif tracking-wider">
                  NISA UL HUDA
                </span>
                <span className="text-[9px] text-[#c59d5f] tracking-widest font-sans uppercase">
                  Islamic Companion
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-bold tracking-wider transition-colors hover:text-[#c59d5f] ${
                    isActive(link.path) ? 'text-[#c59d5f]' : 'text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-white hover:text-[#c59d5f]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#151e2b] border-b border-slate-700 px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm font-semibold text-white hover:text-[#c59d5f]"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* New Detailed Footer */}
      <Footer />

    </div>
  );
};

export default Layout;
