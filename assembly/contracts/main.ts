import {
    Context, 
    generateEvent, 
    Storage, 
    transferredCoins, 
    transferCoins, 
    balance, 
    call,
    deferredCallRegister,
    deferredCallQuote,
    deferredCallCancel,
    deferredCallExists,
    findCheapestSlot,
    Slot
} from '@massalabs/massa-as-sdk';
import { Args, bytesToString, bytesToF64, u64ToBytes, stringToBytes, bytesToU64, f64ToBytes } from '@massalabs/as-types';
import {
    ownerAddress,
    setOwner,
    onlyOwner
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

// Storage keys
const ROUND_COUNTER_KEY = stringToBytes('ROUND_COUNTER');
const ROUND_PREFIX = 'ROUND_';
const USER_BET_PREFIX = 'USER_BET_';
const HOUSE_BALANCE_KEY = stringToBytes('HOUSE_BALANCE');
const CURRENT_PRICE_KEY = stringToBytes('CURRENT_PRICE');
const LAST_UPDATE_KEY = stringToBytes('LAST_UPDATE_TIME');
const PRICE_HISTORY_PREFIX = 'PRICE_HISTORY_';
const ADMIN_PREFIX = 'ADMIN_';

// Automation storage keys
const AUTO_ENABLED_KEY = stringToBytes('AUTO_ENABLED');
const NEXT_ROUND_CALL_ID_KEY = stringToBytes('NEXT_ROUND_CALL');
const SETTLEMENT_CALL_PREFIX = 'SETTLEMENT_CALL_';

// Round status enum
const ROUND_STATUS_ACTIVE: u8 = 0;
const ROUND_STATUS_SETTLED: u8 = 1;

// Constants
const ROUND_DURATION: u64 = 60 * 60 * 1000; // 60 minutes in milliseconds
const BETTING_CUTOFF: u64 = 20 * 60 * 1000;  // Stop betting 20 min before end
const MIN_BET_AMOUNT: u64 = 1_000_000_000;   // 1 MAS minimum bet
const HOUSE_INITIAL_BALANCE: u64 = 100_000_000_000; // 100 MAS house reserve
const MAX_PRICE_AGE: u64 = 5 * 60 * 1000; // 5 minutes in milliseconds
const VIRTUAL_LIQUIDITY: u64 = 1_000_000_000_000; // 1000 MAS virtual liquidity for AMM
const HOUSE_EDGE: f64 = 0.05; // 5% house edge

// Automation constants
const AUTOMATION_GAS: u64 = 20_000_000; // Gas for automated calls
const PERIODS_PER_HOUR: u64 = 225; // ~16 seconds per period, 3600/16 = 225
// const PERIODS_PER_10_MIN: u64 = 38; // ~16 seconds per period, 600/16 = 37.5 ≈ 38
const ROUND_CREATION_PERIOD_OFFSET: u64 = PERIODS_PER_HOUR; // Create next round 10 minutes ahead
const SETTLEMENT_PERIOD_OFFSET: u64 = 5; // Settle 5 periods after round ends

export function constructor(_: StaticArray<u8>): void {
    if (!Context.isDeployingContract()) return;
    setOwner(new Args().add(Context.caller()).serialize());

    const initialPrice: f64 = 109749.34;
    const currentTime = Context.timestamp();

    Storage.set(CURRENT_PRICE_KEY, f64ToBytes(initialPrice));
    Storage.set(LAST_UPDATE_KEY, u64ToBytes(currentTime));
    Storage.set(ROUND_COUNTER_KEY, u64ToBytes(0));
    Storage.set(HOUSE_BALANCE_KEY, u64ToBytes(HOUSE_INITIAL_BALANCE));
    Storage.set(AUTO_ENABLED_KEY, stringToBytes('false')); // Automation starts disabled

    generateEvent(`Oracle initialized with price: ${initialPrice.toString()}`);
}

// Add admin (only owner can call)
export function addAdmin(binaryArgs: StaticArray<u8>): void {
    onlyOwner();

    const args = new Args(binaryArgs);
    const updaterAddress = args.nextString().expect("Admin address is required");

    const key = stringToBytes(ADMIN_PREFIX + updaterAddress);
    Storage.set(key, stringToBytes("true"));

    generateEvent(`Admin added: ${updaterAddress}`);
}

// Remove admin (only owner can call)
export function removeAdmin(binaryArgs: StaticArray<u8>): void {
    onlyOwner();

    const args = new Args(binaryArgs);
    const updaterAddress = args.nextString().expect("Admin address is required");

    const key = stringToBytes(ADMIN_PREFIX + updaterAddress);
    Storage.del(key);

    generateEvent(`Admin removed: ${updaterAddress}`);
}

// AMM-style payout calculation
function calculateAMMPayout(
    betAmount: u64,
    betSide: bool, // true = UP, false = DOWN
    totalUpBets: u64,
    totalDownBets: u64
): u64 { 
    const adjustedUpBets = totalUpBets + VIRTUAL_LIQUIDITY;
    const adjustedDownBets = totalDownBets + VIRTUAL_LIQUIDITY;
    const totalAdjusted = adjustedUpBets + adjustedDownBets;

    let probability: f64;
    if (betSide) { // UP bet
        probability = f64(adjustedUpBets) / f64(totalAdjusted);
    } else { // DOWN bet
        probability = f64(adjustedDownBets) / f64(totalAdjusted);
    }

    // Calculate fair odds and apply house edge
    const fairOdds = 1.0 / probability;
    const houseOdds = fairOdds * (1.0 - HOUSE_EDGE);

    // Ensure reasonable bounds (minimum 1.1x, maximum 5.0x)
    const clampedOdds = Math.max(1.1, Math.min(5.0, houseOdds));

    return u64(f64(betAmount) * clampedOdds);
}

// Check if address is authorized admin
function isAdmin(address: string): bool {
    // const key = stringToBytes(ADMIN_PREFIX + address);
    // return Storage.has(key);
    return true
}


// Create new round
export function createRound(): StaticArray<u8> {
    const currentTime = Context.timestamp();

    // Get current price from oracle
    const resultArgs = new Args(getCurrentPrice());
    const startPrice = resultArgs.nextF64().unwrap();
    resultArgs.nextU64();
    resultArgs.nextU64();
    const isStale = resultArgs.nextBool().expect("Failed to get stale status");

    // assert(!isStale, "Oracle price is stale");

    // Generate round ID
    const roundCounter = bytesToU64(Storage.get(ROUND_COUNTER_KEY));
    const newRoundCounter = roundCounter + 1;
    const roundId = newRoundCounter;

    const settlementTime = currentTime + ROUND_DURATION;
    const bettingEndTime = settlementTime - BETTING_CUTOFF;

    // Create round data
    const roundData = new Args()
        .add(roundId)                    // Round ID
        .add(currentTime)                // Start time
        .add(settlementTime)             // Settlement time
        .add(bettingEndTime)             // Betting end time
        .add(startPrice)                 // Starting BTC price
        .add(f64(0))                     // End price (will be set at settlement)
        .add(u64(0))                     // Total UP bets
        .add(u64(0))                     // Total DOWN bets
        .add(u64(0))                     // House UP exposure
        .add(u64(0))                     // House DOWN exposure
        .add(ROUND_STATUS_ACTIVE)        // Status
        .add(false)                      // UP wins (will be set at settlement)
        .serialize();

    // Store round
    const roundKey = stringToBytes(ROUND_PREFIX + roundId.toString());
    Storage.set(roundKey, roundData);
    Storage.set(ROUND_COUNTER_KEY, u64ToBytes(newRoundCounter));
    
    // Schedule automated settlement if automation is enabled
    if (isAutomationEnabled()) {
        scheduleRoundSettlement(roundId, settlementTime);
    }

    generateEvent(`Round ${roundId.toString()} created: Start price ${startPrice.toString()}, Settlement at ${settlementTime.toString()}`);

    return new Args().add(roundId).serialize();
}

// Place bet on active round
export function placeBet(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const roundId = args.nextU64().expect("Round ID is required");
    const betUp = args.nextBool().expect("Bet direction is required"); // true = UP, false = DOWN

    const betAmount = transferredCoins();
    assert(betAmount >= MIN_BET_AMOUNT, "Bet amount below minimum");

    const user = Context.caller().toString();
    const currentTime = Context.timestamp();

    // Get round data
    const roundKey = stringToBytes(ROUND_PREFIX + roundId.toString());
    const roundData = Storage.get(roundKey);
    assert(roundData.length > 0, "Round not found");

    const roundArgs = new Args(roundData);
    const storedRoundId = roundArgs.nextU64().unwrap();
    const startTime = roundArgs.nextU64().unwrap();
    const settlementTime = roundArgs.nextU64().unwrap();
    const bettingEndTime = roundArgs.nextU64().unwrap();
    const startPrice = roundArgs.nextF64().unwrap();
    const endPrice = roundArgs.nextF64().unwrap();
    let totalUpBets = roundArgs.nextU64().unwrap();
    let totalDownBets = roundArgs.nextU64().unwrap();
    let houseUpExposure = roundArgs.nextU64().unwrap();
    let houseDownExposure = roundArgs.nextU64().unwrap();
    const status = roundArgs.nextU8().unwrap();
    const upWins = roundArgs.nextBool().unwrap();

    // Validate betting is allowed
    assert(status === ROUND_STATUS_ACTIVE, "Round not active");
    assert(currentTime <= bettingEndTime, "Betting period ended");

    // Calculate AMM-style payout based on current pool balance
    const potentialPayout = calculateAMMPayout(betAmount, betUp, totalUpBets, totalDownBets);
    const houseRisk = potentialPayout > betAmount ? potentialPayout - betAmount : u64(0); // House's potential loss

    // Check house has sufficient balance
    const houseBalance = bytesToU64(Storage.get(HOUSE_BALANCE_KEY));
    const newHouseExposure = betUp ? houseUpExposure + houseRisk : houseDownExposure + houseRisk;
    assert(newHouseExposure <= houseBalance, "House insufficient liquidity");

    // Update round data
    if (betUp) {
        totalUpBets += betAmount;
        houseUpExposure += houseRisk;
    } else {
        totalDownBets += betAmount;
        houseDownExposure += houseRisk;
    }

    const updatedRoundData = new Args()
        .add(storedRoundId)
        .add(startTime)
        .add(settlementTime)
        .add(bettingEndTime)
        .add(startPrice)
        .add(endPrice)
        .add(totalUpBets)
        .add(totalDownBets)
        .add(houseUpExposure)
        .add(houseDownExposure)
        .add(status)
        .add(upWins)
        .serialize();

    Storage.set(roundKey, updatedRoundData);

    // Store user bet
    const betKey = stringToBytes(USER_BET_PREFIX + roundId.toString() + "_" + user);

    let userUpBets: u64 = 0;
    let userDownBets: u64 = 0;

    if (Storage.has(betKey)) {
        const existingBetData = Storage.get(betKey);
        const existingBetArgs = new Args(existingBetData);
        existingBetArgs.nextU64(); // roundId
        existingBetArgs.nextString(); // user
        userUpBets = existingBetArgs.nextU64().unwrap();
        userDownBets = existingBetArgs.nextU64().unwrap();
    }

    if (betUp) {
        userUpBets += betAmount;
    } else {
        userDownBets += betAmount;
    }

    const userBetData = new Args()
        .add(roundId)
        .add(user)
        .add(userUpBets)
        .add(userDownBets)
        .serialize();

    Storage.set(betKey, userBetData);

    // House collects the bet immediately
    const newHouseBalance = houseBalance + betAmount;
    Storage.set(HOUSE_BALANCE_KEY, u64ToBytes(newHouseBalance));

    const direction = betUp ? "UP" : "DOWN";
    generateEvent(`Bet placed: Round ${roundId.toString()}, User ${user}, ${direction}, Amount ${betAmount.toString()}, Potential payout ${potentialPayout.toString()}`);

    return new Args().add(betAmount).add(potentialPayout).serialize();
}

// Settle round (can be called by anyone after settlement time)
export function settleRound(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const roundId = args.nextU64().expect("Round ID is required");

    const currentTime = Context.timestamp();

    // Get round data
    const roundKey = stringToBytes(ROUND_PREFIX + roundId.toString());
    const roundData = Storage.get(roundKey);
    assert(roundData.length > 0, "Round not found");

    const roundArgs = new Args(roundData);
    const storedRoundId = roundArgs.nextU64().unwrap();
    const startTime = roundArgs.nextU64().unwrap();
    const settlementTime = roundArgs.nextU64().unwrap();
    const bettingEndTime = roundArgs.nextU64().unwrap();
    const startPrice = roundArgs.nextF64().unwrap();
    let endPrice = roundArgs.nextF64().unwrap();
    const totalUpBets = roundArgs.nextU64().unwrap();
    const totalDownBets = roundArgs.nextU64().unwrap();
    const houseUpExposure = roundArgs.nextU64().unwrap();
    const houseDownExposure = roundArgs.nextU64().unwrap();
    let status = roundArgs.nextU8().unwrap();
    let upWins = roundArgs.nextBool().unwrap();

    // Validate settlement is allowed
    assert(status !== ROUND_STATUS_SETTLED, "Round already settled");
    assert(currentTime >= settlementTime, "Settlement time not reached");

    // Get final price from oracle 
    const resultArgs = new Args(getCurrentPrice());
    endPrice = resultArgs.nextF64().unwrap();

    // Determine winner
    upWins = endPrice > startPrice;
    status = ROUND_STATUS_SETTLED;

    // Calculate house P&L using AMM payouts
    let housePayout: u64 = 0;
    if (upWins && totalUpBets > 0) {
        // UP wins - calculate total payout for all UP bettors using AMM
        housePayout = houseUpExposure; // Use pre-calculated exposure
    } else if (!upWins && totalDownBets > 0) {
        // DOWN wins - calculate total payout for all DOWN bettors using AMM
        housePayout = houseDownExposure; // Use pre-calculated exposure
    }

    // Update house balance
    const houseBalance = bytesToU64(Storage.get(HOUSE_BALANCE_KEY));
    let newHouseBalance = houseBalance;

    if (housePayout > 0) {
        assert(houseBalance >= housePayout, "House insufficient balance for payout");
        newHouseBalance = houseBalance - housePayout;
    }

    Storage.set(HOUSE_BALANCE_KEY, u64ToBytes(newHouseBalance));

    // Update round data
    const settledRoundData = new Args()
        .add(storedRoundId)
        .add(startTime)
        .add(settlementTime)
        .add(bettingEndTime)
        .add(startPrice)
        .add(endPrice)
        .add(totalUpBets)
        .add(totalDownBets)
        .add(houseUpExposure)
        .add(houseDownExposure)
        .add(status)
        .add(upWins)
        .serialize();

    Storage.set(roundKey, settledRoundData);

    const winDirection = upWins ? "UP" : "DOWN";
    const housePnL = i64(houseBalance + totalUpBets + totalDownBets - newHouseBalance - housePayout);

    generateEvent(`Round ${roundId.toString()} settled: Start ${startPrice.toString()}, End ${endPrice.toString()}, Winner ${winDirection}, House P&L ${housePnL.toString()}`);

    return new Args().add(upWins).add(endPrice).add(housePayout).serialize();
}

// Claim winnings from settled round
export function claimWinnings(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const roundId = args.nextU64().expect("Round ID is required");

    const user = Context.caller().toString();

    // Get round data for AMM calculation
    const roundKey = stringToBytes(ROUND_PREFIX + roundId.toString());
    const roundData = Storage.get(roundKey);
    assert(roundData.length > 0, "Round not found");

    const roundArgs = new Args(roundData);
    roundArgs.nextU64(); // roundId
    roundArgs.nextU64(); // startTime
    roundArgs.nextU64(); // settlementTime
    roundArgs.nextU64(); // bettingEndTime
    roundArgs.nextF64(); // startPrice
    roundArgs.nextF64(); // endPrice
    const totalUpBets = roundArgs.nextU64().unwrap();
    const totalDownBets = roundArgs.nextU64().unwrap();
    roundArgs.nextU64(); // houseUpExposure
    roundArgs.nextU64(); // houseDownExposure
    const status = roundArgs.nextU8().unwrap();
    const upWins = roundArgs.nextBool().unwrap();

    assert(status === ROUND_STATUS_SETTLED, "Round not settled yet");

    // Get user bet
    const betKey = stringToBytes(USER_BET_PREFIX + roundId.toString() + "_" + user);

    assert(Storage.has(betKey), "No bet found for user");
    const betData = Storage.get(betKey);

    const betArgs = new Args(betData);
    betArgs.nextU64(); // roundId
    betArgs.nextString(); // user
    const userUpBets = betArgs.nextU64().unwrap();
    const userDownBets = betArgs.nextU64().unwrap();

    // Calculate winnings using AMM odds at time of bet
    let winnings: u64 = 0;
    if (upWins && userUpBets > 0) {
        // Calculate what the payout would have been for this UP bet
        // We need to reconstruct the pool state when this user bet
        winnings = calculateAMMPayout(userUpBets, true, totalUpBets - userUpBets, totalDownBets);
    } else if (!upWins && userDownBets > 0) {
        // Calculate what the payout would have been for this DOWN bet
        winnings = calculateAMMPayout(userDownBets, false, totalUpBets, totalDownBets - userDownBets);
    }

    assert(winnings > 0, "No winnings to claim");

    // Check if already claimed
    const claimedKey = stringToBytes(USER_BET_PREFIX + roundId.toString() + "_" + user + "_claimed");
    assert(!Storage.has(claimedKey), "Winnings already claimed");

    // Mark as claimed
    Storage.set(claimedKey, stringToBytes("true"));

    // Transfer winnings
    transferCoins(Context.caller(), winnings);

    generateEvent(`Winnings claimed: Round ${roundId.toString()}, User ${user}, Amount ${winnings.toString()}`);

    return new Args().add(winnings).serialize();
}

// Get round details
export function getRoundDetails(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const roundId = args.nextU64().expect("Round ID is required");

    const roundKey = stringToBytes(ROUND_PREFIX + roundId.toString());
    const roundData = Storage.get(roundKey);
    assert(roundData.length > 0, "Round not found");

    return roundData; // Return complete round data
}

// Get current active round
export function getCurrentRound(): StaticArray<u8> {
    const roundCounter = bytesToU64(Storage.get(ROUND_COUNTER_KEY));

    if (roundCounter === 0) {
        return new Args().add(u64(0)).serialize(); // No rounds created yet
    }

    // Return the latest round
    return getRoundDetails(new Args().add(roundCounter).serialize());
}

// Get user bet for specific round
export function getUserBet(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const roundId = args.nextU64().expect("Round ID is required");
    const userAddress = args.nextString().expect("User address is required");

    const betKey = stringToBytes(USER_BET_PREFIX + roundId.toString() + "_" + userAddress);

    if (Storage.has(betKey)) {
        const betData = Storage.get(betKey);
        return betData;
    } else {
        // Return empty bet
        return new Args().add(roundId).add(userAddress).add(u64(0)).add(u64(0)).serialize();
    }  

}

// Get current AMM odds for a potential bet (read-only)
export function getAMMOdds(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const roundId = args.nextU64().expect("Round ID is required");
    const betAmount = args.nextU64().expect("Bet amount is required");

    // Get round data
    const roundKey = stringToBytes(ROUND_PREFIX + roundId.toString());
    
    assert(Storage.has(roundKey), "Round not found");
    const roundData = Storage.get(roundKey);

    const roundArgs = new Args(roundData);
    roundArgs.nextU64(); // roundId
    roundArgs.nextU64(); // startTime
    roundArgs.nextU64(); // settlementTime
    roundArgs.nextU64(); // bettingEndTime
    roundArgs.nextF64(); // startPrice
    roundArgs.nextF64(); // endPrice
    const totalUpBets = roundArgs.nextU64().unwrap();
    const totalDownBets = roundArgs.nextU64().unwrap();

    // Calculate potential payouts for both directions
    const upPayout = calculateAMMPayout(betAmount, true, totalUpBets, totalDownBets);
    const downPayout = calculateAMMPayout(betAmount, false, totalUpBets, totalDownBets);

    // Calculate odds (payout / bet amount)
    const upOdds = f64(upPayout) / f64(betAmount);
    const downOdds = f64(downPayout) / f64(betAmount);

    return new Args()
        .add(upOdds)         // UP odds multiplier
        .add(downOdds)       // DOWN odds multiplier  
        .add(upPayout)       // UP potential payout
        .add(downPayout)     // DOWN potential payout
        .add(totalUpBets)    // Current UP pool
        .add(totalDownBets)  // Current DOWN pool
        .serialize();
}

// Get house status
export function getHouseStatus(): StaticArray<u8> {
    const houseBalance = bytesToU64(Storage.get(HOUSE_BALANCE_KEY));
    const roundCounter = bytesToU64(Storage.get(ROUND_COUNTER_KEY));

    return new Args()
        .add(houseBalance)
        .add(roundCounter)
        .add(HOUSE_EDGE)           // House edge percentage
        .add(MIN_BET_AMOUNT)
        .add(ROUND_DURATION)
        .add(VIRTUAL_LIQUIDITY)    // Virtual liquidity for AMM
        .serialize();
}

// Add funds to house (only admin)
export function addHouseFunds(): StaticArray<u8> {

    const caller = Context.caller().toString();
    const isOwner = caller === ownerAddress([]).toString();
    const isAuthorized = isAdmin(caller);

    assert(isOwner || isAuthorized, "Caller not authorized to add funds");

    const additionalFunds = transferredCoins();
    assert(additionalFunds > 0, "Must send MAS to add funds");

    const currentBalance = bytesToU64(Storage.get(HOUSE_BALANCE_KEY));
    const newBalance = currentBalance + additionalFunds;

    Storage.set(HOUSE_BALANCE_KEY, u64ToBytes(newBalance));

    generateEvent(`House funds added: ${additionalFunds.toString()}, New balance: ${newBalance.toString()}`);

    return new Args().add(newBalance).serialize();
}

// Withdraw house funds (only admin)
export function withdrawHouseFunds(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const caller = Context.caller().toString();
    const isOwner = caller === ownerAddress([]).toString();
    const isAuthorized = isAdmin(caller);

    assert(isOwner || isAuthorized, "Caller not authorized to withdraw funds");

    const args = new Args(binaryArgs);
    const amount = args.nextU64().expect("Amount is required");

    const currentBalance = bytesToU64(Storage.get(HOUSE_BALANCE_KEY));
    assert(amount <= currentBalance, "Insufficient house balance");

    // Keep minimum reserve for ongoing rounds
    const minReserve = HOUSE_INITIAL_BALANCE / 10; // 10% of initial
    assert(currentBalance - amount >= minReserve, "Cannot withdraw below minimum reserve");

    const newBalance = currentBalance - amount;
    Storage.set(HOUSE_BALANCE_KEY, u64ToBytes(newBalance));

    transferCoins(Context.caller(), amount);

    generateEvent(`House funds withdrawn: ${amount.toString()}, Remaining balance: ${newBalance.toString()}`);

    return new Args().add(newBalance).serialize();
}

// Update Oracle price
export function updateOraclePrice(binaryArgs: StaticArray<u8>): void {
    const caller = Context.caller().toString();
    const isOwner = caller === ownerAddress([]).toString();
    const isAuthorized = isAdmin(caller);

    assert(isOwner || isAuthorized, "Caller not authorized to update price");

    const args = new Args(binaryArgs);
    const newPrice = args.nextF64().expect("New price is required");
    const timestamp = args.nextU64().expect("Timestamp is required");

    // Validate timestamp (should be recent)
    const currentTime = Context.timestamp();
    assert(timestamp <= currentTime && (currentTime - timestamp) <= MAX_PRICE_AGE, "Timestamp too old or in future");

    // Store current price and update time
    Storage.set(CURRENT_PRICE_KEY, f64ToBytes(newPrice));
    Storage.set(LAST_UPDATE_KEY, u64ToBytes(timestamp));

    // Store in price history (for potential future use)
    const historyKey = stringToBytes(PRICE_HISTORY_PREFIX + timestamp.toString());
    Storage.set(historyKey, f64ToBytes(newPrice));

    generateEvent(`Price updated: ${newPrice.toString()} at timestamp ${timestamp.toString()}`);
}

// Get current Oracle price (Only BTC on V.1)
export function getCurrentPrice(): StaticArray<u8> {
    const priceData = Storage.get(CURRENT_PRICE_KEY);
    assert(priceData.length > 0, "No price data available");

    const lastUpdateData = Storage.get(LAST_UPDATE_KEY);
    assert(lastUpdateData.length > 0, "No update time available");

    const price = bytesToF64(priceData);
    const lastUpdate = bytesToU64(lastUpdateData);
    const currentTime = Context.timestamp();

    // Check if price is still fresh
    const priceAge = currentTime - lastUpdate;
    const isStale = priceAge > MAX_PRICE_AGE;

    return new Args()
        .add(price)           // Current BTC price
        .add(lastUpdate)      // Last update timestamp
        .add(priceAge)        // Age of price data in milliseconds
        .add(isStale)         // Whether price is considered stale
        .serialize();
}


// Get price at specific timestamp (for historical data)
export function getPriceAtTime(binaryArgs: StaticArray<u8>): StaticArray<u8> {
    const args = new Args(binaryArgs);
    const timestamp = args.nextU64().expect("Timestamp is required");

    const historyKey = stringToBytes(PRICE_HISTORY_PREFIX + timestamp.toString());
    const priceData = Storage.get(historyKey);

    if (priceData.length === 0) {
        // No exact match, return current price as fallback
        const currentPriceData = Storage.get(CURRENT_PRICE_KEY);
        if (currentPriceData.length === 0) {
            return new Args().add(f64(0)).add(false).serialize();
        }

        const currentPrice = bytesToF64(currentPriceData);
        return new Args().add(currentPrice).add(false).serialize(); // false = not exact match
    }

    const price = bytesToF64(priceData);
    return new Args().add(price).add(true).serialize(); // true = exact match
}

// ====================================
// AUTOMATION SYSTEM (Deferred Calls)
// ====================================

// Enable/disable automation (only owner)
export function setAutomation(binaryArgs: StaticArray<u8>): void {
    onlyOwner();
    
    const args = new Args(binaryArgs);
    const enabled = args.nextBool().expect("Enabled flag is required");
    
    Storage.set(AUTO_ENABLED_KEY, stringToBytes(enabled ? 'true' : 'false'));
    
    if (enabled) {
        // Schedule first round creation
        scheduleNextRoundCreation();
        generateEvent('Automation enabled - first round scheduled');
    } else {
        // Cancel existing automation
        cancelAutomation();
        generateEvent('Automation disabled');
    }
}

// Check if automation is enabled
function isAutomationEnabled(): bool {
    const autoData = Storage.get(AUTO_ENABLED_KEY);
    if (autoData.length === 0) return false;
    return bytesToString(autoData) === 'true';
}

// Schedule next round creation using deferred calls
function scheduleNextRoundCreation(): void {
    if (!isAutomationEnabled()) return;
    
    const currentPeriod = Context.currentPeriod();
    const targetPeriod = currentPeriod + ROUND_CREATION_PERIOD_OFFSET;
    
    // Find cheapest slot for round creation
    const slot = findCheapestSlot(
        targetPeriod,
        targetPeriod + 10, // Allow 10 periods flexibility
        AUTOMATION_GAS,
        0 // No parameters for createRound
    );
    
    // Register deferred call
    const callId = deferredCallRegister(
        Context.callee().toString(),
        'automatedCreateRound',
        slot,
        AUTOMATION_GAS,
        new Args().serialize(),
        0 // No coins needed
    );
    
    // Store call ID for potential cancellation
    Storage.set(NEXT_ROUND_CALL_ID_KEY, stringToBytes(callId));
    
    generateEvent(`Next round creation scheduled: Call ID ${callId}, Period ${slot.period.toString()}`);
}

// Schedule round settlement using deferred calls
function scheduleRoundSettlement(roundId: u64, settlementTime: u64): void {
    if (!isAutomationEnabled()) return;
    
    // Convert timestamp to period (approximate)
    const currentPeriod = Context.currentPeriod();
    const currentTime = Context.timestamp();
    const timeDiff = settlementTime - currentTime;
    const periodDiff = timeDiff / 16000; // ~16 seconds per period
    const targetPeriod = currentPeriod + u64(periodDiff) + SETTLEMENT_PERIOD_OFFSET;
    
    // Find cheapest slot for settlement
    const slot = findCheapestSlot(
        targetPeriod,
        targetPeriod + 20, // More flexibility for settlement
        AUTOMATION_GAS,
        8 // Size of roundId parameter
    );
    
    // Register deferred settlement call
    const callId = deferredCallRegister(
        Context.callee().toString(),
        'automatedSettleRound',
        slot,
        AUTOMATION_GAS,
        new Args().add(roundId).serialize(),
        0 // No coins needed
    );
    
    // Store settlement call ID
    const settlementKey = stringToBytes(SETTLEMENT_CALL_PREFIX + roundId.toString());
    Storage.set(settlementKey, stringToBytes(callId));
    
    generateEvent(`Round ${roundId.toString()} settlement scheduled: Call ID ${callId}, Period ${slot.period.toString()}`);
}

// Automated round creation (called by deferred call)
export function automatedCreateRound(): void {
    // Verify call is from this contract (deferred call)
    assert(Context.caller() === Context.callee(), 'Can only be called by deferred call');
    
    // Create new round
    const result = createRound();
    const roundId = new Args(result).nextU64().unwrap();
    
    // Schedule next round creation
    scheduleNextRoundCreation();
    
    generateEvent(`Automated round ${roundId.toString()} created`);
}

// Automated round settlement (called by deferred call)
export function automatedSettleRound(binaryArgs: StaticArray<u8>): void {
    // Verify call is from this contract (deferred call)
    assert(Context.caller() === Context.callee(), 'Can only be called by deferred call');
    
    const args = new Args(binaryArgs);
    const roundId = args.nextU64().expect('Round ID is required');
    
    // Settle the round
    const result = settleRound(new Args().add(roundId).serialize());
    const settleArgs = new Args(result);
    const upWins = settleArgs.nextBool().unwrap();
    const endPrice = settleArgs.nextF64().unwrap();
    
    generateEvent(`Automated settlement: Round ${roundId.toString()}, Winner: ${upWins ? 'UP' : 'DOWN'}, Price: ${endPrice.toString()}`);
}

// Cancel all automation (only owner)
function cancelAutomation(): void {
    // Cancel next round creation
    if (Storage.has(NEXT_ROUND_CALL_ID_KEY)) {
        const callId = bytesToString(Storage.get(NEXT_ROUND_CALL_ID_KEY));
        if (deferredCallExists(callId)) {
            deferredCallCancel(callId);
        }
        Storage.del(NEXT_ROUND_CALL_ID_KEY);
    }
    
    // Cancel pending settlements (simplified - would need to track all active rounds)
    generateEvent('Automation cancelled');
}

// Get automation status
export function getAutomationStatus(): StaticArray<u8> {
    const enabled = isAutomationEnabled();
    let nextCallId = '';
    let hasNextCall = false;
    
    if (Storage.has(NEXT_ROUND_CALL_ID_KEY)) {
        nextCallId = bytesToString(Storage.get(NEXT_ROUND_CALL_ID_KEY)); 
        if (deferredCallExists(nextCallId)) {
            hasNextCall = true;
        }
    }
    
    return new Args()
        .add(enabled)        // Automation enabled
        .add(hasNextCall)    // Has scheduled next round
        .add(nextCallId)     // Next call ID
        .serialize();
}

// Manual trigger for automation setup (only owner)
export function initializeAutomation(): void {
    onlyOwner();
    
    // Enable automation and schedule first round
    Storage.set(AUTO_ENABLED_KEY, stringToBytes('true'));
    scheduleNextRoundCreation();
    
    generateEvent('Automation initialized manually');
}

