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

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Offramps by Fiatsend" />
        <meta
          name="keywords"
          content="fiatsend, offramp, cashout, convert, exchange, blockchain"
        />
        <meta name="author" content="Fiatsend Team" />
        <meta property="og:image" content="/images/fiatsend.png" />
        <link rel="icon" href="/images/fiatsend.png" />
        <Script
          src="https://cdn.markfi.xyz/scripts/analytics/0.11.21/cookie3.analytics.min.js"
          integrity="sha384-wtYmYhbRlAqGwxc5Vb9GZVyp/Op3blmJICmXjRiJu2/TlPze5dHsmg2gglbH8viT"
          crossOrigin="anonymous"
          async
          strategy="lazyOnload"
          site-id="c50f717d-19ed-4031-a736-22ef49a545f0"
        />
      </head>
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
      </body>
    </html>
  );
}
