import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { googleLogout } from "@react-oauth/google";
import { MdOutlineLogout } from "react-icons/md";
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
} from "react-icons/bs";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const clientId =
  "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com";

const onSuccess = () => {
  console.log("Logout Successfully!");
};

function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleManageClick = () => {
    navigate("/manage"); // Navigate to the Manage route when button is clicked
  };

  const handleTaskClick = () => {
    navigate("/addTask"); // Navigate to the Task route when button is clicked
  };

  const handleStaffClick = () => {
    navigate("/addStaff"); // Navigate to the Staff route when button is clicked
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the Profile route when button is clicked
  };

  const handleLogout = () => {
    googleLogout();
    onSuccess();
    navigate("/");
  };

  const data = [
    {
      name: "Page A",
      made: 4000,
      need: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      made: 3000,
      need: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      made: 2000,
      need: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      made: 2780,
      need: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      made: 1890,
      need: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      made: 2390,
      need: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      made: 3490,
      need: 4300,
      amt: 2100,
    },
  ];

  const [staffCount, setStaffCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    // Fetch staff data and calculate the count
    const fetchStaffCount = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/staff");
        setStaffCount(response.data.length); // Set the count based on the data length
      } catch (error) {
        console.error("Error fetching staff count:", error);
      }
    };

    fetchStaffCount();
  }, []);

  useEffect(() => {
    // Fetch staff data and calculate the count
    const fetchTaskCount = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/task");
        setTaskCount(response.data.length); // Set the count based on the data length
      } catch (error) {
        console.error("Error fetching Task count:", error);
      }
    };

    fetchTaskCount();
  }, []);

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
          <button className="icon-button" onClick={handleProfileClick}>
            {" "}
            👤{" "}
          </button>
          <button className="icon-button">🔔</button>
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <button className="sidebar-btn">Dashboard</button>
          <button className="sidebar-btn" onClick={handleManageClick}>
            Manage
          </button>
          <button className="sidebar-btn" onClick={handleTaskClick}>
            Task
          </button>
          <button className="sidebar-btn" onClick={handleStaffClick}>
            Staff
          </button>
          <button className="log-btn" onClick={handleLogout}>
            Logout
            <MdOutlineLogout className="logout-icon" />
          </button>
        </aside>
        <main className="main-container">
          <div className="main-title">
            <h3>DASHBOARD</h3>
          </div>
          <div className="main-cards">
            <div className="card">
              <div className="card-inner">
                <h3>Staff</h3>
                <BsPeopleFill className="card_icon" />
              </div>
              <h1>{staffCount}</h1>
            </div>
            <div className="card">
              <div className="card-inner">
                <h3>Vouchers Made</h3>
                <BsFillGrid3X3GapFill className="card_icon" />
              </div>
              <h1>2000</h1>
            </div>
            <div className="card">
              <div className="card-inner">
                <h3>Vouchers Need</h3>
                <BsFillArchiveFill className="card_icon" />
              </div>
              <h1>{taskCount}</h1>
            </div>
          </div>
          <br /> <br />
          <br />
          <br />
          <br />
          <div className="charts">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="made" fill="#ff6d00" />
                <Bar dataKey="need" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="made"
                  stroke="#ff6d00"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="need" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
