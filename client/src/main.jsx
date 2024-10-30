import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./login.jsx";
import Staff from "./addStaff.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Staff />
  </StrictMode>
);
