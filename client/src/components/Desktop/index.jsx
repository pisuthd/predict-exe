import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { InfoBubble, Explore, Appwiz1502 } from '@react95/icons';
import { MarketContext } from '../../contexts/market';

const DesktopContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #008080;
  position: relative; 
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
  padding: 4px;
  border-radius: 2px;
  width: 80px; 
  
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
  line-height: 1.1;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  margin-bottom: 2px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;


const StatusInfo = styled.div`
  font-size: 9px;
  color: ${props => props.color || '#FF6B6B'};
  text-align: center;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  margin-top: 1px;
  font-weight: bold;
`;


const Desktop = ({ onMarketClick, toggleModal }) => {

  const { markets } = useContext(MarketContext);

  // Helper function to calculate days left
  const getTimeLeft = (expirationTimestamp) => {
    const now = Date.now();
    const timeLeft = expirationTimestamp - now;

    const totalHours = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    return { days, hours };
  };
  
  // Create static icons and position markets
  const { staticIcons, marketsWithPositions } = useMemo(() => {
    const iconWidth = 90;
    const iconHeight = 80;
    const marginX = 15;
    const marginY = 15;
    const startX = 20;
    const startY = 20;

    // Calculate how many icons fit vertically
    const iconsPerColumn = Math.floor((600 - startY) / (iconHeight + marginY));

    // Create static icons
    const staticIcons = [
      {
        id: 'show-all',
        icon: <Explore variant="32x32_4" />,
        label: 'View All Markets',
        onClick: () => toggleModal("marketList"),
        position: { x: startX, y: startY }
      },
      {
        id: 'setup-new',
        icon: <Appwiz1502 variant="32x32_4" />,
        label: 'Setup New Market',
        onClick: () => toggleModal("newProject"),
        position: {
          x: startX,
          y: startY + (iconHeight + marginY)
        }
      }
    ];

    // Position markets starting after static icons (offset by 2)
    const existingIconsCount = 2;
    const marketsWithPositions = markets.slice(0, 3).map((market, index) => {
      const adjustedIndex = index + existingIconsCount;
      const col = Math.floor(adjustedIndex / iconsPerColumn);
      const row = adjustedIndex % iconsPerColumn;

      return {
        ...market,
        position: {
          x: startX + col * (iconWidth + marginX),
          y: startY + row * (iconHeight + marginY)
        }
      };
    });

    return { staticIcons, marketsWithPositions };
  }, [markets, toggleModal]);

  return (
    <DesktopContainer>
      {/* Static Desktop Icons */}
      {staticIcons.map((icon) => (
        <MarketIcon
          key={icon.id}
          x={icon.position.x}
          y={icon.position.y}
          onClick={icon.onClick}
        >
          <IconWrapper>
            {icon.icon}
          </IconWrapper>
          <MarketLabel>{icon.label}</MarketLabel>
        </MarketIcon>
      ))}

      {/* Market Icons */}
      {marketsWithPositions.map((market) => {
        const { days, hours } = getTimeLeft(market.expirationTimestamp)
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

            {hours > 0 ?
              (
                <StatusInfo color="#90EE90">
                  { days > 0 ? `${days} days left` : `${hours} hours left` }
                </StatusInfo>
              ) :
              (
                <StatusInfo color="#FF6B6B">
                  EXPIRED
                </StatusInfo>
              )
            } 
          </MarketIcon>
        );
      })}
    </DesktopContainer>
  );
};

export default Desktop;