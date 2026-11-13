/**
 * Minimal Portable Text → HTML converter, used only by the Sanity importer to
 * turn legacy rich text (journal posts, page text blocks) into the HTML the
 * new CMS stores. Output is sanitized again before saving.
 */

type Span = { _type?: string; text?: string; marks?: string[] };
type Block = {
  _type?: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  children?: Span[];
  markDefs?: { _key: string; _type: string; href?: string }[];
  url?: string;
  alt?: string;
  caption?: string;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function spans(b: Block): string {
  return (b.children ?? [])
    .map((sp) => {
      let html = esc(sp.text ?? '').replace(/\n/g, '<br>');
      for (const m of sp.marks ?? []) {
        if (m === 'strong') html = `<strong>${html}</strong>`;
        else if (m === 'em') html = `<em>${html}</em>`;
        else {
          const def = b.markDefs?.find((d) => d._key === m);
          if (def?._type === 'link' && def.href) html = `<a href="${esc(def.href)}">${html}</a>`;
        }
      }
      return html;
    })
    .join('');
}

/** `resolveImage` maps an image block to a URL (e.g. after uploading the asset). */
export function portableTextToHtml(value: unknown, resolveImage?: (block: Record<string, unknown>) => string | undefined): string {
  if (!Array.isArray(value)) return typeof value === 'string' ? `<p>${esc(value)}</p>` : '';
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of value as Block[]) {
    if (!raw || typeof raw !== 'object') continue;
    if (raw._type === 'image') {
      closeList();
      const url = resolveImage?.(raw as Record<string, unknown>);
      if (url) out.push(`<figure><img src="${esc(url)}" alt="${esc(raw.alt ?? '')}"><figcaption>${esc(raw.caption ?? '')}</figcaption></figure>`);
      continue;
    }
    if (raw._type !== 'block') continue;
    if (raw.listItem) {
      const tag = raw.listItem === 'number' ? 'ol' : 'ul';
      if (list !== tag) {
        closeList();
        out.push(`<${tag}>`);
        list = tag;
      }
      out.push(`<li>${spans(raw)}</li>`);
      continue;
    }
    closeList();
    const inner = spans(raw);
    if (!inner.trim()) continue;
    const style = raw.style ?? 'normal';
    if (style === 'h2' || style === 'h3' || style === 'h4') out.push(`<${style}>${inner}</${style}>`);
    else if (style === 'blockquote') out.push(`<blockquote>${inner}</blockquote>`);
    else out.push(`<p>${inner}</p>`);
  }
  closeList();
  return out.join('');
}
