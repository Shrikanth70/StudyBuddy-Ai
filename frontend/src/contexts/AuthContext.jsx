import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    setupAxiosInterceptors();
  }, []);

  const setupAxiosInterceptors = () => {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post('http://localhost:5000/api/auth/refresh', {
                refreshToken
              });

              const { accessToken } = response.data;
              localStorage.setItem('token', accessToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:5000/api/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', userData);
      
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/${user.email}/learning-progress`);
      setUserProgress(response.data.progress);
      return response.data.progress;
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      return null;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/change-password', passwordData);

      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', profileData, {
        headers: {
          // Let axios automatically set Content-Type for FormData
          ...(profileData instanceof FormData ? {} : { 'Content-Type': 'application/json' })
        }
      });

      // Update local user state with the response
      setUser(response.data.user);

      return { success: true, message: response.data.message || 'Profile updated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const updateApiKey = async (apiKey) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/api-key', { apiKey });

      return { success: true, message: response.data.message || 'API key updated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'API key update failed'
      };
    }
  };

  const getApiKey = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/api-key');

      return { success: true, apiKey: response.data.apiKey };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch API key'
      };
    }
  };

  const deleteAccount = async (password) => {
    try {
      const response = await axios.delete('http://localhost:5000/api/auth/account', {
        data: { password }
      });

      // Clear local storage and logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);

      return { success: true, message: response.data.message || 'Account deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Account deletion failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProgress,
      loading,
      login,
      register,
      logout,
      updateUser,
      updateProfile,
      fetchUserProgress,
      changePassword,
      updateApiKey,
      getApiKey,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
