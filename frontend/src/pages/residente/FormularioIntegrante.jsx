import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';

export default function FormularioIntegrante() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unidades, setUnidades] = useState([]);
  const userRole = localStorage.getItem('userRole');
  
  const initialData = location.state?.integrante || {
    unidad: '',
    nombre: '',
    apellidos: '',
    rut_dni: '',
    fecha_nacimiento: '',
    nacionalidad: '',
    idioma_principal: '',
    relacion_jefe_hogar: '',
    condicion_medica: false,
    movilidad_reducida: false,
    detalles_salud_sensibles: '',
    telefono: '',
    correo: '',
    recibir_notificaciones: true,
    contacto_emergencia_nombre: '',
    contacto_emergencia_parentesco: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_correo: ''
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    // Fetch units for selection
    axios.get('http://localhost:8000/api/catastro/unidades/')
      .then(res => setUnidades(res.data))
      .catch(err => console.error("Error cargando unidades:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`http://localhost:8000/api/catastro/residentes/${formData.id}/`, formData);
        alert('Integrante actualizado exitosamente.');
      } else {
        await axios.post('http://localhost:8000/api/catastro/residentes/', formData);
        alert('Integrante creado exitosamente.');
      }
      
      if (userRole === 'admin') {
        navigate('/dashboard/admin/residentes');
      } else {
        navigate('/dashboard/residente/hogar');
      }
    } catch (error) {
      console.error("Error al guardar:", error.response?.data || error);
      alert('Error al guardar. Por favor, revise los datos.');
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role={userRole === 'admin' ? 'admin' : 'residente'} />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Crear/Editar Integrante</h1>
        
        <form onSubmit={handleSave} className="max-w-2xl space-y-8 pb-12">
          
          {/* Sección 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidad/Departamento</label>
              <select name="unidad" value={formData.unidad} onChange={handleChange} required className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="">Seleccione una unidad</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{(u.torre && u.torre !== 'null') ? `Torre: ${u.torre} - Depto: ${u.numero_depto}` : `Depto: ${u.numero_depto}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombres</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ingrese el nombre" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ingrese el apellido" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUT/DNI</label>
              <input type="text" name="rut_dni" value={formData.rut_dni} onChange={handleChange} placeholder="Ingrese el RUT/DNI" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nacionalidad</label>
              <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} placeholder="Ingrese la nacionalidad" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Idioma principal</label>
              <input type="text" name="idioma_principal" value={formData.idioma_principal} onChange={handleChange} placeholder="Ingrese el idioma principal" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de residente</label>
              <select name="relacion_jefe_hogar" value={formData.relacion_jefe_hogar} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="">Seleccione tipo</option>
                <option value="JEFE_HOGAR">Jefe de Hogar</option>
                <option value="CONYUGE">Cónyuge</option>
                <option value="ARRENDATARIO">Arrendatario</option>
                <option value="FAMILIAR_MENOR">Familiar menor de edad</option>
                <option value="FAMILIAR_ADULTO">Familiar adulto</option>
                <option value="FAMILIAR_ADULTO_MAYOR">Familiar adulto mayor</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>

          {/* Sección 2: Info Médica */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Información Médica y de Asistencia</h2>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="condicion_medica" checked={formData.condicion_medica} onChange={handleChange} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Condiciones médicas</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="movilidad_reducida" checked={formData.movilidad_reducida} onChange={handleChange} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-slate-700">Movilidad reducida</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
              <textarea name="detalles_salud_sensibles" value={formData.detalles_salud_sensibles} onChange={handleChange} rows="4" placeholder="Ingrese observaciones adicionales" className="w-full border border-slate-200 bg-slate-50 rounded-lg p-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"></textarea>
            </div>
          </div>

          {/* Sección 3: Contacto */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Contacto y Comunicación</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono personal</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ingrese el teléfono" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico (opcional)</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Ingrese el correo electrónico" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                <p className="text-xs text-slate-400 mt-1">No requerido para menores de edad o adultos mayores</p>
              </div>
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" name="recibir_notificaciones" checked={formData.recibir_notificaciones} onChange={handleChange} className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-slate-700">Recibir notificaciones</span>
            </label>
          </div>

          {/* Sección 4: Emergencia */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Contacto de Emergencia</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                <input type="text" name="contacto_emergencia_nombre" value={formData.contacto_emergencia_nombre} onChange={handleChange} placeholder="Ingrese el nombre completo" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parentesco</label>
                <input type="text" name="contacto_emergencia_parentesco" value={formData.contacto_emergencia_parentesco} onChange={handleChange} placeholder="Ingrese el parentesco" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input type="text" name="contacto_emergencia_telefono" value={formData.contacto_emergencia_telefono} onChange={handleChange} placeholder="Ingrese el teléfono" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico (opcional)</label>
                <input type="email" name="contacto_emergencia_correo" value={formData.contacto_emergencia_correo} onChange={handleChange} placeholder="Ingrese el correo electrónico" className="w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => {
                if (userRole === 'admin') {
                  navigate('/dashboard/admin/residentes');
                } else {
                  navigate('/dashboard/residente/hogar');
                }
              }}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
            >
              Guardar Integrante
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
