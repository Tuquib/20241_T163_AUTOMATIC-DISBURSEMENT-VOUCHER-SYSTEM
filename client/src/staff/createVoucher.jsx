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
import { FaBell} from 'react-icons/fa';

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
    certified: "Cash Available",
    approvedOfPayment: "",
    printedName1: "JUDITHA G. PAGARAN",
    position1: "OIC - University Accountant",
    printedName2: "JOY M. MIRASOL",
    position2: "University President",
    checkADANo: "",
    officialReceiptNo: "",
    bankNameAndAccountNo: "",
  });

  // Modify the entries state structure to support multiple debits per credit
  const [entries, setEntries] = useState([
    {
      id: 1,
      credit: {
        accountTitle: "",
        uacsCode: "",
        amount: ""
      },
      debits: [
        {
          accountTitle: "",
          uacsCode: "",
          amount: ""
        }
      ]
    }
  ]);

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
  const [debitAccounts, setDebitAccounts] = useState([]);
  const [showDebitDropdown, setShowDebitDropdown] = useState(false);
  const [creditOptions, setCreditOptions] = useState([]);

  // Add new state for storing debit accounts for each entry
  const [entryDebitAccounts, setEntryDebitAccounts] = useState({});

  // Function to reset all form data states
  const resetFormState = () => {
    setFormData({
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
      certified: "Cash Available",
      approvedOfPayment: "",
      printedName1: "JUDITHA G. PAGARAN",
      position1: "OIC - University Accountant",
      printedName2: "JOY M. MIRASOL",
      position2: "University President",
      checkADANo: "",
      officialReceiptNo: "",
      bankNameAndAccountNo: "",
    });
    setEntries([
      {
        id: 1,
        credit: {
          accountTitle: "",
          uacsCode: "",
          amount: ""
        },
        debits: [
          {
            accountTitle: "",
            uacsCode: "",
            amount: ""
          }
        ]
      }
    ]);
    setDvNumber(null);
    setFundCluster(null);
    setEntryDebitAccounts({});
    setError(null); // Also clear any previous errors
  };

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

  const handleAccountTitleChange = async (e) => {
    const accountTitle = e.target.value;
    setFormData(prev => ({ ...prev, accountTitle }));

    try {
      const response = await axios.get(`/api/account-mapping/${encodeURIComponent(accountTitle)}`);
      if (response.data.debitAccounts && response.data.debitAccounts.length > 0) {
        setDebitAccounts(response.data.debitAccounts);
        setShowDebitDropdown(true);
        setFormData(prev => ({ 
          ...prev, 
          uacsCode: response.data.creditAccount.uacsCode 
        }));
      } else {
        setDebitAccounts([]);
        setShowDebitDropdown(false);
        setFormData(prev => ({ 
          ...prev, 
          debitAccount: "",
          debitUacsCode: ""
        }));
      }
    } catch (error) {
      console.error("Error fetching debit accounts:", error);
      setDebitAccounts([]);
      setShowDebitDropdown(false);
    }
  };

  const handleDebitAccountChange = (e) => {
    const selectedDebit = debitAccounts.find(
      account => account.title === e.target.value
    );
    
    setFormData(prev => ({
      ...prev,
      debitAccount: e.target.value,
      debitUacsCode: selectedDebit ? selectedDebit.uacsCode : ""
    }));
  };

  const handleAddEntry = () => {
    const newId = entries.length + 1;
    setEntries(prev => [...prev, {
      id: newId,
      credit: {
        accountTitle: "",
        uacsCode: "",
        amount: ""
      },
      debits: [
        {
          accountTitle: "",
          uacsCode: "",
          amount: ""
        }
      ]
    }]);
    setEntryDebitAccounts(prev => ({
      ...prev,
      [newId]: []
    }));
  };

  const handleRemoveEntry = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    setEntryDebitAccounts(prev => {
      const newDebitAccounts = { ...prev };
      delete newDebitAccounts[id];
      return newDebitAccounts;
    });
  };

  const handleAddDebit = (entryId) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          debits: [
            ...entry.debits,
            {
              accountTitle: "",
              uacsCode: "",
              amount: ""
            }
          ]
        };
      }
      return entry;
    }));
  };

  const handleRemoveDebit = (entryId, debitIndex) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const newDebits = [...entry.debits];
        newDebits.splice(debitIndex, 1);
        return {
          ...entry,
          debits: newDebits
        };
      }
      return entry;
    }));
  };

  const handleEntryChange = async (id, type, field, value, debitIndex = 0) => {
    if (field === 'accountTitle') {
      try {
        setLoading(true);
        setLoadingMessage(`Fetching account mapping for ${value}...`);

        if (type === 'credit') {
          const response = await axios.get(`http://localhost:8000/api/account-mapping/${encodeURIComponent(value)}`);
          
          if (!response.data.creditAccount) {
            throw new Error(`No mapping found for ${value}`);
          }

          setEntries(prev => prev.map(entry => {
            if (entry.id === id) {
              return {
                ...entry,
                credit: {
                  accountTitle: value,
                  uacsCode: response.data.creditAccount.uacsCode,
                  amount: entry.credit.amount || ""
                },
                debits: [{
                  accountTitle: "",
                  uacsCode: "",
                  amount: ""
                }]
              };
            }
            return entry;
          }));

          setEntryDebitAccounts(prev => ({
            ...prev,
            [id]: response.data.debitAccounts || []
          }));

          setError(null);
        } else if (type === 'debit') {
          const selectedDebit = entryDebitAccounts[id]?.find(acc => acc.title === value);
          
          if (!selectedDebit) {
            throw new Error(`Invalid debit account selection for ${value}`);
          }

          setEntries(prev => prev.map(entry => {
            if (entry.id === id) {
              const newDebits = [...entry.debits];
              newDebits[debitIndex] = {
                accountTitle: value,
                uacsCode: selectedDebit.uacsCode,
                amount: newDebits[debitIndex]?.amount || ""
              };
              return {
                ...entry,
                debits: newDebits
              };
            }
            return entry;
          }));

          setError(null);
        }
      } catch (error) {
        console.error("Error handling account change:", error);
        
        if (error.response?.status === 404) {
          setError(`Account mapping not found for "${value}". Please contact the administrator to set up the account mapping.`);
        } else {
          setError(`Failed to process account selection for "${value}". Please try again.`);
        }
        
        if (type === 'credit') {
          setEntries(prev => prev.map(entry => {
            if (entry.id === id) {
              return {
                ...entry,
                credit: {
                  accountTitle: "",
                  uacsCode: "",
                  amount: ""
                },
                debits: [{
                  accountTitle: "",
                  uacsCode: "",
                  amount: ""
                }]
              };
            }
            return entry;
          }));
          setEntryDebitAccounts(prev => ({
            ...prev,
            [id]: []
          }));
        }
      } finally {
        setLoading(false);
        setLoadingMessage("");
      }
    } else if (field === 'amount') {
      setEntries(prev => prev.map(entry => {
        if (entry.id === id) {
          if (type === 'credit') {
            return {
              ...entry,
              credit: {
                ...entry.credit,
                amount: value
              }
            };
          } else {
            const newDebits = [...entry.debits];
            newDebits[debitIndex] = {
              ...newDebits[debitIndex],
              amount: value
            };
            return {
              ...entry,
              debits: newDebits
            };
          }
        }
        return entry;
      }));
    }
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

      const response = await axios.get("http://localhost:8000/api/notifications/staff", {
        params: {
          staffEmail
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

  const markNotificationAsRead = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const staffEmail = localStorage.getItem("userEmail");

      if (!accessToken || !staffEmail) {
        console.error("No access token or email found");
        return;
      }

      await axios.patch(
        `http://localhost:8000/api/notifications/staff/${notificationId}/read`,
        { staffEmail },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update notifications list
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read");
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      notifications.forEach((notif) => {
        if (!notif.read) {
          markNotificationAsRead(notif._id);
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
        return;
      }

      setLoading(true);
      setError(null);

      // Prepare the complete form data
      const completeFormData = {
        ...formData,
        entries: entries.map(entry => ({
          credit: {
            accountTitle: entry.credit.accountTitle || "",
            uacsCode: entry.credit.uacsCode || "",
            amount: entry.credit.amount || ""
          },
          debits: entry.debits.map(debit => ({
            accountTitle: debit.accountTitle || "",
            uacsCode: debit.uacsCode || "",
            amount: debit.amount || ""
          }))
        }))
      };

      setLoadingMessage("Writing data to Google Sheet...");
      await writeDataToGoogleSheet(
        SPREADSHEET_ID,
        formatDVFormData(completeFormData, fundCluster, dvNumber)
      );

      setLoadingMessage("Generating to post in Google Drive file...");
      const { fileId, webViewLink } = await exportToPDF(
        SPREADSHEET_ID,
        "DV",
        dvNumber,
        completeFormData
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
          payeeName: formData.payeeName || "",
          amount: formData.amount || "",
          totalAmount: formData.totalAmount || "",
          date: formData.date || "",
          modeOfPayment: formData.modeOfPayment || "",
          address: formData.address || "",
          tinNumber: formData.tinNumber || "",
          bursNumber: formData.bursNumber || "",
          particulars: formData.particulars || "",
          responsibilityCenter: formData.responsibilityCenter || "",
          mfoPap: formData.mfoPap || "",
          nameOfVicePresident: formData.nameOfVicePresident || "",
          certified: formData.certified || "",
          approvedOfPayment: formData.approvedOfPayment || "",
          printedName1: formData.printedName1 || "",
          position1: formData.position1 || "",
          printedName2: formData.printedName2 || "",
          position2: formData.position2 || "",
          checkADANo: formData.checkADANo || "",
          bankNameAndAccountNo: formData.bankNameAndAccountNo || "",
          officialReceiptNo: formData.officialReceiptNo || "",
          entries: completeFormData.entries
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
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Voucher created successfully:", response.data);
      alert("Voucher created successfully!");
      
      // Open Google Sheet in new tab
      const sheetWindow = window.open(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=583941779#gid=583941779`, '_blank');
      
      // Add a small delay before redirecting to ensure the new tab opens
      setTimeout(() => {
        if (sheetWindow) {
          window.location.href = "/staffDashboard";
        } else {
          // If popup was blocked, show message and then redirect
          alert("Please allow popups to view the Google Sheet. Redirecting to dashboard...");
          window.location.href = "/staffDashboard";
        }
      }, 1000);
    } catch (error) {
      console.error("Error creating voucher:", error);
      if (error.response) {
        setError(error.response.data.message || "Failed to create voucher. Please try again.");
      } else {
        setError(error.message || "Failed to create voucher. Please try again.");
      }
    } finally {
      await releaseLock();
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // Add these handlers after the other handlers
  const handleAccountantNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      printedName1: e.target.value
    }));
  };

  const handleAccountantPositionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      position1: e.target.value
    }));
  };

  const handlePresidentNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      printedName2: e.target.value
    }));
  };

  const handlePresidentPositionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      position2: e.target.value
    }));
  };

  const handlePayeeNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      payeeName: e.target.value
    }));
  };

  const handleFundClusterChange = (e) => {
    setFundCluster(e.target.value);
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({
      ...prev,
      date: e.target.value
    }));
  };

  const handleDvNumberChange = (e) => {
    setDvNumber(e.target.value);
  };

  // Add this new function to calculate total amount from entries
  const calculateTotalFromEntries = () => {
    let total = 0;
    entries.forEach(entry => {
      // Add credit amount
      if (entry.credit.amount) {
        total += parseFloat(entry.credit.amount) || 0;
      }
      // Subtract debit amounts
      entry.debits.forEach(debit => {
        if (debit.amount) {
          total -= parseFloat(debit.amount) || 0;
        }
      });
    });
    return total;
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

        if (taskID) {
          // If taskID exists, fetch task data and populate the form
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
        } else {
          // If no taskID, reset form and fetch new DV/Fund Cluster numbers
          resetFormState();
          const [dvResponse, fcResponse] = await Promise.all([
            axios.get("http://localhost:8000/api/nextDvNumber"),
            axios.get("http://localhost:8000/api/nextFundCluster"),
          ]);
          setDvNumber(dvResponse.data.dvNumber);
          setFundCluster(fcResponse.data.fundCluster);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [taskID]);

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

  useEffect(() => {
    axios.get("http://localhost:8000/api/account-mapping")
      .then(res => setCreditOptions(res.data))
      .catch(err => console.error("Error fetching credit options:", err));
  }, []);

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
                        onClick={() => markNotificationAsRead(notification._id)}
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
                <input 
                  type="text" 
                  value={formData.payeeName} 
                  onChange={handlePayeeNameChange}
                />
              </div>
              <div>
                <label>Fund Cluster:</label>
                <input 
                  type="text"
                  value={fundCluster || ""}
                  onChange={handleFundClusterChange}
                />
              </div>
              <div>
                <label>Date:</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label>DV Number:</label>
                <input 
                  type="text"
                  value={dvNumber || ""}
                  onChange={handleDvNumberChange}
                />
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
                  
                />
              </div>
              <div>
                <label>Amount:</label>
                <input
                  type="number"
                  name="amount"
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  value={formData.amount}
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
              <div className="entries-section">
                <h3 style={{textAlign: "center", color: "#555"}}>Account Entries</h3>
                {entries.map((entry) => (
                  <div key={entry.id} className="entry-row">
                    <div className="entry-header">
                      <h4>Entry #{entry.id}</h4>
                      {entries.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="remove-entry-btn"
                        >
                          Remove Entry
                        </button>
                      )}
                    </div>
                    
                    <div className="entry-content">
                      <div className="credit-section">
                        <h5>Debit</h5>
                        <div>
                          <label>Account Title:</label>
                          <select
                            value={entry.credit.accountTitle}
                            onChange={(e) => handleEntryChange(entry.id, 'credit', 'accountTitle', e.target.value)}
                          >
                            <option value="">Select Debit</option>
                            {creditOptions.map((credit, idx) => (
                              <option key={idx} value={credit.title}>
                                {credit.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label>UACS Code:</label>
                          <input
                            type="text"
                            value={entry.credit.uacsCode}
                            readOnly
                          />
                        </div>
                        <div>
                          <label>Amount:</label>
                          <input
                            type="number"
                            value={entry.credit.amount}
                            onChange={(e) => handleEntryChange(entry.id, 'credit', 'amount', e.target.value)}
                            placeholder="Enter amount"
                          />
                        </div>
                      </div>

                      {entryDebitAccounts[entry.id]?.length > 0 && (
                        <div className="debit-section">
                          <h5>Credit</h5>
                          {entry.debits.map((debit, index) => (
                            <div key={index} className="debit-entry">
                              <div className="debit-header">
                                <h6>Credit #{index + 1}</h6>
                                {entry.debits.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDebit(entry.id, index)}
                                    className="remove-debit-btn"
                                  >
                                    Remove Credit
                                  </button>
                                )}
                              </div>
                              <div>
                                <label>Account Title:</label>
                                <select
                                  value={debit.accountTitle}
                                  onChange={(e) => handleEntryChange(entry.id, 'debit', 'accountTitle', e.target.value, index)}
                                >
                                  <option value="">Select Credit</option>
                                  {entryDebitAccounts[entry.id]?.map((account, idx) => (
                                    <option key={idx} value={account.title}>
                                      {account.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label>UACS Code:</label>
                                <input
                                  type="text"
                                  value={debit.uacsCode}
                                  readOnly
                                />
                              </div>
                              <div>
                                <label>Amount:</label>
                                <input
                                  type="number"
                                  value={debit.amount}
                                  onChange={(e) => handleEntryChange(entry.id, 'debit', 'amount', e.target.value, index)}
                                  placeholder="Enter amount"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddDebit(entry.id)}
                            className="add-debit-btn"
                          >
                            Add Another Credit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={handleAddEntry}
                  className="add-entry-btn"
                >
                  Add Another Entry
                </button>
              </div>
              <div>
                <label>Total Amount:</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
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
                <label>Accountant Name:</label>
                <input 
                  type="text" 
                  value={formData.printedName1}
                  onChange={handleAccountantNameChange}
                />
              </div>
              <div>
                <label>Position:</label>
                <input 
                  type="text" 
                  value={formData.position1}
                  onChange={handleAccountantPositionChange}
                />
              </div>
              <div>
                <label>University President:</label>
                <input 
                  type="text" 
                  value={formData.printedName2}
                  onChange={handlePresidentNameChange}
                />
              </div>
              <div>
                <label>Position:</label>
                <input 
                  type="text" 
                  value={formData.position2}
                  onChange={handlePresidentPositionChange}
                />
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