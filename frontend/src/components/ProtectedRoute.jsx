import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('accessToken');
  const location = useLocation();

  if (!token) {
    // Si no hay token, lo mandamos a inicio y guardamos de dónde venía
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.rol?.toLowerCase(); // 'admin' o 'residente'

    // Si la ruta tiene roles permitidos y el rol del usuario no está, denegar acceso
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirigir a su propio dashboard correspondiente
      if (userRole === 'admin') {
        return <Navigate to="/dashboard/admin" replace />;
      } else {
        return <Navigate to="/dashboard/residente" replace />;
      }
    }

    return children;
  } catch (error) {
    // Si el token es inválido o expiró
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    return <Navigate to="/" state={{ from: location }} replace />;
  }
}
