const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get("/", (req, res) => {
  res.send("COT-SBO EVENT MANAGEMENT SYSTEM");
});

//===============Admin===============//

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import db (subjects)
// const subjects = require("./db");

// Root endpoint
app.get("/", (req, res) => {
  res.send("Automatic Disbursement Voucher System");
});

app.post("/admin", (req, res) => {
  const newAdmin = req.body;
  admin.push(newAdmin);
  res.status(201).send({ status: "Success", newData: Admin });
});

// Get all admins
app.get("/admin/all", (req, res) => {
  res.status(200).json(subjects);
});

// Get admin by ID
app.get("/admin/i/:id", (req, res) => {
  const id = req.params.id;
  const admin = admins.find((admin) => admin.admin_id == id);
  if (admin) {
    res.status(200).json(admin);
  } else {
    res.status(404).json({ status: "Error", message: "Admin not found" });
  }
});

// Get admin by name
app.get("/admin/n/:name", (req, res) => {
  const name = req.params.name;
  const admin = admins.find((admin) => admin.admin_name == name);
  if (admin) {
    res.status(200).json(admin);
  } else {
    res.status(404).json({ status: "Error", message: "Admin not found" });
  }
});

// Delete a admin by ID
app.delete("/admin/:id", (req, res) => {
  const id = req.params.id;
  const index = admins.findIndex((admin) => admin.admin_id == id);
  if (index !== -1) {
    staffs.splice(index, 1);
    res.status(200).json({ status: "Success", newData: admins });
  } else {
    res.status(404).json({ status: "Error", message: "admin not found" });
  }
});

// Update a admin by ID
app.patch("/admin/:id", (req, res) => {
  const id = req.params.id;
  const index = admins.findIndex((admin) => admin.admin_id == id);

  //condition of statement
  if (index !== -1) {
    admins[index] = { ...admins[index], ...req.body }; // Merging updates
    res.status(200).json({ status: "Success", newData: admins }); // if success!
  } else {
    res.status(404).json({ status: "Error", message: "admin not found" }); //if Error!
  }
});

//========================Administrative Staff=====================//

// Add a new Staff
app.post("/staff", (req, res) => {
  const newStaff = req.body;
  staff.push(newStaff);
  res.status(201).send({ status: "Success", newData: Staff });
});

// Get all Staff
app.get("/staff/all", (req, res) => {
  res.status(200).json(staff);
});

// Get SBO Staff
app.get("/staff/i/:id", (req, res) => {
  const id = req.params.id;
  const staff = staffs.find((staff) => staff.staff_id == id);
  if (staff) {
    res.status(200).json(staff);
  } else {
    res.status(404).json({ status: "Error", message: "Staff not found" });
  }
});

// Get SBO Staff
app.get("/staff/n/:name", (req, res) => {
  const name = req.params.name;
  const staff = staff.find((staff) => staff.staff_name == name);
  if (staff) {
    res.status(200).json(staff);
  } else {
    res.status(404).json({ status: "Error", message: "Staff not found" });
  }
});

// Delete an Staff
app.delete("/staff/:id", (req, res) => {
  const id = req.params.id;
  const index = staffs.findIndex((staff) => staff.staff_id == id);
  if (index !== -1) {
    staffs.splice(index, 1);
    res.status(200).json({ status: "Success", newData: staffs });
  } else {
    res.status(404).json({ status: "Error", message: "staff not found" });
  }
});

// Update an Staff
app.patch("/staff/:id", (req, res) => {
  const id = req.params.id;
  const index = staffs.findIndex((staff) => staff.staff_id == id);

  //condition of statement
  if (index !== -1) {
    staffs[index] = { ...staffs[index], ...req.body }; // Merging updates
    res.status(200).json({ status: "Success", newData: staffs }); // if success!
  } else {
    res.status(404).json({ status: "Error", message: "staff not found" }); //if Error!
  }
});
e;

// Start the server

app.listen(3000);
