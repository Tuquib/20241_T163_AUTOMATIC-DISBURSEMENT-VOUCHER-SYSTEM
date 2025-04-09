import mongoose from "mongoose";

const authenticationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "staff"],
    required: true,
  },
  picture: {
    type: String,
    required: false,
  },
  verificationCode: {
    type: String,
    required: false,
  },
  verificationCodeExpiry: {
    type: Date,
    required: false,
  },
  resetToken: {
    type: String,
    required: false,
  },
  resetTokenExpiry: {
    type: Date,
    required: false,
  }
});

const Authentication = mongoose.model("Authentication", authenticationSchema);

export default Authentication;
