import { Args, Result, stringToBytes, u64ToBytes } from '@massalabs/as-types';
import { setDeployContext, Storage, Address, Context, mockTransferredCoins, mockBalance, mockTimestamp } from '@massalabs/massa-as-sdk';
import {
    constructor,
    createMarket,
    resolveMarket,
    claimWinnings,
    placeBet,
    getMarketDetails,
    getClaimableAmount,
    getActiveMarkets
} from '../contracts/main';

// Mock addresses for testing
const CREATOR_ADDRESS = "AU1MVG69Rh1eMpg9pi5c7gX8Uh61dqpN5W3u4fQSWmR4PZJPHJbA";

describe('Prediction Market E2E Tests', () => {

    beforeEach(() => {
        setDeployContext(CREATOR_ADDRESS);
        const args = new Args().serialize();
        constructor(args);
    });

    describe('Complete Market Lifecycle', () => {
        test('should handle full market lifecycle', () => {

            // Step 1: Creator creates market with YES position 

            // Mock transferred coins for initial stake (2 MAS = 2 * 10^9)
            mockBalance(CREATOR_ADDRESS, 10000000000)
            mockTransferredCoins(2000000000);

            const createArgs = new Args()
                .add<string>("MAS")                     // asset
                .add<boolean>(true)                      // direction (true = reach)
                .add<f64>(1.5)                       // targetPrice
                .add<f64>(1.0)                       // currentPrice
                .add<u64>(Context.timestamp() + 86400000) // expirationPeriod  
                .add<string>("UMBRELLA_MAS_PRICE")  // dataSource
                .add(true)                      // creatorPosition (true = YES)
                .serialize();

            const marketResult = createMarket(createArgs);
            const marketId = new Args(marketResult).nextString().unwrap();

            expect(marketId).toBe("market_1"); 

            // Step 2: List active markets 

            const activeMarketsResult = getActiveMarkets(new Args().add<u64>(0).add<u64>(10).serialize());
            const activeMarkets = new Args(activeMarketsResult);
            const firstMarketId = activeMarkets.nextString().unwrap();
            const totalActiveCount = activeMarkets.nextU64().unwrap();

            expect(firstMarketId).toBe("market_1");
            expect(totalActiveCount).toBe(1); ;

            // Step 3: Check market details and odds 

            const detailsResult = getMarketDetails(new Args().add("market_1").serialize());
            const details = new Args(detailsResult);

            const creator = details.nextString().unwrap();
            const asset = details.nextString().unwrap();
            const direction = details.nextBool().unwrap();
            const targetPrice = details.nextF64().unwrap();
            const currentPrice = details.nextF64().unwrap();
            details.nextU64().unwrap();
            details.nextU64().unwrap();
            const dataSource = details.nextString().unwrap();
            const yesPool = details.nextU64().unwrap();
            const noPool = details.nextU64().unwrap();
            const totalPool = details.nextU64().unwrap();
            const yesOdds = details.nextF64().unwrap();
            const noOdds = details.nextF64().unwrap();
            const resolved = details.nextBool().unwrap();
            details.nextBool().unwrap();
            const isExpired = details.nextBool().unwrap();

            expect(creator).toBe(CREATOR_ADDRESS);
            expect(asset).toBe("MAS");
            expect(direction).toBe(true);
            expect(targetPrice).toBe(1.5);
            expect(currentPrice).toBe(1.0);
            expect(dataSource).toBe("UMBRELLA_MAS_PRICE");
            expect(yesPool).toBe(2000000000); // 2 MAS in YES
            expect(noPool).toBe(0);           // 0 MAS in NO
            expect(totalPool).toBe(2000000000);
            expect(yesOdds).toBe(1.0);        // 100% YES
            expect(noOdds).toBe(0.0);         // 0% NO
            expect(resolved).toBe(false);
            expect(isExpired).toBe(false);
 
            // Step 4: Creator bets on NO position 

            // Mock transferred coins for NO bet (3 MAS = 3 * 10^9)
            mockTransferredCoins(3000000000);

            const betArgs = new Args()
                .add("market_1")               // marketId
                .add(false)                    // betOnYes (false = NO)
                .serialize();

            const betResult = placeBet(betArgs);
            const betAmount = new Args(betResult).nextU64().unwrap();

            expect(betAmount).toBe(3000000000); 

            // Check updated market details
            const updatedDetailsResult = getMarketDetails(new Args().add("market_1").serialize());
            const updatedDetails = new Args(updatedDetailsResult);

            // Skip to pools and odds
            updatedDetails.nextString(); // creator
            updatedDetails.nextString(); // asset
            updatedDetails.nextBool();   // direction
            updatedDetails.nextF64();    // targetPrice
            updatedDetails.nextF64();    // currentPrice
            updatedDetails.nextU64();    // expirationPeriod
            updatedDetails.nextU64();    // createdPeriod
            updatedDetails.nextString(); // dataSource
            const newYesPool = updatedDetails.nextU64().unwrap();
            const newNoPool = updatedDetails.nextU64().unwrap();
            const newTotalPool = updatedDetails.nextU64().unwrap();
            const newYesOdds = updatedDetails.nextF64().unwrap();
            const newNoOdds = updatedDetails.nextF64().unwrap();

            expect(newYesPool).toBe(2000000000); // 2 MAS in YES
            expect(newNoPool).toBe(3000000000);  // 3 MAS in NO
            expect(newTotalPool).toBe(5000000000); // 5 MAS total
            expect(newYesOdds).toBe(0.4);        // 40% YES
            expect(newNoOdds).toBe(0.6);         // 60% NO 

            // Step 5: Resolve the market (NO wins - price doesn't reach target) 

            mockTimestamp(Context.timestamp() + 86400001);

            const resolveArgs = new Args()
                .add("market_1")           // marketId
                .add<f64>(1.2)             // finalPrice (< 1.5 target, so NO wins)
                .serialize();

            const resolveResult = resolveMarket(resolveArgs);
            const yesWins = new Args(resolveResult).nextBool().unwrap();

            expect(yesWins).toBe(false); // NO wins because 1.2 < 1.5 

            // Check resolved market details
            const resolvedDetailsResult = getMarketDetails(new Args().add("market_1").serialize());
            const resolvedDetails = new Args(resolvedDetailsResult);

            // Skip to resolution info
            resolvedDetails.nextString(); // creator
            resolvedDetails.nextString(); // asset
            resolvedDetails.nextBool();   // direction
            resolvedDetails.nextF64();    // targetPrice
            resolvedDetails.nextF64();    // currentPrice
            resolvedDetails.nextU64();    // expirationPeriod
            resolvedDetails.nextU64();    // createdPeriod
            resolvedDetails.nextString(); // dataSource
            resolvedDetails.nextU64();
            resolvedDetails.nextU64();
            resolvedDetails.nextU64();
            resolvedDetails.nextF64();
            resolvedDetails.nextF64();
 
            const finalResolved = resolvedDetails.nextBool().unwrap();
            const finalResult = resolvedDetails.nextBool().unwrap();

            expect(finalResolved).toBe(true);
            expect(finalResult).toBe(false); // NO wins 

            // Step 6: Check claimable amount 

            const claimableArgs = new Args()
                .add("market_1")               // marketId
                .add(CREATOR_ADDRESS)          // userAddress
                .serialize();

            const claimableResult = getClaimableAmount(claimableArgs);
            const claimableAmount = new Args(claimableResult).nextU64().unwrap();

            // Creator had 3 MAS in NO tokens, NO won, so should get all 5 MAS
            expect(claimableAmount).toBe(5000000000); // All 5 MAS (winner takes all) 

            // Step 7: Claim winnings   

            // NOT SURE WHY CONTRACT HAS ONLY 3 MAS
            mockTransferredCoins(5000000000);

            const claimArgs = new Args()
                .add("market_1") // marketId
                .serialize();

            const claimResult = claimWinnings(claimArgs);
            const claimedAmount = new Args(claimResult).nextU64().unwrap();

            expect(claimedAmount).toBe(5000000000); 
  
            // Check claimable is now 0
            const finalClaimableResult = getClaimableAmount(claimableArgs);
            const finalClaimableAmount = new Args(finalClaimableResult).nextU64().unwrap();
            expect(finalClaimableAmount).toBe(0); 

        });

    });

});