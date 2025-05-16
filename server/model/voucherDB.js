// server/model/voucherDB.js
import mongoose from "mongoose";
import Counter from "./counter.js";

const voucherSchema = new mongoose.Schema({
  dvNumber: { type: String, required: true, unique: true },
  fundCluster: { type: String, required: true },
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
      let dvCounter = await Counter.findOne({ name: "dvNumber" });
      let nextDvNumber = "Buksu-1";
      if (dvCounter && dvCounter.sequenceValue) {
        const match = dvCounter.sequenceValue.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10) + 1;
          nextDvNumber = `Buksu-${num}`;
        }
      }
      await Counter.findOneAndUpdate(
        { name: "dvNumber" },
        { sequenceValue: nextDvNumber },
        { new: true, upsert: true }
      );
      this.dvNumber = nextDvNumber;
    }

    if (!this.fundCluster) {
      let fundClusterCounter = await Counter.findOne({ name: "fundCluster" });
      let nextFundCluster = "Buksu-1";
      if (fundClusterCounter && fundClusterCounter.sequenceValue) {
        const match = fundClusterCounter.sequenceValue.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10) + 1;
          nextFundCluster = `Buksu-${num}`;
        }
      }
      await Counter.findOneAndUpdate(
        { name: "fundCluster" },
        { sequenceValue: nextFundCluster },
        { new: true, upsert: true }
      );
      this.fundCluster = nextFundCluster;
    }

    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
