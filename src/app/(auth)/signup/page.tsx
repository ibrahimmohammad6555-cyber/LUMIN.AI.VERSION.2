'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LumenLogo } from '@/components/ui/LumenLogo';
import { Building2Icon, AlertCircleIcon, ArrowRightIcon, CheckCircle2Icon } from '@/components/ui/icons';

export default function SignupPage() {
  const router = useRouter();
  const { registerCompanyWorkspace } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (!name.trim() || !email.trim() || !password || !companyName.trim()) {
        setErrorMsg('Please complete all required fields.');
        setIsLoading(false);
        return;
      }

      const res = await registerCompanyWorkspace({
        name: name.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim(),
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080D18] relative overflow-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#A855F7]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-block transform hover:scale-105 transition">
            <LumenLogo variant="full" size={44} theme="dark" showTagline />
          </Link>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Create an Isolated Private Financial Workspace for Your Business
          </p>
        </div>

        {/* Signup Card */}
        <div
          className="p-8 rounded-3xl border shadow-2xl space-y-5"
          style={{
            background: 'rgba(17, 28, 45, 0.85)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
              Register New Company
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Every registered company operates in a strictly isolated workspace. Your records are never visible to other businesses.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[#FF647C] text-xs font-semibold flex items-center gap-2">
              <AlertCircleIcon size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            {/* Company Info */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-[#10D6A0] font-bold">
                <Building2Icon size={15} />
                <span>Company / Workspace Identity</span>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Legal Company or Trading Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Logistics Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/30 border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0] transition"
                />
              </div>
            </div>

            {/* Administrator Account Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Your Full Name (Company Admin)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Nair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/30 border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0] transition"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Corporate Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@apexlogistics.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/30 border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0] transition"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                  Secure Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-black/30 border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0] transition"
                />
              </div>
            </div>

            {/* Privacy & Workspace Isolation Guarantee */}
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#55B8FF] text-[11px] leading-relaxed flex items-start gap-2">
              <CheckCircle2Icon size={15} className="shrink-0 mt-0.5 text-[#10D6A0]" />
              <span>
                <strong>Data Separation Guarantee:</strong> Your new account receives its own dedicated workspace. Your company’s transactions, customers, and reports remain 100% private.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10D6A0] to-[#00E5FF] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Workspace...' : 'Create Private Company Workspace'}</span>
              <ArrowRightIcon size={14} />
            </button>
          </form>
        </div>

        {/* Existing account login */}
        <div className="text-center text-xs text-[var(--text-muted)]">
          Already registered?{' '}
          <Link href="/login" className="text-[#10D6A0] font-bold hover:underline">
            Sign In to Existing Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
