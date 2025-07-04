import {
  createTrip,
  getUserTrips,
  getDriverTrips,
  getTripById,
  updateTripStatus,
  getPendingTrips,
} from "../database/trips.js";

// Helper function to calculate fare based on ride type
const calculateFare = (rideType) => {
  const baseFares = {
    bike: Math.floor(Math.random() * 6) + 5, // $5-10
    car: Math.floor(Math.random() * 16) + 10, // $10-25
    ricksha: Math.floor(Math.random() * 6) + 3, // $3-8
  };
  return baseFares[rideType] || 10;
};

// Book a new trip
export const bookTrip = async (req, res) => {
  try {
    const { fromLocationId, toLocationId, rideType } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!fromLocationId || !toLocationId || !rideType) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate ride type
    if (!["bike", "car", "ricksha"].includes(rideType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride type",
      });
    }

    // Calculate fare
    const fare = calculateFare(rideType);

    // Create trip
    const tripData = {
      userId,
      fromLocationId: parseInt(fromLocationId),
      toLocationId: parseInt(toLocationId),
      rideType,
      fare,
    };

    const result = await createTrip(tripData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
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
      message: "Internal server error",
    });
  }
};

// Get user's trips
export const getUserTripsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    const result = await getUserTrips(userId, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      trips: result.trips,
    });
  } catch (error) {
    console.error("Get user trips error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get driver's trips
export const getDriverTripsController = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    const result = await getDriverTrips(driverId, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      trips: result.trips,
    });
  } catch (error) {
    console.error("Get driver trips error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get trip details
export const getTripDetails = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    const result = await getTripById(tripId);

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

// Update trip status (for drivers)
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate status
    const validStatuses = ["accepted", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Get trip to verify access
    const tripResult = await getTripById(tripId);
    if (!tripResult.success || !tripResult.trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const trip = tripResult.trip;

    // For status updates, only the assigned driver or passenger can update
    if (
      trip.userId.toString() !== userId &&
      trip.driverId?.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const result = await updateTripStatus(tripId, status);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip: result.trip,
    });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get pending trips (for drivers)
export const getPendingTripsController = async (req, res) => {
  try {
    const result = await getPendingTrips();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      trips: result.trips,
    });
  } catch (error) {
    console.error("Get pending trips error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
