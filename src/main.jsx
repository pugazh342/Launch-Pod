import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import our two main views
import Viewer from './pages/Viewer';
import AdminDashboard from './pages/AdminDashboard';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The public-facing grand opening screen */}
        <Route path="/" element={<Viewer />} />
        
        {/* The command center to trigger the launch */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);