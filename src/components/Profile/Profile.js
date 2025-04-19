import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserCircle, AlertCircle } from "lucide-react";
import { fetchWithAuth } from '../../services/api';
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchUserDataAndIncidents = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        // Obtener datos del usuario
        const userResponse = await fetchWithAuth(`http://localhost:8080/v1/users/${userId}`, {
          method: "GET",
        });
        const userJson = await userResponse.json();
        setUser(userJson.usuario);

        // Obtener incidentes del usuario
        const incidentsResponse = await fetchWithAuth(
          `http://localhost:8080/v1/incidentes/usuario/${userId}`,
          { method: "GET" }
        );
        const incidentsData = await incidentsResponse.json();

        // DEBUG: Muestra la estructura real de la respuesta
        console.log("Respuesta de incidentes:", incidentsData);

        // Extrae el array de incidentes según la estructura real
        let incidentesArray = [];
        if (Array.isArray(incidentsData)) {
          incidentesArray = incidentsData;
        } else if (Array.isArray(incidentsData.incidentes)) {
          incidentesArray = incidentsData.incidentes;
        } else if (Array.isArray(incidentsData.data)) {
          incidentesArray = incidentsData.data;
        } else if (incidentsData.content && Array.isArray(incidentsData.content)) {
          incidentesArray = incidentsData.content;
        }

        setIncidents(incidentesArray);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndIncidents();
  }, []);

  if (loading) {
    return <div className="profile-container">Cargando datos del usuario...</div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <p className="error-message">{error}</p>
        <Link to="/" className="back-button">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>
      </div>
    );
  }

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
              <input type="text" value={user?.nombre || ''} readOnly />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input type="text" value={user?.apellido || ''} readOnly />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" value={user?.correo || ''} readOnly />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value="********" readOnly />
            </div>

            <button type="button" className="save-button" disabled>
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* Listado de Incidentes */}
        <div className="incidents-list">
          <div className="incidents-header">
            <AlertCircle className="incidents-icon" />
            <h2>Incidentes Reportados ({incidents.length})</h2>
          </div>
          <div className="list-container">
            {incidents.length === 0 ? (
              <p>No hay incidentes reportados aún.</p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="incident-card">
                  <div className="card-header">
                    <span className="incident-type">{incident.tipoIncidente}</span>
                    <span className="incident-time">
                      {formatDateTime(incident.horaIncidente)}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Ubicación:</strong> {incident.ubicacion}</p>
                    <p><strong>Vialidad:</strong> {incident.tipoVialidad}</p>
                    <p><strong>Estado:</strong> {incident.estado}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;