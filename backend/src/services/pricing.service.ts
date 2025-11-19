import axios from 'axios';

interface PricingFactors {
  distance: number; // in km
  duration: number; // in minutes
  vehicleType: string;
  time: Date;
  pickupLocation: [number, number];
  demandMultiplier?: number;
}

class PricingService {
  // Base rates for Nigeria (in Naira)
  private baseRates = {
    ECONOMY: { base: 500, perKm: 120, perMinute: 30 },
    COMFORT: { base: 800, perKm: 150, perMinute: 40 },
    XL: { base: 1200, perKm: 200, perMinute: 50 },
    BIKE: { base: 300, perKm: 80, perMinute: 20 },
  };

  private commission = 0.15; // 15%

  // AI-powered dynamic pricing
  async calculateDynamicFare(factors: PricingFactors) {
    const baseRate = this.baseRates[factors.vehicleType as keyof typeof this.baseRates];
    
    // Base calculation
    let fare = baseRate.base + 
               (factors.distance * baseRate.perKm) + 
               (factors.duration * baseRate.perMinute);

    // AI Factors
    const aiFactors = await this.calculateAIFactors(factors);
    
    // Apply AI multipliers
    fare *= aiFactors.timeMultiplier;
    fare *= aiFactors.demandMultiplier;
    fare *= aiFactors.weatherMultiplier;
    fare *= aiFactors.eventMultiplier;

    // Apply external demand multiplier if provided
    if (factors.demandMultiplier) {
      fare *= Math.min(factors.demandMultiplier, 2.5); // Cap at 2.5x
    }

    // Round to nearest 50 naira
    fare = Math.round(fare / 50) * 50;

    return {
      estimatedFare: fare,
      baseFare: baseRate.base,
      distanceCharge: factors.distance * baseRate.perKm,
      timeCharge: factors.duration * baseRate.perMinute,
      surgeMultiplier: aiFactors.demandMultiplier,
      platformCommission: fare * this.commission,
      driverEarnings: fare * (1 - this.commission),
      aiFactors,
    };
  }

  // Calculate AI-driven pricing factors
  private async calculateAIFactors(factors: PricingFactors) {
    const hour = factors.time.getHours();
    const dayOfWeek = factors.time.getDay();

    // Time-based multiplier (peak hours)
    let timeMultiplier = 1.0;
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      timeMultiplier = 1.2; // Rush hour
    } else if (hour >= 22 || hour <= 5) {
      timeMultiplier = 1.15; // Late night
    }

    // Demand multiplier (simulated AI - in production, use real data)
    const demandMultiplier = await this.calculateDemandScore(factors.pickupLocation);

    // Weather multiplier (check weather API)
    const weatherMultiplier = await this.getWeatherMultiplier(factors.pickupLocation);

    // Event multiplier (check for nearby events)
    const eventMultiplier = await this.getEventMultiplier(factors.pickupLocation, factors.time);

    return {
      timeMultiplier,
      demandMultiplier: Math.min(demandMultiplier, 2.5), // Cap at 2.5x
      weatherMultiplier,
      eventMultiplier,
      demandScore: demandMultiplier - 1, // 0 to 1.5
      supplyScore: 1 / demandMultiplier, // Inverse of demand
    };
  }

  // Calculate demand score based on ride requests vs available drivers
  private async calculateDemandScore(location: [number, number]): Promise<number> {
    // In production, query real-time data from database
    // For now, simulate with random factor
    const baseMultiplier = 1.0;
    const randomFactor = Math.random() * 0.5; // 0 to 0.5
    return baseMultiplier + randomFactor;
  }

  // Get weather conditions and adjust pricing
  private async getWeatherMultiplier(location: [number, number]): Promise<number> {
    try {
      const [lat, lon] = location;
      
      // Example using OpenWeather API
      const weatherKey = process.env.OPENWEATHER_API_KEY;
      if (!weatherKey) return 1.0;

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}`
      );

      const weather = response.data.weather[0].main;
      
      // Increase fare during bad weather
      if (weather === 'Rain' || weather === 'Thunderstorm') {
        return 1.3;
      } else if (weather === 'Drizzle') {
        return 1.15;
      }
      
      return 1.0;
    } catch (error) {
      return 1.0; // Default multiplier if API fails
    }
  }

  // Check for nearby events that might increase demand
  private async getEventMultiplier(location: [number, number], time: Date): Promise<number> {
    // In production, integrate with events API or database
    // Check for concerts, sports events, festivals, etc.
    
    // For now, return default
    return 1.0;
  }

  // Calculate referral discount
  calculateReferralDiscount(basefare: number, referralLevel: number): number {
    const discounts = {
      1: 0.1, // 10% off for first referral ride
      2: 0.15, // 15% off
      3: 0.2, // 20% off
    };
    
    const discount = discounts[referralLevel as keyof typeof discounts] || 0;
    return baseFare * discount;
  }
}

export default new PricingService();
