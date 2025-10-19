// routes/auth.js - COMPLETELY FIXED VERSION
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    console.log("🔍 Login attempt:", { email: req.body.email });
    console.log(
      "🔍 Environment check - Super admin email:",
      process.env.SUPER_ADMIN_EMAIL
    );
    console.log(
      "🔍 Environment check - Super admin password set:",
      !!process.env.SUPER_ADMIN_PASSWORD
    );

    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 🔥 SUPER ADMIN CHECK (with proper case handling)
    if (
      email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase() &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      console.log("🔐 Super admin login attempt detected!");

      // Find super admin in DB (case-insensitive)
      let superAdmin = await User.findOne({
        email: {
          $regex: new RegExp(`^${process.env.SUPER_ADMIN_EMAIL}$`, "i"),
        },
      });

      if (!superAdmin) {
        console.log("👑 Creating super admin account in database...");
        superAdmin = new User({
          email: process.env.SUPER_ADMIN_EMAIL.toLowerCase(),
          name: process.env.SUPER_ADMIN_NAME,
          password: process.env.SUPER_ADMIN_PASSWORD,
          role: "admin",
          isActive: true,
        });
        await superAdmin.save();
        console.log("✅ Super admin account created successfully");
      }

      // Update last login
      superAdmin.lastLogin = new Date();
      await superAdmin.save();

      const token = generateToken(superAdmin._id);

      console.log("✅ Super admin login successful");
      return res.json({
        message: "Super Admin login successful",
        user: {
          _id: superAdmin._id,
          email: superAdmin.email,
          name: superAdmin.name,
          role: superAdmin.role,
          isActive: superAdmin.isActive,
        },
        token,
      });
    }

    // 🔥 REGULAR USER LOGIN (separate from super admin check)
    console.log("🔍 Checking regular user in database...");
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      console.log("❌ User account is deactivated");
      return res.status(401).json({ message: "Account is deactivated" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    console.log("✅ Regular user login successful");
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    console.log("🔍 Signup attempt:", {
      email: req.body.email,
      name: req.body.name,
    });

    const { email, name, password } = req.body;

    // Input validation
    if (!email || !name || !password) {
      console.log("❌ Validation failed: Missing fields");
      return res
        .status(400)
        .json({ message: "Email, name, and password are required" });
    }

    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Prevent creation of super admin email through signup
    if (email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
      return res
        .status(400)
        .json({
          message: "This email is reserved. Please use a different email.",
        });
    }

    // Check if user already exists
    console.log("🔍 Checking if user exists...");
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create new user
    console.log("✅ Creating new user...");
    const user = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      password,
      role: "user",
    });

    const savedUser = await user.save();
    console.log("✅ User created successfully:", savedUser.email);

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", auth, (req, res) => {
  res.json({ message: "Logout successful" });
});

export default router;
