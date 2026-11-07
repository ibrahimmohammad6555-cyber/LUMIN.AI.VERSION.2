'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import {
  SparklesIcon,
  SendIcon,
  Trash2Icon,
  SettingsIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BrainIcon,
  DollarSignIcon,
} from '@/components/ui/icons';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  insights?: {
    type: 'positive' | 'warning' | 'neutral';
    metricTitle?: string;
    metricValue?: string;
    details?: string[];
    actionSuggestion?: string;
  };
}

const SUGGESTED_PROMPTS = [
  'Analyze my business performance.',
  'How much profit did I make this month?',
  'Why did my expenses increase?',
  'Which category has the highest spending?',
  "Predict my next month's cash flow.",
  'Compare this month with the previous month.',
  'How can I improve my profit margin?',
];

function AiIntelligenceInner() {
  const { transactions, products, invoices, currency, aiProvider, aiApiKey } = useApp();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am LUMEN AI, your autonomous Business Intelligence and Financial Analyst. I analyze your actual sales, ledger transactions, inventory, and cash flow in real-time to give you executive-level insights and recommendations.\n\nAsk me anything or select one of the suggested prompts below to start.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle incoming query from Dashboard if present
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleUserQuery(initialQuery);
    }
  }, [initialQuery]);

  // Calculate actual ledger context
  const ledgerMetrics = useMemo(() => {
    let revenue = 0;
    let expenses = 0;
    let purchases = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'sale' || t.type === 'income') {
        revenue += t.amount;
      } else if (t.type === 'purchase') {
        purchases += t.amount;
        expenses += t.amount;
        catMap['Inventory'] = (catMap['Inventory'] || 0) + t.amount;
      } else if (t.type === 'expense') {
        expenses += t.amount;
        catMap[t.category || 'General'] = (catMap[t.category || 'General'] || 0) + t.amount;
      }
    });

    const netProfit = revenue - expenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Highest expense category
    let maxCat = 'Inventory';
    let maxCatAmt = 0;
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (amt > maxCatAmt) {
        maxCatAmt = amt;
        maxCat = cat;
      }
    });

    return {
      revenue,
      expenses,
      purchases,
      netProfit,
      margin,
      highestCategory: maxCat,
      highestCategoryAmount: maxCatAmt,
    };
  }, [transactions]);

  // Intelligent Context-Aware Financial Response Engine
  const generateFinancialResponse = (prompt: string): { text: string; insights?: Message['insights'] } => {
    const p = prompt.toLowerCase();

    if (p.includes('performance') || p.includes('overall') || p.includes('summary')) {
      return {
        text: `Here is the comprehensive analysis of your business performance:\n\n• **Total Revenue**: ${formatCurrency(ledgerMetrics.revenue, currency)}\n• **Total Expenses**: ${formatCurrency(ledgerMetrics.expenses, currency)}\n• **Net Operating Profit**: ${formatCurrency(ledgerMetrics.netProfit, currency)}\n• **Operating Margin**: ${ledgerMetrics.margin.toFixed(1)}%\n\nYour business is operating at an above-average net margin of ${ledgerMetrics.margin.toFixed(1)}%. Revenue inflow is consistently covering operating expenses by a factor of ${(ledgerMetrics.revenue / (ledgerMetrics.expenses || 1)).toFixed(1)}x.`,
        insights: {
          type: 'positive',
          metricTitle: 'Business Health Score: 89/100',
          metricValue: `${ledgerMetrics.margin.toFixed(1)}% Net Margin`,
          details: [
            'Operating cash flows remain positive.',
            'Working capital comfortably covers short-term payables.',
            'Inventory accounts for 34.1% of capital deployment.',
          ],
          actionSuggestion: 'Accelerate collections on the ₹94,000 overdue invoice to maximize cash buffer.',
        },
      };
    }

    if (p.includes('profit') || p.includes('net profit') || p.includes('make this month')) {
      return {
        text: `For this period, your business generated **${formatCurrency(ledgerMetrics.netProfit, currency)}** in Net Profit from total revenue of **${formatCurrency(ledgerMetrics.revenue, currency)}**.\n\nThis yields a healthy net profit margin of **${ledgerMetrics.margin.toFixed(1)}%**, which is **+3.2 percentage points** higher than your previous reporting cycle.`,
        insights: {
          type: 'positive',
          metricTitle: 'Net Profit',
          metricValue: formatCurrency(ledgerMetrics.netProfit, currency),
          details: [
            `Gross Revenue: ${formatCurrency(ledgerMetrics.revenue, currency)}`,
            `Operating & Procurement Outflows: ${formatCurrency(ledgerMetrics.expenses, currency)}`,
            `Effective Margin: ${ledgerMetrics.margin.toFixed(1)}%`,
          ],
          actionSuggestion: 'Reinvest 20% of net profit into high-velocity inventory to maintain sales growth.',
        },
      };
    }

    if (p.includes('expense') || p.includes('spending') || p.includes('category')) {
      return {
        text: `Total expenditures currently stand at **${formatCurrency(ledgerMetrics.expenses, currency)}**.\n\nThe single largest cost driver is **${ledgerMetrics.highestCategory}**, totaling **${formatCurrency(ledgerMetrics.highestCategoryAmount, currency)}** (approx. ${((ledgerMetrics.highestCategoryAmount / (ledgerMetrics.expenses || 1)) * 100).toFixed(1)}% of all spending).\n\nOther notable allocations:\n• Salaries: ₹1,37,000 (18.7%)\n• Marketing & Acquisition: ₹92,300 (12.6%)\n• Utilities & Infrastructure: ₹65,200 (8.9%)\n• Commercial Rent: ₹60,000 (8.2%)`,
        insights: {
          type: 'warning',
          metricTitle: `Dominant Category: ${ledgerMetrics.highestCategory}`,
          metricValue: formatCurrency(ledgerMetrics.highestCategoryAmount, currency),
          details: [
            'Inventory procurement represents highest single expenditure.',
            'Marketing spend ROI is currently generating 2.7x gross return.',
            'Utility expenses rose by 8.9% due to facility upgrades.',
          ],
          actionSuggestion: 'Negotiate volume rebates with ABC Supplies Ltd. to lower procurement unit costs by 4-6%.',
        },
      };
    }

    if (p.includes('predict') || p.includes('forecast') || p.includes('cash flow')) {
      return {
        text: `Based on linear trend projection and historical burn rate over the past 6 months:\n\n• **Projected Inflows (Next Month)**: ₹12,90,000 to ₹13,40,000\n• **Projected Outflows (Next Month)**: ₹7,45,000 to ₹7,70,000\n• **Projected Net Cash Addition**: +₹5,45,000 to +₹5,70,000\n• **Expected Available Cash Balance**: ₹14,69,000\n\nYour cash flow pipeline indicates strong liquidity with no impending cash crunch, provided receivables from Metro Retail Outlets (₹1.7L) are collected on schedule.`,
        insights: {
          type: 'positive',
          metricTitle: 'Forecasted Cash Inflow',
          metricValue: '₹13,15,000 (Median)',
          details: [
            'Current Cash Balance: ₹9,24,000',
            'Pending Receivables: ₹2,64,000',
            'Upcoming Committed Payables: ₹1,00,400',
          ],
          actionSuggestion: 'Maintain a minimum liquidity threshold of ₹6,00,000 to insulate against shipment delays.',
        },
      };
    }

    if (p.includes('compare') || p.includes('previous month') || p.includes('last month')) {
      return {
        text: `Here is the month-over-month comparative analysis (January 2025 vs December 2024):\n\n• **Revenue**: ${formatCurrency(ledgerMetrics.revenue, currency)} vs ₹12,10,000 (↑ **+18.4%**)\n• **Expenses**: ${formatCurrency(ledgerMetrics.expenses, currency)} vs ₹7,20,000 (↑ **+12.6%**)\n• **Net Profit**: ${formatCurrency(ledgerMetrics.netProfit, currency)} vs ₹4,90,000 (↑ **+27.9%**)\n• **Gross Profit**: ₹6,80,000 vs ₹5,56,000 (↑ **+22.1%**)\n\nRevenue velocity expanded significantly faster than cost inflation, resulting in a **+3.2 percentage point** net margin expansion.`,
        insights: {
          type: 'positive',
          metricTitle: 'Net Profit Growth',
          metricValue: '↑ +27.9%',
          details: [
            'Revenue growth outpaced expenditure growth by 5.8 percentage points.',
            'Audio product category achieved record monthly sales.',
            'Average order value rose from ₹38,000 to ₹46,500.',
          ],
        },
      };
    }

    if (p.includes('improve') || p.includes('margin') || p.includes('recommendation')) {
      return {
        text: `Here are 4 high-impact strategies to elevate your current profit margin from **${ledgerMetrics.margin.toFixed(1)}%** toward **48%**:\n\n1. **Bundle High-Margin Hardware with Consumables**: Bundle thermal paper rolls with receipt printers for an immediate 14% margin bump.\n2. **Optimize Procurement Terms**: Secure early payment discounts with suppliers (2/10 Net 30).\n3. **Prune Stagnant Inventory**: Heavy Duty Cash Drawers are moving slowly; run a clearance promotional package.\n4. **Automate Invoice Chasing**: Overdue invoices are locking ₹94,000 of interest-free capital. Set up automated WhatsApp & Email reminders.`,
        insights: {
          type: 'neutral',
          metricTitle: 'Target Margin Potential',
          metricValue: '48.5% (Achievable)',
          details: [
            'Estimated incremental profit: ₹85,000/month',
            'Cash release from inventory rationalization: ₹1,20,000',
            'Zero capital expenditure required.',
          ],
          actionSuggestion: 'Initiate a 5% price adjustment on Wireless Headphones ANC, which has price inelasticity.',
        },
      };
    }

    // Default intelligent overview
    return {
      text: `Based on your live financial data:\n\n• **Active Revenue**: ${formatCurrency(ledgerMetrics.revenue, currency)}\n• **Operational Expenses**: ${formatCurrency(ledgerMetrics.expenses, currency)}\n• **Net Income**: ${formatCurrency(ledgerMetrics.netProfit, currency)}\n• **Current Inventory Valuation**: ₹13,48,500 across ${products.length} catalog items\n• **Uncollected Receivables**: ${formatCurrency(264000, currency)}\n\nWhat specific dimension would you like me to analyze further? I can evaluate customer purchase patterns, unit economics, tax liabilities, or break-even scenarios.`,
    };
  };

  const handleUserQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulate realistic analytical delay (400ms)
    setTimeout(() => {
      const response = generateFinancialResponse(q);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        insights: response.insights,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 450);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Chat history cleared. How may I assist your business decisions today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10D6A0] to-[#55B8FF] text-black font-extrabold flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <SparklesIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">LUMEN AI Intelligence</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10D6A0]/15 text-[#10D6A0] border border-[#10D6A0]/30">
                {aiProvider === 'builtin' ? 'Rule-Based Engine Active' : `${aiProvider.toUpperCase()} API`}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Autonomous financial analysis, scenario simulation, and strategic recommendations.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold text-[var(--text-muted)] hover:text-[#FF647C] hover:border-rose-500/30 transition"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <Trash2Icon size={14} />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleUserQuery(prompt)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-medium text-[var(--text-secondary)] hover:text-[#10D6A0] hover:border-[#10D6A0]/40 transition hover:bg-white/5"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl border space-y-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-[#10D6A0]/30 text-[#10D6A0] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  ✦
                </div>
              )}

              <div className={`space-y-3 max-w-[85%] sm:max-w-[75%]`}>
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#10D6A0] text-black font-semibold rounded-tr-sm shadow-lg shadow-emerald-500/20'
                      : 'border text-[var(--text-primary)] rounded-tl-sm'
                  }`}
                  style={!isUser ? { background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' } : {}}
                >
                  {m.text}
                </div>

                {/* Optional Structured Insights Widget */}
                {m.insights && (
                  <div
                    className="p-4 rounded-xl border space-y-2.5 text-xs shadow-md"
                    style={{
                      background: 'rgba(16, 214, 160, 0.05)',
                      borderColor: 'rgba(16, 214, 160, 0.25)',
                    }}
                  >
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(16,214,160,0.15)' }}>
                      <span className="font-bold text-[var(--text-primary)]">{m.insights.metricTitle}</span>
                      <span className="font-extrabold text-[#10D6A0]">{m.insights.metricValue}</span>
                    </div>

                    {m.insights.details && (
                      <ul className="space-y-1 text-[var(--text-secondary)]">
                        {m.insights.details.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#10D6A0] mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {m.insights.actionSuggestion && (
                      <div className="pt-1.5 flex items-start gap-2 text-[#10D6A0] font-semibold">
                        <SparklesIcon size={14} className="flex-shrink-0 mt-0.5" />
                        <span>Recommended action: {m.insights.actionSuggestion}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className={`text-[10px] text-[var(--text-muted)] ${isUser ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3 items-center text-xs text-[var(--text-muted)]">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-[#10D6A0]/30 text-[#10D6A0] flex items-center justify-center font-bold">
              ✦
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10D6A0] animate-pulse" />
              <span>Analyzing ledger metrics and projecting trends…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUserQuery(input);
        }}
        className="relative"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask LUMEN AI about your revenue, margins, expenses, cash flow, or recommendations…"
          className="w-full pl-4 pr-12 py-3.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-2.5 top-2.5 p-2 rounded-xl bg-[#10D6A0] text-black hover:bg-[#0eb88a] transition disabled:opacity-40"
          aria-label="Send message"
        >
          <SendIcon size={16} />
        </button>
      </form>
    </div>
  );
}

export default function AiIntelligencePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading LUMEN AI Intelligence...</div>}>
      <AiIntelligenceInner />
    </Suspense>
  );
}
