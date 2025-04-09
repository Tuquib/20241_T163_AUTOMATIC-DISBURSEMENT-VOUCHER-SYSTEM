import { googleDriveService } from '../services/googleDriveService.js';
import Admin from '../model/adminDB.js';
import bcrypt from 'bcrypt';
import Notification from '../model/notificationDB.js'; // Added import statement for Notification model

// Admin login
const adminLogin = async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body.email);
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      console.log('Incorrect password for admin:', email);
      return res.status(401).json({ message: "Incorrect password" });
    }

    console.log('Admin logged in successfully:', email);
    res.status(200).json({ 
      message: "Login successful", 
      adminId: admin._id,
      email: admin.email 
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Initialize Google Drive for admin
const initializeAdminDrive = async (req, res) => {
  try {
    const { accessToken, email } = req.body;
    console.log('Initializing Google Drive for admin:', email);

    if (!accessToken) {
      console.log('No access token provided');
      return res.status(401).json({ message: 'No access token provided' });
    }

    if (email !== '2201102322@student.buksu.edu.ph') {
      console.log('Non-admin user tried to initialize drive:', email);
      return res.status(403).json({ message: 'Only admin can initialize drive' });
    }

    console.log('Using singleton Google Drive service instance');
    await googleDriveService.initializeWithToken(accessToken, email);
    
    console.log('Google Drive initialized successfully for admin:', email);
    res.status(200).json({ message: 'Drive initialized successfully' });
  } catch (error) {
    console.error('Error initializing Google Drive:', error);
    res.status(500).json({ 
      message: 'Error initializing Google Drive', 
      error: error.message 
    });
  }
};

// Get all admins
const getAdmins = async (req, res) => {
  try {
    console.log('Fetching all admins');
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error('Error retrieving admins:', error);
    res.status(500).json({ message: "Error retrieving admins", error: error.message });
  }
};


// Update admin
const updateAdmin = async (req, res) => {
  try {
    console.log('Updating admin:', req.params.id);
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAdmin) {
      console.log('Admin not found for update:', req.params.id);
      return res.status(404).json({ message: "Admin not found" });
    }
    console.log('Admin updated successfully:', req.params.id);
    res.json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    console.log('Deleting admin:', req.params.id);
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      console.log('Admin not found for deletion:', req.params.id);
      return res.status(404).json({ message: "Admin not found" });
    }
    console.log('Admin deleted successfully:', req.params.id);
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
};

// Get admin notifications
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      type: 'new_voucher'
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

export {
  adminLogin,
  initializeAdminDrive,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  getAdminNotifications
};
