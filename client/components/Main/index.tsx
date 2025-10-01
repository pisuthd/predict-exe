"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Zap, AlertCircle } from 'lucide-react';
import BTCPrice from './BTCPrice';
import HouseStatus from './HouseStatus';
import LiveActivity, { ActivityItem } from './LiveActivity';
import PoolDistribution from './PoolDistribution';
import { useRound } from '@/hooks/useRound';
import { useAccount } from '@/contexts/account';
import { useMarket, CONTRACT_ADDRESS } from '@/contexts/market';
import { usePrice } from '@/hooks/usePrice';

const MainPanel = () => {
    const { provider, houseStatus } = useMarket();
    const { account, placeBet } = useAccount();
    const { currentRound, roundHistory, getAMMOdds, isLoading: roundLoading } = useRound(CONTRACT_ADDRESS, provider);
    const { getTokenPrice } = usePrice({ symbols: ["BTC"] });

    const [selectedBet, setSelectedBet] = useState<'up' | 'down' | null>(null);
    const [betAmount, setBetAmount] = useState('');
    const [liveOdds, setLiveOdds] = useState<any>(null);
    const [placing, setPlacing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        if (currentRound && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [currentRound, isInitialLoad]);

    useEffect(() => {
        if (roundHistory && roundHistory.length > 0) {
            const activity: ActivityItem[] = [];
            
            roundHistory.slice(0, 5).forEach((round) => {
                if (round.isSettled) {
                    activity.push({
                        type: 'settlement',
                        address: 'SYSTEM',
                        roundId: round.roundId,
                        timestamp: round.settlementTime,
                    });
                    
                    if (round.totalUpBets > 0) {
                        activity.push({
                            type: 'bet',
                            address: `0x${Math.random().toString(16).substr(2, 4)}...`,
                            amount: Math.random() * 50 + 10,
                            direction: 'UP',
                            roundId: round.roundId,
                            timestamp: round.startTime + Math.random() * 300000,
                        });
                    }
                    if (round.totalDownBets > 0) {
                        activity.push({
                            type: 'bet',
                            address: `0x${Math.random().toString(16).substr(2, 4)}...`,
                            amount: Math.random() * 50 + 10,
                            direction: 'DOWN',
                            roundId: round.roundId,
                            timestamp: round.startTime + Math.random() * 300000,
                        });
                    }
                }
            });
            
            activity.sort((a, b) => b.timestamp - a.timestamp);
            setRecentActivity(activity.slice(0, 10));
        }
    }, [roundHistory]);

    const bettingTimeRemaining = useMemo(() => {
        if (!currentRound) return 0;
        return Math.floor(currentRound.bettingTimeRemaining / 1000);
    }, [currentRound?.bettingTimeRemaining]);

    const settlementTimeRemaining = useMemo(() => {
        if (!currentRound) return 0;
        return Math.floor(currentRound.timeRemaining / 1000);
    }, [currentRound?.timeRemaining]);

    useEffect(() => {
        if (currentRound && betAmount) {
            const amount = parseFloat(betAmount);
            if (!isNaN(amount) && amount >= 1) {
                getAMMOdds(currentRound.roundId, amount).then(setLiveOdds);
            }
        }
    }, [currentRound, betAmount, getAMMOdds]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getBettingPhase = () => {
        if (!currentRound) return { phase: 'LOADING', color: 'gray', canBet: false, timeToShow: 0, label: 'LOADING' };
        
        if (!currentRound.isActive) {
            return { 
                phase: 'WAITING', 
                color: 'red', 
                canBet: false, 
                timeToShow: 0,
                label: 'WAITING FOR NEW ROUND' 
            };
        }

        const bettingTime = bettingTimeRemaining;
        const settlementTime = settlementTimeRemaining;
        
        if (bettingTime > 0) {
            return { 
                phase: 'BETTING_OPEN', 
                color: 'green', 
                canBet: true, 
                timeToShow: bettingTime,
                label: 'BETTING OPEN' 
            };
        } 
        else if (settlementTime > 0) {
            return { 
                phase: 'COOLDOWN', 
                color: 'orange', 
                canBet: false, 
                timeToShow: settlementTime,
                label: 'COOLDOWN - BETTING CLOSED' 
            };
        } 
        else {
            return { 
                phase: 'SETTLING', 
                color: 'red', 
                canBet: false, 
                timeToShow: 0,
                label: 'SETTLING ROUND' 
            };
        }
    };

    const bettingPhase = getBettingPhase();

    const calculateOdds = (direction: 'up' | 'down') => {
        if (!currentRound) return 1.5;

        const totalPool = currentRound.totalUpBets + currentRound.totalDownBets;
        if (totalPool === 0) return 1.5;

        const sidePool = direction === 'up' ? currentRound.totalUpBets : currentRound.totalDownBets;
        const probability = sidePool / totalPool;
        const fairOdds = 1.0 / probability;
        const houseOdds = fairOdds * 0.95;
        const clampedOdds = Math.max(1.1, Math.min(5.0, houseOdds));
        
        return clampedOdds;
    };

    const handlePlaceBet = async () => {
        if (!account) {
            alert('Please connect your wallet first');
            return;
        }

        if (!currentRound) {
            alert('No active round');
            return;
        }

        if (!bettingPhase.canBet) {
            alert('Betting is closed for this round');
            return;
        }

        if (!selectedBet) {
            alert('Please select UP or DOWN');
            return;
        }

        const amount = parseFloat(betAmount);
        if (isNaN(amount) || amount < 1) {
            alert('Minimum bet is 1 MAS');
            return;
        }

        try {
            setPlacing(true);
            const result = await placeBet(
                currentRound.roundId,
                selectedBet === 'up',
                betAmount
            );

            alert(`Bet placed successfully! Potential payout: ${result.potentialPayout.toFixed(2)} MAS`);
            
            setRecentActivity(prev => [{
                type: 'bet',
                address: account.address.slice(0, 6) + '...',
                amount: parseFloat(betAmount),
                direction: selectedBet.toUpperCase() as 'UP' | 'DOWN',
                roundId: currentRound.roundId,
                timestamp: Date.now(),
            }, ...prev.slice(0, 9)]);
            
            setSelectedBet(null);
            setBetAmount('');
        } catch (err: any) {
            alert(`Error placing bet: ${err.message}`);
        } finally {
            setPlacing(false);
        }
    };

    const currentBTCPrice = getTokenPrice("BTC");

    const displayData = useMemo(() => {
        if (!currentRound) return null;

        const upOdds = liveOdds ? liveOdds.upOdds : calculateOdds('up');
        const downOdds = liveOdds ? liveOdds.downOdds : calculateOdds('down');
        const totalPool = currentRound.totalPool;
        const upPercentage = totalPool > 0 ? (currentRound.totalUpBets / totalPool * 100).toFixed(1) : '50.0';
        const downPercentage = totalPool > 0 ? (currentRound.totalDownBets / totalPool * 100).toFixed(1) : '50.0';

        return {
            upOdds,
            downOdds,
            totalPool,
            upPercentage,
            downPercentage
        };
    }, [currentRound, liveOdds]);

    if (isInitialLoad && (roundLoading || !currentRound)) {
        return (
            <section className='relative flex items-center justify-center min-h-[600px]'>
                <div className="bg-black border-2 border-cyan-500 p-8 text-center animate-pulse">
                    <div className="text-cyan-500 text-xl font-bold mb-2">INITIALIZING...</div>
                    <div className="text-gray-400">Loading round data from blockchain</div>
                </div>
            </section>
        );
    }

    if (!currentRound || !displayData) {
        return (
            <section className='relative flex items-center justify-center min-h-[600px]'>
                <div className="bg-black border-2 border-red-500 p-8 text-center">
                    <div className="text-red-500 text-xl font-bold mb-2">CONNECTION ERROR</div>
                    <div className="text-gray-400 mb-4">Unable to load round data</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border border-cyan-500 text-cyan-500 hover:bg-cyan-500/20"
                    >
                        RETRY
                    </button>
                </div>
            </section>
        );
    }

    const { upOdds, downOdds, totalPool, upPercentage, downPercentage } = displayData;

    return (
        <section className='relative'>
            <div className="mb-8 transition-all duration-300">
                <div className="bg-black border-2 border-cyan-500 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500"></div>
                            <div className="w-3 h-3 bg-yellow-500"></div>
                            <div className="w-3 h-3 bg-green-500"></div>
                            <span className="text-cyan-500 ml-4 font-bold">TERMINAL.EXE</span>
                        </div>
                        <div className="text-cyan-500 text-sm font-bold transition-all duration-300">
                            ROUND #{currentRound.roundId}
                        </div>
                    </div>
                    <div className="border-t border-cyan-500/50 pt-2">
                        <div className="flex items-center justify-between">
                            <BTCPrice />
                            <div className="text-right">
                                <p className="text-gray-400 text-sm transition-all duration-300">
                                    {bettingPhase.phase === 'BETTING_OPEN' && 'BETTING ENDS:'}
                                    {bettingPhase.phase === 'COOLDOWN' && 'SETTLEMENT:'}
                                    {(bettingPhase.phase === 'SETTLING' || bettingPhase.phase === 'WAITING') && 'STATUS:'}
                                </p>
                                <p className={`font-bold text-2xl font-mono transition-all duration-300 ${
                                    bettingPhase.color === 'green' ? 'text-green-500' :
                                    bettingPhase.color === 'orange' ? 'text-orange-500' :
                                    'text-red-500'
                                }`}>
                                    {bettingPhase.timeToShow > 0 ? formatTime(bettingPhase.timeToShow) : '--:--'}
                                </p>
                                <p className={`text-xs font-bold mt-1 transition-all duration-300 ${
                                    bettingPhase.color === 'green' ? 'text-green-500' :
                                    bettingPhase.color === 'orange' ? 'text-orange-500' :
                                    'text-red-500'
                                }`}>
                                    {bettingPhase.label}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {bettingPhase.phase === 'COOLDOWN' && (
                <div className="mb-6 bg-orange-900/20 border-2 border-orange-500 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-orange-500" />
                        <div>
                            <div className="text-orange-500 font-bold">COOLDOWN PERIOD</div>
                            <div className="text-gray-400 text-sm">
                                Betting is closed. Round will settle in {formatTime(bettingPhase.timeToShow)}. Get ready for the next round!
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(bettingPhase.phase === 'SETTLING' || bettingPhase.phase === 'WAITING') && (
                <div className="mb-6 bg-red-900/20 border-2 border-red-500 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <div>
                            <div className="text-red-500 font-bold">
                                {bettingPhase.phase === 'SETTLING' ? 'ROUND SETTLING' : 'WAITING FOR NEW ROUND'}
                            </div>
                            <div className="text-gray-400 text-sm">
                                {bettingPhase.phase === 'SETTLING' 
                                    ? 'Round is being settled. New round will start soon.'
                                    : 'Preparing next round. Please wait...'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-black border-2 border-purple-500/50 h-full">
                        <div className="bg-purple-500/20 border-b border-purple-500/50 p-4">
                            <h2 className="text-purple-300 font-bold text-lg tracking-wider">PREDICTION MODULE</h2>
                            <p className="text-gray-400 text-sm">ROUND DURATION: 60 MINUTES (40 MIN BETTING + 20 MIN COOLDOWN)</p>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-white text-xl font-bold mb-2">QUESTION:</h3>
                                <p className="text-gray-400 mb-2">
                                    Will BTC price move UP or DOWN by round settlement?
                                </p>
                                <div className="text-sm text-gray-500 transition-all duration-300">
                                    Start Price: <span className="text-cyan-500 font-bold">${currentRound.startPrice.toFixed(2)}</span>
                                    {" → "}
                                    Current: <span className="text-white font-bold">${currentBTCPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <button
                                    onClick={() => bettingPhase.canBet && setSelectedBet('up')}
                                    disabled={!bettingPhase.canBet}
                                    className={`relative group border-2 p-8 transition-all duration-300 ${
                                        !bettingPhase.canBet 
                                            ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                                            : selectedBet === 'up'
                                            ? 'border-green-500 bg-green-500/20'
                                            : 'border-green-500/50 hover:border-green-500 hover:bg-green-500/10'
                                        }`}
                                >
                                    <div className="text-center">
                                        <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <div className="text-green-500 font-bold text-2xl mb-2 tracking-wider">UP</div>
                                        <div className="space-y-1">
                                            <div className="text-green-400 font-bold text-lg transition-all duration-300">{upPercentage}%</div>
                                            <div className="text-gray-400 text-sm transition-all duration-300">{currentRound.totalUpBets.toFixed(2)} MAS</div>
                                            <div className="text-xs text-gray-500 bg-black/50 px-2 py-1 inline-block transition-all duration-300">
                                                PAYOUT: {upOdds.toFixed(2)}x
                                            </div>
                                        </div>
                                    </div>
                                    {selectedBet === 'up' && bettingPhase.canBet && (
                                        <div className="absolute top-2 right-2">
                                            <Zap className="w-6 h-6 text-green-500 animate-pulse" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={() => bettingPhase.canBet && setSelectedBet('down')}
                                    disabled={!bettingPhase.canBet}
                                    className={`relative group border-2 p-8 transition-all duration-300 ${
                                        !bettingPhase.canBet 
                                            ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                                            : selectedBet === 'down'
                                            ? 'border-red-500 bg-red-500/20'
                                            : 'border-red-500/50 hover:border-red-500 hover:bg-red-500/10'
                                        }`}
                                >
                                    <div className="text-center">
                                        <TrendingDown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                        <div className="text-red-500 font-bold text-2xl mb-2 tracking-wider">DOWN</div>
                                        <div className="space-y-1">
                                            <div className="text-red-400 font-bold text-lg transition-all duration-300">{downPercentage}%</div>
                                            <div className="text-gray-400 text-sm transition-all duration-300">{currentRound.totalDownBets.toFixed(2)} MAS</div>
                                            <div className="text-xs text-gray-500 bg-black/50 px-2 py-1 inline-block transition-all duration-300">
                                                PAYOUT: {downOdds.toFixed(2)}x
                                            </div>
                                        </div>
                                    </div>
                                    {selectedBet === 'down' && bettingPhase.canBet && (
                                        <div className="absolute top-2 right-2">
                                            <Zap className="w-6 h-6 text-red-500 animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            </div>

                            {selectedBet && (
                                <div className="border border-cyan-500/50 bg-black/50 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                                disabled={!bettingPhase.canBet || placing}
                                                className="flex-1 bg-transparent px-4 py-3 text-white text-xl font-bold font-mono focus:outline-none disabled:opacity-50"
                                            />
                                            <div className="border-l border-gray-600 px-4 py-3 text-cyan-500 font-bold">MAS</div>
                                        </div>
                                    </div>

                                    {liveOdds && betAmount && parseFloat(betAmount) >= 1 && (
                                        <div className="mb-4 bg-cyan-900/20 border border-cyan-500/50 p-3 animate-in fade-in duration-300">
                                            <div className="text-xs text-gray-400 mb-1">POTENTIAL PAYOUT:</div>
                                            <div className="text-cyan-500 font-bold text-xl">
                                                {(selectedBet === 'up' ? liveOdds.upPayout : liveOdds.downPayout).toFixed(2)} MAS
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {(selectedBet === 'up' ? liveOdds.upOdds : liveOdds.downOdds).toFixed(2)}x multiplier
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex space-x-2">
                                            {[10, 25, 50, 100].map(amount => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setBetAmount(amount.toString())}
                                                    disabled={!bettingPhase.canBet || placing}
                                                    className="px-3 py-1 border border-gray-600 hover:border-cyan-500 hover:text-cyan-500 text-gray-400 transition-colors text-sm font-bold disabled:opacity-50"
                                                >
                                                    {amount}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-gray-500 text-sm">MIN: {houseStatus?.minBetAmount.toFixed(0) || 1} MAS</span>
                                    </div>

                                    <button
                                        onClick={handlePlaceBet}
                                        disabled={!bettingPhase.canBet || placing || !account}
                                        className={`w-full py-4 border-2 font-bold text-lg tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                            selectedBet === 'up'
                                            ? 'border-green-500 bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                            : 'border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                        }`}
                                    >
                                        {!account 
                                            ? 'CONNECT WALLET'
                                            : placing 
                                            ? 'EXECUTING...'
                                            : !bettingPhase.canBet
                                            ? 'BETTING CLOSED'
                                            : `EXECUTE ${selectedBet?.toUpperCase()} PREDICTION`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <HouseStatus />
                    <PoolDistribution 
                        upPercentage={upPercentage}
                        downPercentage={downPercentage}
                        totalUpBets={currentRound.totalUpBets}
                        totalDownBets={currentRound.totalDownBets}
                        totalPool={totalPool}
                    />
                    <LiveActivity activities={recentActivity} />
                </div>
            </div>
        </section>
    )
}

export default MainPanel
