import express from "express";
import Technician from "../models/Technician.js"; 

const router = express.Router();

// ✅ GET all technicians
router.get("/", async (req, res) => {
  try {
    const technicians = await Technician.find();
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ CREATE new technician
router.post("/", async (req, res) => {
  try {
    const technician = new Technician(req.body);
    const savedTech = await technician.save();
    res.status(201).json(savedTech);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ UPDATE technician by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTech = await Technician.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedTech) return res.status(404).json({ message: "Technician not found" });
    res.json(updatedTech);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE technician by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTech = await Technician.findByIdAndDelete(id);
    if (!deletedTech) return res.status(404).json({ message: "Technician not found" });
    res.json({ message: "Technician deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
