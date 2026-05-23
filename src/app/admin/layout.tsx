import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rổ Truyện Admin",
  description: "Admin dashboard for managing audio stories",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-800 bg-gray-900 md:block">
        <div className="flex h-14 items-center gap-2 border-b border-gray-800 px-6">
          <span className="text-xl font-bold text-orange-500">🧺</span>
          <span className="text-lg font-bold tracking-tight">
            Rổ Truyện <span className="text-orange-500">Admin</span>
          </span>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            📖 Quản lý truyện
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-2 border-b border-gray-800 bg-gray-900 px-4 md:hidden">
          <span className="text-xl font-bold text-orange-500">🧺</span>
          <span className="text-lg font-bold tracking-tight">
            Rổ Truyện <span className="text-orange-500">Admin</span>
          </span>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
