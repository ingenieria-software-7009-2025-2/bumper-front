import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { fetchWithAuth } from "../../services/api";
import "./Incidents.css";

const Incidents = () => {
  const [formData, setFormData] = useState({
    type: "",
    location: "",
    time: "",
    roadType: "",
    latitude: "",
    longitude: "",
  });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  // Función para obtener la ubicación actual
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setError(
            "No se pudo obtener la ubicación actual. Por favor, intente de nuevo."
          );
        }
      );
    } else {
      setError("Geolocalización no está disponible en este navegador.");
    }
  };

  // Cargar todos los incidentes al montar el componente
  useEffect(() => {
    const fetchAllIncidents = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/v1/incidentes/all",
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar los incidentes");
        }

        const data = await response.json();
        console.log("Respuesta de incidentes:", data);

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
        setLoading(false);
      } catch (err) {
        console.error("Error completo:", err);
        setError(err.message);
        setLoading(false);
        // Usar navigate para redireccionar en caso de error de autenticación
        if (
          err.message.includes("autenticación") ||
          err.message.includes("token")
        ) {
          navigate("/");
        }
      }
    };

    fetchAllIncidents();
  }, [navigate]); // Agregar navigate como dependencia

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/");
        throw new Error("No estás autenticado");
      }

      // Crear el objeto de solicitud según la estructura que espera el backend
      const incidenteRequest = {
        usuarioId: parseInt(userId),
        tipoIncidente: formData.type.toUpperCase(),
        ubicacion: formData.location,
        tipoVialidad: formData.roadType.toUpperCase(),
        latitud: parseFloat(formData.latitude) || 0,
        longitud: parseFloat(formData.longitude) || 0,
      };

      // Hacer la petición al nuevo endpoint
      const response = await fetchWithAuth(
        "http://localhost:8080/v1/incidentes/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(incidenteRequest),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.mensaje || "Error al reportar el incidente"
        );
      }

      // Mostrar mensaje de éxito
      alert("Incidente reportado exitosamente");

      // Recargar la lista de incidentes
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

      // Limpiar el formulario
      setFormData({
        type: "",
        location: "",
        roadType: "",
        latitude: "",
        longitude: "",
      });
    } catch (err) {
      console.error("Error completo:", err);
      setError(err.message);
      if (
        err.message.includes("autenticación") ||
        err.message.includes("token")
      ) {
        navigate("/");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return <div className="incidents-container">Cargando incidentes...</div>;
  }

  if (error) {
    return (
      <div className="incidents-container">
        <p className="error-message">{error}</p>
        <Link to="/home" className="back-button">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="incidents-container">
      <div className="header-section">
        <Link to="/home" className="back-button">
          <ArrowLeft size={20} />
          Volver al inicio
        </Link>
        <h1>
          <AlertCircle /> Reportar Incidente
        </h1>
      </div>

      <div className="incidents-content">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="incident-form">
          <div className="form-group">
            <label>Tipo de Incidente</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="BACHE">Bache</option>
              <option value="SEMAFORO_DAÑADO">Semáforo dañado</option>
              <option value="ILUMINACION">Iluminación</option>
              <option value="ACCIDENTE">Accidente</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              name="location"
              placeholder="Ej: Av. Principal #123"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Vialidad</label>
            <select
              name="roadType"
              value={formData.roadType}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar vialidad</option>
              <option value="AVENIDA">Avenida</option>
              <option value="CALLE">Calle</option>
              <option value="CARRETERA">Carretera</option>
              <option value="PERIFERICO">Periférico</option>
            </select>
          </div>

          <div className="form-group coordinates-group">
            <button
              type="button"
              className="location-button"
              onClick={getCurrentLocation}
            >
              Obtener Ubicación Actual
            </button>
            <div className="coordinates-inputs">
              <input
                type="number"
                name="latitude"
                placeholder="Latitud"
                value={formData.latitude}
                onChange={handleChange}
                step="any"
                required
              />
              <input
                type="number"
                name="longitude"
                placeholder="Longitud"
                value={formData.longitude}
                onChange={handleChange}
                step="any"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button">
            Reportar Incidente
          </button>
        </form>

        {/* Listado de Incidentes */}
        <div className="incidents-list">
          <h2>Todos los Incidentes</h2>
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
                    <p>
                      <strong>Estado:</strong> {incident.estado}
                    </p>
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

export default Incidents;
