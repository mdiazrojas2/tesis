import React from 'react';
import axios from 'axios';
import { Building2 } from 'lucide-react';

export default function AdminEnviarInvitacion() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.residente?.correo || 'sofia.rodriguez@email.com';
  const nombre = location.state?.residente?.nombre || 'Sofía';

  const handleConfirm = async () => {
    try {
      const residenteId = location.state?.residente?.id;
      if (!residenteId) {
        alert('No se encontró el ID del residente.');
        return;
      }
      await axios.post(`http://localhost:8000/api/residentes/${residenteId}/enviar-invitacion/`);
      alert('Invitación enviada exitosamente al correo ' + email);
      navigate('/dashboard/admin/residentes');
    } catch (error) {
      console.error(error);
      alert('Error al enviar la invitación.');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Enviar Invitación</h1>
          <p className="text-slate-500 mb-8 text-sm">Confirme el envío de una invitación al usuario</p>
          
          <p className="text-slate-800 font-medium mb-10 text-base">
            ¿Está seguro de que desea enviar una nueva invitación de acceso a <strong>{nombre} ({email})</strong>?
          </p>

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => navigate('/dashboard/admin/residentes')}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm shadow-sm"
            >
              Confirmar Envío
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
