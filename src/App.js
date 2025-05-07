import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Incidents from './components/Incidents/Incidents';
import Profile from './components/Profile/Profile';
import AuthForm from './components/Login/Login';
import Home from './components/Home/Home';
import About from './components/About/About';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública para el Login */}
        <Route 
          path="/" 
          element={
            <div className="app-container">
              <AuthForm />
            </div>
          } 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/incidents" 
          element={
            <PrivateRoute>
              <Incidents />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/about" 
          element={
            <PrivateRoute>
              <About />
            </PrivateRoute>
          } 
        />

        {/* Ruta para manejar URLs no encontradas */}
        <Route 
          path="*" 
          element={
            <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;