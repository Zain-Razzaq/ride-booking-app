// Pricing configuration
const PRICING_CONFIG = {
  basePrices: {
    bike: 50, // Base price in PKR
    car: 100,
    ricksha: 40,
  },
  pricePerKm: {
    bike: 15, // Price per kilometer in PKR
    car: 25,
    ricksha: 12,
  },
};

export const calculateTripFare = (distance, rideType) => {
  // Validate inputs
  if (!distance || distance <= 0) {
    throw new Error("Distance must be a positive number");
  }

  if (!rideType || !PRICING_CONFIG.basePrices[rideType]) {
    throw new Error("Invalid ride type");
  }

  // Calculate price components
  const basePrice = PRICING_CONFIG.basePrices[rideType];
  const distancePrice = distance * PRICING_CONFIG.pricePerKm[rideType];
  const totalPrice = Math.round(basePrice + distancePrice);

  return {
    distance,
    rideType,
    basePrice,
    distancePrice,
    totalPrice,
  };
};


export const getDistanceBetweenLocations = (fromLocation, toLocationId) => {
  if (!fromLocation || !fromLocation.distances) {
    throw new Error("Invalid from location or missing distances data");
  }

  let distance = 0;
  const toId = parseInt(toLocationId);

  // Check both Map and Object formats for compatibility
  if (
    fromLocation.distances.has &&
    fromLocation.distances.has(toId.toString())
  ) {
    distance = fromLocation.distances.get(toId.toString());
  } else if (fromLocation.distances[toId]) {
    distance = fromLocation.distances[toId];
  }

  if (distance === 0) {
    throw new Error("Distance not found between selected locations");
  }

  return distance;
};
