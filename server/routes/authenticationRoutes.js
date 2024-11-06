const express = require("express");
const authenticationRoutes = express();

//import controller
const admins = require("../controller/adminController");
// use controller
authenticationRoutes.use("adminController", admins);

const bodyParser = require("body-parser");
authenticationRoutes.use(bodyParser.urlencoded({ extended: false }));
authenticationRoutes.use(bodyParser.json());

// get login of admin and staff
authenticationRoutes.get("/", getLogin);

// add to login the admin and staff
authenticationRoutes.post("/", postLogin);

// add to register the admin and staff
authenticationRoutes.post("/", postRegister);

// add to logout
authenticationRoutes.get("/", getLogout);

module.exports = authenticationRoutes;
