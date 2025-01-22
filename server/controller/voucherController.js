import Voucher from "../model/voucherDB.js";
import Notification from "../model/notificationDB.js";
import Counter from "../model/counter.js";
import Staff from "../model/staffDB.js";
import { googleDriveService } from "../services/googleDriveService.js";

// Get All Vouchers (from MongoDB)
const getVouchers = async (req, res) => {
  try {
    const { staffEmail, isAdmin } = req.query;

    // If not admin and staffEmail is provided, filter by it
    const query = !isAdmin && staffEmail ? { staffEmail } : {};

    const vouchers = await Voucher.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .select("-__v"); // Exclude version key

    const formattedVouchers = vouchers.map((voucher) => ({
      id: voucher._id,
      name: voucher.voucherName,
      createdTime: voucher.createdAt,
      modifiedTime: voucher.updatedAt,
      status: voucher.status,
      webViewLink: voucher.webViewLink,
      dvNumber: voucher.dvNumber,
      fundCluster: voucher.fundCluster,
      driveFileId: voucher.driveFileId,
      staffEmail: voucher.staffEmail, // Add staffEmail to see who created the voucher
      staffName: voucher.staffName, // Add staffName to see who created the voucher
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
    console.log("Received request body:", JSON.stringify(req.body, null, 2));

    const { accessToken, staffEmail, staffName, voucherData } = req.body;

    if (!accessToken || !staffEmail || !voucherData) {
      console.log("Missing required fields:", {
        hasAccessToken: !!accessToken,
        hasStaffEmail: !!staffEmail,
        hasVoucherData: !!voucherData,
      });
      return res.status(400).json({
        error: "Missing required data",
        details: "Access token, staff email, and voucher data are required",
      });
    }

    try {
      console.log("Creating voucher with data:", {
        dvNumber: voucherData.dvNumber,
        fundCluster: voucherData.fundCluster,
        voucherName: voucherData.voucherName,
        staffEmail,
        staffName,
      });

      const voucher = new Voucher({
        dvNumber: voucherData.dvNumber,
        fundCluster: voucherData.fundCluster,
        voucherName: voucherData.voucherName,
        staffEmail,
        staffName,
        driveFileId: voucherData.driveFileId,
        webViewLink: voucherData.webViewLink,
        status: voucherData.status,
        createdAt: new Date(),
      });
      const savedVoucher = await voucher.save();

      // Create notification for admin
      const notification = new Notification({
        message: `New voucher created by ${staffName}`,
        type: "new_voucher",
        voucherId: savedVoucher._id,
        staffName: staffName,
        staffEmail: staffEmail,
      });
      await notification.save();

      res.status(201).json({
        message: "Voucher created successfully",
        voucher: savedVoucher,
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

// Update voucher status
const updateVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Updating voucher status:", { id, status, body: req.body });

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: "Voucher ID is required" });
    }

    // Validate status
    if (!status || !["Pending", "Approved"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status value. Status must be either 'Pending' or 'Approved'.",
        receivedStatus: status,
      });
    }

    // Use findByIdAndUpdate to update the status
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      { new: true, runValidators: true }
    );

    if (!updatedVoucher) {
      console.log("Voucher not found:", id);
      return res.status(404).json({ message: "Voucher not found" });
    }

    console.log("Updated voucher:", updatedVoucher);

    // Create notification for staff when voucher is approved
    if (status === "Approved") {
      const notification = new Notification({
        message: `Your voucher DV_${updatedVoucher.dvNumber} has been approved`,
        type: "voucher_approved",
        voucherId: updatedVoucher._id,
        staffName: updatedVoucher.staffName,
        staffEmail: updatedVoucher.staffEmail,
        read: false,
      });
      await notification.save();
    }

    res.status(200).json({
      message: "Voucher status updated successfully",
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("Error updating voucher status:", error);
    res.status(500).json({
      message: "Error updating voucher status",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Delete a Voucher
const deleteVoucher = async (req, res) => {
  try {
    const { fileId, isAdmin, accessToken, staffEmail } = req.query;
    const voucherId = req.params.id;

    console.log("Deleting voucher:", {
      voucherId,
      fileId,
      hasAccessToken: !!accessToken,
    });

    // First find the voucher to get staff email
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found in database" });
    }

    // Check if staff is authorized to delete this voucher
    if (!isAdmin && voucher.staffEmail !== staffEmail) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this voucher" });
    }

    // Delete from MongoDB
    const deletedVoucher = await Voucher.findByIdAndDelete(voucherId);

    // Delete associated notifications
    await Notification.deleteMany({ voucherId: voucherId });

    // Delete from Google Drive if fileId exists
    let driveDeleteSuccess = false;
    if (fileId) {
      try {
        if (isAdmin) {
          // If admin, try deleting with service account directly
          await googleDriveService.deleteFileAsAdmin(fileId);
          driveDeleteSuccess = true;
          console.log(
            "Successfully deleted file from Google Drive using admin service account"
          );
        } else if (accessToken) {
          // If staff, try with their token first
          try {
            await googleDriveService.initializeWithToken(
              accessToken,
              staffEmail
            );
            await googleDriveService.deleteFile(fileId);
            driveDeleteSuccess = true;
            console.log("Successfully deleted file from Google Drive");
          } catch (driveError) {
            // If staff token fails, try with admin as backup
            console.error(
              "Error deleting with staff token:",
              driveError.message
            );
            await googleDriveService.deleteFileAsAdmin(fileId);
            driveDeleteSuccess = true;
            console.log(
              "Successfully deleted file from Google Drive using admin service account (fallback)"
            );
          }
        }
      } catch (finalError) {
        console.error("Final error in deletion process:", finalError.message);
        return res.status(500).json({
          message: "Failed to delete file from Google Drive",
          error: finalError.message,
        });
      }
    }

    res.status(200).json({
      message: `Voucher deleted successfully from database${
        driveDeleteSuccess ? " and Google Drive" : ""
      }`,
      deletedVoucher,
      driveDeleteSuccess,
    });
  } catch (error) {
    console.error("Error deleting voucher:", error);
    res.status(500).json({
      message: "Error deleting voucher",
      error: error.message,
    });
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

    const folderId = await googleDriveService.createStaffFolder(
      staffEmail,
      accessToken
    );

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
  updateVoucherStatus,
  deleteVoucher,
  getDriveVouchers,
  createStaffFolder,
};
