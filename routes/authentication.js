const express = require("express");
const authenticationRoutes = express();

const bodyParser = require("body-parser");
authenticationRoutes.use(bodyParser.urlencoded({ extended: false }));
authenticationRoutes.use(bodyParser.json());

// add to login the admin and staff
authenticationRoutes.post("/auth/login", (req, res) => {});

// add to register the admin and staff
authenticationRoutes.post("/auth/register", (req, res) => {});

// add to logout
authenticationRoutes.post("/auth/logout", (req, res) => {});
