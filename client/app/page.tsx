
import { HeroSection } from "@/components/HeroSection";
import { DeflationaryMechanics } from "@/components/DeflationaryMechanics";
import { HowItWorks } from "@/components/HowItWorks";
import { Trophy, TrendingUp, Users, Zap, Activity, Target, Flame } from 'lucide-react';

// Mock data for dashboard section
const mockStats = {
  totalUsers: 2847,
  activeToday: 342,
  currentFLIPSupply: 850000000, // 850M current supply (150M burned from 1B)
  totalFLIPBurned: 150000000, // 150M burned
  currentRoundFLIP: 45000,
  averageDailyBurn: 5000000, // 5M daily burn
  topPredictors: [
    { address: "0x1234...5678", flip: 2847, rank: 1, change: "up" },
    { address: "0xabcd...ef12", flip: 2156, rank: 2, change: "up" },
    { address: "0x9876...5432", flip: 1923, rank: 3, change: "down" },
    { address: "0x5678...9012", flip: 1654, rank: 4, change: "up" },
    { address: "0xfedc...ba98", flip: 1432, rank: 5, change: "same" },
  ],
  recentActivity: [
    { type: "prediction", user: "0x1234...5678", amount: 50, result: "win", flip: 25, time: "2 min ago" },
    { type: "flip_buy", user: "0xabcd...ef12", amount: 100, result: "buy", flip: 100, time: "5 min ago" },
    { type: "prediction", user: "0x9876...5432", amount: 75, result: "burn", flip: 75, time: "1 hour ago" },
    { type: "prediction", user: "0x5678...9012", amount: 100, result: "win", flip: 50, time: "2 hours ago" },
  ]
};

const DashboardSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-transparent via-black/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-cyan-500 mb-4">MAS Prediction Dashboard</h2>
          <p className="text-gray-400 text-lg">Real-time MAS price predictions and FLIP deflationary stats</p>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-black border-2 border-cyan-500/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-cyan-500" />
              <span className="text-xs text-green-400 font-bold">+12%</span>
            </div>
            <div className="text-3xl font-bold text-cyan-500 mb-2">{mockStats.totalUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Users</div>
          </div>

          <div className="bg-black border-2 border-purple-500/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-purple-500" />
              <span className="text-xs text-green-400 font-bold">+8%</span>
            </div>
            <div className="text-3xl font-bold text-purple-500 mb-2">{mockStats.activeToday}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Active Today</div>
          </div>

          <div className="bg-black border-2 border-orange-500/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-xs text-red-400 font-bold">-15%</span>
            </div>
            <div className="text-3xl font-bold text-orange-500 mb-2">{(mockStats.currentFLIPSupply / 1000000000).toFixed(2)}B</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Current FLIP Supply</div>
          </div>

          <div className="bg-black border-2 border-red-500/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-red-500" />
              <span className="text-xs text-red-400 font-bold">+5M</span>
            </div>
            <div className="text-3xl font-bold text-red-500 mb-2">{(mockStats.totalFLIPBurned / 1000000).toFixed(0)}M</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total FLIP Burned</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Predictors */}
          <div className="bg-black border-2 border-cyan-500/50 p-6">
            <h3 className="text-cyan-400 font-bold text-xl mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Top MAS Predictors Today
            </h3>
            <div className="space-y-4">
              {mockStats.topPredictors.map((predictor) => (
                <div key={predictor.rank} className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-cyan-500/20 rounded-full">
                      <span className="text-cyan-500 font-bold text-sm">#{predictor.rank}</span>
                    </div>
                    <span className="text-gray-300 font-mono text-sm">{predictor.address}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-pink-500 font-bold">{predictor.flip.toLocaleString()} FLIP</span>
                    {predictor.change === 'up' && <span className="text-green-500">↑</span>}
                    {predictor.change === 'down' && <span className="text-red-500">↓</span>}
                    {predictor.change === 'same' && <span className="text-gray-500">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-black border-2 border-purple-500/50 p-6">
            <h3 className="text-purple-400 font-bold text-xl mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-2" />
              Recent Activity & Burns
            </h3>
            <div className="space-y-4">
              {mockStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'prediction' 
                        ? activity.result === 'win' ? 'bg-green-500' : activity.result === 'burn' ? 'bg-red-500' : 'bg-red-500'
                        : 'bg-cyan-500'
                    }`}></div>
                    <span className="text-gray-300 font-mono text-sm">{activity.user}</span>
                    <span className="text-gray-500 text-sm">
                      {activity.type === 'prediction' 
                        ? activity.result === 'burn' 
                          ? 'MAS Prediction (Burn)' 
                          : `MAS Prediction (${activity.result})`
                        : 'FLIP Purchase'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {activity.result === 'burn' ? (
                      <span className="text-red-500 font-bold">-{activity.flip} FLIP 🔥</span>
                    ) : activity.flip > 0 && (
                      <span className="text-pink-500 font-bold">+{activity.flip} FLIP</span>
                    )}
                    <span className="text-gray-500 text-xs">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Round Status */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/30 p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">Current MAS Price Prediction Round</h3>
            <div className="mb-6">
              <p className="text-gray-300 text-lg">Predict tomorrow's MAS token price movement</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-green-500 mb-2">4,250 FLIP</div>
                <div className="text-sm text-gray-400">MAS UP Pool</div>
                <div className="text-xs text-green-400 mt-1">68% of total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500 mb-2">2,000 FLIP</div>
                <div className="text-sm text-gray-400">MAS DOWN Pool</div>
                <div className="text-xs text-red-400 mt-1">32% of total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-500 mb-2">18:45</div>
                <div className="text-sm text-gray-400">Time Remaining</div>
                <div className="text-xs text-purple-400 mt-1">Betting Open</div>
              </div>
            </div>
            <div className="mt-6">
              <button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-black font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105">
                Predict MAS Price
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <DeflationaryMechanics />
      
      <DashboardSection />
    </>
  );
}
