export function AuthShell({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-sm font-semibold tracking-[0.2em] text-[#1F4D4D]">DAMA KITCHEN</p>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="mb-5 text-xl font-semibold text-stone-900">{title}</h1>
          {children}
        </div>
        {footer && <div className="mt-4 text-center text-sm text-stone-600">{footer}</div>}
      </div>
    </main>
  );
}
