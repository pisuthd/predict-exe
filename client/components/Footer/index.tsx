import React from 'react';
import { Github, Twitter, Globe, Zap, Trophy, Users } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative z-10 mt-16 border-t-2 border-cyan-500/50 bg-black/90 backdrop-blur-sm font-mono">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> 
          <div className="space-y-4">
            <div className="flex items-center space-x-3"> 
              <div>
                <h3 className="text-xl font-bold text-cyan-500 tracking-wider">MassaFlip</h3> 
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Daily predictions and weekly seasons on the Massa Network. Earn Prediction Points and compete for exclusive rewards.
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
              <span className="text-green-500">Live on Massa</span>
            </div>
          </div> 
          
          <div className="space-y-4">
            <h4 className="text-purple-400 font-bold tracking-wider text-sm border-b border-purple-500/30 pb-2">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <span>HOME</span>
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <span>DASHBOARD</span>
                </a>
              </li>
              <li>
                <a href="/predict" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <span>PREDICT</span>
                </a>
              </li>   
              <li>
                <a href="/about" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <span>ABOUT</span>
                </a>
              </li>
            </ul>
          </div>
 
          <div className="space-y-4">
            <h4 className="text-green-400 font-bold tracking-wider text-sm border-b border-green-500/30 pb-2">
              FEATURES
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-gray-400">Daily Predictions</span>
              </li>
              <li className="flex items-center space-x-2">
                <Trophy className="w-3 h-3 text-purple-500" />
                <span className="text-gray-400">Weekly Seasons</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-cyan-500" />
                <span className="text-gray-400">PP System</span>
              </li>
            </ul>
            <div className="pt-2">
              <a
                href="https://massa.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-xs text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Globe className="w-3 h-3" />
                <span>MASSA NETWORK</span>
              </a>
            </div>
          </div>  
 
          <div className="space-y-4">
            <h4 className="text-orange-400 font-bold tracking-wider text-sm border-b border-orange-500/30 pb-2">
              COMMUNITY
            </h4>
            <div className="space-y-3">
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-8 h-8 border border-gray-600 hover:border-cyan-500 flex items-center justify-center transition-colors group"
                >
                  <Twitter className="w-4 h-4 text-gray-400 group-hover:text-cyan-500" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 border border-gray-600 hover:border-cyan-500 flex items-center justify-center transition-colors group"
                >
                  <Github className="w-4 h-4 text-gray-400 group-hover:text-cyan-500" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 border border-gray-600 hover:border-cyan-500 flex items-center justify-center transition-colors group"
                >
                  <Globe className="w-4 h-4 text-gray-400 group-hover:text-cyan-500" />
                </a>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <a href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</a>
                </p>
                <p>
                  <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
                </p>
                <p>
                  <a href="/docs" className="hover:text-gray-400 transition-colors">Documentation</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>© 2025 MassaFlip</span>
              <span>•</span>
              <span>BUILT ON MASSA NETWORK</span>
              <span>•</span>
              <span>DAILY PREDICTIONS • WEEKLY SEASONS</span>
            </div>

            <div className="flex items-center space-x-4"> 
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                  <span className="text-green-500">LIVE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 animate-pulse"></div>
                  <span className="text-purple-500">MASSA</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-cyan-500 animate-pulse"></div>
                  <span className="text-cyan-500">ASC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retro Scan Lines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
        }}></div>
      </div>
    </footer>
  );
};
