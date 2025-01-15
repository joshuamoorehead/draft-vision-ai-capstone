import React from 'react';
import { Link } from 'react-router-dom';
import { dvailogo } from '../Logos';
import '../../styles/main.css';

const LargeList = () => {
  return (
    <div className="min-h-screen bg-[#5A6BB0]">
      {/* Header */}
      <div className="w-full h-32 bg-black">
        <div className="container mx-auto px-4 h-full flex items-center">
          <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
          <div className="flex space-x-8 text-white ml-12">
            <Link to="/" className="text-2xl font-roboto-condensed opacity-50">Player List</Link>
            <Link to="/about" className="text-2xl font-roboto-condensed opacity-50">About Us</Link>
            <Link to="/mockdraft" className="text-2xl font-roboto-condensed opacity-50">Mock Draft</Link>
            <Link to="/largelist" className="text-2xl font-roboto-condensed underline">Large List</Link>
          </div>
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="container mx-auto px-4 mt-8">
        <h3 className="text-3xl text-white text-center">Large List Page Coming Soon</h3>
      </div>
    </div>
  );
};

export default LargeList;
