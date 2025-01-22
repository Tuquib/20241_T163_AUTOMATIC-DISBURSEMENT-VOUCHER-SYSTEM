import express from "express";
import {
  checkAndLockVoucher,
  releaseLock,
  clearExpiredLocks
} from "../controller/voucherLockController.js";

const router = express.Router();

// Route to check and acquire a lock
router.post("/lock", checkAndLockVoucher);

// Route to release a lock
router.post("/release", releaseLock);

// Route to clear expired locks
router.post("/clear-expired", clearExpiredLocks);

export default router;
