import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

/** Setup/reset is possible only while a strong ADMIN_SETUP_TOKEN is configured on the server. */
export function setupTokenConfigured(): boolean {
  return (process.env.ADMIN_SETUP_TOKEN ?? '').length >= 16;
}

export function setupTokenValid(token: string): boolean {
  const expected = process.env.ADMIN_SETUP_TOKEN ?? '';
  if (expected.length < 16 || !token) return false;
  const a = createHash('sha256').update(token).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
