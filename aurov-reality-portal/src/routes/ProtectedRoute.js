import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { getRoleHomePath } from '../constants/roleRoutes.js';

export default function ProtectedRoute({ allowedRole, children }) {
  const { user, token, booting } = useAuth();
  if (booting) return null;
  if (!user || !token) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={getRoleHomePath(user.role)} replace />;
  return children;
}

export function RoleHomeRedirect() {
  const { user, token, booting } = useAuth();
  if (booting) return null;
  return <Navigate to={user && token ? getRoleHomePath(user.role) : '/login'} replace />;
}

// Root path: show the public home page first for visitors who aren't logged in,
// and send authenticated users straight to their role dashboard.
export function RootEntry() {
  const { user, token, booting } = useAuth();
  if (booting) return null;
  if (user && token) return <Navigate to={getRoleHomePath(user.role)} replace />;
  return <Navigate to="/home" replace />;
}
