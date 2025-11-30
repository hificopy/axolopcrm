import React from 'react';
import ReactDOM from 'react-dom/client';

// Super simple test to see if React renders at all
ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{
    padding: '20px',
    background: 'red',
    color: 'white',
    fontSize: '24px',
    minHeight: '100vh'
  }}>
    <h1>REACT IS WORKING - Test Render</h1>
    <p>If you see this, React is rendering correctly.</p>
    <p>The issue is likely in App.jsx or one of its dependencies.</p>
  </div>
);
