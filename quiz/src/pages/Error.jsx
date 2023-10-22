import React from "react";
import { Link } from "react-router-dom";
export const Error = () => {
  return (
    <>
      <div className="error">
        <h1 style={{ color: "black" }}>OOOPSS! Error 404</h1>
        <p style={{ color: "black", fontSize: "20px" }}>Lobby not found</p>
        <Link to={"/"}>
          {" "}
          <button> ⬅️ Go back</button>
        </Link>
      </div>
    </>
  );
};
