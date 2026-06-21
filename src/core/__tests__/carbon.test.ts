import { 
  calculateMonthlyEmissions, 
  calculateEcoScore, 
  calculateMoneySavedInr, 
  calculateGlobalScaleImpact 
} from '../utils/carbon';
import { OnboardingProfile } from '../types/sustainability';

describe('Carbon Calculation Engine Tests', () => {
  
  const sampleProfile: OnboardingProfile = {
    transportation: 'electric',
    diet: 'vegetarian',
    electricityMonthlyKwh: 200,
    waterMonthlyLiters: 8000,
    shoppingFrequency: 'average',
    wasteRecyclePercentage: 50,
  };

  test('should accurately calculate monthly emissions per category', () => {
    const emissions = calculateMonthlyEmissions(sampleProfile);
    
    // Electric commute baseline = 35kg CO2
    expect(emissions.transportation).toBe(35);
    
    // Vegetarian diet baseline = 60kg CO2
    expect(emissions.food).toBe(60);
    
    // Electricity emissions: 200 kWh * 0.82 kg/kWh = 164kg CO2
    expect(emissions.energy).toBe(164);

    // Waste calculations baseline: 40 - (50 * 0.32) + (8000 * 0.0003) = 24 + 2.4 = 26.4kg
    expect(emissions.waste).toBe(26.4);
  });

  test('should compute correct EcoScore metrics', () => {
    const score = calculateEcoScore(sampleProfile);
    
    // Standard profile expectations: 
    // Starts at 100
    // Electric: -3 points
    // Vegetarian: -3 points
    // Electricity (200kWh): -6 points
    // Shopping (average): -7 points
    // Waste (50%): -8 points
    // Total expected score: 100 - 3 - 3 - 6 - 7 - 8 = 73 points
    expect(score).toBe(73);
  });

  test('should translate resource savings to INR correctly', () => {
    // 50 kWh saved, 15L fuel saved, 500L water saved, 2 swaps
    // 50 * 8 = 400
    // 15 * 103 = 1545
    // 500 * 0.02 = 10
    // 2 * 150 = 300
    // Expected total: 400 + 1545 + 10 + 300 = 2255
    const money = calculateMoneySavedInr(50, 15, 500, 2);
    expect(money).toBe(2255);
  });

  test('should project accurate global impact stats scaled to 1,000,000 citizens', () => {
    // User saves 10kg CO2, 100L water
    const globalImpact = calculateGlobalScaleImpact(10, 100);
    
    // 10kg * 1,000,000 = 10,000,000 kg -> 10,000 metric tons
    expect(globalImpact.co2SavedTons).toBe(10000);
    
    // 10,000,000 kg / 22 kg per tree = 454545 trees
    expect(globalImpact.treesEquivalent).toBe(454545);
    
    // 100L * 1,000,000 = 100,000,000 Liters
    expect(globalImpact.waterSavedLiters).toBe(100000000);
  });

});
