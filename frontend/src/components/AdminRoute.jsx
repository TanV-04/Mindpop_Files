// frontend/src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';

/**
 * AdminRoute – wraps routes that require admin access.
 * Reads from localStorage (set at login) to check isAdmin flag.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/sign-in" replace />;
  if (!user.isAdmin) return <Navigate to="/games" replace />;

  return children;
};

export default AdminRoute;
