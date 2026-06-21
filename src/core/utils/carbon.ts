import { OnboardingProfile } from '../types/sustainability';

// India-specific emission factors (kg CO2e)
export const EMISSION_FACTORS = {
  // Monthly carbon emissions
  transportation: {
    none: 0,
    electric: 35,
    hybrid: 90,
    combustion: 220,
    public_transit: 25,
  },
  diet: {
    vegan: 30,
    vegetarian: 60,
    pescatarian: 85,
    flexitarian: 110,
    meat_heavy: 210,
  },
  electricityKwh: 0.82, // India grid average (kg CO2 per kWh)
  waterLiter: 0.0003, // Water pumping & filtration factor
  shopping: {
    minimal: 20,
    average: 65,
    frequent: 150,
  },
  wasteBaseline: 40, // Base waste carbon weight
};

// Savings parameters (INR values per unit saved)
export const SAVINGS_RATES_INR = {
  electricityKwh: 8.00, // ₹8.00 per kWh
  fuelLiter: 103.00,    // ₹103.00 per Liter (approx petrol price)
  waterLiter: 0.02,     // ₹20.00 per kL (₹0.02/L)
  sustainableSwap: 150, // ₹150.00 saved/earned per habit swap (reduced shopping/home cooking)
};

/**
 * Calculate carbon emissions in kg CO2e per month for each category
 */
export function calculateMonthlyEmissions(profile: OnboardingProfile) {
  const transportation = EMISSION_FACTORS.transportation[profile.transportation] || 0;
  const food = EMISSION_FACTORS.diet[profile.diet] || 0;
  const energy = profile.electricityMonthlyKwh * EMISSION_FACTORS.electricityKwh;
  const waste = Math.max(8, EMISSION_FACTORS.wasteBaseline - (profile.wasteRecyclePercentage * 0.32));
  const shopping = EMISSION_FACTORS.shopping[profile.shoppingFrequency] || 0;
  const water = profile.waterMonthlyLiters * EMISSION_FACTORS.waterLiter;

  return {
    transportation: parseFloat(transportation.toFixed(1)),
    energy: parseFloat(energy.toFixed(1)),
    food: parseFloat(food.toFixed(1)),
    shopping: parseFloat(shopping.toFixed(1)),
    waste: parseFloat((waste + water).toFixed(1)),
  };
}

/**
 * Calculate EcoScore (0-100) based on sustainability profile
 */
export function calculateEcoScore(profile: OnboardingProfile): number {
  let score = 100;

  // 1. Transportation (max 25 points)
  if (profile.transportation === 'combustion') score -= 20;
  else if (profile.transportation === 'hybrid') score -= 10;
  else if (profile.transportation === 'electric') score -= 3;
  else if (profile.transportation === 'public_transit') score -= 2;

  // 2. Diet (max 25 points)
  if (profile.diet === 'meat_heavy') score -= 20;
  else if (profile.diet === 'flexitarian') score -= 12;
  else if (profile.diet === 'pescatarian') score -= 8;
  else if (profile.diet === 'vegetarian') score -= 3;

  // 3. Electricity (max 20 points)
  // standard average is ~200 kWh per month for a household
  if (profile.electricityMonthlyKwh > 400) score -= 18;
  else if (profile.electricityMonthlyKwh > 250) score -= 12;
  else if (profile.electricityMonthlyKwh > 120) score -= 6;

  // 4. Shopping (max 15 points)
  if (profile.shoppingFrequency === 'frequent') score -= 13;
  else if (profile.shoppingFrequency === 'average') score -= 7;

  // 5. Waste (max 15 points)
  const recyclePercent = profile.wasteRecyclePercentage;
  if (recyclePercent <= 20) score -= 12;
  else if (recyclePercent <= 50) score -= 8;
  else if (recyclePercent < 80) score -= 3;

  return Math.max(10, Math.min(100, score));
}

/**
 * Translate user savings in resources to money saved (INR)
 */
export function calculateMoneySavedInr(
  electricityKwh: number,
  fuelLiters: number,
  waterLiters: number,
  swapsCount: number
): number {
  return parseFloat(
    (
      electricityKwh * SAVINGS_RATES_INR.electricityKwh +
      fuelLiters * SAVINGS_RATES_INR.fuelLiter +
      waterLiters * SAVINGS_RATES_INR.waterLiter +
      swapsCount * SAVINGS_RATES_INR.sustainableSwap
    ).toFixed(2)
  );
}

/**
 * Scale local user reductions to global statistics (for 1,000,000 citizens)
 */
export function calculateGlobalScaleImpact(userCo2SavedKg: number, userWaterSavedLiters: number) {
  const activeCitizens = 1000000;
  
  // 1 Million Citizen CO2 saved in Kg -> Convert to metric tons (1 ton = 1000 kg)
  const globalCo2SavedTons = (userCo2SavedKg * activeCitizens) / 1000;
  
  // 1 Tree absorbs roughly 22kg CO2 per year
  const treesEquivalent = (userCo2SavedKg * activeCitizens) / 22;
  
  // Global Water Saved in Liters
  const globalWaterSavedLiters = userWaterSavedLiters * activeCitizens;
  
  return {
    co2SavedTons: Math.round(globalCo2SavedTons),
    treesEquivalent: Math.round(treesEquivalent),
    waterSavedLiters: Math.round(globalWaterSavedLiters),
  };
}
