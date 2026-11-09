import type { SanityClient } from 'sanity';

/**
 * Repairs documents whose IDs contain a dot (e.g. "subBrand.dama-kapau").
 *
 * Sanity treats any ID containing "." as a private path: public, token-less
 * reads — which is how the website reads content — cannot see them. Early
 * versions of the import tool created such IDs, so edits to those documents
 * (including uploaded photos) never reached the site.
 *
 * The repair copies each affected document (published and draft) to the same
 * ID with dots replaced by hyphens, rewrites every reference that pointed at
 * the old ID, then deletes the old document — all in one atomic transaction.
 * Content edited in Studio wins over any placeholder already at the new ID.
 */

const CONTENT_TYPES = [
  'siteSettings',
  'subBrand',
  'product',
  'pillar',
  'brandValue',
  'testimonial',
  'journalPost',
  'page',
];

type Doc = Record<string, unknown> & { _id: string; _type: string };

function splitId(id: string) {
  return id.startsWith('drafts.')
    ? { draft: true, base: id.slice('drafts.'.length) }
    : { draft: false, base: id };
}

const toSafeBase = (base: string) => base.replace(/\./g, '-');

/** Deep-copy `value`, swapping any reference whose target was renamed. */
function rewriteRefs(value: unknown, renamed: Map<string, string>): [unknown, boolean] {
  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((v) => {
      const [nv, c] = rewriteRefs(v, renamed);
      changed ||= c;
      return nv;
    });
    return [out, changed];
  }
  if (value && typeof value === 'object') {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '_ref' && typeof v === 'string' && renamed.has(v)) {
        out[k] = renamed.get(v);
        changed = true;
      } else {
        const [nv, c] = rewriteRefs(v, renamed);
        out[k] = nv;
        changed ||= c;
      }
    }
    return [out, changed];
  }
  return [value, false];
}

function stripSystemFields(doc: Record<string, unknown>) {
  const { _rev, _createdAt, _updatedAt, ...rest } = doc;
  return rest as Doc;
}

export interface RepairPlan {
  /** Documents to move: old ID → new ID. */
  moves: { from: string; to: string; type: string }[];
  /** Documents that keep their ID but get references rewritten. */
  patched: string[];
  /** Ready-to-run mutations. */
  creates: Doc[];
  deletes: string[];
}

export async function planRepair(client: SanityClient): Promise<RepairPlan> {
  const raw = client.withConfig({ perspective: 'raw' });
  const docs = await raw.fetch<Doc[]>('*[_type in $types]', { types: CONTENT_TYPES });
  const candidates = docs.filter((d) => !d._id.startsWith('versions.'));

  const renamed = new Map<string, string>();
  for (const d of candidates) {
    const { base } = splitId(d._id);
    if (base.includes('.')) renamed.set(base, toSafeBase(base));
  }

  const plan: RepairPlan = { moves: [], patched: [], creates: [], deletes: [] };
  if (renamed.size === 0) return plan;

  for (const d of candidates) {
    const { draft, base } = splitId(d._id);
    const [rewritten, refsChanged] = rewriteRefs(d, renamed);
    const clean = stripSystemFields(rewritten as Record<string, unknown>);

    if (base.includes('.')) {
      const newId = `${draft ? 'drafts.' : ''}${toSafeBase(base)}`;
      plan.moves.push({ from: d._id, to: newId, type: d._type });
      plan.creates.push({ ...clean, _id: newId });
      plan.deletes.push(d._id);
    } else if (refsChanged) {
      plan.patched.push(d._id);
      plan.creates.push({ ...clean, _id: d._id });
    }
  }
  return plan;
}

export async function runRepair(client: SanityClient, plan: RepairPlan) {
  if (plan.creates.length === 0 && plan.deletes.length === 0) return;
  const tx = client.transaction();
  // Write new/updated docs first so references stay valid when old IDs go.
  plan.creates.forEach((d) => tx.createOrReplace(d));
  plan.deletes.forEach((id) => tx.delete(id));
  await tx.commit({ visibility: 'sync' });
}
