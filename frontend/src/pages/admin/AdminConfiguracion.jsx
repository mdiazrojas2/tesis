import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Save } from 'lucide-react';
import axios from 'axios';

export default function AdminConfiguracion() {
  const [activeTab, setActiveTab] = useState('general');
  const [condominioId, setCondominioId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email_administracion: '',
    telefono_administracion: '',
    notificar_vencimiento_datos: true,
    notificar_actualizacion_planes: true,
    frecuencia_planes: 'Anual',
    plantilla_vencimiento: '',
    plantilla_planes: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/catastro/condominios/1/')
      .then(res => {
        setCondominioId(res.data.id);
        setFormData({
          nombre: res.data.nombre || '',
          email_administracion: res.data.email_administracion || '',
          telefono_administracion: res.data.telefono_administracion || '',
          notificar_vencimiento_datos: res.data.notificar_vencimiento_datos,
          notificar_actualizacion_planes: res.data.notificar_actualizacion_planes,
          frecuencia_planes: res.data.frecuencia_planes || 'Anual',
          plantilla_vencimiento: res.data.plantilla_vencimiento || '',
          plantilla_planes: res.data.plantilla_planes || ''
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!condominioId) return;
    setIsSaving(true);
    try {
      await axios.patch(`http://localhost:8000/api/catastro/condominios/${condominioId}/`, formData);
      alert('Configuración guardada exitosamente.');
    } catch (error) {
      console.error(error);
      alert('Error al guardar configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Configuración del Sistema</h1>
        
        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <button 
            className={`pb-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            onClick={() => setActiveTab('general')}
          >
            General y Notificaciones
          </button>
          <button 
            className={`pb-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'seguridad' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            onClick={() => setActiveTab('seguridad')}
          >
            Seguridad y Contraseña
          </button>
        </div>

        <div className="max-w-3xl pb-12">
          {activeTab === 'general' && (
            <div className="space-y-8">
              
              {/* Opciones Generales */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Configuración del Condominio</h3>
                  <p className="text-sm text-slate-500">Ajustes básicos del sistema</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Condominio</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Correo de Administración (Para notificaciones)</label>
                    <input type="email" name="email_administracion" value={formData.email_administracion} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono de Administración</label>
                    <input type="text" name="telefono_administracion" value={formData.telefono_administracion} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" />
                  </div>
                </div>
              </div>

              {/* Notificaciones */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Reglas de Notificación Automática</h3>
                  <p className="text-sm text-slate-500">Configure los correos automáticos para los residentes</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Vencimiento de Datos Médicos</p>
                      <p className="text-xs text-slate-500 mt-1">Enviar correo a residentes cuando pasen 12 meses sin actualizar ficha.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="notificar_vencimiento_datos" checked={formData.notificar_vencimiento_datos} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Actualización de Planes de Emergencia</p>
                      <p className="text-xs text-slate-500 mt-1">Notificar a residentes cuando se suba un nuevo Plan de Evacuación.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="notificar_actualizacion_planes" checked={formData.notificar_actualizacion_planes} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Plantilla: Vencimiento de Datos</label>
                    <textarea name="plantilla_vencimiento" value={formData.plantilla_vencimiento} onChange={handleChange} rows="3" className="w-full border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 resize-none"></textarea>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Plantilla: Actualización de Planes</label>
                    <textarea name="plantilla_planes" value={formData.plantilla_planes} onChange={handleChange} rows="3" className="w-full border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 resize-none"></textarea>
                  </div>
                </div>
              </div>

              {/* Frecuencia de Planes */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Frecuencia de Planes de Emergencia</h3>
                  <p className="text-sm text-slate-500">¿Con qué frecuencia expiran los planes actuales?</p>
                </div>
                <div className="p-6">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="frecuencia_planes" value="Anual" checked={formData.frecuencia_planes === 'Anual'} onChange={handleChange} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Anual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="frecuencia_planes" value="Bianual" checked={formData.frecuencia_planes === 'Bianual'} onChange={handleChange} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Bianual (Cada 2 años)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Cambiar Contraseña</h3>
                <p className="text-xs text-slate-500 mt-1">Actualice la contraseña para su cuenta de administrador.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña Actual *</label>
                  <input 
                    type="password" 
                    placeholder="Ingrese su contraseña actual" 
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nueva Contraseña *</label>
                  <input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Nueva Contraseña *</label>
                  <input 
                    type="password" 
                    placeholder="Repita la nueva contraseña" 
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => alert("Contraseña de administrador actualizada con éxito.")}
                  className="px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          )}

          {/* Global Actions */}
          {activeTab === 'general' && (
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => {
                  if (window.confirm("¿Está seguro de que desea descartar los cambios?")) {
                    axios.get('http://localhost:8000/api/catastro/condominios/1/')
                      .then(res => {
                        setFormData({
                          nombre: res.data.nombre || '',
                          email_administracion: res.data.email_administracion || '',
                          telefono_administracion: res.data.telefono_administracion || '',
                          notificar_vencimiento_datos: res.data.notificar_vencimiento_datos,
                          notificar_actualizacion_planes: res.data.notificar_actualizacion_planes,
                          frecuencia_planes: res.data.frecuencia_planes || 'Anual',
                          plantilla_vencimiento: res.data.plantilla_vencimiento || '',
                          plantilla_planes: res.data.plantilla_planes || ''
                        });
                        alert('Cambios descartados. Se volvió a cargar la configuración guardada.');
                      })
                      .catch(err => console.error(err));
                  }
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg transition-colors text-sm"
              >
                Descartar Cambios
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2.5 font-bold rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2 ${isSaving ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-[#1A7FF2] hover:bg-blue-600 text-white'}`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
