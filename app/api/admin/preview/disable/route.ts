import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  draftMode().disable();
  const back = new URL(req.url).searchParams.get('path') ?? '/';
  redirect(/^\/(?!\/)[\w\-/]*$/.test(back) ? back : '/');
}
