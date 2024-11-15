import User from "../model/user.js";
import Login from "../model/authenticationDB.js";
import bcrypt from "bcrypt";

//Get login
const getLogins = async (req, res) => {
  try {
    const logins = await Login.find();
    res.status(200).json(logins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving login");
  }
};

//Get login by Id
const getLogin = async (req, res) => {
  const { email, password } = req.body; // Get email and password from the request body

  try {
    // Find the user by email
    const login = await Login.findOne({ email });

    if (!login) {
      return res.status(404).send("Login not found. User does not exist.");
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, login.password);

    if (!isMatch) {
      return res.status(400).send("Incorrect password.");
    }

    // If email and password match, return the login data
    res.status(200).json(login);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving login.");
  }
};

//Create a login (if this route is still needed)
const postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists in the database
    const user = await Login.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not registered." });
    }

    // Compare entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    // Send success response with token or user data as needed
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during manual login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Update login
const updateLogin = async (req, res) => {
  try {
    const updatedlogin = await Login.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedlogin) return res.status(404).send("login not found");
    res.status(200).json(updatedlogin);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating login");
  }
};

//Delete login
const deleteLogin = async (req, res) => {
  try {
    const deletedlogin = await Login.findByIdAndDelete(req.params.id);
    if (!deletedlogin) return res.status(404).send("login not found");
    res.status(200).send("login deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting login");
  }
};

// Google login handler (existing)
const handleGoogleLogin = async (req, res) => {
  const { googleId, name, email, picture } = req.body;
  try {
    console.log("Handling Google login for user:", email);
    let user = await User.findOne({ googleId });
    if (!user) {
      console.log("Creating new user with Google ID:", googleId);
      user = new User({ googleId, name, email, picture });
      await user.save();
    }
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  getLogins,
  getLogin,
  postLogin,
  updateLogin,
  deleteLogin,
  handleGoogleLogin,
};
