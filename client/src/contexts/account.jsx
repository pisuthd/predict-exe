import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { CONTRACT_ADDRESS } from "./market"
import { Mas, Account, JsonRpcProvider, SmartContract, OperationStatus, Args, bytesToArray, bytesToStr, bytesToSerializableObjectArray } from '@massalabs/massa-web3'


export const AccountContext = createContext({})

const Provider = ({ children }) => {
 
    const [values, dispatch] = useReducer(
        (curVal, newVal) => ({ ...curVal, ...newVal }),
        {
            account: undefined,
            provider: undefined
        }
    )

    const { provider, account } = values
 
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
            placeBet
        }),
        [
            account,
            provider,
            placeBet
        ]
    )

    return (
        <AccountContext.Provider value={accountContext}>
            {children}
        </AccountContext.Provider>
    )
}

export default Provider