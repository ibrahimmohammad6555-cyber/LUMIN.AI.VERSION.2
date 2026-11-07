'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import { type Invoice, type InvoiceItem } from '@/lib/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  PrinterIcon,
  DownloadIcon,
  Trash2Icon,
  EyeIcon,
  XIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
} from '@/components/ui/icons';

export default function InvoicesPage() {
  const {
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    customers,
    products,
    currency,
    businessProfile,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview & Create Modals
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Invoice Form
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Wireless Headphones ANC (Bulk Order)', quantity: 15, unitPrice: 3800, taxRate: 18, total: 67260 },
  ]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let overdue = 0;
    let pending = 0;
    let paid = 0;

    invoices.forEach((inv) => {
      totalBilled += inv.total;
      if (inv.status === 'paid') paid += inv.total;
      else if (inv.status === 'overdue') overdue += inv.total;
      else pending += inv.total;
    });

    return {
      totalBilled: totalBilled || 264000,
      paid: paid || 1248000,
      overdue: overdue || 94000,
      pending: pending || 170000,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mNo = inv.invoiceNumber.toLowerCase().includes(q);
        const mCust = inv.customerName.toLowerCase().includes(q);
        if (!mNo && !mCust) return false;
      }
      return true;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Item helpers
  const handleItemSelect = (idx: number, prodId: number) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        productId: prod.id,
        description: prod.name,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        taxRate: 18,
        total: prod.sellingPrice * 1.18,
      };
      return copy;
    });
  };

  const updateItem = (idx: number, field: keyof InvoiceItem, val: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx], [field]: val };
      const sub = item.quantity * item.unitPrice;
      item.total = sub * (1 + item.taxRate / 100);
      copy[idx] = item;
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unitPrice: 0, taxRate: 18, total: 0 },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  const taxTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  }, [items]);

  const grandTotal = subtotal + taxTotal;

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInvoice({
      invoiceNumber,
      customerId: selectedCustomerId,
      customerName: customerName || 'Walk-in Customer',
      customerEmail,
      customerAddress,
      customerGstin,
      date: invoiceDate,
      dueDate,
      status: 'pending',
      subtotal,
      discountAmount: 0,
      taxTotal,
      total: grandTotal,
      template,
      items,
    });
    setIsCreateOpen(false);
  };

  // Generate Professional PDF via jsPDF
  const exportPDF = (inv: Invoice) => {
    const doc = new jsPDF();

    // Business Header
    doc.setFontSize(22);
    doc.setTextColor(16, 214, 160);
    doc.text(businessProfile.businessName, 14, 22);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`GSTIN: ${businessProfile.gstin}`, 14, 28);
    doc.text(businessProfile.address, 14, 33);
    doc.text(`Phone: ${businessProfile.phone}`, 14, 38);

    // Invoice Meta
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text('TAX INVOICE', 140, 22);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 140, 28);
    doc.text(`Date: ${inv.date}`, 140, 33);
    doc.text(`Due Date: ${inv.dueDate}`, 140, 38);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 140, 43);

    // Bill To
    doc.line(14, 48, 196, 48);
    doc.setFontSize(11);
    doc.setTextColor(20);
    doc.text('Billed To:', 14, 55);
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(inv.customerName, 14, 61);
    if (inv.customerAddress) doc.text(inv.customerAddress, 14, 66);
    if (inv.customerGstin) doc.text(`GSTIN: ${inv.customerGstin}`, 14, 71);

    // Items Table
    const tableRows = inv.items.map((i, idx) => [
      idx + 1,
      i.description,
      i.quantity,
      `₹${i.unitPrice.toLocaleString()}`,
      `${i.taxRate}%`,
      `₹${i.total.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 78,
      head: [['#', 'Description', 'Qty', 'Unit Rate', 'Tax', 'Amount']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 214, 160], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${inv.subtotal.toLocaleString()}`, 135, finalY);
    doc.text(`Tax Total (GST): ₹${inv.taxTotal.toLocaleString()}`, 135, finalY + 6);
    doc.setFontSize(13);
    doc.setTextColor(16, 214, 160);
    doc.text(`Grand Total: ₹${inv.total.toLocaleString()}`, 135, finalY + 14);

    doc.save(`${inv.invoiceNumber}_LUMEN.pdf`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Invoicing & Billing
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            GST-compliant invoices, automated tax breakdown, customizable templates, and PDF export.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/20"
        >
          <PlusIcon size={16} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Total Receivables</p>
          <p className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{formatCurrency(metrics.totalBilled, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Overdue</p>
          <p className="text-xl font-extrabold text-[#FF647C] mt-1">{formatCurrency(metrics.overdue, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Pending Payment</p>
          <p className="text-xl font-extrabold text-[#FFBE69] mt-1">{formatCurrency(metrics.pending, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Paid & Settled</p>
          <p className="text-xl font-extrabold text-[#10D6A0] mt-1">{formatCurrency(metrics.paid, currency)}</p>
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
            placeholder="Search invoice number or customer name…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-black/20 text-xs font-medium focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border bg-black/20 text-xs font-medium text-[var(--text-primary)] focus:outline-none"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices List Table */}
      <div className="lumen-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#10D6A0]">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-semibold">{inv.customerName}</td>
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">{inv.date}</td>
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">{inv.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/15 text-[#10D6A0]'
                          : inv.status === 'pending'
                          ? 'bg-amber-500/15 text-[#FFBE69]'
                          : 'bg-rose-500/15 text-[#FF647C]'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-[var(--text-primary)]">
                    {formatCurrency(inv.total, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="p-1 text-[var(--text-muted)] hover:text-[#10D6A0]"
                        title="Preview & Print"
                      >
                        <EyeIcon size={14} />
                      </button>
                      <button
                        onClick={() => exportPDF(inv)}
                        className="p-1 text-[var(--text-muted)] hover:text-[#55B8FF]"
                        title="Download PDF"
                      >
                        <DownloadIcon size={14} />
                      </button>
                      <button
                        onClick={() => {
                          const nextStatus = inv.status === 'paid' ? 'pending' : 'paid';
                          inv.id && updateInvoice(inv.id, { status: nextStatus });
                        }}
                        className="p-1 text-[var(--text-muted)] hover:text-emerald-400"
                        title="Toggle Paid/Pending"
                      >
                        <CheckCircle2Icon size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl rounded-2xl border p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print-area"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            {/* Header controls (no-print) */}
            <div className="flex items-center justify-between border-b pb-4 no-print" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Invoice Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-white/5"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <PrinterIcon size={14} /> Print
                </button>
                <button
                  onClick={() => exportPDF(previewInvoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0]"
                >
                  <DownloadIcon size={14} /> PDF
                </button>
                <button onClick={() => setPreviewInvoice(null)} className="p-1.5 text-[var(--text-muted)] hover:text-white">
                  <XIcon size={18} />
                </button>
              </div>
            </div>

            {/* Invoice Layout */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">{businessProfile.businessName}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">GSTIN: {businessProfile.gstin}</p>
                  <p className="text-xs text-[var(--text-muted)]">{businessProfile.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#10D6A0]">INVOICE</p>
                  <p className="text-xs font-mono font-bold text-[var(--text-primary)] mt-1">{previewInvoice.invoiceNumber}</p>
                  <p className="text-xs text-[var(--text-muted)]">Date: {previewInvoice.date}</p>
                  <p className="text-xs text-[var(--text-muted)]">Due Date: {previewInvoice.dueDate}</p>
                </div>
              </div>

              <div className="border-t border-b py-3 text-xs" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Billed To</p>
                <p className="font-bold text-sm text-[var(--text-primary)] mt-0.5">{previewInvoice.customerName}</p>
                {previewInvoice.customerAddress && <p className="text-[var(--text-muted)]">{previewInvoice.customerAddress}</p>}
                {previewInvoice.customerGstin && <p className="font-mono text-[var(--text-muted)]">GSTIN: {previewInvoice.customerGstin}</p>}
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Tax (GST)</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
                  {previewInvoice.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium">{i.description}</td>
                      <td className="py-2.5 text-center">{i.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{formatCurrency(i.unitPrice, currency)}</td>
                      <td className="py-2.5 text-right font-mono">{i.taxRate}%</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatCurrency(i.total, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Totals */}
              <div className="border-t pt-3 flex justify-end" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[var(--text-primary)]">{formatCurrency(previewInvoice.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Tax (GST):</span>
                    <span className="font-mono text-[var(--text-primary)]">{formatCurrency(previewInvoice.taxTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black border-t pt-2 text-[#10D6A0]" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Grand Total:</span>
                    <span className="font-mono">{formatCurrency(previewInvoice.total, currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-3xl rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="font-bold text-sm text-[var(--text-primary)]">Create Professional Invoice</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-mono font-bold text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Select Customer</label>
                  <select
                    value={selectedCustomerId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedCustomerId(id || undefined);
                      const c = customers.find((cust) => cust.id === id);
                      if (c) {
                        setCustomerName(c.name);
                        setCustomerEmail(c.email);
                        setCustomerAddress(c.address || '');
                        setCustomerGstin(c.gstin || '');
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <option value="">-- Choose Existing --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              {!selectedCustomerId && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Apex Digital Solutions"
                      className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-secondary)] font-semibold mb-1">Customer GSTIN</label>
                    <input
                      type="text"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value)}
                      placeholder="e.g. 27AABCA7162K1Z9"
                      className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-[var(--text-primary)]">Invoice Line Items</span>
                  <button type="button" onClick={addItemRow} className="text-[#10D6A0] font-semibold flex items-center gap-1">
                    <PlusIcon size={14} /> Add Line Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border grid grid-cols-12 gap-2 items-center"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        className="w-full p-2 rounded-lg border bg-black/20 text-xs text-[var(--text-primary)]"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full p-2 rounded-lg border bg-black/20 text-xs text-center font-bold text-[var(--text-primary)]"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 rounded-lg border bg-black/20 text-xs font-semibold text-[var(--text-primary)]"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                    </div>
                    <div className="col-span-2 text-right font-extrabold text-[#10D6A0]">
                      {formatCurrency(item.total, currency)}
                    </div>
                    <div className="col-span-1 text-center">
                      <button type="button" onClick={() => removeItemRow(idx)} className="text-[var(--text-muted)] hover:text-[#FF647C]">
                        <Trash2Icon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Submit */}
              <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Grand Total (Subtotal + GST)</p>
                  <p className="text-xl font-black text-[#10D6A0]">{formatCurrency(grandTotal, currency)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a]"
                  >
                    Issue Invoice
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
