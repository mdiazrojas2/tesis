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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (unitLoading || !unitId) return;

    // Count residents in same unit (use admin-level endpoint won't work for residents)
    // We will update it when fetching residentes data below
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
          setResidentesCount(r.data.length);
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
            <div className={`tour-step-vigencia-datos p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${diasRestantes <= 30 ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'}`}>
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
              <p className="text-sm text-slate-600 mb-2">Integrantes del grupo familiar</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">{residentesCount}</span>
                <span className="text-sm font-medium text-blue-600">Registrados</span>
              </div>
            </div>

          </div>
        </section>

        <section className="tour-step-notifications mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-lg font-bold text-slate-900">Notificaciones y Avisos</h2>
            <div className="tour-step-notifications-filter flex items-center gap-2 text-sm">
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 mb-1">Desde</label>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 mb-1">Hasta</label>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button 
                  onClick={() => {setDateFrom(''); setDateTo('');}}
                  className="mt-5 text-xs text-blue-600 hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {(() => {
            const filtered = notificaciones.filter(note => {
              if (!note.fecha) return true;
              const noteDate = new Date(note.fecha).getTime();
              if (dateFrom && noteDate < new Date(dateFrom).getTime()) return false;
              if (dateTo && noteDate > new Date(dateTo).getTime() + 86400000) return false;
              return true;
            }).sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

            const hasFilter = dateFrom || dateTo;
            const displayNotes = hasFilter ? filtered : filtered.slice(0, 5);

            if (displayNotes.length === 0) {
              return <p className="text-sm text-slate-500">No hay notificaciones para mostrar.</p>;
            }

            return (
              <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="p-4 font-medium">Fecha</th>
                      <th className="p-4 font-medium">Título</th>
                      <th className="p-4 font-medium">Mensaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayNotes.map(note => (
                      <tr key={note.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500 whitespace-nowrap">
                          {note.fecha ? new Date(note.fecha).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="p-4 text-slate-900 font-medium">{note.titulo}</td>
                        <td className="p-4 text-slate-600">{note.mensaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!hasFilter && filtered.length > 5 && (
                  <div className="p-3 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-500">Mostrando las 5 notificaciones más recientes. Use los filtros para ver más.</p>
                  </div>
                )}
              </div>
            );
          })()}
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
