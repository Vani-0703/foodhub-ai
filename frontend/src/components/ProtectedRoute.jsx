import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

// Wrap a route with <ProtectedRoute roles={["owner","admin"]}> to gate it
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
