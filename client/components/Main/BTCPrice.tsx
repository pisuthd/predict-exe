import { usePrice } from '@/hooks/usePrice';

const BTCPrice = () => {

    const { getFormattedChange, getFormattedPrice } = usePrice({
        symbols: [
            "BTC"
        ]
    })

    return (
        <div className="flex items-center space-x-4">
            <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" className='w-6 h-6 ' alt="btc-icon" />
            <div>
                <span className="text-gray-400 text-sm">BTC/USD:</span>
                <span className="text-white font-bold text-xl ml-2">{getFormattedPrice("BTC")}</span>
                {(() => {
                    const change = getFormattedChange("BTC");
                    return (
                        <span
                            className={`ml-2 text-sm ${change.isPositive ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            {change.isPositive ? "▲" : "▼"} {change.text}
                        </span>
                    );
                })()}
            </div>
        </div>
    )
}

export default BTCPrice