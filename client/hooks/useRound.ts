import { useState, useEffect, useCallback } from 'react';
import { SmartContract, Args } from '@massalabs/massa-web3';

// Round status enum matching the contract
export const ROUND_STATUS = {
  ACTIVE: 0,
  SETTLED: 2,
} as const;

export interface RoundData {
  roundId: number;
  startTime: number;
  settlementTime: number;
  bettingEndTime: number;
  startPrice: number;
  endPrice: number;
  totalUpBets: number;
  totalDownBets: number;
  houseUpExposure: number;
  houseDownExposure: number;
  status: number;
  upWins: boolean;
  // Computed properties
  isActive: boolean;
  isSettled: boolean;
  timeRemaining: number;
  bettingTimeRemaining: number;
  totalPool: number;
}

export interface UserBet {
  roundId: number;
  userAddress: string;
  upBets: number;
  downBets: number;
  totalBet: number;
}

export interface AMMOdds {
  upOdds: number;
  downOdds: number;
  upPayout: number;
  downPayout: number;
  totalUpPool: number;
  totalDownPool: number;
}

export const useRound = (contractAddress: string, provider: any) => {
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [roundHistory, setRoundHistory] = useState<RoundData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to parse round data from Args
  const parseRoundData = useCallback((roundArgs: Args, currentTime: number): RoundData => {
    const roundId = Number(roundArgs.nextU64());
    const startTime = Number(roundArgs.nextU64());
    const settlementTime = Number(roundArgs.nextU64());
    const bettingEndTime = Number(roundArgs.nextU64());
    const startPrice = roundArgs.nextF64();
    const endPrice = roundArgs.nextF64();
    const totalUpBets = Number(roundArgs.nextU64());
    const totalDownBets = Number(roundArgs.nextU64());
    const houseUpExposure = Number(roundArgs.nextU64());
    const houseDownExposure = Number(roundArgs.nextU64());
    const status = roundArgs.nextU8();
    const upWins = roundArgs.nextBool();

    const isActive = Number(status) === ROUND_STATUS.ACTIVE;
    const isSettled = Number(status) === ROUND_STATUS.SETTLED;
    const timeRemaining = Math.max(0, settlementTime - currentTime);
    const bettingTimeRemaining = Math.max(0, bettingEndTime - currentTime);
    const totalPool = totalUpBets + totalDownBets;

    return {
      roundId,
      startTime,
      settlementTime,
      bettingEndTime,
      startPrice,
      endPrice,
      totalUpBets: totalUpBets / 1_000_000_000, // Convert to MAS
      totalDownBets: totalDownBets / 1_000_000_000,
      houseUpExposure: houseUpExposure / 1_000_000_000,
      houseDownExposure: houseDownExposure / 1_000_000_000,
      status: Number(status),
      upWins,
      isActive,
      isSettled,
      timeRemaining,
      bettingTimeRemaining,
      totalPool: totalPool / 1_000_000_000,
    };
  }, []);

  // Fetch current active round
  const fetchCurrentRound = useCallback(async () => {
    if (!provider) return;

    try {
      setIsLoading(true);
      setError(null);

      const contract = new SmartContract(provider, contractAddress);
      const result = await contract.read('getCurrentRound', new Args());
      
      if (!result.value || result.value.length === 0) {
        setCurrentRound(null);
        return;
      }

      const roundArgs = new Args(result.value);
      const currentTime = Date.now();
      const roundData = parseRoundData(roundArgs, currentTime);

      setCurrentRound(roundData);
    } catch (err: any) {
      console.error('Error fetching current round:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [provider, contractAddress, parseRoundData]);

  // Fetch specific round details
  const fetchRoundDetails = useCallback(async (roundId: number): Promise<RoundData | null> => {
    if (!provider) return null;

    try {
      const contract = new SmartContract(provider, contractAddress);
      const args = new Args().addU64(BigInt(roundId));
      const result = await contract.read('getRoundDetails', args);

      const roundArgs = new Args(result.value);
      const currentTime = Date.now();
      return parseRoundData(roundArgs, currentTime);
    } catch (err: any) {
      console.error('Error fetching round details:', err);
      throw err;
    }
  }, [provider, contractAddress, parseRoundData]);

  // Fetch round history (last N rounds)
  const fetchRoundHistory = useCallback(async (count: number = 10) => {
    if (!provider || !currentRound) return;

    try {
      const history: RoundData[] = [];
      const startId = Math.max(1, currentRound.roundId - count);

      for (let i = currentRound.roundId - 1; i >= startId; i--) {
        try {
          const round = await fetchRoundDetails(i);
          if (round) history.push(round);
        } catch {
          // Round might not exist, continue
        }
      }

      setRoundHistory(history);
    } catch (err: any) {
      console.error('Error fetching round history:', err);
    }
  }, [provider, currentRound, fetchRoundDetails]);

  // Get AMM odds for a potential bet
  const getAMMOdds = useCallback(async (roundId: number, betAmount: number): Promise<AMMOdds | null> => {
    if (!provider) return null;

    try {
      const contract = new SmartContract(provider, contractAddress);
      const args = new Args()
        .addU64(BigInt(roundId))
        .addU64(BigInt(betAmount * 1_000_000_000)); // Convert to nanoMAS

      const result = await contract.read('getAMMOdds', args);
      const oddsArgs = new Args(result.value);

      return {
        upOdds: oddsArgs.nextF64(),
        downOdds: oddsArgs.nextF64(),
        upPayout: Number(oddsArgs.nextU64()) / 1_000_000_000,
        downPayout: Number(oddsArgs.nextU64()) / 1_000_000_000,
        totalUpPool: Number(oddsArgs.nextU64()) / 1_000_000_000,
        totalDownPool: Number(oddsArgs.nextU64()) / 1_000_000_000,
      };
    } catch (err: any) {
      console.error('Error fetching AMM odds:', err);
      return null;
    }
  }, [provider, contractAddress]);

  // Get user bet for specific round
  const getUserBet = useCallback(async (roundId: number, userAddress: string): Promise<UserBet | null> => {
    if (!provider) return null;

    try {
      const contract = new SmartContract(provider, contractAddress);
      const args = new Args()
        .addU64(BigInt(roundId))
        .addString(userAddress);

      const result = await contract.read('getUserBet', args);
      const betArgs = new Args(result.value);

      const storedRoundId = Number(betArgs.nextU64());
      const storedAddress = betArgs.nextString();
      const upBets = Number(betArgs.nextU64()) / 1_000_000_000;
      const downBets = Number(betArgs.nextU64()) / 1_000_000_000;

      return {
        roundId: storedRoundId,
        userAddress: storedAddress,
        upBets,
        downBets,
        totalBet: upBets + downBets,
      };
    } catch (err: any) {
      console.error('Error fetching user bet:', err);
      return null;
    }
  }, [provider, contractAddress]);

  // Auto-refresh current round every 5 seconds
  // useEffect(() => {
  //   fetchCurrentRound();
  //   const interval = setInterval(fetchCurrentRound, 5000);
  //   return () => clearInterval(interval);
  // }, [fetchCurrentRound]);

  useEffect(() => {
    fetchCurrentRound()
  },[])

  // Fetch history when current round changes
  // useEffect(() => {
  //   if (currentRound && currentRound.roundId > 1) {
  //     fetchRoundHistory(10);
  //   }
  // }, [currentRound?.roundId]);

  return {
    currentRound,
    roundHistory,
    isLoading,
    error,
    fetchCurrentRound,
    fetchRoundDetails,
    fetchRoundHistory,
    getAMMOdds,
    getUserBet,
  };
};
