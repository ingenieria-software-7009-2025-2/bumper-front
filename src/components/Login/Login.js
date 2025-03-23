import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState(''); // Estado para manejar errores

  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(''); // Limpiar errores al cambiar de formulario
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    const apiUrl = 'http://localhost:8080'; // URL base del backend (ajusta si usas Supabase)
    
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
        // Guardar el correo en el estado global o localStorage si lo necesitas
        localStorage.setItem('userCorreo', userData.correo);
        navigate('/home'); // Redirigir a home tras login exitoso
      } else {
        // Registro: POST /v1/users/create
        const response = await fetch(`${apiUrl}/v1/users/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.name,
            apellido: formData.name.split(' ')[1] || 'Usuario', // Simulamos apellido si no se provee
            correo: formData.email,
            password: formData.password,
            token: 'inactivo', // Valor por defecto
            numeroIncidentes: 0, // Valor por defecto
            phone: formData.phone, // No usado en el backend actual, pero lo enviamos
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Error al registrar el usuario');
        }

        const newUser = await response.json();
        console.log('Usuario registrado:', newUser);
        navigate('/home'); // Redirigir a home tras registro exitoso
      }
    } catch (err) {
      setError(err.message); // Mostrar error al usuario
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
        
        {error && <p className="error-message">{error}</p>} {/* Mostrar errores */}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
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

          {!isLogin && (
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          )}

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