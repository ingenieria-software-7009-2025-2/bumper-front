import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar'; // Asegúrate de que la ruta sea correcta

const PrivateRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default PrivateRoute;