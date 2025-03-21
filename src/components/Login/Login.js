import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Bumper-Front</h1>
        <form className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
            />
          </div>
          <button type="submit">Acceder</button>
        </form>
        <div className="login-footer">
          <p>¿Primera vez en Bumper? <a href="#register">Crea una cuenta</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;