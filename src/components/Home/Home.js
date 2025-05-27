import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';

const Home = () => {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [estadisticas, setEstadisticas] = useState({
    pendientes: 0,
    enProceso: 0,
    resueltos: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerIncidentes = async () => {
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

        setIncidentes(incidentesArray);

        // Calcular estadísticas
        const pendientes = incidentesArray.filter(inc => inc.estado === "PENDIENTE").length;
        const enProceso = incidentesArray.filter(inc => inc.estado === "EN_PROCESO").length;
        const resueltos = incidentesArray.filter(inc => inc.estado === "RESUELTO").length;

        setEstadisticas({
          pendientes,
          enProceso,
          resueltos
        });
      } catch (err) {
        console.error("Error al cargar incidentes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerIncidentes();
  }, []);

  const navegarConFiltro = (estado) => {
    navigate('/incidents', { state: { filtroEstado: estado } });
  };

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

  if (loading) {
    return <div className="dashboard-container">Cargando datos...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sección Principal */}
      <div className="hero-section">
        <h1>Bienvenido a Bumper APP</h1>
        <p>Juntos podemos hacer de nuestra ciudad un lugar mejor. Reporta incidentes y ayuda a mantener nuestra comunidad.</p>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div
          className="stat-card"
          onClick={() => navegarConFiltro("PENDIENTE")}
        >
          <div className="stat-header">
            <AlertTriangle className="stat-icon" />
            <h3>Incidentes Pendientes</h3>
          </div>
          <p className="stat-value">{estadisticas.pendientes}</p>
        </div>

        <div
          className="stat-card"
          onClick={() => navegarConFiltro("EN_PROCESO")}
        >
          <div className="stat-header">
            <Clock className="stat-icon" />
            <h3>En Proceso</h3>
          </div>
          <p className="stat-value">{estadisticas.enProceso}</p>
        </div>

        <div
          className="stat-card"
          onClick={() => navegarConFiltro("RESUELTO")}
        >
          <div className="stat-header">
            <CheckCircle className="stat-icon" />
            <h3>Resueltos</h3>
          </div>
          <p className="stat-value">{estadisticas.resueltos}</p>
        </div>
      </div>

      {/* Mapa */}
      <div className="map-section">
        <div className="map-header">
          <MapPin className="map-icon" />
          <h2>Incidentes Recientes</h2>
        </div>
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
            {incidentes.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.latitud, incident.longitud]}
              >
                <Popup>
                  <div className="incident-popup">
                    <h3>{incident.tipoIncidente}</h3>
                    <p><strong>Ubicación:</strong> {incident.ubicacion}</p>
                    <p><strong>Estado:</strong> {incident.estado}</p>
                    <p><strong>Fecha:</strong> {formatDateTime(incident.horaIncidente)}</p>
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
      </div>

      {/* Botón de Acción */}
      <div className="cta-section">
        <h2>¿Detectaste algún problema en tu zona?</h2>
        <p>Ayuda a tu comunidad reportando incidentes para que podamos trabajar en solucionarlos.</p>
        <button className="report-button">
          <Link to="/incidents" className="report-button">
            Reportar Incidente
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Home;