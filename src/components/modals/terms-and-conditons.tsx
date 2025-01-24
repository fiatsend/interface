import React, { useState, useRef, useEffect, useCallback } from "react";

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  const [isFullyScrolled, setIsFullyScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      title: "Introduction",
      content:
        "Welcome to Fiatsend Identity. These terms and conditions Terms govern the creation, usage, and management of Non-Fungible Tokens (NFTs) issued via Fiatsend’s offramp platform. By participating in the NFT creation process, you agree to these Terms.",
    },

    {
      title: "Eligibility",
      content:
        "2.1. Users must meet the minimum age requirements in their jurisdiction to use Fiatsend and comply with all applicable laws and regulations.\n2.2. Users must have a verified Fiatsend account and a compatible wallet address linked to their account.",
    },

    {
      title: "NFT Creation Process",
      content:
        "3.1. NFTs are issued in exchange for specific stablecoins (e.g., USDC, USDT) sent to the designated Fiatsend address .\n3.2. Upon receipt of stablecoins, equivalent GHSFIAT tokens will be minted and made available to the user.\n3.3. Users can burn their GHSFIAT tokens to create an NFT, which will be recorded on the blockchain.",
    },

    {
      title: "Usage of NFTs",
      content:
        "4.1. The NFTs created are unique digital assets representing specific transactions and may be used for rewards, airdrops, or other incentives determined by Fiatsend.\n4.2. Fiatsend retains the right to define the scope and utility of the NFTs, including eligibility for rewards.",
    },

    {
      title: "Fees",
      content:
        "5.1. Transaction fees may apply to the NFT creation process, including network and service fees. These fees will be transparently communicated during the transaction.",
    },

    {
      title: "User Responsibilities",
      content:
        "6.1. Users are responsible for ensuring the accuracy of the wallet address and the stablecoins sent to Fiatsend.\n6.2. Users must secure their wallet credentials. Fiatsend is not liable for unauthorized access or loss resulting from compromised wallets.",
    },

    {
      title: "Intellectual Property",
      content:
        "7.1. The NFTs and any associated metadata or content remain the intellectual property of Fiatsend unless otherwise specified.\n7.2. Users may not modify, replicate, or commercially exploit NFTs without prior written consent from Fiatsend.",
    },

    {
      title: "Termination and Suspension",
      content:
        "8.1. Fiatsend reserves the right to suspend or terminate NFT creation services for any user in breach of these Terms.\n8.2. In the event of suspension or termination, NFTs already created will remain valid unless otherwise stated.",
    },

    {
      title: "Disclaimers and Limitation of Liability",
      content:
        "9.1. Fiatsend provides the NFT creation service as is and does not guarantee uninterrupted or error-free functionality.\n9.2. Fiatsend is not liable for losses arising from blockchain network failures, incorrect transactions, or unauthorized access to user wallets.",
    },

    {
      title: "Amendments",
      content:
        "10.1. Fiatsend reserves the right to update these Terms at any time. Users will be notified of significant changes via the Fiatsend platform.\n10.2. Continued use of the service after changes constitutes acceptance of the revised Terms.",
    },

    {
      title: "Governing Law",
      content:
        "These Terms are governed by and construed in accordance with the laws of [Jurisdiction]. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in [Jurisdiction].",
    },

    {
      title: "Contact Information",
      content:
        "For questions or concerns regarding these Terms, please contact us at [support@fiatsend.com].",
    },
  ];

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const scrollableDistance = scrollHeight - clientHeight;
      const currentScrollPercentage = (scrollTop / scrollableDistance) * 100;

      setScrollPercentage(currentScrollPercentage);
      setIsFullyScrolled(currentScrollPercentage > 99);
      setActiveSection(
        Math.floor((scrollTop / scrollableDistance) * sections.length)
      );
    }
  }, [sections.length]);

  useEffect(() => {
    if (contentRef.current) {
      handleScroll(); // Initial check
    }
  }, [handleScroll]);

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", "true");
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Terms and Conditions</h2>
          <div className="text-sm text-gray-500">
            Scroll progress: {Math.round(scrollPercentage)}%
          </div>
        </div>
        <div className="flex-grow flex overflow-hidden">
          <div className="hidden md:block w-full bg-gray-100 p-4 overflow-y-auto">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`cursor-pointer p-2 rounded ${
                  activeSection === index
                    ? "bg-indigo-100 text-indigo-700"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => {
                  contentRef.current?.scrollTo({
                    top:
                      (contentRef.current.scrollHeight / sections.length) *
                      index,
                    behavior: "smooth",
                  });
                }}
              >
                {section.title}
              </div>
            ))}
          </div>
          <div
            ref={contentRef}
            className="flex-grow p-6 overflow-y-auto"
            onScroll={handleScroll}
          >
            {sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex justify-between items-center">
          <div className="w-1/2 bg-gray-200 rounded-full h-2.5 md:block hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${scrollPercentage}%` }}
            ></div>
          </div>
          <div className="space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={!isFullyScrolled}
              className={`px-4 py-2 rounded transition-colors duration-300 ${
                isFullyScrolled
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isFullyScrolled ? "Accept" : "Please read all terms"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsModal;
