export const mockMarkets = [
  {
    id: 'market-1',
    question: 'Will MAS/USDC.e on Dusa DEX reach 0.0135 by March 31st?',
    description: 'Prediction based on Dusa DEX MAS/USDC.e pair price data',
    category: 'price',
    deadline: 'July 31, 2025',
    daysLeft: 20,
    currentPrice: '0.013339',
    threshold: '$4,000',
    totalPool: 1250,
    yesShares: 650,
    noShares: 600,
    yesPrice: 0.52,
    noPrice: 0.48,
    metric: 'dusa_mas_usdc_price',
    status: 'active',
    position: { x: 100, y: 80 }
  }
   
];

export const categoryIcons = {
  price: 'InfoBubble',
  volume: 'InfoBubble', 
  network: 'InfoBubble',
  adoption: 'InfoBubble',
  liquidity: 'InfoBubble',
  default: 'InfoBubble'
};

export const mockProjects = mockMarkets; // Keep backward compatibility
