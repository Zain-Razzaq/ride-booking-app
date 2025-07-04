import Trip from "./models/Trip.js";
import User from "./models/User.js";
import Location from "./models/Location.js";

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

// Helper function to populate trip with location names
const populateTripWithLocations = async (trip) => {
  let fromLocation, toLocation;

  try {
    // Try to get from database first
    [fromLocation, toLocation] = await Promise.all([
      Location.findOne({ id: trip.fromLocationId }),
      Location.findOne({ id: trip.toLocationId }),
    ]);
  } catch (error) {
    console.log(
      "Database connection failed, using hardcoded locations for trip population"
    );
  }

  // Fallback to hardcoded locations if database fails
  if (!fromLocation) {
    fromLocation = hardcodedLocations.find((l) => l.id === trip.fromLocationId);
  }
  if (!toLocation) {
    toLocation = hardcodedLocations.find((l) => l.id === trip.toLocationId);
  }

  // Handle both mongoose documents and lean objects
  const tripObject = trip.toObject ? trip.toObject() : trip;

  return {
    ...tripObject,
    fromLocationName: fromLocation?.name || "Unknown",
    toLocationName: toLocation?.name || "Unknown",
  };
};

// Create a new trip
export const createTrip = async (tripData) => {
  try {
    const trip = new Trip(tripData);
    await trip.save();

    // Populate user data
    await trip.populate("userId", "name email");

    // Add location names
    const tripWithLocations = await populateTripWithLocations(trip);

    return { success: true, trip: tripWithLocations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get user's trips with location names
export const getUserTrips = async (userId, limit = null) => {
  try {
    let query = Trip.find({ userId }).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    const trips = await query
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .lean();

    // Add location names to all trips
    const tripsWithLocations = await Promise.all(
      trips.map(populateTripWithLocations)
    );

    return { success: true, trips: tripsWithLocations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get driver's trips with location names
export const getDriverTrips = async (driverId, limit = null) => {
  try {
    let query = Trip.find({ driverId }).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    const trips = await query
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .lean();

    // Add location names to all trips
    const tripsWithLocations = await Promise.all(
      trips.map(populateTripWithLocations)
    );

    return { success: true, trips: tripsWithLocations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get trip by ID with location names
export const getTripById = async (tripId) => {
  try {
    const trip = await Trip.findById(tripId)
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .lean();

    if (!trip) {
      return { success: false, message: "Trip not found" };
    }

    // Add location names
    const tripWithLocations = await populateTripWithLocations(trip);

    return { success: true, trip: tripWithLocations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Update trip status
export const updateTripStatus = async (tripId, status, driverId = null) => {
  try {
    const updateData = { status };

    if (driverId) {
      updateData.driverId = driverId;
    }

    // Add timestamp fields based on status
    if (status === "in_progress") {
      updateData.startTime = new Date();
    } else if (status === "completed" || status === "cancelled") {
      updateData.endTime = new Date();
    }

    const trip = await Trip.findByIdAndUpdate(tripId, updateData, {
      new: true,
    })
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .lean();

    if (!trip) {
      return { success: false, message: "Trip not found" };
    }

    // Add location names
    const tripWithLocations = await populateTripWithLocations(trip);

    return { success: true, trip: tripWithLocations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get all pending trips with location names
export const getPendingTrips = async () => {
  try {
    const trips = await Trip.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .lean();

    // Add location names to all trips
    const tripsWithLocations = await Promise.all(
      trips.map(populateTripWithLocations)
    );

    return { success: true, trips: tripsWithLocations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get active trips (accepted, in_progress) with location names
export const getActiveTrips = async (userId, userRole) => {
  try {
    let query = {
      status: { $in: ["accepted", "in_progress"] },
    };

    // Filter based on user role
    if (userRole === "driver") {
      query.driverId = userId;
    } else {
      query.userId = userId;
    }

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("driverId", "name email")
      .lean();

    // Add location names and passenger/driver info
    const tripsWithLocations = await Promise.all(
      trips.map(async (trip) => {
        const tripWithLocations = await populateTripWithLocations(trip);

        // Add passenger/driver info for easier access in frontend
        return {
          ...tripWithLocations,
          passenger: tripWithLocations.userId,
          driver: tripWithLocations.driverId,
        };
      })
    );

    return { success: true, trips: tripsWithLocations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
