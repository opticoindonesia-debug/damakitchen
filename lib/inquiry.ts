/**
 * Inquiry form definitions — shared by the form (client) and /api/inquiry
 * (server validation), so both always agree on fields and rules.
 */
export type InquiryType = 'catering' | 'gifting' | 'corporate';

export interface InquiryField {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'textarea' | 'email' | 'tel' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  autoComplete?: string;
  max?: number;
}

const contact: InquiryField[] = [
  { name: 'nama', label: 'Nama Anda', required: true, autoComplete: 'name', max: 120 },
  { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'tel', required: true, placeholder: '08…', autoComplete: 'tel', max: 30 },
];

export const INQUIRY_FIELDS: Record<InquiryType, InquiryField[]> = {
  catering: [
    ...contact,
    { name: 'jenis', label: 'Jenis acara', required: true, placeholder: 'mis. arisan keluarga', max: 120 },
    { name: 'tanggal', label: 'Tanggal acara', type: 'date', required: true },
    { name: 'pax', label: 'Perkiraan jumlah tamu (pax)', type: 'number', required: true, placeholder: '50', max: 6 },
    { name: 'kemasan', label: 'Kemasan yang diinginkan', placeholder: 'prasmanan / besek / bento / box', max: 120 },
    { name: 'lokasi', label: 'Lokasi acara', required: true, placeholder: 'kota / area', max: 160 },
    { name: 'budget', label: 'Kisaran budget', placeholder: 'opsional, membantu kami menyiapkan opsi', max: 80 },
    { name: 'catatan', label: 'Catatan tambahan', type: 'textarea', placeholder: 'preferensi menu, alergi, dll.', max: 1500 },
  ],
  gifting: [
    ...contact,
    { name: 'paket', label: 'Paket yang diminati', required: true, placeholder: 'Si Ketek / Si Sedang / Si Gadang / custom', max: 120 },
    { name: 'jumlah', label: 'Jumlah paket', type: 'number', required: true, placeholder: '10', max: 6 },
    { name: 'tanggal', label: 'Tanggal pengiriman', type: 'date' },
    { name: 'pesan', label: 'Pesan untuk kartu', type: 'textarea', placeholder: 'pesan tulisan tangan yang ingin disertakan', max: 600 },
    { name: 'catatan', label: 'Catatan tambahan', type: 'textarea', placeholder: 'alamat tujuan, preferensi, dll.', max: 1500 },
  ],
  corporate: [
    { name: 'perusahaan', label: 'Nama perusahaan / instansi', required: true, autoComplete: 'organization', max: 160 },
    { name: 'nama', label: 'Nama PIC', required: true, autoComplete: 'name', max: 120 },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', max: 190 },
    { name: 'whatsapp', label: 'Nomor WhatsApp PIC', type: 'tel', required: true, placeholder: '08…', autoComplete: 'tel', max: 30 },
    {
      name: 'kebutuhan',
      label: 'Kebutuhan',
      type: 'select',
      required: true,
      options: ['Nasi kotak untuk acara kantor (DAMA KAPAU)', 'Hampers corporate (TANDO MATO)', 'Belum yakin — ingin konsultasi'],
    },
    { name: 'tanggal', label: 'Tanggal acara / pengiriman', type: 'date' },
    { name: 'lokasi', label: 'Lokasi acara / pengiriman', placeholder: 'kota / area', max: 160 },
    { name: 'jumlah', label: 'Perkiraan jumlah (porsi / paket)', type: 'number', required: true, placeholder: '100', max: 6 },
    { name: 'budget', label: 'Kisaran budget (opsional)', max: 80 },
    { name: 'catatan', label: 'Catatan tambahan', type: 'textarea', placeholder: 'jadwal, preferensi menu, kebutuhan faktur, dll.', max: 1500 },
  ],
};

export const INQUIRY_TITLE: Record<InquiryType, string> = {
  catering: 'Halo DAMA, saya ingin minta penawaran acara.',
  gifting: 'Halo DAMA, saya ingin mengirim hadiah.',
  corporate: 'Halo DAMA, saya ingin minta penawaran untuk kebutuhan perusahaan.',
};

/** Plain-text message (WhatsApp prefill / email body). */
export function inquiryMessage(type: InquiryType, values: Record<string, string>): string {
  const lines = [INQUIRY_TITLE[type]];
  for (const f of INQUIRY_FIELDS[type]) {
    const v = (values[f.name] ?? '').trim();
    if (v) lines.push(`${f.label}: ${v}`);
  }
  return lines.join('\n');
}

/** Validates & trims submitted values; returns errors keyed by field name. */
export function validateInquiry(type: InquiryType, raw: Record<string, unknown>) {
  const values: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const f of INQUIRY_FIELDS[type]) {
    const v = typeof raw[f.name] === 'string' ? (raw[f.name] as string).replace(/[<>]/g, '').trim().slice(0, f.max ?? 300) : '';
    if (f.required && !v) errors[f.name] = 'Wajib diisi';
    else if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[f.name] = 'Email tidak valid';
    else if (v && f.type === 'tel' && !/^\+?[0-9 ()-]{8,20}$/.test(v)) errors[f.name] = 'Nomor tidak valid';
    else if (v && f.type === 'number' && !/^\d{1,6}$/.test(v)) errors[f.name] = 'Isi dengan angka';
    else if (v && f.type === 'select' && !f.options?.includes(v)) errors[f.name] = 'Pilih salah satu';
    if (v) values[f.name] = v;
  }
  return { values, errors };
}
