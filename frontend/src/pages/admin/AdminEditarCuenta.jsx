import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import axios from 'axios';

export default function AdminEditarCuenta() {
  const navigate = useNavigate();
  const location = useLocation();

  const residente = location.state?.residente || {
    id: null,
    nombre: 'Sofía',
    apellidos: 'Rodríguez',
    correo: 'sofia.rodriguez@email.com',
    unidad: ''
  };

  const [formData, setFormData] = useState({
    nombre: residente.nombre,
    apellidos: residente.apellidos || '',
    correo: residente.correo || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!residente.id) {
      alert("Error: No se encontró el ID del residente a editar.");
      navigate('/dashboard/admin/residentes');
      return;
    }

    try {
      await axios.patch(`http://localhost:8000/api/catastro/residentes/${residente.id}/`, formData);
      alert('Cuenta y Ficha de Residente modificada exitosamente.');
      navigate('/dashboard/admin/residentes');
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-slate-900" />
          <span className="font-bold text-slate-900 text-lg">Sistema Digital de Catastro para Emergencias</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Editar Cuenta de Usuario</h1>
          <p className="text-slate-500 mb-10 text-sm">Modifique los detalles del propietario/jefe de hogar</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Nombres *</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Apellidos</label>
                <input 
                  type="text" 
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                onClick={() => navigate('/dashboard/admin/residentes')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm shadow-sm"
              >
                Guardar Cambios
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
