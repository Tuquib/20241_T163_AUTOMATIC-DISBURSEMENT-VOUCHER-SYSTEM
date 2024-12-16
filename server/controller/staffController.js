import Staff from "../model/staffDB.js";
import Authentication from "../model/authenticationDB.js";
import bcrypt from "bcrypt";
import { sendStaffInvitation } from "../services/emailService.js";

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

//Get staff by email
const getStaffByEmail = async (req, res) => {
  try {
    const staff = await Staff.findOne({ email: req.params.email });
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
    // First check if email exists in Staff collection
    const existingStaff = await Staff.findOne({ email: req.body.email });
    if (existingStaff) {
      return res.status(400).json({ error: "Staff with this email already exists" });
    }

    // Find authentication record
    const existingAuth = await Authentication.findOne({
      email: req.body.email,
    });

    // Generate a temporary password and hash it
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Create staff record
    const staff = new Staff(req.body);
    const savedStaff = await staff.save();

    // If authentication record exists, update it. Otherwise create new one.
    if (existingAuth) {
      await Authentication.updateOne(
        { email: req.body.email },
        {
          $set: {
            name: req.body.name,
            password: hashedPassword,
            picture: req.body.picture,
            role: 'staff' // Set role to 'staff'
          },
        }
      );
    } else {
      // Create new authentication record
      const auth = new Authentication({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        picture: req.body.picture,
        role: 'staff' // Set role to 'staff'
      });
      await auth.save();
    }

    try {
      // Attempt to send invitation email
      await sendStaffInvitation(req.body.email, req.body.name, temporaryPassword);
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Continue with staff creation even if email fails
    }

    res.status(201).json({
      ...savedStaff.toObject(),
      temporaryPassword, // Include the temporary password in the response
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error saving staff: " + error.message });
  }
};

//Update Staff
const updateStaff = async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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

    // Also delete the authentication record
    await Authentication.findOneAndDelete({ email: deletedStaff.email });

    res.status(200).send("Staff deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting staff");
  }
};

export { getStaffs, getStaff, postStaff, updateStaff, deleteStaff, getStaffByEmail };
