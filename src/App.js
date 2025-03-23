import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Incidents from './components/Incidents/Incidents';
import Profile from './components/Profile/Profile';
import AuthForm from './components/Login/Login';
import Home from './components/Home/Home';
import Sidebar from './components/Layout/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz para el Login sin Sidebar */}
        <Route 
          path="/" 
          element={
            <div className="app-container">
              <AuthForm />
            </div>
          } 
        />
        {/* Ruta para el Home con Sidebar */}
        <Route 
          path="/home" 
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Home />
              </main>
            </div>
          } 
        />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;