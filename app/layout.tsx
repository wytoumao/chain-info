import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chain Info Dashboard - 实时链信息监控",
  description: "实时监控主流交易所（Gate.io、Binance、OKX、Bybit、Bitget、MEXC）的区块链充提状态，支持30+主流公链，包括BTC、ETH、BNB、SOL等。",
  keywords: ["区块链", "加密货币", "交易所", "充值", "提现", "链信息", "Gate.io", "Binance", "OKX"],
  authors: [{ name: "Chain Info Team" }],
  creator: "Chain Info Team",
  publisher: "Chain Info Team",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://chain-info-eight.vercel.app",
    title: "Chain Info Dashboard - 实时链信息监控",
    description: "实时监控主流交易所的区块链充提状态",
    siteName: "Chain Info Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain Info Dashboard - 实时链信息监控",
    description: "实时监控主流交易所的区块链充提状态",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
