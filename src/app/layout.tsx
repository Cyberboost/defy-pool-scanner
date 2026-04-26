import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "PoolSignal — Solana SOL/USDC Pool Scanner",
  description:
    "Scan Solana SOL/USDC liquidity across Raydium, Orca, Jupiter, Birdeye and DexScreener. Track TVL, volume, APR, spread, slippage and risk in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
