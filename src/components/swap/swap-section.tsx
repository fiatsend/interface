import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowsUpDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { SwapInput } from "../ui/input/swap-input";
import { Drawer } from "../ui/drawer/drawer";
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import ActiveExchanges from "../exchanges/active";
import { ActiveExchangesList } from "../drawer/content/list-exchanges";
import { RootState } from "@/lib/store";
import { getStoredCredential, storeCredential } from '@/utils/secure-storage';
import { createExchange } from "@/lib/exchange-slice";
import { Offering } from "@tbdex/http-client";
import { Modal } from "../ui/modal/popup";
import OfferingDetails from '../offerings/offering-details';

export const SwapSection: React.FC<{
    selectedCurrencyPair: { from: string; to: string };
    onCurrencyPairSelect: (from: string, to: string) => void;
    amount: string;
    onAmountChange: (value: string) => void;
    onReviewExchange: () => void;
    offering: Offering;
}> = ({ selectedCurrencyPair, onCurrencyPairSelect, amount, onAmountChange, onReviewExchange, offering }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [hasCredentials, setHasCredentials] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [exchangeInfo, setExchangeInfo] = useState(null);
    const [showOfferingDetails, setShowOfferingDetails] = useState(false);

    const handleReset = () => {
        onAmountChange('');
        onCurrencyPairSelect('GHS', 'USDC');
    };

    const currencies = ["GHS", "USDC", "KES", "USD", "NGN", "GBP", "EUR"];
    const { status } = useAppSelector((state: RootState) => state.offering);
    const { exchange } = useAppSelector((state: RootState) => state.exchange);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!selectedCurrencyPair.from && !selectedCurrencyPair.to) {
            onCurrencyPairSelect('GHS', 'USDC');
        }
    }, [selectedCurrencyPair.from, selectedCurrencyPair.to, onCurrencyPairSelect]);


    const performExchange = useCallback(async () => {
        if (!offering) {
            setError('No offering available. Please try again later.');
            return;
        }

        try {
            const payoutPaymentDetails = {
                address: "0x1731d34b07ca2235e668c7b0941d4bfab370a2d0"
            };

            const result = await dispatch(createExchange({
                offering,
                amount,
                payoutPaymentDetails
            }));

            if (result.type === "exchange/create/fulfilled") {
                setExchangeInfo(result.payload);
                onAmountChange(''); // Clear input
                setShowOfferingDetails(true);
            }
        } catch (error) {
            console.error('Failed to create exchange:', error);
            setError('Failed to create exchange. Please try again.');
        }
    }, [dispatch, offering, amount, onAmountChange]);

    const handleFromCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onCurrencyPairSelect(e.target.value, selectedCurrencyPair.to);
    };

    const handleToCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onCurrencyPairSelect(selectedCurrencyPair.from, e.target.value);
    };

    const handleAmountChange = (value: string) => {
        onAmountChange(value);
    };

    const isExchangeValid = () => {
        return (
            status === "succeeded" && Number(amount) > 0
        );
    };

    const CurrencySelect: React.FC<{
        value: string;
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        label: string;
    }> = ({ value, onChange, label }) => (
        <div className="flex flex-col w-full sm:w-2/5 mb-4 sm:mb-0">
            <label className="text-white/80 mb-2">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full appearance-none bg-white/20 text-white py-3 sm:py-4 pl-12 pr-10 rounded-lg outline-none transition-colors duration-300 hover:bg-white/30 text-base sm:text-lg font-semibold"
                >
                    {currencies.map((currency) => (
                        <option key={currency} value={currency} className="bg-indigo-600 flex items-center">
                            {currency}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Image
                        src={`/images/currencies/${value.toLowerCase()}.png`}
                        alt={`${value} logo`}
                        width={28}
                        height={28}
                        className="rounded-full"
                    />
                </div>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
        </div>
    );

    return (
        <>


            {
                showOfferingDetails ? (
                    <OfferingDetails
                        onBack={() => setShowOfferingDetails(false)}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col p-4 sm:p-8 my-4 sm:my-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl"
                    >
                        <div className="bg-white/10 p-4 sm:p-6 rounded-xl mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white/80">Active Transactions</label>
                                <button
                                    className="text-white/80 hover:text-white"
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    View All
                                </button>
                            </div>
                            <ActiveExchanges />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                            <CurrencySelect
                                value={selectedCurrencyPair.from || 'GHS'}
                                onChange={handleFromCurrencyChange}
                                label="From"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                className="my-4 sm:my-0 bg-white text-indigo-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => onCurrencyPairSelect(selectedCurrencyPair.to, selectedCurrencyPair.from)}
                            >
                                <ArrowsUpDownIcon className="h-6 w-6" />
                            </motion.button>
                            <CurrencySelect
                                value={selectedCurrencyPair.to || 'USDC'}
                                onChange={handleToCurrencyChange}
                                label="To"
                            />
                        </div>
                        <div className="bg-white/10 p-4 sm:p-6 rounded-xl mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white/80">You send</label>
                                <button
                                    className="text-white/80 hover:text-white"
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    <Cog6ToothIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <SwapInput
                                label="You send"
                                placeholder="0.00"
                                value={amount}
                                onChange={handleAmountChange}
                                selectValue={selectedCurrencyPair.from || 'GHS'}
                                onReset={handleReset}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`mt-4 py-3 sm:py-4 px-6 sm:px-8 rounded-full font-bold text-base sm:text-lg shadow-lg  ${isExchangeValid() ? 'bg-emerald-400 text-white hover:shadow-xl transition-all duration-300' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            onClick={performExchange}
                            disabled={!isExchangeValid()}
                        >
                            {"Exchange"}
                        </motion.button>

                        <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen}>
                            <ActiveExchangesList onClose={() => setIsDrawerOpen(false)} />
                        </Drawer>
                    </motion.div>
                )}
        </>


    );
};

export default SwapSection;