import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface AuditPayload {
  action: string;
  target: string;
  details: string;
  performedBy: string;
  performedByRole: string;
  timestamp?: number;
}

export async function POST(req: Request) {
  try {
    const body: AuditPayload = await req.json();

    if (!body.action || !body.performedBy || !body.performedByRole) {
      return NextResponse.json(
        { error: 'Missing required audit event parameters.' },
        { status: 400 }
      );
    }

    const timestamp = body.timestamp || Date.now();
    const eventString = `${body.action}:${body.performedBy}:${body.performedByRole}:${body.target}:${timestamp}`;
    
    // Cryptographic server signature ensuring integrity
    const secret = process.env.AUDIT_SIGNING_SECRET || 'lumen-audit-integrity-key-2025';
    const integrityHash = crypto.createHmac('sha256', secret).update(eventString).digest('hex');

    return NextResponse.json({
      success: true,
      integrityHash,
      event: {
        ...body,
        timestamp,
      },
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server audit error' },
      { status: 500 }
    );
  }
}
