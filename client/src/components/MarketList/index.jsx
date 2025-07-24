import React, { useContext } from 'react';
import { Button, Frame, Fieldset } from '@react95/core';
import styled from 'styled-components';
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

const MarketTable = styled.div`
  height: 300px;
  border: 1px inset #c0c0c0;
  background: white;
  overflow-y: auto;
  margin-top: 8px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const MarketRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px;
  padding: 6px 8px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #0000ff;
    color: white;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const QuestionCell = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 8px; 
`;

const PriceCell = styled.div`
  text-align: center;
  font-weight: bold;
  color: ${props => props.type === 'yes' ? '#008000' : '#800000'};
  
  ${MarketRow}:hover & {
    color: white;
  }
`;

const PoolCell = styled.div`
  text-align: center;
  font-weight: bold;
`;

const StatusCell = styled.div`
  text-align: center;
  font-size: 9px;
  font-weight: bold;
`;

const StatusBadge = styled.span`
  padding: 1px 4px;
  border-radius: 2px;
  background: ${props => {
        if (props.status === 'expired') return '#FFB6C1';
        if (props.status === 'resolved') return '#90EE90';
        return '#FFFF99';
    }};
  color: #000;
`;

// const ButtonGroup = styled.div`
//   display: flex;
//   gap: 8px;
//   justify-content: flex-end;
//   margin-top: auto;
// `;

const FilterSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const FilterButton = styled(Button)`
  font-size: 10px;
  padding: 2px 8px;
  background: ${props => props.active ? '#0000ff' : '#c0c0c0'};
  color: ${props => props.active ? 'white' : 'black'};
`;

const MarketListing = ({ onMarketClick }) => {

    const { markets } = useContext(MarketContext);
    const [filter, setFilter] = React.useState('all'); // all, active, expired, resolved

    // Helper functions 

    const getTimeLeft = (expirationTimestamp) => {
        const now = Date.now();
        const timeLeft = expirationTimestamp - now;

        const totalHours = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;

        return { days, hours };
    };

    const getMarketStatus = (market) => {
        if (market.resolved) return 'resolved';
        if (market.isExpired) return 'expired';
        return 'active';
    };

    const calculatePrices = (yesPool, noPool, totalPool) => {
        if (totalPool === 0) return { yesPrice: 0.5, noPrice: 0.5 };
        return {
            yesPrice: yesPool / totalPool,
            noPrice: noPool / totalPool
        };
    };

    // Filter markets
    const filteredMarkets = markets.filter(market => {
        const status = getMarketStatus(market);
        if (filter === 'all') return true;
        return status === filter;
    });

    // Statistics
    const totalMarkets = markets.length;
    const activeMarkets = markets.filter(m => !m.resolved && !m.isExpired).length;
    const resolvedMarkets = markets.filter(m => m.resolved).length;
    const expiredMarkets = markets.filter(m => m.isExpired).length;
    const totalVolume = markets.reduce((sum, m) => sum + m.totalPoolMAS, 0);

    return (
        <Container>
            {/* <Frame boxShadow="in" padding="8px">
                <Fieldset legend="Market Overview">
                    <InfoSection>
                        <InfoRow>
                            <Label>Total Markets:</Label>
                            <Value>{totalMarkets}</Value>
                        </InfoRow>
                        <InfoRow>
                            <Label>Active Markets:</Label>
                            <Value>{activeMarkets}</Value>
                        </InfoRow>
                        <InfoRow>
                            <Label>Total Volume:</Label>
                            <Value>{totalVolume.toFixed(2)} MAS</Value>
                        </InfoRow>
                    </InfoSection>
                </Fieldset>
            </Frame> */}

            <Frame boxShadow="in" padding="8px">
                <Fieldset legend={`Markets (${filteredMarkets.length} ${filter === 'all' ? 'total' : filter})`}>
                    <FilterSection>
                        <Label>Filter:</Label>
                        <FilterButton
                            active={filter === 'all'}
                            onClick={() => setFilter('all')}
                        >
                            All ({totalMarkets})
                        </FilterButton>
                        <FilterButton
                            active={filter === 'active'}
                            onClick={() => setFilter('active')}
                        >
                            Active ({activeMarkets})
                        </FilterButton>
                        <FilterButton
                            active={filter === 'expired'}
                            onClick={() => setFilter('expired')}
                        >
                            Expired ({expiredMarkets})
                        </FilterButton>
                        <FilterButton
                            active={filter === 'resolved'}
                            onClick={() => setFilter('resolved')}
                        >
                            Resolved ({resolvedMarkets})
                        </FilterButton>
                    </FilterSection>

                    <MarketTable>
                        <TableHeader>
                            <div>Question</div>
                            <div>YES</div>
                            <div>NO</div>
                            <div>Pool</div>
                            <div>Status</div>
                        </TableHeader>

                        {filteredMarkets.length === 0 ? (
                            <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                color: '#666',
                                fontSize: '11px'
                            }}>
                                No markets found for "{filter}" filter
                            </div>
                        ) : (
                            filteredMarkets.map((market) => {
                                const { yesPrice, noPrice } = calculatePrices(
                                    market.yesPool,
                                    market.noPool,
                                    market.totalPool
                                );
                                const status = getMarketStatus(market);
                                const { days, hours } = getTimeLeft(market.expirationTimestamp)

                                return (
                                    <MarketRow
                                        key={market.id}
                                        onClick={() => onMarketClick && onMarketClick(market)}
                                    >
                                        <QuestionCell title={market.question}>
                                            {market.question}
                                        </QuestionCell>
                                        <PriceCell type="yes">
                                            {(yesPrice * 100).toFixed(0)}%
                                        </PriceCell>
                                        <PriceCell type="no">
                                            {(noPrice * 100).toFixed(0)}%
                                        </PriceCell>
                                        <PoolCell>
                                            {market.totalPoolMAS.toFixed(1)}
                                        </PoolCell>
                                        <StatusCell>
                                            {status === 'active' ? (
                                                <StatusBadge status={status}>
                                                    In {days > 0 ? `${days}d` : `${hours}h`}
                                                </StatusBadge>
                                            ) : (
                                                <StatusBadge status={status}>
                                                    {status === 'resolved'
                                                        ? (market.resolutionResult ? 'YES' : 'NO')
                                                        : 'EXP'
                                                    }
                                                </StatusBadge>
                                            )}
                                        </StatusCell>
                                    </MarketRow>
                                );
                            })
                        )}
                    </MarketTable>
                </Fieldset>
            </Frame>

        </Container>
    );
};

export default MarketListing;