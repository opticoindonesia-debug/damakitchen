import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { and, eq, gt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { ensureReady } from '@/lib/bootstrap';
import { sendInquiryEmail } from '@/lib/email';
import { INQUIRY_FIELDS, inquiryMessage, validateInquiry, type InquiryType } from '@/lib/inquiry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES = Object.keys(INQUIRY_FIELDS) as InquiryType[];

/**
 * Stores a website inquiry (Admin → Permintaan masuk). Spam protection:
 * honeypot field, same-site origin check, max 5 submissions / 10 min / IP.
 */
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ ok: false }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Format tidak valid.' }, { status: 400 });
  }
  const type = body.type as InquiryType;
  if (!TYPES.includes(type)) return NextResponse.json({ ok: false, error: 'Jenis permintaan tidak dikenal.' }, { status: 400 });
  // Honeypot filled → pretend success, store nothing.
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });

  const { values, errors } = validateInquiry(type, (body.values as Record<string, unknown>) ?? {});
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 400 });

  await ensureReady();
  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown').trim();
  const ipHash = createHash('sha256').update(`dama-inq:${ip}`).digest('hex');
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(inquiries)
    .where(and(eq(inquiries.ipHash, ipHash), gt(inquiries.createdAt, new Date(Date.now() - 10 * 60_000))));
  if (Number(n) >= 5) return NextResponse.json({ ok: false, error: 'Terlalu banyak permintaan. Silakan lanjutkan lewat WhatsApp.' }, { status: 429 });

  const rawSource = body.source && typeof body.source === 'object' ? (body.source as Record<string, unknown>) : null;
  const source = rawSource
    ? Object.fromEntries(Object.entries(rawSource).filter(([k, v]) => /^[a-z_]{2,20}$/.test(k) && typeof v === 'string').map(([k, v]) => [k, String(v).slice(0, 200)]))
    : null;

  const [res] = await db.insert(inquiries).values({
    type,
    name: values.nama ?? null,
    company: values.perusahaan ?? null,
    email: values.email ?? null,
    phone: values.whatsapp ?? null,
    data: values,
    pagePath: typeof body.page === 'string' ? body.page.slice(0, 255) : null,
    source,
    ipHash,
  });

  // Optional email notification (only if a provider is configured; never blocks).
  await sendInquiryEmail({ subject: `Permintaan baru (${type}) — ${values.perusahaan ?? values.nama ?? ''}`, text: inquiryMessage(type, values) }).catch(() => undefined);

  return NextResponse.json({ ok: true, id: res.insertId });
}
