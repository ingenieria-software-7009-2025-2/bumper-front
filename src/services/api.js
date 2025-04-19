export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': token,
    };
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }
  
    return response;
  };