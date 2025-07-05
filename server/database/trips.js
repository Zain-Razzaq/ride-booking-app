import Trip from "./models/Trip.js";
import User from "./models/User.js";
import Location from "./models/Location.js";
import { getLocationById } from "./locations.js";

// Helper function to populate trip with location names
const populateTripWithLocations = async (trip) => {
  try {
    // Get location names from database
    const [fromLocationResult, toLocationResult] = await Promise.all([
      getLocationById(trip.fromLocationId),
      getLocationById(trip.toLocationId),
    ]);

    let fromLocation = null;
    let toLocation = null;

    if (fromLocationResult.success && fromLocationResult.location) {
      fromLocation = fromLocationResult.location;
    }

    if (toLocationResult.success && toLocationResult.location) {
      toLocation = toLocationResult.location;
    }

    // Add location names to trip object
    const tripObj = trip.toObject ? trip.toObject() : trip;
    tripObj.fromLocationName = fromLocation?.name || "Unknown Location";
    tripObj.toLocationName = toLocation?.name || "Unknown Location";

    return tripObj;
  } catch (error) {
    console.error("Error populating trip with locations:", error);
    // Return trip with default location names
    const tripObj = trip.toObject ? trip.toObject() : trip;
    tripObj.fromLocationName = "Unknown Location";
    tripObj.toLocationName = "Unknown Location";
    return tripObj;
  }
};

// Create a new trip
export const createTrip = async (tripData) => {
  try {
    const trip = new Trip(tripData);
    await trip.save();

    // Populate with location names
    const populatedTrip = await populateTripWithLocations(trip);

    return {
      success: true,
      trip: populatedTrip,
      message: "Trip created successfully",
    };
  } catch (error) {
    console.error("Error creating trip:", error);
    return {
      success: false,
      message: "Failed to create trip",
      error: error.message,
    };
  }
};

// Get trips for a specific user
export const getUserTrips = async (userId) => {
  try {
    const trips = await Trip.find({ userId })
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .sort({ createdAt: -1 });

    // Populate with location names
    const populatedTrips = await Promise.all(
      trips.map((trip) => populateTripWithLocations(trip))
    );

    return {
      success: true,
      trips: populatedTrips,
      message: "User trips retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting user trips:", error);
    return {
      success: false,
      message: "Failed to get user trips",
      error: error.message,
    };
  }
};

// Get trips for a specific driver
export const getDriverTrips = async (driverId) => {
  try {
    const trips = await Trip.find({ driverId })
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .sort({ createdAt: -1 });

    // Populate with location names
    const populatedTrips = await Promise.all(
      trips.map((trip) => populateTripWithLocations(trip))
    );

    return {
      success: true,
      trips: populatedTrips,
      message: "Driver trips retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting driver trips:", error);
    return {
      success: false,
      message: "Failed to get driver trips",
      error: error.message,
    };
  }
};

// Get a specific trip by ID
export const getTripById = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId)
      .populate("userId", "name email")
      .populate("driverId", "name email");

    if (!trip) {
      return {
        success: false,
        message: "Trip not found",
      };
    }

    // Populate with location names
    const populatedTrip = await populateTripWithLocations(trip);

    return {
      success: true,
      trip: populatedTrip,
      message: "Trip retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting trip by ID:", error);
    return {
      success: false,
      message: "Failed to get trip",
      error: error.message,
    };
  }
};

// Update trip status
export const updateTripStatus = async (tripId, status, driverId = null) => {
  try {
    const updateData = { status };

    if (driverId && status === "accepted") {
      updateData.driverId = driverId;
    }

    const trip = await Trip.findByIdAndUpdate(tripId, updateData, {
      new: true,
    })
      .populate("userId", "name email")
      .populate("driverId", "name email");

    if (!trip) {
      return {
        success: false,
        message: "Trip not found",
      };
    }

    // Populate with location names
    const populatedTrip = await populateTripWithLocations(trip);

    return {
      success: true,
      trip: populatedTrip,
      message: "Trip status updated successfully",
    };
  } catch (error) {
    console.error("Error updating trip status:", error);
    return {
      success: false,
      message: "Failed to update trip status",
      error: error.message,
    };
  }
};

// Get all pending trips
export const getPendingTrips = async () => {
  try {
    const trips = await Trip.find({ status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Populate with location names
    const populatedTrips = await Promise.all(
      trips.map((trip) => populateTripWithLocations(trip))
    );

    return {
      success: true,
      trips: populatedTrips,
      message: "Pending trips retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting pending trips:", error);
    return {
      success: false,
      message: "Failed to get pending trips",
      error: error.message,
    };
  }
};

// Get active trips for a user
export const getActiveTrips = async (userId) => {
  try {
    const trips = await Trip.find({
      $or: [{ userId: userId }, { driverId: userId }],
      status: { $in: ["accepted", "in_progress"] },
    })
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .sort({ createdAt: -1 });

    // Populate with location names
    const populatedTrips = await Promise.all(
      trips.map((trip) => populateTripWithLocations(trip))
    );

    return {
      success: true,
      trips: populatedTrips,
      message: "Active trips retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting active trips:", error);
    return {
      success: false,
      message: "Failed to get active trips",
      error: error.message,
    };
  }
};
