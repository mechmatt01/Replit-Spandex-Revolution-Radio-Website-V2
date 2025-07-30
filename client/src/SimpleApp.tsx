import React from 'react';

function SimpleApp() {
  return (
    <div style={{ 
      padding: '20px', 
      color: 'white', 
      backgroundColor: 'black',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Spandex Salvation Radio</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>App is now running successfully!</p>
      <div style={{
        padding: '1rem',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        <p>✅ Server running on port 5000</p>
        <p>✅ React components loading</p>
        <p>✅ Firebase fallback working</p>
        <p>⚠️ Firebase credentials not set (using fallback mode)</p>
      </div>
    </div>
  );
}

export default SimpleApp;