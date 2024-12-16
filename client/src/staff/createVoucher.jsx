import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  initGoogleAPI,
  writeDataToGoogleSheet,
  formatDVFormData,
  exportToPDF,
} from "./googleSheetAPI";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import "./createVoucher.css";

// Your spreadsheet ID - replace with your actual Google Sheet ID
const SPREADSHEET_ID = "1dFqPinG16buAgBpzdtPV1ClZlad1lFiwLj0FYEJeeEI";

const CreateVoucher = () => {
  const navigate = useNavigate();
  const { taskID } = useParams();

  const [formData, setFormData] = useState({
    entityName: "",
    date: "",
    modeOfPayment: "MDS Check",
    payeeName: "",
    address: "",
    amountDue: "",
    responsibilityCenter: "",
    mfoPap: "",
    amount: "",
    tinNumber: "",
    bursNumber: "",
    particulars: "",
  });

  const [dvNumber, setDvNumber] = useState(null);
  const [fundCluster, setFundCluster] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Google API and fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!taskID) {
          setError("Task ID is missing.");
          return;
        }

        // Initialize Google API
        await initGoogleAPI();

        const [dvResponse, fcResponse, taskResponse] = await Promise.all([
          axios.get("http://localhost:8000/api/nextDvNumber"),
          axios.get("http://localhost:8000/api/nextFundCluster"),
          axios.get(`http://localhost:8000/api/task/${taskID}`),
        ]);

        setDvNumber(dvResponse.data.dvNumber);
        setFundCluster(fcResponse.data.fundCluster);

        setFormData((prev) => ({
          ...prev,
          date: new Date(taskResponse.data.date).toISOString().split("T")[0],
          entityName: taskResponse.data.entityName,
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [taskID]);

  const handleLogout = () => {
    googleLogout();
    alert("Logged out successfully!");
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Initialize Google API first
      await initGoogleAPI();

      // Format the data for Google Sheets
      const updates = formatDVFormData(formData, fundCluster, dvNumber);

      // Write all updates to Google Sheets
      await writeDataToGoogleSheet(SPREADSHEET_ID, updates);

      // Create a copy in Drive
      const fileId = await exportToPDF(
        SPREADSHEET_ID,
        "DV",
        dvNumber,
        formData
      );

      // Make sure fileId is a string
      const driveFileId = typeof fileId === "object" ? fileId.id : fileId;
      const webViewLink = `https://docs.google.com/spreadsheets/d/${driveFileId}/edit`;

      // Get access token - you need to implement this function
      const accessToken = await window.gapi.auth.getToken()?.access_token;

      if (!accessToken) {
        throw new Error("No access token available. Please re-login.");
      }

      // Create payload matching the controller's expected format
      const voucherPayload = {
        accessToken,
        staffEmail: localStorage.getItem("userEmail"),
        staffName: localStorage.getItem("userName"),
        voucherData: {
          entityName: formData.entityName,
          dvNumber,
          fundCluster,
          driveFileId, // Now using the string version
          webViewLink,
          status: "Pending",
          voucherName: `DV_${dvNumber}_${formData.entityName}`,
        },
      };

      console.log("Sending to API:", voucherPayload); // Debug log

      const voucherResponse = await axios.post(
        "http://localhost:8000/api/vouchers",
        voucherPayload
      );

      if (!voucherResponse.data) {
        throw new Error("Failed to save voucher to database");
      }

      console.log("All data written successfully and copied to Drive");
      alert(
        "Voucher created successfully! A copy has been saved to your Disbursement Vouchers folder."
      );

      window.open(webViewLink, "_blank");
      navigate("/staffTask");
    } catch (error) {
      console.error("Error creating voucher:", error);
      alert("Error creating voucher: " + error.message);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard">
      {/* Navbar */}
      <header className="navbar">
        <img src="../src/assets/Buksu_logo.png" alt="logo" className="logo" />
        <div className="text-container">
          <span className="logo-text">Bukidnon State University</span>
          <span className="sub-text">Accounting Office</span>
          <span className="sub2-text">Automatic Disbursement Voucher</span>
        </div>
        <nav className="nav-links">
          <button className="icon-button">👤</button>
          <button className="icon-button">🔔</button>
        </nav>
      </header>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <button
            className="sidebar-btn"
            onClick={() => navigate("/staffDashboard")}
          >
            Dashboard
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/voucher")}>
            Voucher
          </button>
          <button
            className="sidebar-btn"
            onClick={() => navigate("/staffTask")}
          >
            Task
          </button>

          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout className="log-icon" />
          </button>
        </aside>

        {/* Main content */}
        <main className="main-container">
          <div className="create-voucher">
            <h2>Create Disbursement Voucher</h2>
            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <div>
                <label>Entity Name:</label>
                <input type="text" value={formData.entityName} readOnly />
              </div>
              <div>
                <label>Fund Cluster:</label>
                <span className="fund-cluster">
                  {fundCluster || "Not available"}
                </span>
              </div>
              <div>
                <label>Date:</label>
                <input type="date" value={formData.date} readOnly />
              </div>
              <div>
                <label>DV Number:</label>
                <span className="dv-number">{dvNumber || "Not available"}</span>
              </div>
              <div>
                <label>Mode of Payment:</label>
                <select
                  name="modeOfPayment"
                  onChange={(e) =>
                    setFormData({ ...formData, modeOfPayment: e.target.value })
                  }
                  value={formData.modeOfPayment}
                >
                  <option value="MDS Check">MDS Check</option>
                  <option value="Commercial Check">Commercial Check</option>
                  <option value="ADA">ADA</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="full-width">
                <label>Payee Name:</label>
                <input
                  type="text"
                  name="entityName"
                  onChange={(e) =>
                    setFormData({ ...formData, payeeName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="full-width">
                <label>Address:</label>
                <textarea
                  rows="2"
                  name="address"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>TIN/Employee No.:</label>
                <input
                  type="text"
                  name="tinNumber"
                  onChange={(e) =>
                    setFormData({ ...formData, tinNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>ORS/BURS No.:</label>
                <input
                  type="text"
                  name="bursNumber"
                  onChange={(e) =>
                    setFormData({ ...formData, bursNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Particulars:</label>
                <input
                  type="text"
                  name="particulars"
                  onChange={(e) =>
                    setFormData({ ...formData, particulars: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Responsibility Center:</label>
                <input
                  type="text"
                  name="responsibilityCenter"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responsibilityCenter: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label>MFO/PAP:</label>
                <input
                  type="text"
                  name="mfoPap"
                  onChange={(e) =>
                    setFormData({ ...formData, mfoPap: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Amount:</label>
                <input
                  type="number"
                  name="amount"
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateVoucher;
