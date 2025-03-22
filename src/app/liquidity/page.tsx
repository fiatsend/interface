"use client";

import React from "react";
import Pool from "@/components/liquidity/pool";
import Image from "next/image";
import { ArrowPathIcon, BeakerIcon } from "@heroicons/react/24/outline";

const LiquidityPool: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Liquidity Pool
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Provide liquidity and earn rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* TVL Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total Value Locked
              </h3>
              <ArrowPathIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">$1.2M</span>
              <span className="ml-2 text-sm text-green-500">+2.5%</span>
            </div>
          </div>

          {/* APR Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm font-medium text-gray-500">Current APR</h3>
              <BeakerIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">12.5%</span>
              <span className="ml-2 text-sm text-purple-600">in FSEND</span>
            </div>
          </div>

          {/* Your Position Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm font-medium text-gray-500">
                Your Position
              </h3>
              <div className="flex -space-x-2">
                <Image
                  src="/images/tokens/usdt.png"
                  width={20}
                  height={20}
                  alt="USDT"
                  className="rounded-full ring-2 ring-white"
                />
                <Image
                  src="/images/tokens/ghs.png"
                  width={20}
                  height={20}
                  alt="GHS"
                  className="rounded-full ring-2 ring-white"
                />
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">$0.00</span>
              <span className="ml-2 text-sm text-gray-500">USDT-GHS LP</span>
            </div>
          </div>
        </div>

        {/* Main Pool Interface */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Pool Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
                <button className="px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap bg-purple-50 text-purple-600">
                  Add Liquidity
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Remove Liquidity
                </button>
              </nav>
            </div>
          </div>

          {/* Pool Component */}
          <div className="p-6">
            <Pool />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            About USDT-GHS Pool
          </h3>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Provide liquidity to the USDT-GHS pool and earn trading fees plus
              FSEND rewards. The APR consists of:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Trading fees (0.3% of all trades, proportionally shared between
                LPs)
              </li>
              <li>FSEND rewards (distributed every block)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPool;
