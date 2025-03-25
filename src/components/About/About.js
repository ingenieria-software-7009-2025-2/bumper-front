import React from "react";
import { Link } from "react-router-dom";
import {
  Info,
  ShieldAlert,
  Map,
  Users,
  HeartHandshake,
  ArrowLeft,
} from "lucide-react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="header-section">
        <Link to="/home" className="back-button">
          <ArrowLeft size={20} />
          Volver al inicio
        </Link>
      </div>
      {/* Hero Section */}
      <div className="about-hero">
        <h1>
          <Info /> Sobre Bumper App
        </h1>
        <p>Tu aliado en la seguridad vial urbana</p>
      </div>

      {/* Misión y Visión */}
      <div className="mission-section">
        <div className="mission-card">
          <h2>
            <HeartHandshake /> Nuestra Misión
          </h2>
          <p>
            Transformar la manera en que los ciudadanos interactúan con su
            entorno urbano, facilitando la reportaría de incidentes y
            promoviendo ciudades más seguras.
          </p>
        </div>

        <div className="mission-card">
          <h2>
            <Map /> Nuestra Visión
          </h2>
          <p>
            Ser la plataforma líder en gestión colaborativa de incidentes
            urbanos en Latinoamérica para 2025.
          </p>
        </div>
      </div>

      {/* Cómo Funciona */}
      <div className="how-it-works">
        <h2>
          <ShieldAlert /> ¿Cómo funciona Bumper?
        </h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">1</div>
            <h3>Reporte</h3>
            <p>
              Los usuarios registran incidentes con fotos y ubicación precisa
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">2</div>
            <h3>Verificación</h3>
            <p>Nuestro equipo valora la urgencia y categoriza el incidente</p>
          </div>

          <div className="step-card">
            <div className="step-icon">3</div>
            <h3>Gestión</h3>
            <p>Derivamos los casos a las autoridades correspondientes</p>
          </div>

          <div className="step-card">
            <div className="step-icon">4</div>
            <h3>Solución</h3>
            <p>Monitoreamos hasta la resolución final del caso</p>
          </div>
        </div>
      </div>

      {/* Galería */}
      <div className="gallery-section">
        <h2>
          <Users /> Comunidad en Acción
        </h2>
        <div className="gallery-grid">
          <div className="gallery-item placeholder-1">Imagen 1</div>
          <div className="gallery-item placeholder-2">Imagen 2</div>
          <div className="gallery-item placeholder-3">Imagen 3</div>
        </div>
      </div>

      {/* Equipo */}
      <div className="team-section">
        <h2>
          <Users /> Nuestro Equipo
        </h2>
        <div className="team-grid">
          <div className="team-card">
            <div className="team-photo"></div>
            <h3>Equipo Bumper</h3>
            <p>Profesionales comprometidos con la innovación urbana</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
