import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rổ Truyện - Nghe Truyện Audio Online",
  description:
    "Rổ Truyện - Nền tảng nghe truyện audio online miễn phí. Kho truyện phong phú, chất lượng cao, cập nhật liên tục. Nghe truyện mọi lúc mọi nơi.",
  keywords: [
    "nghe truyện audio",
    "truyện audio online",
    "rổ truyện",
    "truyện audio miễn phí",
    "audiobook tiếng việt",
  ],
  openGraph: {
    title: "Rổ Truyện - Nghe Truyện Audio Online",
    description:
      "Nền tảng nghe truyện audio online miễn phí. Kho truyện phong phú, chất lượng cao.",
    type: "website",
    locale: "vi_VN",
    siteName: "Rổ Truyện",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}
