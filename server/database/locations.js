import Location from "./models/Location.js";

// Get all locations
export const getAllLocations = async () => {
  try {
    const locations = await Location.find().sort({ id: 1 });
    return { success: true, locations };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get location by ID
export const getLocationById = async (locationId) => {
  try {
    const location = await Location.findOne({ id: locationId });
    return { success: true, location };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Create multiple locations (for seeding)
export const createLocations = async (locationsData) => {
  try {
    await Location.insertMany(locationsData);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Check if locations exist
export const locationsExist = async () => {
  try {
    const count = await Location.countDocuments();
    return { success: true, exists: count > 0 };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
