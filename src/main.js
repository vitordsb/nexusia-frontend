import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import logoImage from "./utils/logo.jpeg";
const ensureFavicon = () => {
    const head = document.head;
    if (!head)
        return;
    const existing = document.querySelector("link[rel~='icon']") ??
        document.getElementById("app-favicon");
    const link = existing ?? document.createElement("link");
    link.rel = "icon";
    link.type = "image/jpeg";
    link.href = logoImage;
    if (!existing) {
        head.appendChild(link);
    }
};
ensureFavicon();
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }) }));
