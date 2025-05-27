import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { fetchWithAuth } from "../../services/api";
import LocationPicker from './LocationPicker';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./Incidents.css";

// Función para crear un icono personalizado con SVG inline
const createSvgIcon = (color, iconType) => {
  // Definir el SVG según el tipo de incidente
  let svgPath;
  
  switch (iconType) {
    case 'ILUMINACION':
      svgPath = 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 16a1 1 0 0 1-1-1v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1zm-8-9a1 1 0 0 1-1-1 1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H4zm16-1a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2h-2zM6.34 17.66a1 1 0 0 1-1.41-1.41l1.41-1.41a1 1 0 0 1 1.41 1.41l-1.41 1.41zm12.73-12.73a1 1 0 0 1-1.41 0L16.24 3.51a1 1 0 0 1 1.41-1.41l1.42 1.42a1 1 0 0 1 0 1.41zm-14.14 0a1 1 0 0 1 0-1.41L6.34 2.1a1 1 0 0 1 1.41 1.41L6.34 4.93a1 1 0 0 1-1.41 0zM12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm5.66 15.66l1.41 1.41a1 1 0 0 1-1.41 1.41l-1.41-1.41a1 1 0 0 1 1.41-1.41z'; // Lightbulb
      break;
    case 'BACHES':
      svgPath = 'M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3zM12 8.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V9a.5.5 0 0 1 .5-.5zm.5 8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z'; // AlertTriangle
      break;
    case 'BASURA':
      svgPath = 'M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6'; // Trash
      break;
    default:
      svgPath = 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v4m0 4h.01'; // HelpCircle
  }

  // Crear el HTML del SVG
  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="${svgPath}"></path>
    </svg>
  `;

  // Crear un div icon con el SVG
  return L.divIcon({
    html: `<div class="custom-marker" style="background-color: white; border-radius: 50%; padding: 5px; border: 2px solid ${color};">${svgHtml}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

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

  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation([lat, lng]);
    setFormData(prev => ({
    ...prev,
    latitude: lat.toString(),
    longitude: lng.toString()
    }));
  };

  // Función para obtener el color según el estado
  const getColorByState = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#ff6b6b'; // Rojo
      case 'EN_PROCESO':
        return '#feca57'; // Amarillo
      case 'RESUELTO':
        return '#1dd1a1'; // Verde
      default:
        return '#4a90e2'; // Azul por defecto
    }
  };

  // Función para obtener el icono según el tipo y estado
  const getIncidentIcon = (incident) => {
    const color = getColorByState(incident.estado);
    return createSvgIcon(color, incident.tipoIncidente);
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
    if (response.status === 401 || response.status === 403) {
    throw new Error("Error de autenticación");
    }
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
    } catch (err) {
    console.error("Error al cargar incidentes:", err);

    if (
    err.message.includes("autenticación") ||
    err.message.includes("token")
    ) {
    localStorage.removeItem('userId');
    navigate("/", { replace: true });
    return;
    }

    setError(err.message);
    } finally {
    setLoading(false);
    }
    };

    fetchAllIncidents();
  }, [navigate]);

  if (loading) {
    return <div className="incidents-container">Cargando incidentes...</div>;
  }

  if (error) {
    return (
    <div className="incidents-container">
    <p className="error-message">{error}</p>
    </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedLocation && !formData.latitude && !formData.longitude) {
    setError("Por favor selecciona una ubicación en el mapa o ingresa las coordenadas manualmente");
    return;
    }

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
    let incidentesArray = [];
    if (Array.isArray(refreshData)) {
    incidentesArray = refreshData;
    } else if (Array.isArray(refreshData.incidentes)) {
    incidentesArray = refreshData.incidentes;
    } else if (Array.isArray(refreshData.data)) {
    incidentesArray = refreshData.data;
    } else if (refreshData.content && Array.isArray(refreshData.content)) {
    incidentesArray = refreshData.content;
    }
    setIncidents(incidentesArray);

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
    setSelectedLocation(null);
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
    <option value="ILUMINACION">Iluminación</option>
    <option value="BACHES">Baches</option>
    <option value="BASURA">Basura</option>
    <option value="OTRO">Otro</option>
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
    <label>Selecciona la ubicación en el mapa</label>
    <LocationPicker
    position={selectedLocation}
    onLocationSelect={handleLocationSelect}
    />
    {selectedLocation && (
    <p className="coordinates-text">
    Coordenadas seleccionadas: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
    </p>
    )}
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
    <option value="CERRADA">Cerrada</option>
    <option value="OTRO">Otro</option>
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

    <div className="incidents-map-container">
    <MapContainer
    center={[19.4326, -99.1332]}
    zoom={13}
    style={{ height: '400px', width: '100%' }}
    >
    <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    {incidents.map((incident) => (
    <Marker
    key={incident.id}
    position={[incident.latitud, incident.longitud]}
    icon={getIncidentIcon(incident)}
    >
    <Popup>
    <div className="incident-popup">
    <h3>{incident.tipoIncidente}</h3>
    <p><strong>Ubicación:</strong> {incident.ubicacion}</p>
    <p><strong>Estado:</strong> {incident.estado}</p>
    <p>
    <strong>Reportado por:</strong>{" "}
    {incident.usuario
    ? `${incident.usuario.nombre || ""} ${incident.usuario.apellido || ""}`
    : "Desconocido"}
    </p>
    </div>
    </Popup>
    </Marker>
    ))}
    </MapContainer>
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
    <p>
    <strong>Estado:</strong> {incident.estado}
    </p>
    <p>
    <strong>Reportado por:</strong>{" "}
    {incident.usuario
    ? `${incident.usuario.nombre || ""} ${incident.usuario.apellido || ""}`
    : "Desconocido"}
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