import mongoose from "mongoose";

// Define the schema for the Task
const authenticationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Authentication = mongoose.model("Authentication", authenticationSchema);

export default Authentication;
