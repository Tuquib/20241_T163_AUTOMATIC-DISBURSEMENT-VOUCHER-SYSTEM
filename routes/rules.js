const express = require("express");
const rulesRoutes = express();

const bodyParser = require("body-parser");
rulesRoutes.use(bodyParser.urlencoded({ extended: false }));
rulesRoutes.use(bodyParser.json());

// Add a to Submit
rulesRoutes.get("/users", (req, res) => {});

// add to aprrove
rulesRoutes.get("/users/:id", (req, res) => {});

rulesRoutes.delete("/users/:id", (req, res) => {});

module.exports = rulesRoutes;
