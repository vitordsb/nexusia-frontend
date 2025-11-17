import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import logoImage from "./utils/logo.jpeg";

const ensureFavicon = () => {
  const head = document.head;
  if (!head) return;

  const existing =
    (document.querySelector("link[rel~='icon']") as HTMLLinkElement | null) ??
    (document.getElementById("app-favicon") as HTMLLinkElement | null);

  const link = existing ?? document.createElement("link");
  link.rel = "icon";
  link.type = "image/jpeg";
  link.href = logoImage;
  if (!existing) {
    head.appendChild(link);
  }
};

ensureFavicon();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
