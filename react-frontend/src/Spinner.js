import React from "react";
import './spinner.css'

function Spinner() {
  return (
    <div className="spinner">
      <div className="spinner-dot"></div>
      <div className="spinner-dot"></div>
      <div className="spinner-dot"></div>
    </div>
  );
}

export default Spinner;