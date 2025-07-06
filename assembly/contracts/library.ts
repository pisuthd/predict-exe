import {
    Address,
    Context,
    generateEvent,
    Storage,
    call
} from "@massalabs/massa-as-sdk";
import { Args, Result } from "@massalabs/as-types";
import { IERC20, IFactory, IRouter } from "../interfaces";

// Dusa Protocol Addresses (Buildnet)
export const USDC = new Address("AS12N76WPYB3QNYKGhV2jZuQs1djdhNJLQgnm7m52pHWecvvj1fCQ");
export const WMAS = new Address("AS12FW5Rs5YN2zdpEnqwj4iHUUPt9R4Eqjq2qtpJFNKW3mn33RuLU");
export const FACTORY = new Address("AS125Y3UWiMoEx3w71jf7iq1RwkxXdwkEVdoucBTAmvyzGh2KUqXS");
export const ROUTER = new Address("AS1XqtvX3rz2RWbnqLfaYVKEjM3VS5pny9yKDdXcmJ5C1vrcLEFd");
export const ONE_UNIT = 10 ** 9;



// Storage Keys
export const MOCK_PRICE_KEY = "mock_price";
export const USE_MOCK_PRICE_KEY = "use_mock_price";


export function getWmasPrice(): f64 {

    // Check if we should use mock price
    if (Storage.has(USE_MOCK_PRICE_KEY)) {
        const useMock = Storage.get<string>(USE_MOCK_PRICE_KEY) === "true";
        if (useMock && Storage.has(MOCK_PRICE_KEY)) {
            const mockPrice = parseFloat(Storage.get(MOCK_PRICE_KEY));
            generateEvent(`Using mock price: ${mockPrice}`);
            return mockPrice;
        }
    }

    // Use real Dusa price
    return getRealWmasPrice();
}

function getRealWmasPrice(): f64 {
    const binStep: u64 = 100;
    const router = new IRouter(ROUTER);
    const factory = new IFactory(FACTORY);
    const wmas = new IERC20(WMAS);
    const usdc = new IERC20(USDC);
    const pair = factory.getLBPairInformation(wmas._origin, usdc._origin, binStep).pair;
    const wmas_is_y = pair.getTokenY()._origin == wmas._origin;
    return f64(router.getSwapOut(pair, 1 * ONE_UNIT, !wmas_is_y).amountOut) / f64(ONE_UNIT);
}

export function setMockPrice(price: f64): void {
    Storage.set(MOCK_PRICE_KEY, price.toString());
    generateEvent(`Mock price set to: ${price}`);
}

export function enableMockPrice(enable: bool): void {
    Storage.set(USE_MOCK_PRICE_KEY, enable ? "true" : "false");
    generateEvent(`Mock price ${enable ? "enabled" : "disabled"}`);
}

export function getMockPrice(): f64 {
    if (Storage.has(MOCK_PRICE_KEY)) {
        return parseFloat(Storage.get(MOCK_PRICE_KEY));
    }
    return 1.0;
}

export function isUsingMockPrice(): bool {
    if (Storage.has(USE_MOCK_PRICE_KEY)) {
        return Storage.get<string>(USE_MOCK_PRICE_KEY) === "true";
    }
    return false;
}

// TODO:  Price history utilities for better market resolution

// Market timing utilities
export function isMarketExpired(expirationPeriod: u64): bool {
    return Context.currentPeriod() >= expirationPeriod;
}

export function periodsToHours(periods: u64): f64 {
    // Assuming ~2 periods per minute on average
    return f64(periods) / 120.0;
}

export function hoursToPeriods(hours: f64): u64 {
    // Convert hours to periods (120 periods ≈ 1 hour)
    return u64(hours * 120.0);
}
