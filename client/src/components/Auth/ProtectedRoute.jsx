import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  // Check if the token exists in localStorage
  const token = localStorage.getItem('token');

  // If token exists, render the child route (Dashboard).
  // If not, redirect to Login.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};