import Trip from "./models/Trip.js";

// Create a new trip
export const createTrip = async (tripData) => {
  try {
    const trip = new Trip(tripData);
    await trip.save();
    return { success: true, trip };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get trips for a specific user
export const getUserTrips = async (userId, limit = null) => {
  try {
    let query = Trip.find({ userId }).sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(limit);
    }
    const trips = await query;
    return { success: true, trips };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get trips for a specific driver
export const getDriverTrips = async (driverId, limit = null) => {
  try {
    let query = Trip.find({ driverId }).sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(limit);
    }
    const trips = await query;
    return { success: true, trips };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get trip by ID
export const getTripById = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId);
    return { success: true, trip };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Update trip status
export const updateTripStatus = async (tripId, status, additionalData = {}) => {
  try {
    const updateData = { status, ...additionalData };

    // Add timestamps based on status
    if (status === "in_progress" && !additionalData.startTime) {
      updateData.startTime = new Date();
    } else if (status === "completed" && !additionalData.endTime) {
      updateData.endTime = new Date();
    }

    const trip = await Trip.findByIdAndUpdate(tripId, updateData, {
      new: true,
      runValidators: true,
    });
    return { success: true, trip };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Assign driver to trip
export const assignDriverToTrip = async (tripId, driverId) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { driverId, status: "accepted" },
      { new: true, runValidators: true }
    );
    return { success: true, trip };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get pending trips (for drivers to see available trips)
export const getPendingTrips = async () => {
  try {
    const trips = await Trip.find({ status: "pending" }).sort({
      createdAt: -1,
    });
    return { success: true, trips };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
