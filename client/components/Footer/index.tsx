import React from 'react';
import { Terminal, Github, Twitter, Globe, Zap, Shield, Code } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative z-10 mt-16 border-t-2 border-cyan-500/50 bg-black/90 backdrop-blur-sm font-mono">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> 
          <div className="space-y-4">
            <div className="flex items-center space-x-3"> 
              <div>
                <h3 className="text-xl font-bold text-cyan-500 tracking-wider">PREDICT.EXE</h3> 
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bet on crypto price moves every 10 minutes with rounds settled automatically through Massa ASC
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
              <span className="text-green-500">Live on Buildnet</span>
            </div>
          </div> 
          <div className="space-y-4">
            <h4 className="text-purple-400 font-bold tracking-wider text-sm border-b border-purple-500/30 pb-2">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/trade" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <Terminal className="w-3 h-3" />
                  <span>TRADE</span>
                </a>
              </li>
              <li>
                <a href="/history" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <Code className="w-3 h-3" />
                  <span>HISTORY</span>
                </a>
              </li>
              <li>
                <a href="/stats" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <Zap className="w-3 h-3" />
                  <span>STATISTICS</span>
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-cyan-500 transition-colors flex items-center space-x-2">
                  <Shield className="w-3 h-3" />
                  <span>ABOUT</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div className="space-y-4">
            <h4 className="text-green-400 font-bold tracking-wider text-sm border-b border-green-500/30 pb-2">
              TECHNICAL
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">NETWORK:</span>
                <span className="text-purple-400 font-bold">MASSA</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">VERSION:</span>
                <span className="text-cyan-400">1.0.0</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">UPTIME:</span>
                <span className="text-green-400">99.9%</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">TPS:</span>
                <span className="text-yellow-400">10,000+</span>
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

          {/* Community & Legal */}
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
              <span>© 2025 PREDICT.EXE</span>
              <span>•</span>
              <span>BUILT ON MASSA NETWORK</span>
              <span>•</span>
              <span>DECENTRALIZED PREDICTIONS</span>
            </div>

            {/* <div className="flex items-center space-x-4"> 
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
                  <span className="text-green-500">API</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 animate-pulse"></div>
                  <span className="text-blue-500">ORACLE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 animate-pulse"></div>
                  <span className="text-purple-500">MASSA</span>
                </div>
              </div>
            </div> */}
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
