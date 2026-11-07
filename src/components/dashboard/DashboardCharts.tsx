'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/currencies';
import { useApp } from '@/context/AppContext';
import { CheckCircle2Icon } from '@/components/ui/icons';

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="p-3 rounded-xl border text-xs shadow-2xl space-y-1.5"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        minWidth: 150,
      }}
    >
      <p className="font-bold text-[var(--text-primary)]">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-[var(--text-secondary)]">{p.name}:</span>
          </div>
          <span className="font-semibold text-[var(--text-primary)]">
            {formatCurrency(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 1. Revenue vs Expenses Smooth Area Chart ──────────────────────────────
export function RevenueExpensesAreaChart({ data }: { data: any[] }) {
  const { currency } = useApp();

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10D6A0" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10D6A0" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF647C" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#FF647C" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="#8793A5"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          />
          <YAxis
            stroke="#8793A5"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickFormatter={(val) => {
              if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
              if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
              return `₹${val}`;
            }}
          />
          <Tooltip content={<CustomChartTooltip currency={currency} />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10D6A0"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#FF647C"
            strokeWidth={2.5}
            fill="url(#expenseGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 2. Expense Breakdown Donut Chart ──────────────────────────────────────
const EXPENSE_COLORS = ['#10D6A0', '#55B8FF', '#9353D3', '#F5A524', '#F31260', '#71717A'];

export function ExpenseBreakdownDonutChart({
  data,
  totalExpenseFormatted,
}: {
  data: Array<{ name: string; value: number; percentage: number }>;
  totalExpenseFormatted: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-64">
      {/* Donut with centered text */}
      <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">
            {totalExpenseFormatted}
          </p>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">Total Expenses</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-1.5 pr-2">
        {data.map((cat, idx) => (
          <div key={cat.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }}
              />
              <span className="text-[var(--text-secondary)]">{cat.name}</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)]">
              {cat.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Cash Flow Bar Chart ────────────────────────────────────────────────
export function CashFlowTrendBarChart({ data }: { data: any[] }) {
  const { currency } = useApp();

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            stroke="#8793A5"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          />
          <YAxis
            stroke="#8793A5"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickFormatter={(val) => {
              if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
              return `₹${val}`;
            }}
          />
          <Tooltip content={<CustomChartTooltip currency={currency} />} />
          <Bar dataKey="inflow" name="Inflow" fill="#10D6A0" radius={[4, 4, 0, 0]} maxBarSize={16} />
          <Bar dataKey="outflow" name="Outflow" fill="#FF647C" radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 4. Financial Health Score Ring Gauge ───────────────────────────────────
export function FinancialHealthScoreGauge({ score = 89 }: { score?: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-2">
      {/* Circular Gauge */}
      <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="9"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#10D6A0"
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {score}<span className="text-xs font-semibold text-[var(--text-muted)]">/100</span>
          </span>
          <span className="text-[11px] font-bold text-[#10D6A0]">Excellent</span>
        </div>
      </div>

      {/* Checklist Indicators */}
      <div className="space-y-2 flex-1">
        {[
          'Strong profitability',
          'Healthy cash flow',
          'Controlled expenses',
          'Good liquidity',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <CheckCircle2Icon size={15} className="text-[#10D6A0] flex-shrink-0" />
            <span className="font-medium text-[var(--text-primary)]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Miniature Sparkline for KPI Cards ──────────────────────────────────
export function KpiSparkline({
  points = [20, 30, 25, 45, 40, 60, 55, 75],
  color = '#10D6A0',
}: {
  points?: number[];
  color?: string;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const path = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
