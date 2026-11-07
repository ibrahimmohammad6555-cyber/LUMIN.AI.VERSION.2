'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/currencies';
import { type Product } from '@/lib/db';
import * as XLSX from 'xlsx';
import {
  PackageIcon,
  PlusIcon,
  SearchIcon,
  DownloadIcon,
  Trash2Icon,
  Edit3Icon,
  AlertCircleIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
  XIcon,
} from '@/components/ui/icons';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, adjustProductStock, currency } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'ok'>('all');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(5);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Inventory Totals & Valuations
  const stats = useMemo(() => {
    let totalItems = products.length;
    let totalUnits = 0;
    let valuationCost = 0;
    let valuationRetail = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      totalUnits += p.stockQuantity || 0;
      valuationCost += (p.costPrice || 0) * (p.stockQuantity || 0);
      valuationRetail += (p.sellingPrice || 0) * (p.stockQuantity || 0);
      if ((p.stockQuantity || 0) <= (p.reorderLevel || 0)) {
        lowStockCount++;
      }
    });

    return {
      totalItems,
      totalUnits,
      valuationCost,
      valuationRetail,
      potentialProfit: valuationRetail - valuationCost,
      lowStockCount,
    };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (stockStatusFilter === 'low' && p.stockQuantity > p.reorderLevel) return false;
      if (stockStatusFilter === 'out' && p.stockQuantity > 0) return false;
      if (stockStatusFilter === 'ok' && p.stockQuantity <= p.reorderLevel) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = p.name.toLowerCase().includes(q);
        const mSku = p.sku.toLowerCase().includes(q);
        const mCat = p.category.toLowerCase().includes(q);
        if (!mName && !mSku && !mCat) return false;
      }
      return true;
    });
  }, [products, categoryFilter, stockStatusFilter, searchQuery]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategory('Electronics');
    setUnit('pcs');
    setCostPrice(0);
    setSellingPrice(0);
    setStockQuantity(10);
    setReorderLevel(5);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setUnit(p.unit);
    setCostPrice(p.costPrice);
    setSellingPrice(p.sellingPrice);
    setStockQuantity(p.stockQuantity);
    setReorderLevel(p.reorderLevel);
    setIsProductModalOpen(true);
  };

  const openAdjustModal = (p: Product) => {
    setAdjustTarget(p);
    setAdjustAmount(0);
    setIsAdjustModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    if (editingProduct && editingProduct.id) {
      await updateProduct(editingProduct.id, {
        name,
        sku,
        category,
        unit,
        costPrice,
        sellingPrice,
        stockQuantity,
        reorderLevel,
      });
    } else {
      await addProduct({
        name,
        sku,
        category,
        unit,
        costPrice,
        sellingPrice,
        stockQuantity,
        reorderLevel,
      });
    }
    setIsProductModalOpen(false);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget || !adjustTarget.id || adjustAmount === 0) return;
    await adjustProductStock(adjustTarget.id, adjustAmount);
    setIsAdjustModalOpen(false);
  };

  const exportExcel = () => {
    const rows = filteredProducts.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category,
      Unit: p.unit,
      CostPrice: p.costPrice,
      SellingPrice: p.sellingPrice,
      StockQuantity: p.stockQuantity,
      ReorderLevel: p.reorderLevel,
      InventoryValuationCost: p.costPrice * p.stockQuantity,
      InventoryValuationRetail: p.sellingPrice * p.stockQuantity,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `LUMEN_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Inventory & Catalog Management
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Real-time stock quantities, reorder thresholds, inventory valuation, and unit profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold text-[var(--text-primary)] hover:border-[#10D6A0]/40 hover:bg-white/5 transition"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <DownloadIcon size={14} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a] transition shadow-lg shadow-emerald-500/20"
          >
            <PlusIcon size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Inventory Valuation (Cost)</p>
          <p className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{formatCurrency(stats.valuationCost, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Valuation (Retail Market)</p>
          <p className="text-xl font-extrabold text-[#10D6A0] mt-1">{formatCurrency(stats.valuationRetail, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Potential Inventory Profit</p>
          <p className="text-xl font-extrabold text-[#55B8FF] mt-1">{formatCurrency(stats.potentialProfit, currency)}</p>
        </div>
        <div className="lumen-card p-4">
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">Low Stock Alerts</p>
          <p className="text-xl font-extrabold text-[#FF647C] mt-1">{stats.lowStockCount} items</p>
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
            placeholder="Search products by SKU, name, or category…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-black/20 text-xs font-medium focus:outline-none focus:border-[#10D6A0] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border bg-black/20 text-xs font-medium text-[var(--text-primary)] focus:outline-none"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border bg-black/20 text-xs font-medium text-[var(--text-primary)] focus:outline-none"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock Only (≤ Reorder)</option>
            <option value="out">Out of Stock</option>
            <option value="ok">Healthy Stock</option>
          </select>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="lumen-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b uppercase font-bold tracking-wider text-[var(--text-muted)] bg-black/10" style={{ borderColor: 'var(--border-color)' }}>
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Unit Margin</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Stock Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)' }}>
              {filteredProducts.map((p) => {
                const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100 : 0;
                const isLow = (p.stockQuantity || 0) <= (p.reorderLevel || 0);

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#55B8FF]">{p.sku}</td>
                    <td className="py-3.5 px-4 font-semibold">{p.name}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{p.category}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-[var(--text-muted)]">
                      {formatCurrency(p.costPrice, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">
                      {formatCurrency(p.sellingPrice, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#10D6A0]">
                      {margin.toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold">
                      {p.stockQuantity} <span className="text-[10px] text-[var(--text-muted)] font-normal">{p.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isLow
                            ? 'bg-rose-500/15 text-[#FF647C] border border-rose-500/30'
                            : 'bg-emerald-500/15 text-[#10D6A0]'
                        }`}
                      >
                        {isLow ? `Low (${p.stockQuantity}/${p.reorderLevel})` : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openAdjustModal(p)}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold text-[#10D6A0] hover:bg-emerald-500/10 border border-emerald-500/20"
                          title="Adjust Stock"
                        >
                          ± Stock
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 text-[var(--text-muted)] hover:text-[#10D6A0]"
                          title="Edit"
                        >
                          <Edit3Icon size={14} />
                        </button>
                        <button
                          onClick={() => p.id && deleteProduct(p.id)}
                          className="p-1 text-[var(--text-muted)] hover:text-[#FF647C]"
                          title="Delete"
                        >
                          <Trash2Icon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="font-bold text-sm text-[var(--text-primary)]">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Inventory Product'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Product Name *</label>
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
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">SKU Barcode *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs font-mono text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="pcs, box, license"
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Cost Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)] font-bold"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Selling Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)] font-bold text-[#10D6A0]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Opening Stock Quantity</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)] font-bold"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] font-semibold mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value) || 5)}
                    className="w-full p-2.5 rounded-xl border bg-black/20 text-xs text-[var(--text-primary)]"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      {isAdjustModalOpen && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="font-bold text-xs text-[var(--text-primary)]">Stock Adjustment</h3>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{adjustTarget.name}</p>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <p className="text-[var(--text-muted)]">Current Stock: <span className="font-bold text-[var(--text-primary)]">{adjustTarget.stockQuantity} {adjustTarget.unit}</span></p>
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Stock Delta (+ to add, - to subtract)</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  placeholder="e.g. +10 or -3"
                  className="w-full p-2.5 rounded-xl border bg-black/20 text-sm font-bold text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-black bg-[#10D6A0] hover:bg-[#0eb88a]"
                >
                  Apply Delta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
