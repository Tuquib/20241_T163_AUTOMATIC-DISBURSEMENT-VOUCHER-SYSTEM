import mongoose from "mongoose";

// Counter schema to track last used numbers for dvNumber and fundCluster
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "dvNumber" or "fundCluster"
  sequenceValue: { type: String, required: true }, // The current sequence value
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
