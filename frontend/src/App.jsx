import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import RoleSelection from './pages/RoleSelection';
import EstablecerClave from './pages/EstablecerClave';
import RecuperarClave from './pages/RecuperarClave';
import LoginResidente from './pages/LoginResidente';
import LoginAdmin from './pages/LoginAdmin';
import DashboardResidente from './pages/DashboardResidente';
import DashboardAdmin from './pages/DashboardAdmin';

// Residente Sub-Pages
import MiHogar from './pages/residente/MiHogar';
import MisDocumentos from './pages/residente/MisDocumentos';
import Soporte from './pages/residente/Soporte';
import FormularioIntegrante from './pages/residente/FormularioIntegrante';
import DetallesIntegrante from './pages/residente/DetallesIntegrante';
import ResidenteConfiguracion from './pages/residente/ResidenteConfiguracion';

// Admin Sub-Pages
import AdminResidentes from './pages/admin/AdminResidentes';
import AdminDocumentos from './pages/admin/AdminDocumentos';
import AdminSubirDocumento from './pages/admin/AdminSubirDocumento';
import AdminConfiguracion from './pages/admin/AdminConfiguracion';
import AdminEnviarInvitacion from './pages/admin/AdminEnviarInvitacion';
import AdminCrearCuenta from './pages/admin/AdminCrearCuenta';
import AdminEditarCuenta from './pages/admin/AdminEditarCuenta';
import AdminNotificaciones from './pages/admin/AdminNotificaciones';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login/residente" element={<LoginResidente />} />
      <Route path="/login/admin" element={<LoginAdmin />} />

      {/* Residente Routes */}
      <Route path="/dashboard/residente" element={<ProtectedRoute allowedRoles={['residente']}><DashboardResidente /></ProtectedRoute>} />
      <Route path="/dashboard/residente/hogar" element={<ProtectedRoute allowedRoles={['residente']}><MiHogar /></ProtectedRoute>} />
      <Route path="/dashboard/residente/hogar/nuevo" element={<ProtectedRoute allowedRoles={['residente']}><FormularioIntegrante /></ProtectedRoute>} />
      <Route path="/dashboard/residente/hogar/editar" element={<ProtectedRoute allowedRoles={['residente']}><FormularioIntegrante /></ProtectedRoute>} />
      <Route path="/dashboard/residente/hogar/detalles" element={<ProtectedRoute allowedRoles={['residente']}><DetallesIntegrante /></ProtectedRoute>} />
      <Route path="/dashboard/residente/documentos" element={<ProtectedRoute allowedRoles={['residente']}><MisDocumentos /></ProtectedRoute>} />
      <Route path="/dashboard/residente/soporte" element={<ProtectedRoute allowedRoles={['residente']}><Soporte /></ProtectedRoute>} />
      <Route path="/dashboard/residente/configuracion" element={<ProtectedRoute allowedRoles={['residente']}><ResidenteConfiguracion /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardAdmin /></ProtectedRoute>} />
      <Route path="/dashboard/admin/residentes" element={<ProtectedRoute allowedRoles={['admin']}><AdminResidentes /></ProtectedRoute>} />
      <Route path="/dashboard/admin/residentes/detalles" element={<ProtectedRoute allowedRoles={['admin']}><DetallesIntegrante /></ProtectedRoute>} />
      <Route path="/dashboard/admin/residentes/editar" element={<ProtectedRoute allowedRoles={['admin']}><FormularioIntegrante /></ProtectedRoute>} />
      <Route path="/dashboard/admin/documentos" element={<ProtectedRoute allowedRoles={['admin']}><AdminDocumentos /></ProtectedRoute>} />
      <Route path="/dashboard/admin/documentos/nuevo" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubirDocumento /></ProtectedRoute>} />
      <Route path="/dashboard/admin/configuracion" element={<ProtectedRoute allowedRoles={['admin']}><AdminConfiguracion /></ProtectedRoute>} />
      <Route path="/dashboard/admin/cuentas/enviar-invitacion" element={<ProtectedRoute allowedRoles={['admin']}><AdminEnviarInvitacion /></ProtectedRoute>} />
      <Route path="/dashboard/admin/cuentas/nueva" element={<ProtectedRoute allowedRoles={['admin']}><AdminCrearCuenta /></ProtectedRoute>} />
      <Route path="/dashboard/admin/cuentas/editar" element={<ProtectedRoute allowedRoles={['admin']}><AdminEditarCuenta /></ProtectedRoute>} />
      <Route path="/dashboard/admin/notificaciones" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotificaciones /></ProtectedRoute>} />
      
      <Route path="/establecer-clave/:uid/:token" element={<EstablecerClave />} />
      <Route path="/recuperar-clave" element={<RecuperarClave />} />
    </Routes>
  );
}

export default App;
