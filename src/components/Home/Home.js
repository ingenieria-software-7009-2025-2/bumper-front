import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import './Home.css';
import IncidentFilterModal from './IncidentFilterModal';
import html2canvas from "html2canvas";

// Función para crear un icono personalizado con SVG inline
const createSvgIcon = (color, iconType) => {
  let svgPath;
  switch (iconType) {
    case 'ILUMINACION':
      svgPath = 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 16a1 1 0 0 1-1-1v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1zm-8-9a1 1 0 0 1-1-1 1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H4zm16-1a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2h-2zM6.34 17.66a1 1 0 0 1-1.41-1.41l1.41-1.41a1 1 0 0 1 1.41 1.41l-1.41 1.41zm12.73-12.73a1 1 0 0 1-1.41 0L16.24 3.51a1 1 0 0 1 1.41-1.41l1.42 1.42a1 1 0 0 1 0 1.41zm-14.14 0a1 1 0 0 1 0-1.41L6.34 2.1a1 1 0 0 1 1.41 1.41L6.34 4.93a1 1 0 0 1-1.41 0zM12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm5.66 15.66l1.41 1.41a1 1 0 0 1-1.41 1.41l-1.41-1.41a1 1 0 0 1 1.41-1.41z';
      break;
    case 'BACHES':
      svgPath = 'M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3zM12 8.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V9a.5.5 0 0 1 .5-.5zm.5 8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z';
      break;
    case 'BASURA':
      svgPath = 'M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6';
      break;
    default:
      svgPath = 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v4m0 4h.01';
  }
  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="${svgPath}"></path>
    </svg>
  `;
  return L.divIcon({
    html: `<div class="custom-marker" style="background-color: white; border-radius: 50%; padding: 5px; border: 2px solid ${color};">${svgHtml}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const Home = () => {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [estadisticas, setEstadisticas] = useState({
    pendientes: 0,
    enProceso: 0,
    resueltos: 0
  });
  const [modal, setModal] = useState({ open: false, estado: null });

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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
          confirmButtonColor: '#dc3545'
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerIncidentes();
  }, []);

  const abrirModal = (estado) => {
    setModal({ open: true, estado });
  };

  const cerrarModal = () => {
    setModal({ open: false, estado: null });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getColorByState = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#ff6b6b';
      case 'EN_PROCESO':
        return '#feca57';
      case 'RESUELTO':
        return '#1dd1a1';
      default:
        return '#4a90e2';
    }
  };

  function handleDescargarImagen(id) {
    const node = document.getElementById(`popup-share-${id}`);
    html2canvas(node).then(canvas => {
      const link = document.createElement("a");
      link.download = `incidente_${id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }).catch(err => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar la imagen',
        confirmButtonColor: '#dc3545'
      });
    });
  }

  const getIncidentIcon = (incident) => {
    const color = getColorByState(incident.estado);
    return createSvgIcon(color, incident.tipoIncidente);
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
          onClick={() => abrirModal("PENDIENTE")}
        >
          <div className="stat-header">
            <AlertTriangle className="stat-icon" />
            <h3>Incidentes Pendientes</h3>
          </div>
          <p className="stat-value">{estadisticas.pendientes}</p>
        </div>

        <div
          className="stat-card"
          onClick={() => abrirModal("EN_PROCESO")}
        >
          <div className="stat-header">
            <Clock className="stat-icon" />
            <h3>En Proceso</h3>
          </div>
          <p className="stat-value">{estadisticas.enProceso}</p>
        </div>

        <div
          className="stat-card"
          onClick={() => abrirModal("RESUELTO")}
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
          <span className="map-tip">Haz click en los iconos para ver más información</span>

          <div className="map-legend">
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></div>
                <span>Pendiente</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#feca57' }}></div>
                <span>En Proceso</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#1dd1a1' }}></div>
                <span>Resuelto</span>
              </div>
            </div>
          </div>
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
                icon={getIncidentIcon(incident)}
              >
                <Popup>
                  <div className="incident-popup" id={`popup-share-${incident.id}`}>
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
                    <div className="popup-leyenda">
                      ¡Comparte y ayuda a tu comunidad!
                    </div>
                    <div className="popup-hashtag">
                      #cuidatuciudad
                    </div>
                    <img src="https://cdn.glitch.global/1e606ae4-8295-4215-9b27-e8171201367a/LOGOBUMPER.png?v=1748621862361" alt="Logo App" className="popup-logo" />
                    <button
                      className="descargar-imagen-btn"
                      onClick={() => handleDescargarImagen(incident.id)}
                    >
                      Descargar Imagen
                    </button>
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
        <Link to="/incidents" className="report-button">
          Reportar Incidente
        </Link>
      </div>

      {/* Modal de filtro */}
      {modal.open && (
        <IncidentFilterModal
          estado={modal.estado}
          incidentes={incidentes}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
};

export default Home;