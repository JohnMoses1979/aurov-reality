import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';
import { getRoleHomePath } from '../constants/roleRouteConfig.js';

const AuthContext = createContext(null);

const readSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('aurov_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [token, setToken] = useState(() => localStorage.getItem('aurov_token'));
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('aurov_token');

      if (!savedToken) {
        setBooting(false);
        return;
      }

      try {
        const loggedInUser = await authApi.me();
        localStorage.setItem('aurov_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setToken(savedToken);
      } catch {
        localStorage.removeItem('aurov_token');
        localStorage.removeItem('aurov_user');
        setUser(null);
        setToken(null);
      } finally {
        setBooting(false);
      }
    };

    verifySession();
  }, []);

  const login = async ({ email, identifier, password }) => {
    const loginIdentifier = (identifier || email || '').trim();

    if (!loginIdentifier) {
      return {
        success: false,
        error: 'Please enter Employee ID, username, email, or mobile.',
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters.',
      };
    }

    try {
      const result = await authApi.login({
        identifier: loginIdentifier,
        password,
      });

      localStorage.setItem('aurov_token', result.token);
      localStorage.setItem('aurov_user', JSON.stringify(result.user));

      setToken(result.token);
      setUser(result.user);

      return {
        success: true,
        user: result.user,
        token: result.token,
        homePath: result.homePath || getRoleHomePath(result.user?.role),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Invalid login credentials.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('aurov_token');
    localStorage.removeItem('aurov_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [user, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
