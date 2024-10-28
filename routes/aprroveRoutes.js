const express = require("express");
const approveRoutes = express();

const bodyParser = require("body-parser");
approveRoutes.use(bodyParser.urlencoded({ extended: false }));
approveRoutes.use(bodyParser.json());

// Add a to Submit
approveRoutes.post("/", postSubmit);

// add to aprrove
approveRoutes.post("/", postApprove);

// // Add to reject
approveRoutes.post("/", postReject);

module.exports = approveRoutes;
