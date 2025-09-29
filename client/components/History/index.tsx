"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Trophy, Target, Zap, Activity, RefreshCw, Gift, Lock } from 'lucide-react';
import { useRound } from '@/hooks/useRound';
import { useAccount } from '@/contexts/account';
import { useMarket, CONTRACT_ADDRESS } from '@/contexts/market';

// History Page Component
export const HistoryContainer = () => {
  const { provider } = useMarket();
  const { account, claimWinnings } = useAccount();
  const {
    currentRound,
    roundHistory,
    fetchRoundDetails,
    getUserBet,
    isLoading
  } = useRound(CONTRACT_ADDRESS, provider);

  const [filter, setFilter] = useState('all');
  const [allRounds, setAllRounds] = useState<any[]>([]);
  const [userBetsMap, setUserBetsMap] = useState<{ [key: number]: any }>({});
  const [claiming, setClaiming] = useState<{ [key: number]: boolean }>({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userStats, setUserStats] = useState({
    totalBets: 0,
    wins: 0,
    losses: 0,
    totalStaked: 0,
    totalWon: 0,
    netProfit: 0,
    winRate: 0
  });

  // Load all settled rounds (public data)
  useEffect(() => {
    const loadAllRounds = async () => {
      if (!currentRound) return;

      setLoadingHistory(true);
      try {
        // Get last 50 rounds
        const roundCount = Math.min(50, currentRound.roundId);
        const rounds = [];

        for (let i = currentRound.roundId; i > Math.max(0, currentRound.roundId - roundCount); i--) {
          try {
            const round = await fetchRoundDetails(i);
            if (round && round.isSettled) {
              rounds.push(round);
            }
          } catch (err) {
            console.error(`Error loading round ${i}:`, err);
          }
        }

        setAllRounds(rounds);
        setIsInitialLoad(false);
      } catch (err) {
        console.error('Error loading rounds:', err);
        setIsInitialLoad(false);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (currentRound) {
      loadAllRounds();
    }
  }, [currentRound?.roundId, fetchRoundDetails]); // Only reload when round ID changes

  // Load user bets if wallet connected
  useEffect(() => {
    const loadUserBets = async () => {
      if (!account || allRounds.length === 0) return;

      try {
        const betsMap: { [key: number]: any } = {};

        for (const round of allRounds) {
          const userBet = await getUserBet(round.roundId, account.address);
          if (userBet && userBet.totalBet > 0) {
            betsMap[round.roundId] = userBet;
          }
        }

        setUserBetsMap(betsMap);
        calculateUserStats(allRounds, betsMap);
      } catch (err) {
        console.error('Error loading user bets:', err);
      }
    };

    if (account && allRounds.length > 0) {
      loadUserBets();
    }
  }, [account, allRounds.length, getUserBet]); // Only reload when account or rounds length changes

  // Calculate user statistics
  const calculateUserStats = (rounds: any[], betsMap: { [key: number]: any }) => {
    let totalBets = 0;
    let wins = 0;
    let losses = 0;
    let totalStaked = 0;
    let totalWon = 0;

    rounds.forEach(round => {
      const userBet = betsMap[round.roundId];
      if (!userBet || userBet.totalBet === 0) return;

      const userWon = (round.upWins && userBet.upBets > 0) ||
        (!round.upWins && userBet.downBets > 0);

      totalBets++;
      totalStaked += userBet.totalBet;

      if (userWon) {
        wins++;
        const payout = calculatePayout(round, userBet);
        totalWon += payout;
      } else {
        losses++;
      }
    });

    const netProfit = totalWon - totalStaked;
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

    setUserStats({
      totalBets,
      wins,
      losses,
      totalStaked,
      totalWon,
      netProfit,
      winRate
    });
  };

  // Calculate payout for a winning bet
  const calculatePayout = (round: any, userBet: any) => {
    const userWon = (round.upWins && userBet.upBets > 0) ||
      (!round.upWins && userBet.downBets > 0);

    if (!userWon) return 0;

    const winningBet = round.upWins ? userBet.upBets : userBet.downBets;
    const totalPool = round.totalUpBets + round.totalDownBets;

    if (totalPool === 0) return winningBet * 1.5; // Fallback

    const winnerPool = round.upWins ? round.totalUpBets : round.totalDownBets;
    const probability = winnerPool / totalPool;
    const fairOdds = 1.0 / probability;
    const houseOdds = fairOdds * 0.95; // 5% house edge
    const clampedOdds = Math.max(1.1, Math.min(5.0, houseOdds));

    return winningBet * clampedOdds;
  };

  // Filter history based on selected filter (memoized)
  const filteredHistory = useMemo(() => {
    if (filter === 'all') return allRounds;

    if (!account) return allRounds; // Show all if not connected

    // Filter based on user participation
    return allRounds.filter(round => {
      const userBet = userBetsMap[round.roundId];
      if (!userBet || userBet.totalBet === 0) return false;

      const userWon = (round.upWins && userBet.upBets > 0) ||
        (!round.upWins && userBet.downBets > 0);

      if (filter === 'wins') return userWon;
      if (filter === 'losses') return !userWon;
      if (filter === 'mybets') return true;
      return false;
    });
  }, [allRounds, filter, account, userBetsMap]);

  // Handle claim winnings
  const handleClaim = async (roundId: number) => {
    if (!account) {
      alert('Please connect your wallet to claim winnings');
      return;
    }

    try {
      setClaiming({ ...claiming, [roundId]: true });
      const result = await claimWinnings(roundId);
      alert(`Successfully claimed ${result.winnings.toFixed(2)} MAS!`);

      // Refresh user bets
      const updatedBet = await getUserBet(roundId, account.address);
      setUserBetsMap(prev => ({
        ...prev,
        [roundId]: updatedBet
      }));
    } catch (err: any) {
      alert(`Error claiming: ${err.message}`);
    } finally {
      setClaiming({ ...claiming, [roundId]: false });
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate odds from pool data
  const calculateOddsFromPool = (round: any, direction: 'UP' | 'DOWN') => {
    const totalPool = round.totalUpBets + round.totalDownBets;
    if (totalPool === 0) return 1.5;

    const sidePool = direction === 'UP' ? round.totalUpBets : round.totalDownBets;
    const probability = sidePool / totalPool;
    const fairOdds = 1.0 / probability;
    const houseOdds = fairOdds * 0.95;
    const clampedOdds = Math.max(1.1, Math.min(5.0, houseOdds));

    return clampedOdds;
  };

  // Show loading only on initial load
  if (isInitialLoad && (loadingHistory || isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black font-mono flex items-center justify-center">
        <div className="bg-black border-2 border-cyan-500 p-8 text-center animate-pulse">
          <div className="text-cyan-500 text-xl font-bold mb-2">LOADING HISTORY...</div>
          <div className="text-gray-400">Fetching round data from blockchain</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black via-gray-950 to-black font-mono">
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="bg-black border-2 border-cyan-500 mb-8 transition-all duration-300">
          <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-cyan-500 tracking-wider">ROUND HISTORY</h1>
                <p className="text-gray-400 text-sm mt-1">
                  {account
                    ? 'View all rounds and manage your winnings'
                    : 'Connect wallet to see your bets'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary - Only show if wallet connected */}
        {account && userStats.totalBets > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="bg-black border-2 border-green-500/50 p-4 transition-all duration-300 hover:border-green-500">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500 transition-all duration-300">{userStats.winRate.toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">YOUR WIN RATE</div>
                <div className="text-xs text-gray-500 mt-1">{userStats.wins}W / {userStats.losses}L</div>
              </div>
            </div>
            <div className="bg-black border-2 border-purple-500/50 p-4 transition-all duration-300 hover:border-purple-500">
              <div className="text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-500 transition-all duration-300">{userStats.totalBets}</div>
                <div className="text-gray-400 text-sm">YOUR BETS</div>
                <div className="text-xs text-gray-500 mt-1">{userStats.totalStaked.toFixed(2)} MAS</div>
              </div>
            </div>
            <div className="bg-black border-2 border-yellow-500/50 p-4 transition-all duration-300 hover:border-yellow-500">
              <div className="text-center">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className={`text-2xl font-bold transition-all duration-300 ${userStats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {userStats.netProfit >= 0 ? '+' : ''}{userStats.netProfit.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">YOUR NET PROFIT</div>
                <div className="text-xs text-gray-500 mt-1">{userStats.totalWon.toFixed(2)} won</div>
              </div>
            </div>
            <div className="bg-black border-2 border-blue-500/50 p-4 transition-all duration-300 hover:border-blue-500">
              <div className="text-center">
                <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-500 transition-all duration-300">
                  {currentRound ? `#${currentRound.roundId}` : '---'}
                </div>
                <div className="text-gray-400 text-sm">CURRENT ROUND</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-black border-2 border-gray-500/50 mb-6 transition-all duration-300">
          <div className="flex space-x-0 border-b border-gray-500/50 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 font-bold text-sm tracking-wider transition-all duration-300 whitespace-nowrap ${filter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
            >
              ALL ROUNDS
              <span className="ml-2 text-xs transition-all duration-300">({allRounds.length})</span>
            </button>
            {account && (
              <>
                <button
                  onClick={() => setFilter('mybets')}
                  className={`px-6 py-3 font-bold text-sm tracking-wider transition-all duration-300 whitespace-nowrap ${filter === 'mybets'
                      ? 'bg-cyan-500/20 text-cyan-500 border-b-2 border-cyan-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                  MY BETS
                  <span className="ml-2 text-xs transition-all duration-300">({userStats.totalBets})</span>
                </button>
                <button
                  onClick={() => setFilter('wins')}
                  className={`px-6 py-3 font-bold text-sm tracking-wider transition-all duration-300 whitespace-nowrap ${filter === 'wins'
                      ? 'bg-cyan-500/20 text-cyan-500 border-b-2 border-cyan-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                  WINS
                  <span className="ml-2 text-xs transition-all duration-300">({userStats.wins})</span>
                </button>
                <button
                  onClick={() => setFilter('losses')}
                  className={`px-6 py-3 font-bold text-sm tracking-wider transition-all duration-300 whitespace-nowrap ${filter === 'losses'
                      ? 'bg-cyan-500/20 text-cyan-500 border-b-2 border-cyan-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                  LOSSES
                  <span className="ml-2 text-xs transition-all duration-300">({userStats.losses})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredHistory.length === 0 && !loadingHistory && (
          <div className="bg-black border-2 border-gray-500/50 p-12 text-center animate-in fade-in duration-500">
            <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-400 text-lg font-bold mb-2">NO ROUNDS FOUND</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'No settled rounds available yet'
                : 'You have no bets matching this filter'}
            </p>
          </div>
        )}

        {/* History Table */}
        {filteredHistory.length > 0 && (
          <div className="bg-black border-2 border-gray-500/50 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50 border-b border-gray-500/50">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-bold">ROUND</th>
                    <th className="text-left p-4 text-gray-400 font-bold">SETTLED</th>
                    <th className="text-left p-4 text-gray-400 font-bold">PRICE MOVEMENT</th>
                    <th className="text-left p-4 text-gray-400 font-bold">RESULT</th>
                    <th className="text-left p-4 text-gray-400 font-bold">POOL</th>
                    <th className="text-left p-4 text-gray-400 font-bold">ODDS</th>
                    {account && <th className="text-left p-4 text-gray-400 font-bold">YOUR BET</th>}
                    {account && <th className="text-left p-4 text-gray-400 font-bold">ACTION</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((round, index) => {
                    const userBet = userBetsMap[round.roundId];
                    const hasUserBet = userBet && userBet.totalBet > 0;
                    const userWon = hasUserBet && (
                      (round.upWins && userBet.upBets > 0) ||
                      (!round.upWins && userBet.downBets > 0)
                    );
                    const userBetDirection = hasUserBet ? (userBet.upBets > 0 ? 'UP' : 'DOWN') : null;
                    const payout = hasUserBet ? calculatePayout(round, userBet) : 0;
                    const priceChange = ((round.endPrice - round.startPrice) / round.startPrice * 100).toFixed(2);
                    const canClaim = account && userWon && payout > 0;

                    const upOdds = calculateOddsFromPool(round, 'UP');
                    const downOdds = calculateOddsFromPool(round, 'DOWN');

                    return (
                      <tr
                        key={round.roundId}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-all duration-300 ${hasUserBet ? 'bg-blue-500/5' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4 text-cyan-500 font-bold transition-all duration-300">#{round.roundId}</td>
                        <td className="p-4 text-gray-300 text-xs">{formatTime(round.settlementTime)}</td>
                        <td className="p-4">
                          <div>
                            <div className="text-gray-400 text-xs">
                              ${round.startPrice.toFixed(2)} → ${round.endPrice.toFixed(2)}
                            </div>
                            <div className={`text-sm font-bold transition-all duration-300 ${parseFloat(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {parseFloat(priceChange) >= 0 ? '+' : ''}{priceChange}%
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center space-x-2 font-bold transition-all duration-300 ${round.upWins ? 'text-green-500' : 'text-red-500'}`}>
                            {round.upWins ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            <span>{round.upWins ? 'UP' : 'DOWN'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white font-bold transition-all duration-300">{round.totalPool.toFixed(2)} MAS</div>
                          <div className="text-xs text-gray-500">
                            <span className="text-green-500">{round.totalUpBets.toFixed(1)}</span> /
                            <span className="text-red-500"> {round.totalDownBets.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs space-y-1">
                            <div className={`transition-all duration-300 ${round.upWins ? 'text-green-500 font-bold' : 'text-gray-500'}`}>
                              UP: {upOdds.toFixed(2)}x
                            </div>
                            <div className={`transition-all duration-300 ${!round.upWins ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                              DOWN: {downOdds.toFixed(2)}x
                            </div>
                          </div>
                        </td>
                        {account && (
                          <td className="p-4">
                            {hasUserBet ? (
                              <div className="transition-all duration-300">
                                <div className={`flex items-center space-x-1 ${userBetDirection === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                                  {userBetDirection === 'UP' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                  <span className="font-bold">{userBetDirection}</span>
                                </div>
                                <div className="text-white font-bold text-xs">{userBet.totalBet.toFixed(2)} MAS</div>
                                {userWon && (
                                  <div className="text-green-500 text-xs font-bold">
                                    +{payout.toFixed(2)} MAS
                                  </div>
                                )}
                                {!userWon && (
                                  <div className="text-red-500 text-xs">
                                    Lost
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-600 text-xs">No bet</div>
                            )}
                          </td>
                        )}
                        {account && (
                          <td className="p-4">
                            {canClaim ? (
                              <button
                                onClick={() => handleClaim(round.roundId)}
                                disabled={claiming[round.roundId]}
                                className="flex items-center space-x-1 px-3 py-2 border border-green-500 text-green-500 hover:bg-green-500/20 transition-all duration-300 text-xs font-bold disabled:opacity-50 whitespace-nowrap"
                              >
                                <Gift className="w-4 h-4" />
                                <span>{claiming[round.roundId] ? 'CLAIMING...' : 'CLAIM'}</span>
                              </button>
                            ) : hasUserBet && !userWon ? (
                              <span className="text-gray-600 text-xs">---</span>
                            ) : hasUserBet ? (
                              <span className="text-gray-500 text-xs">Claimed</span>
                            ) : (
                              <span className="text-gray-600 text-xs">---</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Connect Wallet CTA - Show at bottom if not connected */}
        {!account && allRounds.length > 0 && (
          <div className="mt-8 bg-black border-2 border-purple-500/50 p-6 transition-all duration-300 hover:border-purple-500 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Lock className="w-8 h-8 text-purple-500" />
                <div>
                  <h3 className="text-purple-500 font-bold text-lg">CONNECT WALLET TO BET</h3>
                  <p className="text-gray-400 text-sm">Track your bets and claim winnings</p>
                </div>
              </div>
              <button className="px-6 py-3 border-2 border-purple-500 text-purple-500 hover:bg-purple-500/20 font-bold transition-all duration-300">
                CONNECT WALLET
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
