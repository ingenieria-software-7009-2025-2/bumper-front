import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle, AlertCircle } from "lucide-react";
import { fetchWithAuth } from "../../services/api";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editField, setEditField] = useState(null); // 'nombre', 'apellido', 'password'
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

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
      const refreshResponse = await fetchWithAuth(
        "http://localhost:8080/v1/incidentes/all",
        {
          method: "GET",
        }
      );

      if (!refreshResponse.ok) {
        throw new Error("Error al recargar los incidentes");
      }

      const refreshData = await refreshResponse.json();
      setIncidents(Array.isArray(refreshData) ? refreshData : []);

      // Mostrar mensaje de éxito
      alert("Estado actualizado correctamente");
    } catch (err) {
      console.error("Error:", err);
      alert(err.message);
      if (
        err.message.includes("autenticación") ||
        err.message.includes("token")
      ) {
        navigate("/");
      }
    }
  };

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
        const incidentsResponse = await fetchWithAuth(
          "http://localhost:8080/v1/incidentes/all",
          {
            method: "GET",
          }
        );

        if (!incidentsResponse.ok) {
          if (
            incidentsResponse.status === 401 ||
            incidentsResponse.status === 403
          ) {
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

        if (
          err.message.includes("autenticación") ||
          err.message.includes("token")
        ) {
          localStorage.removeItem("userId");
          navigate("/", { replace: true });
          return;
        }

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndIncidents();
  }, [navigate]);

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

  const handleSaveField = async (field) => {
    setSaving(true);
    try {
      const userId = user.id;
      const payload = {
        id: userId,
        nombre: field === "nombre" ? editValue : user.nombre,
        apellido: field === "apellido" ? editValue : user.apellido,
        password: field === "password" ? editValue : user.password,
      };

      const response = await fetchWithAuth(
        "http://localhost:8080/v1/users/update-datos-basicos",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || "Error al actualizar");

      // Actualizar el estado local del usuario
      setUser((prev) => ({
        ...prev,
        [field]: editValue,
      }));
      alert("Dato actualizado correctamente");
      setEditField(null);
      setEditValue("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
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
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            {/* Nombre */}
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={editField === "nombre" ? editValue : user?.nombre || ""}
                readOnly={editField !== "nombre"}
                onChange={(e) => setEditValue(e.target.value)}
              />
              {editField === "nombre" ? (
                <>
                  <button
                    type="button"
                    className="save-button"
                    disabled={saving || editValue === user.nombre}
                    onClick={() => handleSaveField("nombre")}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    disabled={saving}
                    onClick={() => {
                      setEditField(null);
                      setEditValue("");
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => {
                    setEditField("nombre");
                    setEditValue(user.nombre);
                  }}
                >
                  Modificar
                </button>
              )}
            </div>

            {/* Apellido */}
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                value={
                  editField === "apellido" ? editValue : user?.apellido || ""
                }
                readOnly={editField !== "apellido"}
                onChange={(e) => setEditValue(e.target.value)}
              />
              {editField === "apellido" ? (
                <>
                  <button
                    type="button"
                    className="save-button"
                    disabled={saving || editValue === user.apellido}
                    onClick={() => handleSaveField("apellido")}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    disabled={saving}
                    onClick={() => {
                      setEditField(null);
                      setEditValue("");
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => {
                    setEditField("apellido");
                    setEditValue(user.apellido);
                  }}
                >
                  Modificar
                </button>
              )}
            </div>

            {/* Correo electrónico (no editable) */}
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" value={user?.correo || ""} readOnly />
            </div>
           

            {/* Contraseña */}
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type={editField === "password" ? "text" : "password"}
                value={editField === "password" ? editValue : "****"}
                readOnly={editField !== "password"}
                onChange={(e) => setEditValue(e.target.value)}
                autoComplete="new-password"
              />
              {editField === "password" ? (
                <>
                  <button
                    type="button"
                    className="save-button"
                    disabled={saving || !editValue}
                    onClick={() => handleSaveField("password")}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    disabled={saving}
                    onClick={() => {
                      setEditField(null);
                      setEditValue("");
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => {
                    setEditField("password");
                    setEditValue("");
                  }}
                >
                  Modificar
                </button>
              )}
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
