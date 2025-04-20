import React from 'react';
import './Fotos.css';

const FotoViewer = ({ fotos }) => {
  if (!fotos || fotos.length === 0) {
    return <p className="no-photos">No hay fotos disponibles</p>;
  }

  return (
    <div className="foto-viewer">
      {fotos.map((foto, index) => (
        <div key={index} className="foto-container">
          <img src={foto.urlFoto} alt={foto.descripcion || `Foto ${index + 1}`} />
          {foto.descripcion && (
            <p className="foto-description">{foto.descripcion}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FotoViewer;