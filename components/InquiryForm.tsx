'use client';

import { useState } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { waCatering, waGifting } from '@/lib/whatsapp';

/**
 * InquiryForm (§7.5, §7.6): client-validated, builds a prefilled WhatsApp
 * quotation link. It posts to /api/inquiry (for the optional email adapter)
 * but always builds the WA link client-side so the redirect is reliable.
 * Labels are human; the confirmation is warm, never saccharine (§5.4).
 */

type Variant = 'catering' | 'gifting';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'textarea';
  required?: boolean;
  placeholder?: string;
  help?: string;
}

const cateringFields: Field[] = [
  { name: 'jenis', label: 'Jenis acara', required: true, placeholder: 'mis. arisan keluarga' },
  { name: 'tanggal', label: 'Tanggal acara', type: 'date', required: true },
  { name: 'pax', label: 'Perkiraan jumlah tamu (pax)', type: 'number', required: true, placeholder: '50' },
  { name: 'kemasan', label: 'Kemasan yang diinginkan', placeholder: 'prasmanan / besek / bento / box' },
  { name: 'lokasi', label: 'Lokasi acara', required: true, placeholder: 'kota / area' },
  { name: 'budget', label: 'Kisaran budget', placeholder: 'opsional, membantu kami menyiapkan opsi' },
  { name: 'catatan', label: 'Catatan tambahan', type: 'textarea', placeholder: 'preferensi menu, alergi, dll.' },
];

const giftingFields: Field[] = [
  { name: 'paket', label: 'Paket yang diminati', required: true, placeholder: 'Si Ketek / Si Sedang / Si Gadang / custom' },
  { name: 'jumlah', label: 'Jumlah paket', type: 'number', required: true, placeholder: '10' },
  { name: 'tanggal', label: 'Tanggal pengiriman', type: 'date' },
  { name: 'pesan', label: 'Pesan untuk kartu', type: 'textarea', placeholder: 'pesan tulisan tangan yang ingin disertakan' },
  { name: 'catatan', label: 'Catatan tambahan', type: 'textarea', placeholder: 'alamat tujuan, preferensi, corporate, dll.' },
];

export function InquiryForm({ variant }: { variant: Variant }) {
  const fields = variant === 'catering' ? cateringFields : giftingFields;
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }));
  }

  function buildLink(): string {
    if (variant === 'catering') {
      return waCatering({
        jenis: values.jenis ?? '',
        tanggal: values.tanggal ?? '',
        pax: values.pax ?? '',
        kemasan: values.kemasan ?? '',
        lokasi: values.lokasi ?? '',
        budget: values.budget ?? '',
        catatan: values.catatan ?? '',
      });
    }
    return waGifting({
      paket: values.paket ?? '',
      jumlah: values.jumlah ?? '',
      tanggal: values.tanggal ?? '',
      pesan: values.pesan ?? '',
      catatan: values.catatan ?? '',
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, boolean> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name]?.trim()) nextErrors[f.name] = true;
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const waLink = buildLink();

    // Fire-and-forget to the email adapter; never block the redirect on it.
    void fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: variant, ...values }),
    }).catch(() => {});

    setSubmitted(true);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-lg border border-teal/15 bg-cream-paper p-8 text-center shadow-soft"
      >
        <p className="font-display text-heading text-teal">
          Terima kasih — pesanmu sudah kami terima.
        </p>
        <p className="mt-3 text-body text-ink-soft">
          Kami membuka WhatsApp dengan ringkasan permintaanmu. Jika tidak terbuka otomatis,{' '}
          <button
            type="button"
            onClick={() => window.open(buildLink(), '_blank', 'noopener,noreferrer')}
            className="text-teal underline underline-offset-4"
          >
            buka di sini
          </button>
          . Kami balas secepatnya.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {fields.map((f) => {
        const id = `inq-${f.name}`;
        const hasError = errors[f.name];
        const errId = `${id}-err`;
        return (
          <div key={f.name}>
            <label htmlFor={id} className="block text-caption font-medium text-teal">
              {f.label}
              {f.required && <span className="text-terracotta-deep"> *</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                id={id}
                rows={3}
                value={values[f.name] ?? ''}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder}
                aria-required={f.required}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errId : undefined}
                className={cn(inputClass, hasError && errorClass)}
              />
            ) : (
              <input
                id={id}
                type={f.type ?? 'text'}
                value={values[f.name] ?? ''}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder}
                aria-required={f.required}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errId : undefined}
                className={cn(inputClass, hasError && errorClass)}
              />
            )}
            {hasError && (
              <p id={errId} className="mt-1.5 text-caption text-songketRed">
                Bagian ini perlu diisi ya.
              </p>
            )}
          </div>
        );
      })}

      <p className="text-caption text-ink-soft">
        Setelah dikirim, kami membuka WhatsApp dengan ringkasan permintaanmu untuk dilanjutkan.
      </p>

      <Button type="submit" size="lg">
        {variant === 'catering' ? 'Minta penawaran' : 'Kirim permintaan'}
      </Button>
    </form>
  );
}

const inputClass =
  'mt-2 block min-h-[44px] w-full rounded border border-teal/25 bg-cream-paper px-4 py-2.5 text-body text-ink placeholder:text-ink/40 focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1 focus-visible:ring-offset-cream';

const errorClass = 'border-songketRed focus-visible:ring-songketRed';
