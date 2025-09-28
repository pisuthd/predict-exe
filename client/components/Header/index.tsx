"use client"

import React, { useState, useEffect, useContext } from 'react';
import { Terminal, ChevronDown, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getWallets } from "@massalabs/wallet-provider";
import { AccountContext } from '@/contexts/account';

export const Header = () => {

    const { account, connect, disconnect, provider, setProvider }: any = useContext(AccountContext)
    const [accounts, setAccounts] = useState<any>([])
    const [showAccountDropdown, setShowAccountDropdown] = useState(false)
    const [balance, setBalance] = useState("")

    const pathname = usePathname()

    useEffect(() => {
        checkWallet()
    }, [])

    useEffect(() => {
        if (provider && account) {
            checkBalance(provider, account);
        }
    }, [provider, account]);

    const checkBalance = async (provider: any, account: any) => {
        try {
            const balance = await account.balance();
            setBalance(formatMASBalance(balance)); 
        } catch (error) {
            console.error('Error checking balance:', error);
            setBalance('Error loading balance');
        }
    };


    const checkWallet = async () => {
        // Get list of available wallets
        const wallets = await getWallets();

        for (let wallet of wallets) {
            const walletName = wallet.name()
            if (walletName === "MASSA WALLET") {
                setProvider(wallet)
                const accounts = await wallet.accounts();
                setAccounts(accounts)
                break
            }
        }
    }

    const handleAccountConnect = (selectedAccount: any) => {
        connect(selectedAccount)
        setShowAccountDropdown(false)
    }
 

    return (
        <header className="relative z-10 border-b-2 border-cyan-500/50 bg-black/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-2xl font-bold text-cyan-500 tracking-wider">PREDICT.EXE</h1>
                            <p className="text-xs text-gray-400">Bet on Price Moves Powered by Massa ASC</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider">
                        <Link href="/" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>TRADE</Link>
                        <Link href="/history" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/history" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>HISTORY</Link>
                        <Link href="/liquidity" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/liquidity" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>LIQUIDITY</Link>
                        {/* <Link href="/stats" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/stats" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>STATS</Link> */}
                        <Link href="/about" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/about" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>ABOUT</Link>
                    </nav>

                    {/* Terminal Status */}
                    <div className="flex items-center space-x-4">
                        {/* <div className="hidden lg:block bg-black border border-cyan-500/50 px-4 py-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                                <span className="text-green-500 text-xs">
                                    Live on Buildnet
                                </span>
                            </div>
                        </div> */}

                        {/* No accounts available */}
                        {((accounts.length === 0) && !account) && (
                            <button className="bg-black border-2 border-cyan-500 hover:bg-cyan-500/10 px-4 py-2 transition-all">
                                <div className="flex items-center space-x-2">
                                    <span className="text-cyan-500 font-bold text-sm">MassaStation Not Opened</span>
                                </div>
                            </button>
                        )}

                        {/* Accounts available but none connected */}
                        {((accounts.length > 0) && (!account)) && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                                    className="bg-black border-2 border-cyan-500 hover:bg-cyan-500/10 px-4 py-2 transition-all"
                                >
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-cyan-500" />
                                        <span className="text-cyan-500 font-bold text-sm">Connect Account</span>
                                        <ChevronDown className={`w-4 h-4 text-cyan-500 transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showAccountDropdown && (
                                    <div className="absolute right-0 top-full mt-2 bg-black border-2 border-cyan-500/50 min-w-[250px] z-50">
                                        <div className="py-2">
                                            <div className="px-4 py-2 border-b border-cyan-500/30">
                                                <span className="text-cyan-500 text-xs font-bold tracking-wider">SELECT ACCOUNT</span>
                                            </div>
                                            {accounts.map((acc: any, index: number) => {
                                                const shortAddress = `${acc.address.slice(0, 6)}...${acc.address.slice(-4)}`;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleAccountConnect(acc)}
                                                        className="w-full px-4 py-3 hover:bg-cyan-500/10 transition-colors text-left border-b border-cyan-500/20 last:border-b-0"
                                                    >
                                                        <div className="flex items-center space-x-2"> 
                                                            <div>
                                                                <div className="text-cyan-500 font-bold text-sm">
                                                                    {acc.accountName || `Account ${index + 1}`}
                                                                </div>
                                                                <div className="text-gray-400 text-xs">
                                                                    {shortAddress}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Account connected */}
                        {account && (
                            <>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 tracking-wider">BALANCE</p>
                                    <p className="text-cyan-500 font-bold">{balance || "0.00"} MAS</p>
                                </div>
                                <button 
                                    onClick={() => disconnect()}
                                    className="bg-black border-2 border-cyan-500 hover:bg-cyan-500/10 px-4 py-2 transition-all"
                                >
                                    <div className="flex items-center space-x-2"> 
                                        <span className="text-cyan-500 font-bold text-sm">
                                            {account.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : '0x1234...5678'}
                                        </span>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay to close dropdown when clicking outside */}
            {showAccountDropdown && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowAccountDropdown(false)}
                ></div>
            )}
        </header>
    )
}


// Helper function to format MAS balance from BigInt with 9 decimals
const formatMASBalance = (balanceBigInt: any) => {
    if (typeof balanceBigInt === 'string') {
        // If it's already a string, return as is
        return balanceBigInt;
    }

    if (typeof balanceBigInt === 'bigint' || (typeof balanceBigInt === 'string' && balanceBigInt.endsWith('n'))) {
        // Handle BigInt or string with 'n' suffix
        const balanceStr = balanceBigInt.toString().replace('n', '');
        const balance = BigInt(balanceStr);

        // Massa has 9 decimal places
        const divisor = BigInt(10 ** 9);
        const wholePart = balance / divisor;
        const fractionalPart = balance % divisor;

        // Format fractional part with leading zeros and remove trailing zeros
        const fractionalStr = fractionalPart.toString().padStart(9, '0').replace(/0+$/, '');

        if (fractionalStr === '') {
            return wholePart.toString();
        } else {
            return `${wholePart.toString()}.${fractionalStr}`;
        }
    }

    return balanceBigInt?.toString() || '0';
};