import React, { useState } from 'react';
import './Fotos.css';

const FotoUploader = ({ incidenteId, onFotoUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setError('Solo puedes seleccionar hasta 3 fotos');
      return;
    }
    setFiles(selectedFiles);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Por favor selecciona al menos una foto');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('fotos', file);
      });

      const response = await fetch(`http://localhost:8080/v1/fotos/incidente/${incidenteId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al subir las fotos');
      }

      const data = await response.json();
      setFiles([]);
      onFotoUploaded(data);
      alert('Fotos subidas exitosamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="foto-uploader">
      <div className="foto-input-container">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          max="3"
          className="foto-input"
        />
        <span className="foto-limit">Máximo 3 fotos</span>
      </div>
      
      {files.length > 0 && (
        <div className="selected-photos">
          {files.map((file, index) => (
            <div key={index} className="photo-preview">
              <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
      
      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="upload-button"
      >
        {uploading ? 'Subiendo...' : 'Subir Fotos'}
      </button>
    </div>
  );
};

export default FotoUploader;