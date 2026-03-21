import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Search, AlertCircle, Building, CheckCircle2 } from 'lucide-react';

function App() {
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock API call simulation for now, pending connecting to backend /api/residentes
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setResidentes([
        { id: 1, nombre: 'Juan Pérez', unidad: '101A', tipo: 'Propietario', requiereAsistencia: true, condicion: 'Movilidad Reducida' },
        { id: 2, nombre: 'María González', unidad: '205B', tipo: 'Arrendatario', requiereAsistencia: false, condicion: null },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-brand-600 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-brand-100" />
            <span className="text-xl font-bold tracking-tight">CatastroEmergenciaCL</span>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <button className="hover:text-brand-100 transition">Dashboard</button>
            <button className="hover:text-brand-100 transition">Condominios</button>
            <button className="bg-white text-brand-600 px-4 py-1.5 rounded-full font-semibold shadow-sm hover:bg-brand-50 transition">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-8 h-8 text-brand-500" />
              Condominio Vista Hermosa
            </h1>
            <p className="text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Plan de Emergencia Activo (Vence: 12/dic/2026)
            </p>
          </div>
          <div className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Nuevo Residente
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 text-slate-400 focus-within:text-brand-500">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Buscar residentes por nombre o unidad..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-slate-200 border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="p-4 font-semibold">Residente</th>
                  <th className="p-4 font-semibold">Unidad</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold text-center">Asistencia Prioritaria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="4" className="text-center p-8 text-slate-400">Cargando base de datos segura...</td></tr>
                ) : residentes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 font-medium text-slate-700">{r.nombre}</td>
                    <td className="p-4 text-slate-500">{r.unidad}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {r.tipo}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {r.requiereAsistencia ? (
                        <div className="flex items-center justify-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-max mx-auto text-sm font-medium border border-amber-100">
                          <AlertCircle className="w-4 h-4" />
                          <span>Sí - {r.condicion}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </main>
    </div>
  );
}

export default App;
