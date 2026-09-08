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
  Download, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  Smartphone, 
  Copy, 
  Check, 
  Plus, 
  X
} from 'lucide-react';
import type { DailyAyat } from '../types/ayat';
import { getAyats, saveLocalAyat, getStoredGitHubToken, setStoredGitHubToken, publishToGitHub } from '../utils/ayatStorage';
import { initialAyats } from '../data/defaultAyats';
import { generateQRMatrix, getQRPath } from '../utils/qrCode';
import { getOtpAuthUri, generateBackupCodes } from '../utils/totp';
import { 
  verifyMasterPin, 
  setMasterPin, 
  is2FAConfigured, 
  getOrCreate2FASecret, 
  confirm2FASetup, 
  verifyTOTPWithReplayProtection, 
  verifyAndConsumeBackupCode, 
  saveBackupCodes, 
  getRemainingBackupCodesCount, 
  checkRateLimit, 
  createAdminSession, 
  validateAdminSession, 
  logoutAdmin,
  reset2FASettings
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
  const [authStep, setAuthStep] = useState<'pin' | '2fa-verify' | '2fa-setup' | '2fa-backup-codes'>('pin');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // 2FA Verification State
  const [totpInput, setTotpInput] = useState('');
  const [totpError, setTotpError] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  // Security Settings Modal in Dashboard
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [remainingBackupCount, setRemainingBackupCount] = useState(0);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [securityStatusMsg, setSecurityStatusMsg] = useState<{ success?: boolean; text: string } | null>(null);

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

  // -------------------------------------------------------------
  // Lifecycle & Session Validation (Anti-Bypass)
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Check rate limit
    const rl = checkRateLimit();
    if (rl.isLocked) {
      setRateLimitSeconds(rl.remainingSeconds);
    }

    // 2. Cryptographically validate session token against 2FA secret
    validateAdminSession().then(valid => {
      if (valid) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
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

  // QR Code generation for 2FA Setup
  const qrMatrix = useMemo(() => {
    if (!totpSecret) return null;
    const uri = getOtpAuthUri(totpSecret, 'admin@nisaulhuda.app', 'Nisa Ul Huda');
    try {
      return generateQRMatrix(uri);
    } catch {
      return null;
    }
  }, [totpSecret]);

  const qrPath = useMemo(() => {
    if (!qrMatrix) return '';
    return getQRPath(qrMatrix);
  }, [qrMatrix]);

  // -------------------------------------------------------------
  // Authentication Handlers
  // -------------------------------------------------------------
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const rl = checkRateLimit();
    if (rl.isLocked) {
      setRateLimitSeconds(rl.remainingSeconds);
      setPinError(`Too many failed attempts. Locked for ${rl.remainingSeconds} seconds.`);
      return;
    }

    const isValid = await verifyMasterPin(pinInput);
    if (!isValid) {
      const updatedRl = checkRateLimit();
      if (updatedRl.isLocked) {
        setRateLimitSeconds(updatedRl.remainingSeconds);
        setPinError(`Locked for ${updatedRl.remainingSeconds}s due to repeated failures.`);
      } else {
        setPinError('Incorrect Master PIN. Please try again.');
      }
      return;
    }

    // PIN is valid! Check if 2FA is configured
    if (is2FAConfigured()) {
      setAuthStep('2fa-verify');
      setTotpInput('');
      setTotpError('');
    } else {
      // First time: Start 2FA Setup Flow
      const secret = getOrCreate2FASecret();
      setTotpSecret(secret);
      setAuthStep('2fa-setup');
    }
  };

  const handle2FAConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError('');

    const verifyResult = await verifyTOTPWithReplayProtection(totpInput, totpSecret);
    if (!verifyResult.success) {
      setTotpError(verifyResult.error || 'Invalid 6-digit code. Check your Google Authenticator.');
      return;
    }

    // Valid code! Confirm 2FA and generate emergency backup codes
    confirm2FASetup(totpSecret);
    const backupCodes = generateBackupCodes(8);
    await saveBackupCodes(backupCodes);
    setNewBackupCodes(backupCodes);
    setAuthStep('2fa-backup-codes');
  };

  const handleFinishSetupAndLogin = async () => {
    await createAdminSession(totpSecret);
    setIsAuthenticated(true);
    setRemainingBackupCount(8);
  };

  const handle2FAVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError('');

    if (isUsingBackupCode) {
      // Verify single-use emergency backup code
      const valid = await verifyAndConsumeBackupCode(totpInput);
      if (valid) {
        const secret = getOrCreate2FASecret();
        await createAdminSession(secret);
        setIsAuthenticated(true);
        setRemainingBackupCount(getRemainingBackupCodesCount());
      } else {
        setTotpError('Invalid or already used backup code.');
      }
      return;
    }

    // Verify Google Authenticator 6-digit TOTP
    const secret = getOrCreate2FASecret();
    const result = await verifyTOTPWithReplayProtection(totpInput, secret);
    if (result.success) {
      await createAdminSession(secret);
      setIsAuthenticated(true);
    } else {
      setTotpError(result.error || 'Incorrect 6-digit code. Please verify time synchronization.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setAuthStep('pin');
    setPinInput('');
    setTotpInput('');
  };

  // -------------------------------------------------------------
  // Security Modal Operations
  // -------------------------------------------------------------
  const handleRegenerateBackupCodes = async () => {
    const codes = generateBackupCodes(8);
    await saveBackupCodes(codes);
    setNewBackupCodes(codes);
    setRemainingBackupCount(8);
    setSecurityStatusMsg({ success: true, text: '8 new backup recovery codes generated and saved!' });
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput || newPinInput.length < 4) {
      setSecurityStatusMsg({ success: false, text: 'New PIN must be at least 4 characters long.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setSecurityStatusMsg({ success: false, text: 'New PIN and Confirm PIN do not match.' });
      return;
    }
    await setMasterPin(newPinInput);
    setNewPinInput('');
    setConfirmPinInput('');
    setSecurityStatusMsg({ success: true, text: 'Master PIN successfully updated!' });
  };

  const handleReset2FA = () => {
    if (window.confirm('Are you sure you want to reset 2FA? You will need to re-link Google Authenticator.')) {
      reset2FASettings();
      setShowSecurityModal(false);
      setAuthStep('pin');
    }
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

  const handleCopyCodes = (codes: string[]) => {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  const handleDownloadCodes = (codes: string[]) => {
    const text = `Nisa Ul Huda Admin Emergency Backup Codes\nGenerated on: ${new Date().toLocaleString()}\n\nKeep these single-use codes in a safe place:\n\n${codes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nEach code can be used only once if you lose access to Google Authenticator.`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nisa-ul-huda-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // Render: Login & 2FA Setup Views
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d131f] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background Overlay */}
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
          {/* STEP 1: Enter Master PIN */}
          {authStep === 'pin' && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#c29b62]/15 border border-[#c29b62]/30 text-[#c29b62] flex items-center justify-center mx-auto shadow-inner">
                <Lock size={28} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-[#c29b62] font-bold uppercase tracking-widest block">
                  Private Administration
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  Nisa Ul Huda CMS
                </h1>
                <p className="text-slate-500 text-xs">
                  Enter your Master PIN to access the 2FA-secured publisher.
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input
                  type="password"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: nisa786)"
                  disabled={rateLimitSeconds > 0}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-center text-lg tracking-widest text-slate-900 focus:outline-none focus:border-[#c29b62] focus:bg-white focus:ring-2 focus:ring-[#c29b62]/20 transition-all font-semibold disabled:opacity-50"
                  autoFocus
                />

                {pinError && (
                  <p className="text-rose-600 text-xs flex items-center justify-center gap-1 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    <AlertCircle size={14} />
                    {pinError}
                  </p>
                )}

                {rateLimitSeconds > 0 && (
                  <p className="text-amber-600 text-xs font-semibold">
                    ⏳ Security cooldown: Please wait {rateLimitSeconds}s
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

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-light flex items-center justify-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Protected with Google Authenticator (TOTP)
                </span>
              </div>
            </div>
          )}

          {/* STEP 2A: 2FA Verification (Already Configured) */}
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
                    ? 'Enter one of your 8-digit emergency recovery codes (e.g. 4829-1940).'
                    : 'Enter the 6-digit code currently shown in your Google Authenticator app.'}
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
                    setAuthStep('pin');
                    setTotpInput('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Back to PIN
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B: 2FA Setup Flow (First Time) */}
          {authStep === '2fa-setup' && (
            <div className="space-y-5 text-left">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#c29b62]/15 border border-[#c29b62]/30 text-[#c29b62] flex items-center justify-center mx-auto mb-2">
                  <Smartphone size={24} />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Set Up Google Authenticator
                </h2>
                <p className="text-slate-500 text-xs">
                  Scan this QR code with Google Authenticator on your phone to link your 2FA account.
                </p>
              </div>

              {/* QR Code SVG Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col items-center justify-center">
                {qrMatrix ? (
                  <svg
                    viewBox={`0 0 ${qrMatrix.length + 8} ${qrMatrix.length + 8}`}
                    className="w-44 h-44 sm:w-48 sm:h-48 bg-white p-2 rounded-2xl shadow-sm border border-slate-200"
                    shapeRendering="crispEdges"
                  >
                    <path d={qrPath} fill="#0f172a" />
                  </svg>
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR Code...
                  </div>
                )}
                <span className="text-[10px] text-slate-400 mt-2">
                  Scan using Google Authenticator, Microsoft Authenticator, or Authy
                </span>
              </div>

              {/* Manual Secret Key */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Or enter setup key manually in Authenticator:
                </label>
                <div className="flex items-center justify-between bg-slate-100 rounded-xl p-2.5 border border-slate-200">
                  <code className="text-xs font-mono font-bold text-slate-800 tracking-wider">
                    {totpSecret.match(/.{1,4}/g)?.join(' ') || totpSecret}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(totpSecret);
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

              {/* Confirm 6-Digit Code */}
              <form onSubmit={handle2FAConfirmSetup} className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Enter the 6-digit code shown in Authenticator to activate:
                </label>
                <input
                  type="text"
                  value={totpInput}
                  onChange={e => setTotpInput(e.target.value)}
                  placeholder="000 000"
                  maxLength={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl tracking-[0.25em] text-slate-900 focus:outline-none focus:border-[#c29b62] focus:bg-white font-mono font-bold"
                  autoFocus
                />

                {totpError && (
                  <p className="text-rose-600 text-xs flex items-center gap-1 font-medium bg-rose-50 p-2 rounded-xl border border-rose-100">
                    <AlertCircle size={14} />
                    {totpError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#c29b62] hover:bg-[#b08b53] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Confirm & Enable 2FA
                </button>
              </form>
            </div>
          )}

          {/* STEP 2C: Display Emergency Backup Codes */}
          {authStep === '2fa-backup-codes' && (
            <div className="space-y-5 text-left">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Save Your Emergency Backup Codes
                </h2>
                <p className="text-slate-500 text-xs">
                  If you ever lose your phone or Google Authenticator app, these 8 single-use codes are your ONLY way to regain access.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {newBackupCodes.map((code, idx) => (
                  <div key={idx} className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center font-mono font-bold text-xs text-slate-800 shadow-sm">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCodes(newBackupCodes)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedCodes ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedCodes ? 'Copied to Clipboard' : 'Copy All Codes'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadCodes(newBackupCodes)}
                  className="flex-1 py-2.5 rounded-xl border border-[#c29b62]/40 bg-[#c29b62]/10 hover:bg-[#c29b62]/20 text-[#c29b62] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download size={14} />
                  Download TXT
                </button>
              </div>

              <button
                type="button"
                onClick={handleFinishSetupAndLogin}
                className="w-full bg-[#c29b62] hover:bg-[#b08b53] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all text-center block"
              >
                I Have Saved My Codes → Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Admin Dashboard (Secure & Authenticated)
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
                2FA Protected • GitHub Publisher
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setShowSecurityModal(true);
                setSecurityStatusMsg(null);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 transition-colors border border-emerald-200"
              title="Manage 2FA Security"
            >
              <ShieldCheck size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">2FA Security</span>
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

      {/* Security & 2FA Modal */}
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
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl space-y-6 border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-serif font-bold text-lg">
                  <ShieldCheck className="text-emerald-600" size={20} />
                  Security & 2FA Management
                </div>
                <button
                  onClick={() => setShowSecurityModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {securityStatusMsg && (
                <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  securityStatusMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {securityStatusMsg.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {securityStatusMsg.text}
                </div>
              )}

              {/* Status Badge */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle size={15} className="text-emerald-600" />
                  Google Authenticator 2FA is Active
                </span>
                <p className="text-[11px] text-emerald-800">
                  Every login strictly requires both your Master PIN and smartphone 6-digit TOTP code.
                </p>
              </div>

              {/* Backup Codes Section */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Emergency Backup Codes</span>
                  <span className="text-[11px] font-semibold text-[#c29b62] bg-[#c29b62]/10 px-2.5 py-0.5 rounded-full">
                    {remainingBackupCount} remaining
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Single-use codes for when your phone is unavailable.
                </p>

                {newBackupCodes.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                      {newBackupCodes.map((c, i) => (
                        <div key={i} className="text-center font-mono font-bold text-[11px] text-slate-700">
                          {c}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadCodes(newBackupCodes)}
                      className="w-full py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Download size={13} />
                      Download New Codes (TXT)
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegenerateBackupCodes}
                    className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Generate 8 New Emergency Backup Codes
                  </button>
                )}
              </div>

              {/* Change Master PIN Form */}
              <form onSubmit={handleChangePin} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block">Change Master PIN</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="New PIN"
                    value={newPinInput}
                    onChange={e => setNewPinInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62]"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New PIN"
                    value={confirmPinInput}
                    onChange={e => setConfirmPinInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#c29b62]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#c29b62] hover:bg-[#b08b53] text-white text-xs font-bold tracking-wider uppercase transition-colors"
                >
                  Save New Master PIN
                </button>
              </form>

              {/* Reset 2FA */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Re-pair Authenticator phone?</span>
                <button
                  type="button"
                  onClick={handleReset2FA}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Reset & Re-link 2FA
                </button>
              </div>
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
              <div key={item.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
                <div className="min-h-[140px] max-h-[220px] relative overflow-hidden bg-slate-200 flex items-center justify-center">
                  <img
                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `${import.meta.env.BASE_URL}${item.imageUrl.replace(/^\//, '')}`}
                    alt={item.altText}
                    className="w-full h-auto max-h-[200px] object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3 text-center space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-900 block truncate">
                    Surah {item.surahName} : {item.ayatNumber}
                  </span>
                  <span className="text-[9px] text-[#c29b62] uppercase font-semibold block truncate">
                    {item.theme || 'Daily Ayat'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminPortal;
