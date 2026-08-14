import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/xyegjeja", {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        },
      });
      
      if (response.ok) {
        setFormStatus("success");
        e.currentTarget.reset();
        setTimeout(() => setFormStatus("idle"), 5000); // Reset status after 5s
      } else {
        const result = await response.json().catch(() => ({}));
        console.error("Formspree submission error:", result);
        setFormStatus("error");
      }
    } catch (error) {
      console.error("Formspree network error:", error);
      setFormStatus("error");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans relative overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. HERO BANNER (Original Premium Image Background) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-32 pb-24 px-4 bg-slate-900">

        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="/white_mosque_bg.png"
            alt="Contact Us Background"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto text-center max-w-4xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-20 h-20 mb-6 rounded-full bg-white/5 border border-[#e5c158]/30 flex items-center justify-center shadow-[0_0_30px_rgba(229,193,88,0.2)] backdrop-blur-md"
          >
            <MessageSquare size={36} className="text-[#e5c158]" strokeWidth={1.5} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 drop-shadow-xl"
          >
            Get in Touch
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-300 font-light max-w-2xl leading-relaxed"
          >
            Have questions about the app, feedback on our features, or need support? Our team is dedicated to assisting you on your journey.
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-6xl pt-16 pb-20 relative z-10">

        {/* Decorative Lantern Hanging from the banner boundary */}
        <div className="absolute -top-1 right-4 lg:right-16 w-32 md:w-48 lg:w-56 z-40 pointer-events-none">
          <img src="/letern-for-contect.svg" alt="Decorative Lantern" className="w-full h-auto object-contain drop-shadow-5xl" />
        </div>

        {/* Header Section */}
        <div className="text-center mb-16 relative z-30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-px bg-[#e5c158]"></div>
            <span className="text-[#e5c158] font-bold text-sm uppercase tracking-wider">Contact Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#061a14] font-serif mb-2">
            Have a Question?
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-[#e5c158] font-serif">
            Let's Talk!
          </h2>
        </div>

        {/* Form and Info Grid */}
        <div className="grid lg:grid-cols-12 gap-10 items-stretch mt-8">

          {/* Left Column: Form */}
          <div className="lg:col-span-7 relative z-30">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-bold text-slate-800">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5c158]/50 focus:border-[#e5c158] transition-all placeholder-slate-300"
                    placeholder="Ex. John"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-bold text-slate-800">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5c158]/50 focus:border-[#e5c158] transition-all placeholder-slate-300"
                    placeholder="Ex. Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-800">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5c158]/50 focus:border-[#e5c158] transition-all placeholder-slate-300"
                    placeholder="example@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-slate-800">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5c158]/50 focus:border-[#e5c158] transition-all placeholder-slate-300"
                    placeholder="Enter Phone Number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-slate-800">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5c158]/50 focus:border-[#e5c158] transition-all placeholder-slate-300"
                  placeholder="Enter subject here.."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-slate-800">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e5c158]/50 focus:border-[#e5c158] transition-all resize-none placeholder-slate-300"
                  placeholder="Enter here.."
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formStatus === "submitting"}
                  className="bg-[#e5c158] hover:bg-[#d4af37] text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formStatus === "submitting" ? "Sending..." : "Send Message"}
                </button>
                {formStatus === "success" && (
                  <p className="mt-3 text-green-600 font-medium text-sm">Thank you! Your message has been sent successfully.</p>
                )}
                {formStatus === "error" && (
                  <p className="mt-3 text-red-500 font-medium text-sm">Oops! Something went wrong. Please try again.</p>
                )}
              </div>

            </form>
          </div>

          {/* Right Column: Dark Info Card */}
          <div className="lg:col-span-5 mt-10 lg:mt-0 relative z-10">
            <div className="bg-[#061a14] rounded-[2rem] p-8 sm:p-10 text-white h-full shadow-2xl relative overflow-hidden flex flex-col justify-between pt-16 lg:pt-32">
              
              {/* Background Image for Card */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                  src="/card-bg.png" 
                  alt="Card Background Pattern" 
                  className="w-full h-full object-cover opacity-20 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061a14] via-[#061a14]/50 to-transparent" />
              </div>

              <div className="space-y-8 relative z-10">
                {/* Address */}
                <div>
                  <h3 className="text-xl font-bold mb-3 font-serif">Address</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Lahore, Pakistan
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-xl font-bold mb-3 font-serif">Contact</h3>
                  <p className="text-slate-300 text-sm mb-1">
                    Phone : +92 343 4797817
                  </p>
                  <p className="text-slate-300 text-sm mb-1">
                    Email : infohudalabs@gmail.com
                  </p>
                  <p className="text-slate-300 text-sm">
                    Email : huzaifasura970@gmail.com
                  </p>
                </div>

                {/* Open Time */}
                <div>
                  <h3 className="text-xl font-bold mb-3 font-serif">Open Time</h3>
                  <p className="text-slate-300 text-sm mb-1">
                    Monday - Friday : 09:00 - 18:00
                  </p>
                  <p className="text-slate-300 text-sm">
                    Saturday - Sunday : 10:00 - 15:00
                  </p>
                </div>
              </div>

              {/* Stay Connected */}
              <div className="mt-12 relative z-10">
                <h3 className="text-xl font-bold mb-4 font-serif">Stay Connected</h3>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-[#e5c158] text-white flex items-center justify-center hover:bg-[#d4af37] hover:-translate-y-1 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-[#e5c158] text-white flex items-center justify-center hover:bg-[#d4af37] hover:-translate-y-1 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-[#e5c158] text-white flex items-center justify-center hover:bg-[#d4af37] hover:-translate-y-1 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-[#e5c158] text-white flex items-center justify-center hover:bg-[#d4af37] hover:-translate-y-1 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                  </a>
                </div>
              </div>

              {/* Subtle decorative background circle inside card */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#e5c158]/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </div>

        </div>

        {/* Bottom Map Area */}
        <div className="mt-20 w-full rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 bg-slate-100 relative aspect-[21/9] min-h-[400px]">
          <iframe 
            src="https://maps.google.com/maps?q=32.0713417849046,73.6979967156092+(Huda%20Labs)&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
            title="Huda Labs Location"
          ></iframe>
        </div>

      </div>
    </div>
  );
};

export default Contact;

