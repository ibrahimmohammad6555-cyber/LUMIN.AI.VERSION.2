import { NextResponse } from 'next/server';

export async function GET() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    status: 'operational',
    platform: 'LUMEN.AI Financial OS',
    version: '1.0.0',
    rbacModel: '5-Role Enterprise (SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER)',
    environment: {
      supabaseConfigured: hasSupabaseUrl && hasSupabaseKey,
      cloudSyncReady: hasSupabaseUrl && hasSupabaseKey,
      storageEngine: hasSupabaseUrl ? 'Hybrid (Dexie v4 IndexedDB + Supabase PostgreSQL)' : 'Local-First (Dexie v4 IndexedDB)',
    },
    uptime: process.uptime(),
    serverTime: new Date().toISOString(),
  });
}
