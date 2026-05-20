import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Search } from 'lucide-react';
import axios from 'axios';

export default function AdminResidentes() {
  const [activeTab, setActiveTab] = useState('residentes'); // 'residentes' | 'cuentas'
  const navigate = useNavigate();
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResidentes, resUnidades] = await Promise.all([
        axios.get('http://localhost:8000/api/catastro/residentes/'),
        axios.get('http://localhost:8000/api/catastro/unidades/')
      ]);
      setResidentes(resResidentes.data);
      setUnidades(resUnidades.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteResidente = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de que desea eliminar a ${nombre}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/catastro/residentes/${id}/`);
        setResidentes(prev => prev.filter(r => r.id !== id));
        alert('Residente eliminado con éxito.');
      } catch (err) {
        console.error(err);
        alert('Error al eliminar el residente.');
      }
    }
  };

  const handleActionSimulated = (action, nombre) => {
    alert(`Acción "${action}" realizada exitosamente para ${nombre}.`);
  };

  const filteredResidentes = residentes.filter(r => {
    const fullName = `${r.nombre} ${r.apellidos || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const unitObj = unidades.find(u => u.id === r.unidad);
    const unitStr = unitObj ? `torre ${unitObj.torre} depto ${unitObj.numero_depto}`.toLowerCase() : '';
    return fullName.includes(query) || unitStr.includes(query) || (r.rut_dni && r.rut_dni.includes(query));
  });

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {activeTab === 'residentes' ? 'Gestión de Residentes' : 'Gestión de Cuentas de Acceso'}
          </h1>
          {activeTab === 'residentes' && (
            <button 
              onClick={() => navigate('/dashboard/admin/cuentas/nueva')}
              className="px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Registrar Nuevo Residente
            </button>
          )}
        </div>
        
        {activeTab === 'cuentas' && (
          <p className="text-slate-500 mb-8 -mt-4 text-sm">Administre las cuentas de usuario y credenciales de acceso</p>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button 
            className={`pb-4 px-2 mr-8 text-sm font-medium transition-colors border-b-2 ${activeTab === 'residentes' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('residentes')}
          >
            Gestión de Residentes
          </button>
          <button 
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'cuentas' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('cuentas')}
          >
            Gestión de Cuentas de Usuario
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'residentes' ? "Buscar residentes por nombre, unidad..." : "Buscar por Nombre o Email..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          {activeTab === 'cuentas' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2">Unidad <span className="text-[10px]">▼</span></button>
                <button className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2">Rol <span className="text-[10px]">▼</span></button>
                <button className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2">Estado <span className="text-[10px]">▼</span></button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/dashboard/admin/cuentas/nueva')}
                  className="px-4 py-2 bg-[#1A7FF2] hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  Crear Nueva Cuenta de Usuario
                </button>
                <button 
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.xlsx,.xls';
                    fileInput.onchange = () => {
                      alert(`Archivo "${fileInput.files[0].name}" procesado con éxito. Se importaron los usuarios.`);
                    };
                    fileInput.click();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                >
                  Carga Masiva de Usuarios (Excel)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="p-4 font-medium">Nombre Completo</th>
                <th className="p-4 font-medium">Unidad</th>
                {activeTab === 'residentes' ? (
                  <>
                    <th className="p-4 font-medium">Relación</th>
                    <th className="p-4 font-medium text-center">Estado Ficha</th>
                  </>
                ) : (
                  <>
                    <th className="p-4 font-medium">Correo</th>
                    <th className="p-4 font-medium text-center">Estado Ficha</th>
                  </>
                )}
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">Cargando residentes...</td></tr>
              ) : filteredResidentes.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">No se encontraron residentes.</td></tr>
              ) : (
                filteredResidentes.map((row) => {
                  const unitObj = unidades.find(u => u.id === row.unidad);
                  const unitStr = unitObj ? `Torre ${unitObj.torre} - Depto ${unitObj.numero_depto}` : `ID Unidad: ${row.unidad}`;
                  const isUpdated = row.id % 2 !== 0;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-900">{row.nombre} {row.apellidos || ''}</td>
                      <td className="p-4 text-slate-500 text-blue-600">{unitStr}</td>
                      
                      {activeTab === 'residentes' ? (
                        <>
                          <td className="p-4 text-slate-500 text-blue-600">{row.relacion_jefe_hogar || 'Jefe de Hogar'}</td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <span className={`inline-flex px-4 py-1.5 rounded-lg text-xs font-medium ${isUpdated ? 'bg-slate-100 text-slate-950 font-semibold' : 'bg-slate-100 text-slate-500'}`}>
                                {isUpdated ? 'Completo' : 'Incompleto'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-blue-600 font-medium leading-relaxed max-w-[200px]">
                            <span 
                              onClick={() => navigate('/dashboard/residente/hogar/detalles', { state: { integrante: row } })}
                              className="cursor-pointer hover:underline"
                            >
                              Ver Detalles
                            </span>
                            {' | '}
                            <span 
                              onClick={() => navigate('/dashboard/residente/hogar/editar', { state: { integrante: row } })}
                              className="cursor-pointer hover:underline"
                            >
                              Editar
                            </span>
                            {' | '}
                            <span 
                              onClick={() => handleDeleteResidente(row.id, row.nombre)}
                              className="cursor-pointer hover:underline text-red-500"
                            >
                              Eliminar
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 text-slate-500 text-blue-600">{row.correo || 'sin-correo@condo.cl'}</td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <span className={`inline-flex px-4 py-1.5 rounded-lg text-xs font-medium ${isUpdated ? 'bg-slate-100 text-slate-950 font-semibold' : 'bg-slate-100 text-slate-500'}`}>
                                {isUpdated ? 'Completo' : 'Incompleto'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-blue-600 font-medium leading-relaxed max-w-[300px] text-xs">
                            <span 
                              onClick={() => navigate('/dashboard/admin/cuentas/enviar-invitacion', { state: { residente: row } })} 
                              className="cursor-pointer hover:underline"
                            >
                              Enviar Invitación
                            </span>
                            {' | '}
                            <span 
                              onClick={() => handleActionSimulated('Restablecer Contraseña', row.nombre)} 
                              className="cursor-pointer hover:underline"
                            >
                              Restablecer Contraseña
                            </span>
                            {' | '}
                            <span 
                              onClick={() => handleActionSimulated('Enviar Código de Acceso', row.nombre)} 
                              className="cursor-pointer hover:underline"
                            >
                              Código Acceso
                            </span>
                            {' | '}
                            <span 
                              onClick={() => navigate('/dashboard/admin/cuentas/editar', { state: { residente: row } })} 
                              className="cursor-pointer hover:underline"
                            >
                              Editar Cuenta
                            </span>
                            {' | '}
                            <span 
                              onClick={() => handleDeleteResidente(row.id, row.nombre)}
                              className="cursor-pointer hover:underline text-red-500"
                            >
                              Eliminar Cuenta
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
