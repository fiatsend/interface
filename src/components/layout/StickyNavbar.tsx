import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeIcon,
  DocumentTextIcon,
  PhoneIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  PhoneIcon as PhoneIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
} from "@heroicons/react/24/solid";

const navItems = [
  {
    name: "Transfer",
    path: "/",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: "Faucet",
    path: "/faucet",
    icon: PhoneIcon,
    activeIcon: PhoneIconSolid,
  },
  {
    name: "Liquidity",
    path: "/liquidity",
    icon: CurrencyDollarIcon,
    activeIcon: CurrencyDollarIconSolid,
  },
  {
    name: "Docs",
    path: "https://docs.fiatsend.network/fiatsend-points/alewa-testnet",
    icon: DocumentTextIcon,
    activeIcon: DocumentTextIconSolid,
  },
];

const StickyNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 z-100 backdrop-blur-lg border-t border-gray-200 sm:hidden safe-area-bottom">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? "text-purple-600"
                    : "text-gray-500 hover:text-purple-600 active:scale-95"
                }`}
              >
                <Icon
                  className={`h-6 w-6 mb-1 transition-colors ${
                    isActive ? "text-purple-600" : "text-gray-500"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-purple-600" : "text-gray-500"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute top-2 h-1 w-1 rounded-full bg-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StickyNavbar;

// Add this to your global CSS
/*
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
*/
