import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Arreglar el ícono del marcador
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ incidents }) => {
  // Centro inicial del mapa (México)
  const defaultCenter = [19.4326, -99.1332];

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitud, incident.longitud]}
          >
            <Popup>
              <div className="incident-popup">
                <h3>{incident.tipoIncidente}</h3>
                <p><strong>Ubicación:</strong> {incident.ubicacion}</p>
                <p><strong>Estado:</strong> {incident.estado}</p>
                <p><strong>Vialidad:</strong> {incident.tipoVialidad}</p>
                <p><strong>Fecha:</strong> {new Date(incident.horaIncidente).toLocaleString()}</p>
                {incident.fotos && incident.fotos.length > 0 && (
                  <div className="incident-photos">
                    {incident.fotos.map((foto, index) => (
                      <img 
                        key={index}
                        src={foto.urlFoto}
                        alt={`Foto ${index + 1}`}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '2px' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;