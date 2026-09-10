import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Upload, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Image, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Download, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  Smartphone, 
  Copy, 
  Check, 
  Plus, 
  X,
  Mail,
  QrCode,
  Trash2
} from 'lucide-react';
import type { DailyAyat } from '../types/ayat';
import { 
  getAyats, 
  saveLocalAyat, 
  deleteLocalAyat, 
  deleteFromGitHub, 
  getStoredGitHubToken, 
  setStoredGitHubToken, 
  publishToGitHub 
} from '../utils/ayatStorage';
import { initialAyats } from '../data/defaultAyats';
import { generateQRMatrix, getQRPath } from '../utils/qrCode';
import { getOtpAuthUri } from '../utils/totp';
import { 
  getAuthorizedAdminEmail,
  verifyAdminCredentials,
  getActiveTOTPSecret,
  verifyTOTPWithReplayProtection, 
  verifyAndConsumeBackupCode, 
  getRemainingBackupCodesCount, 
  checkRateLimit, 
  createAdminSession, 
  validateAdminSession, 
  logoutAdmin
} from '../utils/adminAuth';

const DEFAULT_THEMES = [
  'Sabr & Hope',
  'Peace & Healing',
  'Gratitude (Shukr)',
  'Mercy & Forgiveness',
  'Supplication (Dua)',
  'Guidance & Faith'
];

const AdminPortal: React.FC = () => {
  // -------------------------------------------------------------
  // Authentication & 2FA State
  // -------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | '2fa-verify'>('login');
  
  // Login Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2FA Verification State
  const [totpInput, setTotpInput] = useState('');
  const [totpError, setTotpError] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [activeSecret, setActiveSecret] = useState<string>('');
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  // Security Modal in Dashboard
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [remainingBackupCount, setRemainingBackupCount] = useState(0);
  const [copiedKey, setCopiedKey] = useState(false);

  // GitHub Settings State
  const [ghToken, setGhToken] = useState('');
  const [showGhSettings, setShowGhSettings] = useState(false);

  // Form State
  const [surahName, setSurahName] = useState('');
  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [ayatNumber, setAyatNumber] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [urduTranslation, setUrduTranslation] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [altText, setAltText] = useState('');
  const [tags, setTags] = useState('daily ayat, quran quotes, islamic poster, nisa ul huda');

  // Dynamic Theme / Category State
  const [selectedCategory, setSelectedCategory] = useState<string>('Sabr & Hope');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [storedCustomCategories, setStoredCustomCategories] = useState<string[]>([]);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Existing Posters
  const [existingAyats, setExistingAyats] = useState<DailyAyat[]>(initialAyats);

  // Deletion State
  const [posterToDelete, setPosterToDelete] = useState<DailyAyat | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // -------------------------------------------------------------
  // Lifecycle & Session Validation (Anti-Bypass)
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Check rate limit
    const rl = checkRateLimit();
    if (rl.isLocked) {
      setRateLimitSeconds(rl.remainingSeconds);
    }

    // 2. Cryptographically validate session token
    validateAdminSession().then(valid => {
      if (valid) {
        setIsAuthenticated(true);
        const sec = getActiveTOTPSecret();
        if (sec) setActiveSecret(sec);
      } else {
        setIsAuthenticated(false);
        setAuthStep('login');
      }
    });

    // 3. Load custom categories
    try {
      const saved = localStorage.getItem('nisa_custom_categories');
      if (saved) {
        setStoredCustomCategories(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }

    setGhToken(getStoredGitHubToken());
    loadExistingAyats();
    setRemainingBackupCount(getRemainingBackupCodesCount());
  }, []);

  // Timer for lockout countdown
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const interval = setInterval(() => {
      setRateLimitSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitSeconds]);

  const loadExistingAyats = async () => {
    const data = await getAyats();
    setExistingAyats(data);
  };

  // Compile full list of categories
  const allCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_THEMES);
    storedCustomCategories.forEach(c => set.add(c));
    existingAyats.forEach(a => {
      if (a.theme && a.theme.trim() && a.theme.toLowerCase() !== 'general' && a.theme.toLowerCase() !== 'without category') {
        set.add(a.theme.trim());
      }
    });
    return Array.from(set);
  }, [storedCustomCategories, existingAyats]);

  // QR Code generation for Google Authenticator (only when authenticated or viewing)
  const qrMatrix = useMemo(() => {
    if (!activeSecret) return null;
    const uri = getOtpAuthUri(activeSecret, getAuthorizedAdminEmail(), 'Nisa Ul Huda');
    try {
      return generateQRMatrix(uri);
    } catch {
      return null;
    }
  }, [activeSecret]);

  const qrPath = useMemo(() => {
    if (!qrMatrix) return '';
    return getQRPath(qrMatrix);
  }, [qrMatrix]);

  // -------------------------------------------------------------
  // Authentication Handlers
  // -------------------------------------------------------------

  // Standard Login Submit (Strictly matches huzaifasura970@gmail.com and password)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const rl = checkRateLimit();
    if (rl.isLocked) {
      setRateLimitSeconds(rl.remainingSeconds);
      setLoginError(`Portal locked for ${rl.remainingSeconds}s due to failed attempts.`);
      return;
    }

    const credResult = await verifyAdminCredentials(emailInput, passwordInput);
    if (!credResult.success || !credResult.secret) {
      const updatedRl = checkRateLimit();
      if (updatedRl.isLocked) {
        setRateLimitSeconds(updatedRl.remainingSeconds);
        setLoginError(`Locked for ${updatedRl.remainingSeconds}s due to repeated failures.`);
      } else {
        setLoginError(credResult.error || 'Access Denied: Invalid credentials.');
      }
      return;
    }

    // Credentials verified! Proceed to 2FA verification
    setActiveSecret(credResult.secret);
    setAuthStep('2fa-verify');
    setTotpInput('');
    setTotpError('');
  };

  // Verify Google Authenticator Code during Login
  const handle2FAVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError('');

    if (isUsingBackupCode) {
      // Verify single-use emergency backup code
      const valid = await verifyAndConsumeBackupCode(totpInput);
      if (valid) {
        await createAdminSession(activeSecret);
        setIsAuthenticated(true);
        setRemainingBackupCount(getRemainingBackupCodesCount());
      } else {
        setTotpError('Invalid or already used emergency backup code.');
      }
      return;
    }

    // Verify Google Authenticator 6-digit TOTP
    const result = await verifyTOTPWithReplayProtection(totpInput, activeSecret);
    if (result.success) {
      await createAdminSession(activeSecret);
      setIsAuthenticated(true);
    } else {
      setTotpError(result.error || 'Incorrect 6-digit code. Check your Google Authenticator app.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setAuthStep('login');
    setPasswordInput('');
    setTotpInput('');
    setActiveSecret('');
  };

  // -------------------------------------------------------------
  // Form & Image Handling
  // -------------------------------------------------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        const base64Data = result.split(',')[1] || '';
        setImageBase64(base64Data);
      };
      reader.readAsDataURL(file);

      if (!altText && surahName) {
        setAltText(`Surah ${surahName} Ayat ${ayatNumber || ''} Quranic Islamic Calligraphy Poster in Urdu & Arabic`);
      }
    }
  };

  const autoGenerateAltText = () => {
    if (surahName) {
      const themeLabel = selectedCategory === '__none__' ? 'General' : selectedCategory;
      setAltText(`Surah ${surahName} Ayat ${ayatNumber || ''} Islamic Calligraphy Poster on ${themeLabel} with Urdu Translation`);
    }
  };

  const handleSaveGitHubToken = () => {
    setStoredGitHubToken(ghToken);
    alert('GitHub Personal Access Token saved securely in your local browser.');
  };

  const handleAddNewCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    if (!storedCustomCategories.includes(trimmed) && !DEFAULT_THEMES.includes(trimmed)) {
      const updated = [...storedCustomCategories, trimmed];
      setStoredCustomCategories(updated);
      localStorage.setItem('nisa_custom_categories', JSON.stringify(updated));
    }
    setSelectedCategory(trimmed);
    setIsAddingNewCategory(false);
    setCustomCategoryInput('');
  };

  const handlePublish = async (publishToRemoteGitHub: boolean) => {
    if (!surahName || !arabicText || !urduTranslation) {
      alert('Please fill in Surah Name, Arabic Text, and Urdu Translation.');
      return;
    }

    if (!imagePreview && !selectedFile) {
      alert('Please select or upload a poster image.');
      return;
    }

    const slugId = `surah-${surahName.toLowerCase().replace(/\s+/g, '-')}-${ayatNumber || Date.now()}`;
    const fileExt = selectedFile ? selectedFile.name.split('.').pop() || 'jpg' : 'jpg';
    const localImageUrl = `/posters/${slugId}.${fileExt}`;

    const finalTheme = selectedCategory === '__none__' ? undefined : selectedCategory;

    const newAyat: DailyAyat = {
      id: slugId,
      date: new Date().toISOString().split('T')[0],
      surahName: surahName.trim(),
      surahNumber: Number(surahNumber) || 1,
      ayatNumber: ayatNumber.trim() || '1',
      arabicText: arabicText.trim(),
      urduTranslation: urduTranslation.trim(),
      englishTranslation: englishTranslation.trim() || undefined,
      imageUrl: localImageUrl,
      altText: altText.trim() || `Surah ${surahName} Ayat ${ayatNumber} Islamic Poster`,
      theme: finalTheme,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (publishToRemoteGitHub) {
      if (!ghToken) {
        setShowGhSettings(true);
        alert('Please enter your GitHub Personal Access Token in the settings below to publish directly to GitHub.');
        return;
      }

      setIsPublishing(true);
      setPublishStatus(null);

      try {
        const result = await publishToGitHub(ghToken, newAyat, imageBase64);
        setPublishStatus({ success: true, message: result.message });
        await loadExistingAyats();
        resetForm();
      } catch (err: any) {
        setPublishStatus({ success: false, message: err.message || 'Failed to publish to GitHub.' });
      } finally {
        setIsPublishing(false);
      }
    } else {
      saveLocalAyat(newAyat);
      setPublishStatus({
        success: true,
        message: 'Saved to Local Storage! It is now visible on this device.'
      });
      await loadExistingAyats();
      resetForm();
    }
  };

  const resetForm = () => {
    setSurahName('');
    setAyatNumber('');
    setArabicText('');
    setUrduTranslation('');
    setEnglishTranslation('');
    setAltText('');
    setSelectedFile(null);
    setImagePreview('');
    setImageBase64('');
  };

  const handleDownloadUpdatedJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(existingAyats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'daily-ayats.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmDelete = async (deleteFromRemote: boolean) => {
    if (!posterToDelete) return;
    setDeleteStatus(null);
    setIsDeleting(true);

    try {
      if (deleteFromRemote) {
        if (!ghToken) {
          setShowGhSettings(true);
          setDeleteStatus({
            success: false,
            message: 'GitHub Personal Access Token is required to delete from repository. Please save your token in GitHub Settings.'
          });
          setIsDeleting(false);
          return;
        }
        const res = await deleteFromGitHub(ghToken, posterToDelete);
        setDeleteStatus({ success: true, message: res.message });
      } else {
        deleteLocalAyat(posterToDelete.id);
        setDeleteStatus({
          success: true,
          message: `Poster for Surah ${posterToDelete.surahName} (${posterToDelete.ayatNumber}) removed locally.`
        });
      }
      await loadExistingAyats();
      setTimeout(() => {
        setPosterToDelete(null);
        setIsDeleting(false);
        setDeleteStatus(null);
      }, 1200);
    } catch (err: any) {
      setDeleteStatus({ success: false, message: err.message || 'Failed to delete poster.' });
      setIsDeleting(false);
    }
  };

  // -------------------------------------------------------------
  // Render: Secure Login & 2FA Verification
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d131f] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Luxury Background Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}white_mosque_bg.webp)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c16]/95 via-[#111421]/90 to-[#070911]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 border border-slate-100"
        >
          {/* STAGE 1: CREDENTIALS LOGIN (Email + Password) */}
          {authStep === 'login' && (
            <div className="space-y-6 text-left">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-[#c29b62]/15 border border-[#c29b62]/30 text-[#c29b62] flex items-center justify-center mx-auto shadow-inner">
                  <Lock size={28} />
                </div>

                <span className="text-[10px] text-[#c29b62] font-bold uppercase tracking-widest block">
                  Private Administration
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  Nisa Ul Huda CMS
                </h1>
                <p className="text-slate-500 text-xs">
                  Sign in with the authorized admin email and password.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-[#c29b62]" />
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="Enter authorized email"
                    disabled={rateLimitSeconds > 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#c29b62] focus:bg-white transition-all font-medium disabled:opacity-50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Lock size={13} className="text-[#c29b62]" />
                    Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="Enter password"
                      disabled={rateLimitSeconds > 0}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-11 text-sm text-slate-900 focus:outline-none focus:border-[#c29b62] focus:bg-white transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-rose-600 text-xs flex items-center gap-1 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    <AlertCircle size={14} />
                    {loginError}
                  </p>
                )}

                {rateLimitSeconds > 0 && (
                  <p className="text-amber-600 text-xs font-semibold text-center">
                    ⏳ Security lock: Please wait {rateLimitSeconds}s
                  </p>
                )}

                <button
                  type="submit"
                  disabled={rateLimitSeconds > 0}
                  className="w-full bg-[#c29b62] hover:bg-[#b08b53] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Continue to 2FA Check
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 font-light flex items-center justify-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Protected by Hardcoded Email Whitelist + Google Authenticator
                </span>
              </div>
            </div>
          )}

          {/* STAGE 2: 2FA VERIFICATION (TOTP Code or Emergency Backup Code) */}
          {authStep === '2fa-verify' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Smartphone size={28} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block">
                  Two-Factor Authentication
                </span>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  {isUsingBackupCode ? 'Emergency Backup Code' : 'Google Authenticator'}
                </h2>
                <p className="text-slate-500 text-xs">
                  {isUsingBackupCode
                    ? 'Enter one of your 8-digit emergency backup codes (e.g. 7TGB-KC4U).'
                    : `Enter the 6-digit code shown for Nisa Ul Huda (${getAuthorizedAdminEmail()}).`}
                </p>
              </div>

              <form onSubmit={handle2FAVerifyLogin} className="space-y-4">
                <input
                  type="text"
                  value={totpInput}
                  onChange={e => setTotpInput(e.target.value)}
                  placeholder={isUsingBackupCode ? 'XXXX-XXXX' : '000 000'}
                  maxLength={isUsingBackupCode ? 10 : 7}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-center text-2xl tracking-[0.25em] text-slate-900 focus:outline-none focus:border-[#c29b62] focus:bg-white focus:ring-2 focus:ring-[#c29b62]/20 transition-all font-mono font-bold"
                  autoFocus
                />

                {totpError && (
                  <p className="text-rose-600 text-xs flex items-center justify-center gap-1 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    <AlertCircle size={14} />
                    {totpError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#c29b62] hover:bg-[#b08b53] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Verify & Access Dashboard
                </button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUsingBackupCode(!isUsingBackupCode);
                    setTotpInput('');
                    setTotpError('');
                  }}
                  className="text-[#c29b62] hover:underline font-semibold"
                >
                  {isUsingBackupCode ? '← Use Google Authenticator' : 'Lost phone? Use Backup Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('login');
                    setTotpInput('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Admin Dashboard (Authenticated)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 selection:bg-[#c29b62]/30 selection:text-slate-900">
      
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#c29b62] flex items-center justify-center bg-white shadow-md overflow-hidden p-0.5">
              <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900 leading-none">Daily Ayat Manager</h2>
              <span className="text-[10px] text-[#c29b62] uppercase font-bold tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                {getAuthorizedAdminEmail()} • 2FA Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200"
              title="Show Google Authenticator QR Code"
            >
              <QrCode size={14} className="text-[#c29b62]" />
              <span className="hidden sm:inline">2FA QR Code</span>
            </button>

            <button
              onClick={() => setShowSecurityModal(true)}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 transition-colors border border-emerald-200"
              title="Security Status"
            >
              <ShieldCheck size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Security</span>
            </button>

            <button
              onClick={() => setShowGhSettings(!showGhSettings)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <Key size={14} className="text-[#c29b62]" />
              <span className="hidden sm:inline">GitHub</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* View QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full z-10 shadow-2xl space-y-5 border border-slate-100 text-center"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-base">
                  <Smartphone className="text-[#c29b62]" size={18} />
                  Google Authenticator QR Code
                </div>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                {qrMatrix ? (
                  <svg
                    viewBox={`0 0 ${qrMatrix.length + 8} ${qrMatrix.length + 8}`}
                    className="w-48 h-48 bg-white p-2 rounded-2xl shadow-sm border border-slate-200"
                    shapeRendering="crispEdges"
                  >
                    <path d={qrPath} fill="#0f172a" />
                  </svg>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                    Loading QR Code...
                  </div>
                )}
                <span className="text-[11px] text-slate-500 mt-2 font-mono font-medium">
                  {getAuthorizedAdminEmail()}
                </span>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Manual Entry Key:
                </label>
                <div className="flex items-center justify-between bg-slate-100 rounded-xl p-2.5 border border-slate-200">
                  <code className="text-xs font-mono font-bold text-slate-800 tracking-wider">
                    {activeSecret.match(/.{1,4}/g)?.join(' ') || activeSecret}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeSecret);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="text-xs font-semibold text-[#c29b62] hover:text-[#b08b53] flex items-center gap-1 ml-2"
                  >
                    {copiedKey ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedKey ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Status Modal */}
      <AnimatePresence>
        {showSecurityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSecurityModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl space-y-6 border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                  <ShieldCheck className="text-emerald-600" size={20} />
                  Security Lock Status
                </div>
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle size={15} className="text-emerald-600" />
                  Hardlocked to {getAuthorizedAdminEmail()}
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  This portal is cryptographically locked to your email address only. Public registration is permanently disabled.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Emergency Backup Codes</span>
                  <span className="text-[11px] font-semibold text-[#c29b62] bg-[#c29b62]/10 px-2.5 py-0.5 rounded-full">
                    {remainingBackupCount} remaining
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Single-use codes for when your phone is unavailable.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="container mx-auto max-w-6xl px-4 pt-8 space-y-8">
        
        {/* GitHub Token Settings Banner */}
        {showGhSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
                <Key className="text-[#c29b62]" size={16} />
                GitHub Personal Access Token (PAT)
              </h3>
              <button onClick={() => setShowGhSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Required to directly commit posters and update <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">daily-ayats.json</code> on GitHub. Stored securely only in your browser.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={ghToken}
                onChange={e => setGhToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62]"
              />
              <button
                onClick={handleSaveGitHubToken}
                className="bg-[#c29b62] hover:bg-[#b08b53] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}

        {/* Status Notification */}
        {publishStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
              publishStatus.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {publishStatus.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{publishStatus.message}</span>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[11px] text-[#c29b62] uppercase tracking-widest font-bold block">
                Publisher
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900">
                New Daily Ayat Poster
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload image with any aspect ratio (Pinterest style), enter Quranic text and Urdu translation.
              </p>
            </div>

            <div className="space-y-4">
              {/* 1. Graphic Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Poster Graphic (Image / Wallpaper) *
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#c29b62] rounded-2xl p-6 text-center bg-slate-50/70 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <Upload className="w-8 h-8 text-[#c29b62] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click to browse or drag & drop poster graphic'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP (Square, 9:16 vertical, portrait, landscape — all supported!)
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Surah & Ayat Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Surah Name *
                  </label>
                  <input
                    type="text"
                    value={surahName}
                    onChange={e => setSurahName(e.target.value)}
                    onBlur={autoGenerateAltText}
                    placeholder="e.g. Al-Baqarah, Ar-Rahman, Ash-Sharh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ayat No. *
                  </label>
                  <input
                    type="text"
                    value={ayatNumber}
                    onChange={e => setAyatNumber(e.target.value)}
                    onBlur={autoGenerateAltText}
                    placeholder="e.g. 153 or 5-6"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white"
                  />
                </div>
              </div>

              {/* 3. Theme & Category (With Add Custom & Without Category options) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Theme / Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                      className="text-[10px] text-[#c29b62] hover:underline font-bold flex items-center gap-1"
                    >
                      <Plus size={12} />
                      {isAddingNewCategory ? 'Select Existing' : 'Create New'}
                    </button>
                  </div>

                  {isAddingNewCategory ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customCategoryInput}
                        onChange={e => setCustomCategoryInput(e.target.value)}
                        placeholder="e.g. Ramadan Kareem, Tawakkul"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62]"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="bg-[#c29b62] hover:bg-[#b08b53] text-white px-3 py-2.5 rounded-xl text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white font-medium"
                    >
                      <optgroup label="Standard & Custom Categories">
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Special Options">
                        <option value="__none__">🚫 Without Category (General)</option>
                      </optgroup>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Surah Order Number
                  </label>
                  <input
                    type="number"
                    value={surahNumber}
                    onChange={e => setSurahNumber(Number(e.target.value))}
                    placeholder="e.g. 2 for Al-Baqarah"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white"
                  />
                </div>
              </div>

              {/* 4. Arabic Text */}
              <div>
                <label className="block text-xs font-bold text-[#c29b62] uppercase tracking-wider mb-1.5">
                  Arabic Text (متن قرآن) *
                </label>
                <textarea
                  rows={3}
                  value={arabicText}
                  onChange={e => setArabicText(e.target.value)}
                  dir="rtl"
                  placeholder="وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-serif text-slate-900 focus:outline-none focus:border-[#c29b62] focus:bg-white leading-loose text-right"
                />
              </div>

              {/* 5. Urdu Translation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Urdu Translation (اردو ترجمہ) *
                </label>
                <textarea
                  rows={2}
                  value={urduTranslation}
                  onChange={e => setUrduTranslation(e.target.value)}
                  dir="rtl"
                  placeholder="اور صبر اور نماز سے مدد طلب کرو..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white text-right leading-relaxed"
                />
              </div>

              {/* 6. English Translation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  English Translation (Optional)
                </label>
                <input
                  type="text"
                  value={englishTranslation}
                  onChange={e => setEnglishTranslation(e.target.value)}
                  placeholder="And seek help through patience and prayer..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white"
                />
              </div>

              {/* 7. Alt Text & SEO Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    SEO Alt Text
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={e => setAltText(e.target.value)}
                    placeholder="Poster image description for Google Images"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Keywords / Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="sabr, baqarah, patience, daily ayat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62] focus:bg-white"
                  />
                </div>
              </div>

              {/* Publishing Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={() => handlePublish(true)}
                  className="flex-1 bg-[#c29b62] hover:bg-[#b08b53] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Committing to GitHub...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Publish to Remote GitHub
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={() => handlePublish(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-5 rounded-2xl text-xs uppercase tracking-wider transition-colors"
                >
                  Save Locally Only
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Preview & Collection */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Card Preview (Dynamic Aspect Ratio, Pinterest-ready) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-serif font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Eye size={15} className="text-[#c29b62]" />
                Live Card Preview (Dynamic Height)
              </h3>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-md">
                {/* Dynamic Image Container - Natural Aspect Ratio */}
                <div className="min-h-[220px] max-h-[480px] bg-slate-200 relative flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[460px] object-contain" />
                  ) : (
                    <div className="text-center p-6 text-slate-400 space-y-2">
                      <Image size={36} className="mx-auto text-slate-300" />
                      <p className="text-xs">No graphic selected yet</p>
                    </div>
                  )}

                  {surahName && (
                    <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-white border border-white/20 shadow">
                        Surah {surahName} : {ayatNumber || 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#c29b62] text-[9px] font-bold text-white shadow">
                        HD
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] text-[#c29b62] font-bold uppercase tracking-wider block">
                    {selectedCategory === '__none__' ? 'General (No Category)' : selectedCategory}
                  </span>
                  <p className="text-sm font-serif text-slate-900 line-clamp-1 text-right" dir="rtl">
                    {arabicText || 'متن قرآن یہاں ظاہر ہو گا'}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 text-right" dir="rtl">
                    {urduTranslation || 'اردو ترجمہ یہاں نظر آئے گا۔'}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Search Preview */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-serif font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={15} className="text-[#c29b62]" />
                Google Image & Search Preview
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 text-left">
                <span className="text-[11px] text-emerald-800 font-medium block">https://nisa.hudalabs.app › daily-ayat</span>
                <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                  {altText || `Surah ${surahName || 'Al-Quran'} Ayat ${ayatNumber || ''} Poster | Nisa Ul Huda`}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 font-sans leading-relaxed">
                  {urduTranslation || 'Download high resolution Quranic verse calligraphy poster in Arabic and Urdu.'}
                </p>
              </div>
            </div>

            {/* Export JSON Option */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Download Updated JSON</span>
                <span className="text-[10px] text-slate-400">Save daily-ayats.json to commit manually</span>
              </div>
              <button
                onClick={handleDownloadUpdatedJson}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#c29b62] transition-colors"
                title="Download JSON"
              >
                <Download size={18} />
              </button>
            </div>

          </div>
        </div>

        {/* Existing Collection (Dynamic Presentation) */}
        <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Published Collection ({existingAyats.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Posters currently available on the website.</p>
            </div>
            <button
              onClick={loadExistingAyats}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {existingAyats.map(item => (
              <div key={item.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm group relative flex flex-col justify-between">
                <div className="min-h-[140px] max-h-[220px] relative overflow-hidden bg-slate-200 flex items-center justify-center">
                  <img
                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.BASE_URL}${item.imageUrl.replace(/^\//, '')}`}
                    alt={item.altText}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-h-[200px] object-contain group-hover:scale-105 transition-transform"
                  />
                  {/* Delete Hover Action */}
                  <button
                    onClick={() => {
                      setPosterToDelete(item);
                      setDeleteStatus(null);
                    }}
                    title="Delete Poster"
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg scale-90 group-hover:scale-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="p-3 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-900 block truncate">
                    Surah {item.surahName} : {item.ayatNumber}
                  </span>
                  <span className="text-[9px] text-[#c29b62] uppercase font-semibold block truncate">
                    {item.theme || 'Daily Ayat'}
                  </span>
                  <button
                    onClick={() => {
                      setPosterToDelete(item);
                      setDeleteStatus(null);
                    }}
                    className="w-full mt-1 py-1 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1 transition-colors border border-rose-100"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {posterToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isDeleting && setPosterToDelete(null)}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <Trash2 size={26} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    Delete Poster?
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Choose whether to delete this poster permanently from the remote GitHub repository or remove it locally only.
                  </p>
                </div>

                {/* Poster Info Card */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 text-left">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <img
                      src={posterToDelete.imageUrl.startsWith('http') ? posterToDelete.imageUrl : `${import.meta.env.BASE_URL}${posterToDelete.imageUrl.replace(/^\//, '')}`}
                      alt={posterToDelete.altText}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      Surah {posterToDelete.surahName} (Ayat {posterToDelete.ayatNumber})
                    </h4>
                    <span className="text-[10px] text-[#c29b62] font-semibold block truncate">
                      {posterToDelete.theme || 'Daily Ayat'}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">
                      {posterToDelete.date}
                    </span>
                  </div>
                </div>

                {/* Status / Message Display */}
                {deleteStatus && (
                  <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    deleteStatus.success 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {deleteStatus.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    <span className="flex-1 text-left">{deleteStatus.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleConfirmDelete(true)}
                    className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Deleting from GitHub...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete from GitHub & Local
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleConfirmDelete(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    Delete Locally Only
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setPosterToDelete(null)}
                    className="w-full text-slate-400 hover:text-slate-600 font-medium py-2 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default AdminPortal;
