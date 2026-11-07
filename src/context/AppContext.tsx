'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { DEFAULT_CURRENCY } from '@/lib/currencies';
import {
  getDb,
  getPref,
  setPref,
  seedInitialDataIfEmpty,
  type Transaction,
  type Product,
  type Customer,
  type Vendor,
  type Invoice,
  type Sale,
  type Purchase,
  type UserRecord,
  type UserRole,
  type AuditLog,
  type DeletedRecord,
} from '@/lib/db';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export type Theme = 'dark' | 'light';

export interface BusinessProfile {
  businessName: string;
  userName: string;
  userRole: string;
  userEmail: string;
  gstin: string;
  address: string;
  phone: string;
  currency: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  timestamp: string;
  link?: string;
  read: boolean;
}

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  currency: string;
  setCurrency: (code: string) => void;
  reducedMotion: boolean;
  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => Promise<void>;

  // Global modals & controls
  isAddTxModalOpen: boolean;
  setIsAddTxModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;

  // Transactions CRUD
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<number>;
  updateTransaction: (id: number, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  refreshTransactions: () => Promise<void>;

  // Products CRUD
  products: Product[];
  isLoadingProducts: boolean;
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Promise<number>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  adjustProductStock: (id: number, delta: number) => Promise<void>;
  refreshProducts: () => Promise<void>;

  // Customers CRUD
  customers: Customer[];
  isLoadingCustomers: boolean;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<number>;
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  refreshCustomers: () => Promise<void>;

  // Vendors CRUD
  vendors: Vendor[];
  isLoadingVendors: boolean;
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Promise<number>;
  updateVendor: (id: number, vendor: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: number) => Promise<void>;
  refreshVendors: () => Promise<void>;

  // Invoices CRUD
  invoices: Invoice[];
  isLoadingInvoices: boolean;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<number>;
  updateInvoice: (id: number, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  refreshInvoices: () => Promise<void>;

  // Sales & Purchases
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<number>;
  purchases: Purchase[];
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<number>;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;

  // Supabase Auth & Cloud Sync
  supabaseUrl: string;
  supabaseAnonKey: string;
  setSupabaseConfig: (url: string, key: string) => Promise<void>;
  authUser: User | null;
  isCloudConnected: boolean;
  syncState: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: string | null;
  syncWithCloud: () => Promise<{ success: boolean; message: string }>;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signupWithSupabase: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logoutSupabase: () => Promise<void>;
  registerCompanyWorkspace: (params: {
    name: string;
    email: string;
    password?: string;
    companyName: string;
  }) => Promise<{ success: boolean; message: string }>;

  // AI Configuration
  aiProvider: 'builtin' | 'openai' | 'gemini';
  aiApiKey: string;
  setAiConfig: (provider: 'builtin' | 'openai' | 'gemini', key: string) => Promise<void>;

  // RBAC & Super Admin User Management
  currentUser: UserRecord;
  users: UserRecord[];
  switchUser: (id: number) => Promise<void>;
  updateUserProfile: (data: Partial<UserRecord>) => Promise<void>;
  toggleUserStatus: (id: number) => Promise<void>;
  updateUserRole: (id: number, role: UserRole) => Promise<void>;
  deleteUserAccount: (id: number) => Promise<void>;
  addUserAccount: (user: Omit<UserRecord, 'id' | 'createdAt'>) => Promise<number>;
  refreshUsers: () => Promise<void>;

  // Audit Logs
  auditLogs: AuditLog[];
  logAudit: (action: string, target: string, details: string) => Promise<void>;
  refreshAuditLogs: () => Promise<void>;

  // Record Recovery
  deletedRecords: DeletedRecord[];
  restoreDeletedRecord: (id: number) => Promise<void>;
  refreshDeletedRecords: () => Promise<void>;

  // Role permissions
  isSuperAdmin: boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;

  // Reset & Backup
  resetAllData: () => Promise<void>;
  reloadSampleData: () => Promise<void>;
  exportJsonBackup: () => Promise<string>;
  importJsonBackup: (jsonData: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Read workspace metadata without requiring every legacy DB interface to declare it. */
function getRecordWorkspaceId(record: unknown): string {
  if (typeof record !== 'object' || record === null) return 'ws-default';
  const value = (record as Record<string, unknown>).workspaceId;
  return typeof value === 'string' && value.trim() ? value : 'ws-default';
}

/** Persist workspace metadata while keeping compatibility with existing DB record types. */
function withWorkspace<T extends object>(record: T, workspaceId: string): T & { workspaceId: string } {
  return { ...record, workspaceId };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessName: 'Acme Traders Pvt. Ltd.',
    userName: 'Amit Kumar',
    userRole: 'Admin',
    userEmail: 'amit@acmetraders.com',
    gstin: '27AABCU9603R1ZM',
    address: '402, High-Tech Corporate Park, Andheri East, Mumbai 400069',
    phone: '+91 98200 12345',
    currency: 'INR',
  });

  // UI state
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('jan-2025');

  // Collections state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Cloud & Auth
  const [supabaseUrl, setSupabaseUrlState] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKeyState] = useState<string>('');
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // AI Config
  const [aiProvider, setAiProvider] = useState<'builtin' | 'openai' | 'gemini'>('builtin');
  const [aiApiKey, setAiApiKey] = useState<string>('');

  // Notifications
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // User Management, RBAC & Recovery
  const [currentUser, setCurrentUser] = useState<UserRecord>({
    id: 1,
    name: 'Amit Kumar',
    email: 'amit@acmetraders.com',
    role: 'SUPER_ADMIN',
    status: 'active',
    workspaceId: 'ws-default',
    createdAt: 1735689600000,
  });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);

  // ─── Refresh Handlers (Isolated by Workspace) ──────────────────────────
  const refreshTransactions = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.transactions
        .filter((t) => getRecordWorkspaceId(t) === wsId)
        .reverse()
        .toArray();
      setTransactions(list);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [currentUser?.workspaceId]);

  const refreshProducts = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.products
        .filter((p) => getRecordWorkspaceId(p) === wsId)
        .toArray();
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [currentUser?.workspaceId]);

  const refreshCustomers = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.customers
        .filter((c) => getRecordWorkspaceId(c) === wsId)
        .toArray();
      setCustomers(list);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [currentUser?.workspaceId]);

  const refreshVendors = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.vendors
        .filter((v) => getRecordWorkspaceId(v) === wsId)
        .toArray();
      setVendors(list);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setIsLoadingVendors(false);
    }
  }, [currentUser?.workspaceId]);

  const refreshInvoices = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.invoices
        .filter((i) => getRecordWorkspaceId(i) === wsId)
        .reverse()
        .toArray();
      setInvoices(list);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [currentUser?.workspaceId]);

  const refreshSales = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.sales
        .filter((s) => getRecordWorkspaceId(s) === wsId)
        .reverse()
        .toArray();
      setSales(list);
    } catch (err) {
      console.error('Failed to load sales:', err);
    }
  }, [currentUser?.workspaceId]);

  const refreshPurchases = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.purchases
        .filter((p) => getRecordWorkspaceId(p) === wsId)
        .reverse()
        .toArray();
      setPurchases(list);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    }
  }, [currentUser?.workspaceId]);

  const refreshUsers = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const wsId = currentUser?.workspaceId || 'ws-default';
      const list = await db.users
        .filter((u) => !u.isDeleted && (u.workspaceId || 'ws-default') === wsId)
        .toArray();
      setUsers(list);
      if (currentUser?.id) {
        const fresh = list.find((u) => u.id === currentUser.id);
        if (fresh) setCurrentUser(fresh);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, [currentUser?.id, currentUser?.workspaceId]);

  const refreshAuditLogs = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const list = await db.audit_logs.orderBy('timestamp').reverse().limit(150).toArray();
      setAuditLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  }, []);

  const refreshDeletedRecords = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const db = getDb();
      const list = await db.deleted_records.orderBy('deletedAt').reverse().toArray();
      setDeletedRecords(list);
    } catch (err) {
      console.error('Failed to load deleted records:', err);
    }
  }, []);

  const logAudit = useCallback(
    async (action: string, target: string, details: string) => {
      try {
        const db = getDb();
        const timestamp = Date.now();
        await db.audit_logs.add({
          action,
          target,
          details,
          performedBy: currentUser?.email || 'admin@lumen.ai',
          performedByRole: currentUser?.role || 'SUPER_ADMIN',
          timestamp,
        });
        await refreshAuditLogs();

        // Server-side audit integrity verification
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            target,
            details,
            performedBy: currentUser?.email || 'admin@lumen.ai',
            performedByRole: currentUser?.role || 'SUPER_ADMIN',
            timestamp,
          }),
        }).catch(() => {});
      } catch (err) {
        console.error('Failed to write audit log:', err);
      }
    },
    [currentUser?.email, currentUser?.role, refreshAuditLogs]
  );

  // ─── Lifecycle Setup ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    (async () => {
      // Load preferences
      const savedTheme = await getPref('theme');
      const savedCurrency = await getPref('currency');
      const savedBiz = await getPref('business_name');
      const savedUser = await getPref('user_name');
      const savedRole = await getPref('user_role');
      const savedEmail = await getPref('user_email');
      const savedGstin = await getPref('business_gstin');
      const savedAddress = await getPref('business_address');
      const savedPhone = await getPref('business_phone');
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const savedUrl = (await getPref('supabase_url')) || envUrl;
      const savedKey = (await getPref('supabase_key')) || envKey;
      const savedSyncTime = await getPref('last_sync_time');
      const savedAiProvider = await getPref('ai_provider');
      const savedAiKey = await getPref('ai_api_key');

      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
      if (savedCurrency) setCurrencyState(savedCurrency);

      setBusinessProfile({
        businessName: savedBiz || 'Acme Traders Pvt. Ltd.',
        userName: savedUser || 'Amit Kumar',
        userRole: savedRole || 'Admin',
        userEmail: savedEmail || 'amit@acmetraders.com',
        gstin: savedGstin || '27AABCU9603R1ZM',
        address: savedAddress || '402, High-Tech Corporate Park, Andheri East, Mumbai 400069',
        phone: savedPhone || '+91 98200 12345',
        currency: savedCurrency || 'INR',
      });

      if (savedAiProvider === 'openai' || savedAiProvider === 'gemini') {
        setAiProvider(savedAiProvider);
      }
      if (savedAiKey) setAiApiKey(savedAiKey);

      if (savedSyncTime) setLastSyncTime(savedSyncTime);

      if (savedUrl && savedKey) {
        setSupabaseUrlState(savedUrl);
        setSupabaseAnonKeyState(savedKey);
        try {
          const client = createClient(savedUrl, savedKey);
          setSupabaseClient(client);
          const { data } = await client.auth.getUser();
          if (data?.user) setAuthUser(data.user);
        } catch (e) {
          console.warn('Failed to initialize Supabase client:', e);
        }
      }

      // Seed initial data
      await seedInitialDataIfEmpty();
      await refreshTransactions();
      await refreshProducts();
      await refreshCustomers();
      await refreshVendors();
      await refreshInvoices();
      await refreshSales();
      await refreshPurchases();
      await refreshUsers();
      await refreshAuditLogs();
      await refreshDeletedRecords();
    })();
  }, [
    refreshTransactions,
    refreshProducts,
    refreshCustomers,
    refreshVendors,
    refreshInvoices,
    refreshSales,
    refreshPurchases,
    refreshUsers,
    refreshAuditLogs,
    refreshDeletedRecords,
  ]);

  // Apply theme to HTML tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Keyboard shortcut for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setPref('theme', next);
      return next;
    });
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    setPref('currency', code);
  }, []);

  const updateBusinessProfile = useCallback(async (profile: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => {
      const updated = { ...prev, ...profile };
      if (profile.businessName) setPref('business_name', profile.businessName);
      if (profile.userName) setPref('user_name', profile.userName);
      if (profile.userRole) setPref('user_role', profile.userRole);
      if (profile.userEmail) setPref('user_email', profile.userEmail);
      if (profile.gstin) setPref('business_gstin', profile.gstin);
      if (profile.address) setPref('business_address', profile.address);
      if (profile.phone) setPref('business_phone', profile.phone);
      if (profile.currency) setPref('currency', profile.currency);
      return updated;
    });
  }, []);

  // ─── CRUD Operations ───────────────────────────────────────────────────
  const addTransaction = useCallback(
    async (tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<number> => {
      const db = getDb();
      const newTransaction = withWorkspace(
        { ...tx, createdAt: Date.now() },
        currentUser?.workspaceId || 'ws-default'
      );
      const newId = await db.transactions.add(newTransaction);
      await refreshTransactions();
      return Number(newId);
    },
    [currentUser?.workspaceId, refreshTransactions]
  );

  const updateTransaction = useCallback(
    async (id: number, tx: Partial<Transaction>): Promise<void> => {
      const db = getDb();
      await db.transactions.update(id, tx);
      await refreshTransactions();
    },
    [refreshTransactions]
  );

  const deleteTransaction = useCallback(
    async (id: number): Promise<void> => {
      // 1. Client role check
      if (currentUser?.role === 'STAFF' || currentUser?.role === 'VIEWER') {
        throw new Error('Access Denied: Ordinary staff and viewers cannot delete financial records.');
      }

      // 2. Server-side RBAC validation
      try {
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: currentUser?.role, action: 'DELETE_TRANSACTION' }),
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (!verifyData.allowed) {
            throw new Error('Access Denied: Server-side RBAC policy rejected record deletion.');
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('Access Denied')) {
          throw err;
        }
      }

      const db = getDb();
      const tx = await db.transactions.get(id);
      if (tx) {
        await db.deleted_records.add({
          entityType: 'transaction',
          originalId: id,
          summary: `Transaction #${id}: ${tx.description} (${tx.type.toUpperCase()} ₹${Number(tx.amount).toLocaleString('en-IN')})`,
          data: JSON.stringify(tx),
          deletedBy: currentUser?.email || 'admin@lumen.ai',
          deletedAt: Date.now(),
        });
        await logAudit('DELETE_TRANSACTION', `tx#${id}`, `Deleted ${tx.type} ₹${tx.amount} (${tx.description})`);
      }
      await db.transactions.delete(id);
      await refreshTransactions();
      await refreshDeletedRecords();
    },
    [currentUser?.email, currentUser?.role, logAudit, refreshDeletedRecords, refreshTransactions]
  );

  const restoreDeletedRecord = useCallback(
    async (id: number): Promise<void> => {
      const db = getDb();
      const item = await db.deleted_records.get(id);
      if (!item) return;
      if (item.entityType === 'transaction') {
        const tx = JSON.parse(item.data);
        delete tx.id;
        await db.transactions.add(tx);
        await refreshTransactions();
      } else if (item.entityType === 'user') {
        await db.users.update(item.originalId, { isDeleted: false });
        await refreshUsers();
      }
      await db.deleted_records.delete(id);
      await logAudit('RESTORE_RECORD', `${item.entityType}#${item.originalId}`, `Restored record: ${item.summary}`);
      await refreshDeletedRecords();
    },
    [logAudit, refreshDeletedRecords, refreshTransactions, refreshUsers]
  );

  const switchUser = useCallback(
    async (id: number) => {
      const db = getDb();
      const u = await db.users.get(id);
      if (u) {
        if (
          (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN') &&
          currentUser?.role !== 'SUPER_ADMIN' &&
          currentUser?.role !== 'ADMIN'
        ) {
          throw new Error('Access Denied: Unprivileged accounts cannot elevate themselves to Administrative roles.');
        }
        setCurrentUser(u);
        setBusinessProfile((prev) => ({
          ...prev,
          userName: u.name,
          userRole: u.role,
          userEmail: u.email,
        }));
        await setPref('user_name', u.name);
        await setPref('user_role', u.role);
        await setPref('user_email', u.email);
        await logAudit('SWITCH_USER_SESSION', u.email, `Switched active session to ${u.name} (${u.role})`);
      }
    },
    [currentUser?.role, logAudit]
  );

  const updateUserProfile = useCallback(
    async (data: Partial<UserRecord>) => {
      const db = getDb();
      if (currentUser?.id) {
        await db.users.update(currentUser.id, data);
        setCurrentUser((prev) => ({ ...prev, ...data }));
        if (data.name || data.email || data.role) {
          setBusinessProfile((prev) => ({
            ...prev,
            userName: data.name || prev.userName,
            userRole: data.role || prev.userRole,
            userEmail: data.email || prev.userEmail,
          }));
          if (data.name) await setPref('user_name', data.name);
          if (data.role) await setPref('user_role', data.role);
          if (data.email) await setPref('user_email', data.email);
        }
        await logAudit('UPDATE_PROFILE', currentUser.email, `Updated profile: ${Object.keys(data).join(', ')}`);
        await refreshUsers();
      }
    },
    [currentUser, logAudit, refreshUsers]
  );

  const toggleUserStatus = useCallback(
    async (id: number) => {
      const db = getDb();
      const target = await db.users.get(id);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'inactive' : 'active';
      await db.users.update(id, { status: nextStatus });
      await logAudit('USER_STATUS_CHANGE', target.email, `Status updated to ${nextStatus}`);
      await refreshUsers();
    },
    [logAudit, refreshUsers]
  );

  const updateUserRole = useCallback(
    async (id: number, role: UserRole) => {
      const db = getDb();
      const target = await db.users.get(id);
      if (!target) return;
      await db.users.update(id, { role });
      await logAudit('USER_ROLE_CHANGE', target.email, `Role updated from ${target.role} to ${role}`);
      await refreshUsers();
    },
    [logAudit, refreshUsers]
  );

  const deleteUserAccount = useCallback(
    async (id: number) => {
      const db = getDb();
      const target = await db.users.get(id);
      if (!target) return;
      await db.users.update(id, { isDeleted: true });
      await db.deleted_records.add({
        entityType: 'user',
        originalId: id,
        summary: `User Account: ${target.name} (${target.email} - ${target.role})`,
        data: JSON.stringify(target),
        deletedBy: currentUser?.email || 'admin@lumen.ai',
        deletedAt: Date.now(),
      });
      await logAudit('DELETE_USER', target.email, `User account soft-deleted: ${target.name}`);
      await refreshUsers();
      await refreshDeletedRecords();
    },
    [currentUser?.email, logAudit, refreshDeletedRecords, refreshUsers]
  );

  const addUserAccount = useCallback(
    async (user: Omit<UserRecord, 'id' | 'createdAt'>): Promise<number> => {
      const db = getDb();
      const newId = await db.users.add({
        ...user,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        isDeleted: false,
      });
      await logAudit('CREATE_USER', user.email, `Created user account for ${user.name} (${user.role})`);
      await refreshUsers();
      return Number(newId);
    },
    [logAudit, refreshUsers]
  );

  const addProduct = useCallback(
    async (product: Omit<Product, 'id' | 'updatedAt'>): Promise<number> => {
      const db = getDb();
      const newId = await db.products.add(
        withWorkspace({ ...product, updatedAt: Date.now() }, currentUser?.workspaceId || 'ws-default')
      );
      await refreshProducts();
      return Number(newId);
    },
    [currentUser?.workspaceId, refreshProducts]
  );

  const updateProduct = useCallback(
    async (id: number, product: Partial<Product>): Promise<void> => {
      const db = getDb();
      await db.products.update(id, {
        ...product,
        updatedAt: Date.now(),
      });
      await refreshProducts();
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (id: number): Promise<void> => {
      const db = getDb();
      await db.products.delete(id);
      await refreshProducts();
    },
    [refreshProducts]
  );

  const adjustProductStock = useCallback(
    async (id: number, delta: number): Promise<void> => {
      const db = getDb();
      const current = await db.products.get(id);
      if (!current) return;
      const newQuantity = Math.max(0, (current.stockQuantity || 0) + delta);
      await db.products.update(id, {
        stockQuantity: newQuantity,
        updatedAt: Date.now(),
      });
      await refreshProducts();
    },
    [refreshProducts]
  );

  const addCustomer = useCallback(
    async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<number> => {
      const db = getDb();
      const newId = await db.customers.add(
        withWorkspace({ ...customer, createdAt: Date.now() }, currentUser?.workspaceId || 'ws-default')
      );
      await refreshCustomers();
      return Number(newId);
    },
    [currentUser?.workspaceId, refreshCustomers]
  );

  const updateCustomer = useCallback(
    async (id: number, customer: Partial<Customer>): Promise<void> => {
      const db = getDb();
      await db.customers.update(id, customer);
      await refreshCustomers();
    },
    [refreshCustomers]
  );

  const deleteCustomer = useCallback(
    async (id: number): Promise<void> => {
      const db = getDb();
      await db.customers.delete(id);
      await refreshCustomers();
    },
    [refreshCustomers]
  );

  const addVendor = useCallback(
    async (vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<number> => {
      const db = getDb();
      const newId = await db.vendors.add(
        withWorkspace({ ...vendor, createdAt: Date.now() }, currentUser?.workspaceId || 'ws-default')
      );
      await refreshVendors();
      return Number(newId);
    },
    [currentUser?.workspaceId, refreshVendors]
  );

  const updateVendor = useCallback(
    async (id: number, vendor: Partial<Vendor>): Promise<void> => {
      const db = getDb();
      await db.vendors.update(id, vendor);
      await refreshVendors();
    },
    [refreshVendors]
  );

  const deleteVendor = useCallback(
    async (id: number): Promise<void> => {
      const db = getDb();
      await db.vendors.delete(id);
      await refreshVendors();
    },
    [refreshVendors]
  );

  const addInvoice = useCallback(
    async (invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<number> => {
      const db = getDb();
      const newId = await db.invoices.add(
        withWorkspace({ ...invoice, createdAt: Date.now() }, currentUser?.workspaceId || 'ws-default')
      );
      await refreshInvoices();
      return Number(newId);
    },
    [currentUser?.workspaceId, refreshInvoices]
  );

  const updateInvoice = useCallback(
    async (id: number, invoice: Partial<Invoice>): Promise<void> => {
      const db = getDb();
      await db.invoices.update(id, invoice);
      await refreshInvoices();
    },
    [refreshInvoices]
  );

  const deleteInvoice = useCallback(
    async (id: number): Promise<void> => {
      const db = getDb();
      await db.invoices.delete(id);
      await refreshInvoices();
    },
    [refreshInvoices]
  );

  const addSale = useCallback(
    async (sale: Omit<Sale, 'id' | 'createdAt'>): Promise<number> => {
      const db = getDb();
      const workspaceId = currentUser?.workspaceId || 'ws-default';
      const newId = await db.sales.add(withWorkspace({ ...sale, createdAt: Date.now() }, workspaceId));
      // Also adjust product stock accordingly
      for (const item of sale.items) {
        if (item.productId) {
          const prod = await db.products.get(item.productId);
          if (prod) {
            await db.products.update(item.productId, {
              stockQuantity: Math.max(0, prod.stockQuantity - item.quantity),
              updatedAt: Date.now(),
            });
          }
        }
      }
      // Also record corresponding transaction
      await db.transactions.add(withWorkspace({
        type: 'sale',
        amount: sale.total,
        currency,
        category: 'Sales',
        description: `Sale ${sale.saleNumber} to ${sale.customerName}`,
        date: sale.date,
        paymentMethod: sale.paymentMethod,
        invoiceNo: sale.saleNumber,
        customerName: sale.customerName,
        createdAt: Date.now(),
      }, workspaceId));
      await refreshSales();
      await refreshProducts();
      await refreshTransactions();
      return Number(newId);
    },
    [currency, currentUser?.workspaceId, refreshSales, refreshProducts, refreshTransactions]
  );

  const addPurchase = useCallback(
    async (purchase: Omit<Purchase, 'id' | 'createdAt'>): Promise<number> => {
      const db = getDb();
      const workspaceId = currentUser?.workspaceId || 'ws-default';
      const newId = await db.purchases.add(withWorkspace({ ...purchase, createdAt: Date.now() }, workspaceId));
      // Increase product stock
      for (const item of purchase.items) {
        if (item.productId) {
          const prod = await db.products.get(item.productId);
          if (prod) {
            await db.products.update(item.productId, {
              stockQuantity: prod.stockQuantity + item.quantity,
              updatedAt: Date.now(),
            });
          }
        }
      }
      // Record transaction
      await db.transactions.add(withWorkspace({
        type: 'purchase',
        amount: purchase.total,
        currency,
        category: 'Inventory',
        description: `Purchase ${purchase.purchaseNumber} from ${purchase.vendorName}`,
        date: purchase.date,
        paymentMethod: purchase.paymentMethod,
        invoiceNo: purchase.purchaseNumber,
        vendorName: purchase.vendorName,
        createdAt: Date.now(),
      }, workspaceId));
      await refreshPurchases();
      await refreshProducts();
      await refreshTransactions();
      return Number(newId);
    },
    [currency, currentUser?.workspaceId, refreshPurchases, refreshProducts, refreshTransactions]
  );

  // ─── Real Notifications from Business Data ──────────────────────────────
  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];

    // Low stock alert
    products.forEach((p) => {
      if ((p.stockQuantity || 0) <= (p.reorderLevel || 0)) {
        list.push({
          id: `low-stock-${p.id}`,
          title: 'Low Stock Alert',
          message: `${p.name} has only ${p.stockQuantity} ${p.unit} remaining (Reorder level: ${p.reorderLevel}).`,
          type: 'warning',
          timestamp: 'Action required',
          link: '/inventory',
          read: readNotifIds.has(`low-stock-${p.id}`),
        });
      }
    });

    // Overdue invoices
    invoices.forEach((inv) => {
      if (inv.status === 'overdue') {
        list.push({
          id: `overdue-inv-${inv.id}`,
          title: 'Overdue Invoice',
          message: `Invoice ${inv.invoiceNumber} for ${inv.customerName} (${currency} ${inv.total.toLocaleString()}) was due on ${inv.dueDate}.`,
          type: 'danger',
          timestamp: 'Overdue',
          link: '/invoices',
          read: readNotifIds.has(`overdue-inv-${inv.id}`),
        });
      }
    });

    // Upcoming vendor payment
    list.push({
      id: 'vendor-due-1',
      title: 'Upcoming Vendor Payment',
      message: 'Payment to ABC Supplies Ltd. of ₹82,000 is due on Feb 5, 2025.',
      type: 'info',
      timestamp: 'Due soon',
      link: '/vendors',
      read: readNotifIds.has('vendor-due-1'),
    });

    return list;
  }, [products, invoices, currency, readNotifIds]);

  const markNotificationRead = useCallback((id: string) => {
    setReadNotifIds((prev) => new Set([...prev, id]));
  }, []);

  // ─── Cloud & Supabase ──────────────────────────────────────────────────
  const setSupabaseConfig = useCallback(async (url: string, key: string) => {
    setSupabaseUrlState(url);
    setSupabaseAnonKeyState(key);
    await setPref('supabase_url', url);
    await setPref('supabase_key', key);
    if (url && key) {
      try {
        const client = createClient(url, key);
        setSupabaseClient(client);
        const { data } = await client.auth.getUser();
        setAuthUser(data?.user ?? null);
      } catch (err) {
        console.error('Error setting up Supabase:', err);
      }
    } else {
      setSupabaseClient(null);
      setAuthUser(null);
    }
  }, []);

  const loginWithSupabase = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      if (!supabaseClient) {
        return { success: false, message: 'Please provide Supabase URL and Anon Key in Settings first.' };
      }
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) return { success: false, message: error.message };
        setAuthUser(data.user);
        return { success: true, message: `Signed in as ${data.user.email}` };
      } catch (err: unknown) {
        return { success: false, message: err instanceof Error ? err.message : 'Login failed' };
      }
    },
    [supabaseClient]
  );

  const signupWithSupabase = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      if (!supabaseClient) {
        return { success: false, message: 'Please provide Supabase URL and Anon Key in Settings first.' };
      }
      try {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) return { success: false, message: error.message };
        if (data.user) setAuthUser(data.user);
        return { success: true, message: 'Account created! Please check your email or proceed.' };
      } catch (err: unknown) {
        return { success: false, message: err instanceof Error ? err.message : 'Sign up failed' };
      }
    },
    [supabaseClient]
  );

  const logoutSupabase = useCallback(async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    setAuthUser(null);
  }, [supabaseClient]);

  const registerCompanyWorkspace = useCallback(
    async (params: {
      name: string;
      email: string;
      password?: string;
      companyName: string;
    }): Promise<{ success: boolean; message: string }> => {
      const name = params.name.trim();
      const email = params.email.trim().toLowerCase();
      const companyName = params.companyName.trim();

      if (!name || !email || !companyName) {
        return { success: false, message: 'Please provide your name, email, and company name.' };
      }

      try {
        // When a password is supplied, create the matching Supabase account first.
        if (params.password) {
          const signup = await signupWithSupabase(email, params.password);
          if (!signup.success) return signup;
        }

        const workspaceId = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newUserId = await addUserAccount({
          name,
          email,
          role: 'SUPER_ADMIN',
          status: 'active',
          workspaceId,
        } as Omit<UserRecord, 'id' | 'createdAt'>);

        const db = getDb();
        const newUser = await db.users.get(newUserId);
        if (!newUser) {
          return { success: false, message: 'The company account was created, but its local user record could not be loaded.' };
        }

        setCurrentUser(newUser);
        setBusinessProfile((previous) => ({
          ...previous,
          businessName: companyName,
          userName: name,
          userRole: 'SUPER_ADMIN',
          userEmail: email,
        }));

        await Promise.all([
          setPref('business_name', companyName),
          setPref('user_name', name),
          setPref('user_role', 'SUPER_ADMIN'),
          setPref('user_email', email),
        ]);

        await logAudit('CREATE_COMPANY_WORKSPACE', workspaceId, `Created workspace for ${companyName}`);
        return { success: true, message: 'Company workspace created successfully.' };
      } catch (err: unknown) {
        return {
          success: false,
          message: err instanceof Error ? err.message : 'Company workspace registration failed.',
        };
      }
    },
    [addUserAccount, logAudit, signupWithSupabase]
  );

  const syncWithCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!supabaseClient) {
      return { success: false, message: 'Cloud sync requires Supabase credentials in Settings.' };
    }
    setSyncState('syncing');
    try {
      const db = getDb();
      const allTx = await db.transactions.toArray();
      const allProds = await db.products.toArray();
      const allCust = await db.customers.toArray();
      const allVend = await db.vendors.toArray();
      const allInv = await db.invoices.toArray();

      await supabaseClient.from('transactions').upsert(allTx);
      await supabaseClient.from('products').upsert(allProds);
      await supabaseClient.from('customers').upsert(allCust);
      await supabaseClient.from('vendors').upsert(allVend);
      await supabaseClient.from('invoices').upsert(allInv);

      const syncTimeString = new Date().toLocaleTimeString();
      setLastSyncTime(syncTimeString);
      await setPref('last_sync_time', syncTimeString);
      setSyncState('synced');
      return { success: true, message: `Cloud sync completed successfully.` };
    } catch (err: unknown) {
      setSyncState('error');
      return { success: false, message: err instanceof Error ? err.message : 'Sync encountered an issue' };
    }
  }, [supabaseClient]);

  // ─── AI Config ─────────────────────────────────────────────────────────
  const setAiConfig = useCallback(async (provider: 'builtin' | 'openai' | 'gemini', key: string) => {
    setAiProvider(provider);
    setAiApiKey(key);
    await setPref('ai_provider', provider);
    await setPref('ai_api_key', key);
  }, []);

  // ─── Reset & Backup ────────────────────────────────────────────────────
  const resetAllData = useCallback(async () => {
    const db = getDb();
    await db.transactions.clear();
    await db.products.clear();
    await db.customers.clear();
    await db.vendors.clear();
    await db.invoices.clear();
    await db.sales.clear();
    await db.purchases.clear();
    await refreshTransactions();
    await refreshProducts();
    await refreshCustomers();
    await refreshVendors();
    await refreshInvoices();
    await refreshSales();
    await refreshPurchases();
  }, [
    refreshTransactions,
    refreshProducts,
    refreshCustomers,
    refreshVendors,
    refreshInvoices,
    refreshSales,
    refreshPurchases,
  ]);

  const reloadSampleData = useCallback(async () => {
    await resetAllData();
    await seedInitialDataIfEmpty();
    await refreshTransactions();
    await refreshProducts();
    await refreshCustomers();
    await refreshVendors();
    await refreshInvoices();
    await refreshSales();
    await refreshPurchases();
  }, [
    resetAllData,
    refreshTransactions,
    refreshProducts,
    refreshCustomers,
    refreshVendors,
    refreshInvoices,
    refreshSales,
    refreshPurchases,
  ]);

  const exportJsonBackup = useCallback(async (): Promise<string> => {
    const db = getDb();
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      businessProfile,
      transactions: await db.transactions.toArray(),
      products: await db.products.toArray(),
      customers: await db.customers.toArray(),
      vendors: await db.vendors.toArray(),
      invoices: await db.invoices.toArray(),
      sales: await db.sales.toArray(),
      purchases: await db.purchases.toArray(),
    };
    return JSON.stringify(backup, null, 2);
  }, [businessProfile]);

  const importJsonBackup = useCallback(
    async (jsonData: string): Promise<boolean> => {
      try {
        const parsed = JSON.parse(jsonData);
        const db = getDb();
        if (parsed.transactions) {
          await db.transactions.clear();
          await db.transactions.bulkAdd(parsed.transactions);
        }
        if (parsed.products) {
          await db.products.clear();
          await db.products.bulkAdd(parsed.products);
        }
        if (parsed.customers) {
          await db.customers.clear();
          await db.customers.bulkAdd(parsed.customers);
        }
        if (parsed.vendors) {
          await db.vendors.clear();
          await db.vendors.bulkAdd(parsed.vendors);
        }
        if (parsed.invoices) {
          await db.invoices.clear();
          await db.invoices.bulkAdd(parsed.invoices);
        }
        if (parsed.sales) {
          await db.sales.clear();
          await db.sales.bulkAdd(parsed.sales);
        }
        if (parsed.purchases) {
          await db.purchases.clear();
          await db.purchases.bulkAdd(parsed.purchases);
        }
        await refreshTransactions();
        await refreshProducts();
        await refreshCustomers();
        await refreshVendors();
        await refreshInvoices();
        await refreshSales();
        await refreshPurchases();
        return true;
      } catch (e) {
        console.error('Failed to import backup:', e);
        return false;
      }
    },
    [
      refreshTransactions,
      refreshProducts,
      refreshCustomers,
      refreshVendors,
      refreshInvoices,
      refreshSales,
      refreshPurchases,
    ]
  );

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        reducedMotion,
        businessProfile,
        updateBusinessProfile,

        isAddTxModalOpen,
        setIsAddTxModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        dateFilter,
        setDateFilter,

        transactions,
        isLoadingTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,

        products,
        isLoadingProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustProductStock,
        refreshProducts,

        customers,
        isLoadingCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        refreshCustomers,

        vendors,
        isLoadingVendors,
        addVendor,
        updateVendor,
        deleteVendor,
        refreshVendors,

        invoices,
        isLoadingInvoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        refreshInvoices,

        sales,
        addSale,
        purchases,
        addPurchase,

        notifications,
        markNotificationRead,

        supabaseUrl,
        supabaseAnonKey,
        setSupabaseConfig,
        authUser,
        isCloudConnected: Boolean(supabaseClient && authUser),
        syncState,
        lastSyncTime,
        syncWithCloud,
        loginWithSupabase,
        signupWithSupabase,
        logoutSupabase,
        registerCompanyWorkspace,

        aiProvider,
        aiApiKey,
        setAiConfig,

        // User Management, RBAC & Recovery
        currentUser,
        users,
        switchUser,
        updateUserProfile,
        toggleUserStatus,
        updateUserRole,
        deleteUserAccount,
        addUserAccount,
        refreshUsers,

        auditLogs,
        logAudit,
        refreshAuditLogs,

        deletedRecords,
        restoreDeletedRecord,
        refreshDeletedRecords,

        isSuperAdmin: currentUser?.role === 'SUPER_ADMIN',
        canManageUsers: currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN',
        canDeleteRecords:
          currentUser?.role === 'SUPER_ADMIN' ||
          currentUser?.role === 'ADMIN' ||
          currentUser?.role === 'MANAGER',

        resetAllData,
        reloadSampleData,
        exportJsonBackup,
        importJsonBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
