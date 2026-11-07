'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import { type Transaction } from '@/lib/db';
import * as XLSX from 'xlsx';
import {
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  PlusIcon,
  Trash2Icon,
  Edit3Icon,
  ArrowLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from '@/components/ui/icons';

export default function TransactionsPage() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    currency,
    setIsAddTxModalOpen,
  } = useApp();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit Modal
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (paymentMethodFilter !== 'all' && t.paymentMethod !== paymentMethodFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = (t.description || '').toLowerCase().includes(q);
          const matchCat = (t.category || '').toLowerCase().includes(q);
          const matchRef = (t.referenceNo || '').toLowerCase().includes(q);
          const matchParty =
            (t.customerName || '').toLowerCase().includes(q) ||
            (t.vendorName || '').toLowerCase().includes(q);
          if (!matchDesc && !matchCat && !matchRef && !matchParty) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
          return sortOrder === 'desc' ? -diff : diff;
        } else {
          const diff = a.amount - b.amount;
          return sortOrder === 'desc' ? -diff : diff;
        }
      });
  }, [
    transactions,
    typeFilter,
    categoryFilter,
    paymentMethodFilter,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Aggregate Totals
  const totals = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'sale' || t.type === 'income') {
        inflow += t.amount;
      } else {
        outflow += t.amount;
      }
    });
    return {
      inflow,
      outflow,
      net: inflow - outflow,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Export CSV
  const exportCSV = () => {
    const rows = filteredTransactions.map((t) => ({
      ID: t.id,
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Amount: t.amount,
      Currency: t.currency,
      PaymentMethod: t.paymentMethod || 'N/A',
      ReferenceNo: t.referenceNo || 'N/A',
      Party: t.customerName || t.vendorName || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, `Transactions_LUMEN_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editingTx.id) return;
    await updateTransaction(editingTx.id, {
      type: editingTx.type,
      amount: editingTx.amount,
      category: editingTx.category,
      description: editingTx.description,
      date: editingTx.date,
      paymentMethod: editingTx.paymentMethod,
      referenceNo: editingTx.referenceNo,
    });
    setEditingTx(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Transactions Ledger
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real-time ledger entries, invoices, inventory restocks, and operational overheads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold text-[var(--text-primary)] hover:border-[#10D6A0]/40 hover:bg-white/5 transition"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <DownloadIcon size={14} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/20"
          >
            <PlusIcon size={16} />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Mini Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="lumen-card p-3.5">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Filtered Count</p>
          <p className="text-lg font-bold text-[var(--text-primary)] mt-1">{totals.count} entries</p>
        </div>
        <div className="lumen-card p-3.5">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Total Inflow</p>
          <p className="text-lg font-bold text-[#10D6A0] mt-1">{formatCurrency(totals.inflow, currency)}</p>
        </div>
        <div className="lumen-card p-3.5">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Total Outflow</p>
          <p className="text-lg font-bold text-[#FF647C] mt-1">{formatCurrency(totals.outflow, currency)}</p>
        </div>
        <div className="lumen-card p-3.5">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Net Cash Flow</p>
          <p className={`text-lg font-bold mt-1 ${totals.net >= 0 ? 'text-[#10D6A0]' : 'text-[#FF647C]'}`}>
            {formatCurrency(totals.net, currency)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex-1 min-w-[240px] relative">
          <SearchIcon size={15} className="absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description, reference, party name…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-black/20 text-xs font-medium focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-black/20 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <option value="all">All Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-black/20 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort Field */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-2 rounded-xl border text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            Sort: {sortField.toUpperCase()} ({sortOrder.toUpperCase()})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="lumen-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[var(--text-muted)]">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isPositive = tx.type === 'sale' || tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-mono text-[var(--text-muted)] whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 px-4 font-semibold">
                        <div>{tx.description}</div>
                        {(tx.customerName || tx.vendorName) && (
                          <div className="text-[10px] text-[var(--text-muted)] font-normal">
                            Party: {tx.customerName || tx.vendorName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === 'sale'
                              ? 'bg-emerald-500/15 text-[#10D6A0]'
                              : tx.type === 'purchase'
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] whitespace-nowrap">{tx.category}</td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] whitespace-nowrap">{tx.paymentMethod || 'Bank'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                        {tx.referenceNo || tx.invoiceNo || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                        <span className={isPositive ? 'text-[#10D6A0]' : 'text-[#FF647C]'}>
                          {isPositive ? '+' : '-'}
                          {formatCurrency(Math.abs(tx.amount), currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[#10D6A0] transition"
                            title="Edit"
                          >
                            <Edit3Icon size={14} />
                          </button>
                          <button
                            onClick={() => tx.id && deleteTransaction(tx.id)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[#FF647C] transition"
                            title="Delete"
                          >
                            <Trash2Icon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t flex items-center justify-between text-xs text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border hover:bg-white/5 disabled:opacity-40 transition"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <ChevronLeftIcon size={14} />
            </button>
            <span className="px-2 font-semibold text-[var(--text-primary)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border hover:bg-white/5 disabled:opacity-40 transition"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Edit Transaction #{editingTx.id}</h3>
              <button onClick={() => setEditingTx(null)} className="text-[var(--text-muted)] hover:text-white">
                <XIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editingTx.description}
                  onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editingTx.category}
                    onChange={(e) => setEditingTx({ ...editingTx, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
