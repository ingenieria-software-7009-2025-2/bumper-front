export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };
  
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  export const logout = async () => {
    const apiUrl = 'http://localhost:8080';
    const correo = localStorage.getItem('userCorreo');
    
    try {
      await fetch(`${apiUrl}/v1/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo }),
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.clear();
    }
  };