const staffsController = require("../model/staffDB");

// Get all staff
const getStaffs = async (req, res) => {
  try {
    const staffs = await staffController.find();
    res.send(staffs);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving staff");
  }
};

// Get a single staff by ID
const getStaff = async (req, res) => {
  try {
    const staff = await staffController.findById(req.params.id);
    if (!staff) return res.status(404).send("staff not found");
    res.send(student);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error retrieving staff");
  }
};

// Create a new student
const postStaff = async (req, res) => {
  try {
    const staff = new staffsController(req.body);
    const savedStaff = await student.save();
    res.status(201).json(savedStaff); // Changed to 201 for created
  } catch (error) {
    console.log(error);
    res.status(400).send("Error saving staff");
  }
};

// Update staff by ID
const updateStaff = async (req, res) => {
  try {
    const updatedstaff = await staffController.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedstaff) return res.status(404).send("staff not found");
    res.status(200).json(updatedstaff);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error updating staff");
  }
};

// Delete a staff by ID
const deleteStaff = async (req, res) => {
  try {
    const deletedstaff = await staffController.findByIdAndDelete(req.params.id);
    if (!deletedstaff) return res.status(404).send("staff not found");
    res.status(200).send("staff deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting staff");
  }
};

module.exports = staffsController;
