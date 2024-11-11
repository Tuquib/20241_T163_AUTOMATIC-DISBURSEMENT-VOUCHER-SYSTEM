import Login from "../model/authenticationDB.js"; // Ensure correct path

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

export { getLogins, getLogin, postLogin, updateLogin, deleteLogin };
