import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CogIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  setActiveComponent: (component: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveComponent }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Portfolio", icon: HomeIcon },
    { name: "Transactions", icon: ClockIcon },
    { name: "Exchange", icon: CurrencyDollarIcon },
    { name: "Settings", icon: CogIcon },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-100"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-100 p-2 bg-gray-800 text-white rounded-md"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
                    fixed top-0 left-0 h-full bg-gray-800 text-white z-100 transition-all duration-300 ease-in-out
                    ${
                      isMobile
                        ? isOpen
                          ? "w-64"
                          : "-translate-x-full"
                        : "w-20"
                    }
                `}
      >
        <div className="flex flex-col h-full p-4">
          <nav className="flex flex-col space-y-4 mt-8">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveComponent(item.name);
                  if (isMobile) setIsOpen(false);
                }}
                className="flex items-center justify-center hover:bg-gray-700 p-2 rounded transition-colors duration-200"
                title={item.name}
              >
                <item.icon className="h-6 w-6" />
                {isMobile && isOpen && (
                  <span className="ml-2">{item.name}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
