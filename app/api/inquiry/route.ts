import { NextResponse } from 'next/server';
import { waCatering, waGifting } from '@/lib/whatsapp';
import { sendInquiryEmail } from '@/lib/email';

/**
 * Single inquiry endpoint (§2). For v1 it (a) builds the prefilled WhatsApp
 * deep link returned to the client, and (b) optionally fires an email via the
 * pluggable adapter. No secrets are required for the WhatsApp path.
 */

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Format tidak valid.' }, { status: 400 });
  }

  const type = body.type;

  if (type === 'catering') {
    const data = {
      jenis: String(body.jenis ?? ''),
      tanggal: String(body.tanggal ?? ''),
      pax: String(body.pax ?? ''),
      kemasan: String(body.kemasan ?? ''),
      lokasi: String(body.lokasi ?? ''),
      budget: String(body.budget ?? ''),
      catatan: String(body.catatan ?? ''),
    };
    const waLink = waCatering(data);
    await sendInquiryEmail({
      subject: `Penawaran acara — ${data.jenis || 'tanpa judul'}`,
      text: [
        'Permintaan penawaran acara baru.',
        `Acara: ${data.jenis}`,
        `Tanggal: ${data.tanggal}`,
        `Jumlah: ${data.pax} pax`,
        `Kemasan: ${data.kemasan}`,
        `Lokasi: ${data.lokasi}`,
        `Budget: ${data.budget}`,
        `Catatan: ${data.catatan}`,
      ].join('\n'),
    });
    return NextResponse.json({ ok: true, waLink });
  }

  if (type === 'gifting') {
    const data = {
      paket: String(body.paket ?? ''),
      jumlah: String(body.jumlah ?? ''),
      tanggal: String(body.tanggal ?? ''),
      pesan: String(body.pesan ?? ''),
      catatan: String(body.catatan ?? ''),
    };
    const waLink = waGifting(data);
    await sendInquiryEmail({
      subject: `Permintaan hadiah — ${data.paket || 'custom'}`,
      text: [
        'Permintaan hadiah baru.',
        `Paket: ${data.paket}`,
        `Jumlah: ${data.jumlah}`,
        `Tanggal kirim: ${data.tanggal}`,
        `Pesan kartu: ${data.pesan}`,
        `Catatan: ${data.catatan}`,
      ].join('\n'),
    });
    return NextResponse.json({ ok: true, waLink });
  }

  return NextResponse.json({ ok: false, error: 'Jenis permintaan tidak dikenali.' }, { status: 400 });
}
