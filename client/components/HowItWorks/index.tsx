"use client"

import React from 'react';
import { Lock, Target, Flame, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  return (
    <section className="py-16 pt-8 relative px-4 bg-gradient-to-b from-transparent via-black/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-cyan-500 mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Simple 3-step process to predict MAS price and earn FLIP</p>
        </div>

        {/* 3-Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-black/60 border border-cyan-500/30 p-8 backdrop-blur-sm hover:border-cyan-400 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex items-center justify-center w-20 h-20 bg-cyan-500/20 rounded-full border-2 border-cyan-500/50">
                  <Lock className="w-10 h-10 text-cyan-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-cyan-400 font-bold text-xl">1. Buy FLIP</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Start with 1B total supply • Buy on 50:50 DEX • Lock tokens for prediction
                  </p>
                </div>
                <div className="text-cyan-300 text-xs font-mono bg-cyan-500/10 px-3 py-1 rounded-full">
                  1,000,000,000 Starting Supply
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
              <ArrowRight className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-black/60 border border-purple-500/30 p-8 backdrop-blur-sm hover:border-purple-400 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full border-2 border-purple-500/50">
                  <Target className="w-10 h-10 text-purple-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-purple-400 font-bold text-xl">2. Predict MAS</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Next day MAS token price • Choose UP or DOWN • Simple binary prediction
                  </p>
                </div>
                <div className="text-purple-300 text-xs font-mono bg-purple-500/10 px-3 py-1 rounded-full">
                  Daily Price Prediction
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
              <ArrowRight className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="bg-black/60 border border-orange-500/30 p-8 backdrop-blur-sm hover:border-orange-400 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full border-2 border-orange-500/50">
                  <Flame className="w-10 h-10 text-orange-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-orange-400 font-bold text-xl">3. Burn or Win</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Lose = FLIP burns forever • Win = Get losers' FLIP • Supply decreases
                  </p>
                </div>
                <div className="text-orange-300 text-xs font-mono bg-orange-500/10 px-3 py-1 rounded-full">
                  Permanent Deflation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30 p-8">
          <h3 className="text-2xl font-bold text-cyan-400 mb-8 text-center">Key Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold text-cyan-500">50:50</div>
              <div className="text-gray-400 text-sm">Fair DEX Trading</div>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold text-purple-500">1B→0</div>
              <div className="text-gray-400 text-sm">Supply Only Decreases</div>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold text-orange-500">🔥</div>
              <div className="text-gray-400 text-sm">Permanent Burn</div>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-3xl font-bold text-green-500">⚡</div>
              <div className="text-gray-400 text-sm">Daily Predictions</div>
            </div>
          </div>
        </div>
 
      </div>
    </section>
  );
};
