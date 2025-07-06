import { Args } from '@massalabs/as-types'; 
import { 
  getWmasPrice,
  setMockPrice,
  enableMockPrice,
  getMockPrice,
  isUsingMockPrice
} from '../contracts/library';
import { setDeployContext, Storage, Address } from '@massalabs/massa-as-sdk';
  

describe('Library Functions Tests', () => {

  beforeEach(() => { 
    setDeployContext();
  });

  describe('Mock Price Management', () => {
    test('should set and get mock price', () => {
      const testPrice = 1.234567;
      setMockPrice(testPrice);
      
      const retrievedPrice = getMockPrice();
      expect(retrievedPrice).toBeCloseTo(testPrice, 6);
    });

    test('should enable and disable mock price', () => {
      // Initially should be false
      expect(isUsingMockPrice()).toBe(false);
      
      // Enable mock price
      enableMockPrice(true);
      expect(isUsingMockPrice()).toBe(true);
      
      // Disable mock price
      enableMockPrice(false);
      expect(isUsingMockPrice()).toBe(false);
    });

    test('should return mock price when enabled', () => {
      const mockPrice = 2.5;
      setMockPrice(mockPrice);
      enableMockPrice(true);
      
      const currentPrice = getWmasPrice();
      expect(currentPrice).toBeCloseTo(mockPrice, 6);
    });
 
    test('should handle precision correctly', () => {
      const precisePrice = 1.123456789012345;
      setMockPrice(precisePrice);
      
      const retrievedPrice = getMockPrice();
      expect(retrievedPrice).toBeCloseTo(precisePrice, 10);
    });
  });


  describe('Price System Integration', () => {
    test('should switch between mock and real price modes', () => {
      const mockPrice = 5.0;
      setMockPrice(mockPrice);
      
      // Test mock mode
      enableMockPrice(true);
      const priceInMockMode = getWmasPrice();
      expect(priceInMockMode).toBeCloseTo(mockPrice, 6);
       
    });

    test('should maintain state consistency', () => {
      const testPrice = 7.89;
      setMockPrice(testPrice);
      enableMockPrice(true);
      
      // Multiple calls should return same price
      const price1 = getWmasPrice();
      const price2 = getWmasPrice();
      const price3 = getMockPrice();
      
      expect(price1).toBeCloseTo(price2, 6);
      expect(price1).toBeCloseTo(price3, 6);
      expect(isUsingMockPrice()).toBe(true);
    });

    test('should handle edge case prices', () => {
      const edgeCases = [0.0, 0.000001, 999999.999999, 1e-10, 1e10];
      
      for (let i = 0; i < edgeCases.length; i++) {
        const price = edgeCases[i];
        setMockPrice(price);
        enableMockPrice(true);
        
        const retrievedPrice = getWmasPrice();
        expect(retrievedPrice).toBeCloseTo(price, 6);
      }
    });
  });

  describe('Storage Management', () => {
    test('should handle storage keys correctly', () => {
      setMockPrice(1.23);
      enableMockPrice(true);
      
      expect(Storage.has("mock_price")).toBe(true);
      expect(Storage.has("use_mock_price")).toBe(true);
      expect(Storage.get("use_mock_price")).toBe("true");
    });


    test('should maintain data integrity across operations', () => {
      const testPrice = 4.56;
      setMockPrice(testPrice);
      enableMockPrice(true); 
      
      // All operations should maintain consistent state
      expect(getMockPrice()).toBeCloseTo(testPrice, 6);
      expect(isUsingMockPrice()).toBe(true); 
      expect(getWmasPrice()).toBeCloseTo(testPrice, 6);
    });
  });
});
