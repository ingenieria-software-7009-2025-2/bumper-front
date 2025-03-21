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

  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de envío temporal (puedes reemplazar esto con tu autenticación real)
    console.log(formData);
    
    // Simulamos un login exitoso para redirigir
    if (isLogin) {
      // Aquí podrías validar las credenciales si tuvieras un backend
      navigate('/home'); // Redirige a /home después del login
    } else {
      // Para el registro, podrías mostrar un mensaje o redirigir después de registrar
      console.log('Usuario registrado:', formData);
      // Opcional: redirigir después del registro también
      navigate('/home');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className={`auth-box ${isLogin ? 'login' : 'register'}`}>
        <h1>{isLogin ? 'Inicio de Sesión' : 'Registro'}</h1>
        
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