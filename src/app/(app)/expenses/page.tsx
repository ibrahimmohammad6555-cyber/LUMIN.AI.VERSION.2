'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import {
  ReceiptIcon,
  PlusIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
  CalendarIcon,
  DollarSignIcon,
} from '@/components/ui/icons';

interface BudgetCategory {
  category: string;
  budgetLimit: number;
  spent: number;
}

const DEFAULT_BUDGETS: Record<string, number> = {
  Inventory: 260000,
  Salaries: 140000,
  Marketing: 100000,
  Utilities: 70000,
  Rent: 60000,
  Other: 130000,
};

export default function ExpensesPage() {
  const { transactions, addTransaction, currency, setIsAddTxModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter only expense transactions
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense' || t.type === 'purchase');
  }, [transactions]);

  // Aggregate Category Spending & Budget Utilization
  const budgetData = useMemo<BudgetCategory[]>(() => {
    const spending: Record<string, number> = {
      Inventory: 0,
      Salaries: 0,
      Marketing: 0,
      Utilities: 0,
      Rent: 0,
      Other: 0,
    };

    expenseTransactions.forEach((t) => {
      const cat = t.category || (t.type === 'purchase' ? 'Inventory' : 'Other');
      if (spending[cat] !== undefined) {
        spending[cat] += t.amount;
      } else {
        spending['Other'] += t.amount;
      }
    });

    return Object.keys(DEFAULT_BUDGETS).map((cat) => ({
      category: cat,
      budgetLimit: DEFAULT_BUDGETS[cat],
      spent: spending[cat] || 0,
    }));
  }, [expenseTransactions]);

  const totalSpent = useMemo(() => {
    return budgetData.reduce((acc, curr) => acc + curr.spent, 0);
  }, [budgetData]);

  const totalBudget = useMemo(() => {
    return Object.values(DEFAULT_BUDGETS).reduce((acc, curr) => acc + curr, 0);
  }, []);

  const overallUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Recurring Expenses definitions
  const recurringExpenses = [
    { title: 'Commercial Office Rent', amount: 60000, frequency: 'Monthly', nextDue: 'Feb 3, 2025', vendor: 'Corporate Space Realty' },
    { title: 'Core Staff Monthly Payroll', amount: 137000, frequency: 'Monthly', nextDue: 'Feb 5, 2025', vendor: 'Internal Payroll' },
    { title: 'Enterprise Cloud & Broadband', amount: 8900, frequency: 'Monthly', nextDue: 'Feb 10, 2025', vendor: 'Tata Tele & AWS' },
    { title: 'Commercial General Liability Insurance', amount: 45000, frequency: 'Annual', nextDue: 'Mar 15, 2025', vendor: 'HDFC ERGO' },
  ];

  const filteredTransactions = useMemo(() => {
    return expenseTransactions.filter((t) => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mDesc = (t.description || '').toLowerCase().includes(q);
        const mCat = (t.category || '').toLowerCase().includes(q);
        const mRef = (t.referenceNo || '').toLowerCase().includes(q);
        if (!mDesc && !mCat && !mRef) return false;
      }
      return true;
    });
  }, [expenseTransactions, selectedCategory, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Expense Management & Budgets
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Track operational burn, departmental monthly budgets, and recurring subscription liabilities.
          </p>
        </div>

        <button
          onClick={() => setIsAddTxModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#FF647C] hover:bg-[#e0536a] text-white transition shadow-lg shadow-rose-500/20"
        >
          <PlusIcon size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Top Utilization KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="lumen-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Total Monthly Expenses</span>
            <ReceiptIcon size={16} />
          </div>
          <p className="text-2xl font-black text-[#FF647C]">{formatCurrency(totalSpent, currency)}</p>
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <span>Overall budget: {formatCurrency(totalBudget, currency)}</span>
          </div>
        </div>

        <div className="lumen-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Budget Utilization</span>
            <AlertCircleIcon size={16} className={overallUtilization > 90 ? 'text-[#FF647C]' : 'text-[#10D6A0]'} />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">{overallUtilization.toFixed(1)}%</p>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallUtilization > 95 ? 'bg-[#FF647C]' : overallUtilization > 80 ? 'bg-[#FFBE69]' : 'bg-[#10D6A0]'
              }`}
              style={{ width: `${Math.min(100, overallUtilization)}%` }}
            />
          </div>
        </div>

        <div className="lumen-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Daily Burn Rate (Average)</span>
            <TrendingUpIcon size={16} className="text-[#55B8FF]" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">
            {formatCurrency(totalSpent / 31, currency)} / day
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Controlled run rate</p>
        </div>
      </div>

      {/* Monthly Category Budgets with Utilization Bars */}
      <div className="lumen-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Departmental Budget Utilization</h3>
            <p className="text-xs text-[var(--text-muted)]">Spending thresholds monitored against allocated targets</p>
          </div>
          <span className="text-xs font-semibold text-[#10D6A0]">Current Cycle: Jan 2025</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetData.map((item) => {
            const pct = item.budgetLimit > 0 ? (item.spent / item.budgetLimit) * 100 : 0;
            const isOver = pct >= 100;
            const isWarning = pct >= 80 && !isOver;

            return (
              <div
                key={item.category}
                className="p-4 rounded-xl border space-y-2.5 transition hover:border-[#10D6A0]/30"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">{item.category}</span>
                  <span
                    className={`font-mono font-bold ${
                      isOver ? 'text-[#FF647C]' : isWarning ? 'text-[#FFBE69]' : 'text-[#10D6A0]'
                    }`}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-[#FF647C]' : isWarning ? 'bg-[#FFBE69]' : 'bg-[#10D6A0]'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Spent: {formatCurrency(item.spent, currency)}</span>
                  <span>Limit: {formatCurrency(item.budgetLimit, currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Scheduled Expenses */}
      <div className="lumen-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Recurring Subscriptions & Fixed Overhead</h3>
            <p className="text-xs text-[var(--text-muted)]">Automated projections of standing liabilities</p>
          </div>
          <span className="text-xs text-[var(--text-muted)]">4 standing commitments</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recurringExpenses.map((rec) => (
            <div
              key={rec.title}
              className="p-3.5 rounded-xl border space-y-2"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                  {rec.frequency}
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">{rec.nextDue}</span>
              </div>
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{rec.title}</p>
              <p className="text-base font-extrabold text-[var(--text-primary)]">{formatCurrency(rec.amount, currency)}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">Payee: {rec.vendor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Ledger Table */}
      <div className="lumen-card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex-1 min-w-[200px] relative">
            <SearchIcon size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter expenses by description or category…"
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)] focus:outline-none"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <option value="all">All Categories</option>
            {Object.keys(DEFAULT_BUDGETS).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference / Invoice</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-mono text-[var(--text-muted)]">{tx.date}</td>
                  <td className="py-3 px-4 font-semibold">{tx.description}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{tx.category}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{tx.paymentMethod}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">
                    {tx.referenceNo || tx.invoiceNo || '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-[#FF647C]">
                    -{formatCurrency(tx.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
