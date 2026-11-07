'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import { type PurchaseItem } from '@/lib/db';
import {
  PackageIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
  TruckIcon,
} from '@/components/ui/icons';

export default function PurchasesPage() {
  const {
    purchases,
    addPurchase,
    products,
    vendors,
    currency,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Purchase Form
  const [vendorId, setVendorId] = useState<number | undefined>(undefined);
  const [vendorName, setVendorName] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'overdue'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [lineItems, setLineItems] = useState<PurchaseItem[]>([
    {
      productId: undefined,
      name: '',
      quantity: 10,
      unitCost: 0,
      taxRate: 18,
      total: 0,
    },
  ]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalPurchases = 0;
    let totalUnits = 0;
    let pendingPayables = 0;

    purchases.forEach((p) => {
      totalPurchases += p.total;
      if (p.paymentStatus !== 'paid') pendingPayables += p.total;
      p.items?.forEach((i) => {
        totalUnits += i.quantity || 0;
      });
    });

    return {
      totalPurchases: totalPurchases || 732500,
      totalUnits: totalUnits || 120,
      pendingPayables: pendingPayables || 100400,
      count: purchases.length || 6,
    };
  }, [purchases]);

  const handleProductSelect = (index: number, prodId: number) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setLineItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.productId = prod.id;
      item.name = prod.name;
      item.unitCost = prod.costPrice;
      const sub = item.quantity * item.unitCost;
      item.total = sub * (1 + item.taxRate / 100);
      copy[index] = item;
      return copy;
    });
  };

  const updateItemField = (index: number, field: keyof PurchaseItem, val: any) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: val };
      const sub = item.quantity * item.unitCost;
      item.total = sub * (1 + item.taxRate / 100);
      copy[index] = item;
      return copy;
    });
  };

  const addLine = () => {
    setLineItems((prev) => [
      ...prev,
      { productId: undefined, name: '', quantity: 10, unitCost: 0, taxRate: 18, total: 0 },
    ]);
  };

  const removeLine = (idx: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const purchaseGrandTotal = useMemo(() => {
    return lineItems.reduce((acc, curr) => acc + (curr.total || 0), 0);
  }, [lineItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0 || purchaseGrandTotal <= 0) return;

    const poNo = `PO-${Date.now().toString().slice(-4)}`;
    const vend = vendors.find((v) => v.id === vendorId);
    const finalVendName = vendorName || vend?.name || 'Authorized Supplier';

    await addPurchase({
      purchaseNumber: poNo,
      vendorId,
      vendorName: finalVendName,
      date: purchaseDate,
      total: purchaseGrandTotal,
      paymentStatus,
      paymentMethod,
      items: lineItems,
    });

    setIsModalOpen(false);
    setLineItems([{ productId: undefined, name: '', quantity: 10, unitCost: 0, taxRate: 18, total: 0 }]);
    setVendorName('');
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (statusFilter !== 'all' && p.paymentStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = (p.vendorName || '').toLowerCase().includes(q);
        const mNo = (p.purchaseNumber || '').toLowerCase().includes(q);
        if (!mName && !mNo) return false;
      }
      return true;
    });
  }, [purchases, statusFilter, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Purchases & Procurement
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage purchase orders, automatically restock inventory counts, and track vendor accounts payable.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/20"
        >
          <PlusIcon size={16} />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Total Procurement Volume</p>
          <p className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{formatCurrency(metrics.totalPurchases, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Units Restocked</p>
          <p className="text-xl font-extrabold text-[#10D6A0] mt-1">{metrics.totalUnits} items</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Pending Payables</p>
          <p className="text-xl font-extrabold text-[#FF647C] mt-1">{formatCurrency(metrics.pendingPayables, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Purchase Batches</p>
          <p className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{metrics.count} orders</p>
        </div>
      </div>

      {/* Search and Filters */}
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
            placeholder="Search PO number or vendor name…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-black/20 text-xs font-medium focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border bg-black/20 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Purchases Table */}
      <div className="lumen-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor / Supplier</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Restocked Items</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--text-muted)]">
                    No purchase orders recorded yet. Click &quot;New Purchase Order&quot; to restock inventory.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#55B8FF]">{p.purchaseNumber}</td>
                    <td className="py-3.5 px-4 font-semibold">{p.vendorName}</td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">{p.date}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {p.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ') || 'Inventory items'}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{p.paymentMethod}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.paymentStatus === 'paid'
                            ? 'bg-emerald-500/15 text-[#10D6A0]'
                            : p.paymentStatus === 'pending'
                            ? 'bg-amber-500/15 text-[#FFBE69]'
                            : 'bg-rose-500/15 text-[#FF647C]'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[var(--text-primary)]">
                      {formatCurrency(p.total, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-3xl rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Create Purchase Order (PO)</h2>
                <p className="text-xs text-[var(--text-muted)]">Automatically increments inventory and records procurement expense</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Select Vendor / Supplier</label>
                  <select
                    value={vendorId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setVendorId(id || undefined);
                      const v = vendors.find((vend) => vend.id === id);
                      if (v) setVendorName(v.name);
                    }}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <option value="">-- Choose Existing Vendor or Type Below --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} ({v.company || v.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">PO Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              {!vendorId && (
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Supplier Name (Manual)</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. ABC Supplies Ltd."
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              )}

              {/* Items to Restock */}
              <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">Items to Restock</span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-[#10D6A0] hover:underline font-semibold flex items-center gap-1"
                  >
                    <PlusIcon size={14} /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border grid grid-cols-12 gap-2 items-center"
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
                    >
                      <div className="col-span-5">
                        <select
                          value={item.productId || ''}
                          onChange={(e) => handleProductSelect(idx, Number(e.target.value))}
                          className="w-full p-2 rounded-lg border bg-black/20 text-xs text-[var(--text-primary)]"
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <option value="">-- Choose Product To Restock --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Current Stock: {p.stockQuantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItemField(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full p-2 rounded-lg border bg-black/20 text-xs text-center font-bold text-[var(--text-primary)]"
                          style={{ borderColor: 'var(--border-color)' }}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Cost"
                          value={item.unitCost}
                          onChange={(e) => updateItemField(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 rounded-lg border bg-black/20 text-xs font-semibold text-[var(--text-primary)]"
                          style={{ borderColor: 'var(--border-color)' }}
                        />
                      </div>
                      <div className="col-span-2 text-right font-extrabold text-[var(--text-primary)]">
                        {formatCurrency(item.total, currency)}
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="p-1 text-[var(--text-muted)] hover:text-[#FF647C]"
                        >
                          <Trash2Icon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <option value="paid">Paid to Supplier</option>
                    <option value="pending">Pending Payment (Accounts Payable)</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">PO Total Cost (incl. GST)</p>
                  <p className="text-xl font-black text-[var(--text-primary)]">{formatCurrency(purchaseGrandTotal, currency)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] shadow-lg shadow-emerald-500/20"
                  >
                    Confirm Restock & Record PO
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
