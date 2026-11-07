'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import {
  CoinsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
} from '@/components/ui/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function CashFlowPage() {
  const { transactions, currency } = useApp();
  const [forecastScenario, setForecastScenario] = useState<'base' | 'optimistic' | 'conservative'>('base');

  // Core actual cash flow metrics
  const openingBalance = 924000;
  const cashInflows = 1248000;
  const cashOutflows = 732500;
  const netOperatingCash = cashInflows - cashOutflows; // +₹5,15,500
  const closingBalance = openingBalance + netOperatingCash; // ₹14,39,500
  const outstandingReceivables = 264000;
  const outstandingPayables = 100400;

  // 6 Months Historical Actuals + 3 Months Forward Forecast
  const timelineData = useMemo(() => {
    const multiplier = forecastScenario === 'optimistic' ? 1.12 : forecastScenario === 'conservative' ? 0.92 : 1.0;

    return [
      { month: 'Aug', inflow: 920000, outflow: 680000, net: 240000, isProjected: false },
      { month: 'Sep', inflow: 1050000, outflow: 710000, net: 340000, isProjected: false },
      { month: 'Oct', inflow: 1120000, outflow: 740000, net: 380000, isProjected: false },
      { month: 'Nov', inflow: 1180000, outflow: 700000, net: 480000, isProjected: false },
      { month: 'Dec', inflow: 1210000, outflow: 720000, net: 490000, isProjected: false },
      { month: 'Jan', inflow: 1248000, outflow: 732500, net: 515500, isProjected: false },
      // Projected months
      { month: 'Feb (Est)', inflow: Math.round(1280000 * multiplier), outflow: Math.round(740000 * multiplier), net: Math.round(540000 * multiplier), isProjected: true },
      { month: 'Mar (Est)', inflow: Math.round(1340000 * multiplier), outflow: Math.round(760000 * multiplier), net: Math.round(580000 * multiplier), isProjected: true },
      { month: 'Apr (Est)', inflow: Math.round(1410000 * multiplier), outflow: Math.round(785000 * multiplier), net: Math.round(625000 * multiplier), isProjected: true },
    ];
  }, [forecastScenario]);

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Cash Flow Management & Runway
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Monitor liquidity reserves, operating cash generation, and 3-month forward runway projections.
          </p>
        </div>

        {/* Scenario Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <span className="text-[11px] font-semibold text-[var(--text-muted)] pl-2">Forecast Model:</span>
          {(['conservative', 'base', 'optimistic'] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => setForecastScenario(sc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                forecastScenario === sc
                  ? 'bg-[#10D6A0] text-black font-bold'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="lumen-card p-3.5 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Opening Balance</p>
          <p className="text-base font-extrabold text-[var(--text-primary)]">{formatCurrency(openingBalance, currency)}</p>
          <p className="text-[10px] text-[var(--text-muted)]">Jan 1, 2025</p>
        </div>

        <div className="lumen-card p-3.5 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Cash Inflows</p>
          <p className="text-base font-extrabold text-[#10D6A0]">+{formatCurrency(cashInflows, currency)}</p>
          <p className="text-[10px] text-emerald-400 font-semibold">↑ +18.4% growth</p>
        </div>

        <div className="lumen-card p-3.5 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Cash Outflows</p>
          <p className="text-base font-extrabold text-[#FF647C]">-{formatCurrency(cashOutflows, currency)}</p>
          <p className="text-[10px] text-rose-400 font-semibold">Procurement & Opex</p>
        </div>

        <div className="lumen-card p-3.5 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Net Operating Cash</p>
          <p className="text-base font-extrabold text-[#10D6A0]">+{formatCurrency(netOperatingCash, currency)}</p>
          <p className="text-[10px] text-[var(--text-muted)]">Free cash generated</p>
        </div>

        <div className="lumen-card p-3.5 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Closing Balance</p>
          <p className="text-base font-extrabold text-[var(--text-primary)]">{formatCurrency(closingBalance, currency)}</p>
          <p className="text-[10px] text-[var(--text-muted)]">Jan 31, 2025</p>
        </div>

        <div className="lumen-card p-3.5 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Receivables (Inbound)</p>
          <p className="text-base font-extrabold text-[#55B8FF]">{formatCurrency(outstandingReceivables, currency)}</p>
          <p className="text-[10px] text-blue-400 font-semibold">Uncollected invoices</p>
        </div>

        <div className="lumen-card p-3.5 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Payables (Committed)</p>
          <p className="text-base font-extrabold text-[#FFBE69]">{formatCurrency(outstandingPayables, currency)}</p>
          <p className="text-[10px] text-amber-400 font-semibold">Trade obligations</p>
        </div>
      </div>

      {/* Main Cash Flow Historical vs Forecast Chart */}
      <div className="lumen-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Cash Flow Trend & 3-Month Projection
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Historical performance (Aug – Jan) clearly distinguished from forward projection (Feb – Apr).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10D6A0]" />
              <span className="text-[var(--text-secondary)]">Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF647C]" />
              <span className="text-[var(--text-secondary)]">Outflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                Dashed = Projected
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#8793A5" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#8793A5"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="p-3 rounded-xl border text-xs shadow-2xl space-y-1.5 bg-[#111C2D] border-white/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">{label}</span>
                        {item.isProjected && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400">
                            Forecast
                          </span>
                        )}
                      </div>
                      <p className="text-[#10D6A0]">Inflow: {formatCurrency(item.inflow, currency)}</p>
                      <p className="text-[#FF647C]">Outflow: {formatCurrency(item.outflow, currency)}</p>
                      <p className="text-white font-bold border-t border-white/10 pt-1">
                        Net: +{formatCurrency(item.net, currency)}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="inflow" name="Inflow" fill="#10D6A0" radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="outflow" name="Outflow" fill="#FF647C" radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Statement Breakdown Table */}
      <div className="lumen-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Monthly Cash Flow Statement Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Inflows (Sales)</th>
                <th className="py-2.5 px-3 text-right">Outflows (Opex + Proc)</th>
                <th className="py-2.5 px-3 text-right">Net Free Cash</th>
                <th className="py-2.5 px-3 text-right">Estimated Cash Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {timelineData.map((d, idx) => {
                const cumulativeClosing = openingBalance + timelineData.slice(0, idx + 1).reduce((s, x) => s + x.net, 0);
                return (
                  <tr key={d.month} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 font-bold">{d.month}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          d.isProjected ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-[#10D6A0]'
                        }`}
                      >
                        {d.isProjected ? 'Projected' : 'Actual'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#10D6A0]">
                      +{formatCurrency(d.inflow, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#FF647C]">
                      -{formatCurrency(d.outflow, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#10D6A0]">
                      +{formatCurrency(d.net, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-[var(--text-primary)]">
                      {formatCurrency(cumulativeClosing, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
