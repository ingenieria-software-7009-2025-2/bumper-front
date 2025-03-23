import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { UserCircle, MapPin } from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const userData = {
    name: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    password: "••••••••",
  };

  return (
    <div className="profile-container">
      <div className="header-section">
        <Link to="/home" className="back-button">
          <ArrowLeft size={20} />
          Volver al inicio
        </Link>
      </div>

      <div className="profile-header">
        <h1>
          <UserCircle /> Mi Perfil
        </h1>
      </div>

      <div className="profile-content">
        {/* Formulario de Perfil */}
        <div className="profile-form-section">
          <form className="profile-form">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" value={userData.name} readOnly />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input type="text" value={userData.lastName} readOnly />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" value={userData.email} readOnly />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={userData.password} readOnly />
            </div>

            <button type="button" className="save-button">
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* Sección del Mapa */}
        <div className="profile-map-section">
          <div className="map-header">
            <MapPin className="map-icon" />
            <h2>Ubicación Registrada</h2>
          </div>
          <div className="map-placeholder">
            <p>Mapa de ubicación del usuario</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
