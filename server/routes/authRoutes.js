import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  verifyToken,
} from "../controllers/authController.js";

/**
 * Auth Routes - User authentication endpoints
 */

const router = express.Router();

// Public routes
router.post("/register", register); // Create new user account
router.post("/login", login); // User login
router.post("/logout", logout); // User logout

// Protected routes (require authentication)
router.get("/profile", verifyToken, getProfile); // Get user profile

export default router;
