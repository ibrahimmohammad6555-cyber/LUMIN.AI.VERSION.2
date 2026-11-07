'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CURRENCIES } from '@/lib/currencies';
import {
  SettingsIcon,
  SunIcon,
  MoonIcon,
  Building2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  DownloadIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  UsersIcon,
} from '@/components/ui/icons';

export default function SettingsPage() {
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    businessProfile,
    updateBusinessProfile,
    currentUser,
    updateUserProfile,
    canManageUsers,
    supabaseUrl,
    supabaseAnonKey,
    setSupabaseConfig,
    authUser,
    isCloudConnected,
    syncState,
    lastSyncTime,
    syncWithCloud,
    loginWithSupabase,
    signupWithSupabase,
    logoutSupabase,
    resetAllData,
    reloadSampleData,
    exportJsonBackup,
    importJsonBackup,
    aiProvider,
    aiApiKey,
    setAiConfig,
  } = useApp();

  // Business profile form
  const [bizName, setBizName] = useState(businessProfile.businessName);
  const [userName, setUserName] = useState(businessProfile.userName);
  const [userRole, setUserRole] = useState(businessProfile.userRole);
  const [userEmail, setUserEmail] = useState(businessProfile.userEmail);
  const [gstin, setGstin] = useState(businessProfile.gstin);
  const [address, setAddress] = useState(businessProfile.address);
  const [phone, setPhone] = useState(businessProfile.phone);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Supabase state
  const [sbUrl, setSbUrl] = useState(supabaseUrl);
  const [sbKey, setSbKey] = useState(supabaseAnonKey);
  const [sbEmail, setSbEmail] = useState('');
  const [sbPassword, setSbPassword] = useState('');
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  // AI Config state
  const [selectedAiProvider, setSelectedAiProvider] = useState<'builtin' | 'openai' | 'gemini'>(aiProvider);
  const [apiKeyInput, setApiKeyInput] = useState(aiApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Backup import file ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal Profile & Avatar Customization
  const [profileName, setProfileName] = useState(currentUser?.name || businessProfile.userName);
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || businessProfile.userEmail);
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSavePersonalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name: profileName,
      email: profileEmail,
      avatar: profileAvatar,
    });
    setProfileNotice('Personal Profile updated successfully!');
    setTimeout(() => setProfileNotice(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusinessProfile({
      businessName: bizName,
      userName,
      userRole,
      userEmail,
      gstin,
      address,
      phone,
    });
    setSavedNotice('Business Profile saved successfully!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleSaveSupabase = async () => {
    await setSupabaseConfig(sbUrl, sbKey);
    setAuthMsg('Supabase credentials configured!');
    setTimeout(() => setAuthMsg(null), 3000);
  };

  const handleCloudLogin = async () => {
    const res = await loginWithSupabase(sbEmail, sbPassword);
    setAuthMsg(res.message);
  };

  const handleCloudSignup = async () => {
    const res = await signupWithSupabase(sbEmail, sbPassword);
    setAuthMsg(res.message);
  };

  const handleSaveAiConfig = async () => {
    await setAiConfig(selectedAiProvider, apiKeyInput);
    setAiNotice('AI configuration updated!');
    setTimeout(() => setAiNotice(null), 3000);
  };

  const handleDownloadBackup = async () => {
    const jsonStr = await exportJsonBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUMEN_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const ok = await importJsonBackup(content);
      if (ok) {
        alert('Database restored successfully from backup!');
      } else {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1400px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Configure business branding, currency preferences, cloud data sync, AI providers, and database backups.
        </p>
      </div>

      {/* Personal Profile & Avatar Customization */}
      <div className="lumen-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#10D6A0]/15 text-[#10D6A0]">
              <UsersIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">User Account & Profile Customization</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Manage your display identity, avatar picture, and assigned workspace permissions</p>
            </div>
          </div>
          {canManageUsers && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/25 transition self-start sm:self-auto"
            >
              <ShieldCheckIcon size={14} />
              <span>Open Super Admin Control</span>
            </Link>
          )}
        </div>

        <form onSubmit={handleSavePersonalProfile} className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#10D6A0] to-[#55B8FF] p-0.5 shadow-xl shadow-cyan-500/10">
                <div className="w-full h-full rounded-[14px] bg-[var(--bg-card)] overflow-hidden flex items-center justify-center font-bold text-xl text-[var(--text-primary)]">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                  ) : (
                    profileName.slice(0, 2).toUpperCase()
                  )}
                </div>
              </div>
            </div>

            {/* Avatar Preset Options */}
            <div className="flex-1 space-y-2 w-full">
              <label className="block text-[var(--text-secondary)] font-semibold">Choose Avatar Preset or Custom Image URL</label>
              <div className="flex items-center gap-3">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileAvatar(url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition ${
                      profileAvatar === url ? 'border-[#10D6A0] scale-105 shadow-md shadow-emerald-500/30' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setProfileAvatar('')}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
                    !profileAvatar ? 'border-[#10D6A0] text-[#10D6A0] bg-[#10D6A0]/10' : 'border-white/10 text-[var(--text-muted)]'
                  }`}
                >
                  Initials
                </button>
              </div>
              <input
                type="url"
                placeholder="Or paste external avatar image URL (https://...)"
                value={profileAvatar}
                onChange={(e) => setProfileAvatar(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)] font-mono"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">Your Display Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-bold text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">Your Email</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">Assigned RBAC Role</label>
              <div className="p-2 rounded-xl border bg-black/30 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-bold text-amber-400 font-mono text-xs">{currentUser?.role || 'SUPER_ADMIN'}</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheckIcon size={12} /> Verified
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileNotice && (
              <span className="text-[11px] text-[#10D6A0] font-bold flex items-center gap-1">
                <CheckCircle2Icon size={14} /> {profileNotice}
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-md shadow-emerald-500/20"
            >
              Update Profile & Avatar
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Business Profile & Legal Identity */}
        <div className="lumen-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
            <Building2Icon size={18} className="text-[#10D6A0]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Business Information & Invoicing Header</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">Company / Legal Entity Name</label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-bold text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Administrator Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Designation / Role</label>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-mono text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">Registered Business Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedNotice && (
                <span className="text-[11px] text-[#10D6A0] font-bold flex items-center gap-1">
                  <CheckCircle2Icon size={14} /> {savedNotice}
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-md shadow-emerald-500/20"
              >
                Save Business Profile
              </button>
            </div>
          </form>
        </div>

        {/* 2. Currency, Visual Theme, & Appearance */}
        <div className="lumen-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
            <SunIcon size={18} className="text-[#55B8FF]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Currency & Appearance Preferences</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Currency Selector */}
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1.5">
                Primary Financial Currency (Default: INR ₹)
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Converts all report views, invoice balances, and charts automatically.
              </p>
            </div>

            {/* Theme Toggle */}
            <div className="border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
              <label className="block text-[var(--text-secondary)] font-semibold mb-2">Display Theme</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                    theme === 'dark'
                      ? 'bg-emerald-500/15 border-[#10D6A0] text-[#10D6A0] font-bold'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <MoonIcon size={16} />
                  <span>Dark Signature Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                    theme === 'light'
                      ? 'bg-emerald-500/15 border-[#10D6A0] text-[#10D6A0] font-bold'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <SunIcon size={16} />
                  <span>Clean Light Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. AI Intelligence Provider Configuration */}
        <div className="lumen-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
            <SparklesIcon size={18} className="text-[#10D6A0]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">LUMEN AI Provider Configuration</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1.5">Intelligence Engine</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'builtin', label: 'Built-in Engine', desc: 'No API key needed' },
                  { id: 'openai', label: 'OpenAI GPT-4o', desc: 'Bring your key' },
                  { id: 'gemini', label: 'Google Gemini', desc: 'Bring your key' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAiProvider(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      selectedAiProvider === item.id
                        ? 'bg-[#10D6A0]/15 border-[#10D6A0] text-[#10D6A0] font-bold'
                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    <p className="font-bold">{item.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedAiProvider !== 'builtin' && (
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  {selectedAiProvider === 'openai' ? 'OpenAI API Key' : 'Gemini API Key'}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2.5 pr-10 rounded-xl border bg-black/20 text-xs font-mono text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-white"
                  >
                    {showApiKey ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Saved securely in browser local storage; never sent to third-party tracking servers.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {aiNotice && (
                <span className="text-[11px] text-[#10D6A0] font-bold flex items-center gap-1">
                  <CheckCircle2Icon size={14} /> {aiNotice}
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveAiConfig}
                className="ml-auto px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a]"
              >
                Save AI Settings
              </button>
            </div>
          </div>
        </div>

        {/* 4. Supabase Cloud Sync & Authentication */}
        <div className="lumen-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon size={18} className="text-[#55B8FF]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Supabase Cloud Database & Auth</h2>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCloudConnected
                  ? 'bg-emerald-500/15 text-[#10D6A0]'
                  : 'bg-white/10 text-[var(--text-muted)]'
              }`}
            >
              {isCloudConnected ? `Connected (${authUser?.email})` : 'Local-First Mode'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">Supabase Project URL</label>
              <input
                type="text"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-mono text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">Supabase Anon Public Key</label>
              <input
                type="password"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-mono text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveSupabase}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold text-[var(--text-primary)] hover:border-[#10D6A0]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Save Credentials
              </button>

              <button
                type="button"
                onClick={syncWithCloud}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a]"
              >
                <RefreshCwIcon size={13} className={syncState === 'syncing' ? 'animate-spin' : ''} />
                <span>Sync with Cloud</span>
              </button>
            </div>

            {authMsg && <p className="text-[11px] text-[#10D6A0] font-semibold">{authMsg}</p>}
          </div>
        </div>

        {/* 5. Database Management, Backup & Reset */}
        <div className="lg:col-span-2 lumen-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
            <DownloadIcon size={18} className="text-[#10D6A0]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Data Backup, JSON Restore & Reset Center</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* JSON Export */}
            <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--border-color)' }}>
              <p className="font-bold text-[var(--text-primary)]">Export Full Backup</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Download your complete ledger, product catalog, customers, and invoices as a JSON snapshot.
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2 rounded-xl border text-xs font-bold text-[#10D6A0] hover:bg-emerald-500/10 border-emerald-500/30 transition flex items-center justify-center gap-1.5"
              >
                <DownloadIcon size={14} /> Download JSON
              </button>
            </div>

            {/* JSON Restore */}
            <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--border-color)' }}>
              <p className="font-bold text-[var(--text-primary)]">Restore from Backup</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Import an existing LUMEN.AI JSON snapshot to recover transactions and products.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 rounded-xl border text-xs font-bold text-[var(--text-primary)] hover:border-[#10D6A0] hover:bg-white/5 transition flex items-center justify-center gap-1.5"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Upload JSON Backup
              </button>
            </div>

            {/* Reset / Reload Demo Data */}
            <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--border-color)' }}>
              <p className="font-bold text-[var(--text-primary)]">Reload High-Fidelity Data</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Re-seeds the exact executive ledger matching the preview design.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Reload verified initial dataset? This will reset custom edits.')) {
                    await reloadSampleData();
                    alert('Sample business dataset reloaded successfully!');
                  }
                }}
                className="w-full py-2 rounded-xl border text-xs font-bold text-[#FFBE69] hover:bg-amber-500/10 border-amber-500/30 transition"
              >
                Reload Standard Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
