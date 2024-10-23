const express = require("express");
const genRoutes = express();

const bodyParser = require("body-parser");
genRoutes.use(bodyParser.urlencoded({ extended: false }));
genRoutes.use(bodyParser.json());

// Add a to Submit
genRoutes.get("/reports/disbursement", (req, res) => {});

// add to aprrove
genRoutes.get("/reports/disbursement/:id", (req, res) => {});

module.exports = genRoutes;
