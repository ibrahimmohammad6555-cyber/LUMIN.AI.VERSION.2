'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import {
  CalculatorIcon,
  CopyIcon,
  CheckIcon,
  DollarSignIcon,
  TrendingUpIcon,
  PercentIcon,
  ReceiptIcon,
  CoinsIcon,
} from '@/components/ui/icons';

type CalculatorTab =
  | 'profit'
  | 'profit-margin'
  | 'markup'
  | 'gst'
  | 'discount'
  | 'break-even'
  | 'cash-flow'
  | 'product-pricing';

export default function CalculatorsPage() {
  const { currency } = useApp();
  const [activeTab, setActiveTab] = useState<CalculatorTab>('profit');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ─── 1. Profit Calculator ───────────────────────────────────────────────
  const [pRev, setPRev] = useState<number>(1248000);
  const [pCogs, setPCogs] = useState<number>(568000);
  const [pOpex, setPOpex] = useState<number>(164500);
  const pGrossProfit = pRev - pCogs;
  const pNetProfit = pGrossProfit - pOpex;
  const pGrossMargin = pRev > 0 ? (pGrossProfit / pRev) * 100 : 0;
  const pNetMargin = pRev > 0 ? (pNetProfit / pRev) * 100 : 0;

  // ─── 2. Profit Margin Calculator ─────────────────────────────────────────
  const [pmCost, setPmCost] = useState<number>(2200);
  const [pmPrice, setPmPrice] = useState<number>(3800);
  const pmProfit = pmPrice - pmCost;
  const pmMarginPct = pmPrice > 0 ? (pmProfit / pmPrice) * 100 : 0;
  const pmMarkupPct = pmCost > 0 ? (pmProfit / pmCost) * 100 : 0;

  // ─── 3. Markup Calculator ───────────────────────────────────────────────
  const [muCost, setMuCost] = useState<number>(2800);
  const [muMarkupPct, setMuMarkupPct] = useState<number>(71.4);
  const muSellingPrice = muCost * (1 + muMarkupPct / 100);
  const muProfit = muSellingPrice - muCost;

  // ─── 4. GST Calculator ──────────────────────────────────────────────────
  const [gstAmount, setGstAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstMode, setGstMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  let gstBase = gstAmount;
  let gstTax = 0;
  let gstTotal = gstAmount;
  if (gstMode === 'exclusive') {
    gstBase = gstAmount;
    gstTax = (gstAmount * gstRate) / 100;
    gstTotal = gstAmount + gstTax;
  } else {
    gstBase = gstAmount / (1 + gstRate / 100);
    gstTax = gstAmount - gstBase;
    gstTotal = gstAmount;
  }
  const gstCgst = gstTax / 2;
  const gstSgst = gstTax / 2;

  // ─── 5. Discount Calculator ─────────────────────────────────────────────
  const [discOriginal, setDiscOriginal] = useState<number>(3800);
  const [discPercent, setDiscPercent] = useState<number>(15);
  const discSavings = (discOriginal * discPercent) / 100;
  const discFinal = Math.max(0, discOriginal - discSavings);

  // ─── 6. Break-Even Calculator ───────────────────────────────────────────
  const [beFixedCost, setBeFixedCost] = useState<number>(85000);
  const [bePricePerUnit, setBePricePerUnit] = useState<number>(500);
  const [beVarCostPerUnit, setBeVarCostPerUnit] = useState<number>(220);
  const beContribMargin = bePricePerUnit - beVarCostPerUnit;
  const beUnits = beContribMargin > 0 ? Math.ceil(beFixedCost / beContribMargin) : 0;
  const beRevenue = beUnits * bePricePerUnit;
  const beMarginRatio = bePricePerUnit > 0 ? (beContribMargin / bePricePerUnit) * 100 : 0;

  // ─── 7. Cash Flow Calculator ────────────────────────────────────────────
  const [cfStarting, setCfStarting] = useState<number>(924000);
  const [cfOperatingIn, setCfOperatingIn] = useState<number>(1248000);
  const [cfOperatingOut, setCfOperatingOut] = useState<number>(732500);
  const [cfFinancing, setCfFinancing] = useState<number>(0);
  const cfNetChange = cfOperatingIn - cfOperatingOut + cfFinancing;
  const cfEnding = cfStarting + cfNetChange;

  // ─── 8. Product Pricing Calculator ──────────────────────────────────────
  const [ppProduction, setPpProduction] = useState<number>(1400);
  const [ppShipping, setPpShipping] = useState<number>(200);
  const [ppOverheads, setPpOverheads] = useState<number>(300);
  const [ppTargetMargin, setPpTargetMargin] = useState<number>(45);
  const ppTotalCost = ppProduction + ppShipping + ppOverheads;
  const ppSuggestedPrice = ppTargetMargin < 100 ? ppTotalCost / (1 - ppTargetMargin / 100) : ppTotalCost;
  const ppUnitProfit = ppSuggestedPrice - ppTotalCost;

  const CALCULATORS: Array<{ id: CalculatorTab; name: string; subtitle: string }> = [
    { id: 'profit', name: '1. Profit Calculator', subtitle: 'Gross & Net Profit from Revenues' },
    { id: 'profit-margin', name: '2. Profit Margin Calculator', subtitle: 'Margin % & Markup % ratios' },
    { id: 'markup', name: '3. Markup Calculator', subtitle: 'Target selling price from markup' },
    { id: 'gst', name: '4. GST Calculator', subtitle: 'CGST, SGST, inclusive & exclusive' },
    { id: 'discount', name: '5. Discount Calculator', subtitle: 'Promotional savings & discounted price' },
    { id: 'break-even', name: '6. Break-Even Calculator', subtitle: 'Zero-profit production thresholds' },
    { id: 'cash-flow', name: '7. Cash Flow Calculator', subtitle: 'Liquidity & operational net additions' },
    { id: 'product-pricing', name: '8. Product Pricing Calculator', subtitle: 'Target retail price from cost basis' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Financial Calculator Center
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Eight interactive commercial financial calculators with step-by-step formulas, explanations, and instant clipboard export.
        </p>
      </div>

      {/* Tabs Horizontal List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CALCULATORS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              activeTab === tab.id
                ? 'bg-[#10D6A0] text-black border-[#10D6A0] font-bold shadow-md shadow-emerald-500/20'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Calculator Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-6 lumen-card p-6 space-y-5">
          {activeTab === 'profit' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                Profit Calculator Parameters
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Gross Revenue ({currency})</label>
                <input
                  type="number"
                  value={pRev}
                  onChange={(e) => setPRev(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Cost of Goods Sold - COGS ({currency})</label>
                <input
                  type="number"
                  value={pCogs}
                  onChange={(e) => setPCogs(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Operating Expenses - OPEX ({currency})</label>
                <input
                  type="number"
                  value={pOpex}
                  onChange={(e) => setPOpex(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'profit-margin' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                Profit Margin Parameters
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Unit Cost Price ({currency})</label>
                <input
                  type="number"
                  value={pmCost}
                  onChange={(e) => setPmCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Unit Selling Price ({currency})</label>
                <input
                  type="number"
                  value={pmPrice}
                  onChange={(e) => setPmPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'markup' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                Markup Parameters
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Item Cost ({currency})</label>
                <input
                  type="number"
                  value={muCost}
                  onChange={(e) => setMuCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Markup Percentage (%)</label>
                <input
                  type="number"
                  value={muMarkupPct}
                  onChange={(e) => setMuMarkupPct(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                GST Calculation Parameters
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Transaction Base Amount ({currency})</label>
                <input
                  type="number"
                  value={gstAmount}
                  onChange={(e) => setGstAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">GST Tax Slab</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Essential Goods)</option>
                    <option value={12}>12% (Standard Concessional)</option>
                    <option value={18}>18% (Standard Services & Tech)</option>
                    <option value={28}>28% (Luxury / Automobiles)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Calculation Mode</label>
                  <div className="flex rounded-xl p-1 border" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setGstMode('exclusive')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                        gstMode === 'exclusive' ? 'bg-[#10D6A0] text-black font-bold' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      Exclusive
                    </button>
                    <button
                      type="button"
                      onClick={() => setGstMode('inclusive')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                        gstMode === 'inclusive' ? 'bg-[#10D6A0] text-black font-bold' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      Inclusive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discount' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                Discount Parameters
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Original Price ({currency})</label>
                <input
                  type="number"
                  value={discOriginal}
                  onChange={(e) => setDiscOriginal(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Discount Rate (%)</label>
                <input
                  type="number"
                  value={discPercent}
                  onChange={(e) => setDiscPercent(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'break-even' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                Break-Even Parameters
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Total Fixed Costs ({currency})</label>
                <input
                  type="number"
                  value={beFixedCost}
                  onChange={(e) => setBeFixedCost(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Selling Price Per Unit ({currency})</label>
                  <input
                    type="number"
                    value={bePricePerUnit}
                    onChange={(e) => setBePricePerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Variable Cost Per Unit ({currency})</label>
                  <input
                    type="number"
                    value={beVarCostPerUnit}
                    onChange={(e) => setBeVarCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cash-flow' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                Cash Flow Parameters
              </h2>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Beginning Cash Balance ({currency})</label>
                <input
                  type="number"
                  value={cfStarting}
                  onChange={(e) => setCfStarting(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Operating Inflows ({currency})</label>
                  <input
                    type="number"
                    value={cfOperatingIn}
                    onChange={(e) => setCfOperatingIn(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Operating Outflows ({currency})</label>
                  <input
                    type="number"
                    value={cfOperatingOut}
                    onChange={(e) => setCfOperatingOut(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'product-pricing' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                Product Pricing Model
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Production Cost</label>
                  <input
                    type="number"
                    value={ppProduction}
                    onChange={(e) => setPpProduction(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Shipping & Handling</label>
                  <input
                    type="number"
                    value={ppShipping}
                    onChange={(e) => setPpShipping(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Overhead Allocation</label>
                  <input
                    type="number"
                    value={ppOverheads}
                    onChange={(e) => setPpOverheads(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Profit Margin (%)</label>
                <input
                  type="number"
                  value={ppTargetMargin}
                  onChange={(e) => setPpTargetMargin(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Output Results, Formulas, and Explanations */}
        <div className="lg:col-span-6 lumen-card p-6 space-y-5 border-[#10D6A0]/25">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Calculation Results & Formulas</h3>
              <p className="text-xs text-[var(--text-muted)]">Instant commercial mathematical breakdown</p>
            </div>
            <button
              onClick={() => {
                let copyText = '';
                if (activeTab === 'profit') copyText = `Gross Profit: ${formatCurrency(pGrossProfit, currency)}, Net Profit: ${formatCurrency(pNetProfit, currency)}, Margin: ${pNetMargin.toFixed(1)}%`;
                else if (activeTab === 'profit-margin') copyText = `Margin: ${pmMarginPct.toFixed(1)}%, Markup: ${pmMarkupPct.toFixed(1)}%`;
                else if (activeTab === 'markup') copyText = `Selling Price: ${formatCurrency(muSellingPrice, currency)}, Unit Profit: ${formatCurrency(muProfit, currency)}`;
                else if (activeTab === 'gst') copyText = `GST Tax: ${formatCurrency(gstTax, currency)}, Total: ${formatCurrency(gstTotal, currency)}`;
                else if (activeTab === 'discount') copyText = `Final Price: ${formatCurrency(discFinal, currency)}, Savings: ${formatCurrency(discSavings, currency)}`;
                else if (activeTab === 'break-even') copyText = `Break-Even Units: ${beUnits}, Break-Even Revenue: ${formatCurrency(beRevenue, currency)}`;
                else if (activeTab === 'cash-flow') copyText = `Ending Cash: ${formatCurrency(cfEnding, currency)}, Net Change: ${formatCurrency(cfNetChange, currency)}`;
                else copyText = `Suggested Retail Price: ${formatCurrency(ppSuggestedPrice, currency)}, Unit Profit: ${formatCurrency(ppUnitProfit, currency)}`;
                copyToClipboard(copyText, activeTab);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:border-[#10D6A0] hover:text-[#10D6A0] transition"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {copiedKey === activeTab ? <CheckIcon size={14} className="text-[#10D6A0]" /> : <CopyIcon size={14} />}
              <span>{copiedKey === activeTab ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>

          {/* Results Display */}
          {activeTab === 'profit' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Gross Profit</p>
                  <p className="text-xl font-extrabold text-[var(--text-primary)]">{formatCurrency(pGrossProfit, currency)}</p>
                  <p className="text-[10px] text-[#10D6A0] font-semibold">{pGrossMargin.toFixed(1)}% Gross Margin</p>
                </div>
                <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Net Operating Profit</p>
                  <p className="text-xl font-extrabold text-[#10D6A0]">{formatCurrency(pNetProfit, currency)}</p>
                  <p className="text-[10px] text-[#10D6A0] font-semibold">{pNetMargin.toFixed(1)}% Net Margin</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border text-xs text-[var(--text-secondary)] space-y-1" style={{ background: 'black/20', borderColor: 'var(--border-color)' }}>
                <p className="font-bold text-[var(--text-primary)]">Formulas Used:</p>
                <p>• Gross Profit = Revenue - COGS</p>
                <p>• Net Profit = Gross Profit - Operating Expenses (OPEX)</p>
                <p>• Net Margin = (Net Profit / Revenue) × 100</p>
              </div>
            </div>
          )}

          {activeTab === 'profit-margin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Profit Margin %</p>
                  <p className="text-2xl font-black text-[#10D6A0]">{pmMarginPct.toFixed(1)}%</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Of Selling Price</p>
                </div>
                <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(85,184,255,0.05)', borderColor: 'rgba(85,184,255,0.2)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Markup Percentage %</p>
                  <p className="text-2xl font-black text-[#55B8FF]">{pmMarkupPct.toFixed(1)}%</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Over Base Cost</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Unit Profit: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(pmProfit, currency)}</span> per item sold.
              </p>
            </div>
          )}

          {activeTab === 'markup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                <p className="text-[11px] text-[var(--text-muted)]">Recommended Selling Price</p>
                <p className="text-3xl font-black text-[#10D6A0]">{formatCurrency(muSellingPrice, currency)}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Generates <span className="font-bold text-[var(--text-primary)]">{formatCurrency(muProfit, currency)}</span> in gross profit.
                </p>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Formula: Selling Price = Cost × (1 + Markup% / 100)</p>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-[10px] text-[var(--text-muted)]">Taxable Base</p>
                  <p className="text-sm font-extrabold text-[var(--text-primary)] mt-1">{formatCurrency(gstBase, currency)}</p>
                </div>
                <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-[10px] text-[var(--text-muted)]">CGST ({gstRate / 2}%)</p>
                  <p className="text-sm font-extrabold text-[#55B8FF] mt-1">{formatCurrency(gstCgst, currency)}</p>
                </div>
                <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-[10px] text-[var(--text-muted)]">SGST ({gstRate / 2}%)</p>
                  <p className="text-sm font-extrabold text-[#55B8FF] mt-1">{formatCurrency(gstSgst, currency)}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border space-y-1 text-center" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                <p className="text-[11px] text-[var(--text-muted)]">Grand Total (Inclusive of GST)</p>
                <p className="text-3xl font-black text-[#10D6A0]">{formatCurrency(gstTotal, currency)}</p>
              </div>
            </div>
          )}

          {activeTab === 'discount' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border space-y-1" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Discount Savings</p>
                  <p className="text-xl font-extrabold text-[#FF647C]">-{formatCurrency(discSavings, currency)}</p>
                </div>
                <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Discounted Final Price</p>
                  <p className="text-xl font-extrabold text-[#10D6A0]">{formatCurrency(discFinal, currency)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'break-even' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Break-Even Sales Units</p>
                  <p className="text-2xl font-black text-[#10D6A0]">{beUnits} units</p>
                </div>
                <div className="p-4 rounded-xl border space-y-1" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Break-Even Revenue</p>
                  <p className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(beRevenue, currency)}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Contribution Margin per unit: <span className="font-bold text-[var(--text-primary)]">{formatCurrency(beContribMargin, currency)}</span> ({beMarginRatio.toFixed(1)}%).
              </p>
            </div>
          )}

          {activeTab === 'cash-flow' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border space-y-1" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Net Operational Cash Added</p>
                  <p className="text-xl font-extrabold text-[#10D6A0]">+{formatCurrency(cfNetChange, currency)}</p>
                </div>
                <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                  <p className="text-[11px] text-[var(--text-muted)]">Ending Cash Balance</p>
                  <p className="text-xl font-extrabold text-[#10D6A0]">{formatCurrency(cfEnding, currency)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'product-pricing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border space-y-1" style={{ background: 'rgba(16,214,160,0.05)', borderColor: 'rgba(16,214,160,0.2)' }}>
                <p className="text-[11px] text-[var(--text-muted)]">Suggested Retail Selling Price</p>
                <p className="text-3xl font-black text-[#10D6A0]">{formatCurrency(ppSuggestedPrice, currency)}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Yields <span className="font-bold text-[var(--text-primary)]">{formatCurrency(ppUnitProfit, currency)}</span> profit per unit ({ppTargetMargin}% margin).
                </p>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Total landed cost: {formatCurrency(ppTotalCost, currency)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
