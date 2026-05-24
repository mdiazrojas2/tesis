import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Clock, Bell } from 'lucide-react';
import axios from 'axios';

export default function AdminNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterUnit, setFilterUnit] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resNotif, resUnidades] = await Promise.all([
          axios.get('http://localhost:8000/api/catastro/notificaciones/'),
          axios.get('http://localhost:8000/api/catastro/unidades/')
        ]);
        setNotificaciones(resNotif.data.reverse()); // Show newest first
        setUnidades(resUnidades.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUnitString = (unitId) => {
    const u = unidades.find(x => x.id === unitId);
    if (!u) return '';
    return (u.torre && u.torre !== 'null') ? `Torre ${u.torre} - Depto ${u.numero_depto}` : `Depto ${u.numero_depto}`;
  };

  const filteredNotificaciones = notificaciones.filter(notif => {
    // Date filter
    if (filterDate) {
      const d = new Date(notif.fecha);
      const notifDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (notifDate !== filterDate) return false;
    }
    
    // Type filter
    if (filterType && notif.tipo !== filterType) {
      return false;
    }
    
    // Unit filter
    if (filterUnit) {
      if (notif.unidad !== parseInt(filterUnit)) return false;
    }
    
    return true;
  });

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

          <div className="tour-step-filters flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por Fecha</label>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por Tipo</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todos los tipos</option>
                <option value="Alerta">Alerta</option>
                <option value="Aviso">Aviso</option>
                <option value="Informativo">Informativo</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por Unidad</label>
              <select 
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todas las unidades (o general)</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{(u.torre && u.torre !== 'null') ? `Torre ${u.torre} - Depto ${u.numero_depto}` : `Depto ${u.numero_depto}`}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => { setFilterDate(''); setFilterType(''); setFilterUnit(''); }}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors h-[38px]"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          <div className="tour-step-table bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Cargando notificaciones...</div>
            ) : filteredNotificaciones.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No se encontraron notificaciones con los filtros actuales.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotificaciones.map(notif => {
                  const dateObj = new Date(notif.fecha);
                  const dateStr = dateObj.toLocaleDateString('es-CL');
                  const timeStr = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
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
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <p className="text-xs text-slate-400 font-medium">Tipo: {notif.tipo}</p>
                        <p className="text-xs text-slate-400 font-medium">Fecha: {dateStr} {timeStr}</p>
                        {notif.unidad && (
                          <p className="text-xs text-slate-400 font-medium">Unidad: {getUnitString(notif.unidad)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
