'use client';

import { useRef, useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { buildWaLink } from '@/lib/whatsapp';
import { INQUIRY_FIELDS, inquiryMessage, validateInquiry, type InquiryType } from '@/lib/inquiry';
import { getSource, track } from '@/lib/analytics';
import { useSiteConfig } from './SiteConfig';

/**
 * Inquiry form (catering, gifting, corporate). On submit it:
 *  1. validates on the client (same rules as the server),
 *  2. opens WhatsApp with a prefilled summary (primary channel),
 *  3. stores the inquiry in the CMS (Admin → Permintaan masuk) so no lead is lost.
 * The confirmation copy only claims what actually happened.
 */
export function InquiryForm({ variant }: { variant: InquiryType }) {
  const fields = INQUIRY_FIELDS[variant] ?? INQUIRY_FIELDS.catering;
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'saved' | 'unsaved'>('idle');
  const [waLink, setWaLink] = useState('');
  const started = useRef(false);
  const hp = useRef<HTMLInputElement>(null);
  const { whatsappNumber } = useSiteConfig();

  function update(name: string, value: string) {
    if (!started.current) {
      started.current = true;
      track('form_start', { form_name: variant });
    }
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { values: clean, errors: errs } = validateInquiry(variant, values);
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      document.getElementById(`inq-${Object.keys(errs).find((k) => errs[k])}`)?.focus();
      return;
    }
    const link = buildWaLink(inquiryMessage(variant, clean), whatsappNumber);
    setWaLink(link);
    // Open WhatsApp right away (inside the click) so pop-up blockers allow it.
    window.open(link, '_blank', 'noopener,noreferrer');
    setState('sending');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: variant, values: clean, website: hp.current?.value ?? '', page: window.location.pathname, source: getSource() }),
      });
      if (res.ok) {
        track('generate_lead', { form_name: variant });
        setState('saved');
      } else setState('unsaved');
    } catch {
      setState('unsaved');
    }
  }

  if (state === 'saved' || state === 'unsaved') {
    return (
      <div role="status" className="rounded-lg border border-teal/15 bg-cream-paper p-8 text-center shadow-soft">
        <p className="font-display text-heading text-teal">
          {state === 'saved' ? 'Terima kasih — permintaan Anda sudah tercatat.' : 'Satu langkah lagi: kirim lewat WhatsApp.'}
        </p>
        <p className="mt-3 text-body text-ink-soft">
          {state === 'saved'
            ? 'Kami juga membuka WhatsApp berisi ringkasan permintaan Anda — kirim pesannya agar kami bisa membalas lebih cepat. '
            : 'Permintaan belum tersimpan di sistem kami, jadi mohon kirim ringkasannya lewat WhatsApp. '}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-teal underline underline-offset-4">
            Buka WhatsApp
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Formulir permintaan">
      {/* Honeypot: hidden from people, filled by spam bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input ref={hp} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {fields.map((f) => {
        const id = `inq-${f.name}`;
        const err = errors[f.name];
        const errId = `${id}-err`;
        const common = {
          id,
          value: values[f.name] ?? '',
          'aria-required': f.required,
          'aria-invalid': err ? true : undefined,
          'aria-describedby': err ? errId : undefined,
          className: cn(inputClass, err && errorClass),
        };
        return (
          <div key={f.name}>
            <label htmlFor={id} className="block text-caption font-medium text-teal">
              {f.label}
              {f.required && <span className="text-terracotta-deep"> *</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea {...common} rows={3} maxLength={f.max} placeholder={f.placeholder} onChange={(e) => update(f.name, e.target.value)} />
            ) : f.type === 'select' ? (
              <select {...common} onChange={(e) => update(f.name, e.target.value)}>
                <option value="">— pilih —</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...common}
                type={f.type ?? 'text'}
                inputMode={f.type === 'number' ? 'numeric' : undefined}
                maxLength={f.type === 'number' ? undefined : f.max}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                onChange={(e) => update(f.name, e.target.value)}
              />
            )}
            {err && (
              <p id={errId} className="mt-1.5 text-caption text-songketRed">
                {err === 'Wajib diisi' ? 'Bagian ini perlu diisi ya.' : err}
              </p>
            )}
          </div>
        );
      })}

      <p className="text-caption text-ink-soft">
        Setelah dikirim, kami mencatat permintaan Anda dan membuka WhatsApp berisi ringkasannya. Data hanya dipakai untuk menindaklanjuti permintaan ini.
      </p>

      <Button type="submit" size="lg" disabled={state === 'sending'}>
        {variant === 'gifting' ? 'Kirim permintaan' : 'Minta penawaran'}
      </Button>
    </form>
  );
}

const inputClass =
  'mt-2 block min-h-[44px] w-full rounded border border-teal/25 bg-cream-paper px-4 py-2.5 text-body text-ink placeholder:text-ink/40 focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1 focus-visible:ring-offset-cream';
const errorClass = 'border-songketRed/60';
