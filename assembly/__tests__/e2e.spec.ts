import { Args, Result, stringToBytes } from '@massalabs/as-types';
import { setDeployContext, Storage, Address } from '@massalabs/massa-as-sdk';
import { constructor, createMarket, getMarket, setMockPriceAdmin, resolveMarket } from '../contracts/main'; 

// Mock addresses for testing
const CREATOR_ADDRESS = "AU1MVG69Rh1eMpg9pi5c7gX8Uh61dqpN5W3u4fQSWmR4PZJPHJbA";

describe('E2E Tests', () => {

  beforeEach(() => {
    setDeployContext(CREATOR_ADDRESS);

    const args = new Args().serialize();
    // init contract
    constructor(args);

  });

  describe('Complete Market Lifecycle', () => {
    test('should handle full market lifecycle from creation to resolution', () => {
      
      // Step 1: Create market
      const targetPrice: f64 = 1.5;
      const hours: u64 = 3;

      const marketResult = createMarket(new Args().add(targetPrice).add(hours).serialize());
      const marketId = new Args(marketResult).nextString().unwrap();

      // Step 2: Verify market was created 
      expect(marketId).toBe("market_1");
      expect(Storage.get("market_counter").toString()).toBe("1");

      // Step 3: Verify market details
      const marketData = getMarket(new Args().add("1").serialize());
      const market = new Args(marketData);

      expect(market.nextString().unwrap()).toBe(CREATOR_ADDRESS); // creator
      expect(market.nextF64().unwrap()).toBe(1.5); // targetPrice
      expect(market.nextF64().unwrap()).toBe(1.0); // referencePrice
      market.nextU64(); // expirationPeriod
      market.nextU64(); // createdPeriod
      expect(market.nextBool().unwrap()).toBe(false); // resolved
      market.nextBool(); // outcome

      // Step 5: Change mock price to trigger YES outcome
      setMockPriceAdmin(new Args().add(2.0).serialize());

      // Step 6: Manually resolve market
      resolveMarket(new Args().add("1").serialize());

      // Step 7: Verify resolution
      const resolvedMarketData = getMarket(new Args().add("1").serialize());
      const resolvedMarket = new Args(resolvedMarketData);

      resolvedMarket.nextString(); // creator
      resolvedMarket.nextF64(); // targetPrice
      expect(resolvedMarket.nextF64().unwrap()).toBe(2); // referencePrice
      resolvedMarket.nextU64(); // expirationPeriod
      resolvedMarket.nextU64(); // createdPeriod
      expect(resolvedMarket.nextBool().unwrap()).toBe(true); // resolved
      expect(resolvedMarket.nextBool().unwrap()).toBe(true); // outcome (YES: 2.0 >= 1.5)

    });

  })

});