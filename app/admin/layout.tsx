import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { absolute: 'Admin · DAMA KITCHEN' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="admin min-h-screen bg-[#f6f5f2] font-sans text-stone-900">{children}</div>;
}
