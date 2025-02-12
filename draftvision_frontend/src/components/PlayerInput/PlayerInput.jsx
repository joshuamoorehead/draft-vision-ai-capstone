import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import { dvailogo } from '../Logos';

const PlayerInput = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState(''); // Selected position
  const [year, setYear] = useState('2024'); // Selected draft year
  const navigate = useNavigate();

  const renderPositionSpecificFields = () => {
    switch (position) {
      case 'QB':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Passing Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter passing yards" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Rushing Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter rushing yards" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Touchdowns</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter touchdowns" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Interceptions</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter interceptions" />
            </div>
          </div>
        );
      case 'RB':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Rushing Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter rushing yards" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Carries</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter rushing attempts" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Touchdowns</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter touchdowns" />
            </div>
          </div>
        );
      case 'WR':
      case 'TE':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Receiving Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter receiving yards" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Receptions</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter receptions" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Touchdowns</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter touchdowns" />
            </div>
          </div>
        );
      case 'LB':
      case 'DL':
      case 'CB':
      case 'S':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Tackles</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter tackles" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Interceptions</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter interceptions" />
            </div>
          </div>
        );
      case 'OL':
        return(
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">40-yard Dash</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter 40 time" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Three-cone Drill</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter three-cone time" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">20-yard Shuttle Drill</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter shuttle time" />
            </div>

            <div>
              <label className="text-sm text-white font-medium">Bench Press</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter reps of 225" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleNewPlayer = () => {
    switch(position) {
      case 'QB':
      case 'RB':
      case 'WR':
      case 'TE':
      case 'LB':
      case 'DL':
      case 'CB':
      case 'S':
      case 'OL':
        navigate("/newplayercomp", { state: { name } });
      default:
        return;
    }
  };

  return (
    <div className="min-h-screen bg-[#5A6BB0]">
      <div className="w-full h-32 bg-black">
        <div className="container mx-auto px-4 h-full flex items-center">
          <img src={dvailogo} alt="Draft Vision AI Logo" className="h-32 w-32" />
          <div className="flex space-x-8 text-white ml-12">
            <Link to="/" className="text-2xl font-roboto-condensed opacity-50">Player List</Link>
            <Link to="/about" className="text-2xl font-roboto-condensed opacity-50">About Us</Link>
            <Link to="/mockdraft" className="text-2xl font-roboto-condensed opacity-50">Mock Draft</Link>
            <Link to="/largelist" className="text-2xl font-roboto-condensed opacity-50">Large List</Link>
            <Link to="/playercompare" className="text-2xl font-roboto-condensed opacity-50">Player Comparison</Link>
            <Link to="/playerinput" className="text-2xl font-roboto-condensed underline">Player Input</Link>
          </div>
        </div>
      </div>
      <div className="container px-8 mt-8 space-y-3">
        <h1 className="text-2xl text-white">Create a Player</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-white font-medium">Name</label>
            <input type="text" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter player name" onChange={(e) => setName(e.target.value)} />
          </div>
          
          <div>
            <label className="text-sm font-medium text-white">Position</label>
            <select className="p-2 border-2 border-black rounded bg-white w-full" value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="">Select a Position</option>
              <option value="QB">Quarterback (QB)</option>
              <option value="RB">Running Back (RB)</option>
              <option value="WR">Wide Receiver (WR)</option>
              <option value="TE">Tight End (TE)</option>
              <option value="OL">Offensive Line (OL)</option>
              <option value="CB">Cornerback (CB)</option>
              <option value="S">Safety (S)</option>
              <option value="LB">Linebacker (LB)</option>
              <option value="DL">Defensive Line (DL)</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-white">Draft Year</label>
            <select className="p-2 border-2 border-black rounded bg-white w-full" value={year} onChange={(e) => setYear(e.target.value)}>
              {[...Array(14)].map((_, i) => {
                const yearValue = 2024 - i;
                return <option key={yearValue} value={yearValue}>{yearValue}</option>;
              })}
            </select>
          </div>
        </div>
        {renderPositionSpecificFields()}
      </div>
      <div className="container mx-auto px-4 mt-8 text-center">
        {/* Generate New Player */}
        <button
          onClick={handleNewPlayer}
          className="mt-8 px-6 py-2 bg-white text-black text-lg font-semibold rounded hover:bg-gray-200"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default PlayerInput;