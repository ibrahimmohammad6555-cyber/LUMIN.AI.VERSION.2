'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { XIcon, PlusIcon } from '@/components/ui/icons';

export function AddTransactionModal() {
  const { isAddTxModalOpen, setIsAddTxModalOpen, addTransaction, currency, customers, vendors } = useApp();

  const [type, setType] = useState<'sale' | 'expense' | 'purchase' | 'income'>('sale');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Sales');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddTxModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: numAmount,
        currency,
        category: category || (type === 'sale' ? 'Sales' : type === 'expense' ? 'Operating' : 'Inventory'),
        description: description || `${type.toUpperCase()} transaction`,
        date,
        paymentMethod,
        referenceNo: referenceNo || `TXN-${Date.now().toString().slice(-6)}`,
        customerName: type === 'sale' ? partyName : undefined,
        vendorName: type === 'purchase' || type === 'expense' ? partyName : undefined,
      });
      setIsAddTxModalOpen(false);
      // Reset form
      setAmount('');
      setDescription('');
      setReferenceNo('');
      setPartyName('');
    } catch (err) {
      console.error('Failed to save transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#10D6A0] flex items-center justify-center font-bold">
              <PlusIcon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Record Transaction</h2>
              <p className="text-xs text-[var(--text-muted)]">Record real-time sales, expenses, and inventory purchases</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddTxModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition"
            aria-label="Close modal"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Transaction Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sale', label: 'Sale', color: 'hover:border-emerald-500 text-emerald-400' },
                { id: 'expense', label: 'Expense', color: 'hover:border-rose-500 text-rose-400' },
                { id: 'purchase', label: 'Purchase', color: 'hover:border-blue-500 text-blue-400' },
                { id: 'income', label: 'Income', color: 'hover:border-emerald-500 text-emerald-400' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id as any);
                    if (t.id === 'sale') setCategory('Sales');
                    else if (t.id === 'purchase') setCategory('Inventory');
                    else if (t.id === 'expense') setCategory('Utilities');
                    else setCategory('Other Income');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                    type === t.id
                      ? 'bg-emerald-500/15 border-[#10D6A0] text-[#10D6A0] font-semibold'
                      : 'border-[var(--border-color)] bg-white/5 text-[var(--text-secondary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 text-sm font-semibold focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 text-sm focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Electronics, Salaries, Rent"
                className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 text-sm focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 text-sm focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI (PhonePe, GPay, Paytm)</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Customer / Vendor */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">
              {type === 'sale' ? 'Customer Name' : 'Vendor / Supplier Name'}
            </label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder={type === 'sale' ? 'e.g. Metro Retail Outlets Ltd.' : 'e.g. ABC Supplies Ltd.'}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 text-sm focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Description & Reference */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Bulk order delivery, Utility bill, etc."
              className="w-full px-3.5 py-2.5 rounded-xl border bg-black/20 text-sm focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setIsAddTxModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording…' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
