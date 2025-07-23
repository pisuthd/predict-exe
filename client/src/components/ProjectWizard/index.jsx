import React from 'react';
import { Button, Input, Frame, Fieldset } from '@react95/core';
import styled from 'styled-components';

const WizardContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  width: 100%;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FullWidthSection = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: auto;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  cursor: pointer;
`;

const PositionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const PositionButton = styled(Button)`
  flex: 1;
  font-size: 11px;
  ${props => props.selected && `
    background: #000080;
    color: white;
  `}
`;

const PreviewText = styled.div`
  background: #f0f0f0;
  border: 1px inset #c0c0c0;
  padding: 8px;
  font-size: 11px;
  font-weight: bold;
  color: #000080;
  margin-top: 8px;
`;

const HelpText = styled.div`
  font-size: 10px;
  color: #666;
  margin-bottom: 8px;
`;

const PredictionMarketWizard = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    asset: 'MASA',
    direction: 'reach',
    targetPrice: '',
    currentPrice: '',
    deadline: '',
    dataSource: 'UMBRELLA_MAS_PRICE',
    selectedPosition: '',
    stakeAmount: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateQuestion = () => {
    if (!formData.asset || !formData.targetPrice || !formData.deadline) {
      return "Complete the form to see question preview";
    }

    const date = new Date(formData.deadline);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `Will ${formData.asset} price ${formData.direction} $${formData.targetPrice} by ${dateStr}?`;
  };

  const handleSubmit = () => {
    if (!formData.asset || !formData.targetPrice || !formData.deadline || !formData.selectedPosition || !formData.stakeAmount) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.stakeAmount) < 1) {
      alert('Minimum stake is 1 MAS');
      return;
    }

    // Validation for direction vs prices (only if current price is provided)
    if (formData.currentPrice) {
      const current = parseFloat(formData.currentPrice);
      const target = parseFloat(formData.targetPrice);

      if (formData.direction === 'reach' && current >= target) {
        alert('For "reach" prediction, current price should be below target price');
        return;
      }

      if (formData.direction === 'drop' && current <= target) {
        alert('For "drop" prediction, current price should be above target price');
        return;
      }
    }

    const marketData = {
      question: generateQuestion(),
      asset: formData.asset,
      direction: formData.direction,
      targetPrice: formData.targetPrice,
      currentPrice: formData.currentPrice,
      deadline: formData.deadline,
      dataSource: formData.dataSource,
      creatorPosition: formData.selectedPosition,
      creatorStake: formData.stakeAmount,
      daysLeft: Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    };

    onSubmit(marketData);
  };

  return (
    <WizardContainer>
      <Frame boxShadow="in" padding="8px">
        <Fieldset legend="Prediction Market Setup">
          <TwoColumnGrid>
            <FormSection>
              <Label>Asset *</Label>
              <Input
                value={formData.asset}
                onChange={(e) => handleInputChange('asset', e.target.value)}
                placeholder="e.g., MASA, BTC, ETH"
                style={{ width: '100%' }}
              />
            </FormSection>

            <FormSection>
              <Label>Data Source *</Label>
              <select
                value={formData.dataSource}
                onChange={(e) => handleInputChange('dataSource', e.target.value)}
                style={{
                  width: '100%',
                  padding: '2px 4px',
                  border: '1px inset #c0c0c0',
                  background: 'white',
                  fontSize: '11px'
                }}
              >
                <option value="UMBRELLA_MAS_PRICE">UMBRELLA_MAS_PRICE</option>
                <option value="UMBRELLA_BTC_PRICE">UMBRELLA_BTC_PRICE</option>
                <option value="UMBRELLA_ETH_PRICE">UMBRELLA_ETH_PRICE</option>
                <option value="DUSA_MAS_USDC">DUSA_MAS_USDC</option>
              </select>
            </FormSection>

            <FormSection>
              <Label>Direction *</Label>
              <RadioGroup>
                <RadioOption>
                  <input
                    type="radio"
                    name="direction"
                    value="reach"
                    checked={formData.direction === 'reach'}
                    onChange={(e) => handleInputChange('direction', e.target.value)}
                  />
                  Reach
                </RadioOption>
                <RadioOption>
                  <input
                    type="radio"
                    name="direction"
                    value="drop"
                    checked={formData.direction === 'drop'}
                    onChange={(e) => handleInputChange('direction', e.target.value)}
                  />
                  Drop
                </RadioOption>
              </RadioGroup>
            </FormSection>

            <FormSection>
              <Label>Target Price *</Label>
              <Input
                value={formData.targetPrice}
                onChange={(e) => handleInputChange('targetPrice', e.target.value)}
                placeholder="e.g., 1.0"
                style={{ width: '100%' }}
              />
            </FormSection>

            <FormSection>
              <Label>Current Price</Label>
              <Input
                value={formData.currentPrice}
                onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                placeholder="e.g., 0.85"
                style={{ width: '100%' }}
              />
            </FormSection>

            <FormSection>
              <Label>Deadline *</Label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                style={{ width: '100%' }}
              />
            </FormSection>

            <FullWidthSection>
              <Label>Question Preview</Label>
              <PreviewText>
                {generateQuestion()}
              </PreviewText>
            </FullWidthSection>

            <FullWidthSection>
              <Label>Initial Stake - Choose Your Position *</Label>
              <HelpText>
                As the creator, you must stake at least 1 MAS on either YES or NO to initialize the market.
              </HelpText>
              <PositionButtons>
                <PositionButton
                  selected={formData.selectedPosition === 'YES'}
                  onClick={() => handleInputChange('selectedPosition', 'YES')}
                >
                  YES
                </PositionButton>
                <PositionButton
                  selected={formData.selectedPosition === 'NO'}
                  onClick={() => handleInputChange('selectedPosition', 'NO')}
                >
                  NO
                </PositionButton>
              </PositionButtons>
              {formData.selectedPosition && (
                <div style={{ marginTop: '8px' }}>
                  <Label>Stake Amount (MAS) *</Label>
                  <Input
                    value={formData.stakeAmount}
                    onChange={(e) => handleInputChange('stakeAmount', e.target.value)}
                    placeholder="Minimum 1 MAS"
                    style={{ width: '200px' }}
                  />
                </div>
              )}
            </FullWidthSection>
          </TwoColumnGrid>
        </Fieldset>
      </Frame>

      <ButtonGroup>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} style={{ fontWeight: 'bold' }}>
          Create Market
        </Button>
      </ButtonGroup>
    </WizardContainer>
  );
};

export default PredictionMarketWizard;