import { sanitizeRichText } from '@/lib/sanitize';
import { cleanImage, cleanText, isSafeLink } from '@/lib/text';
export { cleanImage, type ImageValue } from '@/lib/text';
import { CHANNEL_OPTIONS, SECTION_BY_TYPE, fieldsOf, type FieldDef } from './definitions';

/**
 * Server-side validation of page-builder sections. Unknown section types and
 * unknown fields are dropped; every value is coerced to its declared type,
 * bounded and sanitized. Returns cleaned sections + human-readable problems.
 */

const KEY_RE = /^[A-Za-z0-9_-]{1,64}$/;
const randomKey = () => Math.random().toString(36).slice(2, 10);

function cleanField(f: FieldDef, v: unknown, path: string, problems: string[]): unknown {
  switch (f.type) {
    case 'text':
    case 'textarea': {
      const s = cleanText(v, f.max ?? (f.type === 'text' ? 300 : 4000));
      if (f.required && !s.trim()) problems.push(`${path}: "${f.label}" wajib diisi`);
      if (f.name === 'anchor' && s && !/^[a-z0-9-]+$/.test(s)) {
        problems.push(`${path}: ID tautan hanya boleh huruf kecil, angka dan "-"`);
        return undefined;
      }
      return s || undefined;
    }
    case 'richtext': {
      const html = sanitizeRichText(v);
      return html || undefined;
    }
    case 'link': {
      if (v === undefined || v === null || v === '') return undefined;
      if (!isSafeLink(v)) {
        problems.push(`${path}: tautan "${String(v).slice(0, 60)}" tidak valid`);
        return undefined;
      }
      return (v as string).trim();
    }
    case 'number': {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) return f.default;
      return Math.min(Math.max(n, f.min ?? -1e9), f.max ?? 1e9);
    }
    case 'boolean':
      return v === true;
    case 'select': {
      if (v === undefined || v === null || v === '') return f.default;
      const s = String(v);
      if (f.optionsFrom === 'subBrands') return /^[a-z0-9-]{1,60}$/.test(s) ? s : undefined;
      return f.options?.some((o) => o.value === s) ? s : f.default;
    }
    case 'channels': {
      if (!Array.isArray(v)) return [];
      const ok = new Set(CHANNEL_OPTIONS.map((o) => o.value));
      return [...new Set(v.map(String).filter((c) => ok.has(c)))];
    }
    case 'image':
      return cleanImage(v);
    case 'images': {
      if (!Array.isArray(v)) return [];
      return v
        .slice(0, f.max ?? 40)
        .map((img) => {
          const c = cleanImage(img);
          if (!c) return undefined;
          const k = (img as Record<string, unknown>)._key;
          return { ...c, _key: typeof k === 'string' && KEY_RE.test(k) ? k : randomKey() };
        })
        .filter(Boolean);
    }
    case 'buttons': {
      if (!Array.isArray(v)) return [];
      return v.slice(0, f.max ?? 3).flatMap((b, i) => {
        const o = (b ?? {}) as Record<string, unknown>;
        const label = cleanText(o.label, 80);
        if (!label) return [];
        if (o.link && !isSafeLink(o.link)) {
          problems.push(`${path} → tombol ${i + 1}: tautan tidak valid`);
          return [];
        }
        return [{
          _key: typeof o._key === 'string' && KEY_RE.test(o._key) ? o._key : randomKey(),
          label,
          link: typeof o.link === 'string' ? o.link.trim() : '',
          style: o.style === 'secondary' ? 'secondary' : 'primary',
        }];
      });
    }
    case 'list': {
      if (!Array.isArray(v)) return [];
      return v.slice(0, f.max ?? 50).map((item, i) => {
        const o = (item ?? {}) as Record<string, unknown>;
        const out: Record<string, unknown> = {
          _key: typeof o._key === 'string' && KEY_RE.test(o._key) ? o._key : randomKey(),
        };
        for (const sub of f.fields ?? []) {
          const val = cleanField(sub, o[sub.name], `${path} → ${f.itemLabel ?? 'item'} ${i + 1}`, problems);
          if (val !== undefined) out[sub.name] = val;
        }
        return out;
      });
    }
  }
}

export function validateSections(input: unknown, where = 'Bagian'): { sections: Record<string, unknown>[]; problems: string[] } {
  const problems: string[] = [];
  if (!Array.isArray(input)) return { sections: [], problems };
  const seen = new Set<string>();
  const sections = input.slice(0, 60).flatMap((raw, i) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const def = SECTION_BY_TYPE[s._type as string];
    if (!def) {
      problems.push(`${where} ${i + 1}: jenis bagian tidak dikenal (diabaikan)`);
      return [];
    }
    let key = typeof s._key === 'string' && KEY_RE.test(s._key) ? s._key : randomKey();
    if (seen.has(key)) key = `${key}-${randomKey()}`;
    seen.add(key);
    const out: Record<string, unknown> = { _type: def.type, _key: key, hidden: s.hidden === true };
    for (const f of fieldsOf(def)) {
      const val = cleanField(f, s[f.name], `${where} ${i + 1} (${def.label})`, problems);
      if (val !== undefined) out[f.name] = val;
    }
    return [out];
  });
  return { sections, problems };
}
