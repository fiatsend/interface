"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { PrivyProvider } from "@privy-io/react-auth";
import StickyNavbar from "@/components/layout/StickyNavbar";
import Script from "next/script";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { config } from "@/config/wagmiConfig";
import { liskSepolia } from "viem/chains";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import AppLayout from "@/components/layout/app-layout";
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Offramps by Fiatsend" />
        <meta
          name="keywords"
          content="fiatsend, offramp, cashout, convert, exchange, blockchain"
        />
        <meta name="author" content="Fiatsend Team" />
        <meta property="og:image" content="/images/fiatsend.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5D15F2" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/icons/icon-192x192.png" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>{`body { font-family: 'Sora', sans-serif; }`}</style>
      </Head>
      <body className={inter.className}>
        <PrivyProvider
          appId="cm3ic9ts3035j11tfo4fbjdt2"
          config={{
            defaultChain: liskSepolia,
            supportedChains: [liskSepolia],
          }}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
              <SmartWalletsProvider>
                <AppLayout>{children}</AppLayout>
                <Toaster position="top-center" />
              </SmartWalletsProvider>
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
        <StickyNavbar />
        <Script
          src="https://cdn.markfi.xyz/scripts/analytics/0.11.21/cookie3.analytics.min.js"
          async
          data-host="https://cookie3.xyz"
          data-key="c50f717d-19ed-4031-a736-22ef49a545f0"
          site-id="c50f717d-19ed-4031-a736-22ef49a545f0"
        />
      </body>
    </html>
  );
}
