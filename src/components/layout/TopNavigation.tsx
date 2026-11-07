'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  Building2Icon,
  ChevronDownIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  MenuIcon,
  ShieldCheckIcon,
} from '@/components/ui/icons';

export function TopNavigation({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    theme,
    toggleTheme,
    businessProfile,
    currentUser,
    canManageUsers,
    setIsSearchModalOpen,
    notifications,
    markNotificationRead,
    authUser,
    isCloudConnected,
    logoutSupabase,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="h-16 px-4 md:px-7 flex items-center justify-between gap-4 border-b z-20 flex-shrink-0"
      style={{
        background: 'var(--bg-main)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left: Mobile hamburger & Workspace Selector */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl border text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
            aria-label="Open menu"
          >
            <MenuIcon size={20} />
          </button>
        )}

        {/* Workspace Selector */}
        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border cursor-pointer hover:border-[#10D6A0]/40 transition text-xs font-semibold"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="w-5 h-5 rounded-md bg-emerald-500/15 text-[#10D6A0] flex items-center justify-center">
            <Building2Icon size={13} />
          </div>
          <span className="text-[var(--text-primary)] tracking-tight max-w-[140px] sm:max-w-none truncate">
            {businessProfile.businessName}
          </span>
          <ChevronDownIcon size={14} className="text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs font-medium text-[var(--text-muted)] hover:border-[#10D6A0]/30 transition"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <SearchIcon size={15} className="text-[var(--text-muted)]" />
            <span>Search transactions, invoices, customers...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono border bg-white/5 border-white/10 text-[var(--text-muted)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Mobile search icon button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="sm:hidden p-2 rounded-xl border text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
          aria-label="Search"
        >
          <SearchIcon size={18} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#10D6A0]/40 transition"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
            aria-label="Notifications"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF647C] ring-2 ring-[var(--bg-card)]" />
            )}
          </button>

          {isNotifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl space-y-3 z-50 animate-fade-in"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF647C]/20 text-[#FF647C]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">Real-time alerts</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--text-muted)]">No alerts right now</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        n.read
                          ? 'opacity-60 bg-transparent border-transparent'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {n.type === 'danger' ? (
                          <AlertCircleIcon size={14} className="text-[#FF647C]" />
                        ) : n.type === 'warning' ? (
                          <AlertCircleIcon size={14} className="text-[#FFBE69]" />
                        ) : (
                          <CheckCircle2Icon size={14} className="text-[#10D6A0]" />
                        )}
                        <span className="text-[var(--text-primary)]">{n.title}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#10D6A0]/40 transition"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border cursor-pointer hover:border-[#10D6A0]/40 transition"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#10D6A0] to-[#55B8FF] text-black font-bold text-xs flex items-center justify-center overflow-hidden">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                (currentUser?.name || businessProfile.userName).slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="text-left hidden md:block leading-tight">
              <p className="text-xs font-bold text-[var(--text-primary)]">{currentUser?.name || businessProfile.userName}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">{currentUser?.role || businessProfile.userRole}</p>
            </div>
            <ChevronDownIcon size={14} className="text-[var(--text-muted)] hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border p-2.5 shadow-2xl space-y-1.5 z-50 animate-fade-in text-xs"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="font-bold text-[var(--text-primary)]">{currentUser?.name || businessProfile.userName}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{currentUser?.email || businessProfile.userEmail}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    {currentUser?.role || 'SUPER_ADMIN'}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <ShieldCheckIcon size={11} />
                    <span>{isCloudConnected ? 'Cloud' : 'Local RLS'}</span>
                  </div>
                </div>
              </div>

              {canManageUsers && (
                <Link
                  href="/admin"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-amber-400 hover:bg-amber-500/10 transition font-semibold"
                >
                  <ShieldCheckIcon size={14} />
                  <span>Super Admin Center</span>
                </Link>
              )}

              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition"
              >
                Business Profile & Settings
              </Link>
              <Link
                href="/ai"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition"
              >
                LUMEN AI Assistant
              </Link>
              <Link
                href="/reports"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition"
              >
                Financial Reports
              </Link>

              {authUser && (
                <button
                  onClick={() => {
                    logoutSupabase();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[#FF647C] hover:bg-rose-500/10 transition font-semibold"
                >
                  Sign Out of Cloud
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
