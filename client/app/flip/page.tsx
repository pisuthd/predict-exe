"use client"

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, Activity, Zap, Info } from 'lucide-react';
import Link from 'next/link';

export default function FlipPage() {
  const [currentPrice, setCurrentPrice] = useState(0.0001);
  const [totalSupply, setTotalSupply] = useState(50000);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [activeTab, setActiveTab] = useState('buy');
  const [priceHistory, setPriceHistory] = useState([0.0001, 0.00011, 0.00012, 0.0001, 0.00013]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.3) * 0.00001;
        return Math.max(0.0001, prev + change);
      });
      setTotalSupply(prev => prev + Math.floor(Math.random() * 10));
      setPriceHistory(prev => [...prev.slice(-4), currentPrice]);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const calculateBuyCost = (flipAmount: number) => {
    // Simple bonding curve calculation
    return flipAmount * currentPrice * 1.02; // 2% fee
  };

  const calculateSellReturn = (flipAmount: number) => {
    return flipAmount * currentPrice * 0.98; // 2% fee
  };

  const handleBuyAmountChange = (value: string) => {
    setBuyAmount(value);
    setSellAmount('');
  };

  const handleSellAmountChange = (value: string) => {
    setSellAmount(value);
    setBuyAmount('');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-cyan-500">FLIP Token</h1>
              <p className="text-gray-400 mt-2">Bonding Curve DEX • Get In Early</p>
            </div>
            <Link 
              href="/"
              className="border border-cyan-500 text-cyan-400 px-4 py-2 hover:bg-cyan-500/10 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trading Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart */}
            <div className="bg-black/60 border border-cyan-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Live Price Chart
              </h3>
              <div className="h-48 flex items-end justify-between space-x-2">
                {priceHistory.map((price, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                    style={{ 
                      height: `${(price / Math.max(...priceHistory)) * 100}%`,
                      opacity: index === priceHistory.length - 1 ? 1 : 0.6
                    }}
                  ></div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <div className="text-3xl font-bold text-cyan-500">
                  {currentPrice.toFixed(6)} MAS
                </div>
                <div className="text-sm text-gray-400">Current FLIP Price</div>
              </div>
            </div>

            {/* Buy/Sell Interface */}
            <div className="bg-black/60 border border-purple-500/30 p-6 backdrop-blur-sm">
              {/* Tabs */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`px-6 py-2 font-bold transition-all ${
                    activeTab === 'buy'
                      ? 'bg-cyan-500 text-black'
                      : 'border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10'
                  }`}
                >
                  Buy FLIP
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`px-6 py-2 font-bold transition-all ${
                    activeTab === 'sell'
                      ? 'bg-red-500 text-black'
                      : 'border border-red-500 text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  Sell FLIP
                </button>
              </div>

              {/* Buy Form */}
              {activeTab === 'buy' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount to Buy</label>
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => handleBuyAmountChange(e.target.value)}
                      placeholder="0"
                      className="w-full bg-black/40 border border-cyan-500/30 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <div className="text-right mt-2 text-sm text-gray-400">
                      Cost: {buyAmount ? calculateBuyCost(parseFloat(buyAmount) || 0).toFixed(4) : '0'} MAS
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-105">
                    Buy FLIP
                  </button>
                </div>
              )}

              {/* Sell Form */}
              {activeTab === 'sell' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount to Sell</label>
                    <input
                      type="number"
                      value={sellAmount}
                      onChange={(e) => handleSellAmountChange(e.target.value)}
                      placeholder="0"
                      className="w-full bg-black/40 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                    />
                    <div className="text-right mt-2 text-sm text-gray-400">
                      You'll receive: {sellAmount ? calculateSellReturn(parseFloat(sellAmount) || 0).toFixed(4) : '0'} MAS
                    </div>
                  </div>
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all">
                    Sell FLIP
                  </button>
                </div>
              )}

              {/* Info Box */}
              <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div className="text-xs text-gray-400">
                    <p className="font-bold text-cyan-400">Bonding Curve Mechanics:</p>
                    <p>• Price increases as supply increases</p>
                    <p>• 2% fee on all transactions</p>
                    <p>• No external liquidity needed</p>
                    <p>• Early buyers get better prices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Token Stats */}
            <div className="bg-black/60 border border-green-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Token Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-cyan-500">
                    {totalSupply.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Supply</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {Math.floor(totalSupply * 0.1).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Holders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {(totalSupply * currentPrice).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Market Cap (MAS)</div>
                </div>
              </div>
            </div>

            {/* Early Adopter Benefits */}
            <div className="bg-black/60 border border-yellow-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Early Adopter Benefits
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="text-cyan-400 font-bold">{currentPrice.toFixed(6)} MAS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Next Stage Price:</span>
                  <span className="text-purple-400 font-bold">~0.001 MAS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Potential Return:</span>
                  <span className="text-green-400 font-bold">10x</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-400">
                  ⚡ Get in now before price increases! Early adopters get the best prices.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black/60 border border-cyan-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/predict"
                  className="block w-full text-center border border-purple-500 text-purple-400 py-2 px-4 hover:bg-purple-500/10 transition-colors"
                >
                  Start Predicting
                </Link>
                <Link 
                  href="/dashboard"
                  className="block w-full text-center border border-green-500 text-green-400 py-2 px-4 hover:bg-green-500/10 transition-colors"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
