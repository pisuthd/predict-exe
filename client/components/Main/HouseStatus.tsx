import { Shield, Database, Coins } from 'lucide-react';
import { useMarket } from '@/contexts/market';

const HouseStatus = () => {
    const { houseStatus, automationStatus } = useMarket();

    return (
        <div className="bg-black border-2 border-cyan-500/50 transition-all duration-300 hover:border-cyan-500">
            <div className="bg-cyan-500/20 border-b border-cyan-500/50 p-3">
                <div className="flex items-center space-x-2"> 
                    <h3 className="text-cyan-300 font-bold tracking-wider">HOUSE STATUS</h3>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center space-x-1">
                        <Coins className="w-4 h-4" />
                        <span>LIQUIDITY:</span>
                    </span>
                    <span className="text-white font-bold transition-all duration-300">
                        {houseStatus ? `${houseStatus.balance.toFixed(2)} MAS` : '---'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center space-x-1">
                        <Database className="w-4 h-4" />
                        <span>ROUNDS:</span>
                    </span>
                    <span className="text-cyan-500 font-bold transition-all duration-300">
                        {houseStatus?.roundCounter || 0}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">HOUSE EDGE:</span>
                    <span className="text-yellow-500 font-bold">
                        {houseStatus ? `${(houseStatus.houseEdge * 100).toFixed(1)}%` : '5.0%'}
                    </span>
                </div>
                {/* <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">VIRTUAL LIQ:</span>
                    <span className="text-purple-500 font-bold">
                        {houseStatus ? `${houseStatus.virtualLiquidity.toFixed(0)} MAS` : '1000 MAS'}
                    </span>
                </div> */}
                {automationStatus && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-gray-400 text-sm">AUTOMATION:</span>
                        <span className={`font-bold text-xs px-2 py-1 rounded ${
                            automationStatus.enabled 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-red-500/20 text-red-500'
                        }`}>
                            {automationStatus.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HouseStatus;
