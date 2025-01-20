import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

function ResultsList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch and parse the CSV file
    fetch('/2024pred.csv')
      .then(response => response.text())
      .then(csvText => {
        const parsed = Papa.parse(csvText, { header: true });
        setData(parsed.data);
      });
  }, []);

  return (
    <div>
      <h2>2024 Predictions</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Career AV Prediction</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{index}</td>
              <td>{row.name}</td>
              <td>{row.prediction_2024}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsList;