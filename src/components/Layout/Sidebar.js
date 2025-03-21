import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UserCircle, AlertCircle, Info, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const handleLogout = () => {
    console.log('Cerrar sesión');
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-content">
        <h1 className="sidebar-title">Bumper APP</h1>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className="nav-link">
            <Home className="nav-icon" />
            Inicio
          </NavLink>

          <NavLink to="/profile" className="nav-link">
            <UserCircle className="nav-icon" />
            Perfil
          </NavLink>

          <NavLink to="/incidents" className="nav-link">
            <AlertCircle className="nav-icon" />
            Incidentes
          </NavLink>

          <NavLink to="/about" className="nav-link">
            <Info className="nav-icon" />
            Acerca de
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="logout-button">
          <LogOut className="logout-icon" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;