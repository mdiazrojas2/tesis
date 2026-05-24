import React, { useState, useEffect } from 'react';
import { Menu, X, Home, FileText, HelpCircle, Users, Bell, Settings, Building, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageTour from './PageTour';

export default function Sidebar({ role, unitInfo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const residenteLinks = [
    { name: 'Inicio', icon: Home, path: '/dashboard/residente' },
    { name: 'Mi Hogar', icon: Building, path: '/dashboard/residente/hogar' },
    { name: 'Mis Documentos', icon: FileText, path: '/dashboard/residente/documentos' },
    { name: 'Soporte', icon: HelpCircle, path: '/dashboard/residente/soporte' },
    { name: 'Seguridad', icon: Settings, path: '/dashboard/residente/configuracion' },
  ];

  const adminLinks = [
    { name: 'Dashboard', icon: Home, path: '/dashboard/admin' },
    { name: 'Residentes', icon: Users, path: '/dashboard/admin/residentes' },
    { name: 'Notificaciones', icon: Bell, path: '/dashboard/admin/notificaciones' },
    { name: 'Documentos', icon: FileText, path: '/dashboard/admin/documentos' },
    { name: 'Configuración', icon: Settings, path: '/dashboard/admin/configuracion' },
  ];

  const links = role === 'admin' ? adminLinks : residenteLinks;

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-50 p-2.5 bg-white text-slate-700 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col h-screen transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      {/* Sidebar Header */}
      <div className="p-6">
        {role === 'residente' ? (
          <div>
            <h2 className="font-semibold text-slate-800">Condominio Volcanes</h2>
            <p className="text-xs text-slate-500 mt-1">
              {unitInfo ? ((unitInfo.torre && unitInfo.torre !== 'null') ? `Depto ${unitInfo.numero_depto} - Torre ${unitInfo.torre}` : `Depto ${unitInfo.numero_depto}`) : ''}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-semibold text-slate-800">Catastro Digital</h2>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="tour-step-sidebar flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <button 
          onClick={() => {
            if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userRole');
              navigate('/');
            }
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          Cerrar Sesión
        </button>
      </div>
    </aside>

    {/* Bottom Right Floating Tour Button */}
    <div className="fixed bottom-8 right-8 z-50">
      <button 
        onClick={() => setRunTour(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-md text-sm font-medium text-[#1A7FF2] rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all"
      >
        <HelpCircle className="w-5 h-5" />
        Tour Interactivo
      </button>
    </div>
    
    <PageTour runTour={runTour} setRunTour={setRunTour} />
    </>
  );
}
