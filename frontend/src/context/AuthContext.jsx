import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      clearTimeout(id);

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setUser(userData);
        localStorage.setItem('app_user', JSON.stringify(userData));
        localStorage.setItem('token', data.token); // Store token if needed
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === 'AbortError') {
        return { success: false, message: 'Request timed out. Server might be sleeping.' };
      }
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (email, password, role = 'candidate') => {
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
