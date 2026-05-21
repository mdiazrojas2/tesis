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

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login/residente" element={<LoginResidente />} />
      <Route path="/login/admin" element={<LoginAdmin />} />

      {/* Residente Routes */}
      <Route path="/dashboard/residente" element={<DashboardResidente />} />
      <Route path="/dashboard/residente/hogar" element={<MiHogar />} />
      <Route path="/dashboard/residente/hogar/nuevo" element={<FormularioIntegrante />} />
      <Route path="/dashboard/residente/hogar/editar" element={<FormularioIntegrante />} />
      <Route path="/dashboard/residente/hogar/detalles" element={<DetallesIntegrante />} />
      <Route path="/dashboard/residente/documentos" element={<MisDocumentos />} />
      <Route path="/dashboard/residente/soporte" element={<Soporte />} />
      <Route path="/dashboard/residente/configuracion" element={<ResidenteConfiguracion />} />

      {/* Admin Routes */}
      <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      <Route path="/dashboard/admin/residentes" element={<AdminResidentes />} />
      <Route path="/dashboard/admin/documentos" element={<AdminDocumentos />} />
      <Route path="/dashboard/admin/documentos/nuevo" element={<AdminSubirDocumento />} />
      <Route path="/dashboard/admin/configuracion" element={<AdminConfiguracion />} />
      <Route path="/dashboard/admin/cuentas/enviar-invitacion" element={<AdminEnviarInvitacion />} />
      <Route path="/dashboard/admin/cuentas/nueva" element={<AdminCrearCuenta />} />
      <Route path="/dashboard/admin/cuentas/editar" element={<AdminEditarCuenta />} />
      <Route path="/dashboard/admin/notificaciones" element={<AdminNotificaciones />} />
      <Route path="/establecer-clave/:uid/:token" element={<EstablecerClave />} />
      <Route path="/recuperar-clave" element={<RecuperarClave />} />
    </Routes>
  );
}

export default App;
