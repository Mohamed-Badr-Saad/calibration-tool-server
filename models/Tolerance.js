import mongoose from "mongoose";

const toleranceSchema = new mongoose.Schema(
  {
    transmitterTolerance: {
      type: Number,
      required: true,
      default: 0.5,
    },
    gaugeTolerance: {
      type: Number,
      required: true,
      default: 1,
    },
    controlValveTolerance: {
      type: Number,
      required: true,
      default: 1,
    },
    onOffValveTimeTolerance: {
      type: Number,
      required: true,
      default: 10,
    },
    onOffValveFeedbackTolerance: {
      type: Number,
      required: true,
      default: 3,
    },
    switchTolerance: {
      type: Number,
      required: true,
      default: 5,
    },
    unit: {
      type: String,
      required: true,
      default: "%",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Tolerance", toleranceSchema);
