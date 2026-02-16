// frontend/src/components/ProtectedRoute.jsx
// Guards child-only routes. Admin users are redirected to /admin.
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token   = localStorage.getItem('token');
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Admin users shouldn't be on child routes
  if (user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
