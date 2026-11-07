'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import {
  SearchIcon,
  XIcon,
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
} from '@/components/ui/icons';

const MODULES = [
  { name: 'Overview', href: '/dashboard', icon: OverviewIcon, category: 'Navigation' },
  { name: 'AI Intelligence', href: '/ai', icon: BrainIcon, category: 'Navigation' },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRightIcon, category: 'Navigation' },
  { name: 'Sales', href: '/sales', icon: ShoppingBagIcon, category: 'Navigation' },
  { name: 'Purchases', href: '/purchases', icon: PackageIcon, category: 'Navigation' },
  { name: 'Expenses', href: '/expenses', icon: ReceiptIcon, category: 'Navigation' },
  { name: 'Invoices', href: '/invoices', icon: FileTextIcon, category: 'Navigation' },
  { name: 'Customers', href: '/customers', icon: UsersIcon, category: 'Navigation' },
  { name: 'Vendors', href: '/vendors', icon: TruckIcon, category: 'Navigation' },
  { name: 'Products & Inventory', href: '/inventory', icon: PackageIcon, category: 'Navigation' },
  { name: 'Cash Flow', href: '/cashflow', icon: CoinsIcon, category: 'Navigation' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3Icon, category: 'Navigation' },
  { name: 'Financial Calculators', href: '/calculators', icon: CalculatorIcon, category: 'Navigation' },
  { name: 'Reports', href: '/reports', icon: FileBarChartIcon, category: 'Navigation' },
  { name: 'Settings', href: '/settings', icon: SettingsIcon, category: 'Navigation' },
];

export function GlobalSearchModal() {
  const { isSearchModalOpen, setIsSearchModalOpen, transactions, products, customers, invoices, currency } = useApp();
  const [query, setQuery] = useState('');
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { modules: MODULES.slice(0, 6), items: [] };
    }

    const matchedModules = MODULES.filter((m) => m.name.toLowerCase().includes(q));

    const matchedTxs = transactions
      .filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.invoiceNo && t.invoiceNo.toLowerCase().includes(q)) ||
          (t.customerName && t.customerName.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((t) => ({
        id: `tx-${t.id}`,
        title: t.description,
        subtitle: `${t.type.toUpperCase()} • ${t.date} • ${formatCurrency(t.amount, currency)}`,
        link: '/transactions',
        tag: 'Transaction',
      }));

    const matchedProds = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({
        id: `prod-${p.id}`,
        title: p.name,
        subtitle: `SKU: ${p.sku} • Stock: ${p.stockQuantity} ${p.unit} • ${formatCurrency(p.sellingPrice, currency)}`,
        link: '/inventory',
        tag: 'Product',
      }));

    const matchedCusts = customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({
        id: `cust-${c.id}`,
        title: c.name,
        subtitle: `${c.email} • Balance: ${formatCurrency(c.balance, currency)}`,
        link: '/customers',
        tag: 'Customer',
      }));

    const matchedInvs = invoices
      .filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((i) => ({
        id: `inv-${i.id}`,
        title: `Invoice ${i.invoiceNumber}`,
        subtitle: `${i.customerName} • ${i.status.toUpperCase()} • ${formatCurrency(i.total, currency)}`,
        link: '/invoices',
        tag: 'Invoice',
      }));

    return {
      modules: matchedModules,
      items: [...matchedTxs, ...matchedProds, ...matchedCusts, ...matchedInvs],
    };
  }, [query, transactions, products, customers, invoices, currency]);

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl border p-4 shadow-2xl space-y-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20 border" style={{ borderColor: 'var(--border-color)' }}>
          <SearchIcon size={20} className="text-[#10D6A0]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, invoices, products, customers, modules…"
            className="flex-1 bg-transparent border-none text-sm font-medium focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-white/5 border-white/10 text-[var(--text-muted)]">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {/* Modules Section */}
          {results.modules.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-1.5">
                Quick Jump
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {results.modules.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.href}
                      onClick={() => {
                        setIsSearchModalOpen(false);
                        router.push(m.href);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent hover:border-white/10 transition text-left"
                    >
                      <Icon size={16} className="text-[#10D6A0]" />
                      <span className="truncate">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Records Section */}
          {results.items.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-1.5">
                Records Found ({results.items.length})
              </p>
              <div className="space-y-1">
                {results.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      router.push(item.link);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/10 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-muted)]">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.modules.length === 0 && results.items.length === 0 && (
            <div className="text-center py-8 text-[var(--text-muted)] text-xs">
              No matching transactions, invoices, or records found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
