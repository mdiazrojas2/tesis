import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Search } from 'lucide-react';
import axios from 'axios';

const RELACION_MAP = {
  'JEFE_HOGAR': 'Jefe de Hogar',
  'CONYUGE': 'Cónyuge',
  'ARRENDATARIO': 'Arrendatario',
  'FAMILIAR_MENOR': 'Familiar menor de edad',
  'FAMILIAR_ADULTO': 'Familiar adulto',
  'FAMILIAR_MAYOR': 'Familiar adulto mayor',
  'OTRO': 'Otro'
};

export default function AdminResidentes() {
  const [activeTab, setActiveTab] = useState('residentes'); // 'residentes' | 'cuentas' | 'unidades'
  const [expandedUnidades, setExpandedUnidades] = useState({});
  const navigate = useNavigate();
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'movilidad', 'medico', 'mayor', 'menor', 'incompleto', 'completo', 'sin_residentes'

  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.filterType) {
      setFilterType(location.state.filterType);
    }
  }, [location.state]);

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

  // Reset filters when switching tabs only if it's a direct user click or state change without specific filter
  useEffect(() => {
    // Only reset if we are not being forced by router state
    if (location.state?.filterType) return;
    setFilterType('todos');
    setSearchQuery('');
  }, [activeTab, location.state]);

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

  const handleRestablecerClave = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de enviar un correo a ${nombre} para restablecer su contraseña?`)) {
      try {
        await axios.post(`http://localhost:8000/api/catastro/residentes/${id}/restablecer-clave/`);
        alert('Correo de restablecimiento enviado exitosamente.');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || 'Error al restablecer la contraseña.');
      }
    }
  };

  const handleCargaMasiva = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('archivo', file);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/catastro/residentes/carga-masiva/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.detail);
      fetchData(); // Reload data
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Error en la carga masiva.');
    } finally {
      setLoading(false);
      e.target.value = null; // reset file input
    }
  };

  const handleActionSimulated = (action, nombre) => {
    alert(`Acción "${action}" realizada exitosamente para ${nombre}.`);
  };

  const getUnitString = (u) => {
    if (!u) return '';
    return (u.torre && u.torre !== 'null') ? `Torre ${u.torre} - Depto ${u.numero_depto}` : `Depto ${u.numero_depto}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const isFichaCompleta = (r) => {
    const filledFields = [
      r.nombre, r.rut_dni, r.fecha_nacimiento, r.nacionalidad,
      r.idioma_principal, r.relacion_jefe_hogar, r.telefono, r.correo,
      r.contacto_emergencia_nombre, r.contacto_emergencia_telefono
    ].filter(val => val && String(val).trim() !== '').length;
    return filledFields >= 10;
  };

  const filteredResidentes = residentes.filter(r => {
    // Search query
    const fullName = `${r.nombre} ${r.apellidos || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const unitObj = unidades.find(u => u.id === r.unidad);
    const unitStr = unitObj ? (unitObj.torre && unitObj.torre !== 'null' ? `torre ${unitObj.torre} depto ${unitObj.numero_depto}`.toLowerCase() : `depto ${unitObj.numero_depto}`.toLowerCase()) : '';
    const matchSearch = fullName.includes(query) || unitStr.includes(query) || (r.rut_dni && r.rut_dni.includes(query));

    // Type filter
    let matchFilter = true;
    const age = calculateAge(r.fecha_nacimiento);
    
    if (filterType === 'movilidad') {
      matchFilter = r.movilidad_reducida === true;
    } else if (filterType === 'medico') {
      matchFilter = r.condicion_medica === true;
    } else if (filterType === 'mayor') {
      matchFilter = r.relacion_jefe_hogar === 'FAMILIAR_MAYOR' || (age !== null && age >= 60);
    } else if (filterType === 'menor') {
      matchFilter = r.relacion_jefe_hogar === 'FAMILIAR_MENOR' || (age !== null && age < 18);
    } else if (filterType === 'incompleto') {
      matchFilter = !isFichaCompleta(r);
    } else if (filterType === 'completo') {
      matchFilter = isFichaCompleta(r);
    } else if (filterType === 'sin_residentes') {
      matchFilter = false; // Residentes individuales no pueden ser "unidades sin residentes"
    }

    return matchSearch && matchFilter;
  });

  // Filter unidades para que solo muestren si tienen residentes en filteredResidentes (o buscar por string si la query aplica a la unidad)
  const filteredUnidades = unidades.filter(u => {
    const unitStr = getUnitString(u).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = unitStr.includes(query);
    
    if (filterType === 'sin_residentes') {
      const hasAnyRes = residentes.some(r => r.unidad === u.id);
      return !hasAnyRes && (matchSearch || !searchQuery);
    }
    
    const hasFilteredRes = filteredResidentes.some(r => r.unidad === u.id);
    
    // If no query and no specific filter, show all units. 
    // If specific filter applied, only show units containing those filtered residents.
    if (filterType === 'todos' && !searchQuery) return true;
    return hasFilteredRes || (matchSearch && filterType === 'todos');
  });

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {activeTab === 'residentes' ? 'Gestión de Residentes' : activeTab === 'cuentas' ? 'Gestión de Cuentas de Acceso' : 'Gestión de Unidades'}
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
            className={`pb-4 px-2 mr-8 text-sm font-medium transition-colors border-b-2 ${activeTab === 'cuentas' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('cuentas')}
          >
            Gestión de Cuentas de Usuario
          </button>
          <button 
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'unidades' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('unidades')}
          >
            Estado por Unidad
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'unidades' ? "Buscar por unidad (Ej: Depto 101)..." : "Buscar por nombre, rut, unidad..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex-shrink-0">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="todos">Todos los residentes</option>
                <option value="movilidad">Movilidad Reducida</option>
                <option value="medico">Problemas Médicos</option>
                <option value="mayor">Adultos Mayores</option>
                <option value="menor">Niños / Menores</option>
                <option value="incompleto">Fichas Incompletas</option>
                <option value="completo">Fichas Completas</option>
                {activeTab === 'unidades' && <option value="sin_residentes">Unidades Sin Residentes</option>}
              </select>
            </div>
          </div>
          
          {activeTab === 'cuentas' && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
              <div className="flex gap-2">
                {/* Dummy visual buttons if needed, or removed since we use select */}
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
                    document.getElementById('excel-upload').click();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                >
                  Carga Masiva de Usuarios (Excel)
                </button>
                <input 
                  type="file" 
                  id="excel-upload" 
                  accept=".xlsx,.xls" 
                  className="hidden" 
                  onChange={handleCargaMasiva}
                />
              </div>
            </div>
          )}
        </div>

        {activeTab !== 'unidades' ? (
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
                    const unitStr = unitObj ? getUnitString(unitObj) : `ID Unidad: ${row.unidad}`;
                    const isUpdated = isFichaCompleta(row);

                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-900">{row.nombre} {row.apellidos || ''}</td>
                        <td className="p-4 text-slate-500 text-blue-600">{unitStr}</td>
                        
                        {activeTab === 'residentes' ? (
                          <>
                            <td className="p-4 text-slate-500 text-blue-600">{RELACION_MAP[row.relacion_jefe_hogar] || row.relacion_jefe_hogar || 'Jefe de Hogar'}</td>
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
                                onClick={() => handleRestablecerClave(row.id, row.nombre)} 
                                className="cursor-pointer hover:underline"
                              >
                                Restablecer Contraseña
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
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-4 font-medium w-12"></th>
                  <th className="p-4 font-medium">Unidad</th>
                  <th className="p-4 font-medium">Residentes Registrados</th>
                  <th className="p-4 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnidades.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-slate-500">No se encontraron unidades con esos criterios.</td></tr>
                ) : (
                filteredUnidades.map(u => {
                  // If we have a filter, show only the filtered residents for that unit
                  const residentesUnidad = (filterType === 'todos' && !searchQuery) 
                    ? residentes.filter(r => r.unidad === u.id)
                    : filteredResidentes.filter(r => r.unidad === u.id);
                  
                  const isExpanded = !!expandedUnidades[u.id];
                  const hasResidentes = residentesUnidad.length > 0;
                  
                  return (
                    <React.Fragment key={u.id}>
                      <tr className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`} onClick={() => setExpandedUnidades(prev => ({...prev, [u.id]: !prev[u.id]}))}>
                        <td className="p-4 text-slate-400">
                          {hasResidentes && (
                            <span className="text-lg leading-none">{isExpanded ? '▾' : '▸'}</span>
                          )}
                        </td>
                        <td className="p-4 font-medium text-slate-900">{getUnitString(u)}</td>
                        <td className="p-4 text-slate-600">{residentesUnidad.length} integrante(s)</td>
                        <td className="p-4 text-center">
                          {hasResidentes ? (
                            <span className="inline-flex px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Con residentes</span>
                          ) : (
                            <span className="inline-flex px-3 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">Sin residentes</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasResidentes && (
                        <tr className="bg-slate-50/50">
                          <td colSpan="4" className="p-0">
                            <div className="px-12 py-4 border-b border-slate-100">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detalle de Residentes</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {residentesUnidad.map(r => (
                                  <div key={r.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                    <p className="font-medium text-slate-900 text-sm">{r.nombre} {r.apellidos}</p>
                                    <p className="text-xs text-slate-500 mt-1">{r.relacion_jefe_hogar || 'Residente'}</p>
                                    {r.correo && <p className="text-xs text-slate-400 mt-1">{r.correo}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}
