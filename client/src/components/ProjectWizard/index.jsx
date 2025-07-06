import React from 'react';
import { Button, Input, TextArea, Frame, Fieldset } from '@react95/core';
import styled from 'styled-components';

const WizardContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const FormSection = styled.div`
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

const ProjectWizard = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    question: '',
    description: '',
    category: 'price',
    deadline: '',
    threshold: '',
    metric: '',
    currentValue: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.question || !formData.description || !formData.deadline || !formData.threshold) {
      alert('Please fill in all required fields');
      return;
    }

    const marketData = {
      question: formData.question,
      description: formData.description,
      category: formData.category,
      deadline: formData.deadline,
      threshold: formData.threshold,
      metric: formData.metric || 'custom_metric',
      currentPrice: formData.currentValue || 'TBD',
      daysLeft: Math.ceil((new Date(formData.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    };

    onSubmit(marketData);
  };

  return (
    <WizardContainer>
      <Frame boxShadow="in" padding="8px">
        <Fieldset legend="Prediction Market Setup">
          <FormSection>
            <Label>Market Question *</Label>
            <Input
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="e.g., Will ETH reach $4000 by March 31st?"
              style={{ width: '100%' }}
            />
          </FormSection>

          <FormSection>
            <Label>Description *</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the prediction criteria and data source"
              rows={3}
              style={{ width: '100%', resize: 'none' }}
            />
          </FormSection>

          <FormSection>
            <Label>Category</Label>
            <Input
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="price, volume, network, adoption, liquidity"
              style={{ width: '100%' }}
            />
          </FormSection>

          <FormSection>
            <Label>Deadline *</Label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              style={{ width: '100%' }}
            />
          </FormSection>

          <FormSection>
            <Label>Threshold Value *</Label>
            <Input
              value={formData.threshold}
              onChange={(e) => handleInputChange('threshold', e.target.value)}
              placeholder="e.g., $4000, 1M USDC, 100 TPS"
              style={{ width: '100%' }}
            />
          </FormSection>

          <FormSection>
            <Label>Data Metric</Label>
            <Input
              value={formData.metric}
              onChange={(e) => handleInputChange('metric', e.target.value)}
              placeholder="e.g., dusa_eth_usdc_price, massa_daily_tps"
              style={{ width: '100%' }}
            />
          </FormSection>

          <FormSection>
            <Label>Current Value</Label>
            <Input
              value={formData.currentValue}
              onChange={(e) => handleInputChange('currentValue', e.target.value)}
              placeholder="Current metric value"
              style={{ width: '100%' }}
            />
          </FormSection>
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

export default ProjectWizard;
