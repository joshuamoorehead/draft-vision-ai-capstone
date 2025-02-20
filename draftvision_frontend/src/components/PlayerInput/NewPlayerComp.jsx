import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../../styles/main.css';

const NewPlayerComp = () => {
  return(
    <div className="min-h-screen bg-[#5A6BB0] text-white">
      <div className="container mx-auto px-4 h-full flex items-center">
        <h1 className="text-3xl font-bold text-white text-center">New Player Comparison Placeholder</h1>
        <div className="ml-auto">
          <Link to="/PlayerInput" className="text-xl text-white underline">
            Back to Player Input
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewPlayerComp;