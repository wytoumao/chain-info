import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chain Info Dashboard - 链信息监控",
  description: "实时监控主流交易所的链充提状态",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
