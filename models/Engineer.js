import mongoose from "mongoose";

const engineerSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

export default mongoose.model("Engineer", engineerSchema);
