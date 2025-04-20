import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, UserCircle, AlertCircle, Info, LogOut } from "lucide-react";
import { logout } from "../../services/auth"; // Importamos el servicio de logout
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Usamos el servicio de logout que maneja todo internamente
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún si hay error, redirigimos al login
      navigate("/");
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
