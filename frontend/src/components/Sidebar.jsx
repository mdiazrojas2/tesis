import React from 'react';
import { Home, FileText, HelpCircle, Users, Bell, Settings, Building, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ role, unitInfo }) {
  const location = useLocation();
  const navigate = useNavigate();

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
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col min-h-screen">
      {/* Sidebar Header */}
      <div className="p-6">
        {role === 'residente' ? (
          <div>
            <h2 className="font-semibold text-slate-800">Condominio Volcanes</h2>
            <p className="text-xs text-slate-500 mt-1">
              {unitInfo ? `Depto ${unitInfo.numero_depto || ''} - Torre ${unitInfo.torre || ''}` : 'Depto 404 - Torre B'}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-semibold text-slate-800">Catastro Digital</h2>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
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
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => {
            if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userRole');
              navigate('/');
            }
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
