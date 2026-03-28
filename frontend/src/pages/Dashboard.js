import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import './Dashboard.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/location/all');
      setLocations(response.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group locations by userId
  const groupedLocations = {};
  locations.forEach(loc => {
    if (!groupedLocations[loc.userId]) {
      groupedLocations[loc.userId] = [];
    }
    groupedLocations[loc.userId].push([loc.latitude, loc.longitude]);
  });

  const latestLocations = {};
  locations.forEach(loc => {
    if (!latestLocations[loc.userId]) {
      latestLocations[loc.userId] = loc;
    }
  });

  const center = Object.values(latestLocations).length > 0
    ? [Object.values(latestLocations)[0].latitude, Object.values(latestLocations)[0].longitude]
    : [45.4642, 9.1900];

  return (
    <div className="dashboard-container">
      <h2>🗺️ Live Map Dashboard</h2>
      
      <div className="map-wrapper">
        {loading ? (
          <p>Loading map...</p>
        ) : (
          <MapContainer center={center} zoom={13} className="map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            
            {Object.entries(latestLocations).map(([userId, loc]) => (
              <Marker key={userId} position={[loc.latitude, loc.longitude]}>
                <Popup>{userId} - {new Date(loc.timestamp).toLocaleTimeString()}</Popup>
              </Marker>
            ))}

            {Object.entries(groupedLocations).map(([userId, path]) => (
              path.length > 1 && (
                <Polyline
                  key={`path-${userId}`}
                  positions={path}
                  color="blue"
                  weight={2}
                  opacity={0.5}
                />
              )
            ))}
          </MapContainer>
        )}
      </div>

      <div className="locations-list">
        <h3>📍 Current Positions</h3>
        {Object.entries(latestLocations).map(([userId, loc]) => (
          <div key={userId} className="location-card">
            <h4>{userId}</h4>
            <p>Lat: {loc.latitude.toFixed(6)}°</p>
            <p>Lng: {loc.longitude.toFixed(6)}°</p>
            <p className="timestamp">{new Date(loc.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
