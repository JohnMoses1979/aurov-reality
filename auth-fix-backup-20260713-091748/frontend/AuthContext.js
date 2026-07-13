import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, clearStoredAuth, getToken, isStoredTokenExpired, persistAuthSession } from '../services/api.js';
import { getRoleHomePath } from '../constants/roleRoutes.js';

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    name: user.name || user.fullName || user.role,
    mobileNumber: user.mobileNumber || user.mobile || '',
    customerId: user.customerId || (user.role === 'Customer' ? user.id : undefined),
  };
};

const defaultUser = () => {
  try {
    const raw = localStorage.getItem('aurov-user') || localStorage.getItem('aurov_user');
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [token, setToken] = useState(() => getToken());
  const [booting, setBooting] = useState(Boolean(getToken()));
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = getToken();
      if (!savedToken || isStoredTokenExpired(savedToken)) {
        clearStoredAuth();
        setUser(null);
        setToken(null);
        setBooting(false);
        return;
      }

      try {
        const loggedInUser = normalizeUser(await authApi.me());
        persistAuthSession(savedToken, loggedInUser);
        setUser(loggedInUser);
        setToken(savedToken);
      } catch {
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setBooting(false);
      }
    };

    verifySession();
  }, []);

  const login = async ({ email, identifier, password }) => {
    const loginIdentifier = String(identifier || email || '').trim();

    if (!loginIdentifier) {
      return { success: false, error: 'Please enter Employee ID, username, email, or mobile.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const result = await authApi.login({ identifier: loginIdentifier, password });
      const loggedUser = normalizeUser(result.user);

      persistAuthSession(result.token, loggedUser, result.expiresInMs);

      setToken(result.token);
      setUser(loggedUser);

      return {
        success: true,
        user: loggedUser,
        token: result.token,
        homePath: result.homePath || getRoleHomePath(loggedUser?.role),
      };
    } catch (error) {
      return { success: false, error: error.message || 'Invalid login credentials.' };
    }
  };

  const updateUser = (patch = {}) => {
    setUser((current) => {
      const nextUser = normalizeUser({ ...(current || {}), ...patch });
      if (nextUser) {
        const serialized = JSON.stringify(nextUser);
        localStorage.setItem('aurov-user', serialized);
        localStorage.setItem('aurov_user', serialized);
      }
      return nextUser;
    });
  };
  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({ user, token, booting, login, logout, updateUser, isAuthenticated: Boolean(token || user) }),
    [user, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
