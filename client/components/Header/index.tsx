"use client"

import React, { useState, useEffect } from 'react';
import { TrendingDown, Clock, Bitcoin, Wallet, Trophy, History, Terminal, Zap, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header = () => {

    const pathname = usePathname()

    console.log("pathname:", pathname)

    return (
        <header className="relative z-10 border-b-2 border-cyan-500/50 bg-black/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-2xl font-bold text-cyan-500 tracking-wider">PREDICT.EXE</h1>
                            <p className="text-xs text-gray-400">v1.0.0</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider">
                        <Link href="/" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>TRADE</Link>
                        <Link href="/history" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/history" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>HISTORY</Link>
                        <Link href="/stats"  className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/stats" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>STATS</Link>
                        <Link href="/about" className={`  border-cyan-500 hover:text-cyan-500 transition-colors ${pathname === "/about" ? "text-cyan-500 border-b-2 pb-1" : "text-gray-400"} `}>ABOUT</Link>
                    </nav>

                    {/* Terminal Status */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden lg:block bg-black border border-cyan-500/50 px-4 py-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                                <span className="text-green-500 text-xs">{1234}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 tracking-wider">BALANCE</p>
                            <p className="text-cyan-500 font-bold">1,247.50 MAS</p>
                        </div>
                        <button className="bg-black border-2 border-cyan-500 hover:bg-cyan-500/10 px-4 py-2 transition-all">
                            <div className="flex items-center space-x-2">
                                <Terminal className="w-4 h-4 text-cyan-500" />
                                <span className="text-cyan-500 font-bold text-sm">0x1234...5678</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}