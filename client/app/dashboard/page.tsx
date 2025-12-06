"use client"

import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Calendar, Award, Zap, Target } from 'lucide-react';

// Mock data for demonstration
const mockStats = {
  totalUsers: 2847,
  activeToday: 342,
  totalPPDistributed: 125000,
  currentSeasonPP: 45000,
  averageDailyPP: 10000,
  flipPrice: 0.0001,
  totalSupply: 50000,
  marketCap: 5.0,
  topPredictors: [
    { address: "0x1234...5678", pp: 2847, flip: 1250, rank: 1, change: "up" },
    { address: "0xabcd...ef12", pp: 2156, flip: 980, rank: 2, change: "up" },
    { address: "0x9876...5432", pp: 1923, flip: 750, rank: 3, change: "down" },
    { address: "0x5678...9012", pp: 1654, flip: 620, rank: 4, change: "up" },
    { address: "0xfedc...ba98", pp: 1432, flip: 500, rank: 5, change: "same" },
  ],
  currentSeason: {
    id: 12,
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    totalParticipants: 892,
    totalPP: 45000,
  },
  recentActivity: [
    { type: "prediction", user: "0x1234...5678", amount: 50, result: "win", pp: 125, flip: 25, time: "2 min ago" },
    { type: "flip_buy", user: "0xabcd...ef12", amount: 100, result: "buy", pp: 0, flip: 100, time: "5 min ago" },
    { type: "credit_convert", user: "0x9876...5432", amount: 500, result: "convert", pp: 500, flip: 250, time: "1 hour ago" },
    { type: "prediction", user: "0x5678...9012", amount: 100, result: "win", pp: 280, flip: 50, time: "2 hours ago" },
  ]
};

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'leaderboard' | 'seasons'>('overview');
  const [userStats, setUserStats] = useState({
    userPP: 1250,
    seasonRank: 45,
    todayPredictions: 3,
    winRate: 68.5,
    totalWinnings: 890
  });

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-500 mb-2">Dashboard</h1>
          <p className="text-gray-400">Real-time stats and season overview</p>
        </div>

        {/* User Stats Card */}
        <div className="bg-black border-2 border-cyan-500/50 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-500">{userStats.userPP.toLocaleString()}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Your PP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">#{userStats.seasonRank}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Season Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{userStats.todayPredictions}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{userStats.winRate}%</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{userStats.totalWinnings}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Total Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">850</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">FLIP</div>
            </div>
          </div>
        </div>

        {/* FLIP Portfolio Card */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              FLIP Portfolio
            </h2>
            <div className="text-sm text-gray-400">
              Current Price: <span className="text-cyan-400 font-bold">{mockStats.flipPrice.toFixed(6)} MAS</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-500">850</div>
              <div className="text-sm text-gray-400">FLIP Balance</div>
              <div className="text-xs text-green-400 mt-1">+125 today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">0.0850</div>
              <div className="text-sm text-gray-400">Value (MAS)</div>
              <div className="text-xs text-green-400 mt-1">+15.2%</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">0.0001</div>
              <div className="text-sm text-gray-400">Avg Buy Price</div>
              <div className="text-xs text-yellow-400 mt-1">Early Adopter</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">10x</div>
              <div className="text-sm text-gray-400">Potential</div>
              <div className="text-xs text-cyan-400 mt-1">Next Stage</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-black font-bold px-6 py-2 rounded-lg transition-all transform hover:scale-105">
              Buy More FLIP
            </button>
            <button className="border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 px-6 py-2 rounded-lg transition-all">
              Convert Credits
            </button>
            <button className="border border-purple-500 text-purple-400 hover:bg-purple-500/10 px-6 py-2 rounded-lg transition-all">
              View History
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-cyan-500/30">
          {(['overview', 'leaderboard', 'seasons'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-3 font-bold text-sm tracking-wider transition-all ${
                selectedTab === tab
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-cyan-500'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Stats */}
            <div className="bg-black border-2 border-purple-500/50 p-6">
              <h2 className="text-purple-400 font-bold text-xl mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                System Overview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-cyan-500 font-bold">{mockStats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Today</span>
                  <span className="text-green-500 font-bold">{mockStats.activeToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total PP Distributed</span>
                  <span className="text-purple-500 font-bold">{mockStats.totalPPDistributed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Daily PP Average</span>
                  <span className="text-yellow-500 font-bold">{mockStats.averageDailyPP.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Current Season */}
            <div className="bg-black border-2 border-green-500/50 p-6">
              <h2 className="text-green-400 font-bold text-xl mb-4 flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                Current Season
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Season #{mockStats.currentSeason.id}</span>
                  <span className="text-green-500 font-bold">{formatTimeRemaining(mockStats.currentSeason.endDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Participants</span>
                  <span className="text-cyan-500 font-bold">{mockStats.currentSeason.totalParticipants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">PP Pool</span>
                  <span className="text-purple-500 font-bold">{mockStats.currentSeason.totalPP.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">65% Complete</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-black border-2 border-yellow-500/50 p-6 lg:col-span-2">
              <h2 className="text-yellow-400 font-bold text-xl mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {mockStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'prediction' 
                          ? activity.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                          : activity.type === 'flip_buy' ? 'bg-cyan-500'
                          : 'bg-purple-500'
                      }`}></div>
                      <span className="text-gray-300">{activity.user}</span>
                      <span className="text-gray-500 text-sm">
                        {activity.type === 'prediction' ? 'Prediction' : 
                         activity.type === 'flip_buy' ? 'FLIP Purchase' : 'Credit Convert'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {activity.flip > 0 && (
                        <span className="text-pink-500 font-bold">+{activity.flip} FLIP</span>
                      )}
                      <span className="text-cyan-500 font-bold">+{activity.pp} PP</span>
                      <span className="text-gray-500 text-xs">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'leaderboard' && (
          <div className="bg-black border-2 border-cyan-500/50 p-6">
            <h2 className="text-cyan-400 font-bold text-xl mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2" />
              Season Leaderboard
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/30">
                    <th className="text-left py-3 px-4 text-cyan-300">Rank</th>
                    <th className="text-left py-3 px-4 text-cyan-300">Address</th>
                    <th className="text-right py-3 px-4 text-cyan-300">PP</th>
                    <th className="text-right py-3 px-4 text-pink-300">FLIP</th>
                    <th className="text-center py-3 px-4 text-cyan-300">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStats.topPredictors.map((predictor) => (
                    <tr key={predictor.rank} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {predictor.rank <= 3 && (
                            <Trophy className={`w-4 h-4 mr-2 ${
                              predictor.rank === 1 ? 'text-yellow-500' :
                              predictor.rank === 2 ? 'text-gray-400' : 'text-orange-600'
                            }`} />
                          )}
                          <span className="text-white font-bold">#{predictor.rank}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{predictor.address}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-cyan-500 font-bold">{predictor.pp.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-pink-500 font-bold">{predictor.flip.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {predictor.change === 'up' && <span className="text-green-500">↑</span>}
                        {predictor.change === 'down' && <span className="text-red-500">↓</span>}
                        {predictor.change === 'same' && <span className="text-gray-500">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'seasons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[11, 10, 9, 8, 7, 6].map((seasonId) => (
              <div key={seasonId} className="bg-black border-2 border-purple-500/50 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-purple-400 font-bold text-lg">Season #{seasonId}</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1">Completed</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Winner</span>
                    <span className="text-cyan-500 text-sm font-bold">0x1234...5678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total PP</span>
                    <span className="text-purple-500 text-sm font-bold">38,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Participants</span>
                    <span className="text-green-500 text-sm font-bold">756</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
