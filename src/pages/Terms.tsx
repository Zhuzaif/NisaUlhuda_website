import React, { useEffect } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Terms: React.FC = () => {
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
            src="/image for privacy and terms.avif" 
            alt="Mosque Interior" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/95"></div>
        </div>

        {/* Hero Content (Terms & Conditions) */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pb-20 pt-40">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-14 h-14 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <ShieldCheck size={24} strokeWidth={2} />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-serif text-5xl md:text-6xl text-white font-bold mb-2 drop-shadow-lg"
          >
            Terms & Conditions
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-gray-300 max-w-2xl text-lg md:text-xl font-light"
          >
            Please read these terms and conditions carefully before using the Nisa Ul Huda application.
          </motion.p>
        </div>
      </section>

      {/* Overlapping White Content Card */}
      <main className="relative z-20 max-w-5xl mx-auto -mt-24 px-6 lg:px-0 pb-24">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 md:p-16 min-h-[500px]">
            
          <div className="flex justify-between items-center border-b border-gray-100 pb-8 mb-8">
            <h3 className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Effective Date: August 2026</h3>
            <FileText className="text-gray-400 w-6 h-6" />
          </div>

          {/* Content Area */}
          <div className="prose prose-lg max-w-none text-gray-600">
            
            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">1.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Acceptance of Terms</h4>
              </div>
              <p className="leading-relaxed">
                By downloading, accessing, and using this App, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the App.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">2.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Use of the App</h4>
              </div>
              <p className="leading-relaxed">
                The Nisa Ul Huda App provides Islamic lifestyle features including but not limited to prayer times, Quran reading, daily tracking, and community features. The content provided is for general information and personal use only. It is subject to change without notice.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">3.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Local Data Storage</h4>
              </div>
              <p className="leading-relaxed">
                Your personal tracking data (such as purity logs and daily tracking) is stored locally on your device. You are responsible for backing up your data if needed. We are not responsible for any data loss that occurs if you uninstall the App or clear its storage.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">4.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Location Features</h4>
              </div>
              <p className="leading-relaxed">
                Certain features, such as prayer times and Qibla direction, rely on your device's location data. By enabling these features, you consent to the App calculating this information locally on your device. We do not store or transmit this location data.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">5.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Intellectual Property</h4>
              </div>
              <p className="leading-relaxed">
                The App and its original content, features, and functionality are and will remain the exclusive property of Nisa Ul Huda and its licensors. The App is protected by copyright, trademark, and other laws.
              </p>
            </div>
            
            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">6.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Links to Other Web Sites</h4>
              </div>
              <p className="leading-relaxed">
                Our App may contain links to third-party web sites or services that are not owned or controlled by Nisa Ul Huda. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
              </p>
            </div>
            
            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">7.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Limitation of Liability</h4>
              </div>
              <p className="leading-relaxed">
                In no event shall Nisa Ul Huda, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of or inability to access or use the App.
              </p>
            </div>
            
            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">8.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Accuracy of Islamic Content</h4>
              </div>
              <p className="leading-relaxed">
                While we strive to ensure that the Quranic texts, Hadiths, prayer times, and other Islamic information provided in the App are accurate and verified, human error may occur. We cannot guarantee absolute perfection. Users are advised to verify critical information with local religious authorities.
              </p>
            </div>
            
            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">9.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Changes to Terms</h4>
              </div>
              <p className="leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our App after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>

            <div className="mb-12">
              <div className="flex gap-4 items-baseline mb-4">
                <span className="font-serif text-4xl text-[#D4AF37] font-bold">10.</span>
                <h4 className="font-serif text-3xl text-gray-900 font-bold m-0">Contact Us</h4>
              </div>
              <p className="leading-relaxed">
                If you have any questions about these Terms, please contact us at: <a href="mailto:huzaifasura970@gmail.com" className="font-medium text-[#D4AF37] hover:text-[#b3922d] transition-colors">huzaifasura970@gmail.com</a>
              </p>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default Terms;

