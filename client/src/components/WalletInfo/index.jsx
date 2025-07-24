import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Input, Frame, Fieldset } from '@react95/core';
import styled from 'styled-components';
import { AccountContext } from '../../contexts/account';
import { MarketContext } from '../../contexts/market';

const Container = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const Value = styled.span`
  font-size: 11px;
  font-family: 'MS Sans Serif', sans-serif;
  background: white;
  border: 1px inset #c0c0c0;
  padding: 2px 4px;
  min-width: 150px;
  text-align: right;
`;

const TokenList = styled.div`
  height: 140px;
  border: 1px inset #c0c0c0;
  background: white;
  overflow-y: auto;
  margin-top: 8px;
`;

const TokenItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #0000ff;
    color: white;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MarketName = styled.span`
  font-weight: bold;
  font-size: 10px;
`;

const TokenType = styled.span`
  font-size: 9px;
  color: #666;
  
  ${TokenItem}:hover & {
    color: #ccc;
  }
`;

const TokenBalance = styled.span`
  font-weight: bold;
  color: ${props => props.tokenType === 'YES' ? '#008000' : '#800000'};
  
  ${TokenItem}:hover & {
    color: white;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: auto;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;

  span {
    text-transform: capitalize;
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#00ff00' : '#ff0000'};
  border: 1px solid #000;
`;

const LoadingText = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 11px;
  font-style: italic;
`;

const WalletInfo = ({ onCopyAddress, onClose, onMarketClick }) => {

    const [positions, setPositions ] = useState([])

    const [balance, setBalance] = useState("");
    const [networkName, setNetworkName] = useState("N/A");
    const [isLoading, setIsLoading] = useState(false);

    const { markets } = useContext(MarketContext);
    const { account, provider, getUserPositions } = useContext(AccountContext);

    // Convert positions to token format with market details
    const getUserTokens = () => {
        if (!positions || !markets) return [];

        const tokens = [];
        
        positions.forEach(position => {
            // Find the market details
            const market = markets.find(m => m.id === position.marketId);
            
            if (market) {
                // Add YES position if exists
                if (position.totalYes > 0) {
                    tokens.push({
                        marketId: position.marketId,
                        marketName: market.question,
                        tokenType: "YES",
                        balance: position.totalYes.toFixed(2),
                        marketStatus: market.resolved ? 'resolved' : market.isExpired ? 'expired' : 'active',
                        resolutionResult: market.resolutionResult
                    });
                }
                
                // Add NO position if exists
                if (position.totalNo > 0) {
                    tokens.push({
                        marketId: position.marketId,
                        marketName: market.question,
                        tokenType: "NO", 
                        balance: position.totalNo.toFixed(2),
                        marketStatus: market.resolved ? 'resolved' : market.isExpired ? 'expired' : 'active',
                        resolutionResult: market.resolutionResult
                    });
                }
            }
        });

        return tokens;
    };

    const userTokens = getUserTokens();
    const totalTokenValue = userTokens.reduce((sum, token) => sum + parseFloat(token.balance), 0);
    const totalPositions = positions ? positions.length : 0;

    const handleRefresh = useCallback(async () => {
        if (!provider || !account) return;
        
        setIsLoading(true);
        try {
            await checkBalance(provider, account);
            getUserPositions(account).then(setPositions)
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [provider, account]);

    useEffect(() => { 
        account && getUserPositions(account).then(setPositions)
    }, [account]);

    const handleCopyAddress = () => {
        if (!account) return;
        
        if (onCopyAddress) {
            onCopyAddress(account.address);
        } else {
            navigator.clipboard.writeText(account.address);
            alert('Address copied to clipboard');
        }
    };

    useEffect(() => {
        if (provider && account) {
            checkBalance(provider, account);
        }
    }, [provider, account]);

    const checkBalance = async (provider, account) => {
        try {
            const balance = await account.balance();
            setBalance(formatMASBalance(balance));
            // Get network info
            const networkInfo = await provider.networkInfos();
            setNetworkName(networkInfo.name);
        } catch (error) {
            console.error('Error checking balance:', error);
            setBalance('Error loading balance');
        }
    };

    // Helper function to get token display style
    const getTokenStyle = (token) => {
        if (token.marketStatus === 'resolved') {
            const isWinner = (token.tokenType === 'YES' && token.resolutionResult) || 
                           (token.tokenType === 'NO' && !token.resolutionResult);
            return {
                backgroundColor: isWinner ? '#e6ffe6' : '#ffe6e6',
                border: `1px solid ${isWinner ? '#90EE90' : '#FFB6C1'}`
            };
        }
        return {};
    };

    if (!account) {
        return (
            <Container>
                <LoadingText>
                    Please connect your wallet to view account details
                </LoadingText>
            </Container>
        );
    }

    return (
        <Container>
            <Frame boxShadow="in" padding="8px">
                <Fieldset legend="Account Details">
                    <InfoSection>
                        <InfoRow>
                            <Label>Account Name:</Label>
                            <Value>{account.accountName}</Value>
                        </InfoRow>
                        <InfoRow>
                            <Label>Address:</Label>
                            <Value title={account.address}>
                                {account.address.length > 20
                                    ? `${account.address.slice(0, 8)}...${account.address.slice(-8)}`
                                    : account.address
                                }
                            </Value>
                        </InfoRow>

                        <InfoRow>
                            <Label>MAS Balance:</Label>
                            <Value>{balance} MAS</Value>
                        </InfoRow>

                        <InfoRow>
                            <Label>Network:</Label>
                            <StatusIndicator>
                                <StatusDot connected={true} />
                                <span>{networkName}</span>
                            </StatusIndicator>
                        </InfoRow>
                    </InfoSection>
                </Fieldset>
            </Frame>

            <Frame boxShadow="in" padding="8px">
                <Fieldset legend={`Prediction Tokens (${totalPositions} markets, ${userTokens.length} positions)`}>
                    <InfoRow>
                        <Label>Total Token Value:</Label>
                        <Value>{totalTokenValue.toFixed(2)} MAS</Value>
                    </InfoRow>

                    <TokenList>
                        {isLoading ? (
                            <LoadingText>
                                Loading positions...
                            </LoadingText>
                        ) : userTokens.length === 0 ? (
                            <LoadingText>
                                No prediction tokens held
                            </LoadingText>
                        ) : (
                            userTokens.map((token, index) => (
                                <TokenItem 
                                    key={`${token.marketId}-${token.tokenType}-${index}`}
                                    style={getTokenStyle(token)}
                                    onClick={() => {
                                        const market = markets.find(m => m.id === token.marketId);
                                        onMarketClick && market && onMarketClick(market)
                                    }}
                                >
                                    <TokenInfo>
                                        <MarketName title={token.marketName}>
                                            {token.marketName.length > 50 
                                                ? `${token.marketName.slice(0, 50)}...` 
                                                : token.marketName
                                            }
                                        </MarketName>
                                        <TokenType>
                                            {token.tokenType} Position
                                            {token.marketStatus === 'resolved' && (
                                                <span style={{ marginLeft: '4px' }}>
                                                    • {((token.tokenType === 'YES' && token.resolutionResult) || 
                                                       (token.tokenType === 'NO' && !token.resolutionResult)) 
                                                       ? 'WON' : 'LOST'}
                                                </span>
                                            )}
                                            {token.marketStatus === 'expired' && (
                                                <span style={{ marginLeft: '4px', color: '#FF6B6B' }}>
                                                    • EXPIRED
                                                </span>
                                            )}
                                        </TokenType>
                                    </TokenInfo>
                                    <TokenBalance tokenType={token.tokenType}>
                                        {parseFloat(token.balance).toFixed(2)} MAS
                                    </TokenBalance>
                                </TokenItem>
                            ))
                        )}
                    </TokenList>
                </Fieldset>
            </Frame>

            <ButtonGroup>
                <Button onClick={handleRefresh} disabled={isLoading || !account}>
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button onClick={handleCopyAddress} disabled={!account}>
                    Copy Address
                </Button>
                {onClose && (
                    <Button onClick={onClose} style={{ fontWeight: 'bold' }}>
                        Close
                    </Button>
                )}
            </ButtonGroup>
        </Container>
    );
};

// Helper function to format MAS balance from BigInt with 9 decimals
const formatMASBalance = (balanceBigInt) => {
    if (typeof balanceBigInt === 'string') {
        // If it's already a string, return as is
        return balanceBigInt;
    }

    if (typeof balanceBigInt === 'bigint' || (typeof balanceBigInt === 'string' && balanceBigInt.endsWith('n'))) {
        // Handle BigInt or string with 'n' suffix
        const balanceStr = balanceBigInt.toString().replace('n', '');
        const balance = BigInt(balanceStr);

        // Massa has 9 decimal places
        const divisor = BigInt(10 ** 9);
        const wholePart = balance / divisor;
        const fractionalPart = balance % divisor;

        // Format fractional part with leading zeros and remove trailing zeros
        const fractionalStr = fractionalPart.toString().padStart(9, '0').replace(/0+$/, '');

        if (fractionalStr === '') {
            return wholePart.toString();
        } else {
            return `${wholePart.toString()}.${fractionalStr}`;
        }
    }

    return balanceBigInt?.toString() || '0';
};

export default WalletInfo;