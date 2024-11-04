const adminController = require("../model/adminDB");

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
