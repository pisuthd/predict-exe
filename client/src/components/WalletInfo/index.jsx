import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Input, Frame, Fieldset } from '@react95/core';
import styled from 'styled-components';
import { AccountContext } from '../../contexts/account';

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

const WalletInfo = ({
    walletData = {
        accountName: "My Massa Account",
        walletType: "MassaStation",
        address: "AU1abc...def123",
        balance: "1,234.56",
        connected: true,
        tokens: [
            {
                marketId: "market_001",
                marketName: "ETH reaches $4000 by March 31st?",
                tokenType: "YES",
                balance: "150.00"
            },
            {
                marketId: "market_001",
                marketName: "ETH reaches $4000 by March 31st?",
                tokenType: "NO",
                balance: "50.00"
            },
            {
                marketId: "market_002",
                marketName: "BTC surpasses $100k in Q2 2025?",
                tokenType: "YES",
                balance: "75.50"
            },
            {
                marketId: "market_003",
                marketName: "Massa TPS exceeds 10,000 daily avg?",
                tokenType: "NO",
                balance: "200.00"
            },
            {
                marketId: "market_004",
                marketName: "DeFi TVL on Massa reaches $1B?",
                tokenType: "YES",
                balance: "300.25"
            }
        ]
    }, 
    onCopyAddress,
    onClose
}) => {


    const [balance, setBalance] = useState("")
    const [networkName, setNetworkName] = useState("N/A")

    const { account, provider } = useContext(AccountContext)

    const totalTokenValue = walletData.tokens.reduce((sum, token) => sum + parseFloat(token.balance), 0);

    const handleRefresh = useCallback(() => {
        checkBalance(provider, account)
    }, [provider, account])

    const handleCopyAddress = () => {
        if (onCopyAddress) {
            onCopyAddress(walletData.address);
        } else {
            navigator.clipboard.writeText(walletData.address);
            alert('Address copied to clipboard');
        }
    };

    useEffect(() => {
        provider && account && checkBalance(provider, account)
    }, [provider, account])

    const checkBalance = async (provider, account) => {
        const balance = await account.balance()
        setBalance(formatMASBalance(balance))
        // Get network info
        const networkInfo = await provider.networkInfos();
        setNetworkName(networkInfo.name)
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
                <Fieldset legend={`Prediction Tokens (${walletData.tokens.length} positions)`}>
                    <InfoRow>
                        <Label>Total Token Value:</Label>
                        <Value>{totalTokenValue.toFixed(2)} tokens</Value>
                    </InfoRow>

                    <TokenList>
                        {walletData.tokens.length === 0 ? (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#666',
                                fontSize: '11px'
                            }}>
                                No prediction tokens held
                            </div>
                        ) : (
                            walletData.tokens.map((token, index) => (
                                <TokenItem key={`${token.marketId}-${token.tokenType}-${index}`}>
                                    <TokenInfo>
                                        <MarketName>{token.marketName}</MarketName>
                                        <TokenType>{token.tokenType} Position</TokenType>
                                    </TokenInfo>
                                    <TokenBalance tokenType={token.tokenType}>
                                        {parseFloat(token.balance).toFixed(2)}
                                    </TokenBalance>
                                </TokenItem>
                            ))
                        )}
                    </TokenList>
                </Fieldset>
            </Frame>

            <ButtonGroup>
                <Button onClick={handleRefresh}>
                    Refresh
                </Button>
                <Button onClick={handleCopyAddress}>
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