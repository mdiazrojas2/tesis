import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Clock, Bell } from 'lucide-react';
import axios from 'axios';

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/catastro/notificaciones/');
        setNotificaciones(response.data.reverse()); // Show newest first
      } catch (error) {
        console.error("Error fetching notificaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotificaciones();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notificaciones</h1>
              <p className="text-slate-500 mt-1">Historial de alertas y actividad del sistema</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Cargando notificaciones...</div>
            ) : notificaciones.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No hay notificaciones registradas en el historial.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notificaciones.map(notif => (
                  <div key={notif.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-5 items-start">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.tipo === 'Alerta' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900 text-base">{notif.titulo}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          notif.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {notif.estado}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{notif.mensaje}</p>
                      <p className="text-xs text-slate-400 mt-3 font-medium">Tipo: {notif.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
