import React from "react";
import { useKycLimits } from "@/hooks/useKycLimits";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

interface KYCLimitWarningProps {
  address: `0x${string}`;
  amount: number;
}

export const KYCLimitWarning: React.FC<KYCLimitWarningProps> = ({ address, amount }) => {
  const { level, limit, remainingLimit, isVerified, levelDescription } = useKycLimits(address);

  if (!isVerified) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Verification Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>You need to verify your account to perform this transaction.</p>
              <a
                href="https://app.deform.cc/form/6fcae3e3-eed5-4db8-b71c-85a2053067da/?page_number=0"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Verify your account →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (amount > remainingLimit) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Monthly Limit Exceeded</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your {levelDescription} monthly limit is ${limit.toLocaleString()} USDT.
                You have ${remainingLimit.toLocaleString()} USDT remaining this month.
              </p>
              <a
                href="https://app.deform.cc/form/6fcae3e3-eed5-4db8-b71c-85a2053067da/?page_number=0"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Upgrade your account →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}; 