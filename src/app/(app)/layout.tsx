'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { GlobalSearchModal } from '@/components/modals/GlobalSearchModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      {/* Desktop Persistent Sidebar (matches target UI) */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-full overflow-hidden">
        <AppSidebar />
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right">
            <AppSidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto" id="main-content">
          {children}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <AddTransactionModal />
      <GlobalSearchModal />
    </div>
  );
}
