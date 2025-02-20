import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { dvailogo } from '../Logos';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#5A6BB0]">
      {/* Header */}
      <div className="w-full h-32 bg-black">
        <div className="container mx-auto px-4 h-full flex items-center">
          <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
          <div className="flex space-x-8 text-white ml-12">
            <Link to="/" className="text-2xl font-roboto-condensed opacity-50">Player List</Link>
            <Link to="/about" className="text-2xl font-roboto-condensed underline">About Us</Link>
            <Link to="/mockdraft" className="text-2xl font-roboto-condensed opacity-50">Mock Draft</Link>
            <Link to="/largelist" className="text-2xl font-roboto-condensed opacity-50">Large List</Link>
            <Link to="/playercompare" className="text-2xl font-roboto-condensed opacity-50">Player Comparison</Link>
            <Link to="/playerinput" className="text-2xl font-roboto-condensed opacity-50">Player Input</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        <h1 className="text-4xl text-center text-white font-bold mb-4">About Us</h1>
        <p className="text-lg text-center text-white">
          Welcome to Draft Vision AI, your go-to platform for insightful and data-driven
          predictions in the world of sports. Our mission is to revolutionize the way
          scouting and drafting decisions are made using advanced AI models.
        </p>

        <div className="mt-12">
          <h2 className="text-2xl text-center text-white mb-4">Our Vision</h2>
          <p className="text-lg text-center text-white">
            We aim to empower teams, analysts, and enthusiasts with cutting-edge tools
            to analyze player performance and potential, ensuring better decisions and a
            deeper understanding of the game.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
