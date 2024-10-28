const express = require("express");
const staffRoutes = express();

//import controller
const staffs = require("../controller/staffController");
// use controller
staffRoutes.use("staffDb", staffs);

const bodyParser = require("body-parser");
staffRoutes.use(bodyParser.urlencoded({ extended: false }));
staffRoutes.use(bodyParser.json());

staffRoutes.get("/", getStaffs);

staffRoutes.get("/:id", getStaff);

staffRoutes.post("/", postStaff);

staffRoutes.patch("/:id", updateStaff);

staffRoutes.delete("/:id", deleteStaff);

module.exports = staffRoutes;
