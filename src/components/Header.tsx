import Link from "next/link";
import Image from "next/image";
import { Search, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-orange-100 transition-shadow group-hover:ring-orange-300">
            <Image
              src="/logo.png"
              alt="Rổ Truyện"
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <span className="text-xl font-bold italic text-orange-500 font-serif tracking-wide">
            Rổ Truyện
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Tìm kiếm"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-500"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-500"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
