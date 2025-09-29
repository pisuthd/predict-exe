"use client"

import React from 'react';
import { Zap, Shield, Globe, Code, Database, Activity } from 'lucide-react';

export const AboutContainer = () => {
  return (
    <div className="min-h-screen relative font-mono">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-black border-2 border-green-500 mb-8">
          <div className="bg-green-500/20 border-b border-green-500/50 p-4">
            <div className="flex items-center space-x-3"> 
              <h1 className="text-2xl font-bold text-green-500 tracking-wider">ABOUT PREDICT.EXE</h1>
            </div>
            <p className="text-gray-400 text-sm mt-1">Autonomous price prediction on Massa Network</p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-black border-2 border-cyan-500/50 mb-8">
          <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-4">
            <h2 className="text-cyan-300 font-bold tracking-wider">MISSION STATEMENT</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-300 leading-relaxed mb-4">
              PREDICT.EXE is a decentralized on-chain price prediction platform built on the
              high-performance Massa blockchain. 
            </p>
            <p className="text-gray-300 leading-relaxed">
              By leveraging Autonomous Smart Contracts (ASC) with deferred calls, our platform
              enables fully automated market creation, execution, and settlement — with zero
              manual intervention or centralized authority.
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
                  <span className="text-white font-bold">FAST PREDICTION ROUNDS</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  10-minute up/down price prediction rounds for BTC, ETH, and MAS
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-white font-bold">SECURE & TRUSTLESS</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  Outcomes settled autonomously by smart contracts, no admin keys required
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="text-white font-bold">AUTONOMOUS RESOLUTION</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  ASC deferred calls handle round creation and settlement automatically
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  <span className="text-white font-bold">DECENTRALIZED ORACLES</span>
                </div>
                <p className="text-gray-400 text-sm pl-8">
                  Reliable price feeds provided by Umbrella Network
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
                <span className="text-cyan-500 font-bold">AUTONOMOUS SMART CONTRACTS (ASC)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">FRONTEND:</span>
                <span className="text-green-500 font-bold">NEXT.JS + TYPESCRIPT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">PRICE ORACLE:</span>
                <span className="text-yellow-500 font-bold">UMBRELLA NETWORK</span>
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
              <p className="text-gray-300">
  We are a group of software developers based in Japan, driven by our passion
  for decentralization. With PREDICT.EXE, we aim to create a fair and
  autonomous prediction platform powered by Massa Network.
</p>
            </div>
          </div>
        </div> 
      </div>
    </div>
  );
};
