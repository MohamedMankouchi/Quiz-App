import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { createContext } from "react";
import { io } from "socket.io-client";

const socket = io("https://quiz-io-backend.onrender.com");
export const socketContext = createContext();
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <socketContext.Provider value={socket}>
      <RouterProvider router={router} />
    </socketContext.Provider>
  </React.StrictMode>
);
