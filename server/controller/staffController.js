import Staff from "../model/staffDB.js"; // Ensure correct path

//Get staff
const getStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find();
    res.status(200).json(staffs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving staff");
  }
};

//Get staff by Id
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).send("Staff not found");
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving staff");
  }
};

//Create a Staff
const postStaff = async (req, res) => {
  try {
    const staff = new Staff(req.body);
    const savedStaff = await staff.save();
    res.status(201).json(savedStaff);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error saving staff");
  }
};

//Update Staff
const updateStaff = async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStaff) return res.status(404).send("Staff not found");
    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating staff");
  }
};

//Delete Staff
const deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) return res.status(404).send("Staff not found");
    res.status(200).send("Staff deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting staff");
  }
};

export { getStaffs, getStaff, postStaff, updateStaff, deleteStaff };
