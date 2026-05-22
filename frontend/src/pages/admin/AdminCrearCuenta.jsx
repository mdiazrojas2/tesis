import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import axios from 'axios';

export default function AdminCrearCuenta() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    unidad: '',
    relacion_jefe_hogar: 'JEFE_HOGAR',
    recibir_notificaciones: true
  });

  useEffect(() => {
    axios.get('http://localhost:8000/api/catastro/unidades/')
      .then(res => setUnidades(res.data))
      .catch(err => console.error("Error loading units:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.unidad) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/catastro/residentes/', formData);
      alert('Cuenta y Ficha de Residente creada exitosamente.');
      navigate('/dashboard/admin/residentes');
    } catch (error) {
      console.error(error);
      alert('Error al crear la cuenta. Intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-slate-900" />
          <span className="font-bold text-slate-900 text-lg">CondoConnect</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Crear Nueva Cuenta de Usuario</h1>
          <p className="text-slate-500 mb-10 text-sm">Ingrese los detalles del nuevo propietario/jefe de hogar</p>
          
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
                  placeholder="Ej: Sofía" 
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
                  placeholder="Ej: Rodríguez" 
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
                placeholder="correo@ejemplo.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Unidad / Departamento *</label>
              <select 
                name="unidad" 
                value={formData.unidad} 
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700"
              >
                <option value="">Seleccione Unidad/Departamento</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{(u.torre && u.torre !== 'null') ? `Torre ${u.torre} - Depto ${u.numero_depto}` : `Depto ${u.numero_depto}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Tipo de Residente *</label>
              <select 
                name="relacion_jefe_hogar" 
                value={formData.relacion_jefe_hogar} 
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700"
              >
                <option value="JEFE_HOGAR">Jefe de Hogar</option>
                <option value="CONYUGE">Cónyuge</option>
                <option value="ARRENDATARIO">Arrendatario</option>
                <option value="FAMILIAR_MENOR">Familiar menor de edad</option>
                <option value="FAMILIAR_ADULTO">Familiar adulto</option>
                <option value="FAMILIAR_ADULTO_MAYOR">Familiar adulto mayor</option>
                <option value="OTRO">Otro</option>
              </select>
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
                Crear Cuenta y Enviar Invitación
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
