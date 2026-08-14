import React, { useEffect } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="overflow-x-hidden font-sans text-gray-800 bg-gray-100">
      
      {/* Hero Section with Background */}
      <section className="relative bg-[#111827] min-h-[70vh] flex flex-col">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}image for privacy and terms.avif`} 
            alt="Mosque Interior" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/95"></div>
        </div>

        {/* Hero Content (Privacy Policy) */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pb-20 pt-40">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-14 h-14 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <Shield size={24} strokeWidth={2} />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-serif text-5xl md:text-6xl text-white font-bold mb-2 drop-shadow-lg"
          >
            Privacy Policy
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-gray-300 max-w-2xl text-lg md:text-xl font-light"
          >
            This Privacy Policy describes how Nisa Ul Huda handles your information. We respect your privacy and are committed to protecting it.
          </motion.p>
        </div>
      </section>

      {/* Overlapping White Content Card */}
      <main className="relative z-20 max-w-5xl mx-auto -mt-24 px-6 lg:px-0 pb-24">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 md:p-16 min-h-[500px]">
            
          <div className="flex justify-between items-center border-b border-gray-100 pb-8 mb-8">
            <h3 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Effective Date: August 2026</h3>
            <ShieldCheck className="text-gray-400 w-6 h-6" />
          </div>

          {/* Content Area */}
          <div className="prose prose-lg max-w-none text-gray-600">
            
            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">1.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Information We Do Not Collect</h4>
              </div>
              <p className="leading-relaxed">
                We believe in data minimization and your privacy. Therefore, <strong className="text-gray-800 font-semibold">we do not collect, store, or transmit any Personally Identifiable Information (PII)</strong> such as your name, email address, phone number, or account details. You are not required to create an account to use the App.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">2.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Data Stored Locally on Your Device</h4>
              </div>
              <p className="leading-relaxed">
                Any personal data you enter into the App, such as daily tracking, purity logs (Al-Nisa tracking), or personal preferences, is <strong className="text-gray-800 font-semibold">stored completely locally on your device</strong>. We do not have access to this data, and it is not uploaded to any external servers.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">3.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Location Data</h4>
              </div>
              <p className="leading-relaxed">
                To provide accurate Islamic Prayer Times and Qibla direction, the App requires access to your device's location. This location data is processed locally on your device to calculate prayer times. We do not track, store, or send your location data to our servers.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">4.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Usage Data & Third-Party Services</h4>
              </div>
              <p className="leading-relaxed">
                We may use anonymous third-party analytics (such as Google Analytics or Firebase Crashlytics) to understand how the App is used and to fix bugs. These services may collect anonymous usage data (like device model, OS version, and crash reports) but this data cannot be used to identify you personally.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">5.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Children's Privacy</h4>
              </div>
              <p className="leading-relaxed">
                Because our App does not collect personal data, it is safe for users of all ages. We do not knowingly collect personally identifiable information from anyone, including children under the age of 13.
              </p>
            </div>
            
            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">6.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Changes to this Privacy Policy</h4>
              </div>
              <p className="leading-relaxed">
                We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">7.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Contact Us</h4>
              </div>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, you can contact us at: <a href="mailto:huzaifasura970@gmail.com" className="font-medium text-[#D4AF37] hover:text-[#b3922d] transition-colors">huzaifasura970@gmail.com</a>
              </p>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default PrivacyPolicy;
