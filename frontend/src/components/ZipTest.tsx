import React, { useState } from 'react';
import { getCityFromZip } from '../utils/zipUtils';

const ZipTest: React.FC = () => {
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  
  const handleLookup = () => {
    const result = getCityFromZip(zipCode);
    setCity(result);
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Zip Code City Lookup</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter ZIP code"
          style={{ padding: '8px', width: '200px', marginRight: '10px' }}
        />
        <button 
          onClick={handleLookup}
          style={{ padding: '8px 16px', background: '#b71c1c', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Lookup
        </button>
      </div>
      
      {city && (
        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <p><strong>ZIP Code:</strong> {zipCode}</p>
          <p><strong>City:</strong> {city}</p>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h3>How It Works</h3>
        <ul style={{ textAlign: 'left' }}>
          <li>Uses the <code>zipcodes</code> npm package for zipcode lookups</li>
          <li>Provides immediate synchronous results</li>
          <li>Falls back to local data if not found in package database</li>
          <li>No external API calls needed (offline support)</li>
        </ul>
      </div>
    </div>
  );
};

export default ZipTest; 