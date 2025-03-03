import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/main.css';
import { dvailogo } from '../Logos';
import PageTransition from '../Common/PageTransition';

const PlayerInput = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState(''); // Selected position
  const [year, setYear] = useState('2024'); // Selected draft year
  const [draftRound, setDraftRound] = useState('');
  const navigate = useNavigate();

  const [statQBPassYds, setStatQBPassYds] = useState('');
  const [statQBRushYds, setStatQBRushYds] = useState('');
  const [statQBTds, setStatQBTds] = useState('');
  const [statQBInt, setStatQBInt] = useState('');

  const [statRBRushYds, setStatRBRushYds] = useState('');
  const [statRBCarries, setStatRBCarries] = useState('');
  const [statRBTds, setStatRBTds] = useState('');

  const [statWRRecYds, setStatWRRecYds] = useState('');
  const [statWRRec, setStatWRRec] = useState('');
  const [statWRTds, setStatWRTds] = useState('');

  const [statTERecYds, setStatTERecYds] = useState('');
  const [statTERec, setStatTERec] = useState('');
  const [statTETds, setStatTETds] = useState('');

  const [statOL40, setStatOL40] = useState('');
  const [statOLCone, setStatOLCone] = useState('');
  const [statOLShuttle, setStatOLShuttle] = useState('');
  const [statOLBench, setStatOLBench] = useState('');

  const [statDefTackles, setStatDefTackles] = useState('');
  const [statDefInt, setStatDefInt] = useState('');




  const renderPositionSpecificFields = () => {
    switch (position) {
      case 'QB':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Passing Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter passing yards" onChange={(e) => setStatQBPassYds(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Rushing Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter rushing yards" onChange={(e) => setStatQBRushYds(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Touchdowns</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter touchdowns" onChange={(e) => setStatQBTds(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Interceptions</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter interceptions" onChange={(e) => setStatQBInt(e.target.value)}/>
            </div>
          </div>
        );
      case 'RB':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Rushing Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter rushing yards" onChange={(e) => setStatRBRushYds(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Carries</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter rushing attempts" onChange={(e) => setStatRBCarries(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Touchdowns</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter touchdowns" onChange={(e) => setStatRBTds(e.target.value)}/>
            </div>
          </div>
        );
      case 'WR':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Receiving Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter receiving yards" onChange={(e) => setStatWRRecYds(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Receptions</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter receptions" onChange={(e) => setStatWRRec(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Touchdowns</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter touchdowns" onChange={(e) => setStatWRTds(e.target.value)}/>
            </div>
          </div>
        );
      case 'TE':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">Receiving Yards</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter receiving yards" onChange={(e) => setStatTERecYds(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Receptions</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter receptions" onChange={(e) => setStatTERec(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Touchdowns</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter touchdowns" onChange={(e) => setStatTETds(e.target.value)}/>
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
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter tackles" onChange={(e) => setStatDefTackles(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Interceptions</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter interceptions" onChange={(e) => setStatDefInt(e.target.value)}/>
            </div>
          </div>
        );
      case 'OL':
        return(
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-white font-medium">40-yard Dash</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter 40 time" onChange={(e) => setStatOL40(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Three-cone Drill</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter three-cone time" onChange={(e) => setStatOLCone(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">20-yard Shuttle Drill</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter shuttle time" onChange={(e) => setStatOLShuttle(e.target.value)}/>
            </div>

            <div>
              <label className="text-sm text-white font-medium">Bench Press</label>
              <input type="number" className="p-2 border-2 border-black rounded bg-white w-full" placeholder="Enter reps of 225" onChange={(e) => setStatOLBench(e.target.value)}/>
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
        navigate("/newplayercomp", { state: { name, position, draftRound } });
        break;
      default:
        navigate("/newplayercomp", { state: { name, position } })
        return;
    }
  };

  const handleSimplePlayer = () => {
    let score = getRawScore();
    console.log(score);
    const round = getDraftRound(score);
    setDraftRound(round);
    navigate("/newplayercomp", { state: { name, position, year, draftRound: round } })
    return;
  }

  const getRawScore = () => {
    let score = 0;
    switch(position) {
        case 'QB': score = (statQBPassYds * 0.01) + (statQBTds * 0.8) + (statQBRushYds * 0.02) - (statQBInt * 0.4); break;
        case 'RB': score = (statRBRushYds * 0.04) + (statRBCarries * 0.02) + (statRBTds * 0.8); break;
        case 'WR': score = (statWRRecYds * 0.04) + (statWRRec * 0.02) + (statWRTds * 0.8); break;
        case 'TE': score = (statTERecYds * 0.04) + (statTERec * 0.02) + (statTETds * 0.8); break;
        case 'LB': 
        case 'DL':
        case 'CB':
        case 'S': score = (statDefTackles * 0.5) + (statDefInt * 5); break;
        case 'OL': score = (statOL40 * -.5) + (statOLCone * -.5) + (statOLShuttle * -.5) + (statOLBench * 2); break;
        default: score = 0;
    }
    return score;
  };

  const getDraftRound = (score) => {
    if (score >= 90) return 1;
    if (score >= 75) return 2;
    if (score >= 60) return 3;
    if (score >= 45) return 4;
    if (score >= 30) return 5;
    if (score >= 15) return 6;
    return 7;
};

  return (
    <PageTransition>
    <div className="min-h-screen bg-[#5A6BB0]">
   
    
      <div className="container px-8 mt-8 space-y-3">
      <h1 className="text-4xl text-white font-bold mb-4 mt-8 text-center">Player Input</h1>
        <p className="text-white text-lg mb-4 text-center">
          Create your own player with inputted stats and see where they would get drafted in a draft class.
        </p>
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
          onClick={handleSimplePlayer}
          className="mt-8 px-6 py-2 bg-white text-black text-lg font-semibold rounded hover:bg-gray-200"
        >
          Create
        </button>
      </div>
    </div>
    </PageTransition>
  );
};

export default PlayerInput;