import Voucher from "../model/voucherDB.js"; // Ensure correct path
import Counter from "../model/counter.js";
import { googleDriveService } from "../services/googleDriveService.js";

// Get All Vouchers (from MongoDB)
const getVouchers = async (req, res) => {
  try {
    const { staffEmail } = req.query;

    // If staffEmail is provided, filter by it, otherwise get all vouchers
    const query = staffEmail ? { staffEmail } : {};

    const vouchers = await Voucher.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .select("-__v"); // Exclude version key

    const formattedVouchers = vouchers.map((voucher) => ({
      id: voucher._id,
      name: voucher.voucherName,
      entityName: voucher.entityName,
      createdTime: voucher.createdAt,
      modifiedTime: voucher.updatedAt,
      status: voucher.status,
      webViewLink: voucher.webViewLink,
      dvNumber: voucher.dvNumber,
      fundCluster: voucher.fundCluster,
    }));

    res.status(200).json(formattedVouchers);
  } catch (error) {
    console.error("Error retrieving vouchers:", error);
    res.status(500).json({
      message: "Error retrieving vouchers",
      error: error.message,
    });
  }
};

// Get Voucher by ID
const getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).send("Voucher not found");
    res.status(200).json(voucher);
  } catch (error) {
    console.error("Error retrieving voucher:", error.message);
    res.status(500).send("Error retrieving voucher");
  }
};

// Get Next DV Number
const getNextDvNumber = async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "dvNumber" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    res.status(200).json({ dvNumber: counter.sequenceValue });
  } catch (error) {
    console.error("Error retrieving next DV number:", error.message);
    res.status(500).send("Error retrieving next DV number");
  }
};

const getNextFundCluster = async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "fundCluster" },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    res.status(200).json({ fundCluster: counter.sequenceValue });
  } catch (error) {
    console.error("Error retrieving next fund cluster:", error.message);
    res.status(500).send("Error retrieving next fund cluster");
  }
};

// Get Vouchers from Google Drive
const getDriveVouchers = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    await googleDriveService.initializeWithToken(token, req.query.staffEmail);
    const vouchers = await googleDriveService.listVouchers(
      req.query.staffEmail
    );
    res.status(200).json(vouchers);
  } catch (error) {
    console.error("Drive API Error:", error);
    res.status(500).json({
      message: "Error accessing Google Drive",
      details: error.message,
    });
  }
};

// Create a New Voucher
const postVoucher = async (req, res) => {
  try {
    const { accessToken, staffEmail, staffName, voucherData } = req.body;

    if (!accessToken || !staffEmail || !voucherData) {
      return res.status(400).json({
        error: "Missing required data",
        details: "Access token, staff email, and voucher data are required",
      });
    }

    try {
      // Create voucher in MongoDB first
      const newVoucher = await Voucher.create({
        dvNumber: voucherData.dvNumber,
        fundCluster: voucherData.fundCluster,
        entityName: voucherData.entityName,
        voucherName: `DV_${voucherData.dvNumber}_${voucherData.entityName}`,
        staffEmail,
        staffName,
        driveFileId: voucherData.driveFileId,
        webViewLink: voucherData.webViewLink,
        status: voucherData.status,
        createdAt: new Date(),
      });

      res.status(201).json({
        message: "Voucher created successfully",
        voucher: newVoucher,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(400).json({
        error: "Database error",
        details: dbError.message,
      });
    }
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({
      error: "Failed to create voucher",
      details: error.message,
    });
  }
};

// List Vouchers
const listVouchers = async (req, res) => {
  try {
    const { accessToken, staffEmail, staffName } = req.query;

    // Initialize Google Drive service with the user's token
    await googleDriveService.initializeWithToken(accessToken, staffEmail);

    // List vouchers for specific staff
    const vouchers = await googleDriveService.listVouchers(
      staffEmail,
      staffName
    );

    res.status(200).json(vouchers);
  } catch (error) {
    console.error("Error in listVouchers:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update a Voucher
const updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!voucher) return res.status(404).send("Voucher not found");
    res.status(200).json(voucher);
  } catch (error) {
    console.error("Error updating voucher:", error.message);
    res.status(400).send("Error updating voucher");
  }
};

// Delete a Voucher
const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).send("Voucher not found");
    res.status(200).json(voucher);
  } catch (error) {
    console.error("Error deleting voucher:", error.message);
    res.status(500).send("Error deleting voucher");
  }
};

// Create staff folder
const createStaffFolder = async (req, res) => {
  try {
    const { accessToken, staffEmail } = req.body;

    if (!accessToken || !staffEmail) {
      return res.status(400).json({
        error: "Missing required data",
        details: "Access token and staff email are required",
      });
    }

    const folderId = await googleDriveService.createStaffFolder(staffEmail, accessToken);

    res.status(200).json({ folderId });
  } catch (error) {
    console.error("Error creating staff folder:", error);
    res.status(500).json({
      error: "Failed to create staff folder",
      details: error.message,
    });
  }
};

export {
  getVouchers,
  getVoucher,
  getNextDvNumber,
  getNextFundCluster,
  postVoucher,
  listVouchers,
  updateVoucher,
  deleteVoucher,
  getDriveVouchers,
  createStaffFolder,
};
