"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Trophy, Zap, Activity, Users, Target, Lock, RefreshCw, Flame } from 'lucide-react';
import { AnimatedLines } from '../AnimatedLines';

export const HeroSection = () => {
  const [flipPrice, setFlipPrice] = useState(0.0001);
  const [totalSupply, setTotalSupply] = useState(1000000000); // 1B starting supply
  const [priceChange, setPriceChange] = useState(12.5);
  const [upPool, setUpPool] = useState(3000);
  const [downPool, setDownPool] = useState(1000);
  const [masPrice, setMasPrice] = useState(0.0542); // MAS price
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // FLIP price updates
      setFlipPrice(prev => {
        const change = (Math.random() - 0.3) * 0.00001;
        const newPrice = Math.max(0.0001, prev + change);
        setPriceChange(((newPrice - prev) / prev) * 100);
        return newPrice;
      });

      // Supply updates (deflationary - only decreases)
      setTotalSupply(prev => Math.max(500000000, prev - Math.floor(Math.random() * 1000))); // Min 500M

      // Pool updates
      setUpPool(prev => prev + Math.floor(Math.random() * 50) - 20);
      setDownPool(prev => prev + Math.floor(Math.random() * 50) - 20);

      // MAS price updates
      setMasPrice(prev => prev + (Math.random() - 0.5) * 0.001);

      // Timer
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);
 

  return (
    <section className="relative min-h-screen px-4 py-8 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <AnimatedLines />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
        <div className="space-y-12">
          {/* Main Title */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider text-cyan-500">
              MASSA's Deflationary Prediction Token
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-4xl mx-auto">
              Buy FLIP to predict UP or DOWN, FLIP supply starts with 1B tokens and every losing prediction burns tokens forever
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/flip"
              className="group bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-black font-bold px-8 py-4 transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Buy FLIP on DEX</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/predict"
              className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 font-bold px-8 py-4 transition-all flex items-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>Predict MAS Price</span>
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
};
