import {
  createTrip as dbCreateTrip,
  getUserTrips as dbGetUserTrips,
  getDriverTrips as dbGetDriverTrips,
  getTripById as dbGetTripById,
  updateTripStatus as dbUpdateTripStatus,
  getPendingTrips as dbGetPendingTrips,
  getActiveTrips as dbGetActiveTrips,
} from "../database/trips.js";
import { getLocationById } from "../database/locations.js";

// Hardcoded locations as fallback
const hardcodedLocations = [
  { id: 1, name: "City Center", address: "Main Street, Downtown" },
  { id: 2, name: "Airport", address: "Allama Iqbal International Airport" },
  { id: 3, name: "Train Station", address: "Lahore Railway Station" },
  { id: 4, name: "Emporium Mall", address: "Johar Town" },
  { id: 5, name: "University", address: "University of Lahore" },
  { id: 6, name: "Jinnah Hospital", address: "Jinnah Hospital" },
  { id: 7, name: "Gadaffi Stadium", address: "Gadaffi Stadium" },
  { id: 8, name: "Faisal Town", address: "Faisal Town" },
  { id: 9, name: "DHA Raya", address: "DHA Raya" },
  { id: 10, name: "Lake City", address: "Lake City" },
];

// Helper function to validate location (with fallback)
const validateLocation = async (locationId) => {
  try {
    const result = await getLocationById(locationId);
    if (result.success && result.location) {
      return { success: true, location: result.location };
    }
  } catch (error) {
    console.log("Database validation failed, using hardcoded validation");
  }

  // Fallback to hardcoded locations
  const location = hardcodedLocations.find((l) => l.id === locationId);
  if (location) {
    return { success: true, location };
  }

  return { success: false, location: null };
};

// Helper function to calculate fare based on ride type
const calculateFare = (rideType) => {
  const baseRates = {
    bike: 8,
    car: 12,
    ricksha: 6,
  };

  const multiplier = Math.random() * 0.5 + 0.75; // 0.75 to 1.25 multiplier
  return Math.round(baseRates[rideType] * multiplier);
};

// Book a new trip
export const bookTrip = async (req, res) => {
  try {
    const { fromLocationId, toLocationId, rideType } = req.body;
    const userId = req.user.userId;

    // Validate locations exist
    const [fromLocationResult, toLocationResult] = await Promise.all([
      validateLocation(fromLocationId),
      validateLocation(toLocationId),
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

    // Prevent same pickup and destination
    if (fromLocationId === toLocationId) {
      return res.status(400).json({
        success: false,
        message: "Pickup and destination cannot be the same",
      });
    }

    // Calculate fare
    const fare = calculateFare(rideType);

    // Create trip
    const tripData = {
      userId,
      fromLocationId,
      toLocationId,
      rideType,
      fare,
    };

    const result = await dbCreateTrip(tripData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to book trip",
        error: result.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Trip booked successfully",
      trip: result.trip,
    });
  } catch (error) {
    console.error("Book trip error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book trip",
      error: error.message,
    });
  }
};

// Get user's trips
export const getUserTrips = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || null;

    const result = await dbGetUserTrips(userId, limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to get trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      trips: result.trips,
      message: "Trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get user trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trips",
      error: error.message,
    });
  }
};

// Get driver's trips
export const getDriverTrips = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const limit = parseInt(req.query.limit) || null;

    const result = await dbGetDriverTrips(driverId, limit);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to get trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      trips: result.trips,
      message: "Trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get driver trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trips",
      error: error.message,
    });
  }
};

// Get trip details
export const getTripDetails = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    const result = await dbGetTripById(tripId);

    if (!result.success || !result.trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check if user has access to this trip (either as passenger or driver)
    const trip = result.trip;
    if (
      trip.userId.toString() !== userId &&
      trip.driverId?.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      trip: result.trip,
    });
  } catch (error) {
    console.error("Get trip details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update trip status
export const updateTripStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    // Get trip details
    const tripResult = await dbGetTripById(tripId);
    if (!tripResult.success || !tripResult.trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const trip = tripResult.trip;

    // Check if user is authorized to update this trip
    const isPassenger = trip.userId._id.toString() === userId;
    const isDriver = trip.driverId && trip.driverId._id.toString() === userId;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this trip",
      });
    }

    // Update trip status
    const result = await dbUpdateTripStatus(tripId, status);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to update trip status",
        error: result.message,
      });
    }

    res.json({
      success: true,
      message: "Trip status updated successfully",
      trip: result.trip,
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

// Get all pending trips (for drivers)
export const getPendingTrips = async (req, res) => {
  try {
    const result = await dbGetPendingTrips();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to get pending trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      trips: result.trips,
      message: "Pending trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get pending trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending trips",
      error: error.message,
    });
  }
};

// Accept a trip (driver only)
export const acceptTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const driverId = req.user.userId;

    // Get trip details
    const tripResult = await dbGetTripById(tripId);
    if (!tripResult.success || !tripResult.trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const trip = tripResult.trip;

    // Check if trip is still pending
    if (trip.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Trip is no longer available",
      });
    }

    // Accept the trip
    const result = await dbUpdateTripStatus(tripId, "accepted", driverId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to accept trip",
        error: result.message,
      });
    }

    res.json({
      success: true,
      message: "Trip accepted successfully",
      trip: result.trip,
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

// Get active trips
export const getActiveTrips = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const result = await dbGetActiveTrips(userId, userRole);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to get active trips",
        error: result.message,
      });
    }

    res.json({
      success: true,
      trips: result.trips,
      message: "Active trips retrieved successfully",
    });
  } catch (error) {
    console.error("Get active trips error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active trips",
      error: error.message,
    });
  }
};
