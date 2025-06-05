import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Función para crear un icono personalizado con SVG inline
const createSvgIcon = (color, iconType) => {
  let svgPath;
  switch (iconType) {
    case "ILUMINACION":
      svgPath =
        "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 16a1 1 0 0 1-1-1v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1zm-8-9a1 1 0 0 1-1-1 1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H4zm16-1a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2h-2zM6.34 17.66a1 1 0 0 1-1.41-1.41l1.41-1.41a1 1 0 0 1 1.41 1.41l-1.41 1.41zm12.73-12.73a1 1 0 0 1-1.41 0L16.24 3.51a1 1 0 0 1 1.41-1.41l1.42 1.42a1 1 0 0 1 0 1.41zm-14.14 0a1 1 0 0 1 0-1.41L6.34 2.1a1 1 0 0 1 1.41 1.41L6.34 4.93a1 1 0 0 1-1.41 0zM12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm5.66 15.66l1.41 1.41a1 1 0 0 1-1.41 1.41l-1.41-1.41a1 1 0 0 1 1.41-1.41z"; // Lightbulb
      break;
    case "BACHES":
      svgPath =
        "M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3zM12 8.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V9a.5.5 0 0 1 .5-.5zm.5 8.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"; // AlertTriangle
      break;
    case "BASURA":
      svgPath =
        "M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"; // Trash
      break;
    default:
      svgPath =
        "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v4m0 4h.01"; // HelpCircle
  }

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#007bff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="11" fill="#007bff22" />
      <path d="${svgPath}" />
    </svg>
    <div class="marker-pin" style="background-color: #007bff;"></div>
  `;

  return L.divIcon({
    html: `<div class="custom-marker" style="background-color: #fff; border-radius: 50%; padding: 4px; border: 2.5px solid #007bff; position: relative;">${svgHtml}</div>`,
    className: "",
    iconSize: [40, 48],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const LocationMarker = ({ position, onLocationSelect }) => {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position && markerRef.current) {
      markerRef.current.setIcon(createSvgIcon("#007bff", "DEFAULT"));
    }
  }, [position]);

  return position ? (
    <Marker
      position={position}
      ref={markerRef}
      icon={createSvgIcon("#007bff", "DEFAULT")}
    />
  ) : null;
};

const LocationPicker = ({ position, onLocationSelect }) => {
  const defaultCenter = [19.4326, -99.1332]; // Centro de México

  return (
    <div className="location-picker">
      <MapContainer
        center={position || defaultCenter}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker
          position={position}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
