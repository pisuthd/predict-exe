"use client"

import React, { useState } from 'react';
import { History, BarChart3, TrendingUp, TrendingDown, Clock, Trophy, Target, Zap, Shield, Code, Globe, Bitcoin, Activity, Users, Database } from 'lucide-react';

// History Page Component
export const HistoryContainer = () => {
  const [filter, setFilter] = useState('all');
  
  const historyData = [
    { id: 1247, time: '2025-09-27 14:30', prediction: 'UP', amount: 50, result: 'WIN', payout: 73.5, status: 'settled' },
    { id: 1246, time: '2025-09-27 13:30', prediction: 'DOWN', amount: 25, result: 'LOSS', payout: 0, status: 'settled' },
    { id: 1245, time: '2025-09-27 12:30', prediction: 'UP', amount: 100, result: 'WIN', payout: 147.2, status: 'settled' },
    { id: 1244, time: '2025-09-27 11:30', prediction: 'DOWN', amount: 75, result: 'WIN', payout: 112.8, status: 'settled' },
    { id: 1243, time: '2025-09-27 10:30', prediction: 'UP', amount: 30, result: 'LOSS', payout: 0, status: 'settled' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black font-mono">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-black border-2 border-cyan-500 mb-8">
          <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-4">
            <div className="flex items-center space-x-3">
              <History className="w-6 h-6 text-cyan-500" />
              <h1 className="text-2xl font-bold text-cyan-500 tracking-wider">PREDICTION HISTORY</h1>
            </div>
            <p className="text-gray-400 text-sm mt-1">Your complete prediction execution log</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black border-2 border-green-500/50 p-4">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-500">73.2%</div>
              <div className="text-gray-400 text-sm">WIN RATE</div>
            </div>
          </div>
          <div className="bg-black border-2 border-purple-500/50 p-4">
            <div className="text-center">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-500">127</div>
              <div className="text-gray-400 text-sm">TOTAL BETS</div>
            </div>
          </div>
          <div className="bg-black border-2 border-yellow-500/50 p-4">
            <div className="text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-500">+847.3</div>
              <div className="text-gray-400 text-sm">NET PROFIT</div>
            </div>
          </div>
          <div className="bg-black border-2 border-blue-500/50 p-4">
            <div className="text-center">
              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-500">12</div>
              <div className="text-gray-400 text-sm">WIN STREAK</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-black border-2 border-gray-500/50 mb-6">
          <div className="flex space-x-0 border-b border-gray-500/50">
            {['all', 'wins', 'losses', 'pending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-3 font-bold text-sm tracking-wider transition-colors ${
                  filter === tab
                    ? 'bg-cyan-500/20 text-cyan-500 border-b-2 border-cyan-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-black border-2 border-gray-500/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-500/50">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-bold">ROUND</th>
                  <th className="text-left p-4 text-gray-400 font-bold">TIME</th>
                  <th className="text-left p-4 text-gray-400 font-bold">PREDICTION</th>
                  <th className="text-left p-4 text-gray-400 font-bold">STAKE</th>
                  <th className="text-left p-4 text-gray-400 font-bold">RESULT</th>
                  <th className="text-left p-4 text-gray-400 font-bold">PAYOUT</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((bet, index) => (
                  <tr key={bet.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-cyan-500 font-bold">#{bet.id}</td>
                    <td className="p-4 text-gray-300">{bet.time}</td>
                    <td className="p-4">
                      <div className={`flex items-center space-x-2 ${bet.prediction === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                        {bet.prediction === 'UP' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="font-bold">{bet.prediction}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white font-bold">{bet.amount} MAS</td>
                    <td className="p-4">
                      <span className={`font-bold ${bet.result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>
                        {bet.result}
                      </span>
                    </td>
                    <td className="p-4 text-white font-bold">{bet.payout} MAS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};