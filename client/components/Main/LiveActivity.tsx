import { Radio, Activity } from 'lucide-react';

interface ActivityItem {
    type: 'bet' | 'settlement' | 'claim';
    address: string;
    amount?: number;
    direction?: 'UP' | 'DOWN';
    roundId?: number;
    timestamp: number;
}

interface LiveActivityProps {
    activities: ActivityItem[];
}

const LiveActivity = ({ activities }: LiveActivityProps) => {
    const formatActivityTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return `${seconds}s ago`;
    };

    return (
        <div className="bg-black border-2 border-green-500/50 transition-all duration-300 hover:border-green-500">
            <div className="bg-green-500/20 border-b border-green-500/50 p-3">
                <div className="flex items-center space-x-2">
                    <Radio className="w-5 h-5 text-green-500" />
                    <h3 className="text-green-300 font-bold tracking-wider">LIVE ACTIVITY</h3>
                </div>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {activities.length > 0 ? (
                    activities.slice(0, 8).map((activity, index) => (
                        <div 
                            key={`${activity.type}-${activity.roundId}-${index}`}
                            className="flex items-start space-x-2 text-xs animate-in fade-in slide-in-from-right duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                                activity.type === 'bet' && activity.direction === 'UP' ? 'bg-green-500 animate-pulse' :
                                activity.type === 'bet' && activity.direction === 'DOWN' ? 'bg-red-500 animate-pulse' :
                                activity.type === 'settlement' ? 'bg-cyan-500 animate-pulse' :
                                'bg-yellow-500 animate-pulse'
                            }`}></div>
                            <div className="flex-1">
                                <span className="text-gray-400">
                                    {activity.type === 'bet' && (
                                        <>
                                            <span className="text-cyan-500">{activity.address}</span>
                                            {' bet '}
                                            <span className="text-white font-bold">{activity.amount?.toFixed(1)} MAS</span>
                                            {' on '}
                                            <span className={activity.direction === 'UP' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                                {activity.direction}
                                            </span>
                                        </>
                                    )}
                                    {activity.type === 'settlement' && (
                                        <>
                                            <span className="text-cyan-500">Round #{activity.roundId}</span>
                                            {' settled'}
                                        </>
                                    )}
                                    {activity.type === 'claim' && (
                                        <>
                                            <span className="text-cyan-500">{activity.address}</span>
                                            {' claimed '}
                                            <span className="text-yellow-500 font-bold">{activity.amount?.toFixed(1)} MAS</span>
                                        </>
                                    )}
                                </span>
                                <div className="text-gray-600 text-xs mt-0.5">
                                    {formatActivityTime(activity.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-2 opacity-50" />
                        <p className="text-gray-500 text-sm">No recent activity</p>
                        <p className="text-gray-600 text-xs mt-1">Place the first bet!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveActivity;
export type { ActivityItem };
