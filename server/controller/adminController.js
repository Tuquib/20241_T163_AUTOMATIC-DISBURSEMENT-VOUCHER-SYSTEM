const adminController = require("../model/adminDB");
const bcrypt = require("bcrypt");

// Get all admin
const getAdmins = async (req, res) => {
  try {
    const admins = await adminController.find();
    res.send(admins);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving admin");
  }
};

// Get a single admin by ID
const getAdmin = async (req, res) => {
  try {
    const admin = await adminController.findById(req.params.id);
    if (!admin) return res.status(404).send("Admin not found");
    res.send(student);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving admin");
  }
};

const postAdmin = async (req, res) => {
  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // If credentials are correct, send a success response (or token if using authentication)
    res.status(200).json({ message: "Login successful", adminId: admin._id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Update admin by ID
const updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await adminController.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedadmin) return res.status(404).send("Admin not found");
    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error updating admin");
  }
};

// Delete a admin by ID
const deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await adminController.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) return res.status(404).send("Admin not found");
    res.status(200).send("Admin deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting admin");
  }
};

module.exports = adminController;
