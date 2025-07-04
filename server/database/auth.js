import User from "./models/User.js";

// Create a new user
export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return { success: true, user };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: "Email already exists" };
    }
    return { success: false, message: error.message };
  }
};

// Find user by email
export const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Find user by ID
export const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
