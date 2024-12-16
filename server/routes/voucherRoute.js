import express from "express";
import {
  getVouchers,
  getVoucher,
  getNextDvNumber,
  getNextFundCluster,
  postVoucher,
  updateVoucher,
  deleteVoucher,
  getDriveVouchers,
  createStaffFolder,
} from "../controller/voucherController.js";

const router = express.Router();

// Get all vouchers (combined from Drive and DB)
router.get("/vouchers", getVouchers);

// Get single voucher
router.get("/vouchers/:id", getVoucher);

// Get next DV number
router.get("/nextDvNumber", getNextDvNumber);

// Get next fund cluster
router.get("/nextFundCluster", getNextFundCluster);

// Post a new voucher
router.post("/vouchers", postVoucher);

// Create staff folder
router.post("/vouchers/create-staff-folder", createStaffFolder);

// Update a voucher
router.patch("/vouchers/:id", updateVoucher);

// Delete a voucher
router.delete("/vouchers/:id", deleteVoucher);

export default router;
