import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  verifyToken,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/profile", verifyToken, getProfile);

export default router;
