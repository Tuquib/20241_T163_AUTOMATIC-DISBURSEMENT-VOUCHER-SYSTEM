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
import { FaBell } from "react-icons/fa";

// Your spreadsheet ID - replace with your actual Google Sheet ID
const SPREADSHEET_ID = "1dFqPinG16buAgBpzdtPV1ClZlad1lFiwLj0FYEJeeEI";

const CreateVoucher = () => {
  const navigate = useNavigate();
  const { taskID } = useParams();

  // All state declarations at the top
  const [formData, setFormData] = useState({
    date: "",
    modeOfPayment: "MDS Check",
    payeeName: "",
    address: "",
    amountDue: "",
    responsibilityCenter: "",
    mfoPap: "",
    amount: "",
    totalAmount: "",
    tinNumber: "",
    bursNumber: "",
    particulars: "",
    nameOfVicePresident: "DR. HAZEL JEAN M. ABEJUELA",
    accountTitle: "",
    uacsCode: "",
    certified: "Cash Available",
    approvedOfPayment: "",
    printedName1: "JUDITHA G. PAGARAN",
    position1: "OIC - University Accountant",
    printedName2: "JOY M. MIRASOL",
    position2: "University President",
    checkADANo: "",
    officialReceiptNo: "",
    bankNameAndAccountNo: "",
    calculatorInput: "",
    operation: "",
  });
  const [dvNumber, setDvNumber] = useState(null);
  const [fundCluster, setFundCluster] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState({
    picture: "",
  });
  const [voucherLock, setVoucherLock] = useState(null);

  // Utility functions
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const convertLessThanThousand = (n) => {
      if (n === 0) return "";

      if (n < 10) return ones[n];

      if (n < 20) return teens[n - 10];

      if (n < 100) {
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
        );
      }

      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
      );
    };

    if (num === 0) return "Zero";

    const parts = [];
    let number = parseFloat(num);

    // Handle decimals
    const decimalPart = number % 1;
    number = Math.floor(number);

    if (number >= 1000000) {
      const millions = Math.floor(number / 1000000);
      parts.push(convertLessThanThousand(millions) + " Million");
      number %= 1000000;
    }

    if (number >= 1000) {
      const thousands = Math.floor(number / 1000);
      parts.push(convertLessThanThousand(thousands) + " Thousand");
      number %= 1000;
    }

    if (number > 0) {
      parts.push(convertLessThanThousand(number));
    }

    let result = parts.join(" ");

    // Add decimal part if exists
    if (decimalPart > 0) {
      const cents = Math.round(decimalPart * 100);
      result += " and " + cents + "/100";
    } else {
      result += " Pesos Only";
    }

    return result;
  };

  const calculateTotal = (currentAmount, operation, newAmount) => {
    const current = parseFloat(currentAmount) || 0;
    const value = parseFloat(newAmount) || 0;

    switch (operation) {
      case "+":
        return current + value;
      case "-":
        return current - value;
      case "*":
        return current * value;
      case "/":
        return value !== 0 ? current / value : current;
      default:
        return current;
    }
  };

  // Event handlers
  const handleLogout = () => {
    googleLogout();
    alert("Logged out successfully!");
    navigate("/");
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      amount: value,
      totalAmount: value,
    }));
  };

  const handleCalculatorInput = (e) => {
    setFormData((prev) => ({
      ...prev,
      calculatorInput: e.target.value,
    }));
  };

  const handleOperation = (e) => {
    setFormData((prev) => ({
      ...prev,
      operation: e.target.value,
    }));
  };

  const handleCalculate = () => {
    const newTotal = calculateTotal(
      formData.amount,
      formData.operation,
      formData.calculatorInput
    );

    setFormData((prev) => ({
      ...prev,
      totalAmount: newTotal.toString(),
    }));
  };

  // Notification functions
  const fetchNotifications = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const staffEmail = localStorage.getItem("userEmail");

      if (!accessToken || !staffEmail) {
        console.error("No access token or email found");
        return;
      }

      const response = await axios.get("http://localhost:8000/api/notifications", {
        params: {
          staffEmail,
          role: "staff",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setNotifications(response.data);
      const unread = response.data.filter((notif) => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to fetch notifications");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.patch(
        `http://localhost:8000/api/notifications/${notificationId}`,
        { read: true },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      notifications.forEach((notif) => {
        if (!notif.read) {
          markAsRead(notif._id);
        }
      });
    }
  };

  const acquireLock = async () => {
    try {
      const staffEmail = localStorage.getItem("userEmail");
      const response = await axios.post("http://localhost:8000/api/voucher-lock/lock", {
        staffEmail
      });
      setVoucherLock(response.data.lockId);
      return true;
    } catch (error) {
      if (error.response?.status === 423) {
        setError(`Another staff member (${error.response.data.lockedBy}) is currently creating a voucher. Please try again later.`);
      } else {
        setError("Failed to start voucher creation. Please try again.");
      }
      return false;
    }
  };

  const releaseLock = async () => {
    if (!voucherLock) return;
    
    try {
      const staffEmail = localStorage.getItem("userEmail");
      await axios.post("http://localhost:8000/api/voucher-lock/release", {
        staffEmail,
        lockId: voucherLock
      });
      setVoucherLock(null);
    } catch (error) {
      console.error("Failed to release lock:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const accessToken = localStorage.getItem("access_token");
      const staffEmail = localStorage.getItem("userEmail");
      const staffName = localStorage.getItem("userName");

      if (!accessToken || !staffEmail || !staffName) {
        setError("Missing authentication information. Please log in again.");
        return;
      }

      // Try to acquire lock BEFORE setting loading state
      const lockAcquired = await acquireLock();
      if (!lockAcquired) {
        // If lock fails, another staff is creating a voucher
        return; // Exit immediately without processing form
      }

      // Only set loading after lock is acquired
      setLoading(true);
      setError(null);

      setLoadingMessage("Writing data to Google Sheet...");
      await writeDataToGoogleSheet(
        SPREADSHEET_ID,
        formatDVFormData(formData, fundCluster, dvNumber)
      );

      setLoadingMessage("Generating to post in Google Drive file...");
      const { fileId, webViewLink } = await exportToPDF(
        SPREADSHEET_ID,
        "DV",
        dvNumber,
        formData
      );

      setLoadingMessage("Saving voucher information...");
      const requestData = {
        voucherData: {
          dvNumber,
          fundCluster,
          voucherName: `DV_${dvNumber}`,
          driveFileId: fileId,
          webViewLink,
          status: "Pending",
        },
        accessToken,
        staffEmail,
        staffName,
      };

      console.log("Request data being sent:", JSON.stringify(requestData, null, 2));

      const response = await axios.post(
        "http://localhost:8000/api/vouchers",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Voucher created successfully:", response.data);
      alert("Voucher created successfully!");
      window.location.href = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=583941779#gid=583941779`;
    } catch (error) {
      console.error("Error creating voucher:", error);
      setError(error.message || "Failed to create voucher. Please try again.");
    } finally {
      await releaseLock(); // Always release the lock
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!taskID) {
          setError("Task ID is missing.");
          return;
        }

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
          payeeName: taskResponse.data.payeeName,
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [taskID]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalAmount: prev.amount,
    }));
  }, [formData.amount]);

  useEffect(() => {
    if (formData.totalAmount) {
      const amountInWords = numberToWords(formData.totalAmount);
      setFormData((prev) => ({
        ...prev,
        approvedOfPayment: amountInWords,
      }));
    }
  }, [formData.totalAmount]);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const userPicture = localStorage.getItem("userPicture");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userEmail) {
      console.error("No user information found");
      navigate("/");
      return;
    }

    setUserProfile({
      picture: userPicture || userInfo.picture || null,
    });
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (voucherLock) {
        releaseLock();
      }
    };
  }, [voucherLock]);

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
          <button className="icon-button">
            {userProfile.picture ? (
              <img
                src={userProfile.picture}
                alt="profile"
                className="profile-picture"
              />
            ) : (
              "👤"
            )}
          </button>
          <div className="notification-container">
            <button
              className="notification-button"
              onClick={toggleNotifications}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-panel">
                <h3>Notifications</h3>
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
                  <ul className="notification-list">
                    {notifications.map((notification) => (
                      <li
                        key={notification._id}
                        className={`notification-item ${
                          notification.read ? "read" : "unread"
                        }`}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <p>{notification.message}</p>
                        <small>
                          {new Date(notification.createdAt).toLocaleString()}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
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
          <button
            className="sidebar-btn"
            onClick={() => navigate("/voucher")}
          >
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
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-message">Please wait...</div>
                <div className="loading-progress">{loadingMessage}</div>
              </div>
            )}
            <h2>Create Disbursement Voucher</h2>
            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <div>
                <label>Payee Name:</label>
                <input type="text" value={formData.payeeName} readOnly />
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
              <div>
                <label>Address:</label>
                <input
                  type="text"
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
              <div className="full-width">
                <label>Particulars:</label>
                <textarea
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
                  onChange={handleAmountChange}
                  value={formData.amount}
                  required
                />
              </div>
              {/* Calculator Section */}
              <div className="calculator-section">
                <select value={formData.operation} onChange={handleOperation}>
                  <option></option>
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="*">×</option>
                  <option value="/">÷</option>
                </select>
                <input
                  type="number"
                  placeholder="Enter value"
                  value={formData.calculatorInput}
                  onChange={handleCalculatorInput}
                />
                <button type="button" onClick={handleCalculate}>
                  Calculate
                </button>
              </div>
              <div>
                <label>Total Amount:</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  readOnly
                />
              </div>
              <div>
                <label>Name of the Vice President:</label>
                <select
                  name="NameOfVicePresident"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nameOfVicePresident: e.target.value,
                    })
                  }
                  value={formData.nameOfVicePresident}
                >
                  <option value="DR. HAZEL JEAN M. ABEJUELA">
                    DR. HAZEL JEAN M. ABEJUELA
                  </option>
                  <option value="DR. CARINA JOANE V. BARROSO">
                    DR. CARINA JOANE V. BARROSO
                  </option>
                  <option value="DANTE S. VICTORIA JR.">
                    DANTE S. VICTORIA JR.
                  </option>
                  <option value="DR. LINCOLN V. TAN">DR. LINCOLN V. TAN</option>
                </select>
              </div>
              <div>
                <label>Account Title:</label>
                <input
                  type="text"
                  name="accountTitle"
                  onChange={(e) =>
                    setFormData({ ...formData, accountTitle: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>UACS Code:</label>
                <input
                  type="text"
                  name="uacsCode"
                  onChange={(e) =>
                    setFormData({ ...formData, uacsCode: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Certified:</label>
                <select
                  name="certified"
                  onChange={(e) =>
                    setFormData({ ...formData, certified: e.target.value })
                  }
                  value={formData.certified}
                >
                  <option value="Cash Available">Cash Available</option>
                  <option value="Subject to Authority to Debit Account (when applicable)">
                    Subject to Authority to Debit Account
                  </option>
                  <option value="Supporting documents complete and amount claimed">
                    {" "}
                    Supporting documents complete and amount claimed{" "}
                  </option>
                </select>
              </div>
              <div>
                <label>Approved of Payment</label>
                <input
                  type="text"
                  name="approvedOfPayment"
                  value={formData.approvedOfPayment}
                  readOnly
                />
              </div>
              <div>
                <label>Printed Name:</label>
                <input type="text" value={formData.printedName1} readOnly />
              </div>
              <div>
                <label>Position:</label>
                <input type="text" value={formData.position1} readOnly />
              </div>
              <div>
                <label>Printed Name:</label>
                <input type="text" value={formData.printedName2} readOnly />
              </div>
              <div>
                <label>Position:</label>
                <input type="text" value={formData.position2} readOnly />
              </div>
              <div>
                <label>Check/ADA No.:</label>
                <input
                  type="text"
                  name="checkADANo"
                  onChange={(e) =>
                    setFormData({ ...formData, checkADANo: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Bank Name & Account No.:</label>
                <input
                  type="text"
                  name="bankNameAndAccountNo"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankNameAndAccountNo: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Official Receipt No. & Date:</label>
                <input
                  type="text"
                  name="officialReceiptNo"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      officialReceiptNo: e.target.value,
                    })
                  }
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
