import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { CONTRACT_ADDRESS } from "./market"
import { Mas, Account, JsonRpcProvider, SmartContract, OperationStatus, Args, bytesToArray, bytesToStr, bytesToSerializableObjectArray } from '@massalabs/massa-web3'


export const AccountContext = createContext({})

const Provider = ({ children }) => {

    const [values, dispatch] = useReducer(
        (curVal, newVal) => ({ ...curVal, ...newVal }),
        {
            account: undefined,
            provider: undefined,
        }
    )

    const { provider, account, tick } = values

    const disconnect = () => {
        dispatch({
            account: undefined
        })
    }

    const connect = (account) => {
        dispatch({
            account
        })
    }

    const getUserPositions = useCallback(async (account) => {

        const contract = new SmartContract(account, CONTRACT_ADDRESS)

        const args = new Args()
            .addString(account.address)
            .addU64(BigInt(0))
            .addU64(BigInt(10))

        const result = await contract.read('getUserPositions', args)
        const resultArgs = new Args(result.value);

        let positions = []

        try {
            while (true) {
                const marketId = resultArgs.nextString()
                const totalYes = resultArgs.nextU64()
                const totalNo = resultArgs.nextU64()
                positions.push({
                    marketId,
                    totalYes: Number(totalYes) / 1000000000,
                    totalNo: Number(totalNo) / 1000000000
                })
            }
        } catch {
            // End of arguments reached
        }

        return positions

    }, [])

    const getUserPosition = useCallback(async (marketId, account) => {

        const contract = new SmartContract(account, CONTRACT_ADDRESS)

        const args = new Args()
            .addString(marketId)
            .addString(account.address)

        const result = await contract.read('getUserPosition', args)
        const resultArgs = new Args(result.value);

        let position = {
            totalYes: 0,
            totalNo: 0
        }

        try {
            while (true) {
                const totalYes = resultArgs.nextU64()
                const totalNo = resultArgs.nextU64()
                position.totalYes = Number(totalYes) / 1000000000
                position.totalNo = Number(totalNo) / 1000000000
            }
        } catch {
            // End of arguments reached
        }

        return position

    }, [])

    const placeBet = useCallback(async (marketId, isYes, amount) => {

        if (!account) {
            throw new Error("Wallet not connected")
        }

        const betArgs = new Args()
            .addString(marketId)
            .addBool(isYes)

        const contract = new SmartContract(account, CONTRACT_ADDRESS)

        const operation = await contract.call(
            'placeBet',
            betArgs,
            { coins: Mas.fromString(amount) }
        );

        console.log(
            'createMarket function called successfully, operation id:',
            operation.id,
        );

        console.log('Waiting for operation to be finalized...');
        const status = await operation.waitFinalExecution();
        console.log('Operation status:', OperationStatus[status]);

        if (status !== OperationStatus.Success) {
            throw new Error("Operation failed")
        }

    }, [provider, account])

    const createMarket = useCallback(async (marketData) => {

        if (!account) {
            throw new Error("Wallet not connected");
        }
    
        if (!provider) {
            throw new Error("Provider not available");
        }
    
        console.log('Creating new prediction market...', marketData);
    
        // Destructure market data
        const {
            asset,
            direction, // 'reach' or 'drop'
            targetPrice,
            currentPrice,
            deadline, // ISO string from datetime-local input
            dataSource,
            creatorPosition, // 'YES' or 'NO'
            creatorStake // number in MAS
        } = marketData;
    
        // Convert direction string to boolean
        const directionBool = direction === 'reach';
    
        // Convert deadline to timestamp
        const expirationTimestamp = new Date(deadline).getTime();
    
        // Convert creator position to boolean
        const creatorPositionBool = creatorPosition === 'YES';
    
        console.log(`Market Details:
    - Asset: ${asset}
    - Direction: ${direction} (${directionBool})
    - Current Price: $${currentPrice || 'Not specified'}
    - Target Price: $${targetPrice}
    - Expiration: ${new Date(expirationTimestamp).toISOString()}
    - Data Source: ${dataSource}
    - Creator Position: ${creatorPosition} (${creatorPositionBool})
    - Creator Stake: ${creatorStake} MAS
        `);
    
        // Validate required fields
        if (!asset || !targetPrice || !deadline || !dataSource || !creatorPosition || !creatorStake) {
            throw new Error("Missing required market parameters");
        }
    
        if (creatorStake < 1) {
            throw new Error("Minimum stake is 1 MAS");
        }
    
        // Create market arguments
        const createMarketArgs = new Args()
            .addString(asset)
            .addBool(directionBool)
            .addF64(parseFloat(targetPrice))
            .addF64(currentPrice ? parseFloat(currentPrice) : 0.0) // Default to 0 if not provided
            .addU64(BigInt(expirationTimestamp))
            .addString(dataSource)
            .addBool(creatorPositionBool)
            .serialize();
    
        const contract = new SmartContract(account, CONTRACT_ADDRESS);
    
        // Call createMarket with stake amount
        const operation = await contract.call(
            'createMarket',
            createMarketArgs,
            { coins: Mas.fromString(creatorStake.toString()) }
        );
    
        console.log(
            'createMarket function called successfully, operation id:',
            operation.id,
        );
    
        console.log('Waiting for operation to be finalized...');
        const status = await operation.waitFinalExecution();
        console.log('Operation status:', OperationStatus[status]);
    
        if (status !== OperationStatus.Success) {
            throw new Error('Market creation failed');
        }

    }, [account, provider]);

    const accountContext = useMemo(
        () => ({
            account,
            connect,
            disconnect,
            provider,
            setProvider: (provider) => {
                dispatch({
                    provider
                })
            },
            placeBet,
            getUserPositions,
            getUserPosition,
            createMarket
        }),
        [
            account,
            provider,
            placeBet,
            getUserPositions,
            createMarket
        ]
    )

    return (
        <AccountContext.Provider value={accountContext}>
            {children}
        </AccountContext.Provider>
    )
}

export default Provider