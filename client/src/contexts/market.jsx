
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { Account, JsonRpcProvider, SmartContract, Args, bytesToArray, bytesToStr, bytesToSerializableObjectArray } from '@massalabs/massa-web3'
 

export const MarketContext = createContext({})

const CONTRACT_ADDRESS = "AS122SBruA42oQN7Ucq8QgZ9zx2QuNpdCi7hdf7MyX6ptx4Xc7csW"

const Provider = ({ children }) => {

    const [contract, setContract] = useState(null)
    const [provider, setProvider] = useState(null)

    const [values, dispatch] = useReducer(
        (curVal, newVal) => ({ ...curVal, ...newVal }),
        {
            markets: [],
            activeMarkets: [],
            totalMarkets: 0,
            loading: false,
            error: null
        }
    )

    const { markets } = values

    // Initialize provider and contract
    useEffect(() => {
        const initializeWeb3 = async () => {
            try {
                const provider = JsonRpcProvider.buildnet()
                const contract = new SmartContract(provider, CONTRACT_ADDRESS)

                setProvider(provider)
                setContract(contract)
            } catch (err) {
                console.error('Failed to initialize Web3:', err)
                dispatch({ error: err.message })
            }
        }

        initializeWeb3()
    }, [])

    useEffect(() => {
        contract && loadAllMarkets()
    }, [contract])

    // Get active markets (paginated)
    const getActiveMarkets = useCallback(async (offset = 0, limit = 10) => {
        if (!contract) return []

        try {
            dispatch({ loading: true })

            const args = new Args()
                .addU64(BigInt(offset))
                .addU64(BigInt(limit))

            const result = await contract.read('getActiveMarkets', args)
            const resultArgs = new Args(result.value);

            let marketIds = []

            // Read market IDs (all items except the last one which is count)
            try {
                while (true) {
                    const marketId = resultArgs.nextString()
                    marketIds.push(marketId)
                }
            } catch {
                // End of arguments reached
            }

            marketIds.pop() // exclude count

            dispatch({ activeMarkets: marketIds, loading: false })

            return { marketIds, totalActive: marketIds.length }
        } catch (err) {
            console.error('Error getting active markets:', err)
            dispatch({ error: err.message, loading: false })
            return { marketIds: [], totalActive: 0 }
        }
    }, [contract])

    // Get detailed market information
    const getMarketDetails = useCallback(async (marketId) => {
        if (!contract) return null

        try {
            const args = new Args().addString(marketId)
            const result = await contract.read('getMarketDetails', args)
            const details = new Args(result.value)

            const marketData = {
                id: marketId,
                creator: details.nextString(),
                asset: details.nextString(),
                direction: details.nextBool(), // true = reach, false = drop
                targetPrice: details.nextF64(),
                currentPrice: details.nextF64(),
                expirationTimestamp: details.nextU64(),
                createdTimestamp: details.nextU64(),
                dataSource: details.nextString(),
                yesPool: details.nextU64(),
                noPool: details.nextU64(),
                totalPool: details.nextU64(),
                yesOdds: details.nextF64(),
                noOdds: details.nextF64(),
                resolved: details.nextBool(),
                resolutionResult: details.nextBool(), // true = YES wins
                isExpired: details.nextBool()
            }

            // Add computed properties 
            marketData.expirationDate = new Date(Number(marketData.expirationTimestamp))
            marketData.createdDate = new Date(Number(marketData.createdTimestamp))
            marketData.question = `Will ${marketData.asset} price ${marketData.direction ? "reach" : "drop"} $${marketData.targetPrice} by ${marketData.expirationDate.toUTCString()}?`
            marketData.yesPoolMAS = Number(marketData.yesPool) / 1000000000
            marketData.noPoolMAS = Number(marketData.noPool) / 1000000000
            marketData.totalPoolMAS = Number(marketData.totalPool) / 1000000000

            console.log("marketData 2:", marketData)

            return marketData
        } catch (err) {
            console.error('Error getting market details:', err)
            dispatch({ error: err.message })
            return null
        }
    }, [contract])

    // Load all markets with details
    const loadAllMarkets = useCallback(async () => {
        if (!contract) return

        try {
            dispatch({ loading: true })

            // Get active markets
            const { marketIds } = await getActiveMarkets(0, 50)

            // Get details for each market
            const marketDetails = await Promise.all(
                marketIds.map(id => getMarketDetails(id))
            )

            const validMarkets = marketDetails.filter(Boolean)
            dispatch({ markets: validMarkets, loading: false })

            return validMarkets
        } catch (err) {
            console.error('Error loading all markets:', err)
            dispatch({ error: err.message, loading: false })
            return []
        }
    }, [contract, getActiveMarkets, getMarketDetails])

    const marketContext = useMemo(
        () => ({
            markets,
            loadAllMarkets
        }),
        [
            markets,
            loadAllMarkets
        ]
    )

    return (
        <MarketContext.Provider value={marketContext}>
            {children}
        </MarketContext.Provider>
    )
}

export default Provider