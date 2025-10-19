import express from "express";
import Instrument from "../models/Instrument.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const instruments = await Instrument.find();
    res.json(instruments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const engineer = new Instrument(req.body);
    const savedInstrument = await engineer.save();
    res.status(201).json(savedInstrument);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInstrument = await Instrument.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedInstrument) return res.status(404).json({ message: "Instrument not found" });
    res.json(updatedInstrument);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInstrument = await Instrument.findByIdAndDelete(id);
    if (!deletedInstrument) return res.status(404).json({ message: "Instrument not found" });
    res.json({ message: "Instrument deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
