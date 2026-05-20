import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Search, AlertCircle, Building, CheckCircle2 } from 'lucide-react';

function App() {
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    unidad: '',
    tipo: 'PROPIETARIO'
  });

  const handleFuncEnDesarrollo = () => {
    alert("🚀 Esta funcionalidad estará disponible muy pronto.");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResidentes, resUnidades] = await Promise.all([
        axios.get('http://localhost:8000/api/residentes/'),
        axios.get('http://localhost:8000/api/unidades/')
      ]);
      setResidentes(resResidentes.data);
      setUnidades(resUnidades.data);
      if (resUnidades.data.length > 0) {
        setFormData(prev => ({ ...prev, unidad: resUnidades.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveResidente = async () => {
    if (!formData.nombre || !formData.unidad) {
      alert("Por favor completa todos los campos.");
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/residentes/', {
        nombre: formData.nombre,
        unidad: formData.unidad,
        tipo: formData.tipo,
        requiere_asistencia_emergencia: false
      });
      alert("¡Residente guardado con éxito!");
      setIsModalOpen(false);
      setFormData({ nombre: '', unidad: unidades[0]?.id || '', tipo: 'PROPIETARIO' });
      fetchData(); // Refresh table
    } catch (error) {
      console.error("Error saving:", error);
      alert("Hubo un error al guardar.");
    }
  };

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
            <button onClick={handleFuncEnDesarrollo} className="hover:text-brand-100 transition text-slate-900">Dashboard</button>
            <button onClick={handleFuncEnDesarrollo} className="hover:text-brand-100 transition text-slate-900">Condominios</button>
            <button onClick={handleFuncEnDesarrollo} className="bg-white text-slate-900 px-4 py-1.5 rounded-full font-semibold shadow-sm hover:bg-brand-50 transition">
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
              Condominio Volcanes
            </h1>
            <p className="text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Plan de Emergencia Activo (Vence: 12/dic/2026)
            </p>
          </div>
          <div className="w-full md:w-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-slate-900 px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
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
                    <td className="p-4 text-slate-500">
                      {unidades.find(u => u.id === r.unidad)?.numero_depto || r.unidad}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {r.tipo}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {r.requiere_asistencia_emergencia ? (
                        <div className="flex items-center justify-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-max mx-auto text-sm font-medium border border-amber-100">
                          <AlertCircle className="w-4 h-4" />
                          <span>Sí</span>
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

      {/* Modal Mockup - Nuevo Residente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Registrar Nuevo Residente</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500" 
                  placeholder="Ej. Ana Soto" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad/Depto</label>
                  <select 
                    value={formData.unidad}
                    onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 bg-white"
                  >
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.numero_depto}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select 
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 bg-white"
                  >
                    <option value="PROPIETARIO">Propietario</option>
                    <option value="ARRENDATARIO">Arrendatario</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveResidente}
                  className="px-4 py-2 font-medium text-slate-900 bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Guardar Residente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
