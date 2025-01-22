import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  contactNumber: { type: Number, required: true, match: /^[0-9]+$/ },
  email: { type: String, required: true, unique: true },
  accessToken: { type: String },
  tokenExpiry: { type: Date },
  picture: { type: String }
});

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
