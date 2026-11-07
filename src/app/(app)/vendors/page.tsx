'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import { type Vendor } from '@/lib/db';
import {
  TruckIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  Edit3Icon,
  XIcon,
} from '@/components/ui/icons';

export default function VendorsPage() {
  const { vendors, addVendor, updateVendor, deleteVendor, currency } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<number>(0);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = v.name.toLowerCase().includes(q);
        const mEmail = v.email.toLowerCase().includes(q);
        const mComp = (v.company || '').toLowerCase().includes(q);
        if (!mName && !mEmail && !mComp) return false;
      }
      return true;
    });
  }, [vendors, searchQuery]);

  const stats = useMemo(() => {
    let totalPayables = 0;
    let totalSettled = 0;
    vendors.forEach((v) => {
      totalPayables += v.balance || 0;
      totalSettled += v.totalPaid || 0;
    });
    return {
      totalVendors: vendors.length,
      totalPayables,
      totalSettled,
    };
  }, [vendors]);

  const openAddModal = () => {
    setEditingVendor(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setGstin('');
    setAddress('');
    setBalance(0);
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setEmail(v.email);
    setPhone(v.phone);
    setCompany(v.company || '');
    setGstin(v.gstin || '');
    setAddress(v.address || '');
    setBalance(v.balance || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingVendor && editingVendor.id) {
      await updateVendor(editingVendor.id, {
        name,
        email,
        phone,
        company,
        gstin,
        address,
        balance,
      });
    } else {
      await addVendor({
        name,
        email,
        phone,
        company,
        gstin,
        address,
        balance,
        totalPaid: 0,
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
            Vendor & Supplier Directory
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage procurement partners, trade credit terms, and accounts payable obligations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/20"
        >
          <PlusIcon size={16} />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Verified Suppliers</p>
          <p className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{stats.totalVendors} vendors</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Outstanding Payables</p>
          <p className="text-xl font-extrabold text-[#FF647C] mt-1">{formatCurrency(stats.totalPayables, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Cumulative Procurement Settled</p>
          <p className="text-xl font-extrabold text-[#10D6A0] mt-1">{formatCurrency(stats.totalSettled, currency)}</p>
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
          placeholder="Search supplier by name, company, or email…"
          className="w-full bg-transparent text-xs font-medium focus:outline-none text-[var(--text-primary)]"
        />
      </div>

      {/* Vendors Table */}
      <div className="lumen-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Entity / Company</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4">Warehouse Address</th>
                <th className="py-3 px-4 text-right">Accounts Payable</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {filteredVendors.map((v) => (
                <tr key={v.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{v.name}</td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">{v.company || '—'}</td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)]">
                    <div>{v.email}</div>
                    <div className="text-[10px]">{v.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">{v.gstin || '—'}</td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)] truncate max-w-[180px]">{v.address || '—'}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold">
                    <span className={v.balance > 0 ? 'text-[#FF647C]' : 'text-[#10D6A0]'}>
                      {formatCurrency(v.balance, currency)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1 text-[var(--text-muted)] hover:text-[#10D6A0]"
                        title="Edit"
                      >
                        <Edit3Icon size={14} />
                      </button>
                      <button
                        onClick={() => v.id && deleteVendor(v.id)}
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

      {/* Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="font-bold text-sm text-[var(--text-primary)]">
                {editingVendor ? 'Edit Supplier Profile' : 'Add New Vendor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Contact Person *</label>
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
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Company / Supplier Name</label>
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
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Phone</label>
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
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Outstanding Payables ({currency})</label>
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
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Dispatch / Factory Address</label>
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
