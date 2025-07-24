import React, { useContext } from 'react';
import { Button, Input, Frame, Fieldset } from '@react95/core';
import styled from 'styled-components';
import { AccountContext } from '../../contexts/account';

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

const PreviewText = styled.div`
  background: #f0f0f0;
  border: 1px inset #c0c0c0;
  padding: 8px;
  font-size: 11px;
  font-weight: bold;
  color: #000080;
  margin-top: 8px;
`;

// Modal Components
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

const StakeModal = styled.div`
  background: #c0c0c0;
  border: 2px outset #c0c0c0;
  min-width: 400px;
  padding: 16px;
`;

const StakeModalHeader = styled.div`
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

const PositionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0;
`;

const PositionButton = styled(Button)`
  flex: 1;
  font-size: 11px;
  padding: 8px;
  ${props => props.selected && `
    background: #000080;
    color: white;
  `}
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`;

const InputLabel = styled.label`
  font-size: 11px;
  min-width: 80px;
`;

const CalculationRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  margin: 4px 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px dotted #666;
  font-size: 11px;
`;

const HelpText = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 8px;
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #c0c0c0;
  border-radius: 50%;
  border-top-color: #000080;
  animation: spin 1s ease-in-out infinite;
  margin-right: 6px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #ffcccc;
  border: 1px solid #ff6666;
  padding: 8px;
  margin: 8px 0;
  font-size: 11px;
  color: #cc0000;
  border-radius: 2px;
`;

const SuccessMessage = styled.div`
  background: #ccffcc;
  border: 1px solid #66ff66;
  padding: 8px;
  margin: 8px 0;
  font-size: 11px;
  color: #006600;
  border-radius: 2px;
`;

const WalletWarning = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 12px;
  margin: 8px 0;
  font-size: 11px;
  color: #856404;
  border-radius: 2px;
  text-align: center;
`;

const PredictionMarketWizard = ({ onSubmit, onCancel }) => {

  const { account, createMarket } = useContext(AccountContext);

  const [formData, setFormData] = React.useState({
    asset: 'MAS',
    direction: 'reach',
    targetPrice: '',
    currentPrice: '',
    deadline: '',
    dataSource: 'UMBRELLA_MAS_PRICE'
  });

  const [showStakeModal, setShowStakeModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState('');
  const [stakeAmount, setStakeAmount] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any previous errors when user starts typing
    if (error) setError('');
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

  const handleCreateMarket = () => {
    setError('');
    
    // Check wallet connection first
    if (!account) {
      setError('Please connect your wallet to create a market');
      return;
    }

    // Validate basic form first
    if (!formData.asset || !formData.targetPrice || !formData.deadline) {
      setError('Please fill in all required fields (Asset, Target Price, Deadline)');
      return;
    }

    // Validation for direction vs prices (only if current price is provided)
    if (formData.currentPrice) {
      const current = parseFloat(formData.currentPrice);
      const target = parseFloat(formData.targetPrice);

      if (formData.direction === 'reach' && current >= target) {
        setError('For "reach" prediction, current price should be below target price');
        return;
      }

      if (formData.direction === 'drop' && current <= target) {
        setError('For "drop" prediction, current price should be above target price');
        return;
      }
    }

    // Check if deadline is in the future
    const deadlineDate = new Date(formData.deadline);
    const now = new Date();
    if (deadlineDate <= now) {
      setError('Deadline must be in the future');
      return;
    }

    // Show stake modal
    setShowStakeModal(true);
  };

  const handleConfirmStake = async () => {
    setError('');
    setSuccess('');

    if (!selectedPosition) {
      setError('Please select your position (YES or NO)');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) < 1) {
      setError('Please enter a stake amount of at least 1 MAS');
      return;
    }

    if (!account) {
      setError('Wallet connection lost. Please reconnect your wallet');
      return;
    }

    setIsCreating(true);

    try {
      const marketData = {
        asset: formData.asset,
        direction: formData.direction,
        targetPrice: parseFloat(formData.targetPrice),
        currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : null,
        deadline: formData.deadline,
        dataSource: formData.dataSource,
        creatorPosition: selectedPosition,
        creatorStake: parseFloat(stakeAmount)
      };

      console.log('Creating market with data:', marketData);

      const result = await createMarket(marketData);
      
      console.log('Market creation result:', result);

      // Show success message
      setSuccess('Market created successfully!');
      
      // Close modal after a delay to show success message
      setTimeout(() => {
        setShowStakeModal(false);
        
        // Call onSubmit with the result for parent component to handle
        onSubmit({
          ...marketData,
          question: generateQuestion(),
          daysLeft: Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24)),
          operationId: result.operationId,
          marketId: result.marketId,
          success: true
        });
      }, 2000);

    } catch (err) {
      console.error('Error creating market:', err);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create market. Please try again.';
      
      if (err.message) {
        if (err.message.includes('insufficient')) {
          errorMessage = 'Insufficient balance. Please check your MAS balance.';
        } else if (err.message.includes('Wallet not connected')) {
          errorMessage = 'Wallet not connected. Please connect your wallet.';
        } else if (err.message.includes('rejected')) {
          errorMessage = 'Transaction was rejected by user.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <WizardContainer>
        {!account && (
          <WalletWarning>
            ⚠️ Please connect your wallet to create a prediction market
          </WalletWarning>
        )}

        <Frame boxShadow="in" padding="8px">
          <Fieldset legend="Prediction Market Setup">
            <TwoColumnGrid>
              <FormSection>
                <Label>Asset *</Label>
                <Input
                  value={formData.asset}
                  onChange={(e) => handleInputChange('asset', e.target.value)}
                  placeholder="e.g., MAS, BTC, ETH"
                  style={{ width: '100%' }}
                  disabled={!account}
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
                    background: account ? 'white' : '#f0f0f0',
                    fontSize: '11px'
                  }}
                  disabled={!account}
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
                      disabled={!account}
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
                      disabled={!account}
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
                  placeholder="e.g., 0.1"
                  style={{ width: '100%' }}
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={!account}
                />
              </FormSection>

              <FormSection>
                <Label>Current Price</Label>
                <Input
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                  placeholder="e.g., 0.03"
                  style={{ width: '100%' }}
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={!account}
                />
              </FormSection>

              <FormSection>
                <Label>Deadline *</Label>
                <Input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  style={{ width: '100%' }}
                  disabled={!account}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </FormSection>

              <FullWidthSection>
                <Label>Question Preview</Label>
                <PreviewText>
                  {generateQuestion()}
                </PreviewText>
              </FullWidthSection>

              {error && (
                <FullWidthSection>
                  <ErrorMessage>
                    {error}
                  </ErrorMessage>
                </FullWidthSection>
              )}
            </TwoColumnGrid>
          </Fieldset>
        </Frame>

        <ButtonGroup>
          <Button onClick={onCancel}>Cancel</Button>
          <Button 
            onClick={handleCreateMarket} 
            style={{ fontWeight: 'bold' }}
            disabled={!account}
          >
            Next
          </Button>
        </ButtonGroup>
      </WizardContainer>

      {/* Stake Modal */}
      {showStakeModal && (
        <ModalOverlay onClick={() => !isCreating && setShowStakeModal(false)}>
          <StakeModal onClick={(e) => e.stopPropagation()}>
            <StakeModalHeader>
              <span>Initialize Market - Set Your Position</span>
              <CloseButton 
                onClick={() => setShowStakeModal(false)}
                disabled={isCreating}
              >
                ×
              </CloseButton>
            </StakeModalHeader>
            
            <Frame boxShadow="in" padding="8px" style={{ marginBottom: '12px' }}>
              <Fieldset legend="Market Summary">
                <InfoRow>
                  <span>Question:</span>
                  <span style={{ fontWeight: 'bold', color: '#000080' }}>{generateQuestion()}</span>
                </InfoRow>
                <InfoRow>
                  <span>Asset:</span>
                  <span>{formData.asset}</span>
                </InfoRow>
                <InfoRow>
                  <span>Target Price:</span>
                  <span>${formData.targetPrice}</span>
                </InfoRow>
                <InfoRow>
                  <span>Deadline:</span>
                  <span>{new Date(formData.deadline).toUTCString()}</span>
                </InfoRow>
              </Fieldset>
            </Frame>

            <Frame boxShadow="in" padding="8px">
              <Fieldset legend="Initial Stake & Position">
                <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                  As the market creator, you must stake at least 1 MAS to initialize the market.
                </div>
                
                <Label>Choose Your Position:</Label>
                <PositionButtons>
                  <PositionButton
                    selected={selectedPosition === 'YES'}
                    onClick={() => setSelectedPosition('YES')}
                    disabled={isCreating}
                  >
                    YES
                  </PositionButton>
                  <PositionButton
                    selected={selectedPosition === 'NO'}
                    onClick={() => setSelectedPosition('NO')}
                    disabled={isCreating}
                  >
                    NO
                  </PositionButton>
                </PositionButtons>

                {selectedPosition && (
                  <>
                    <InputRow>
                      <InputLabel>Stake Amount:</InputLabel>
                      <Input
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        placeholder="1.00"
                        type="number"
                        step="0.01"
                        min="1"
                        style={{ flex: 1 }}
                        disabled={isCreating}
                      />
                      <span style={{ fontSize: '11px' }}>MAS</span>
                    </InputRow>
                    
                    {stakeAmount && (
                      <>
                        <CalculationRow>
                          <span>Your Position:</span>
                          <span style={{ fontWeight: 'bold', color: selectedPosition === 'YES' ? '#008000' : '#800000' }}>
                            {selectedPosition}
                          </span>
                        </CalculationRow>
                        <CalculationRow>
                          <span>Potential Payout (if win):</span>
                          <span>{parseFloat(stakeAmount || 0).toFixed(2)} MAS + winnings</span>
                        </CalculationRow>
                      </>
                    )} 
                  </>
                )}

                {error && (
                  <ErrorMessage>
                    {error}
                  </ErrorMessage>
                )}

                {success && (
                  <SuccessMessage>
                    {success}
                  </SuccessMessage>
                )}
              </Fieldset>
            </Frame>

            <ButtonGroup style={{ marginTop: '16px' }}>
              <Button 
                onClick={() => setShowStakeModal(false)}
                disabled={isCreating}
              >
                Back to Edit
              </Button>
              <Button 
                onClick={handleConfirmStake}
                style={{ 
                  backgroundColor: selectedPosition === 'YES' ? '#90EE90' : selectedPosition === 'NO' ? '#FFB6C1' : '#c0c0c0',
                  fontWeight: 'bold',
                  opacity: isCreating ? 0.7 : 1
                }}
                disabled={!selectedPosition || !stakeAmount || isCreating || !account}
              >
                {isCreating && <LoadingSpinner />}
                {isCreating ? 'Creating Market...' : 'Create Market'}
              </Button>
            </ButtonGroup>
          </StakeModal>
        </ModalOverlay>
      )}
    </>
  );
};

export default PredictionMarketWizard;