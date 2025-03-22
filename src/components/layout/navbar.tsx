"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import WalletDrawer from "../ui/drawer/wallet-drawer";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import FSendTokenABI from "@/abis/FSEND.json";

const FSEND_TOKEN_ADDRESS = "0x47e71D5B59A0c8cA50a7d5e268434aA0F7E171A2";

const TokenBalance = ({ userAddress }: { userAddress: string | null }) => {
  const { data: balance } = useReadContract({
    address: FSEND_TOKEN_ADDRESS,
    abi: FSendTokenABI.abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
  });

  if (!userAddress) return null;

  const formattedBalance = balance
    ? Number(formatUnits(balance as bigint, 18)).toFixed(2)
    : "0.00";

  return (
    <div className="hidden sm:flex items-center mr-4 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
      <div className="w-5 h-5 rounded-full bg-purple-100 p-0.5 mr-2 flex items-center justify-center">
        <Image
          src="/images/fiatsend.png"
          width={16}
          height={16}
          alt="FSEND"
          className="rounded-full"
        />
      </div>
      <span className="text-sm font-medium text-purple-600">
        {formattedBalance} FSEND
      </span>
    </div>
  );
};

const navItems = [
  { name: "Transfer", href: "/" },
  { name: "Faucet", href: "/faucet" },
  { name: "Liquidity", href: "/liquidity" },
  { name: "Vault", href: "/vault", disabled: true, comingSoon: true },
  { name: "Rewards", href: "/rewards", disabled: true, comingSoon: true },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { login, authenticated, user } = usePrivy();
  const userAddress = user?.wallet?.address || null;

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <nav className="fixed w-full mx-6 mt-6 mb-12 bg-white/80 border-b rounded-lg z-1000 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/fiatsend.png"
                width={32}
                height={32}
                alt="FSEND"
                className="rounded-full"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Offramps
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <React.Fragment key={item.name}>
                  {item.disabled ? (
                    <div className="relative group">
                      <span className="px-3 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed">
                        {item.name}
                      </span>
                      {item.comingSoon && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full">
                          Soon
                        </span>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        pathname === item.href
                          ? "text-purple-600 bg-purple-50"
                          : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
              <a
                href="https://docs.fiatsend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center space-x-1"
              >
                <span>Guide</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Side - Auth & Wallet */}
          <div className="flex items-center space-x-4">
            {authenticated && <TokenBalance userAddress={userAddress} />}
            <div className="hidden sm:block">
              {authenticated ? (
                <button
                  onClick={toggleDrawer}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
                >
                  Wallet
                </button>
              ) : (
                <button
                  onClick={login}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleDrawer}
              className="md:hidden p-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <WalletDrawer isOpen={isDrawerOpen} onClose={toggleDrawer} />
    </nav>
  );
};

export default Navbar;
