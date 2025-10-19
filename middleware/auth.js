// middleware/auth.js - COMPLETE MIDDLEWARE
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Basic auth middleware
export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Admin auth middleware
export const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});

    if (!req.user) {
      return res.status(401).json({ message: "Authorization denied" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(403).json({ message: "Admin access required" });
  }
};

// Super admin auth middleware
export const superAdminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});

    if (!req.user) {
      return res.status(401).json({ message: "Authorization denied" });
    }

    // Check if user is super admin
    if (req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return res.status(403).json({ message: "Super admin access required" });
    }

    next();
  } catch (error) {
    console.error("Super admin auth middleware error:", error);
    res.status(403).json({ message: "Super admin access required" });
  }
};
