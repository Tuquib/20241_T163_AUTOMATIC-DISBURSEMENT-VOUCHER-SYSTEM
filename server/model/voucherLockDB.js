import mongoose from "mongoose";

const voucherLockSchema = new mongoose.Schema({
    staffEmail: { type: String, required: true },
    lockTimestamp: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const VoucherLock = mongoose.model("VoucherLock", voucherLockSchema);
export default VoucherLock;
