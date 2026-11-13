import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Password hashing with scrypt (memory-hard KDF built into Node — no native
 * add-on to compile on Hostinger). Format: scrypt$N$r$p$saltB64$hashB64.
 */
const N = 32768;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: 128 * N * R * 2 });
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64');
  const key = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 128 * Number(n) * Number(r) * 2,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** A dummy hash so failed lookups take as long as real ones (no user enumeration by timing). */
export const DUMMY_HASH =
  'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

/** Minimum policy: 10+ characters, not trivially weak. */
export function passwordProblem(password: string, email?: string): string | null {
  if (typeof password !== 'string' || password.length < 10) return 'Kata sandi minimal 10 karakter.';
  if (password.length > 200) return 'Kata sandi terlalu panjang.';
  if (/^(.)\1+$/.test(password)) return 'Kata sandi terlalu mudah ditebak.';
  const lower = password.toLowerCase();
  if (['password', 'qwerty', '1234567890', 'damakitchen', 'adminadmin'].some((w) => lower.includes(w)))
    return 'Kata sandi terlalu umum. Gunakan kalimat unik.';
  if (email && lower.includes(email.split('@')[0].toLowerCase())) return 'Jangan gunakan email Anda sebagai kata sandi.';
  return null;
}
