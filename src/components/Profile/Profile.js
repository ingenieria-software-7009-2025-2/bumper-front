import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle, AlertCircle, Trash2, Key } from "lucide-react";
import { fetchWithAuth } from "../../services/api";
import Swal from 'sweetalert2';
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Función para formatear fecha y hora
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const estadosIncidente = ["PENDIENTE", "EN_PROCESO", "RESUELTO"];

  // Función para manejar el cambio de contraseña
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña insegura',
        text: 'La contraseña debe tener al menos 6 caracteres',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setPasswordLoading(true);
    
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/");
        throw new Error("No estás autenticado");
      }

      const response = await fetchWithAuth(
        "http://localhost:8080/v1/users/update-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: parseInt(userId),
            nuevaPassword: newPassword
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al actualizar la contraseña");
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Contraseña actualizada correctamente',
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true
      });
      
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#dc3545'
      });
      
      if (
        err.message.includes("autenticación") ||
        err.message.includes("token")
      ) {
        navigate("/");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Función para manejar el cambio de estado
  const handleEstadoChange = async (incidenteId, nuevoEstado) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/");
        throw new Error("No estás autenticado");
      }

      const response = await fetchWithAuth(
        `http://localhost:8080/v1/incidentes/update-status/${incidenteId}?usuarioId=${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al actualizar el estado");
      }

      // Actualizar la lista de incidentes
      await fetchIncidents();

      // Mostrar mensaje de éxito con SweetAlert
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Estado actualizado correctamente',
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true
      });
      
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#dc3545'
      });
      
      if (
        err.message.includes("autenticación") ||
        err.message.includes("token")
      ) {
        navigate("/");
      }
    }
  };

  // Función para eliminar incidente
  const handleDeleteIncident = async (incidenteId) => {
    try {
      // Confirmar antes de eliminar con SweetAlert
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas eliminar este incidente? Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      
      if (!result.isConfirmed) return;

      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/");
        throw new Error("No estás autenticado");
      }

      const response = await fetchWithAuth(
        `http://localhost:8080/v1/incidentes/${incidenteId}?usuarioId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al eliminar el incidente");
      }

      // Actualizar la lista de incidentes
      await fetchIncidents();

      // Mostrar mensaje de éxito con SweetAlert
      await Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'Incidente eliminado correctamente',
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true
      });
      
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#dc3545'
      });
      
      if (
        err.message.includes("autenticación") ||
        err.message.includes("token")
      ) {
        navigate("/");
      }
    }
  };

  // Función para obtener incidentes
  const fetchIncidents = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/", { replace: true });
        return;
      }

      const incidentsResponse = await fetchWithAuth(
        `http://localhost:8080/v1/incidentes/usuario/${userId}`,
        {
          method: "GET",
        }
      );

      if (!incidentsResponse.ok) {
        if (incidentsResponse.status === 401 || incidentsResponse.status === 403) {
          throw new Error("Error de autenticación");
        }
        throw new Error("Error al cargar los incidentes");
      }

      const data = await incidentsResponse.json();
      console.log("Respuesta de incidentes:", data);

      // Extraer el array de incidentes según la estructura de la respuesta
      let incidentesArray = [];
      if (Array.isArray(data)) {
        incidentesArray = data;
      } else if (Array.isArray(data.incidentes)) {
        incidentesArray = data.incidentes;
      } else if (Array.isArray(data.data)) {
        incidentesArray = data.data;
      } else if (data.content && Array.isArray(data.content)) {
        incidentesArray = data.content;
      }

      setIncidents(incidentesArray);
    } catch (err) {
      console.error("Error:", err);
      throw err;
    }
  }, [navigate, setIncidents]);

  useEffect(() => {
    const fetchUserDataAndIncidents = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/", { replace: true });
          return;
        }

        // Obtener datos del usuario
        const userResponse = await fetchWithAuth(
          `http://localhost:8080/v1/users/${userId}`,
          {
            method: "GET",
          }
        );

        if (!userResponse.ok) {
          throw new Error("Error al obtener datos del usuario");
        }

        const userJson = await userResponse.json();
        setUser(userJson.usuario);

        // Obtener incidentes
        await fetchIncidents();
      } catch (err) {
        console.error("Error:", err);

        if (err.message.includes("autenticación") || err.message.includes("token")) {
          localStorage.removeItem('userId');
          navigate("/", { replace: true });
          return;
        }

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndIncidents();
  }, [navigate, fetchIncidents]);

  if (loading) {
    return (
      <div className="profile-container">Cargando datos del usuario...</div>
    );
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
              <input type="text" value={user?.nombre || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input type="text" value={user?.apellido || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" value={user?.correo || ""} readOnly />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="password-field">
                <input type="password" value="****" readOnly />
                <button 
                  type="button" 
                  className="change-password-btn"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Key size={16} />
                  Cambiar
                </button>
              </div>
            </div>
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
                    <span className="incident-type">
                      {incident.tipoIncidente}
                    </span>
                    <span className="incident-time">
                      {formatDateTime(incident.horaIncidente)}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>Ubicación:</strong> {incident.ubicacion}
                    </p>
                    <p>
                      <strong>Vialidad:</strong> {incident.tipoVialidad}
                    </p>
                    <div className="estado-container">
                      <p>
                        <strong>Estado:</strong>
                      </p>
                      <select
                        className={`estado-select estado-${incident.estado.toLowerCase()}`}
                        value={incident.estado}
                        onChange={(e) =>
                          handleEstadoChange(incident.id, e.target.value)
                        }
                      >
                        {estadosIncidente.map((estado) => (
                          <option
                            key={estado}
                            value={estado}
                            disabled={estado === incident.estado}
                          >
                            {estado.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p>
                      <strong>Reportado por:</strong> {incident.usuario?.nombre}{" "}
                      {incident.usuario?.apellido}
                    </p>

                    {/* Botón de eliminar */}
                    <button
                      className="delete-btn"
                      title="Eliminar incidente"
                      onClick={() => handleDeleteIncident(incident.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#888",
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        padding: "5px",
                        borderRadius: "4px"
                      }}
                      onMouseOver={e => e.currentTarget.style.color = "#e53e3e"}
                      onMouseOut={e => e.currentTarget.style.color = "#888"}
                    >
                      <Trash2 size={18} style={{ marginRight: "5px" }} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cambiar Contraseña</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={passwordLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;