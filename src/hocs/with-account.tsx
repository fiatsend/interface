import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useReadContract } from "wagmi";
import MomoNFTABI from "@/abis/MomoNFT.json";

const NFTContract = "0x063EC4E9d7C55A572d3f24d600e1970df75e84cA";

const withFiatsendNFT = <WrappedComponent extends React.ComponentType<any>>(
  WrappedComponent: WrappedComponent
) => {
  return function WithFiatsendNFTWrapper(
    props: React.ComponentProps<WrappedComponent>
  ) {
    const router = useRouter();
    const { authenticated, user, login } = usePrivy();
    const [hasNFT, setHasNFT] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState<boolean>(true);

    const { data: balance, isLoading } = useReadContract({
      address: NFTContract,
      abi: MomoNFTABI.abi,
      functionName: "balanceOf",
      args: [user?.wallet?.address],
    });

    useEffect(() => {
      if (!isLoading) {
        setHasNFT(balance ? Number(balance) > 0 : false); // Convert balance to a number
        setIsChecking(false);
      }
    }, [balance, isLoading]);

    if (isChecking) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin"></div>
            </div>
            <p className="text-gray-600">Checking account status...</p>
          </div>
        </div>
      );
    }

    if (!authenticated) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Sign In to Continue
              </h1>
              <p className="text-gray-600">Please sign in to access Fiatsend</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={login}
                className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!hasNFT) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Account Required
              </h1>
              <p className="text-gray-600">
                You need a Fiatsend NFT to access this feature
              </p>
            </div>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              Get Fiatsend NFT
            </button>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/check")}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Check Status
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withFiatsendNFT;
