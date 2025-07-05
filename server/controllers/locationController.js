import { getAllLocations, getLocationById } from "../database/locations.js";
import {
  calculateTripFare,
  getDistanceBetweenLocations,
} from "../utils/pricingUtils.js";

// Get all locations
export const getLocations = async (req, res) => {
  try {
    const result = await getAllLocations();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve locations",
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result.locations,
      message: "Locations retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve locations",
      error: error.message,
    });
  }
};

// Calculate price based on distance and ride type
export const calculatePrice = async (req, res) => {
  try {
    const { fromLocationId, toLocationId, rideType } = req.query;

    if (!fromLocationId || !toLocationId || !rideType) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: fromLocationId, toLocationId, rideType",
      });
    }

    // Get locations from database
    const [fromLocationResult, toLocationResult] = await Promise.all([
      getLocationById(parseInt(fromLocationId)),
      getLocationById(parseInt(toLocationId)),
    ]);

    if (!fromLocationResult.success || !fromLocationResult.location) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup location",
      });
    }

    if (!toLocationResult.success || !toLocationResult.location) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination location",
      });
    }

    try {
      // Get distance using utility function
      const distance = getDistanceBetweenLocations(
        fromLocationResult.location,
        parseInt(toLocationId)
      );

      // Calculate price using utility function
      const priceData = calculateTripFare(distance, rideType);

      res.json({
        success: true,
        data: priceData,
        message: "Price calculated successfully",
      });
    } catch (priceError) {
      return res.status(400).json({
        success: false,
        message: priceError.message,
      });
    }
  } catch (error) {
    console.error("Price calculation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate price",
      error: error.message,
    });
  }
};
