'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import { type Customer } from '@/lib/db';
import {
  UsersIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  Edit3Icon,
  FileTextIcon,
  XIcon,
} from '@/components/ui/icons';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, currency } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<number>(0);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = c.name.toLowerCase().includes(q);
        const mEmail = c.email.toLowerCase().includes(q);
        const mComp = (c.company || '').toLowerCase().includes(q);
        if (!mName && !mEmail && !mComp) return false;
      }
      return true;
    });
  }, [customers, searchQuery]);

  const stats = useMemo(() => {
    let totalReceivables = 0;
    let totalPurchased = 0;
    customers.forEach((c) => {
      totalReceivables += c.balance || 0;
      totalPurchased += c.totalPurchases || 0;
    });
    return {
      totalCustomers: customers.length,
      totalReceivables,
      totalPurchased,
    };
  }, [customers]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setGstin('');
    setAddress('');
    setBalance(0);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setCompany(c.company || '');
    setGstin(c.gstin || '');
    setAddress(c.address || '');
    setBalance(c.balance || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingCustomer && editingCustomer.id) {
      await updateCustomer(editingCustomer.id, {
        name,
        email,
        phone,
        company,
        gstin,
        address,
        balance,
      });
    } else {
      await addCustomer({
        name,
        email,
        phone,
        company,
        gstin,
        address,
        balance,
        totalPurchases: 0,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage institutional clients, contact info, billing addresses, and outstanding balances.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/20"
        >
          <PlusIcon size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Active Accounts</p>
          <p className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{stats.totalCustomers} clients</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Total Outstanding Receivables</p>
          <p className="text-xl font-extrabold text-[#FFBE69] mt-1">{formatCurrency(stats.totalReceivables, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Lifetime Customer Value</p>
          <p className="text-xl font-extrabold text-[#10D6A0] mt-1">{formatCurrency(stats.totalPurchased, currency)}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="p-3.5 rounded-2xl border flex items-center gap-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <SearchIcon size={15} className="text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search client by name, company, or email…"
          className="w-full bg-transparent text-xs font-medium focus:outline-none text-[var(--text-primary)]"
        />
      </div>

      {/* Customers Table */}
      <div className="lumen-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Outstanding Balance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{c.name}</td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">{c.company || '—'}</td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)]">
                    <div>{c.email}</div>
                    <div className="text-[10px]">{c.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">{c.gstin || '—'}</td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)] truncate max-w-[180px]">{c.address || '—'}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold">
                    <span className={c.balance > 0 ? 'text-[#FFBE69]' : 'text-[#10D6A0]'}>
                      {formatCurrency(c.balance, currency)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1 text-[var(--text-muted)] hover:text-[#10D6A0]"
                        title="Edit"
                      >
                        <Edit3Icon size={14} />
                      </button>
                      <button
                        onClick={() => c.id && deleteCustomer(c.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-[#FF647C]"
                        title="Delete"
                      >
                        <Trash2Icon size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="font-bold text-sm text-[var(--text-primary)]">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Customer / Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 27AABCM8291F1Z1"
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Opening Balance ({currency})</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)] font-bold"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Billing & Delivery Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
