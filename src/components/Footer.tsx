import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand Column */}
          <div>
            <h3 className="text-lg font-bold text-orange-500">
              ROTRUYEN.ONLINE
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Rổ Truyện là nền tảng nghe truyện audio online hàng đầu Việt Nam.
              Với kho truyện phong phú và chất lượng âm thanh đỉnh cao, chúng
              tôi mang đến trải nghiệm nghe truyện tuyệt vời nhất cho bạn.
            </p>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Trợ giúp
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/dieu-khoan"
                  className="text-sm text-gray-600 transition-colors hover:text-orange-500"
                >
                  Điều khoản chung
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach"
                  className="text-sm text-gray-600 transition-colors hover:text-orange-500"
                >
                  Chính sách riêng tư
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap.xml"
                  className="text-sm text-gray-600 transition-colors hover:text-orange-500"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Liên kết
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-600 transition-colors hover:text-orange-500"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/gioi-thieu"
                  className="text-sm text-gray-600 transition-colors hover:text-orange-500"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/lien-he"
                  className="text-sm text-gray-600 transition-colors hover:text-orange-500"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="text-center text-xs text-gray-500">
            © 2026 RoTruyen.online - Nền Tảng Nghe Truyện Audio Đỉnh Cao. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
