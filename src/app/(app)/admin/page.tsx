'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/db';
import {
  ShieldCheckIcon,
  UsersIcon,
  SearchIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Trash2Icon,
  RefreshCwIcon,
  HistoryIcon,
  PlusIcon,
  ArrowLeftRightIcon,
  Building2Icon,
  XIcon,
} from '@/components/ui/icons';

const ROLE_BADGE_STYLES: Record<UserRole, { bg: string; text: string; border: string }> = {
  SUPER_ADMIN: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  ADMIN: { bg: 'bg-emerald-500/15', text: 'text-[#10D6A0]', border: 'border-emerald-500/30' },
  MANAGER: { bg: 'bg-cyan-500/15', text: 'text-[#55B8FF]', border: 'border-cyan-500/30' },
  STAFF: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  VIEWER: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function AdminPage() {
  const {
    currentUser,
    isSuperAdmin,
    users,
    switchUser,
    toggleUserStatus,
    updateUserRole,
    deleteUserAccount,
    addUserAccount,
    auditLogs,
    deletedRecords,
    restoreDeletedRecord,
    canManageUsers,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'recovery'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STAFF');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  const activeUserCount = users.filter((u) => u.status === 'active').length;
  const inactiveUserCount = users.filter((u) => u.status === 'inactive').length;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    try {
      await addUserAccount({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        status: 'active',
        workspaceId: 'ws-main',
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('STAFF');
      setIsAddUserOpen(false);
      showNotification('User account created successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  // RBAC Access Control Guard
  if (!canManageUsers) {
    return (
      <div className="space-y-6 max-w-xl mx-auto py-16 px-4 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 text-[#FF647C] flex items-center justify-center">
          <ShieldCheckIcon size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            Access Denied: Administrative Clearance Required
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Your current active role is <span className="font-bold text-amber-400">{currentUser.role}</span>.
            The Super Admin Command Center is strictly restricted to authorized <span className="text-[#10D6A0] font-bold">SUPER_ADMIN</span> and{' '}
            <span className="text-[#55B8FF] font-bold">ADMIN</span> accounts.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[var(--text-primary)] font-bold text-xs border border-white/10 transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldCheckIcon size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Super Admin Command Center
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Enterprise User Governance, RBAC Permissions, Audit Trail & Record Recovery
              </p>
            </div>
          </div>
        </div>

        {/* Quick Session Identity Switcher - Authorized Super Admin Testing Only */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">Active Session:</span>
            <select
              value={currentUser.id || 1}
              onChange={(e) => switchUser(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-card)] border-[var(--border-color)] cursor-pointer focus:outline-none focus:border-[#10D6A0]"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[#10D6A0] text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2Icon size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="lumen-card p-4 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Accounts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">{users.length}</span>
            <span className="text-xs text-[#10D6A0] font-semibold">{activeUserCount} Active</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">{inactiveUserCount} Deactivated</p>
        </div>

        <div className="lumen-card p-4 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">RBAC Security</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#55B8FF]">5 Roles</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">Super Admin, Admin, Manager, Staff, Viewer</p>
        </div>

        <div className="lumen-card p-4 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Audit Trail</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400">{auditLogs.length}</span>
            <span className="text-xs text-[var(--text-muted)]">Events</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">Immutable local security log</p>
        </div>

        <div className="lumen-card p-4 space-y-1">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Recoverable Records</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">{deletedRecords.length}</span>
            <span className="text-xs text-[var(--text-muted)]">Deleted</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">1-Click instant restoration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-[#10D6A0] text-[#10D6A0]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <UsersIcon size={15} />
          <span>User Accounts & Permissions ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-[#10D6A0] text-[#10D6A0]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <HistoryIcon size={15} />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'recovery'
              ? 'border-[#10D6A0] text-[#10D6A0]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <RefreshCwIcon size={15} />
          <span>Record Recovery ({deletedRecords.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search accounts by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border text-xs bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#10D6A0] hover:bg-[#0eb88a] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <PlusIcon size={15} />
              <span>Create User Account</span>
            </button>
          </div>

          {/* User Table */}
          <div className="lumen-card overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b bg-white/[0.02] text-[var(--text-muted)] uppercase tracking-wider text-[10px]" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <th className="px-4 py-3">Account / User</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3">Workspace</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const badge = ROLE_BADGE_STYLES[u.role] || ROLE_BADGE_STYLES.VIEWER;
                    const isSelf = u.id === currentUser.id;

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#10D6A0]/20 to-[#55B8FF]/20 border border-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center justify-center">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full rounded-xl object-cover" />
                              ) : (
                                u.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-[#10D6A0] font-semibold">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-[var(--text-muted)]">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Interactive Role Selector */}
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={!canManageUsers}
                            onChange={async (e) => {
                              if (u.id) {
                                await updateUserRole(u.id, e.target.value as UserRole);
                                showNotification(`Updated role for ${u.name} to ${e.target.value}`);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer focus:outline-none ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            <option value="SUPER_ADMIN" className="bg-[#0C1322] text-amber-400">SUPER_ADMIN</option>
                            <option value="ADMIN" className="bg-[#0C1322] text-[#10D6A0]">ADMIN</option>
                            <option value="MANAGER" className="bg-[#0C1322] text-[#55B8FF]">MANAGER</option>
                            <option value="STAFF" className="bg-[#0C1322] text-blue-400">STAFF</option>
                            <option value="VIEWER" className="bg-[#0C1322] text-slate-400">VIEWER</option>
                          </select>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={async () => {
                              if (isSelf) {
                                alert('You cannot deactivate your own active session account.');
                                return;
                              }
                              if (u.id) {
                                await toggleUserStatus(u.id);
                                showNotification(`Account status updated for ${u.name}`);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 transition ${
                              u.status === 'active'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-[#10D6A0] hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 border-rose-500/30 text-[#FF647C] hover:bg-rose-500/25'
                            }`}
                            title="Click to toggle account activation status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-[#10D6A0]' : 'bg-[#FF647C]'}`} />
                            <span className="capitalize">{u.status}</span>
                          </button>
                        </td>

                        <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-[11px]">
                          {u.workspaceId}
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                if (u.id) switchUser(u.id);
                                showNotification(`Switched active session to ${u.name}`);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-[#10D6A0]/40 text-[var(--text-secondary)] hover:text-[#10D6A0] transition text-[11px] font-semibold"
                            >
                              Login As
                            </button>

                            {!isSelf && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete ${u.name}? This record can be restored from the Recovery tab.`)) {
                                    if (u.id) {
                                      await deleteUserAccount(u.id);
                                      showNotification(`Account ${u.name} deleted.`);
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-rose-500/20 text-[#FF647C] hover:bg-rose-500/10 transition"
                                title="Delete user account"
                              >
                                <Trash2Icon size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">
              Real-time audit log of security events, administrative updates, and data deletions.
            </p>
            <span className="text-xs font-mono text-emerald-400">{auditLogs.length} events logged</span>
          </div>

          <div className="lumen-card overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b bg-white/[0.02] text-[var(--text-muted)] uppercase tracking-wider text-[10px]" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor & Role</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[var(--text-muted)] font-sans">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-[var(--text-primary)]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[var(--text-primary)] font-sans font-semibold">{log.performedBy}</span>{' '}
                        <span className="text-[10px] text-amber-400 font-sans">({log.performedByRole})</span>
                      </td>
                      <td className="px-4 py-3 text-[#55B8FF]">{log.target}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] font-sans max-w-md truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DATA RECOVERY */}
      {activeTab === 'recovery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">
              Deleted transactions and soft-deleted accounts are safely held here for instantaneous recovery.
            </p>
            <span className="text-xs font-mono text-[#10D6A0]">{deletedRecords.length} records available</span>
          </div>

          <div className="lumen-card overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b bg-white/[0.02] text-[var(--text-muted)] uppercase tracking-wider text-[10px]" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3">Deleted By</th>
                  <th className="px-4 py-3">Deletion Time</th>
                  <th className="px-4 py-3 text-right">Recovery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deletedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">
                      Recycle bin is empty. No deleted records pending restoration.
                    </td>
                  </tr>
                ) : (
                  deletedRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-[#FF647C]">
                          {item.entityType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                        {item.summary}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {item.deletedBy}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-[11px]">
                        {new Date(item.deletedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={async () => {
                            if (item.id) {
                              await restoreDeletedRecord(item.id);
                              showNotification(`Successfully restored: ${item.summary}`);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[#10D6A0] font-bold text-xs flex items-center gap-1.5 ml-auto transition"
                        >
                          <RefreshCwIcon size={12} />
                          <span>Restore Record</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="lumen-card p-6 w-full max-w-md space-y-4 border-[#10D6A0]/40 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <UsersIcon size={18} className="text-[#10D6A0]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Add Registered User</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@acmetraders.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1">Assign Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[#10D6A0]"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Governance)</option>
                  <option value="ADMIN">ADMIN (Workspace Admin)</option>
                  <option value="MANAGER">MANAGER (Financial Ops & Edits)</option>
                  <option value="STAFF">STAFF (Entry & Read-Only Deletes)</option>
                  <option value="VIEWER">VIEWER (Read-Only Access)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#10D6A0] hover:bg-[#0eb88a] text-black font-bold transition shadow-lg shadow-emerald-500/20"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
