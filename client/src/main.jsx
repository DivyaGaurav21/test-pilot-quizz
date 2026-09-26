import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
import { ExamProvider } from "./context/ExamContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ExamProvider>
          <App />
        </ExamProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
