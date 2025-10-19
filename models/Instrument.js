import mongoose from "mongoose";

const instrumentSchema = new mongoose.Schema({
  "Upper Equipment": String,
  Tag: String,
  LRV: Number,
  URV: String,
  Unit: String,
  "Valve Size": Number,
  "Switch Healthy SP": String,
  "Switch Active SP": String,
  "PCV SP": String,
  "Calibration sheet Form": String,
  Comment: String
});

export default mongoose.model("Instrument", instrumentSchema);
