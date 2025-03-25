import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import './Incidents.css';

const Incidents = () => {
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    time: '',
    roadType: ''
  });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cargar incidentes al montar el componente
  useEffect(() => {
    const fetchIncidents = async () => {
      const correo = localStorage.getItem('userCorreo');
      if (!correo) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        navigate('/');
        return;
      }

      try {
        // Primero obtenemos el ID del usuario desde /v1/users/me
        const userResponse = await fetch('http://localhost:8080/v1/users/me', {
          method: 'GET',
          headers: {
            correo: correo,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await userResponse.json();
        const usuarioId = userData.id;

        // Luego cargamos los incidentes del usuario
        const incidentsResponse = await fetch(`http://localhost:8080/v1/incidentes/usuario/${usuarioId}`, {
          method: 'GET',
        });

        if (!incidentsResponse.ok) {
          throw new Error('Error al cargar los incidentes');
        }

        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const correo = localStorage.getItem('userCorreo');
    if (!correo) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      navigate('/');
      return;
    }

    try {
      // Obtener el ID del usuario
      const userResponse = await fetch('http://localhost:8080/v1/users/me', {
        method: 'GET',
        headers: {
          correo: correo,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario');
      }

      const userData = await userResponse.json();
      const usuarioId = userData.id;

      // Crear el incidente
      const newIncident = {
        usuarioId: usuarioId,
        tipoIncidente: formData.type.toUpperCase(), // Ajustar al formato del backend
        ubicacion: formData.location,
        tipoVialidad: formData.roadType.toUpperCase(), // Ajustar al formato del backend
      };

      const response = await fetch('http://localhost:8080/v1/incidentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncident),
      });

      if (!response.ok) {
        throw new Error('Error al reportar el incidente');
      }

      const createdIncident = await response.json();
      setIncidents([...incidents, createdIncident]); // Añadir el nuevo incidente a la lista
      setFormData({ type: '', location: '', time: '', roadType: '' }); // Limpiar formulario
    } catch (err) {
      setError(err.message);
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
        <Link to="/" className="back-button">
          <ArrowLeft size={20} /> Volver al inicio de sesión
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

          <button type="submit" className="submit-button">
            Reportar Incidente
          </button>
        </form>

        {/* Listado de Incidentes */}
        <div className="incidents-list">
          <h2>Incidentes Reportados</h2>
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

export default Incidents;