"use client"

import React, { useState } from 'react';

export const LiquidityContainer = () => {
    return (
        <section className="min-h-screen  ">
            <div className="max-w-4xl mx-auto px-4 py-8 relative">
                {/* Header */}
                <div className="bg-black border-2 border-green-500 mb-8">
                    <div className="bg-green-500/20 border-b border-green-500/50 p-4">
                        <div className="flex items-center space-x-3">
                            {/* <Shield className="w-6 h-6 text-green-500" /> */}
                            <h1 className="text-2xl font-bold text-green-500 tracking-wider">ABOUT PREDICT-EXE</h1>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">Decentralized prediction markets on Massa Network</p>
                    </div>
                </div>
            </div>
        </section>
    )
}