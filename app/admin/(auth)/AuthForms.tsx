'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, setupAction, type FormState } from '../actions/auth';
import { Field, Input } from '@/components/admin/ui';

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-[44px] w-full items-center justify-center rounded-md bg-[#1F4D4D] px-4 text-sm font-medium text-white hover:bg-[#173b3b] disabled:opacity-60"
    >
      {pending ? 'Memproses…' : children}
    </button>
  );
}

function Message({ state }: { state: FormState }) {
  if (state?.error) return <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>;
  if (state?.ok) return <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{state.ok}</p>;
  return null;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ''} />
      <Message state={state} />
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Kata sandi" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Submit>Masuk</Submit>
    </form>
  );
}

export function SetupForm({ firstRun }: { firstRun: boolean }) {
  const [state, action] = useFormState(setupAction, undefined);
  if (state?.ok) {
    return (
      <div className="space-y-4">
        <Message state={state} />
        <Link href="/admin/login" className="flex min-h-[44px] items-center justify-center rounded-md bg-[#1F4D4D] text-sm font-medium text-white">
          Ke halaman masuk
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <Message state={state} />
      <Field label="Kode setup (ADMIN_SETUP_TOKEN)" htmlFor="token" help="Nilai yang Anda isi di pengaturan environment server (hPanel).">
        <Input id="token" name="token" type="password" autoComplete="off" required />
      </Field>
      {firstRun && (
        <Field label="Nama" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
      )}
      <Field label="Email" htmlFor="email" help={firstRun ? undefined : 'Email akun yang kata sandinya ingin diatur ulang.'}>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label={firstRun ? 'Kata sandi' : 'Kata sandi baru'} htmlFor="password" help="Minimal 10 karakter. Gunakan kalimat yang mudah Anda ingat tapi sulit ditebak.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <Field label="Ulangi kata sandi" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <Submit>{firstRun ? 'Buat akun pemilik' : 'Atur ulang kata sandi'}</Submit>
    </form>
  );
}
