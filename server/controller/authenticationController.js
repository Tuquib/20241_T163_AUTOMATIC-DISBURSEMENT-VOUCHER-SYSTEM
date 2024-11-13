import Login from "../model/authenticationDB.js"; // Ensure correct path
import User from "../model/user.js";

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
  try {
    const login = await Login.findById(req.params.id);
    if (!login) return res.status(404).send("login not found");
    res.status(200).json(login);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving login");
  }
};

//Create a login
const postLogin = async (req, res) => {
  try {
    const login = new Login(req.body);
    const savedlogin = await login.save();
    res.status(201).json(savedlogin);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error saving login");
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
