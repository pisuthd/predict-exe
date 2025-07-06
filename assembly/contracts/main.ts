import {
  Context,
  generateEvent,
  Storage,
  Address
} from '@massalabs/massa-as-sdk';
import { Args, Result, stringToBytes } from '@massalabs/as-types';
import {
  getWmasPrice,
  setMockPrice,
  enableMockPrice,
  hoursToPeriods
} from './library';

// Constants 
const MAX_PREDICTION_HOURS: u64 = 24 * 30; // 30 days in hours
const MIN_PREDICTION_HOURS: u64 = 1; // 1 hour minimum


// Storage Keys
const ACTIVE_MARKETS_COUNT_KEY = "active_markets_count_pre01";
const MARKET_COUNTER_KEY = "market_counter_pre01";
const MONITOR_ACTIVE_KEY = "monitor_active_pre01";


export function constructor(binaryArgs: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  Storage.set(ACTIVE_MARKETS_COUNT_KEY, "0");
  Storage.set(MARKET_COUNTER_KEY, "0");
  Storage.set(MONITOR_ACTIVE_KEY, "false");

  enableMockPrice(false);
  setMockPrice(1.0);

  generateEvent("PredictionMarket contract deployed");
}


export function createMarket(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const targetPrice = args.nextF64().expect("Target price is required");
  const hoursToExpiration = args.nextU64().expect("Hours to expiration is required");

  // Validation
  assert(hoursToExpiration >= MIN_PREDICTION_HOURS && hoursToExpiration <= MAX_PREDICTION_HOURS,
    "Expiration must be between 1 hour and 30 days");

  // Calculate expiration
  const currentPeriod = Context.currentPeriod();
  const periodsToAdd = hoursToPeriods(f64(hoursToExpiration));
  const expirationPeriod = currentPeriod + periodsToAdd;

  // Get current price as reference
  const currentPrice = getWmasPrice();

  // Generate market ID
  const marketCounter = u64(parseInt(Storage.get(MARKET_COUNTER_KEY)));
  const newMarketCounter = marketCounter + 1;

  const marketData = new Args();
  marketData.add(Context.caller()); // owner
  marketData.add(targetPrice); // target price
  marketData.add(currentPrice); // current price
  marketData.add(expirationPeriod);
  marketData.add(currentPeriod);
  marketData.add(false); // resolved
  marketData.add(false); // true = YES (price >= target), false = NO (price < target)

  // Create market
  Storage.set(stringToBytes(`market_${newMarketCounter.toString()}`), marketData.serialize());
  Storage.set(MARKET_COUNTER_KEY, newMarketCounter.toString());

  generateEvent(`Market created: market_${newMarketCounter}, target: ${targetPrice}, reference: ${currentPrice}, expires: ${expirationPeriod}, hours: ${hoursToExpiration}`);

  return new Args().add(`market_${newMarketCounter.toString()}`).serialize();
}

// TODO: allows only admin should change this
export function toggleMockPrice(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const enable = args.nextBool().expect("Enable flag is required");

  enableMockPrice(enable);
}

// View functions
export function getMarket(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect("Market ID is required");

  if (!Storage.has(stringToBytes(`market_${marketId}`))) {
    return new Args().add("").serialize();
  }

  return Storage.get(stringToBytes(`market_${marketId}`));
}

// TODO: allows only admin should change this
export function resolveMarket(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const marketId = args.nextString().expect("Market ID is required");

  assert(Storage.has(stringToBytes(`market_${marketId}`)), "Invalid Market ID");

  // Get current price for resolution
  const currentPrice = getWmasPrice();

  const market_key = Storage.get(stringToBytes(`market_${marketId}`));
  const market_data = new Args(market_key);

  const _owner = market_data.nextString().unwrap();
  const targetPrice =  market_data.nextF64().unwrap();
  const _oldCurrentPrice =  market_data.nextF64().unwrap();
  const expirationPeriod = market_data.nextU64().unwrap();
  const currentPeriod = market_data.nextU64().unwrap();

  const marketData = new Args();
  marketData.add(Context.caller()); // owner
  marketData.add(targetPrice); // target price
  marketData.add(currentPrice); // current price
  marketData.add(expirationPeriod);
  marketData.add(currentPeriod);
  marketData.add(true); // resolved
  marketData.add(false); // true = YES (price >= target), false = NO (price < target)

  const outcome = currentPrice >= targetPrice;

  marketData.add(false); // resolved
  marketData.add(outcome); // true = YES (price >= target), false = NO (price < target)

  // Update storage
  Storage.set(stringToBytes(`market_${marketId}`), marketData.serialize());

  generateEvent(`Market ${marketId} resolved: current=${currentPrice}, target=${targetPrice}, outcome=${outcome ? "YES" : "NO"}`);
}

export function getCurrentPrice(_: StaticArray<u8>): StaticArray<u8> {
  const price = getWmasPrice();
  return new Args().add(price).serialize();
}
