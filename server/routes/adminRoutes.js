const express = require("express");
const adminRoutes = express();

//import controller
const admins = require("../controller/adminController");
// use controller
adminRoutes.use("adminController", admins);

const bodyParser = require("body-parser");
adminRoutes.use(bodyParser.urlencoded({ extended: false }));
adminRoutes.use(bodyParser.json());

adminRoutes.get("/", getAdmins);

adminRoutes.get("/:id", getAdmin);

adminRoutes.get("/:id", getAdmin);

adminRoutes.patch("/:id", updateAdmin);

adminRoutes.delete("/:id", deleteAdmin);

module.exports = adminRoutes;
