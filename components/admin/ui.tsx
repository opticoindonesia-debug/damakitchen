'use client';

import Link from 'next/link';
import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Small, dependency-free UI kit for the admin. Calm, high-contrast, touch-friendly. */

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'publish';
const VARIANT: Record<Variant, string> = {
  primary: 'bg-[#1F4D4D] text-white hover:bg-[#173b3b] disabled:bg-[#1F4D4D]/50',
  publish: 'bg-[#C65B3E] text-white hover:bg-[#a8472c] disabled:bg-[#C65B3E]/50',
  secondary: 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 disabled:opacity-50',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-50',
  ghost: 'text-stone-700 hover:bg-stone-100 disabled:opacity-50',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md'; busy?: boolean }>(
  function Button({ variant = 'secondary', size = 'md', busy, className, children, disabled, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || busy}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4D4D] focus-visible:ring-offset-1 disabled:cursor-not-allowed',
          size === 'sm' ? 'min-h-[34px] px-2.5 text-[13px]' : 'min-h-[40px] px-4 text-sm',
          VARIANT[variant],
          className,
        )}
        {...rest}
      >
        {busy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
        {children}
      </button>
    );
  },
);

export function LinkButton({ href, variant = 'secondary', className, children, target }: { href: string; variant?: Variant; className?: string; children: ReactNode; target?: string }) {
  return (
    <Link
      href={href}
      target={target}
      className={cn('inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md px-4 text-sm font-medium transition-colors', VARIANT[variant], className)}
    >
      {children}
    </Link>
  );
}

export function Card({ title, description, actions, children, className }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-stone-200 bg-white p-5 shadow-sm', className)}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-stone-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, help, error, children, htmlFor, className }: { label: ReactNode; help?: ReactNode; error?: string; children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      {children}
      {help && !error && <p className="text-xs text-stone-500">{help}</p>}
      {error && <p className="text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#1F4D4D] focus:outline-none focus:ring-2 focus:ring-[#1F4D4D]/20 disabled:bg-stone-100';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(inputCls, className)} {...p} />;
});

export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputCls, 'min-h-[88px]', className)} {...p} />;
}

export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputCls, 'pr-8', className)} {...p}>
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; id?: string }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-stone-800">
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-5 w-9 shrink-0 rounded-full bg-stone-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#1F4D4D] peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-[#1F4D4D]/40" />
      {label}
    </label>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue'; children: ReactNode }) {
  const t = {
    neutral: 'bg-stone-100 text-stone-700',
    green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    blue: 'bg-sky-50 text-sky-800 ring-sky-200',
  }[tone];
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent', t)}>{children}</span>;
}

export function StatusBadge({ status, hasChanges }: { status: string; hasChanges?: boolean }) {
  if (status === 'published') return <Badge tone={hasChanges ? 'amber' : 'green'}>{hasChanges ? 'Tayang · ada perubahan belum terbit' : 'Tayang'}</Badge>;
  if (status === 'archived') return <Badge>Diarsipkan</Badge>;
  return <Badge tone="blue">Draf</Badge>;
}

export interface Notice {
  tone: 'success' | 'error' | 'info';
  text: string;
  details?: string[];
}

export function NoticeBar({ notice, onClose }: { notice: Notice | null; onClose?: () => void }) {
  useEffect(() => {
    if (notice?.tone === 'success' && onClose) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [notice, onClose]);
  if (!notice) return null;
  const tone = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  }[notice.tone];
  return (
    <div role={notice.tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm', tone)}>
      <div>
        <p className="font-medium">{notice.text}</p>
        {notice.details && notice.details.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {notice.details.slice(0, 8).map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="text-current/70 hover:text-current" aria-label="Tutup pesan">
          ✕
        </button>
      )}
    </div>
  );
}

import type { ActionResult } from '@/lib/admin/result';
export type { ActionResult };

/** Runs a server action and turns its result into a notice. */
export function useAction() {
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  async function run<T>(key: string, fn: () => Promise<ActionResult<T>>, success?: string): Promise<ActionResult<T>> {
    setBusy(key);
    try {
      const res = await fn();
      if (res.ok) {
        if (success || res.message) setNotice({ tone: 'success', text: res.message ?? success! });
      } else {
        setNotice({ tone: 'error', text: res.error, details: res.problems });
      }
      return res;
    } catch {
      const res = { ok: false as const, error: 'Terjadi kesalahan jaringan. Periksa koneksi lalu coba lagi.' };
      setNotice({ tone: 'error', text: res.error });
      return res;
    } finally {
      setBusy(null);
    }
  }
  return { busy, notice, setNotice, run };
}

/** Destructive-action guard: asks for confirmation before running. */
export function confirmAction(message: string): boolean {
  return typeof window !== 'undefined' && window.confirm(message);
}

export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-1 inline-block text-sm text-stone-500 hover:text-stone-800">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-stone-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-600">{children}</div>;
}

export { inputCls };
