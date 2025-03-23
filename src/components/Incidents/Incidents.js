import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import './Incidents.css';

const Incidents = () => {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    time: '',
    roadType: ''
  });

  const [incidents, setIncidents] = useState([
    // Datos de ejemplo
    {
      id: 1,
      type: 'Bache',
      location: 'Av. Principal #123',
      time: '10:30 AM',
      roadType: 'Avenida'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica temporal para agregar incidente
    const newIncident = {
      id: incidents.length + 1,
      ...formData
    };
    setIncidents([...incidents, newIncident]);
    setFormData({ type: '', location: '', time: '', roadType: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="incidents-container">
      <div className="header-section">
        <Link to="/home" className="back-button">
          <ArrowLeft size={20} />
          Volver al inicio
        </Link>
        <h1><AlertCircle /> Reportar Incidente</h1>
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
              <option value="Bache">Bache</option>
              <option value="Semáforo dañado">Semáforo dañado</option>
              <option value="Iluminación">Iluminación</option>
              <option value="Accidente">Accidente</option>
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
            <label>Hora del incidente</label>
            <input
              type="time"
              name="time"
              value={formData.time}
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
              <option value="Avenida">Avenida</option>
              <option value="Calle">Calle</option>
              <option value="Carretera">Carretera</option>
              <option value="Periférico">Periférico</option>
            </select>
          </div>

          <button type="submit" className="submit-button">
            Reportar Incidente
          </button>
        </form>

        {/* Listado de Incidentes */}
        <div className="incidents-list">
          <h2>Incidentes Reportados</h2>
          <div className="list-container">
            {incidents.map((incident) => (
              <div key={incident.id} className="incident-card">
                <div className="card-header">
                  <span className="incident-type">{incident.type}</span>
                  <span className="incident-time">{incident.time}</span>
                </div>
                <div className="card-body">
                  <p><strong>Ubicación:</strong> {incident.location}</p>
                  <p><strong>Vialidad:</strong> {incident.roadType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Incidents;