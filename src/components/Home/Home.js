import React from 'react';
import { MapPin, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="dashboard-container">
      {/* Sección Principal */}
      <div className="hero-section">
        <h1>Bienvenido a Bumper APP</h1>
        <p>Juntos podemos hacer de nuestra ciudad un lugar mejor. Reporta incidentes y ayuda a mantener nuestra comunidad.</p>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <AlertTriangle className="stat-icon" />
            <h3>Incidentes Activos</h3>
          </div>
          <p className="stat-value">24</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <Clock className="stat-icon" />
            <h3>En Proceso</h3>
          </div>
          <p className="stat-value">12</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <CheckCircle className="stat-icon" />
            <h3>Resueltos</h3>
          </div>
          <p className="stat-value">156</p>
        </div>
      </div>

      {/* Mapa */}
      <div className="map-section">
        <div className="map-header">
          <MapPin className="map-icon" />
          <h2>Incidentes Recientes</h2>
        </div>
        <div className="map-placeholder">
          <p>Mapa de incidentes recientes</p>
        </div>
      </div>

      {/* Botón de Acción */}
      <div className="cta-section">
        <h2>¿Detectaste algún problema en tu zona?</h2>
        <p>Ayuda a tu comunidad reportando incidentes para que podamos trabajar en solucionarlos.</p>
        <button className="report-button">
          Reportar Incidente
        </button>
      </div>
    </div>
  );
};

export default Home;