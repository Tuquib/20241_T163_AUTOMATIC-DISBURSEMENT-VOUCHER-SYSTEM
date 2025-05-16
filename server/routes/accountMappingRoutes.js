import express from "express";
import {
  getDebitAccounts,
  createAccountMapping,
  updateAccountMapping,
  deleteAccountMapping,
  getAllCreditAccounts
} from "../controller/accountMappingController.js";

const router = express.Router();

// Get all credit accounts (for dropdown)
router.get("/", getAllCreditAccounts);

// Get debit accounts for a credit account
router.get("/:creditAccountTitle", getDebitAccounts);

// Create new account mapping
router.post("/", createAccountMapping);

// Update account mapping
router.put("/:creditAccountTitle", updateAccountMapping);

// Delete account mapping
router.delete("/:creditAccountTitle", deleteAccountMapping);

router.get("/test", (req, res) => res.send("Account mapping route works!"));

export default router; 