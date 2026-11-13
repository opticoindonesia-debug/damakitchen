'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { changePassword, createUser, resetUserPassword, setUserActive, signOutEverywhere } from '@/app/admin/actions/misc';
import { Badge, Button, Card, Field, Input, NoticeBar, Select, confirmAction, useAction } from '@/components/admin/ui';

type User = { id: number; email: string; name: string; role: string; isActive: boolean; lastLoginAt: string | null };

export function AccountEditor({ me, users }: { me: { id: number; email: string; name: string; role: string }; users: User[] }) {
  const router = useRouter();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [nu, setNu] = useState({ email: '', name: '', role: 'editor', password: '' });
  const { busy, notice, setNotice, run } = useAction();
  return (
    <div className="space-y-5">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card title="Ganti kata sandi" description={`Masuk sebagai ${me.name} (${me.email}) · ${me.role === 'owner' ? 'Pemilik' : 'Editor'}`}>
        <form className="grid max-w-md gap-3" onSubmit={async (e) => {
          e.preventDefault();
          const res = await run('pw', () => changePassword(pw));
          if (res.ok) setPw({ current: '', next: '', confirm: '' });
        }}>
          <Field label="Kata sandi saat ini" htmlFor="pw-cur"><Input id="pw-cur" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></Field>
          <Field label="Kata sandi baru (min. 10 karakter)" htmlFor="pw-new"><Input id="pw-new" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required /></Field>
          <Field label="Ulangi kata sandi baru" htmlFor="pw-conf"><Input id="pw-conf" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required /></Field>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" busy={busy === 'pw'}>Ganti kata sandi</Button>
            <Button onClick={async () => {
              if (!confirmAction('Keluarkan akun Anda dari semua perangkat?')) return;
              const res = await run('out', () => signOutEverywhere());
              if (res.ok) router.push('/admin/login');
            }}>Keluar dari semua perangkat</Button>
          </div>
        </form>
      </Card>
      {me.role === 'owner' && (
        <>
          <Card title="Pengguna admin">
            <ul className="divide-y divide-stone-100 text-sm">
              {users.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <div className="flex-1">
                    <p className="font-medium">{u.name} <span className="font-normal text-stone-500">· {u.email}</span></p>
                    <p className="text-xs text-stone-500">{u.role === 'owner' ? 'Pemilik' : 'Editor'} · terakhir masuk {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('id-ID') : 'belum pernah'}</p>
                  </div>
                  {u.isActive ? <Badge tone="green">Aktif</Badge> : <Badge>Nonaktif</Badge>}
                  {u.id !== me.id && (
                    <>
                      <Button size="sm" onClick={async () => {
                        const p = window.prompt(`Kata sandi baru untuk ${u.email} (min. 10 karakter):`);
                        if (!p) return;
                        await run('reset', () => resetUserPassword(u.id, p));
                      }}>Atur ulang sandi</Button>
                      <Button size="sm" variant={u.isActive ? 'danger' : 'secondary'} onClick={async () => {
                        if (u.isActive && !confirmAction(`Nonaktifkan ${u.email}? Ia tidak bisa masuk lagi.`)) return;
                        const res = await run('act', () => setUserActive(u.id, !u.isActive));
                        if (res.ok) router.refresh();
                      }}>{u.isActive ? 'Nonaktifkan' : 'Aktifkan'}</Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Tambah pengguna" description="Editor bisa mengubah semua konten; hanya pemilik yang bisa mengelola pengguna, memulihkan cadangan.">
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
              e.preventDefault();
              const res = await run('new', () => createUser(nu));
              if (res.ok) { setNu({ email: '', name: '', role: 'editor', password: '' }); router.refresh(); }
            }}>
              <Field label="Nama" htmlFor="nu-name"><Input id="nu-name" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} required /></Field>
              <Field label="Email" htmlFor="nu-email"><Input id="nu-email" type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} required /></Field>
              <Field label="Peran" htmlFor="nu-role">
                <Select id="nu-role" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}>
                  <option value="editor">Editor</option>
                  <option value="owner">Pemilik</option>
                </Select>
              </Field>
              <Field label="Kata sandi sementara" htmlFor="nu-pw"><Input id="nu-pw" type="password" autoComplete="new-password" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} required /></Field>
              <div><Button type="submit" variant="primary" busy={busy === 'new'}>Tambah pengguna</Button></div>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
