import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full flex flex-col items-center">
        {/* Banner Image */}
        <div className="w-full h-48 md:h-64 rounded-t-xl overflow-hidden mb-8 shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80" 
            alt="Edificio" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
          Bienvenido al Portal de tu Comunidad
        </h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          Por favor, selecciona tu rol para proceder con el inicio de sesión.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          <button 
            onClick={() => navigate('/login/residente')}
            className="w-full bg-[#1A7FF2] hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            Iniciar Sesión como Residente
          </button>
          
          <button 
            onClick={() => navigate('/login/admin')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            Iniciar Sesión como Administrador
          </button>
        </div>
      </div>
    </div>
  );
}
