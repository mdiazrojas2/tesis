import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { FileText } from 'lucide-react';
import api from '../api/axiosConfig';
import useResidentUnit from '../hooks/useResidentUnit';

export default function DashboardResidente() {
  const [residentesCount, setResidentesCount] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const { unitId, unitInfo, loading: unitLoading } = useResidentUnit();
  const [residente, setResidente] = useState(null);
  const [diasRestantes, setDiasRestantes] = useState(180);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (unitLoading || !unitId) return;

    // Count residents in same unit (use admin-level endpoint won't work for residents)
    // The resident count comes from the hook - we already know at least 1
    setResidentesCount(1);

    // Fetch notifications (backend already filters by unit for residents)
    api.get('catastro/notificaciones/')
      .then(r => setNotificaciones(r.data))
      .catch(err => console.error('Error fetching notificaciones:', err));

    // Fetch documents (show all available to this user)
    api.get('catastro/documentos/')
      .then(r => setDocumentos(r.data.slice(0, 3)))
      .catch(err => console.error('Error fetching documentos:', err));

    // Fetch resident data to calculate expiration
    api.get('catastro/residentes/')
      .then(r => {
        if (r.data.length > 0) {
          // Tomamos el primer residente (generalmente el jefe de hogar logueado)
          const myRes = r.data[0];
          setResidente(myRes);
          if (myRes.fecha_ultima_actualizacion) {
            const ultima = new Date(myRes.fecha_ultima_actualizacion);
            const hoy = new Date();
            const diasPasados = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24));
            setDiasRestantes(180 - diasPasados);
          }
        }
      })
      .catch(err => console.error(err));
  }, [unitLoading, unitId]);

  const handleConfirmData = async () => {
    if (!residente) return;
    setIsConfirming(true);
    try {
      await api.post(`catastro/residentes/${residente.id}/confirmar-datos/`);
      setDiasRestantes(180);
      alert('¡Gracias! Tus datos han sido confirmados por 6 meses más.');
    } catch (err) {
      console.error(err);
      alert('Error al confirmar datos.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role="residente" unitInfo={unitInfo} />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Bienvenido Residente</h1>

        {residente && (
          <section className="mb-8">
            <div className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${diasRestantes <= 30 ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'}`}>
              <div>
                <h3 className={`font-bold ${diasRestantes <= 30 ? 'text-rose-900' : 'text-blue-900'}`}>
                  Vigencia de Datos (Revisión Semestral)
                </h3>
                <p className={`text-sm mt-1 ${diasRestantes <= 30 ? 'text-rose-700' : 'text-blue-700'}`}>
                  {diasRestantes > 0 
                    ? `Tus datos de contacto y salud expiran en ${diasRestantes} días. Por normativa, debes confirmarlos.` 
                    : 'Tus datos han expirado. Por favor, revísalos y confírmalos a la brevedad.'}
                </p>
              </div>
              <button 
                onClick={handleConfirmData}
                disabled={isConfirming}
                className={`shrink-0 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors shadow-sm ${diasRestantes <= 30 ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'} ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isConfirming ? 'Confirmando...' : 'Mis datos siguen correctos'}
              </button>
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Resumen de mi unidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">Departamento</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  {unitInfo ? `${unitInfo.numero_depto || '-'}` : '...'}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {unitInfo ? ((unitInfo.torre && unitInfo.torre !== 'null') ? `Torre ${unitInfo.torre}` : '') : ''}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">Incidentes ocurridos en el último período</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">0</span>
                <span className="text-sm font-medium text-emerald-600">Estable</span>
              </div>
            </div>

          </div>
        </section>

        <section className="tour-step-notifications mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Notificaciones y Avisos</h2>
          {notificaciones.length === 0 ? (
            <p className="text-sm text-slate-500">No hay notificaciones por el momento.</p>
          ) : (
            <div className="space-y-6">
              {notificaciones.map((note) => (
                <div key={note.id} className="flex flex-col md:flex-row gap-6 items-start bg-white p-4 border border-slate-100 rounded-xl shadow-sm">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{note.titulo}</h3>
                    <p className="text-sm text-slate-600">{note.mensaje}</p>
                    {note.fecha && <p className="text-[10px] text-slate-400 mt-2">{new Date(note.fecha).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="tour-step-quick-actions text-lg font-bold text-slate-900 mb-4">Documentos Importantes</h2>
          {documentos.length === 0 ? (
            <p className="text-sm text-slate-500">No hay documentos disponibles.</p>
          ) : (
            <div className="space-y-4">
              {documentos.map((doc) => (
                <div key={doc.id} onClick={() => doc.archivo && window.open(`${doc.archivo}?v=${doc.version || '1.0'}`, '_blank')} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{doc.titulo}</h3>
                    <p className="text-sm text-slate-500">{doc.descripcion || `Versión: ${doc.version || '1.0'}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
