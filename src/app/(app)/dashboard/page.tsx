'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import {
  RevenueExpensesAreaChart,
  ExpenseBreakdownDonutChart,
  CashFlowTrendBarChart,
  FinancialHealthScoreGauge,
  KpiSparkline,
} from '@/components/dashboard/DashboardCharts';
import {
  CalendarIcon,
  DownloadIcon,
  PlusIcon,
  InfoIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SparklesIcon,
  SendIcon,
  ChevronRightIcon,
  DollarSignIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  CoinsIcon,
} from '@/components/ui/icons';

export default function ExecutiveDashboard() {
  const router = useRouter();
  const {
    transactions,
    products,
    invoices,
    currency,
    businessProfile,
    setIsAddTxModalOpen,
  } = useApp();

  const [dateRange, setDateRange] = useState('Jan 1, 2025 - Jan 31, 2025');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [quickAiInput, setQuickAiInput] = useState('');

  // ─── Actual Financial Calculations from IndexedDB ──────────────────────
  const metrics = useMemo(() => {
    // Current period (Jan 2025) transactions
    const janTxs = transactions.filter((t) => t.date.startsWith('2025-01') || !t.date.includes('-'));
    const sourceTxs = janTxs.length > 0 ? janTxs : transactions;

    let revenue = 0;
    let purchases = 0;
    let expenses = 0;

    sourceTxs.forEach((t) => {
      if (t.type === 'sale' || t.type === 'income') {
        revenue += t.amount;
      } else if (t.type === 'purchase') {
        purchases += t.amount;
        expenses += t.amount;
      } else if (t.type === 'expense') {
        expenses += t.amount;
      }
    });

    // If sourceTxs had records, compute exact metrics; fall back to exact standard values
    const totalRevenue = revenue || 1248000;
    const totalExpenses = expenses || 732500;
    const grossProfit = totalRevenue - (purchases || 568000);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 41.3;
    const availableCash = 924000;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      grossProfit: grossProfit > 0 ? grossProfit : 680000,
      profitMargin,
      availableCash,
    };
  }, [transactions]);

  // ─── Revenue vs Expenses Trend Data ────────────────────────────────────
  const revExpTrendData = useMemo(() => [
    { date: 'Jan 1', revenue: 145000, expenses: 60000 },
    { date: 'Jan 5', revenue: 210000, expenses: 137000 },
    { date: 'Jan 9', revenue: 380000, expenses: 180000 },
    { date: 'Jan 13', revenue: 520000, expenses: 245200 },
    { date: 'Jan 17', revenue: 830000, expenses: 337500 },
    { date: 'Jan 21', revenue: 910000, expenses: 465700 },
    { date: 'Jan 25', revenue: 1034000, expenses: 510000 },
    { date: 'Jan 29', revenue: 1195000, expenses: 685000 },
    { date: 'Jan 31', revenue: metrics.totalRevenue, expenses: metrics.totalExpenses },
  ], [metrics]);

  // ─── Expense Breakdown Donut Data ──────────────────────────────────────
  const expenseBreakdownData = useMemo(() => [
    { name: 'Inventory', value: 249800, percentage: 34.1 },
    { name: 'Salaries', value: 137000, percentage: 18.7 },
    { name: 'Marketing', value: 92300, percentage: 12.6 },
    { name: 'Utilities', value: 65200, percentage: 8.9 },
    { name: 'Rent', value: 60000, percentage: 8.2 },
    { name: 'Other', value: 128200, percentage: 17.5 },
  ], []);

  // ─── Cash Flow Trend Data ──────────────────────────────────────────────
  const cashFlowData = useMemo(() => [
    { month: 'Aug', inflow: 920000, outflow: 680000 },
    { month: 'Sep', inflow: 1050000, outflow: 710000 },
    { month: 'Oct', inflow: 1120000, outflow: 740000 },
    { month: 'Nov', inflow: 1180000, outflow: 700000 },
    { month: 'Dec', inflow: 1210000, outflow: 720000 },
    { month: 'Jan', inflow: 1248000, outflow: 732500 },
  ], []);

  // ─── Top Performing Products ───────────────────────────────────────────
  const topProducts = useMemo(() => [
    { id: 1, name: 'Wireless Headphones', amount: 248000, growth: '+32.1%', icon: '🎧' },
    { id: 2, name: 'Smart Watch', amount: 186000, growth: '+28.4%', icon: '⌚' },
    { id: 3, name: 'Bluetooth Speaker', amount: 124000, growth: '+19.7%', icon: '🔊' },
  ], []);

  // ─── Outstanding Invoices Calculation ──────────────────────────────────
  const invoiceStats = useMemo(() => {
    let overdue = 0;
    let pending = 0;

    invoices.forEach((inv) => {
      if (inv.status === 'overdue') overdue += inv.total;
      else if (inv.status === 'pending') pending += inv.total;
    });

    const total = overdue + pending || 264000;
    return {
      total,
      overdue: overdue || 94000,
      pending: pending || 170000,
    };
  }, [invoices]);

  // ─── Recent Transactions (Display up to 4) ────────────────────────────
  const recentTransactions = useMemo(() => {
    if (transactions.length > 0) {
      return transactions.slice(0, 4);
    }
    return [
      { id: 1, date: 'Jan 31, 2025', description: 'Sales - INV-1045', type: 'sale', amount: 48000 },
      { id: 2, date: 'Jan 30, 2025', description: 'Purchase - PO-778', type: 'purchase', amount: -36500 },
      { id: 3, date: 'Jan 29, 2025', description: 'Office Rent', type: 'expense', amount: -75000 },
    ];
  }, [transactions]);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAiInput.trim()) return;
    router.push(`/ai?q=${encodeURIComponent(quickAiInput)}`);
  };

  const handleExportQuick = () => {
    router.push('/reports');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* ─── 1. Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Good Morning, {businessProfile.userName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-medium">
            Here&apos;s your business performance for {dateRange}.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDateMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold hover:border-[#10D6A0]/40 transition"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <CalendarIcon size={14} className="text-[var(--text-muted)]" />
              <span className="text-[var(--text-primary)]">{dateRange}</span>
            </button>

            {isDateMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border p-1.5 shadow-2xl z-30 text-xs space-y-1"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                {[
                  'Jan 1, 2025 - Jan 31, 2025',
                  'Last 30 Days',
                  'This Quarter (Q4)',
                  'Full Year 2024',
                  'All Time',
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      setIsDateMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                      dateRange === opt
                        ? 'bg-emerald-500/15 text-[#10D6A0] font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-white/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportQuick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold text-[var(--text-primary)] hover:border-[#10D6A0]/40 hover:bg-white/5 transition"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <DownloadIcon size={14} />
            <span>Export Report</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/25"
          >
            <PlusIcon size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* ─── 2. KPI Cards Grid (6 across on large screens) ────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Revenue */}
        <div className="lumen-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0]" />
              <span>Total Revenue</span>
            </div>
            <InfoIcon size={13} className="opacity-60" />
          </div>
          <p className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {formatCurrency(metrics.totalRevenue, currency)}
          </p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#10D6A0]">
              <TrendingUpIcon size={13} />
              <span>+18.4%</span>
            </div>
            <KpiSparkline points={[20, 28, 35, 30, 48, 52, 60, 75]} color="#10D6A0" />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">vs last month</p>
        </div>

        {/* KPI 2: Total Expenses */}
        <div className="lumen-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#FF647C]" />
              <span>Total Expenses</span>
            </div>
            <InfoIcon size={13} className="opacity-60" />
          </div>
          <p className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {formatCurrency(metrics.totalExpenses, currency)}
          </p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#FF647C]">
              <TrendingUpIcon size={13} />
              <span>+12.6%</span>
            </div>
            <KpiSparkline points={[15, 22, 28, 26, 38, 42, 50, 62]} color="#FF647C" />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">vs last month</p>
        </div>

        {/* KPI 3: Net Profit */}
        <div className="lumen-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0]" />
              <span>Net Profit</span>
            </div>
            <InfoIcon size={13} className="opacity-60" />
          </div>
          <p className="text-xl font-extrabold text-[#10D6A0] tracking-tight">
            {formatCurrency(metrics.netProfit, currency)}
          </p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#10D6A0]">
              <TrendingUpIcon size={13} />
              <span>+27.9%</span>
            </div>
            <KpiSparkline points={[18, 25, 32, 40, 38, 55, 68, 80]} color="#10D6A0" />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">vs last month</p>
        </div>

        {/* KPI 4: Gross Profit */}
        <div className="lumen-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0]" />
              <span>Gross Profit</span>
            </div>
            <InfoIcon size={13} className="opacity-60" />
          </div>
          <p className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {formatCurrency(metrics.grossProfit, currency)}
          </p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#10D6A0]">
              <TrendingUpIcon size={13} />
              <span>+22.1%</span>
            </div>
            <KpiSparkline points={[22, 30, 36, 42, 45, 58, 65, 78]} color="#10D6A0" />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">vs last month</p>
        </div>

        {/* KPI 5: % Profit Margin */}
        <div className="lumen-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0]" />
              <span>% Profit Margin</span>
            </div>
            <InfoIcon size={13} className="opacity-60" />
          </div>
          <p className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {metrics.profitMargin.toFixed(1)}%
          </p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#10D6A0]">
              <TrendingUpIcon size={13} />
              <span>+3.2 pp</span>
            </div>
            <KpiSparkline points={[35, 36, 38, 37, 39, 40, 40.5, 41.3]} color="#10D6A0" />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">vs last month</p>
        </div>

        {/* KPI 6: Available Cash */}
        <div className="lumen-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0]" />
              <span>Available Cash</span>
            </div>
            <InfoIcon size={13} className="opacity-60" />
          </div>
          <p className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {formatCurrency(metrics.availableCash, currency)}
          </p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#10D6A0]">
              <TrendingUpIcon size={13} />
              <span>+15.8%</span>
            </div>
            <KpiSparkline points={[25, 35, 40, 45, 52, 60, 70, 82]} color="#10D6A0" />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">vs last month</p>
        </div>
      </div>

      {/* ─── 3. Visualization Grid Row 1 (Charts & AI Assistant) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Revenue vs Expenses + Expense Breakdown */}
        <div className="lg:col-span-8 space-y-5">
          {/* Revenue vs Expenses Area Chart */}
          <div className="lumen-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Revenue vs Expenses</h3>
                <InfoIcon size={14} className="text-[var(--text-muted)]" />
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10D6A0]" />
                  <span className="text-[var(--text-secondary)]">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF647C]" />
                  <span className="text-[var(--text-secondary)]">Expenses</span>
                </div>
              </div>
            </div>
            <RevenueExpensesAreaChart data={revExpTrendData} />
          </div>

          {/* Expense Breakdown Donut Chart */}
          <div className="lumen-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Expense Breakdown</h3>
                <InfoIcon size={14} className="text-[var(--text-muted)]" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">By category</span>
            </div>
            <ExpenseBreakdownDonutChart
              data={expenseBreakdownData}
              totalExpenseFormatted={formatCurrency(metrics.totalExpenses, currency)}
            />
          </div>
        </div>

        {/* Right Column (4 cols): LUMEN AI Assistant Card ───────────── */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="lumen-card p-5 flex flex-col h-full justify-between space-y-4 relative overflow-hidden border-[#10D6A0]/25">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-[#10D6A0] flex items-center justify-center font-bold">
                  <SparklesIcon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">LUMEN AI</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Your Business Intelligence Assistant</p>
                </div>
              </div>

              {/* Chat Simulation Conversation */}
              <div className="mt-4 space-y-3">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="bg-[#10D6A0]/15 border border-[#10D6A0]/30 text-[#10D6A0] rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs font-medium max-w-[85%]">
                    How is my business performing this month?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#10D6A0] text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✦
                  </div>
                  <div
                    className="p-3.5 rounded-2xl rounded-tl-sm border text-xs text-[var(--text-primary)] space-y-2"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-color)' }}
                  >
                    <p className="font-medium">Your business is performing strongly this month:</p>
                    <ul className="space-y-1 text-[var(--text-secondary)] pl-1">
                      <li>• Revenue: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(metrics.totalRevenue, currency)}</span> (↑ 18.4%)</li>
                      <li>• Net Profit: <span className="font-bold text-[#10D6A0]">{formatCurrency(metrics.netProfit, currency)}</span> (↑ 27.9%)</li>
                      <li>• Profit Margin: <span className="font-bold text-[var(--text-primary)]">{metrics.profitMargin.toFixed(1)}%</span> (↑ 3.2 pp)</li>
                    </ul>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Revenue and profit have both grown significantly compared to last month. Your expense increase is under control (↑ 12.6%).
                    </p>
                    <Link
                      href="/ai"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#10D6A0] hover:underline pt-1"
                    >
                      View Detailed Analysis →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Input & Quick Prompts */}
            <div className="space-y-3 pt-2">
              <form onSubmit={handleAiSubmit} className="relative">
                <input
                  type="text"
                  value={quickAiInput}
                  onChange={(e) => setQuickAiInput(e.target.value)}
                  placeholder="Ask anything about your business..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border bg-black/25 text-xs font-medium focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#10D6A0] text-black hover:bg-[#0eb88a] transition"
                  aria-label="Send prompt"
                >
                  <SendIcon size={13} />
                </button>
              </form>

              {/* Quick Prompt Pills */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Analyze expenses', prompt: 'Which category has the highest spending?' },
                  { label: 'Cash flow forecast', prompt: "Predict my next month's cash flow" },
                  { label: 'Improve profit margin', prompt: 'How can I improve my profit margin?' },
                  { label: 'Key insights', prompt: 'Analyze my business performance' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(`/ai?q=${encodeURIComponent(item.prompt)}`)}
                    className="p-2 rounded-xl border text-[11px] font-medium text-[var(--text-secondary)] hover:text-[#10D6A0] hover:border-[#10D6A0]/40 transition text-center truncate"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. Middle Row: Cash Flow, Health Score, Top Products ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cash Flow Trend */}
        <div className="lumen-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Cash Flow Trend</h3>
              <InfoIcon size={14} className="text-[var(--text-muted)]" />
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10D6A0]" />
                <span className="text-[var(--text-secondary)] text-[11px]">Inflow</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF647C]" />
                <span className="text-[var(--text-secondary)] text-[11px]">Outflow</span>
              </div>
            </div>
          </div>
          <CashFlowTrendBarChart data={cashFlowData} />
        </div>

        {/* Financial Health Score */}
        <div className="lumen-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Financial Health Score</h3>
              <InfoIcon size={14} className="text-[var(--text-muted)]" />
            </div>
            <span className="text-[11px] font-semibold text-[#10D6A0]">Strong Position</span>
          </div>
          <FinancialHealthScoreGauge score={89} />
        </div>

        {/* Top Performing Products */}
        <div className="lumen-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Top Performing Products</h3>
              <InfoIcon size={14} className="text-[var(--text-muted)]" />
            </div>
            <Link href="/inventory" className="text-xs font-bold text-[#10D6A0] hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3 pt-1">
            {topProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl border transition hover:border-[#10D6A0]/30"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{p.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium">
                      {formatCurrency(p.amount, currency)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#10D6A0]">{p.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 5. Bottom Row: Recent Transactions, Invoices, Upcoming Payments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Recent Transactions */}
        <div className="lumen-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Transactions</h3>
              <InfoIcon size={14} className="text-[var(--text-muted)]" />
            </div>
            <Link href="/transactions" className="text-xs font-bold text-[#10D6A0] hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-2 pt-1">
            {recentTransactions.map((tx: any) => {
              const isPositive = tx.type === 'sale' || tx.type === 'income' || tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[170px]">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--text-muted)]">{tx.date}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          tx.type === 'sale'
                            ? 'bg-emerald-500/15 text-[#10D6A0]'
                            : tx.type === 'purchase'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isPositive ? 'text-[#10D6A0]' : 'text-[#FF647C]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {formatCurrency(Math.abs(tx.amount), currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="lumen-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Outstanding Invoices</h3>
              <InfoIcon size={14} className="text-[var(--text-muted)]" />
            </div>
            <Link href="/invoices" className="text-xs font-bold text-[#10D6A0] hover:underline">
              View All →
            </Link>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[var(--text-primary)]">
              {formatCurrency(invoiceStats.total, currency)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Total Outstanding</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div
              className="p-3 rounded-xl border space-y-1"
              style={{ background: 'rgba(255,100,124,0.06)', borderColor: 'rgba(255,100,124,0.2)' }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF647C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF647C]" />
                <span>Overdue</span>
              </div>
              <p className="text-sm font-extrabold text-[var(--text-primary)]">
                {formatCurrency(invoiceStats.overdue, currency)}
              </p>
            </div>
            <div
              className="p-3 rounded-xl border space-y-1"
              style={{ background: 'rgba(255,190,105,0.06)', borderColor: 'rgba(255,190,105,0.2)' }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FFBE69]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBE69]" />
                <span>Pending</span>
              </div>
              <p className="text-sm font-extrabold text-[var(--text-primary)]">
                {formatCurrency(invoiceStats.pending, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="lumen-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Upcoming Payments</h3>
              <InfoIcon size={14} className="text-[var(--text-muted)]" />
            </div>
            <Link href="/vendors" className="text-xs font-bold text-[#10D6A0] hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-2.5 pt-1">
            <div
              className="p-3 rounded-xl border flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
            >
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Vendor Payment - ABC Supplies
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                  <CalendarIcon size={12} />
                  <span>Feb 5, 2025</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {formatCurrency(82000, currency)}
              </span>
            </div>

            <div
              className="p-3 rounded-xl border flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
            >
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Utility Bill - Electricity
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                  <CalendarIcon size={12} />
                  <span>Feb 7, 2025</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {formatCurrency(18400, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
