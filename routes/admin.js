// routes/admin.js - UPDATED FOR ANY ADMIN ACCESS
import express from "express";
import User from "../models/User.js";
import { adminAuth, superAdminAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper function to check if user can modify target user
const canModifyUser = (currentUser, targetUser) => {
  // Super admin can modify anyone
  if (currentUser.email === process.env.SUPER_ADMIN_EMAIL) {
    return { allowed: true };
  }

  // Regular admin restrictions
  if (currentUser.role === "admin") {
    // Cannot modify super admin
    if (targetUser.email === process.env.SUPER_ADMIN_EMAIL) {
      return {
        allowed: false,
        message: "Only super admin can modify super admin account",
      };
    }

    // Cannot create/modify other admins (unless they are super admin)
    if (targetUser.role === "admin") {
      return {
        allowed: false,
        message: "Only super admin can manage other admin accounts",
      };
    }

    return { allowed: true };
  }

  return { allowed: false, message: "Insufficient permissions" };
};

// @route GET /api/admin/users
// @desc Get all users (Any admin)
// @access Private (Admin)
router.get("/users", adminAuth, async (req, res) => {
  try {
    console.log("🔍 Admin fetching users:", req.user.email);

    let query = {};

    // If not super admin, filter out super admin from results
    if (req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      query.email = { $ne: process.env.SUPER_ADMIN_EMAIL };
    }

    const users = await User.find(query)
      .select("-password")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    console.log("✅ Users fetched:", users.length);
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/admin/users
// @desc Create new user (Any admin, with restrictions)
// @access Private (Admin)
router.post("/users", adminAuth, async (req, res) => {
  try {
    console.log("➕ Admin creating user:", req.user.email);

    const { email, name, password, role, jobTitle } = req.body;

    // Input validation
    if (!email || !name || !password || !role || !jobTitle) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!["engineer", "technician"].includes(jobTitle)) {
      return res.status(400).json({ message: "Invalid job title" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // 🔥 Permission check for creating admin users
    if (role === "admin" && req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return res.status(403).json({
        message: "Only super admin can create admin accounts",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const user = new User({
      email: email.toLowerCase(),
      name: name.trim(),
      password,
      role,
      createdBy: req.user._id,
      jobTitle: jobTitle,
    });

    await user.save();

    const populatedUser = await User.findById(user._id).populate(
      "createdBy",
      "name email"
    );

    console.log("✅ User created successfully:", populatedUser.email);
    res.status(201).json({
      message: "User created successfully",
      user: populatedUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route PUT /api/admin/users/:id
// @desc Update user (Any admin, with restrictions)
// @access Private (Admin)
router.put("/users/:id", adminAuth, async (req, res) => {
  try {
    console.log("✏️ Admin updating user:", req.user.email);

    const { id } = req.params;
    const { email, name, password, role, jobTitle } = req.body;

    // Find the user first
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Permission check
    const permissionCheck = canModifyUser(req.user, user);
    if (!permissionCheck.allowed) {
      return res.status(403).json({ message: permissionCheck.message });
    }

    // Additional check for role changes
    if (role === "admin" && req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return res.status(403).json({
        message: "Only super admin can assign admin role",
      });
    }

    // Update fields
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name.trim();
    if (role && ["admin", "user"].includes(role)) user.role = role;
    if (password && password.length >= 6) user.password = password;
    if (jobTitle) user.jobTitle = jobTitle;

    await user.save();

    const updatedUser = await User.findById(id).populate(
      "createdBy",
      "name email"
    );

    console.log("✅ User updated successfully:", updatedUser.email);
    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route PATCH /api/admin/users/:id/status
// @desc Toggle user active status (Any admin, with restrictions)
// @access Private (Admin)
router.patch("/users/:id/status", adminAuth, async (req, res) => {
  try {
    console.log("🔄 Admin toggling user status:", req.user.email);

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Permission check
    const permissionCheck = canModifyUser(req.user, user);
    if (!permissionCheck.allowed) {
      return res.status(403).json({ message: permissionCheck.message });
    }

    user.isActive = isActive;
    await user.save();

    console.log("✅ User status toggled:", user.email, isActive);
    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/admin/users/:id
// @desc Delete user (Any admin, with restrictions)
// @access Private (Admin)
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    console.log("🗑️ Admin deleting user:", req.user.email);

    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 Permission check
    const permissionCheck = canModifyUser(req.user, user);
    if (!permissionCheck.allowed) {
      return res.status(403).json({ message: permissionCheck.message });
    }

    await User.findByIdAndDelete(id);

    console.log("✅ User deleted successfully:", user.email);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
