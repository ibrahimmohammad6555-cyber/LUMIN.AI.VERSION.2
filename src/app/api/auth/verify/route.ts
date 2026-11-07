import { NextResponse } from 'next/server';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

const ROLE_PERMISSIONS: Record<UserRole, {
  canManageUsers: boolean;
  canDeleteRecords: boolean;
  canConfigureSystem: boolean;
  canExportReports: boolean;
  canEditTransactions: boolean;
}> = {
  SUPER_ADMIN: {
    canManageUsers: true,
    canDeleteRecords: true,
    canConfigureSystem: true,
    canExportReports: true,
    canEditTransactions: true,
  },
  ADMIN: {
    canManageUsers: true,
    canDeleteRecords: true,
    canConfigureSystem: true,
    canExportReports: true,
    canEditTransactions: true,
  },
  MANAGER: {
    canManageUsers: false,
    canDeleteRecords: true,
    canConfigureSystem: false,
    canExportReports: true,
    canEditTransactions: true,
  },
  STAFF: {
    canManageUsers: false,
    canDeleteRecords: false,
    canConfigureSystem: false,
    canExportReports: true,
    canEditTransactions: true,
  },
  VIEWER: {
    canManageUsers: false,
    canDeleteRecords: false,
    canConfigureSystem: false,
    canExportReports: true,
    canEditTransactions: false,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, action } = body as { role?: UserRole; action?: string };

    if (!role || !ROLE_PERMISSIONS[role]) {
      return NextResponse.json(
        { error: 'Invalid or missing role parameter.', allowed: false },
        { status: 400 }
      );
    }

    const permissions = ROLE_PERMISSIONS[role];

    if (!action) {
      return NextResponse.json({
        role,
        permissions,
        verified: true,
        timestamp: Date.now(),
      });
    }

    let allowed = false;
    switch (action) {
      case 'MANAGE_USERS':
      case 'UPDATE_ROLE':
      case 'TOGGLE_STATUS':
      case 'DELETE_USER':
        allowed = permissions.canManageUsers;
        break;
      case 'DELETE_RECORD':
      case 'DELETE_TRANSACTION':
        allowed = permissions.canDeleteRecords;
        break;
      case 'CONFIGURE_SYSTEM':
      case 'RESET_DATABASE':
        allowed = permissions.canConfigureSystem;
        break;
      case 'EDIT_TRANSACTION':
        allowed = permissions.canEditTransactions;
        break;
      case 'EXPORT_REPORT':
        allowed = permissions.canExportReports;
        break;
      default:
        allowed = false;
    }

    return NextResponse.json({
      role,
      action,
      allowed,
      permissions,
      serverTime: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
