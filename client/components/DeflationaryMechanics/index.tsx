"use client"

import React, { useState, useEffect } from 'react';
import { Flame, TrendingDown, Zap, Trophy } from 'lucide-react';

export const DeflationaryMechanics = () => {
  const [totalSupply, setTotalSupply] = useState(850000000); // 850M current supply
  const [totalBurned, setTotalBurned] = useState(150000000); // 150M burned
  const [dailyBurn, setDailyBurn] = useState(5000000); // 5M daily burn

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Supply updates (deflationary - only decreases)
      setTotalSupply(prev => Math.max(500000000, prev - Math.floor(Math.random() * 1000)));
      setTotalBurned(prev => prev + Math.floor(Math.random() * 100));
      setDailyBurn(prev => prev + Math.floor(Math.random() * 50));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-transparent via-black/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-cyan-500 mb-4">Deflationary Mechanics</h2>
          <p className="text-gray-400 text-lg">Every loss burns FLIP forever, creating permanent scarcity</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-black border-2 border-cyan-500/50 p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Flame className="w-12 h-12 text-orange-500" />
            </div>
            <div className="text-4xl font-bold text-cyan-500 mb-2">
              {(totalSupply / 1000000000).toFixed(3)}B
            </div>
            <div className="text-gray-400 uppercase tracking-wider">Current Supply</div>
            <div className="text-red-400 text-sm mt-2">↓ {(1500000000 - totalSupply) / 1000000}M burned from 1.5B</div>
          </div>

          <div className="bg-black border-2 border-red-500/50 p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingDown className="w-12 h-12 text-red-500" />
            </div>
            <div className="text-4xl font-bold text-red-500 mb-2">
              {(totalBurned / 1000000).toFixed(0)}M
            </div>
            <div className="text-gray-400 uppercase tracking-wider">Total Burned</div>
            <div className="text-red-400 text-sm mt-2">🔥 Tokens destroyed forever</div>
          </div>

          <div className="bg-black border-2 border-purple-500/50 p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-12 h-12 text-purple-500" />
            </div>
            <div className="text-4xl font-bold text-purple-500 mb-2">
              {(dailyBurn / 1000000).toFixed(1)}M
            </div>
            <div className="text-gray-400 uppercase tracking-wider">Daily Burn Rate</div>
            <div className="text-orange-400 text-sm mt-2">⚡ Active deflation</div>
          </div>
        </div>

        {/* How Burn Mechanics Work */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30 p-8">
          <h3 className="text-2xl font-bold text-cyan-400 mb-6 text-center">How The Burn Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-red-400 flex items-center">
                <Flame className="w-6 h-6 mr-2" />
                When You Lose
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Your FLIP tokens are permanently burned</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Total supply decreases forever</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Burned tokens can never be recreated</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-bold text-green-400 flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                When You Win
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Receive losers' burned FLIP tokens</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Your position increases in value</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Benefit from increasing scarcity</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-block bg-black/60 border border-orange-500/30 p-4">
              <p className="text-orange-400 font-bold text-lg">
                🔥 Supply Only Decreases • Value Only Increases • True Deflation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
