/** Result shape returned by every admin server action (client-safe). */
export type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; problems?: string[] };
