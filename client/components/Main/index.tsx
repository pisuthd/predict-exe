"use client"

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Bitcoin, Wallet, Trophy, History, Terminal, Zap, Activity } from 'lucide-react';


const MainPanel = () => {

    const [timeLeft, setTimeLeft] = useState(3420);
    const [btcPrice, setBtcPrice] = useState(43250.50);
    const [selectedBet, setSelectedBet] = useState<any>(null);
    const [betAmount, setBetAmount] = useState('');
    const [terminalText, setTerminalText] = useState('SYSTEM READY...');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 3600);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const texts = [
            'SYSTEM READY...',
            'PRICE FEED ACTIVE...',
            'PREDICTION ENGINE ONLINE...',
            'AWAITING USER INPUT...'
        ];
        let index = 0;
        const textTimer = setInterval(() => {
            setTerminalText(texts[index]);
            index = (index + 1) % texts.length;
        }, 2000);
        return () => clearInterval(textTimer);
    }, []);

    const formatTime = (seconds: any) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalUpPool = 1250.75;
    const totalDownPool = 890.25;
    const totalPool = totalUpPool + totalDownPool;
    const upPercentage = (totalUpPool / totalPool * 100).toFixed(1);
    const downPercentage = (totalDownPool / totalPool * 100).toFixed(1);

    return (
        <>
            {/* Terminal Header */}
            <div className="mb-8">
                <div className="bg-black border-2 border-cyan-500 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500"></div>
                            <div className="w-3 h-3 bg-yellow-500"></div>
                            <div className="w-3 h-3 bg-green-500"></div>
                            <span className="text-cyan-500 ml-4 font-bold">PREDICTION_TERMINAL.EXE</span>
                        </div>
                        <div className="text-cyan-500 text-sm">ROUND #1247</div>
                    </div>
                    <div className="border-t border-cyan-500/50 pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Bitcoin className="w-6 h-6 text-orange-500" />
                                <div>
                                    <span className="text-gray-400 text-sm">BTC/USD:</span>
                                    <span className="text-white font-bold text-xl ml-2">${btcPrice.toLocaleString()}</span>
                                    <span className="text-green-500 ml-2 text-sm">▲ +2.3%</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">NEXT EXECUTION:</p>
                                <p className="text-cyan-500 font-bold text-2xl font-mono">{formatTime(timeLeft)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Prediction Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel - Prediction Options */}
                <div className="lg:col-span-2">
                    <div className="bg-black border-2 border-purple-500/50 h-full">
                        {/* Header */}
                        <div className="bg-purple-500/20 border-b border-purple-500/50 p-4">
                            <h2 className="text-purple-300 font-bold text-lg tracking-wider">PREDICTION MODULE</h2>
                            <p className="text-gray-400 text-sm">TIMEFRAME: 60:00 MINUTES</p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="text-center mb-8">
                                <h3 className="text-white text-xl font-bold mb-4">EXECUTE PREDICTION:</h3>
                                <p className="text-gray-400">Will BTC price move UP or DOWN in the next 60 minutes?</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                {/* UP Button */}
                                <button
                                    onClick={() => setSelectedBet('up')}
                                    className={`relative group border-2 p-8 transition-all ${selectedBet === 'up'
                                            ? 'border-green-500 bg-green-500/20'
                                            : 'border-green-500/50 hover:border-green-500 hover:bg-green-500/10'
                                        }`}
                                >
                                    <div className="text-center">
                                        <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <div className="text-green-500 font-bold text-2xl mb-2 tracking-wider">UP</div>
                                        <div className="space-y-1">
                                            <div className="text-green-400 font-bold text-lg">{upPercentage}%</div>
                                            <div className="text-gray-400 text-sm">{totalUpPool.toFixed(2)} MAS</div>
                                            <div className="text-xs text-gray-500 bg-black/50 px-2 py-1 inline-block">
                                                PAYOUT: 1.{(200 - parseInt(upPercentage)).toString().padStart(2, '0')}x
                                            </div>
                                        </div>
                                    </div>
                                    {selectedBet === 'up' && (
                                        <div className="absolute top-2 right-2">
                                            <Zap className="w-6 h-6 text-green-500 animate-pulse" />
                                        </div>
                                    )}
                                </button>

                                {/* DOWN Button */}
                                <button
                                    onClick={() => setSelectedBet('down')}
                                    className={`relative group border-2 p-8 transition-all ${selectedBet === 'down'
                                            ? 'border-red-500 bg-red-500/20'
                                            : 'border-red-500/50 hover:border-red-500 hover:bg-red-500/10'
                                        }`}
                                >
                                    <div className="text-center">
                                        <TrendingDown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                        <div className="text-red-500 font-bold text-2xl mb-2 tracking-wider">DOWN</div>
                                        <div className="space-y-1">
                                            <div className="text-red-400 font-bold text-lg">{downPercentage}%</div>
                                            <div className="text-gray-400 text-sm">{totalDownPool.toFixed(2)} MAS</div>
                                            <div className="text-xs text-gray-500 bg-black/50 px-2 py-1 inline-block">
                                                PAYOUT: 1.{(200 - parseInt(downPercentage)).toString().padStart(2, '0')}x
                                            </div>
                                        </div>
                                    </div>
                                    {selectedBet === 'down' && (
                                        <div className="absolute top-2 right-2">
                                            <Zap className="w-6 h-6 text-red-500 animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Bet Input */}
                            {selectedBet && (
                                <div className="border border-cyan-500/50 bg-black/50 p-6">
                                    <div className="mb-4">
                                        <label className="block text-cyan-500 text-sm font-bold mb-2 tracking-wider">
                                            STAKE AMOUNT:
                                        </label>
                                        <div className="flex items-center border border-gray-600 bg-black">
                                            <input
                                                type="number"
                                                value={betAmount}
                                                onChange={(e) => setBetAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="flex-1 bg-transparent px-4 py-3 text-white text-xl font-bold font-mono focus:outline-none"
                                            />
                                            <div className="border-l border-gray-600 px-4 py-3 text-cyan-500 font-bold">MAS</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex space-x-2">
                                            {[10, 25, 50, 100].map(amount => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setBetAmount(amount.toString())}
                                                    className="px-3 py-1 border border-gray-600 hover:border-cyan-500 hover:text-cyan-500 text-gray-400 transition-colors text-sm font-bold"
                                                >
                                                    {amount}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-gray-500 text-sm">MIN: 1 MAS</span>
                                    </div>

                                    <button
                                        className={`w-full py-4 border-2 font-bold text-lg tracking-wider transition-all ${selectedBet === 'up'
                                                ? 'border-green-500 bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                : 'border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                            }`}
                                    >
                                        EXECUTE {selectedBet?.toUpperCase()} PREDICTION
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Stats */}
                <div className="space-y-6">
                    {/* System Stats */}
                    <div className="bg-black border-2 border-cyan-500/50">
                        <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-3">
                            <h3 className="text-cyan-300 font-bold tracking-wider">SYSTEM STATUS</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">TOTAL POOL:</span>
                                <span className="text-white font-bold">{totalPool.toFixed(2)} MAS</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">ACTIVE USERS:</span>
                                <span className="text-cyan-500 font-bold">247</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">WIN RATE:</span>
                                <span className="text-green-500 font-bold">73.2%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">NETWORK:</span>
                                <span className="text-purple-500 font-bold">MASSA</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-black border-2 border-green-500/50">
                        <div className="bg-green-500/20 border-b border-green-500/50 p-3">
                            <h3 className="text-green-300 font-bold tracking-wider">LIVE ACTIVITY</h3>
                        </div>
                        <div className="p-4 space-y-3 text-xs">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                                <span className="text-gray-400">0x1a2b... bet 50 MAS on UP</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 animate-pulse"></div>
                                <span className="text-gray-400">0x3c4d... bet 25 MAS on DOWN</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                                <span className="text-gray-400">0x5e6f... bet 100 MAS on UP</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-cyan-500 animate-pulse"></div>
                                <span className="text-gray-400">Round #1246 settled</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Chart Placeholder */}
                    <div className="bg-black border-2 border-orange-500/50">
                        <div className="bg-orange-500/20 border-b border-orange-500/50 p-3">
                            <h3 className="text-orange-300 font-bold tracking-wider">PRICE DATA</h3>
                        </div>
                        <div className="p-4 h-32 flex items-center justify-center">
                            <Activity className="w-16 h-16 text-orange-500/50" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MainPanel