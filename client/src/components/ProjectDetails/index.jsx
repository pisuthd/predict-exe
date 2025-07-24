import React, { useState } from 'react';
import { Button, Frame, Fieldset, Input } from '@react95/core';
import styled from 'styled-components';

const DetailsContainer = styled.div`
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
  padding: 4px 0;
  border-bottom: 1px dotted #666;
`;

const Label = styled.span`
  font-weight: bold;
  font-size: 11px;
`;

const Value = styled.span`
  font-size: 11px;
`;

const Description = styled.div`
  font-size: 11px;
  line-height: 1.4;
  padding: 8px;
  background: #c0c0c0;
  border: 1px inset #c0c0c0;
`;

const PredictionSection = styled.div`
  margin-top: 12px;
`;

const PriceContainer = styled.div`
  display: flex;
  gap: 8px;
  margin: 8px 0;
`;

const PriceBox = styled.div`
  flex: 1;
  padding: 8px;
  background: ${props => props.type === 'yes' ? '#90EE90' : '#FFB6C1'};
  border: 1px inset #c0c0c0;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: auto;
`;

const StatusBadge = styled.span`
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: bold;
  background: ${props => {
    if (props.status === 'expired') return '#FFB6C1';
    if (props.status === 'resolved') return '#90EE90';
    return '#FFFF99';
  }};
  color: ${props => props.status === 'resolved' ? '#000' : '#000'};
`;

// Buy Modal Overlay
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const BuyModal = styled.div`
  background: #c0c0c0;
  border: 2px outset #c0c0c0;
  min-width: 300px;
  padding: 16px;
`;

const BuyModalHeader = styled.div`
  background: #000080;
  color: white;
  padding: 2px 8px;
  margin: -16px -16px 16px -16px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: #c0c0c0;
  border: 1px outset #c0c0c0;
  width: 16px;
  height: 14px;
  font-size: 10px;
  cursor: pointer;
  
  &:active {
    border: 1px inset #c0c0c0;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`;

const InputLabel = styled.label`
  font-size: 11px;
  min-width: 60px;
`;

const CalculationRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  margin: 4px 0;
`;

const ProjectDetails = ({ project: market, onClose }) => {



  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyType, setBuyType] = useState(''); // 'yes' or 'no'
  const [buyAmount, setBuyAmount] = useState('');

  // Mock user positions - replace with real data
  const userPosition = {
    yesShares: 150.50, // Mock YES position
    noShares: 75.25,   // Mock NO position
    totalInvested: 225.75
  };

  // Helper functions 

  const getTimeLeft = (expirationTimestamp) => {
    const now = Date.now();
    const timeLeft = expirationTimestamp - now;

    const totalHours = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    return { days, hours };
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // const calculatePrices = (yesPool, noPool, totalPool) => {
  //   if (totalPool === 0) return { yesPrice: 0.5, noPrice: 0.5 };
  //   return {
  //     yesPrice: yesPool / totalPool,
  //     noPrice: noPool / totalPool
  //   };
  // };

  const getMarketStatus = () => {
    if (market.resolved) return 'resolved';
    if (market.isExpired) return 'expired';
    return 'active';
  };

  // Calculate derived values 
  const { days, hours } = getTimeLeft(market.expirationTimestamp);
  const expirationDate = formatDate(market.expirationTimestamp);
  // const { yesPrice, noPrice } = calculatePrices(market.yesPool, market.noPool, market.totalPool);
  const status = getMarketStatus();

  // Calculate percentages for display
  const yesPercentage = Math.round((market.yesPoolMAS / market.totalPoolMAS) * 100);
  const noPercentage = Math.round((market.noPoolMAS / market.totalPoolMAS) * 100);

  const handleBuyYes = () => {
    setBuyType('yes');
    setShowBuyModal(true);
  };

  const handleBuyNo = () => {
    setBuyType('no');
    setShowBuyModal(true);
  };

  const handleConfirmBuy = () => {
    const amount = parseFloat(buyAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const price = buyType === 'yes' ? yesPrice : noPrice;
    const estimatedShares = amount / price;

    alert(`Confirmed: Buying ${estimatedShares.toFixed(2)} ${buyType.toUpperCase()} shares for ${amount} MAS`);

    // Here you would call your smart contract function
    // await buyShares(market.id, buyType, amount);

    setShowBuyModal(false);
    setBuyAmount('');
  };

  const calculateEstimatedShares = () => {
    const amount = parseFloat(buyAmount) || 0;
    const price = buyType === 'yes' ? yesPrice : noPrice;
    return amount / price;
  };

  return (
    <>
      <DetailsContainer>
        <Frame boxShadow="in" padding="8px">
          <Fieldset legend="Market Details">
            <InfoSection>
              <InfoRow>
                <Label>Expires:</Label>
                <Value>{expirationDate} ({days > 0 ? `${days} days left` : `${hours} hours left`})</Value>
              </InfoRow>
              <InfoRow>
                <Label>Target Price:</Label>
                <Value>${market.targetPrice}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Current Price:</Label>
                <Value>${market.currentPrice}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Data Source:</Label>
                <Value>{market.dataSource}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Status:</Label>
                <Value>
                  <StatusBadge status={status}>
                    {status.toUpperCase()}
                    {market.resolved && ` - ${market.resolutionResult ? 'YES' : 'NO'} WON`}
                  </StatusBadge>
                </Value>
              </InfoRow>
            </InfoSection>
          </Fieldset>
        </Frame>

        <Frame boxShadow="in" padding="8px">
          <Fieldset legend="Question">
            <Description>{market.question}</Description>
          </Fieldset>
        </Frame>

        <Frame boxShadow="in" padding="8px">
          <Fieldset legend="Market Prices & Your Position">
            <PredictionSection>
              <InfoRow>
                <Label>Total Pool:</Label>
                <Value>{market.totalPoolMAS} MAS</Value>
              </InfoRow>
              <InfoRow>
                <Label>Your Total Staked:</Label>
                <Value>{userPosition.totalInvested} MAS</Value>
              </InfoRow>

              <PriceContainer>
                <PriceBox type="yes">
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>YES</div>
                  <div style={{ fontSize: '12px' }}>{market.yesPoolMAS.toFixed(3)} MAS</div>
                  <div style={{ fontSize: '9px' }}>{yesPercentage}% probability</div>
                  <div style={{ fontSize: '9px', borderTop: '1px solid #666', paddingTop: '4px', marginTop: '4px' }}>
                    <strong>Your Position:</strong>
                  </div>
                  <div style={{ fontSize: '9px' }}>{userPosition.yesShares.toFixed(2)} shares</div>
                </PriceBox>
                <PriceBox type="no">
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>NO</div>
                  <div style={{ fontSize: '12px' }}>{market.noPoolMAS.toFixed(3)} MAS</div>
                  <div style={{ fontSize: '9px' }}>{noPercentage}% probability</div>
                  <div style={{ fontSize: '9px', borderTop: '1px solid #666', paddingTop: '4px', marginTop: '4px' }}>
                    <strong>Your Position:</strong>
                  </div>
                  <div style={{ fontSize: '9px' }}>{userPosition.noShares.toFixed(2)} shares</div>
                </PriceBox>
              </PriceContainer>

              <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>
                Market Consensus: {yesPercentage}% YES, {noPercentage}% NO
              </div>
            </PredictionSection>
          </Fieldset>
        </Frame>

        <ButtonGroup>
          <Button
            onClick={handleBuyYes}
            style={{ backgroundColor: '#90EE90' }}
            disabled={market.resolved || market.isExpired}
          >
            Buy YES
          </Button>
          <Button
            onClick={handleBuyNo}
            style={{ backgroundColor: '#FFB6C1' }}
            disabled={market.resolved || market.isExpired}
          >
            Buy NO
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </ButtonGroup>
      </DetailsContainer>

      {/* Buy Modal */}
      {showBuyModal && (
        <ModalOverlay onClick={() => setShowBuyModal(false)}>
          <BuyModal onClick={(e) => e.stopPropagation()}>
            <BuyModalHeader>
              <span>Buy {buyType.toUpperCase()} Shares</span>
              <CloseButton onClick={() => setShowBuyModal(false)}>×</CloseButton>
            </BuyModalHeader>

            <Frame boxShadow="in" padding="8px">
              {/* <InfoRow>
                <Label>Current Price:</Label>
                <Value>{(buyType === 'yes' ? yesPrice : noPrice).toFixed(3)} MAS per share</Value>
              </InfoRow> */}
              <InfoRow>
                <Label>Current Staked:</Label>
                <Value>{(buyType === 'yes' ? market.yesPoolMAS : market.noPoolMAS).toFixed(3)} MAS</Value>
              </InfoRow>
              <InfoRow>
                <Label>Probability:</Label>
                <Value>{buyType === 'yes' ? yesPercentage : noPercentage}%</Value>
              </InfoRow>
            </Frame>

            <div style={{ margin: '16px 0' }}>
              <InputRow>
                <InputLabel>Amount:</InputLabel>
                <Input
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '11px' }}>MAS</span>
              </InputRow>

              {buyAmount && (
                <>
                  <CalculationRow>
                    <span>Estimated Shares:</span>
                    <span>{calculateEstimatedShares().toFixed(2)}</span>
                  </CalculationRow>
                  <CalculationRow>
                    <span>Potential Payout (if win):</span>
                    <span>{parseFloat(buyAmount || 0).toFixed(2)} MAS</span>
                  </CalculationRow>
                </>
              )}
            </div>

            <ButtonGroup>
              <Button onClick={() => setShowBuyModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBuy}
                style={{ backgroundColor: buyType === 'yes' ? '#90EE90' : '#FFB6C1', fontWeight: 'bold' }}
              >
                Confirm Buy
              </Button>
            </ButtonGroup>
          </BuyModal>
        </ModalOverlay>
      )}
    </>
  );
};

export default ProjectDetails;