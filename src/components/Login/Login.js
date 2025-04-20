import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../services/api";
import "./Login.css";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/v1/users/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Credenciales inválidas");
        }
        throw new Error("Error en el inicio de sesión");
      }

      const data = await response.json();

      // Guardar datos importantes en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.usuario.id);
      localStorage.setItem("userNombre", data.usuario.nombre);
      localStorage.setItem("userApellido", data.usuario.apellido);
      localStorage.setItem("userCorreo", data.usuario.correo);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // Login
        const credentials = {
          correo: formData.email,
          password: formData.password,
        };

        const loginData = await handleLogin(credentials);
        console.log("Login exitoso:", loginData);
        navigate("/home");
      } else {
        // Registro
        const registerResponse = await fetchWithAuth(
          "http://localhost:8080/v1/users/create",
          {
            method: "POST",
            body: JSON.stringify({
              nombre: formData.nombre,
              apellido: formData.apellido,
              correo: formData.email,
              password: formData.password,
            }),
          }
        );

        if (!registerResponse.ok) {
          if (registerResponse.status === 409) {
            throw new Error("El correo ya está registrado");
          }
          throw new Error("Error al registrar el usuario");
        }

        const registerData = await registerResponse.json();
        console.log("Registro exitoso:", registerData);

        // Login automático después del registro
        const credentials = {
          correo: formData.email,
          password: formData.password,
        };

        await handleLogin(credentials);
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
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
      <div className={`auth-box ${isLogin ? "login" : "register"}`}>
        <h1>{isLogin ? "Inicio de Sesión" : "Registro"}</h1>

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

          <button type="submit">{isLogin ? "Ingresar" : "Registrarse"}</button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <p>
              ¿No tienes cuenta?{" "}
              <button type="button" onClick={toggleForm}>
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{" "}
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
