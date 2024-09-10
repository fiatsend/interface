'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SwapSection from '@/components/swap/swap-section';
import { OfferingSection } from '@/components/offerings/offering-section';
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import { fetchOfferings } from '@/lib/offering-slice';
import LoadingPulse from '@/components/animate/loading-pulse';
import { Offering as TbdexOffering } from '@tbdex/protocol';

const Exchange: React.FC = () => {
    const dispatch = useAppDispatch();
    const customerDid = useAppSelector((state) => state.wallet.portableDid);
    const customerCredentials = useAppSelector((state) => state.wallet.did);
    const { isCreating, exchange, error } = useAppSelector((state) => state.exchange);

    const [selectedCurrencyPair, setSelectedCurrencyPair] = useState({ from: '', to: '' });
    const [amount, setAmount] = useState('');
    const { matchedOfferings = [], status = 'idle', error: offeringsError = null } = useAppSelector((state) => state.offering) || {};

    useEffect(() => {
        if (selectedCurrencyPair.from && selectedCurrencyPair.to && amount) {
            dispatch(fetchOfferings());
        }
    }, [selectedCurrencyPair, amount, dispatch]);

    const handleCurrencyPairSelect = (from: string, to: string) => {
        setSelectedCurrencyPair({ from, to });
    };

    const handleAmountChange = (value: string) => {
        setAmount(value);
    };

    const renderOfferings = () => {
        if (status === 'idle') return null;
        if (status === 'loading') return <LoadingPulse />;
        if (status === 'failed') return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center mt-4">Error: {offeringsError}</motion.p>;
        if (matchedOfferings.length === 0) return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-500 text-center mt-4">No offerings available for the selected currency pair.</motion.p>;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {matchedOfferings.map((offering: TbdexOffering) => (
                    <OfferingSection key={offering.metadata.id} offering={offering as any} amount={amount} />
                ))}
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto">
                <motion.h2
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500"
                >
                    Currency Exchange
                </motion.h2>

                <div className="bg-gray-700 rounded-lg shadow-xl p-6 mb-8">
                    <SwapSection
                        selectedCurrencyPair={selectedCurrencyPair}
                        onCurrencyPairSelect={handleCurrencyPairSelect}
                        amount={amount}
                        onAmountChange={handleAmountChange}
                    />
                </div>

                {renderOfferings()}
            </div>
        </motion.div>
    );
};

export default Exchange;
