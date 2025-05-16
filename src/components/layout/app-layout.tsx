"use client";

import React from "react";
import Navbar from "./navbar";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { KYCBanner } from "../offramp/KYCBanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname();
  const { address } = useAccount();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-[1000]">
        {address && <KYCBanner address={address} />}
      </div>
      <div className="pt-16">
        <Navbar />
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
