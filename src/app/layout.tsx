import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Murat Kardeşler Blog",
  description: "Kişisel blog sayfam",
};

type RootLayoutProps = {
  children: React.ReactNode
  params: {
    lang: string
  }
}

export default function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  return (
    <html lang={params.lang || 'tr'}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
