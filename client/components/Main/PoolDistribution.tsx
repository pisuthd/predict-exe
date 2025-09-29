interface PoolDistributionProps {
    upPercentage: string;
    downPercentage: string;
    totalUpBets: number;
    totalDownBets: number;
    totalPool: number;
}

const PoolDistribution = ({ upPercentage, downPercentage, totalUpBets, totalDownBets, totalPool }: PoolDistributionProps) => {
    return (
        <div className="bg-black border-2 border-purple-500/50 transition-all duration-300 hover:border-purple-500">
            <div className="bg-purple-500/20 border-b border-purple-500/50 p-3">
                <h3 className="text-purple-300 font-bold tracking-wider">POOL DISTRIBUTION</h3>
            </div>
            <div className="p-4">
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-500 transition-all duration-300">UP: {upPercentage}%</span>
                        <span className="text-red-500 transition-all duration-300">DOWN: {downPercentage}%</span>
                    </div>
                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
                        <div 
                            className="bg-green-500 transition-all duration-500 ease-out"
                            style={{ width: `${upPercentage}%` }}
                        />
                        <div 
                            className="bg-red-500 transition-all duration-500 ease-out"
                            style={{ width: `${downPercentage}%` }}
                        />
                    </div>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">UP Pool:</span>
                        <span className="text-green-500 font-bold transition-all duration-300">{totalUpBets.toFixed(2)} MAS</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">DOWN Pool:</span>
                        <span className="text-red-500 font-bold transition-all duration-300">{totalDownBets.toFixed(2)} MAS</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-700">
                        <span className="text-gray-400">Total Pool:</span>
                        <span className="text-white font-bold transition-all duration-300">{totalPool.toFixed(2)} MAS</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoolDistribution;
