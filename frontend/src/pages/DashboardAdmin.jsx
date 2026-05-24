import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Clock, FileText } from 'lucide-react';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Semanal');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResidentes, resUnidades, resDocumentos, resNotificaciones] = await Promise.all([
        axios.get('http://localhost:8000/api/catastro/residentes/'),
        axios.get('http://localhost:8000/api/catastro/unidades/'),
        axios.get('http://localhost:8000/api/catastro/documentos/'),
        axios.get('http://localhost:8000/api/catastro/notificaciones/')
      ]);
      setResidentes(resResidentes.data);
      setUnidades(resUnidades.data);
      setDocumentos(resDocumentos.data);
      setNotificaciones(resNotificaciones.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPlan = () => {
    // Find if there is a plan document
    const planDoc = documentos.find(d => 
      d.titulo.toLowerCase().includes('plan') || 
      d.tipo_documento.toLowerCase().includes('planes')
    );
    if (planDoc && planDoc.archivo) {
      window.open(planDoc.archivo, '_blank');
    } else {
      alert("No se encontró ningún archivo de Plan de Emergencia cargado en el sistema. Redirigiendo a Gestión Documental.");
      navigate('/dashboard/admin/documentos');
    }
  };

  // Build chart data: always group by apartment unit
  const getChartData = () => {
    if (residentes.length === 0) return [{ label: 'Sin datos', height: '10%', count: 0 }];

    // Count residents per unit
    const byDepto = {};
    residentes.forEach(r => {
      const unit = unidades.find(u => u.id === r.unidad);
      const label = (unit?.torre && unit.torre !== 'null') ? `Torre ${unit.torre} - Depto ${unit.numero_depto}` : `Depto ${unit?.numero_depto || r.unidad}`;
      byDepto[label] = (byDepto[label] || 0) + 1;
    });

    const entries = Object.entries(byDepto);
    const maxVal = Math.max(...entries.map(([, c]) => c), 1);

    let slice;
    switch (activeFilter) {
      case 'Semanal':  slice = entries.slice(-6);  break;
      case 'Mensual':  slice = entries.slice(-12); break;
      case 'Anual':    slice = entries;             break;
      default:         slice = entries.slice(-6);
    }

    return slice.map(([label, count]) => ({
      label,
      height: `${Math.round((count / maxVal) * 100)}%`,
      count
    }));
  };

  // Compute real updated percentage
  const updatedCount = residentes.filter(row => {
    const filledFields = [
      row.nombre, row.rut_dni, row.fecha_nacimiento, row.nacionalidad,
      row.idioma_principal, row.relacion_jefe_hogar, row.telefono, row.correo,
      row.contacto_emergencia_nombre, row.contacto_emergencia_telefono
    ].filter(val => val && String(val).trim() !== '').length;
    return filledFields >= 10;
  }).length;
  const updatedPct = residentes.length > 0 ? Math.round((updatedCount / residentes.length) * 100) : 0;

  // Unidades sin residentes
  const deptosSinResidentes = unidades.filter(u => !residentes.some(r => r.unidad === u.id));

  // Plan de Emergencia Dynamic Expiration
  const planDoc = documentos.find(d => 
    d.titulo.toLowerCase().includes('plan') || 
    d.tipo_documento.toLowerCase().includes('planes')
  );

  let planVencimientoStr = "No hay plan de emergencia cargado";
  let isPlanExpired = false;
  let isPlanExpiringSoon = false;

  if (planDoc) {
    let vencimientoDate = null;
    if (planDoc.fecha_emision) {
      const d = new Date(planDoc.fecha_emision + 'T00:00:00');
      d.setFullYear(d.getFullYear() + 1);
      vencimientoDate = d;
    } else if (planDoc.fecha_subida) {
      const d = new Date(planDoc.fecha_subida);
      d.setFullYear(d.getFullYear() + 1);
      vencimientoDate = d;
    }
    if (vencimientoDate) {
      planVencimientoStr = "Vence el " + vencimientoDate.toLocaleDateString('es-CL');
      const diffDays = (vencimientoDate - new Date()) / (1000 * 60 * 60 * 24);
      if (diffDays < 0) isPlanExpired = true;
      else if (diffDays <= 30) isPlanExpiringSoon = true;
    }
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Panel Administrativo de Catastro</h1>

        {/* Estadísticas Generales */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Estadísticas Generales</h2>
          
          <div className="tour-step-stats-filters flex gap-2 mb-6 overflow-x-auto pb-2">
            {['Semanal', 'Mensual', 'Anual'].map(filter => {
              const isActive = activeFilter === filter;
              return (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 border rounded-md text-sm transition-colors flex items-center gap-2 ${
                    isActive 
                      ? 'bg-slate-900 text-white border-slate-900 font-medium' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {filter} <span className="text-[10px]">▼</span>
                </button>
              );
            })}
          </div>

          <div className="tour-step-chart border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-6">Residentes Registrados (Vista: {activeFilter})</h3>
            <div className="flex items-end justify-between h-32 gap-2 md:gap-8 px-4 transition-all duration-300 mt-8">
              {getChartData().map(bar => (
                <div 
                  key={bar.label} 
                  onClick={() => bar.label !== 'Sin datos' && navigate('/dashboard/admin/residentes', { state: { activeTab: 'residentes', searchQuery: bar.label } })}
                  className={`flex flex-col items-center justify-end flex-1 h-full ${bar.label !== 'Sin datos' ? 'cursor-pointer group' : ''}`}
                  title={bar.label !== 'Sin datos' ? `Ver residentes de ${bar.label}` : ''}
                >
                  <span className={`text-xs font-bold text-[#1A7FF2] mb-1 ${bar.label !== 'Sin datos' ? 'group-hover:text-blue-700' : ''}`}>{bar.count}</span>
                  <div className={`w-full max-w-[40px] bg-[#1A7FF2]/80 rounded-t-sm transition-all duration-500 ease-out ${bar.label !== 'Sin datos' ? 'group-hover:bg-[#1A7FF2]' : ''}`} style={{ height: bar.height }}></div>
                  <span className="text-[10px] md:text-xs text-slate-500 mt-2 font-medium text-center truncate w-full max-w-[80px]" title={bar.label}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Datos de Residentes Actualizados</span>
              <span>{updatedPct}% ({updatedCount} de {residentes.length})</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all duration-500"
                style={{ width: `${updatedPct}%` }}
              ></div>
            </div>
          </div>

          {/* Card: Documentos y Sin Residentes */}
          <div className="tour-step-stats grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={() => navigate('/dashboard/admin/documentos')}
              className="border border-slate-200 rounded-xl p-6 cursor-pointer hover:border-[#1A7FF2] hover:shadow-md transition-all group"
            >
              <p className="text-sm text-slate-600 mb-2 group-hover:text-[#1A7FF2] transition-colors">Documentos Cargados</p>
              <span className="text-3xl font-bold text-slate-900">{documentos.length}</span>
            </div>
            <div 
              onClick={() => navigate('/dashboard/admin/residentes', { state: { activeTab: 'unidades', filterType: 'sin_residentes' } })}
              className="border border-amber-200 bg-amber-50 rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-amber-400 transition-all group"
            >
              <p className="text-sm text-amber-700 font-medium mb-2 group-hover:text-amber-800 transition-colors">Departamentos sin Residentes</p>
              <span className="text-3xl font-bold text-amber-600 mb-2 block">{deptosSinResidentes.length}</span>
              {deptosSinResidentes.length > 0 && (
                <p className="text-xs text-amber-600/80">
                  {deptosSinResidentes.slice(0, 5).map(u => (u.torre && u.torre !== 'null') ? `T${u.torre}-${u.numero_depto}` : `Depto ${u.numero_depto}`).join(', ')}
                  {deptosSinResidentes.length > 5 ? '...' : ''}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Catastro de Residentes */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Catastro de Residentes</h2>
          
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="p-4 font-medium">Nombre</th>
                    <th className="p-4 font-medium">Departamento</th>
                    <th className="p-4 font-medium">Estado de Actualización</th>
                    <th className="p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-500">Cargando datos...</td></tr>
                  ) : residentes.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-500">No hay residentes registrados.</td></tr>
                  ) : (
                    residentes.map((r) => {
                      const depto = unidades.find(u => u.id === r.unidad)?.numero_depto || r.unidad;
                      const filledFields = [
                        r.nombre, r.rut_dni, r.fecha_nacimiento, r.nacionalidad,
                        r.idioma_principal, r.relacion_jefe_hogar, r.telefono, r.correo,
                        r.contacto_emergencia_nombre, r.contacto_emergencia_telefono
                      ].filter(val => val && String(val).trim() !== '').length;
                      const isUpdated = filledFields >= 10; 
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-4 text-slate-900">{r.nombre} {r.apellidos || ''}</td>
                          <td className="p-4 text-slate-500 text-blue-600">Apto {depto}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-3 py-1 rounded-md text-xs font-medium ${isUpdated ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {isUpdated ? 'Actualizado' : 'Pendiente'}
                            </span>
                          </td>
                          <td 
                            onClick={() => navigate('/dashboard/admin/cuentas/editar', { state: { residente: r } })}
                            className="p-4 text-blue-600 font-medium cursor-pointer hover:underline"
                          >
                            Editar
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard/admin/cuentas/nueva')}
            className="bg-[#1A7FF2] hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            Registrar Residente
          </button>
        </section>

        {/* Notificaciones y Documental */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Notificaciones Automáticas</h2>
          
          <div className="space-y-4 mb-8">
            {notificaciones.length === 0 ? (
              <p className="text-sm text-slate-500">No hay notificaciones recientes.</p>
            ) : (
              notificaciones.slice().reverse().slice(0, 5).map(notif => (
                <div key={notif.id} className="flex items-start gap-4 border-b border-slate-50 pb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${notif.tipo === 'Alerta' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm">{notif.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-1">{notif.mensaje}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-4">Gestión Documental</h2>
          
          {planDoc ? (
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center relative">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <span className="absolute text-[8px] font-bold mt-2 ml-4 bg-white rounded px-0.5">PDF</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 text-sm">{planDoc.titulo}</h3>
                  <p className={`text-xs mt-1 ${isPlanExpired ? 'text-red-600 font-medium' : isPlanExpiringSoon ? 'text-orange-500 font-medium' : 'text-slate-500'}`}>
                    {planVencimientoStr}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleDownloadPlan}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Descargar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              <p className="text-sm text-slate-500">{planVencimientoStr}</p>
            </div>
          )}
          
          <button 
            onClick={() => navigate('/dashboard/admin/documentos/nuevo')}
            className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cargar Plan
          </button>
        </section>

      </main>
    </div>
  );
}
