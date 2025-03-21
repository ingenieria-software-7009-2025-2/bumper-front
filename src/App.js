import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './components/Login/Login';
import Home from './components/Home/Home';
import Sidebar from './components/Layout/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;