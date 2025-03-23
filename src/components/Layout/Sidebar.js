import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Añadimos useNavigate
import { Home, UserCircle, AlertCircle, Info, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const correo = localStorage.getItem('userCorreo');
    if (!correo) {
      console.log('No hay usuario autenticado');
      navigate('/'); // Redirigir al login si no hay correo
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/v1/users/logout', {
        method: 'POST',
        headers: {
          correo: correo, // Enviar el correo como header
        },
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      // Limpiar el estado de autenticación en el frontend
      localStorage.removeItem('userCorreo');
      console.log('Sesión cerrada exitosamente');
      navigate('/'); // Redirigir al login
    } catch (err) {
      console.error('Error en el logout:', err.message);
      // Aunque falle el backend, limpiamos localStorage y redirigimos
      localStorage.removeItem('userCorreo');
      navigate('/');
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-content">
        <h1 className="sidebar-title">Bumper APP</h1>
        
        <nav className="sidebar-nav">
          <NavLink to="/home" className="nav-link">
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