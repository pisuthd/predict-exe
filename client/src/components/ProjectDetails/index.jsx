import React, { useState, useEffect } from 'react';
import { Button, Frame, Fieldset, ProgressBar } from '@react95/core';
import styled from 'styled-components';
import { bytesToStr, JsonRPCClient } from "@massalabs/massa-web3";

const sc_addr = "AS14PLuYx1BKQ4hjZqxAvto52QWp4Qp2Wk8DAqHoktvkTJfJkDFy";


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

const ProjectDetails = ({ project: market }) => {

  const [currentPrice, setCurrentPrice] = useState(0)

  const client = JsonRPCClient.buildnet()

  useEffect(() => {
    getPrice();
  });

  const totalShares = market.yesShares + market.noShares;
  const yesPercentage = totalShares > 0 ? Math.round((market.yesShares / totalShares) * 100) : 50;

  const handleBuyYes = () => {
    alert(`Buying YES shares for "${market.question}" at ${market.yesPrice.toFixed(2)} MAS`);
  };

  const handleBuyNo = () => {
    sc_addr
    alert(`Buying NO shares for "${market.question}" at ${market.noPrice.toFixed(2)} MAS`);
  };

  const handleShare = () => {
    alert(`Sharing market: ${market.question}`);
  };

  async function getPrice() {
    if (client) {
      const dataStoreVal = await client.getDatastoreEntry("mock_price", sc_addr, false)
      const valueDecoded = dataStoreVal ? bytesToStr(dataStoreVal) : null; 
      setCurrentPrice(valueDecoded)
    }
  }

  return (
    <DetailsContainer>
      <Frame boxShadow="in" padding="8px">
        <Fieldset legend="Market Details">
          <InfoSection>
            <InfoRow>
              <Label>Category:</Label>
              <Value>{market.category}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Deadline:</Label>
              <Value>{market.deadline} ({market.daysLeft} days left)</Value>
            </InfoRow>
            {/* <InfoRow>
              <Label>Threshold:</Label>
              <Value>{market.threshold}</Value>
            </InfoRow> */}
            <InfoRow>
              <Label>Current Value:</Label>
              <Value>{Number(currentPrice).toLocaleString()}</Value>
            </InfoRow>
            {/* <InfoRow>
              <Label>Metric:</Label>
              <Value>{market.metric}</Value>
            </InfoRow> */}
            <InfoRow>
              <Label>Status:</Label>
              <Value>{market.status}</Value>
            </InfoRow>
          </InfoSection>
        </Fieldset>
      </Frame>

      <Frame boxShadow="in" padding="8px">
        <Fieldset legend="Question">
          <Description>{market.question}</Description>
          <div style={{ fontSize: '10px', marginTop: '8px', fontStyle: 'italic' }}>
            {market.description}
          </div>
        </Fieldset>
      </Frame>

      <Frame boxShadow="in" padding="8px">
        <Fieldset legend="Market Prices & Pool">
          <PredictionSection>
            <InfoRow>
              <Label>Total Pool:</Label>
              <Value>{market.totalPool} MAS</Value>
            </InfoRow>
            <InfoRow>
              <Label>Total Shares:</Label>
              <Value>{totalShares}</Value>
            </InfoRow>

            <PriceContainer>
              <PriceBox type="yes">
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>YES</div>
                <div style={{ fontSize: '12px' }}>{market.yesPrice.toFixed(2)} MAS</div>
                <div style={{ fontSize: '9px' }}>{market.yesShares} shares</div>
              </PriceBox>
              <PriceBox type="no">
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>NO</div>
                <div style={{ fontSize: '12px' }}>{market.noPrice.toFixed(2)} MAS</div>
                <div style={{ fontSize: '9px' }}>{market.noShares} shares</div>
              </PriceBox>
            </PriceContainer>

            <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>
              Market Consensus: {yesPercentage}% YES, {100 - yesPercentage}% NO
            </div>
          </PredictionSection>
        </Fieldset>
      </Frame>

      <ButtonGroup>
        <Button onClick={handleBuyYes} style={{ backgroundColor: '#90EE90' }}>
          Buy YES
        </Button>
        <Button onClick={handleBuyNo} style={{ backgroundColor: '#FFB6C1' }}>
          Buy NO
        </Button>
        <Button onClick={handleShare}>
          Share
        </Button>
      </ButtonGroup>
    </DetailsContainer>
  );
};

export default ProjectDetails;