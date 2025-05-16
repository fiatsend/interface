import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useAccount, usePublicClient } from "wagmi";
import FiatSendABI from "@/abis/FiatSend.json";
import GHSFIATABI from "@/abis/GHSFIAT.json";
import MomoNFTABI from "@/abis/MomoNFT.json";
import { formatUnits } from "viem";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Log } from "viem";

interface Transaction {
  orderId: string; // Truncated ID for display
  hash: string; // Full transaction hash
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

const FIATSEND_ADDRESS = "0x1D683929B76cA50217C3B9C8CE4CcA9a0454a13d";
const GHSFIAT_ADDRESS = "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A";
const NFT_CONTRACT_ADDRESS = "0x1731D34B07CA2235E668c7B0941d4BfAB370a2d0";

// TODO: Replace with the correct block explorer URL for your network
const BLOCK_EXPLORER_BASE_URL = "https://etherscan.io/tx/";

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onClose,
}) => {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !address || !publicClient) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch FiatSent events
        const fiatSentLogs = await publicClient.getLogs({
          address: FIATSEND_ADDRESS,
          event: {
            name: 'FiatSent',
            inputs: [
              { indexed: true, name: 'user', type: 'address' },
              { indexed: false, name: 'usdtAmount', type: 'uint256' },
              { indexed: false, name: 'fiatAmount', type: 'uint256' },
            ],
            type: 'event',
          } as const,
          args: {
            user: address,
          },
          fromBlock: BigInt(0), // Start from block 0 or a known contract deployment block
        });

        // Fetch StablecoinReceived events
        const stablecoinReceivedLogs = await publicClient.getLogs({
          address: FIATSEND_ADDRESS,
          event: {
            name: 'StablecoinReceived',
            inputs: [
              { indexed: true, name: 'user', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
              { indexed: false, name: 'ghsAmount', type: 'uint256' },
            ],
            type: 'event',
          } as const,
          args: {
            user: address,
          },
          fromBlock: BigInt(0),
        });

        // Fetch Transfer events from MomoNFT (where user is the sender)
        const nftTransferLogs = await publicClient.getLogs({
          address: NFT_CONTRACT_ADDRESS,
          event: {
            name: 'Transfer',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: true, name: 'tokenId', type: 'uint256' },
            ],
            type: 'event',
          } as const,
          args: {
            from: address,
          },
          fromBlock: BigInt(0),
        });

        // Fetch Burn events from GHSFIAT (where user is the burner)
        const ghsBurnLogs = await publicClient.getLogs({
          address: GHSFIAT_ADDRESS,
          event: {
            name: 'Burn',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' },
            ],
            type: 'event',
          } as const,
          args: {
            from: address,
          },
          fromBlock: BigInt(0),
        });

        const processedTransactions: Transaction[] = [];

        // Helper function to get block timestamp
        const getBlockTimestamp = async (blockNumber: bigint) => {
          const block = await publicClient.getBlock({ blockNumber });
          return block.timestamp;
        };

        // Process FiatSent logs
        for (const log of fiatSentLogs) {
            const event = log.args as any;
            if (event.user.toLowerCase() === address.toLowerCase()) {
                const timestamp = await getBlockTimestamp(log.blockNumber);
                processedTransactions.push({
                  orderId: log.transactionHash.slice(0, 6) + "..." + log.transactionHash.slice(-4),
                  hash: log.transactionHash,
                  from: "USDT",
                  to: "GHS",
                  method: "Offramp",
                  status: "Completed",
                  amount: formatUnits(event.usdtAmount || BigInt(0), 18),
                  time: formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true }),
                });
            }
        }

        // Process StablecoinReceived logs
        for (const log of stablecoinReceivedLogs) {
            const event = log.args as any;
            if (event.user.toLowerCase() === address.toLowerCase()) {
                const timestamp = await getBlockTimestamp(log.blockNumber);
                processedTransactions.push({
                  orderId: log.transactionHash.slice(0, 6) + "..." + log.transactionHash.slice(-4),
                  hash: log.transactionHash,
                  from: "GHS",
                  to: "USDT",
                  method: "Offramp",
                  status: "Completed",
                  amount: formatUnits(event.amount || BigInt(0), 18),
                  time: formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true }),
                });
            }
        }

        // Process NFT Transfer logs
        for (const log of nftTransferLogs) {
            const event = log.args as any;
            if (event.from.toLowerCase() === address.toLowerCase()) {
                const timestamp = await getBlockTimestamp(log.blockNumber);
                processedTransactions.push({
                  orderId: log.transactionHash.slice(0, 6) + "..." + log.transactionHash.slice(-4),
                  hash: log.transactionHash,
                  from: "NFT",
                  to: event.to || "Unknown",
                  method: "Transfer",
                  status: "Completed",
                  amount: "1",
                  time: formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true }),
                });
            }
        }

        // Process GHSFIAT Burn logs
        for (const log of ghsBurnLogs) {
            const event = log.args as any;
            if (event.from.toLowerCase() === address.toLowerCase()) {
                const timestamp = await getBlockTimestamp(log.blockNumber);
                processedTransactions.push({
                  orderId: log.transactionHash.slice(0, 6) + "..." + log.transactionHash.slice(-4),
                  hash: log.transactionHash,
                  from: "GHSFIAT",
                  to: "Burned",
                  method: "Withdrawal",
                  status: "Completed",
                  amount: formatUnits(event.value || BigInt(0), 18),
                  time: formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true }),
                });
            }
        }

        // Sort transactions by time (most recent first) - Note: Using blockNumber for estimation
        processedTransactions.sort((a, b) => {
             // This is a simplified sort; ideally use block timestamp if available and reliable
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

        setTransactions(processedTransactions);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [address, isConnected, publicClient]); // Dependencies

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4"
      >
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
            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading transactions...</div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              transactions.map((tx) => (
                <motion.div
                  key={tx.orderId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-6 gap-4 py-3 text-sm border-t border-gray-100"
                >
                  <div className="text-blue-500">
                    <a
                        href={`${BLOCK_EXPLORER_BASE_URL}${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        {tx.orderId}
                    </a>
                  </div>
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
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
