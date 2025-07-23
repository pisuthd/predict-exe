import {
    Context, generateEvent, Storage, transferredCoins, transferCoins, balance, asyncCall,
    Slot
} from '@massalabs/massa-as-sdk';
import { Args, u64ToBytes, stringToBytes, bytesToU64 } from '@massalabs/as-types';
import {
    ownerAddress,
    setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

// Constants
const ID_COUNTER_KEY = stringToBytes('M');
const ASYNC_CALL_GAS: u64 = 2100_000;
const ASYNC_CALL_FEE: u64 = 1;
const GENESIS_TIMESTAMP: u64 = 1705312800000; // Massa genesis timestamp
const T0: u64 = 16000; // 16 seconds per period in milliseconds

export function constructor(_: StaticArray<u8>): void {
    if (!Context.isDeployingContract()) return;
    setOwner(new Args().add(Context.caller()).serialize());
    Storage.set(ID_COUNTER_KEY, u64ToBytes(0));
}


export function createMarket(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);

    const asset = args.nextString().expect("Asset is required");
    const direction = args.nextBool().expect("Direction is required"); // true = "reach", false = "drop"
    const targetPrice = args.nextF64().expect("Target price is required");
    const currentPrice = args.nextF64().expect("Current price is required");
    const expirationTimestamp = args.nextU64().expect("Expiration period is required");
    const dataSource = args.nextString().expect("Data source is required");
    const creatorPosition = args.nextBool().expect("Creator position is required"); // true = "YES", false = "NO"

    // Get transferred MAS amount
    const creatorStake = transferredCoins();
    assert(creatorStake >= 1000000000, "Minimum stake is 1 MAS"); // 1 MAS = 10^9 smallest units

    // Validation
    const currentTimestamp = Context.timestamp();
    assert(expirationTimestamp > currentTimestamp, "Expiration must be in the future");
    assert(expirationTimestamp <= currentTimestamp + (30 * 24 * 60 * 60 * 1000), "Expiration cannot be more than 1 month from now");

    // Validate direction logic
    if (direction) { // direction === true (reach)
        assert(currentPrice < targetPrice, "For 'reach' prediction, current price must be below target");
    } else { // direction === false (drop)
        assert(currentPrice > targetPrice, "For 'drop' prediction, current price must be above target");
    }

    // Generate market ID
    const marketCounter = bytesToU64(Storage.get(ID_COUNTER_KEY));
    const newMarketCounter = marketCounter + 1;
    const marketId = `market_${newMarketCounter.toString()}`;

    // Create initial position pools
    let yesPool: u64 = 0;
    let noPool: u64 = 0;

    if (creatorPosition) { // creatorPosition === true (YES)
        yesPool = creatorStake;
    } else { // creatorPosition === false (NO)
        noPool = creatorStake;
    }

    // Store market data
    const marketData = new Args();
    marketData.add(Context.caller()); // creator/owner
    marketData.add(asset); // asset name
    marketData.add(direction); // true = "reach", false = "drop"
    marketData.add(targetPrice); // target price
    marketData.add(currentPrice); // reference price at creation
    marketData.add(expirationTimestamp); // when prediction ends
    marketData.add(currentTimestamp); // when market was created
    marketData.add(dataSource); // oracle source identifier
    marketData.add(yesPool); // YES token pool
    marketData.add(noPool); // NO token pool
    marketData.add(false); // resolved flag
    marketData.add(false); // resolution result (true = YES wins, false = NO wins)

    // Store market
    Storage.set(stringToBytes(marketId), marketData.serialize());
    Storage.set(ID_COUNTER_KEY, u64ToBytes(newMarketCounter));

    // Store creator's position
    const positionKey = `${marketId}_${Context.caller().toString()}`;
    const positionData = new Args();
    positionData.add(creatorPosition ? creatorStake : u64(0)); // YES tokens
    positionData.add(creatorPosition ? u64(0) : creatorStake); // NO tokens
    Storage.set(stringToBytes(positionKey), positionData.serialize());

    // Generate event
    const directionStr = direction ? "reach" : "drop";
    const positionStr = creatorPosition ? "YES" : "NO";
    const question = `Will ${asset} price ${directionStr} $${targetPrice.toString()} by timestamp ${expirationTimestamp.toString()}?`;

    generateEvent(`Market created: ${marketId}, question: "${question}", creator: ${Context.caller().toString()}, position: ${positionStr}, stake: ${creatorStake.toString()}, source: ${dataSource}`);

    // Schedule automatic resolution
    const expirationPeriod = timestampToPeriod(expirationTimestamp);
    const currentThread = Context.currentThread();

    // Schedule resolution for 1 period after expiration to ensure market has expired
    const resolutionPeriod = expirationPeriod + 1;
    const startSlot = new Slot(resolutionPeriod, currentThread);
    const endSlot = new Slot(resolutionPeriod + 10, currentThread); // 10 period window for resolution

    // Schedule async resolution
    const asyncArgs = new Args().add(marketId).serialize();
    asyncCall(
        Context.callee(),
        'autoResolveMarket',
        startSlot,
        endSlot,
        ASYNC_CALL_GAS,
        ASYNC_CALL_FEE,
        asyncArgs
    );

    return new Args().add(marketId).serialize();
}

// Function to resolve a market (anyone can call for now)
export function resolveMarket(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().expect("Market ID is required");
    const finalPrice = args.nextF64().expect("Final price is required");

    // Get market data
    const marketData = Storage.get(stringToBytes(marketId));
    assert(marketData.length > 0, "Market not found");

    const marketArgs = new Args(marketData);
    const creator = marketArgs.nextString().unwrap();
    const asset = marketArgs.nextString().unwrap();
    const direction = marketArgs.nextBool().unwrap();
    const targetPrice = marketArgs.nextF64().unwrap();
    const currentPrice = marketArgs.nextF64().unwrap();
    const expirationPeriod = marketArgs.nextU64().unwrap();
    const createdPeriod = marketArgs.nextU64().unwrap();
    const dataSource = marketArgs.nextString().unwrap();
    const yesPool = marketArgs.nextU64().unwrap();
    const noPool = marketArgs.nextU64().unwrap();
    const resolved = marketArgs.nextBool().unwrap();
    // const resolutionResult = marketArgs.nextBool().unwrap();

    // Validation
    assert(!resolved, "Market already resolved");
    assert(Context.timestamp() >= expirationPeriod, "Market has not expired yet");

    // Determine resolution result
    let yesWins: bool = false;
    if (direction) { // reach
        yesWins = finalPrice >= targetPrice;
    } else { // drop
        yesWins = finalPrice <= targetPrice;
    }

    // Update market data with resolution
    const updatedMarketData = new Args();
    updatedMarketData.add(creator);
    updatedMarketData.add(asset);
    updatedMarketData.add(direction);
    updatedMarketData.add(targetPrice);
    updatedMarketData.add(currentPrice);
    updatedMarketData.add(expirationPeriod);
    updatedMarketData.add(createdPeriod);
    updatedMarketData.add(dataSource);
    updatedMarketData.add(yesPool);
    updatedMarketData.add(noPool);
    updatedMarketData.add(true); // resolved = true
    updatedMarketData.add(yesWins); // resolution result

    Storage.set(stringToBytes(marketId), updatedMarketData.serialize());

    // Generate resolution event
    const directionStr = direction ? "reach" : "drop";
    const resultStr = yesWins ? "YES" : "NO";
    generateEvent(`Market resolved: ${marketId}, final price: ${finalPrice.toString()}, target: ${targetPrice.toString()}, direction: ${directionStr}, winner: ${resultStr}`);

    return new Args().add(yesWins).serialize();
}

// Function to get all active markets (paginated)
export function getActiveMarkets(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const offset = args.nextU64().expect("Offset is required");
    const limit = args.nextU64().expect("Limit is required");

    assert(limit <= 50, "Limit cannot exceed 50");

    const totalMarkets = bytesToU64(Storage.get(ID_COUNTER_KEY));
    const currentPeriod = Context.timestamp();

    const activeMarkets = new Args();
    let count: u64 = 0;
    let found: u64 = 0;

    for (let i: u64 = 1; i <= totalMarkets && found < limit; i++) {
        const marketId = `market_${i.toString()}`;
        const marketData = Storage.get(stringToBytes(marketId));

        if (marketData.length > 0) {
            const marketArgs = new Args(marketData);
            marketArgs.nextString(); // creator
            marketArgs.nextString(); // asset
            marketArgs.nextBool(); // direction
            marketArgs.nextF64(); // targetPrice
            marketArgs.nextF64(); // currentPrice
            const expirationPeriod = marketArgs.nextU64().unwrap();
            marketArgs.nextU64(); // createdPeriod
            marketArgs.nextString(); // dataSource
            marketArgs.nextU64(); // yesPool
            marketArgs.nextU64(); // noPool
            const resolved = marketArgs.nextBool().unwrap();

            // Check if market is active (not resolved and not expired)
            if (!resolved && expirationPeriod > currentPeriod) {
                if (count >= offset) {
                    activeMarkets.add(marketId);
                    found++;
                }
                count++;
            }
        }
    }

    return activeMarkets.add(count).serialize(); // Include total count
}

// Function to get market details with pools and odds
export function getMarketDetails(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().expect("Market ID is required");

    // Get market data
    const marketData = Storage.get(stringToBytes(marketId));
    assert(marketData.length > 0, "Market not found");

    const marketArgs = new Args(marketData);
    const creator = marketArgs.nextString().unwrap();
    const asset = marketArgs.nextString().unwrap();
    const direction = marketArgs.nextBool().unwrap();
    const targetPrice = marketArgs.nextF64().unwrap();
    const currentPrice = marketArgs.nextF64().unwrap();
    const expirationPeriod = marketArgs.nextU64().unwrap();
    const createdPeriod = marketArgs.nextU64().unwrap();
    const dataSource = marketArgs.nextString().unwrap();
    const yesPool = marketArgs.nextU64().unwrap();
    const noPool = marketArgs.nextU64().unwrap();
    const resolved = marketArgs.nextBool().unwrap();
    const resolutionResult = marketArgs.nextBool().unwrap();

    const totalPool = yesPool + noPool;
    const currentPeriod = Context.timestamp();
    const isExpired = currentPeriod >= expirationPeriod;

    // Calculate odds
    let yesOdds: f64 = 0.5;
    let noOdds: f64 = 0.5;

    if (totalPool > 0) {
        yesOdds = f64(yesPool) / f64(totalPool);
        noOdds = f64(noPool) / f64(totalPool);
    }

    // Return comprehensive market info
    return new Args()
        .add(creator)
        .add(asset)
        .add(direction)
        .add(targetPrice)
        .add(currentPrice)
        .add(expirationPeriod)
        .add(createdPeriod)
        .add(dataSource)
        .add(yesPool)
        .add(noPool)
        .add(totalPool)
        .add(yesOdds)
        .add(noOdds)
        .add(resolved)
        .add(resolutionResult)
        .add(isExpired)
        .serialize();
}

// Helper function to get user position
export function getUserPosition(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().expect("Market ID is required");
    const userAddress = args.nextString().expect("User address is required");

    const positionKey = `${marketId}_${userAddress}`;
    const positionData = Storage.get(stringToBytes(positionKey));

    if (positionData.length === 0) {
        // Return empty position
        return new Args().add(u64(0)).add(u64(0)).serialize();
    }

    return positionData;
}


// Function for users to bet on existing markets
export function placeBet(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().expect("Market ID is required");
    const betOnYes = args.nextBool().expect("Bet position is required"); // true = YES, false = NO

    // Get transferred MAS amount
    const betAmount = transferredCoins();
    assert(betAmount > 0, "Must send MAS to place bet");

    // Get market data
    const marketData = Storage.get(stringToBytes(marketId));
    assert(marketData.length > 0, "Market not found");

    const marketArgs = new Args(marketData);
    const creator = marketArgs.nextString().unwrap();
    const asset = marketArgs.nextString().unwrap();
    const direction = marketArgs.nextBool().unwrap();
    const targetPrice = marketArgs.nextF64().unwrap();
    const currentPrice = marketArgs.nextF64().unwrap();
    const expirationPeriod = marketArgs.nextU64().unwrap();
    const createdPeriod = marketArgs.nextU64().unwrap();
    const dataSource = marketArgs.nextString().unwrap();
    let yesPool = marketArgs.nextU64().unwrap();
    let noPool = marketArgs.nextU64().unwrap();
    const resolved = marketArgs.nextBool().unwrap();
    const resolutionResult = marketArgs.nextBool().unwrap();

    // Validation
    assert(!resolved, "Market already resolved");
    assert(Context.timestamp() < expirationPeriod, "Market has expired");

    // Update pools
    if (betOnYes) {
        yesPool += betAmount;
    } else {
        noPool += betAmount;
    }

    // Update market data
    const updatedMarketData = new Args();
    updatedMarketData.add(creator);
    updatedMarketData.add(asset);
    updatedMarketData.add(direction);
    updatedMarketData.add(targetPrice);
    updatedMarketData.add(currentPrice);
    updatedMarketData.add(expirationPeriod);
    updatedMarketData.add(createdPeriod);
    updatedMarketData.add(dataSource);
    updatedMarketData.add(yesPool);
    updatedMarketData.add(noPool);
    updatedMarketData.add(resolved);
    updatedMarketData.add(resolutionResult);

    Storage.set(stringToBytes(marketId), updatedMarketData.serialize());

    // Update user's position
    const positionKey = `${marketId}_${Context.caller().toString()}`;
    const existingPosition = Storage.get(stringToBytes(positionKey));

    let userYesTokens: u64 = 0;
    let userNoTokens: u64 = 0;

    if (existingPosition.length > 0) {
        const positionArgs = new Args(existingPosition);
        userYesTokens = positionArgs.nextU64().unwrap();
        userNoTokens = positionArgs.nextU64().unwrap();
    }

    // Add new bet to existing position
    if (betOnYes) {
        userYesTokens += betAmount;
    } else {
        userNoTokens += betAmount;
    }

    // Store updated position
    const positionData = new Args();
    positionData.add(userYesTokens);
    positionData.add(userNoTokens);
    Storage.set(stringToBytes(positionKey), positionData.serialize());

    // Generate event
    const positionStr = betOnYes ? "YES" : "NO";
    generateEvent(`Bet placed: ${marketId}, user: ${Context.caller().toString()}, position: ${positionStr}, amount: ${betAmount.toString()}, new pools: YES=${yesPool.toString()}, NO=${noPool.toString()}`);

    return new Args().add(betAmount).serialize();
}

// Function to get user's positions across all markets
export function getUserPositions(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const userAddress = args.nextString().expect("User address is required");
    const offset = args.nextU64().expect("Offset is required");
    const limit = args.nextU64().expect("Limit is required");

    assert(limit <= 20, "Limit cannot exceed 20");

    const totalMarkets = bytesToU64(Storage.get(ID_COUNTER_KEY));
    const positions = new Args();
    let found: u64 = 0;
    let count: u64 = 0;

    for (let i: u64 = 1; i <= totalMarkets && found < limit; i++) {
        const marketId = `market_${i.toString()}`;
        const positionKey = `${marketId}_${userAddress}`;
        const positionData = Storage.get(stringToBytes(positionKey));

        if (positionData.length > 0) {
            const positionArgs = new Args(positionData);
            const userYesTokens = positionArgs.nextU64().unwrap();
            const userNoTokens = positionArgs.nextU64().unwrap();

            // Only include if user has tokens
            if (userYesTokens > 0 || userNoTokens > 0) {
                if (count >= offset) {
                    positions.add(marketId);
                    positions.add(userYesTokens);
                    positions.add(userNoTokens);
                    found++;
                }
                count++;
            }
        }
    }

    return positions.add(count).serialize();
}

// Helper function to get claimable amount for a user
export function getClaimableAmount(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().expect("Market ID is required");
    const userAddress = args.nextString().expect("User address is required");

    // Get market data
    const marketData = Storage.get(stringToBytes(marketId));
    if (marketData.length === 0) {
        return new Args().add(u64(0)).serialize();
    }

    const marketArgs = new Args(marketData);
    marketArgs.nextString(); // creator
    marketArgs.nextString(); // asset
    marketArgs.nextBool(); // direction
    marketArgs.nextF64(); // targetPrice
    marketArgs.nextF64(); // currentPrice
    marketArgs.nextU64(); // expirationPeriod
    marketArgs.nextU64(); // createdPeriod
    marketArgs.nextString(); // dataSource
    const yesPool = marketArgs.nextU64().unwrap();
    const noPool = marketArgs.nextU64().unwrap();
    const resolved = marketArgs.nextBool().unwrap();
    const yesWins = marketArgs.nextBool().unwrap();

    if (!resolved) {
        return new Args().add(u64(0)).serialize();
    }

    // Check if already claimed
    const claimedKey = `${marketId}_${userAddress}_claimed`;
    if (Storage.has(stringToBytes(claimedKey))) {
        return new Args().add(u64(0)).serialize();
    }

    // Get user's position
    const positionKey = `${marketId}_${userAddress}`;
    const positionData = Storage.get(stringToBytes(positionKey));
    if (positionData.length === 0) {
        return new Args().add(u64(0)).serialize();
    }

    const positionArgs = new Args(positionData);
    const userYesTokens = positionArgs.nextU64().unwrap();
    const userNoTokens = positionArgs.nextU64().unwrap();

    // Calculate potential winnings
    let winnings: u64 = 0;
    const totalPool = yesPool + noPool;

    if (yesWins && userYesTokens > 0 && yesPool > 0) {
        winnings = (userYesTokens * totalPool) / yesPool;
    } else if (!yesWins && userNoTokens > 0 && noPool > 0) {
        winnings = (userNoTokens * totalPool) / noPool;
    }

    return new Args().add(winnings).serialize();
}

// Function to claim winnings from a resolved market
export function claimWinnings(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().expect("Market ID is required");

    // Get market data
    const marketData = Storage.get(stringToBytes(marketId));
    assert(marketData.length > 0, "Market not found");

    const marketArgs = new Args(marketData);
    marketArgs.nextString();
    marketArgs.nextString();
    marketArgs.nextBool();
    marketArgs.nextF64();
    marketArgs.nextF64();
    marketArgs.nextU64();
    marketArgs.nextU64();
    marketArgs.nextString();
    const yesPool = marketArgs.nextU64().unwrap();
    const noPool = marketArgs.nextU64().unwrap();
    const resolved = marketArgs.nextBool().unwrap();
    const yesWins = marketArgs.nextBool().unwrap();

    // Validation
    assert(resolved, "Market not resolved yet");

    // Get user's position
    const positionKey = `${marketId}_${Context.caller().toString()}`;
    const positionData = Storage.get(stringToBytes(positionKey));
    assert(positionData.length > 0, "No position found for this user");

    const positionArgs = new Args(positionData);
    const userYesTokens = positionArgs.nextU64().unwrap();
    const userNoTokens = positionArgs.nextU64().unwrap();

    // Calculate winnings
    let winnings: u64 = 0;
    const totalPool = yesPool + noPool;

    if (yesWins) {
        // YES wins - calculate share based on YES tokens
        if (userYesTokens > 0 && yesPool > 0) {
            winnings = (userYesTokens * totalPool) / yesPool;
        }
    } else {
        // NO wins - calculate share based on NO tokens
        if (userNoTokens > 0 && noPool > 0) {
            winnings = (userNoTokens * totalPool) / noPool;
        }
    }

    assert(winnings > 0, "No winnings to claim");

    // Check if already claimed (mark position as claimed)
    const claimedKey = `${marketId}_${Context.caller().toString()}_claimed`;
    assert(!Storage.has(stringToBytes(claimedKey)), "Winnings already claimed");

    // Mark as claimed
    Storage.set(stringToBytes(claimedKey), stringToBytes("true"));

    // Transfer winnings
    transferCoins(Context.caller(), winnings);

    generateEvent(`Winnings claimed: ${marketId}, user: ${Context.caller().toString()}, amount: ${winnings.toString()}`);

    return new Args().add(winnings).serialize();
}

export function autoResolveMarket(binaryArgs: StaticArray<u8>): void {
    const args = new Args(binaryArgs);
    const marketId = args.nextString().expect("Market ID is required");

    // Get market data
    const marketData = Storage.get(stringToBytes(marketId));
    if (marketData.length === 0) {
        generateEvent(`Auto-resolution failed: Market ${marketId} not found`);
        return;
    }

    const marketArgs = new Args(marketData);
    marketArgs.nextString(); // creator
    marketArgs.nextString(); // asset
    marketArgs.nextBool();
    marketArgs.nextF64();
    marketArgs.nextF64(); // currentPrice
    const expirationTimestamp = marketArgs.nextU64().unwrap();
    marketArgs.nextU64(); // createdTimestamp
    const dataSource = marketArgs.nextString().unwrap();
    marketArgs.nextU64(); // yesPool
    marketArgs.nextU64(); // noPool
    const resolved = marketArgs.nextBool().unwrap();

    // Check if already resolved
    if (resolved) {
        generateEvent(`Market ${marketId} already resolved`);
        return;
    }

    // Check if market has actually expired
    const currentTimestamp = Context.timestamp();
    if (currentTimestamp < expirationTimestamp) {
        generateEvent(`Market ${marketId} has not expired yet`);
        return;
    }

    // Get price from oracle/data source
    // For now, we'll use a mock price
    const finalPrice = getMockPrice(dataSource);

    // Resolve the market
    const resolveArgs = new Args()
        .add(marketId)
        .add(finalPrice)
        .serialize();

    resolveMarket(resolveArgs);

    generateEvent(`Market ${marketId} auto-resolved with price ${finalPrice.toString()}`);
}

// TODO: will be use Oracle
function getMockPrice(dataSource: string): f64 {
    // For testing, return a mock price based on data source
    if (dataSource === "UMBRELLA_MAS_PRICE") return 0.1;
    if (dataSource === "UMBRELLA_BTC_PRICE") return 100000.0;
    if (dataSource === "UMBRELLA_ETH_PRICE") return 3000.0;
    if (dataSource === "DUSA_MAS_USDC") return 0.15;
    return 1.0; // default
}

// Helper function to convert timestamp to period
function timestampToPeriod(timestamp: u64): u64 {
    return (timestamp - GENESIS_TIMESTAMP) / T0;
}

// Helper function to convert period to timestamp
// function periodToTimestamp(period: u64): u64 {
//     return GENESIS_TIMESTAMP + (period * T0);
// }

