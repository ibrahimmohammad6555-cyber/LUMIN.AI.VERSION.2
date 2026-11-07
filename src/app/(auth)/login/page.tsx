'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LumenLogo } from '@/components/ui/LumenLogo';
import { ShieldCheckIcon, AlertCircleIcon, ArrowRightIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const router = useRouter();
  const { users, switchUser, loginWithSupabase, isCloudConnected } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isCloudConnected) {
        const res = await loginWithSupabase(email, password);
        if (!res.success) {
          setErrorMsg(res.message);
          setIsLoading(false);
          return;
        }
      }

      // Check local user accounts
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched && matched.id) {
        if (matched.status === 'inactive') {
          setErrorMsg('This account has been deactivated. Please contact your company administrator.');
          setIsLoading(false);
          return;
        }
        await switchUser(matched.id);
        router.push('/dashboard');
        return;
      }

      // If user is Amit Kumar default super admin
      if (email.toLowerCase() === 'amit@acmetraders.com') {
        const superAdmin = users.find((u) => u.role === 'SUPER_ADMIN') || users[0];
        if (superAdmin?.id) {
          await switchUser(superAdmin.id);
          router.push('/dashboard');
          return;
        }
      }

      setErrorMsg('Invalid email or password. If you are new to LUMEN.AI, please register your company below.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080D18] relative overflow-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C026D3]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="inline-block transform hover:scale-105 transition">
            <LumenLogo variant="full" size={44} theme="dark" showTagline />
          </Link>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Secure Business Intelligence & Financial Management Platform
          </p>
        </div>

        {/* Login Card */}
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
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Enter your corporate credentials to access your private business data.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[#FF647C] text-xs font-semibold flex items-center gap-2">
              <AlertCircleIcon size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-black/30 border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[var(--text-secondary)] font-semibold">
                  Password
                </label>
                <span className="text-[10px] text-[var(--text-muted)]">Encrypted Session</span>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-black/30 border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10D6A0] to-[#00E5FF] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
              <ArrowRightIcon size={14} />
            </button>
          </form>

          {/* Quick Super Admin Sign In for Owner */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('amit@acmetraders.com');
                setPassword('password123');
              }}
              className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <ShieldCheckIcon size={14} />
              <span>Sign in as Super Admin (Amit Kumar)</span>
            </button>
          </div>
        </div>

        {/* Public Registration Link */}
        <div className="text-center text-xs text-[var(--text-muted)]">
          Need a private workspace for your company?{' '}
          <Link href="/signup" className="text-[#10D6A0] font-bold hover:underline">
            Register New Company
          </Link>
        </div>
      </div>
    </div>
  );
}
