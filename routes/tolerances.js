import express from "express";
import Tolerance from "../models/Tolerance.js"; 

const router = express.Router();

// Get current tolerance settings
router.get("/", async (req, res) => {
  try {
    let tolerance = await Tolerance.findOne();

    // If no tolerance settings exist, create default ones
    if (!tolerance) {
      tolerance = new Tolerance({
        transmitterTolerance: 0.5,
        gaugeTolerance: 1,
        controlValveTolerance: 1,
        onOffValveTimeTolerance: 10,
        onOffValveFeedbackTolerance: 3,
        switchTolerance: 5,
        unit: "%",
      });
      await tolerance.save();
    }

    res.json(tolerance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update tolerance settings
router.put("/", async (req, res) => {
  try {
    const {
      transmitterTolerance,
      gaugeTolerance,
      controlValveTolerance,
      onOffValveTimeTolerance,
      onOffValveFeedbackTolerance,
      switchTolerance,
      unit,
    } = req.body;

    let tolerance = await Tolerance.findOne();

    if (tolerance) {
      // Update existing tolerance
      tolerance.transmitterTolerance =
        transmitterTolerance ?? tolerance.transmitterTolerance;
      tolerance.gaugeTolerance = gaugeTolerance ?? tolerance.gaugeTolerance;
      tolerance.controlValveTolerance =
        controlValveTolerance ?? tolerance.controlValveTolerance;
      tolerance.onOffValveTimeTolerance =
        onOffValveTimeTolerance ?? tolerance.onOffValveTimeTolerance;
      tolerance.onOffValveFeedbackTolerance =
        onOffValveFeedbackTolerance ?? tolerance.onOffValveFeedbackTolerance;
      tolerance.switchTolerance = switchTolerance ?? tolerance.switchTolerance;
      tolerance.unit = unit ?? tolerance.unit;
    } else {
      // Create new tolerance settings
      tolerance = new Tolerance({
        transmitterTolerance: transmitterTolerance ?? 0.5,
        gaugeTolerance: gaugeTolerance ?? 1,
        controlValveTolerance: controlValveTolerance ?? 1,
        onOffValveTimeTolerance: onOffValveTimeTolerance ?? 10,
        onOffValveFeedbackTolerance: onOffValveFeedbackTolerance ?? 3,
        switchTolerance: switchTolerance ?? 5,
        unit: unit ?? "%",
      });
    }

    await tolerance.save();
    res.json(tolerance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// module.exports = router;
export default router;
