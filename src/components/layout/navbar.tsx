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
import { motion, AnimatePresence } from "framer-motion";
import { FaWallet, FaBook, FaBars } from "react-icons/fa";

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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden sm:flex items-center mr-4 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 shadow-sm"
    >
      <div className="w-6 h-6 rounded-full bg-white p-0.5 mr-2 flex items-center justify-center shadow-sm">
        <Image
          src="/images/fiatsend.png"
          width={20}
          height={20}
          alt="FSEND"
          className="rounded-full"
        />
      </div>
      <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        {formattedBalance} FSEND
      </span>
    </motion.div>
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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-sm">
                <Image
                  src="/images/fiatsend.png"
                  width={28}
                  height={28}
                  alt="FSEND"
                  className="rounded-full"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Offramps
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <React.Fragment key={item.name}>
                  {item.disabled ? (
                    <div className="relative group">
                      <span className="px-4 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed">
                        {item.name}
                      </span>
                      {item.comingSoon && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute -top-1 -right-1 px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-sm"
                        >
                          Soon
                        </motion.span>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                        pathname === item.href
                          ? "text-purple-600 bg-purple-50"
                          : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      {item.name}
                      {pathname === item.href && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  )}
                </React.Fragment>
              ))}
              <a
                href="https://docs.fiatsend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center space-x-2 group"
              >
                <span>Guide</span>
                <FaBook className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Side - Auth & Wallet */}
          <div className="flex items-center space-x-4">
            {authenticated && <TokenBalance userAddress={userAddress} />}
            <div className="hidden sm:block">
              {authenticated ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleDrawer}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
                >
                  <FaWallet className="w-4 h-4" />
                  <span>Wallet</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={login}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  Login
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDrawer}
              className="md:hidden p-2 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-all"
            >
              <FaBars className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
      <WalletDrawer isOpen={isDrawerOpen} onClose={toggleDrawer} />
    </motion.nav>
  );
};

export default Navbar;
