import express from "express";
import bodyParser from "body-parser";
import { 
  adminLogin, 
  initializeAdminDrive, 
  getAdmins, 
  updateAdmin, 
  deleteAdmin,
} from "../controller/adminController.js";

const adminRoutes = express.Router();

adminRoutes.use(bodyParser.urlencoded({ extended: false }));
adminRoutes.use(bodyParser.json());

// Admin login and drive initialization
adminRoutes.post("/admin/login", adminLogin);
adminRoutes.post("/admin/initialize-drive", initializeAdminDrive);

// Other admin routes
adminRoutes.get("/admin", getAdmins);
adminRoutes.patch("/admin/:id", updateAdmin);
adminRoutes.delete("/admin/:id", deleteAdmin);

export default adminRoutes;
