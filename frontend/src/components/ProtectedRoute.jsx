import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userService } from '../utils/apiService'; // Import your user service

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false
  });
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthState({ isLoading: false, isAuthenticated: false });
        return;
      }
      
      try {
        // Make a request to validate the token by fetching user data
        await userService.getCurrentUser();
        setAuthState({ isLoading: false, isAuthenticated: true });
      } catch (error) {
        // If request fails, token is invalid or expired
        console.log('Invalid or expired token');
        localStorage.removeItem('token');
        setAuthState({ isLoading: false, isAuthenticated: false });
      }
    };

    validateToken();
  }, []);

  // Show loading while checking authentication
  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F09000]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;