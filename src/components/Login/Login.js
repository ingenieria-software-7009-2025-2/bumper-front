import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(''); // Limpiar errores al cambiar de formulario
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    const apiUrl = 'http://localhost:8080'; // URL base del backend

    try {
      if (isLogin) {
        // Login: POST /v1/users/login
        const response = await fetch(`${apiUrl}/v1/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Error en el inicio de sesión');
        }

        const userData = await response.json();
        console.log('Usuario logueado:', userData);
        localStorage.setItem('userCorreo', userData.correo);
        navigate('/home');
      } else {
        // Registro: POST /v1/users/create
        const response = await fetch(`${apiUrl}/v1/users/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            correo: formData.email,
            password: formData.password,
            token: 'inactivo', // Valor por defecto
            numeroIncidentes: 0, // Valor por defecto
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Error al registrar el usuario');
        }

        const newUser = await response.json();
        console.log('Usuario registrado:', newUser);
        localStorage.setItem('userCorreo', newUser.correo); // Guardar correo para autenticación inmediata
        navigate('/home');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error en la solicitud:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className={`auth-box ${isLogin ? 'login' : 'register'}`}>
        <h1>{isLogin ? 'Inicio de Sesión' : 'Registro'}</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">
            {isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={toggleForm}>
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={toggleForm}>
                Inicia sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;