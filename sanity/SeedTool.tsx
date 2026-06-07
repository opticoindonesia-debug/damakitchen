'use client';

import { useState } from 'react';
import { useClient } from 'sanity';
import { buildSeedDocs } from './seedData';

/**
 * In-Studio "Impor Konten Awal" tool.
 *
 * Fills an empty Studio with the website's placeholder content using the
 * editor's own logged-in session — no terminal, no token. Uses
 * createIfNotExists so it never overwrites content you've already edited.
 */
export function SeedTool() {
  const client = useClient({ apiVersion: '2024-10-01' });
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function run() {
    setState('running');
    setMessage('Mengimpor…');
    try {
      const docs = buildSeedDocs();
      const tx = client.transaction();
      // createIfNotExists = aman: tidak menimpa konten yang sudah Anda edit.
      docs.forEach((d) => tx.createIfNotExists(d as never));
      await tx.commit();
      setState('done');
      setMessage(
        `Selesai. ${docs.length} item disiapkan (sub-brand, produk, pilar, nilai, testimoni, pengaturan). ` +
          'Buka menu di kiri untuk mulai mengedit. Item yang sudah ada tidak ditimpa.',
      );
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px', fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Impor Konten Awal</h1>
      <p style={{ lineHeight: 1.6, color: '#556', marginBottom: 20 }}>
        Tombol ini mengisi Studio dengan semua teks placeholder yang ada di website (sub-brand,
        produk/menu, pilar, nilai, testimoni, dan pengaturan situs) supaya Anda tinggal mengedit,
        bukan mulai dari kosong. Foto belum ikut — silakan unggah sendiri tiap item setelah impor.
      </p>
      <div
        style={{
          background: '#FFF8E1',
          border: '1px solid #F0E0A8',
          borderRadius: 8,
          padding: '12px 16px',
          color: '#6b5a1e',
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        Aman dijalankan: item yang sudah Anda buat/edit <strong>tidak akan ditimpa</strong>. Cukup
        dipakai sekali di awal.
      </div>

      <button
        type="button"
        onClick={run}
        disabled={state === 'running'}
        style={{
          background: state === 'running' ? '#9bb' : '#1F4D4D',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 20px',
          fontSize: 15,
          fontWeight: 600,
          cursor: state === 'running' ? 'default' : 'pointer',
        }}
      >
        {state === 'running' ? 'Mengimpor…' : 'Impor konten placeholder sekarang'}
      </button>

      {message && (
        <p
          style={{
            marginTop: 20,
            padding: '12px 16px',
            borderRadius: 8,
            lineHeight: 1.6,
            background: state === 'error' ? '#FDECEC' : '#EAF5EF',
            color: state === 'error' ? '#9b2c2c' : '#1F4D4D',
          }}
        >
          {state === 'done' ? '✓ ' : state === 'error' ? '✗ ' : ''}
          {message}
        </p>
      )}
    </div>
  );
}
