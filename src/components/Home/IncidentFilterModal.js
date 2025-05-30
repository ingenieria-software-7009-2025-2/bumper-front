import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Lightbulb, AlertTriangle, Trash2, HelpCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import './IncidentFilterModal.css';
import html2canvas from 'html2canvas';

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

const getIncidentIcon = (incident) => {
  const color = getColorByState(incident.estado);
  return createSvgIcon(color, incident.tipoIncidente);
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

const IncidentFilterModal = ({ estado, incidentes, onClose }) => {
  const titleMap = {
    PENDIENTE: 'Pendientes',
    EN_PROCESO: 'En Proceso',
    RESUELTO: 'Resueltos'
  };

  const filtered = incidentes.filter((i) => i.estado === estado);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const getMapCenter = () => {
    if (filtered.length === 0) return [19.4326, -99.1332];
    const sumLat = filtered.reduce((sum, inc) => sum + inc.latitud, 0);
    const sumLng = filtered.reduce((sum, inc) => sum + inc.longitud, 0);
    const centerLat = isNaN(sumLat / filtered.length) ? 19.4326 : sumLat / filtered.length;
    const centerLng = isNaN(sumLng / filtered.length) ? -99.1332 : sumLng / filtered.length;
    return [centerLat, centerLng];
  };

  const handleDescargarImagen = (id) => {
    const node = document.getElementById(`popup-share-${id}`);
    html2canvas(node).then((canvas) => {
      const link = document.createElement('a');
      link.download = `incidente_${id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }).catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar la imagen',
        confirmButtonColor: '#dc3545'
      });
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Incidentes {titleMap[estado]}</h2>
          <Link to="/incidents" className="report-btn">
            Reportar Incidente
          </Link>
          <button className="close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Leyenda de tipos */}
        <div className="legend-row">
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
            <Lightbulb size={18} style={{ marginRight: '4px' }} />
            <span>Iluminación</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
            <AlertTriangle size={18} style={{ marginRight: '4px' }} />
            <span>Baches</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
            <Trash2 size={18} style={{ marginRight: '4px' }} />
            <span>Basura</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HelpCircle size={18} style={{ marginRight: '4px' }} />
            <span>Otro</span>
          </div>
        </div>

        {/* Contador de incidentes */}
        <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
          {filtered.length} {filtered.length === 1 ? 'incidente encontrado' : 'incidentes encontrados'}
        </div>

        {/* Mapa */}
        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer
            center={getMapCenter()}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filtered.map((incident) => (
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
                    <img src="/logo.png" alt="Logo App" className="popup-logo" />
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
    </div>
  );
};

export default IncidentFilterModal;