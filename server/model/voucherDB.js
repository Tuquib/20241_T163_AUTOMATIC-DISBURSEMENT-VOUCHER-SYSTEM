// server/model/voucherDB.js
import mongoose from "mongoose";
import Counter from "./counter.js";

const voucherSchema = new mongoose.Schema({
  dvNumber: { type: Number, required: true, unique: true },
  fundCluster: { type: Number, required: true },
  voucherName: { type: String, required: true },
  staffEmail: { type: String, required: true },
  staffName: { type: String, required: true },
  driveFileId: { type: String },
  webViewLink: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Approved"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isLocked: { type: Boolean, default: false },
  lockedBy: { type: String },
  lockTimestamp: { type: Date }
});

// Pre-save middleware for auto-incrementing dvNumber and fundCluster
voucherSchema.pre("save", async function (next) {
  try {
    if (!this.dvNumber) {
      const dvCounter = await Counter.findOneAndUpdate(
        { name: "dvNumber" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.dvNumber = dvCounter.sequenceValue;
    }

    if (!this.fundCluster) {
      const fundClusterCounter = await Counter.findOneAndUpdate(
        { name: "fundCluster" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      this.fundCluster = fundClusterCounter.sequenceValue;
    }

    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
