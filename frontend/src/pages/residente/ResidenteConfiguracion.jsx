import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { ShieldCheck } from 'lucide-react';
import useResidentUnit from '../../hooks/useResidentUnit';

export default function ResidenteConfiguracion() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { unitInfo } = useResidentUnit();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      alert("Por favor, rellene todos los campos.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    if (formData.newPassword.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      alert("Contraseña actualizada exitosamente.");
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="residente" unitInfo={unitInfo} />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Configuración de Cuenta</h1>

        <div className="max-w-xl">
          <form onSubmit={handleSave} className="tour-step-form bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-slate-700" />
              <div>
                <h3 className="font-bold text-slate-900">Seguridad</h3>
                <p className="text-xs text-slate-500 mt-0.5">Actualice su contraseña de acceso</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña Actual *</label>
                <input 
                  type="password" 
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su contraseña actual" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nueva Contraseña *</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Nueva Contraseña *</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repita la nueva contraseña" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" 
                />
              </div>
            </div>

            <div className="tour-step-save p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className={`px-6 py-2.5 font-bold rounded-lg text-sm transition-colors shadow-sm ${
                  isSaving ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-[#1A7FF2] hover:bg-blue-600 text-white'
                }`}
              >
                {isSaving ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
