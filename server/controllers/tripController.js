import {
  createTrip,
  getUserTrips,
  getDriverTrips,
  getTripById,
  updateTripStatus,
  getPendingTrips,
  getActiveTrips,
} from "../database/trips.js";
import { getLocationById } from "../database/locations.js";
import {
  calculateTripFare,
  getDistanceBetweenLocations,
} from "../utils/pricingUtils.js";

/**
 * Trip Controller - Handles all trip-related operations
 */

// Create a new trip with distance-based pricing
export const bookTrip = async (req, res) => {
  try {
    const { fromLocationId, toLocationId, rideType } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!fromLocationId || !toLocationId || !rideType) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: fromLocationId, toLocationId, rideType",
      });
    }

    // Validate locations exist in database
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

    // Prevent same location booking
    if (fromLocationId === toLocationId) {
      return res.status(400).json({
        success: false,
        message: "Pickup and destination cannot be the same",
      });
    }

    try {
      // Get distance and calculate fare using utility functions
      const distance = getDistanceBetweenLocations(
        fromLocationResult.location,
        parseInt(toLocationId)
      );

      const priceData = calculateTripFare(distance, rideType);

      // Create trip
      const result = await createTrip({
        userId,
        fromLocationId: parseInt(fromLocationId),
        toLocationId: parseInt(toLocationId),
        rideType,
        fare: priceData.totalPrice,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to book trip",
          error: result.message,
        });
      }

      res.status(201).json({
        success: true,
        data: result.trip,
        message: "Trip booked successfully",
      });
    } catch (priceError) {
      return res.status(400).json({
        success: false,
        message: "Failed to calculate fare: " + priceError.message,
      });
    }
  } catch (error) {
    console.error("Book trip error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book trip",
      error: error.message,
    });
  }
};

// Retrieve all trips for a specific user
export const getUserTripsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getUserTrips(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result.trips,
      message: "User trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get user trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user trips",
      error: error.message,
    });
  }
};

// Retrieve all trips for a specific driver
export const getDriverTripsController = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const result = await getDriverTrips(driverId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch driver trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result.trips,
      message: "Driver trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get driver trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch driver trips",
      error: error.message,
    });
  }
};

// Retrieve all trips awaiting driver acceptance
export const getPendingTripsController = async (req, res) => {
  try {
    const result = await getPendingTrips();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pending trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result.trips,
      message: "Pending trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get pending trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending trips",
      error: error.message,
    });
  }
};

// Retrieve all trips currently in progress
export const getActiveTripsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getActiveTrips(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch active trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result.trips,
      message: "Active trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get active trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active trips",
      error: error.message,
    });
  }
};

// Driver accepts a pending trip request
export const acceptTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const driverId = req.user.userId;

    // Get the trip first
    const tripResult = await getTripById(tripId);

    if (!tripResult.success || !tripResult.trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const trip = tripResult.trip;

    // Check if trip is pending
    if (trip.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Trip is not available for acceptance",
      });
    }

    // Accept the trip
    const result = await updateTripStatus(tripId, "accepted", driverId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to accept trip",
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result.trip,
      message: "Trip accepted successfully",
    });
  } catch (error) {
    console.error("Accept trip error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept trip",
      error: error.message,
    });
  }
};

// Update trip status (accepted, in_progress, completed, cancelled)
export const updateTripStatusController = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate status
    const validStatuses = [
      "pending",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip status",
      });
    }

    // Get the trip first
    const tripResult = await getTripById(tripId);

    if (!tripResult.success || !tripResult.trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const trip = tripResult.trip;

    // Check authorization
    const isPassenger =
      trip.userId?._id?.toString() === userId ||
      trip.userId?.toString() === userId;
    const isDriver =
      trip.driverId?._id?.toString() === userId ||
      trip.driverId?.toString() === userId;

    console.log("Is passenger?", isPassenger);
    console.log("Is driver?", isDriver);

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this trip",
      });
    }

    // Update trip status
    const result = await updateTripStatus(tripId, status, trip.driverId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update trip status",
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result.trip,
      message: "Trip status updated successfully",
    });
  } catch (error) {
    console.error("Update trip status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update trip status",
      error: error.message,
    });
  }
};
