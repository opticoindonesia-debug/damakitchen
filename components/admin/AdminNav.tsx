'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  Brush,
  FileText,
  Home,
  ImageIcon,
  Inbox,
  LayoutList,
  Menu,
  MessagesSquare,
  Package,
  Save,
  Settings,
  Store,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { logoutAction } from '@/app/admin/actions/auth';
import { cn } from '@/lib/utils';

const GROUPS: { title: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  { title: '', items: [{ href: '/admin', label: 'Dasbor', icon: Home }, { href: '/admin/inquiries', label: 'Permintaan masuk', icon: Inbox }] },
  {
    title: 'Konten',
    items: [
      { href: '/admin/pages', label: 'Halaman', icon: LayoutList },
      { href: '/admin/products', label: 'Produk & harga', icon: Package },
      { href: '/admin/sub-brands', label: 'Sub-brand', icon: Store },
      { href: '/admin/articles', label: 'Catatan Dapur', icon: BookOpen },
      { href: '/admin/collections', label: 'Testimoni, FAQ & nilai', icon: MessagesSquare },
      { href: '/admin/media', label: 'Media (foto & file)', icon: ImageIcon },
    ],
  },
  {
    title: 'Situs',
    items: [
      { href: '/admin/appearance', label: 'Tampilan & warna', icon: Brush },
      { href: '/admin/navigation', label: 'Menu & footer', icon: FileText },
      { href: '/admin/settings', label: 'Pengaturan situs', icon: Settings },
      { href: '/admin/redirects', label: 'Pengalihan (redirect)', icon: ArrowLeftRight },
      { href: '/admin/backup', label: 'Cadangan', icon: Save },
      { href: '/admin/account', label: 'Akun & pengguna', icon: User },
    ],
  },
];

export function AdminNav({ user }: { user: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <>
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold tracking-[0.18em] text-[#1F4D4D]">DAMA ADMIN</span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu admin" className="rounded p-2 hover:bg-stone-100">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <aside
        className={cn(
          'shrink-0 border-r border-stone-200 bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:overflow-y-auto',
          open ? 'block' : 'hidden',
        )}
      >
        <div className="hidden px-5 pb-2 pt-6 lg:block">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#1F4D4D]">DAMA KITCHEN</p>
          <p className="text-xs text-stone-500">Pengelola website</p>
        </div>
        <nav className="space-y-5 px-3 py-4" aria-label="Menu admin">
          {GROUPS.map((g) => (
            <div key={g.title || 'main'}>
              {g.title && <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">{g.title}</p>}
              <ul className="space-y-0.5">
                {g.items.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm',
                        isActive(href) ? 'bg-[#1F4D4D]/10 font-medium text-[#1F4D4D]' : 'text-stone-700 hover:bg-stone-100',
                      )}
                      aria-current={isActive(href) ? 'page' : undefined}
                    >
                      <Icon size={17} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-stone-200 px-5 py-4 text-sm">
          <p className="truncate font-medium text-stone-800">{user.name}</p>
          <p className="truncate text-xs text-stone-500">{user.email}</p>
          <div className="mt-3 flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-md border border-stone-300 px-2.5 py-1.5 text-xs hover:bg-stone-50">
              Lihat website ↗
            </a>
            <form action={logoutAction}>
              <button type="submit" className="rounded-md border border-stone-300 px-2.5 py-1.5 text-xs hover:bg-stone-50">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
