import React from 'react';
import styled from 'styled-components';
import { InfoBubble } from '@react95/icons';

const DesktopContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #008080;
  position: relative;
  background-image: url('data:image/svg+xml,<svg width="2" height="2" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="%23006666"/><rect x="1" y="1" width="1" height="1" fill="%23006666"/></svg>');
  overflow: hidden;
`;

const MarketIcon = styled.div`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 2px;
  min-width: 100px;
  max-width: 140px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 4px;
`;

const MarketLabel = styled.div`
  color: white;
  font-size: 11px;
  text-align: center;
  word-wrap: break-word;
  line-height: 1.2;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  margin-bottom: 2px;
`;

const MarketInfo = styled.div`
  font-size: 9px;
  color: #ffff99;
  text-align: center;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  line-height: 1.1;
`;

const PriceInfo = styled.div`
  font-size: 8px;
  color: #90EE90;
  text-align: center;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  margin-top: 1px;
`;

const Desktop = ({ projects: markets, onProjectClick: onMarketClick }) => {
  return (
    <DesktopContainer>
      {markets.map((market) => {
        return (
          <MarketIcon
            key={market.id}
            x={market.position.x}
            y={market.position.y}
            onClick={() => onMarketClick(market)}
          >
            <IconWrapper>
              <InfoBubble variant="32x32_4" />
            </IconWrapper>
            <MarketLabel>{market.question}</MarketLabel>
            <MarketInfo>
              {market.deadline} ({market.daysLeft}d)
            </MarketInfo>
            <PriceInfo>
              YES: {market.yesPrice.toFixed(2)} | NO: {market.noPrice.toFixed(2)}
            </PriceInfo>
            <MarketInfo>
              Pool: {market.totalPool} MAS
            </MarketInfo>
          </MarketIcon>
        );
      })}
    </DesktopContainer>
  );
};

export default Desktop;
