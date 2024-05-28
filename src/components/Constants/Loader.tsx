import React from "react";
import "./loader.css";

// Loading component
const Loader = ({ loading }: any) => (
  <div className={`loader-background ${loading ? "loading" : ""}`}>
    <div className="loader-container">
      <div className="blue-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="134"
          height="135"
          viewBox="0 0 134 135"
          fill="none"
        >
          <circle cx="67" cy="67.5" r="67" fill="#99AEF9" />
        </svg>
      </div>
      <p className="loading-text">
        Your CV is converting!
        <br />
        It will just take a minute.
      </p>
    </div>
  </div>
);
export default Loader;
