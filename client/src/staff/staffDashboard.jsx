import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./staffDashboard.css";

const data = [
  { name: "Week 1", vouchers: 50 },
  { name: "Week 2", vouchers: 30 },
  { name: "Week 3", vouchers: 70 },
  { name: "Week 4", vouchers: 80 },
];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const navigate = useNavigate();

  const handleCreateVoucher = () => {
    const staffEmail = localStorage.getItem("userEmail");
    const staffName = localStorage.getItem("userName");
    if (!staffEmail || !staffName) {
      setError("Missing staff information. Please log in again.");
      return;
    }
    navigate("/voucher", {
      state: {
        staffEmail,
        staffName,
      },
    });
  };

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError(null);
        const staffEmail = localStorage.getItem("userEmail");

        const response = await axios.get("http://localhost:8000/api/vouchers", {
          params: {
            staffEmail: staffEmail,
          },
        });

        const formattedVouchers = response.data.map((voucher) => ({
          id: voucher.id,
          name: voucher.name,
          createdTime: new Date(voucher.createdTime).toLocaleDateString(),
          modifiedTime: new Date(voucher.modifiedTime).toLocaleDateString(),
          status: voucher.status,
          webViewLink: voucher.webViewLink,
        }));

        setVouchers(formattedVouchers);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        setError("Failed to load vouchers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const openInDrive = (webViewLink) => {
    window.open(webViewLink, "_blank");
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("googleToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="dashboard">
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
        <aside className="sidebar">
          <button className="sidebar-btn">Dashboard</button>
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
            <MdOutlineLogout className="logout-icon" />
          </button>
        </aside>
        <main className="main-container">
          {error && <div className="error-message">{error}</div>}
          <div className="main-title">
            <h3>DASHBOARD</h3>
            <button
              className="create-voucher-btn"
              onClick={handleCreateVoucher}
            >
              Create Voucher
            </button>
          </div>

          <div className="charts">
            <div className="chart-card">
              <h4>Monthly Summary</h4>
              {vouchers.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vouchers" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data-message">
                  <p>No data to display yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="vouchers-table-container">
            <h4>Your Vouchers</h4>
            {loading ? (
              <div className="loading-message">Loading vouchers...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : vouchers.length === 0 ? (
              <div className="no-vouchers-message">
                <p>You haven't created any vouchers yet.</p>
                <button
                  className="create-first-voucher"
                  onClick={handleCreateVoucher}
                >
                  Create Your First Voucher
                </button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="vouchers-table">
                  <thead>
                    <tr>
                      <th>Voucher Name</th>
                      <th>Created Date</th>
                      <th>Last Modified</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((voucher) => (
                      <tr key={voucher.id}>
                        <td>{voucher.name}</td>
                        <td>{voucher.createdTime}</td>
                        <td>{voucher.modifiedTime}</td>
                        <td>
                          <span
                            className={`status-badge ${voucher.status.toLowerCase()}`}
                          >
                            {voucher.status}
                          </span>
                        </td>
                        <td>
                          {voucher.webViewLink && (
                            <button
                              className="view-drive-btn"
                              onClick={() => openInDrive(voucher.webViewLink)}
                            >
                              View in Drive
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
