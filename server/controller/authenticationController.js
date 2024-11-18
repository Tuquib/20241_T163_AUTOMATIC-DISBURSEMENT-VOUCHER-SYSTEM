import User from "../model/user.js";
import Authentication from "../model/authenticationDB.js";
import bcrypt from "bcrypt";
import axios from "axios";

// Get all logins
const getLogins = async (req, res) => {
  try {
    const logins = await Authentication.find();
    res.status(200).json(logins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving logins");
  }
};

// Login logic
const handleLogin = async (req, res) => {
  const { email, password, recaptcha } = req.body;

  // Step 1: Verify reCAPTCHA
  if (!recaptcha) {
    return res.status(400).json({ error: "reCAPTCHA token is missing." });
  }

  try {
    // Verify reCAPTCHA token with Google
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY, // Make sure this is set correctly in your .env
          response: recaptcha,
        },
      }
    );

    const { success, "error-codes": errorCodes } = recaptchaResponse.data;

    if (!success) {
      console.error("reCAPTCHA verification failed:", errorCodes);
      return res.status(400).json({ error: "reCAPTCHA verification failed." });
    }

    // Step 2: Find the user by email in the database
    const user = await Authentication.findOne({ email });

    if (!user) {
      console.error(`Login failed: User with email ${email} not found.`);
      return res.status(404).json({ error: "User not registered." });
    }

    // Step 3: Compare entered password with the stored hashed password
    console.log("Stored Hashed Password:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      console.error(`Login failed: Incorrect password for user ${email}`);
      return res.status(400).json({ error: "Incorrect password." });
    }

    // Step 4: Generate token (customize as per your needs, e.g., using JWT)
    const token = "mockToken"; // Replace this with your token generation logic, e.g., JWT

    console.log(`Login successful for user: ${email}`);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Sign-up logic
const handleSignUp = async (req, res) => {
  const { name, email, password, recaptcha } = req.body;

  // Step 1: Verify reCAPTCHA
  if (!recaptcha) {
    return res.status(400).json({ error: "reCAPTCHA token is missing." });
  }

  try {
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptcha,
        },
      }
    );

    const { success, "error-codes": errorCodes } = recaptchaResponse.data;

    if (!success) {
      console.error("reCAPTCHA verification failed:", errorCodes);
      return res.status(400).json({ error: "reCAPTCHA verification failed." });
    }

    // Step 2: Check if user already exists
    const existingUser = await Authentication.findOne({ email });
    if (existingUser) {
      console.error(`Sign-up failed: User with email ${email} already exists.`);
      return res.status(400).json({ error: "User already registered." });
    }

    // Step 3: Hash the password and create the new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Authentication({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("User created successfully:", newUser);

    // Step 4: Send success response
    res.status(200).json({ message: "Sign-up successful!" });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch a login by ID (optional, if needed for other functionalities)
const getLogin = async (req, res) => {
  try {
    const login = await Authentication.findById(req.params.id);
    if (!login) return res.status(404).send("Login not found.");
    res.status(200).json(login);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving login.");
  }
};

// Update login by ID
const updateLogin = async (req, res) => {
  try {
    const updatedLogin = await Authentication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedLogin) return res.status(404).send("Login not found.");
    res.status(200).json(updatedLogin);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating login.");
  }
};

// Delete login by ID
const deleteLogin = async (req, res) => {
  try {
    const deletedLogin = await Authentication.findByIdAndDelete(req.params.id);
    if (!deletedLogin) return res.status(404).send("Login not found.");
    res.status(200).send("Login deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting login.");
  }
};

// Google login handler
const handleGoogleLogin = async (req, res) => {
  const { googleId, name, email, picture } = req.body;
  try {
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, name, email, picture });
      await user.save();
    }
    res.status(200).json({ message: "Google login successful", user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  getLogins,
  getLogin,
  handleLogin,
  updateLogin,
  deleteLogin,
  handleGoogleLogin,
  handleSignUp,
};
