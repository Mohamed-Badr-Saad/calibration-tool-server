import express from "express";
import Engineer from "../models/Engineer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const engineers = await Engineer.find();
    res.json(engineers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const engineer = new Engineer(req.body);
    const savedEng = await engineer.save();
    res.status(201).json(savedEng);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEng = await Engineer.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEng) return res.status(404).json({ message: "Engineer not found" });
    res.json(updatedEng);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEng = await Engineer.findByIdAndDelete(id);
    if (!deletedEng) return res.status(404).json({ message: "Engineer not found" });
    res.json({ message: "Engineer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
