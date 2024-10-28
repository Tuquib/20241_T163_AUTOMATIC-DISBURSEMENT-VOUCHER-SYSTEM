const staffsController = require("../db/staffDB");

function getAll(res, res) {
  res.status(200).json(staffsController);
}

module.exports = staffsController;
