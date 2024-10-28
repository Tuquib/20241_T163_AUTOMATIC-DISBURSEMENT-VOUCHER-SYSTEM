const adminController = require("../db/adminDB");

function getAll(res, res) {
  res.status(200).json(adminController);
}

module.exports = adminController;
