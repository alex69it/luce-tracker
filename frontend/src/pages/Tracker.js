import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tracker.css';

function Tracker({ username }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to track');
  const [updateInterval, setUpdateInterval] = useState(5000);

  const getLocation = () => {
    setLoading(true);
    setStatus('Getting location...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          try {
            const token = localStorage.getItem('token');
            await axios.post(
              'http://localhost:5000/api/location/update',
              { latitude, longitude },
              {
                headers: { 'x-auth-token': token }
              }
            );
            setStatus(`✅ Position updated at ${new Date().toLocaleTimeString()}`);
          } catch (err) {
            setStatus('❌ Error sending position');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setStatus(`❌ Error: ${error.message}`);
          setLoading(false);
        }
      );
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const interval = setInterval(getLocation, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <div className="tracker-container">
      <div className="tracker-card">
        <h2>📍 GPS Tracker</h2>
        <p className="user-label">User: <strong>{username}</strong></p>

        <div className="status-box">
          <p>{status}</p>
        </div>

        {location && (
          <div className="location-info">
            <div className="location-item">
              <span>Latitude:</span>
              <span>{location.latitude.toFixed(6)}°</span>
            </div>
            <div className="location-item">
              <span>Longitude:</span>
              <span>{location.longitude.toFixed(6)}°</span>
            </div>
          </div>
        )}

        <button onClick={getLocation} disabled={loading} className="btn">
          {loading ? 'Getting...' : '📍 Update Position'}
        </button>

        <div className="interval-control">
          <label>Auto-update (seconds):</label>
          <select value={updateInterval / 1000} onChange={(e) => setUpdateInterval(e.target.value * 1000)}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="30">30</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Tracker;
