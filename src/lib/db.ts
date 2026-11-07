// src/lib/db.ts
// Robust IndexedDB database with Dexie for LUMEN.AI
import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  type: 'sale' | 'expense' | 'purchase' | 'income' | 'refund' | 'transfer';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  invoiceNo?: string;
  referenceNo?: string;
  customerId?: number;
  customerName?: string;
  vendorId?: number;
  vendorName?: string;
  status?: 'completed' | 'pending' | 'cancelled';
  createdAt: number;
}

export interface Product {
  id?: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  updatedAt: number;
}

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  gstin?: string;
  address?: string;
  balance: number;
  totalPurchases: number;
  createdAt: number;
}

export interface Vendor {
  id?: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  gstin?: string;
  address?: string;
  balance: number;
  totalPaid: number;
  createdAt: number;
}

export interface InvoiceItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  customerId?: number;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerGstin?: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  subtotal: number;
  discountAmount: number;
  taxTotal: number;
  total: number;
  template: 'modern' | 'classic' | 'minimal';
  notes?: string;
  items: InvoiceItem[];
  createdAt: number;
}

export interface SaleItem {
  productId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface Sale {
  id?: number;
  saleNumber: string;
  customerId?: number;
  customerName: string;
  date: string;
  total: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: string;
  items: SaleItem[];
  createdAt: number;
}

export interface PurchaseItem {
  productId?: number;
  name: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  total: number;
}

export interface Purchase {
  id?: number;
  purchaseNumber: string;
  vendorId?: number;
  vendorName: string;
  date: string;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  items: PurchaseItem[];
  createdAt: number;
}

export interface Budget {
  id?: number;
  category: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
  workspaceId?: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export interface UserRecord {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar?: string;
  workspaceId: string;
  createdAt: number;
  lastLogin?: number;
  isDeleted?: boolean;
}

export interface AuditLog {
  id?: number;
  action: string;
  performedBy: string;
  performedByRole: string;
  target: string;
  details: string;
  timestamp: number;
}

export interface DeletedRecord {
  id?: number;
  entityType: 'transaction' | 'user' | 'product' | 'invoice' | 'customer' | 'vendor';
  originalId: number;
  summary: string;
  data: string;
  deletedBy: string;
  deletedAt: number;
}

export interface Preference {
  key: string;
  value: string;
}

export class LumenDatabase extends Dexie {
  transactions!: Table<Transaction>;
  products!: Table<Product>;
  customers!: Table<Customer>;
  vendors!: Table<Vendor>;
  invoices!: Table<Invoice>;
  sales!: Table<Sale>;
  purchases!: Table<Purchase>;
  budgets!: Table<Budget>;
  preferences!: Table<Preference>;
  users!: Table<UserRecord>;
  audit_logs!: Table<AuditLog>;
  deleted_records!: Table<DeletedRecord>;

  constructor() {
    super('lumen-ai-db');
    this.version(2).stores({
      transactions: '++id, type, date, category, currency, createdAt',
      products: '++id, name, sku, category, stockQuantity, reorderLevel',
      preferences: 'key',
    });

    this.version(3).stores({
      transactions: '++id, type, date, category, currency, createdAt, paymentMethod, referenceNo, customerId, vendorId',
      products: '++id, name, sku, category, stockQuantity, reorderLevel',
      customers: '++id, name, email, phone, company, createdAt',
      vendors: '++id, name, email, phone, company, createdAt',
      invoices: '++id, invoiceNumber, customerId, date, dueDate, status, total, createdAt',
      sales: '++id, saleNumber, customerId, date, paymentStatus, total, createdAt',
      purchases: '++id, purchaseNumber, vendorId, date, paymentStatus, total, createdAt',
      budgets: '++id, category, month',
      preferences: 'key',
    });

    this.version(4).stores({
      transactions: '++id, type, date, category, currency, createdAt, paymentMethod, referenceNo, customerId, vendorId, workspaceId, isDeleted',
      products: '++id, name, sku, category, stockQuantity, reorderLevel, workspaceId, isDeleted',
      customers: '++id, name, email, phone, company, createdAt, workspaceId, isDeleted',
      vendors: '++id, name, email, phone, company, createdAt, workspaceId, isDeleted',
      invoices: '++id, invoiceNumber, customerId, date, dueDate, status, total, createdAt, workspaceId, isDeleted',
      sales: '++id, saleNumber, customerId, date, paymentStatus, total, createdAt, workspaceId, isDeleted',
      purchases: '++id, purchaseNumber, vendorId, date, paymentStatus, total, createdAt, workspaceId, isDeleted',
      budgets: '++id, category, month, workspaceId',
      preferences: 'key',
      users: '++id, email, name, role, status, workspaceId, isDeleted, createdAt',
      audit_logs: '++id, action, performedBy, target, timestamp',
      deleted_records: '++id, entityType, originalId, deletedAt',
    });
  }
}

let _db: LumenDatabase | null = null;

export function getDb(): LumenDatabase {
  if (typeof window === 'undefined') {
    throw new Error('getDb() must be called in a browser environment');
  }
  if (!_db) {
    _db = new LumenDatabase();
  }
  return _db;
}

// ─── Preferences Accessors ─────────────────────────────────────────────
export async function getPref(key: string): Promise<string | undefined> {
  if (typeof window === 'undefined') return undefined;
  try {
    const db = getDb();
    const row = await db.preferences.get(key);
    return row?.value;
  } catch {
    return undefined;
  }
}

export async function setPref(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = getDb();
    await db.preferences.put({ key, value });
  } catch (err) {
    console.error('Failed to set preference:', err);
  }
}

// ─── Initial High-Fidelity Seeding ─────────────────────────────────────
export async function seedInitialDataIfEmpty(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = getDb();
    const txCount = await db.transactions.count();

    // Default business profile settings
    const existingBiz = await getPref('business_name');
    if (!existingBiz) {
      await setPref('business_name', 'Acme Traders Pvt. Ltd.');
      await setPref('user_name', 'Amit Kumar');
      await setPref('user_role', 'Admin');
      await setPref('user_email', 'amit@acmetraders.com');
      await setPref('business_gstin', '27AABCU9603R1ZM');
      await setPref('business_address', '402, High-Tech Corporate Park, Andheri East, Mumbai 400069');
      await setPref('business_phone', '+91 98200 12345');
      await setPref('currency', 'INR');
      await setPref('financial_year', '2024-2025');
    }

    // Products Seed
    const prodCount = await db.products.count();
    if (prodCount === 0) {
      const sampleProducts: Product[] = [
        {
          name: 'Wireless Headphones ANC',
          sku: 'WHP-ANC-01',
          category: 'Audio',
          unit: 'pcs',
          costPrice: 2200,
          sellingPrice: 3800,
          stockQuantity: 45,
          reorderLevel: 15,
          updatedAt: Date.now(),
        },
        {
          name: 'Smart Watch Fitness Pro',
          sku: 'SW-PRO-02',
          category: 'Wearables',
          unit: 'pcs',
          costPrice: 2800,
          sellingPrice: 4800,
          stockQuantity: 32,
          reorderLevel: 10,
          updatedAt: Date.now(),
        },
        {
          name: 'Bluetooth Speaker 20W',
          sku: 'SPK-BT-20',
          category: 'Audio',
          unit: 'pcs',
          costPrice: 1500,
          sellingPrice: 2600,
          stockQuantity: 28,
          reorderLevel: 10,
          updatedAt: Date.now(),
        },
        {
          name: 'Fast Wireless Charging Pad',
          sku: 'CHG-WL-15',
          category: 'Accessories',
          unit: 'pcs',
          costPrice: 650,
          sellingPrice: 1250,
          stockQuantity: 64,
          reorderLevel: 20,
          updatedAt: Date.now(),
        },
        {
          name: 'Thermal Receipt Printer 80mm',
          sku: 'PRN-TH-080',
          category: 'Hardware',
          unit: 'pcs',
          costPrice: 2800,
          sellingPrice: 4600,
          stockQuantity: 4, // Low stock alert!
          reorderLevel: 8,
          updatedAt: Date.now(),
        },
        {
          name: 'Heavy Duty Cash Drawer',
          sku: 'CD-MET-405',
          category: 'Hardware',
          unit: 'pcs',
          costPrice: 1400,
          sellingPrice: 2450,
          stockQuantity: 2, // Low stock alert!
          reorderLevel: 6,
          updatedAt: Date.now(),
        },
      ];
      await db.products.bulkAdd(sampleProducts);
    }

    // Customers Seed
    const custCount = await db.customers.count();
    if (custCount === 0) {
      const sampleCustomers: Customer[] = [
        {
          name: 'Metro Retail Outlets Ltd.',
          email: 'accounts@metrooutlets.in',
          phone: '+91 98111 22334',
          company: 'Metro Retail Outlets Ltd.',
          gstin: '27AABCM8291F1Z1',
          address: 'Bandra Kurla Complex, Mumbai',
          balance: 170000,
          totalPurchases: 540000,
          createdAt: Date.now() - 30 * 86400000,
        },
        {
          name: 'Apex Digital Solutions',
          email: 'procurement@apexdigital.com',
          phone: '+91 98222 33445',
          company: 'Apex Digital Solutions',
          gstin: '27AABCA7162K1Z9',
          address: 'Viman Nagar, Pune',
          balance: 94000, // Overdue
          totalPurchases: 320000,
          createdAt: Date.now() - 45 * 86400000,
        },
        {
          name: 'Nexus Electronics Hub',
          email: 'contact@nexushub.in',
          phone: '+91 98333 44556',
          company: 'Nexus Electronics Hub',
          gstin: '27AABCN9928D1ZQ',
          address: 'Connaught Place, New Delhi',
          balance: 0,
          totalPurchases: 285000,
          createdAt: Date.now() - 60 * 86400000,
        },
      ];
      await db.customers.bulkAdd(sampleCustomers);
    }

    // Vendors Seed
    const vendCount = await db.vendors.count();
    if (vendCount === 0) {
      const sampleVendors: Vendor[] = [
        {
          name: 'ABC Supplies & Tech Imports',
          email: 'orders@abcsupplies.in',
          phone: '+91 99000 11223',
          company: 'ABC Supplies Ltd.',
          gstin: '29AABCA1234F1ZX',
          address: 'Electronic City, Bengaluru',
          balance: 82000,
          totalPaid: 650000,
          createdAt: Date.now() - 90 * 86400000,
        },
        {
          name: 'Maharashtra State Electricity Board',
          email: 'billing@mseb.gov.in',
          phone: '1800 200 3434',
          company: 'MSEDCL',
          address: 'Mumbai Central',
          balance: 18400,
          totalPaid: 120000,
          createdAt: Date.now() - 120 * 86400000,
        },
        {
          name: 'Global Audio Precision Corp.',
          email: 'export@globalaudiopc.com',
          phone: '+852 9123 4567',
          company: 'Global Audio Precision Corp.',
          address: 'Hong Kong Commercial Hub',
          balance: 0,
          totalPaid: 940000,
          createdAt: Date.now() - 150 * 86400000,
        },
      ];
      await db.vendors.bulkAdd(sampleVendors);
    }

    // Invoices Seed
    const invCount = await db.invoices.count();
    if (invCount === 0) {
      const sampleInvoices: Invoice[] = [
        {
          invoiceNumber: 'INV-1045',
          customerName: 'Metro Retail Outlets Ltd.',
          customerEmail: 'accounts@metrooutlets.in',
          date: '2025-01-31',
          dueDate: '2025-02-15',
          status: 'pending',
          subtotal: 144068,
          discountAmount: 0,
          taxTotal: 25932,
          total: 170000,
          template: 'modern',
          items: [
            { description: 'Wireless Headphones ANC (30 units)', quantity: 30, unitPrice: 3800, taxRate: 18, total: 114000 },
            { description: 'Bluetooth Speaker 20W (15 units)', quantity: 15, unitPrice: 2600, taxRate: 18, total: 39000 },
          ],
          createdAt: Date.now() - 5 * 86400000,
        },
        {
          invoiceNumber: 'INV-1040',
          customerName: 'Apex Digital Solutions',
          customerEmail: 'procurement@apexdigital.com',
          date: '2025-01-10',
          dueDate: '2025-01-25',
          status: 'overdue',
          subtotal: 79661,
          discountAmount: 0,
          taxTotal: 14339,
          total: 94000,
          template: 'modern',
          items: [
            { description: 'Smart Watch Fitness Pro (15 units)', quantity: 15, unitPrice: 4800, taxRate: 18, total: 72000 },
            { description: 'Fast Wireless Charging Pad (14 units)', quantity: 14, unitPrice: 1250, taxRate: 18, total: 17500 },
          ],
          createdAt: Date.now() - 25 * 86400000,
        },
      ];
      await db.invoices.bulkAdd(sampleInvoices);
    }

    // Transactions Seed
    // Match the target numbers:
    // Total Revenue: ₹12,48,000
    // Total Expenses: ₹7,32,500
    // Net Profit: ₹5,15,500
    // Available Cash: ₹9,24,000
    if (txCount === 0) {
      const sampleTransactions: Transaction[] = [
        // January 2025 Sales (Total = ₹12,48,000)
        {
          type: 'sale',
          amount: 248000,
          currency: 'INR',
          category: 'Audio Products',
          description: 'Sales - INV-1045 Wireless Headphones ANC Bulk order',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'INV-1045',
          referenceNo: 'TXN-20250131-01',
          customerName: 'Metro Retail Outlets Ltd.',
          date: '2025-01-31',
          createdAt: Date.now() - 86400000,
        },
        {
          type: 'sale',
          amount: 186000,
          currency: 'INR',
          category: 'Wearables',
          description: 'Sales - Smart Watch Fitness Pro Corporate deployment',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'INV-1044',
          referenceNo: 'TXN-20250128-02',
          customerName: 'Apex Digital Solutions',
          date: '2025-01-28',
          createdAt: Date.now() - 3 * 86400000,
        },
        {
          type: 'sale',
          amount: 124000,
          currency: 'INR',
          category: 'Audio Products',
          description: 'Sales - Bluetooth Speaker 20W Store distribution',
          paymentMethod: 'UPI',
          invoiceNo: 'INV-1043',
          referenceNo: 'UPI-7718293041',
          customerName: 'Nexus Electronics Hub',
          date: '2025-01-25',
          createdAt: Date.now() - 6 * 86400000,
        },
        {
          type: 'sale',
          amount: 310000,
          currency: 'INR',
          category: 'Consumer Electronics',
          description: 'Sales - Mid-month electronic gear bundle shipment',
          paymentMethod: 'Card',
          invoiceNo: 'INV-1042',
          referenceNo: 'TXN-20250117-03',
          customerName: 'Metro Retail Outlets Ltd.',
          date: '2025-01-17',
          createdAt: Date.now() - 14 * 86400000,
        },
        {
          type: 'sale',
          amount: 235000,
          currency: 'INR',
          category: 'Hardware',
          description: 'Sales - POS Terminals and Scanners install batch',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'INV-1041',
          referenceNo: 'TXN-20250109-04',
          customerName: 'Retail Point Chains',
          date: '2025-01-09',
          createdAt: Date.now() - 22 * 86400000,
        },
        {
          type: 'sale',
          amount: 145000,
          currency: 'INR',
          category: 'Accessories',
          description: 'Sales - New Year retail kickoff accessories',
          paymentMethod: 'UPI',
          invoiceNo: 'INV-1040',
          referenceNo: 'UPI-9920194812',
          customerName: 'Apex Digital Solutions',
          date: '2025-01-02',
          createdAt: Date.now() - 29 * 86400000,
        },

        // January 2025 Expenses & Purchases (Total = ₹7,32,500)
        // Inventory Purchases: 34.1% (~₹2,49,800)
        {
          type: 'purchase',
          amount: 249800,
          currency: 'INR',
          category: 'Inventory',
          description: 'Purchase - PO-778 Raw materials & electronic component restock',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'PO-778',
          referenceNo: 'TXN-PUR-0130',
          vendorName: 'ABC Supplies Ltd.',
          date: '2025-01-30',
          createdAt: Date.now() - 2 * 86400000,
        },
        // Salaries: 18.7% (~₹1,37,000)
        {
          type: 'expense',
          amount: 137000,
          currency: 'INR',
          category: 'Salaries',
          description: 'Expense - January Employee payroll & team performance bonus',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'PAY-2025-01',
          referenceNo: 'TXN-PAY-0101',
          date: '2025-01-05',
          createdAt: Date.now() - 26 * 86400000,
        },
        // Marketing: 12.6% (~₹92,300)
        {
          type: 'expense',
          amount: 92300,
          currency: 'INR',
          category: 'Marketing',
          description: 'Expense - Google Ads & Meta advertising campaign',
          paymentMethod: 'Card',
          invoiceNo: 'MKT-2025-01',
          referenceNo: 'CARD-AD-8841',
          date: '2025-01-15',
          createdAt: Date.now() - 16 * 86400000,
        },
        // Utilities: 8.9% (~₹65,200)
        {
          type: 'expense',
          amount: 65200,
          currency: 'INR',
          category: 'Utilities',
          description: 'Expense - High-speed fiber network & warehouse power bill',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'UTL-2025-01',
          referenceNo: 'MSEB-8812904',
          vendorName: 'MSEDCL',
          date: '2025-01-12',
          createdAt: Date.now() - 19 * 86400000,
        },
        // Rent: 8.2% (~₹60,000)
        {
          type: 'expense',
          amount: 60000,
          currency: 'INR',
          category: 'Rent',
          description: 'Expense - Commercial Office Rent & Maintenance',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'RNT-2025-01',
          referenceNo: 'NEFT-RENT-01',
          date: '2025-01-03',
          createdAt: Date.now() - 28 * 86400000,
        },
        // Other: 17.5% (~₹1,28,200)
        {
          type: 'expense',
          amount: 128200,
          currency: 'INR',
          category: 'Other',
          description: 'Expense - Freight forwarding, cloud SaaS subscriptions & legal filings',
          paymentMethod: 'Bank Transfer',
          invoiceNo: 'OTH-2025-01',
          referenceNo: 'TXN-OTH-0120',
          date: '2025-01-20',
          createdAt: Date.now() - 11 * 86400000,
        },

        // Historical prior months data (for trend analysis and chart matching!)
        // December 2024 (Inflow ₹12.1L, Outflow ₹7.2L)
        {
          type: 'sale',
          amount: 1210000,
          currency: 'INR',
          category: 'Consumer Electronics',
          description: 'December aggregate sales revenue',
          paymentMethod: 'Bank Transfer',
          date: '2024-12-28',
          createdAt: Date.now() - 40 * 86400000,
        },
        {
          type: 'expense',
          amount: 720000,
          currency: 'INR',
          category: 'Inventory',
          description: 'December aggregate operating costs',
          paymentMethod: 'Bank Transfer',
          date: '2024-12-30',
          createdAt: Date.now() - 38 * 86400000,
        },
        // November 2024 (Inflow ₹11.8L, Outflow ₹7.0L)
        {
          type: 'sale',
          amount: 1180000,
          currency: 'INR',
          category: 'Consumer Electronics',
          description: 'November aggregate sales revenue',
          paymentMethod: 'Bank Transfer',
          date: '2024-11-28',
          createdAt: Date.now() - 70 * 86400000,
        },
        {
          type: 'expense',
          amount: 700000,
          currency: 'INR',
          category: 'Inventory',
          description: 'November aggregate operating costs',
          paymentMethod: 'Bank Transfer',
          date: '2024-11-30',
          createdAt: Date.now() - 68 * 86400000,
        },
        // October 2024 (Inflow ₹11.2L, Outflow ₹7.4L)
        {
          type: 'sale',
          amount: 1120000,
          currency: 'INR',
          category: 'Consumer Electronics',
          description: 'October aggregate sales revenue',
          paymentMethod: 'Bank Transfer',
          date: '2024-10-28',
          createdAt: Date.now() - 100 * 86400000,
        },
        {
          type: 'expense',
          amount: 740000,
          currency: 'INR',
          category: 'Inventory',
          description: 'October aggregate operating costs',
          paymentMethod: 'Bank Transfer',
          date: '2024-10-30',
          createdAt: Date.now() - 98 * 86400000,
        },
        // September 2024 (Inflow ₹10.5L, Outflow ₹7.1L)
        {
          type: 'sale',
          amount: 1050000,
          currency: 'INR',
          category: 'Consumer Electronics',
          description: 'September aggregate sales revenue',
          paymentMethod: 'Bank Transfer',
          date: '2024-09-28',
          createdAt: Date.now() - 130 * 86400000,
        },
        {
          type: 'expense',
          amount: 710000,
          currency: 'INR',
          category: 'Inventory',
          description: 'September aggregate operating costs',
          paymentMethod: 'Bank Transfer',
          date: '2024-09-30',
          createdAt: Date.now() - 128 * 86400000,
        },
        // August 2024 (Inflow ₹9.2L, Outflow ₹6.8L)
        {
          type: 'sale',
          amount: 920000,
          currency: 'INR',
          category: 'Consumer Electronics',
          description: 'August aggregate sales revenue',
          paymentMethod: 'Bank Transfer',
          date: '2024-08-28',
          createdAt: Date.now() - 160 * 86400000,
        },
        {
          type: 'expense',
          amount: 680000,
          currency: 'INR',
          category: 'Inventory',
          description: 'August aggregate operating costs',
          paymentMethod: 'Bank Transfer',
          date: '2024-08-30',
          createdAt: Date.now() - 158 * 86400000,
        },
      ];
      await db.transactions.bulkAdd(sampleTransactions);
    }

    // Users Seed
    const userCount = await db.users.count();
    if (userCount === 0) {
      const sampleUsers: UserRecord[] = [
        {
          name: 'Amit Kumar',
          email: 'amit@acmetraders.com',
          role: 'SUPER_ADMIN',
          status: 'active',
          workspaceId: 'ws-default',
          createdAt: Date.now() - 60 * 86400000,
          lastLogin: Date.now() - 10 * 60000,
        },
        {
          name: 'Priya Sharma',
          email: 'priya@acmetraders.com',
          role: 'ADMIN',
          status: 'active',
          workspaceId: 'ws-default',
          createdAt: Date.now() - 45 * 86400000,
          lastLogin: Date.now() - 3600000,
        },
        {
          name: 'Rajesh Patel',
          email: 'rajesh@acmetraders.com',
          role: 'MANAGER',
          status: 'active',
          workspaceId: 'ws-default',
          createdAt: Date.now() - 30 * 86400000,
          lastLogin: Date.now() - 86400000,
        },
        {
          name: 'Neha Verma',
          email: 'neha@acmetraders.com',
          role: 'STAFF',
          status: 'active',
          workspaceId: 'ws-default',
          createdAt: Date.now() - 15 * 86400000,
          lastLogin: Date.now() - 2 * 86400000,
        },
        {
          name: 'Kunal Mehta',
          email: 'kunal@acmetraders.com',
          role: 'VIEWER',
          status: 'inactive',
          workspaceId: 'ws-default',
          createdAt: Date.now() - 5 * 86400000,
        },
      ];
      await db.users.bulkAdd(sampleUsers);
    }

    // Audit Logs Seed
    const auditCount = await db.audit_logs.count();
    if (auditCount === 0) {
      const sampleLogs: AuditLog[] = [
        {
          action: 'SYSTEM_INITIALIZATION',
          performedBy: 'Amit Kumar',
          performedByRole: 'SUPER_ADMIN',
          target: 'Acme Traders Workspace',
          details: 'Initialized secure enterprise workspace and established RBAC security policies.',
          timestamp: Date.now() - 60 * 86400000,
        },
        {
          action: 'USER_ROLE_ASSIGNED',
          performedBy: 'Amit Kumar',
          performedByRole: 'SUPER_ADMIN',
          target: 'Priya Sharma (priya@acmetraders.com)',
          details: 'Promoted account privileges to ADMIN.',
          timestamp: Date.now() - 45 * 86400000,
        },
        {
          action: 'USER_DEACTIVATED',
          performedBy: 'Amit Kumar',
          performedByRole: 'SUPER_ADMIN',
          target: 'Kunal Mehta (kunal@acmetraders.com)',
          details: 'Deactivated dormant contractor viewer account pending security review.',
          timestamp: Date.now() - 5 * 86400000,
        },
      ];
      await db.audit_logs.bulkAdd(sampleLogs);
    }
  } catch (err) {
    console.error('Failed to seed initial data:', err);
  }
}
