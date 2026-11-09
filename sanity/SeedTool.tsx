'use client';

import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { buildSeedDocs } from './seedData';
import { planRepair, runRepair, type RepairPlan } from './migrateIds';

/**
 * "Alat Konten" Studio tool.
 *
 * 1. Repair: finds documents the website cannot see (dotted IDs from early
 *    imports) and moves them to visible IDs, keeping every edit and photo.
 * 2. Import: fills an empty Studio with the website's current content
 *    (createIfNotExists — never overwrites anything already edited).
 */

type Status = 'idle' | 'running' | 'done' | 'error';

const box = (bg: string, border: string, color: string) => ({
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: 8,
  padding: '12px 16px',
  color,
  fontSize: 14,
  lineHeight: 1.6,
});

const button = (busy: boolean, tone: 'primary' | 'warn' = 'primary') => ({
  background: busy ? '#9bb' : tone === 'warn' ? '#A8472C' : '#1F4D4D',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 20px',
  fontSize: 15,
  fontWeight: 600,
  cursor: busy ? 'default' : 'pointer',
});

export function SeedTool() {
  const client = useClient({ apiVersion: '2024-10-01' });

  const [plan, setPlan] = useState<RepairPlan | null>(null);
  const [scanError, setScanError] = useState('');
  const [repairStatus, setRepairStatus] = useState<Status>('idle');
  const [repairMsg, setRepairMsg] = useState('');
  const [importStatus, setImportStatus] = useState<Status>('idle');
  const [importMsg, setImportMsg] = useState('');

  const scan = useCallback(async () => {
    try {
      setScanError('');
      setPlan(await planRepair(client));
    } catch (err) {
      setScanError(err instanceof Error ? err.message : String(err));
    }
  }, [client]);

  useEffect(() => {
    void scan();
  }, [scan]);

  async function repair(): Promise<boolean> {
    setRepairStatus('running');
    setRepairMsg('Memperbaiki…');
    try {
      const current = await planRepair(client);
      await runRepair(client, current);
      setRepairStatus('done');
      setRepairMsg(
        current.moves.length
          ? `Selesai. ${current.moves.length} dokumen kini terlihat oleh website (semua editan & foto tetap utuh).`
          : 'Tidak ada yang perlu diperbaiki.',
      );
      await scan();
      return true;
    } catch (err) {
      setRepairStatus('error');
      setRepairMsg(err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async function importContent() {
    setImportStatus('running');
    setImportMsg('Menyiapkan…');
    try {
      // Repair first so imports never duplicate hidden, already-edited docs.
      const pending = await planRepair(client);
      if (pending.moves.length) {
        const ok = await repair();
        if (!ok) throw new Error('Perbaikan data gagal; impor dibatalkan.');
      }
      // Carry over anything already edited in Pengaturan Situs (newest version).
      const settings = await client.fetch<Record<string, unknown> | null>(
        '*[_id in ["siteSettings", "drafts.siteSettings"]] | order(_updatedAt desc)[0]',
      );
      const docs = buildSeedDocs(settings);
      const tx = client.transaction();
      docs.forEach((d) => tx.createIfNotExists(d as never));
      await tx.commit();
      setImportStatus('done');
      setImportMsg(
        `Selesai. ${docs.length} item disiapkan. Item yang sudah ada tidak ditimpa — buka menu di kiri untuk mengedit.`,
      );
    } catch (err) {
      setImportStatus('error');
      setImportMsg(err instanceof Error ? err.message : String(err));
    }
  }

  const hidden = plan?.moves.length ?? 0;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px', fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Alat Konten</h1>
      <p style={{ lineHeight: 1.6, color: '#556', marginBottom: 28 }}>
        Dua alat bantu sekali-klik untuk menjaga isi Studio selalu tampil di website.
      </p>

      {/* ── 1. Repair ── */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>1. Periksa konten tersembunyi</h2>
        {scanError && <p style={box('#FDECEC', '#F3C4C4', '#9b2c2c')}>Gagal memeriksa: {scanError}</p>}
        {!plan && !scanError && <p style={{ color: '#556' }}>Memeriksa…</p>}
        {plan && hidden === 0 && (
          <p style={box('#EAF5EF', '#CDE6D7', '#1F4D4D')}>
            ✓ Semua konten terlihat oleh website. Tidak ada yang perlu diperbaiki.
          </p>
        )}
        {plan && hidden > 0 && (
          <>
            <p style={{ ...box('#FFF8E1', '#F0E0A8', '#6b5a1e'), marginBottom: 16 }}>
              Ditemukan <strong>{hidden} dokumen</strong> yang sudah Anda isi/edit tetapi{' '}
              <strong>tidak terlihat oleh website</strong> (akibat format ID lama). Perbaikan memindahkan
              semuanya ke format yang benar — <strong>semua teks dan foto tetap utuh</strong>.
            </p>
            <button
              type="button"
              onClick={repair}
              disabled={repairStatus === 'running'}
              style={button(repairStatus === 'running', 'warn')}
            >
              {repairStatus === 'running' ? 'Memperbaiki…' : `Perbaiki ${hidden} dokumen sekarang`}
            </button>
          </>
        )}
        {repairMsg && (
          <p
            style={{
              ...box(
                repairStatus === 'error' ? '#FDECEC' : '#EAF5EF',
                repairStatus === 'error' ? '#F3C4C4' : '#CDE6D7',
                repairStatus === 'error' ? '#9b2c2c' : '#1F4D4D',
              ),
              marginTop: 16,
            }}
          >
            {repairMsg}
          </p>
        )}
      </section>

      {/* ── 2. Import ── */}
      <section>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>2. Impor konten awal</h2>
        <p style={{ lineHeight: 1.6, color: '#556', marginBottom: 16 }}>
          Mengisi Studio dengan semua isi website saat ini — teks sub-brand, produk, pilar, nilai,
          testimoni, pengaturan, dan <strong>susunan halaman</strong> (Beranda, Cerita,
          Katering, Hadiah, Kontak, Pesan, Menu) — supaya Anda tinggal mengedit. Item yang sudah ada{' '}
          <strong>tidak ditimpa</strong>, jadi aman diklik kapan saja.
        </p>
        <button
          type="button"
          onClick={importContent}
          disabled={importStatus === 'running'}
          style={button(importStatus === 'running')}
        >
          {importStatus === 'running' ? 'Mengimpor…' : 'Impor konten sekarang'}
        </button>
        {importMsg && (
          <p
            style={{
              ...box(
                importStatus === 'error' ? '#FDECEC' : '#EAF5EF',
                importStatus === 'error' ? '#F3C4C4' : '#CDE6D7',
                importStatus === 'error' ? '#9b2c2c' : '#1F4D4D',
              ),
              marginTop: 16,
            }}
          >
            {importMsg}
          </p>
        )}
      </section>
    </div>
  );
}
