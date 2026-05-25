import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import axios from 'axios';
import { validateName } from '../../utils/rutValidation';

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

  const [errors, setErrors] = useState({});
  const [crearCuenta, setCrearCuenta] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/catastro/unidades/')
      .then(res => setUnidades(res.data))
      .catch(err => console.error("Error loading units:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nombre' || name === 'apellidos') {
      if (value.length > 0 && !validateName(value)) {
        setErrors(prev => ({ ...prev, [name]: 'No debe contener números ni caracteres especiales' }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.values(errors).some(err => err !== '')) {
      alert("Por favor, corrija los errores antes de guardar.");
      return;
    }
    
    if (!formData.nombre || !formData.unidad) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/catastro/residentes/', formData);
      if (crearCuenta && formData.correo) {
        try {
          await axios.post(`http://localhost:8000/api/catastro/residentes/${response.data.id}/enviar-invitacion/`);
          alert('Ficha creada y cuenta de usuario generada (se envió la invitación por correo).');
        } catch (invErr) {
          console.error(invErr);
          alert('Ficha creada, pero ocurrió un error al generar la cuenta de usuario.');
        }
      } else {
        alert('Ficha de Residente creada exitosamente (sin cuenta de acceso).');
      }
      navigate('/dashboard/admin/residentes');
    } catch (error) {
      console.error(error);
      alert('Error al crear la ficha. Intente nuevamente.');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Crear Nueva Cuenta de Usuario</h1>
          <p className="text-slate-500 mb-10 text-sm">Ingrese los detalles del nuevo propietario/jefe de hogar</p>
          
          <form onSubmit={handleSubmit} className="tour-step-form space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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
                  className={`w-full bg-slate-50 border ${errors.nombre ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.nombre ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/50'}`} 
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Apellidos</label>
                <input 
                  type="text" 
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: Rodríguez" 
                  className={`w-full bg-slate-50 border ${errors.apellidos ? 'border-red-500' : 'border-slate-200'} rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.apellidos ? 'focus:ring-red-500/50' : 'focus:ring-blue-500/50'}`} 
                />
                {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
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

            <div className="tour-step-create-account flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <input 
                type="checkbox" 
                id="crear_cuenta"
                checked={crearCuenta}
                onChange={(e) => setCrearCuenta(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="crear_cuenta" className="text-sm font-medium text-slate-900 block">
                  Crear cuenta de acceso para este residente
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Si marcas esta opción y el residente tiene correo electrónico, se le enviará una invitación para que genere su contraseña. Desmárcalo para menores de edad o residentes que no usarán el portal.
                </p>
              </div>
            </div>

            <div className="tour-step-save flex justify-end gap-4 pt-4">
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
