'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  OverviewIcon,
  BrainIcon,
  ArrowLeftRightIcon,
  ShoppingBagIcon,
  PackageIcon,
  ReceiptIcon,
  FileTextIcon,
  UsersIcon,
  TruckIcon,
  CoinsIcon,
  BarChart3Icon,
  CalculatorIcon,
  FileBarChartIcon,
  SettingsIcon,
  CrownIcon,
  ChevronRightIcon,
  XIcon,
  ShieldCheckIcon,
} from '@/components/ui/icons';
import { LumenLogo } from '@/components/ui/LumenLogo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  hasSubmenu?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: OverviewIcon },
  { name: 'AI Intelligence', href: '/ai', icon: BrainIcon },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRightIcon, hasSubmenu: true },
  { name: 'Sales', href: '/sales', icon: ShoppingBagIcon, hasSubmenu: true },
  { name: 'Purchases', href: '/purchases', icon: PackageIcon, hasSubmenu: true },
  { name: 'Expenses', href: '/expenses', icon: ReceiptIcon, hasSubmenu: true },
  { name: 'Invoices', href: '/invoices', icon: FileTextIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Vendors', href: '/vendors', icon: TruckIcon },
  { name: 'Products & Inventory', href: '/inventory', icon: PackageIcon },
  { name: 'Cash Flow', href: '/cashflow', icon: CoinsIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChart3Icon },
  { name: 'Financial Calculators', href: '/calculators', icon: CalculatorIcon },
  { name: 'Reports', href: '/reports', icon: FileBarChartIcon },
  { name: 'Super Admin', href: '/admin', icon: ShieldCheckIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div
      className="flex flex-col h-full w-full select-none"
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
        <Link href="/dashboard" onClick={onClose} className="group">
          <LumenLogo variant="full" size={36} theme="dark" />
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Close sidebar"
          >
            <XIcon size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Sidebar navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-item group ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={18}
                className={`transition ${
                  isActive ? 'text-[#10D6A0]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                }`}
              />
              <span className="flex-1 truncate text-xs font-medium">{item.name}</span>
              {item.hasSubmenu && (
                <ChevronRightIcon
                  size={13}
                  className={`text-[var(--text-muted)] opacity-60 transition group-hover:opacity-100 ${
                    isActive ? 'rotate-90 text-[#10D6A0]' : ''
                  }`}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Pro Plan Card */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div
          className="p-3 rounded-xl border flex items-center justify-between transition hover:border-[#10D6A0]/40"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-[#FFBE69] flex items-center justify-center font-bold">
              <CrownIcon size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">Pro Plan</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">Business Edition</p>
            </div>
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className="text-[11px] font-semibold text-[#10D6A0] hover:underline flex items-center gap-1"
          >
            Manage <ChevronRightIcon size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
