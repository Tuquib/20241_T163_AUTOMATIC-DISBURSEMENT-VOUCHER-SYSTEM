const authenticationController = require("../model/authenticationDB");

const postAdmin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Received email:", email); // Debugging line
  console.log("Received password:", password); // Debugging line
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

module.exports = authenticationController;
