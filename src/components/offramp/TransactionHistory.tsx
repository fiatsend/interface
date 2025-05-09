import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useAccount, useReadContract } from "wagmi";
import FiatSendABI from "@/abis/FiatSend.json";
import { formatUnits } from "viem";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  orderId: string;
  from: string;
  to: string;
  method: string;
  status: "Pending" | "Completed" | "Claimed" | "Placed";
  amount: string;
  time: string;
}

interface TransactionHistoryProps {
  onClose: () => void;
}

const FIATSEND_ADDRESS = "0xb55B7EeCB4F13C15ab545C8C49e752B396aaD0BD";

interface ContractEvent {
  args: {
    user: string;
    usdtAmount?: bigint;
    amount?: bigint;
    fiatAmount?: bigint;
    ghsAmount?: bigint;
  };
  transactionHash: string;
  blockTimestamp: bigint;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onClose,
}) => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch FiatSent events
  const { data: fiatSentEvents } = useReadContract({
        address: FIATSEND_ADDRESS,
        abi: FiatSendABI.abi,
        functionName: "FiatSent",
        args: [address],
      
  });

  // Fetch StablecoinReceived events
  const { data: stablecoinReceivedEvents } = useReadContract({
        address: FIATSEND_ADDRESS,
        abi: FiatSendABI.abi,
        functionName: "StablecoinReceived",
        args: [address],
  });

  useEffect(() => {
    if (!fiatSentEvents || !stablecoinReceivedEvents) return;

    const processEvents = () => {
      const processedTransactions: Transaction[] = [];

      // Process FiatSent events
      if (fiatSentEvents) {
        const event = fiatSentEvents as ContractEvent;
        processedTransactions.push({
          orderId: event.transactionHash.slice(0, 6) + "..." + event.transactionHash.slice(-4),
          from: "USDT",
          to: "GHS",
          method: "Offramp",
          status: "Completed",
          amount: formatUnits(event.args.usdtAmount || BigInt(0), 6),
          time: formatDistanceToNow(new Date(Number(event.blockTimestamp) * 1000), { addSuffix: true }),
        });
      }

      // Process StablecoinReceived events
      if (stablecoinReceivedEvents) {
        const event = stablecoinReceivedEvents as ContractEvent;
        processedTransactions.push({
          orderId: event.transactionHash.slice(0, 6) + "..." + event.transactionHash.slice(-4),
          from: "USDT",
          to: "GHS",
          method: "Offramp",
          status: "Completed",
          amount: formatUnits(event.args.amount || BigInt(0), 6),
          time: formatDistanceToNow(new Date(Number(event.blockTimestamp) * 1000), { addSuffix: true }),
        });
      }

      // Sort transactions by time (most recent first)
      processedTransactions.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeB - timeA;
      });

      setTransactions(processedTransactions);
    };

    processEvents();
  }, [fiatSentEvents, stablecoinReceivedEvents]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your transactions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-6 gap-4 text-sm text-gray-500 pb-2">
            <div>Order ID</div>
            <div>From / To</div>
            <div>Method</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Time</div>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.orderId}
                  className="grid grid-cols-6 gap-4 py-3 text-sm border-t border-gray-100"
                >
                  <div className="text-blue-500">{tx.orderId}</div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                      {tx.from[0]}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs">
                      {tx.to[0]}
                    </span>
                  </div>
                  <div className="text-gray-700">{tx.method}</div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tx.status === "Pending"
                          ? "bg-purple-100 text-purple-600"
                          : tx.status === "Completed"
                          ? "bg-green-100 text-green-600"
                          : tx.status === "Claimed"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-gray-700">
                    {tx.amount} {tx.from}
                  </div>
                  <div className="text-gray-500">{tx.time}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
