import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle, AlertCircle } from "lucide-react"; // Cambiamos MapPin por AlertCircle
import "./Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [incidents, setIncidents] = useState([]); // Estado para los incidentes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Recuperar datos del usuario e incidentes al cargar el componente
  useEffect(() => {
    const fetchUserDataAndIncidents = async () => {
      const correo = localStorage.getItem("userCorreo");
      if (!correo) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        navigate("/");
        return;
      }

      try {
        // Obtener datos del usuario
        const userResponse = await fetch("http://localhost:8080/v1/users/me", {
          method: "GET",
          headers: {
            correo: correo,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Error al recuperar los datos del usuario");
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Obtener incidentes del usuario
        const incidentsResponse = await fetch(`http://localhost:8080/v1/incidentes/usuario/${userData.id}`, {
          method: "GET",
        });

        if (!incidentsResponse.ok) {
          throw new Error("Error al cargar los incidentes");
        }

        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserDataAndIncidents();
  }, [navigate]);

  if (loading) {
    return <div className="profile-container">Cargando datos del usuario...</div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <p className="error-message">{error}</p>
        <Link to="/home" className="back-button">
          <ArrowLeft size={20} /> Volver al inicio de sesión
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
              <input type="text" value={userData.nombre} readOnly />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input type="text" value={userData.apellido} readOnly />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" value={userData.correo} readOnly />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={userData.password} readOnly />
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
            <h2>Incidentes Reportados</h2>
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
                      {new Date(incident.horaIncidente).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Ubicación:</strong> {incident.ubicacion}</p>
                    <p><strong>Vialidad:</strong> {incident.tipoVialidad}</p>
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