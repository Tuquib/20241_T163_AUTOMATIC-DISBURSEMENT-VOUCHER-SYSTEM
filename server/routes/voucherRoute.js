import express from "express";
import {
  getVouchers,
  getVoucher,
  postVoucher,
  deleteVoucher,
  updateVoucher,
  getNextDvNumber,
  getNextFundCluster,
  createStaffFolder,
  updateVoucherStatus,
} from "../controller/voucherController.js";

const router = express.Router();

// Get next DV number
router.get("/nextDvNumber", getNextDvNumber);

// Get next fund cluster
router.get("/nextFundCluster", getNextFundCluster);

// Get all vouchers (combined from Drive and DB)
router.get("/vouchers", getVouchers);

// Get single voucher
router.get("/vouchers/:id", getVoucher);

// Post a new voucher
router.post("/vouchers", postVoucher);

// Create staff folder
router.post("/vouchers/create-staff-folder", createStaffFolder);

// Update a voucher
router.patch("/vouchers/:id", updateVoucher);

// Update voucher status
router.patch("/vouchers/:id/status", updateVoucherStatus);

// Delete a voucher
router.delete("/vouchers/:id", deleteVoucher);

export default router;
