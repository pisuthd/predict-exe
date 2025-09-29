"use client"

import React, { useState } from 'react';
import { History, BarChart3, TrendingUp, TrendingDown, Clock, Trophy, Target, Zap, Shield, Code, Globe, Bitcoin, Activity, Users, Database } from 'lucide-react';

export const AboutContainer = () => {
  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black via-gray-950 to-black font-mono">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-black border-2 border-green-500 mb-8">
          <div className="bg-green-500/20 border-b border-green-500/50 p-4">
            <div className="flex items-center space-x-3"> 
              <h1 className="text-2xl font-bold text-green-500 tracking-wider">ABOUT PREDICT.EXE</h1>
            </div>
            <p className="text-gray-400 text-sm mt-1">Decentralized prediction markets on Massa Network</p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-black border-2 border-cyan-500/50 mb-8">
          <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-4">
            <h2 className="text-cyan-300 font-bold tracking-wider">MISSION STATEMENT</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              PREDICT-EXE is a revolutionary retro-styled prediction market built on the high-performance
              Massa blockchain. Our platform combines the nostalgic aesthetics of 80s computing with
              cutting-edge DeFi technology to create an engaging prediction experience.
            </p>
            <p className="text-gray-300 leading-relaxed">
              We believe in democratizing predictions through decentralized technology, allowing users
              to execute their market insights with style and precision.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-black border-2 border-purple-500/50 mb-8">
          <div className="bg-purple-500/20 border-b border-purple-500/50 p-4">
            <h2 className="text-purple-300 font-bold tracking-wider">KEY FEATURES</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-white font-bold">INSTANT EXECUTION</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  Lightning-fast prediction execution powered by Massa's high TPS
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-white font-bold">SECURE & TRUSTLESS</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  Smart contract-based predictions with complete transparency
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="text-white font-bold">GLOBAL ACCESS</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  Permissionless platform accessible to users worldwide
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-cyan-500" />
                  <span className="text-white font-bold">RETRO INTERFACE</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  Nostalgic 80s terminal aesthetic with modern functionality
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div className="bg-black border-2 border-orange-500/50 mb-8">
          <div className="bg-orange-500/20 border-b border-orange-500/50 p-4">
            <h2 className="text-orange-300 font-bold tracking-wider">TECHNOLOGY STACK</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">BLOCKCHAIN:</span>
                <span className="text-purple-500 font-bold">MASSA NETWORK</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">SMART CONTRACTS:</span>
                <span className="text-cyan-500 font-bold">ASSEMBLYSCRIPT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">FRONTEND:</span>
                <span className="text-green-500 font-bold">NEXT.JS + TYPESCRIPT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">PRICE ORACLE:</span>
                <span className="text-yellow-500 font-bold">CHAINLINK</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">WALLET:</span>
                <span className="text-red-500 font-bold">MASSA STATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-black border-2 border-red-500/50 mb-8">
          <div className="bg-red-500/20 border-b border-red-500/50 p-4">
            <h2 className="text-red-300 font-bold tracking-wider">DEVELOPMENT TEAM</h2>
          </div>
          <div className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-black border-2 border-cyan-500 mx-auto flex items-center justify-center">
                <Code className="w-8 h-8 text-cyan-500" />
              </div>
              <p className="text-gray-300">
                Built by a team of blockchain enthusiasts and retro computing lovers,
                PREDICT-EXE represents the fusion of nostalgic design with modern DeFi innovation.
              </p>
              <div className="flex justify-center space-x-6 pt-4">
                <a href="#" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                  {/* <Github className="w-6 h-6" /> */}
                </a>
                <a href="#" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                  <Globe className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-black border-2 border-yellow-500/50">
          <div className="bg-yellow-500/20 border-b border-yellow-500/50 p-4">
            <h2 className="text-yellow-300 font-bold tracking-wider">CONTACT & SUPPORT</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-bold mb-3">GENERAL INQUIRIES</h4>
                <p className="text-gray-400 text-sm mb-2">Email: info@predict-exe.com</p>
                <p className="text-gray-400 text-sm">Discord: PREDICT-EXE Official</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3">TECHNICAL SUPPORT</h4>
                <p className="text-gray-400 text-sm mb-2">Support: support@predict-exe.com</p>
                <p className="text-gray-400 text-sm">Telegram: @PredictEXESupport</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-500 text-xs text-center">
                PREDICT-EXE v1.0.0 • Built on Massa Network • Open Source • MIT License
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};