import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Search } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const RELACION_MAP = {
  'JEFE_HOGAR': 'Jefe de Hogar',
  'CONYUGE': 'Cónyuge',
  'ARRENDATARIO': 'Arrendatario',
  'FAMILIAR_MENOR': 'Familiar menor de edad',
  'FAMILIAR_ADULTO': 'Familiar adulto',
  'FAMILIAR_ADULTO_MAYOR': 'Familiar adulto mayor',
  'OTRO': 'Otro'
};

export default function AdminResidentes() {
  const [activeTab, setActiveTab] = useState('residentes'); // 'residentes' | 'cuentas' | 'unidades'
  const [cuentasSubTab, setCuentasSubTab] = useState('todos'); // 'todos' | 'activas' | 'pendientes'
  const [expandedUnidades, setExpandedUnidades] = useState({});
  const navigate = useNavigate();
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
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
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
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
    if (location.state?.filterType || location.state?.searchQuery) return;
    setFilterType('todos');
    setSearchQuery('');
  }, [activeTab, location.state]);

  const handleDeleteResidente = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de que desea eliminar al residente ${nombre}? Esto borrará su ficha completa del sistema.`)) {
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

  const handleDeleteCuenta = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la cuenta de usuario de ${nombre}? El residente ya no podrá iniciar sesión, pero su ficha seguirá registrada en el sistema.`)) {
      try {
        await axios.delete(`http://localhost:8000/api/catastro/residentes/${id}/eliminar-cuenta/`);
        setResidentes(prev => prev.map(r => r.id === id ? { ...r, tiene_cuenta: false } : r));
        alert('Cuenta de usuario eliminada con éxito.');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || 'Error al eliminar la cuenta de usuario.');
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
      setReportData({
        creados: res.data.creados,
        invitaciones: res.data.invitaciones,
        errores: res.data.errores || []
      });
      fetchData(); // Reload data
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errores) {
        setReportData({
          creados: err.response.data.creados || 0,
          invitaciones: err.response.data.invitaciones || 0,
          errores: err.response.data.errores
        });
      } else {
        alert(err.response?.data?.detail || 'Error en la carga masiva.');
      }
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

  const handleExportExcel = () => {
    const dataToExport = filteredResidentes.map(r => {
      const u = unidades.find(un => un.id === r.unidad);
      return {
        'Unidad': getUnitString(u),
        'Nombre Completo': `${r.nombre} ${r.apellidos || ''}`.trim(),
        'RUT/DNI': r.rut_dni || 'N/A',
        'Correo': r.correo || 'N/A',
        'Teléfono': r.telefono || 'N/A',
        'Nacionalidad': r.nacionalidad || 'N/A',
        'Idioma Principal': r.idioma_principal || 'N/A',
        'Fecha de Nacimiento': r.fecha_nacimiento || 'N/A',
        'Edad': calculateAge(r.fecha_nacimiento) || 'N/A',
        'Relación': RELACION_MAP[r.relacion_jefe_hogar] || r.relacion_jefe_hogar || 'N/A',
        'Movilidad Reducida': r.movilidad_reducida ? 'Sí' : 'No',
        'Condición Médica': r.condicion_medica ? 'Sí' : 'No',
        'Requiere Asistencia en Emergencia': r.requiere_asistencia_emergencia ? 'Sí' : 'No',
        'Observaciones de Salud': r.detalles_salud_sensibles || 'N/A',
        'Contacto Emergencia - Nombre': r.contacto_emergencia_nombre || 'N/A',
        'Contacto Emergencia - Parentesco': r.contacto_emergencia_parentesco || 'N/A',
        'Contacto Emergencia - Teléfono': r.contacto_emergencia_telefono || 'N/A',
        'Contacto Emergencia - Correo': r.contacto_emergencia_correo || 'N/A',
        'Recibe Notificaciones': r.recibir_notificaciones ? 'Sí' : 'No',
        'Última Actualización': r.fecha_ultima_actualizacion ? new Date(r.fecha_ultima_actualizacion).toLocaleString('es-CL') : 'N/A'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Residentes");
    XLSX.writeFile(workbook, "Catastro_Residentes.xlsx");
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    
    // Use setTimeout to allow UI to update with loading state before heavy processing
    setTimeout(() => {
      try {
        const doc = new jsPDF('landscape');
        
        doc.setFontSize(16);
        doc.text('Catastro de Residentes', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);

        const tableColumn = ["Unidad", "Nombre", "RUT/DNI", "Correo", "Teléfono", "Relación", "Salud"];
        const tableRows = [];

        filteredResidentes.forEach(r => {
          const u = unidades.find(un => un.id === r.unidad);
          const salud = [];
          if (r.movilidad_reducida) salud.push('Movilidad Reducida');
          if (r.condicion_medica) salud.push('Cond. Médica');
          
          const residentData = [
            getUnitString(u),
            `${r.nombre} ${r.apellidos || ''}`,
            r.rut_dni || 'N/A',
            r.correo || 'N/A',
            r.telefono || 'N/A',
            RELACION_MAP[r.relacion_jefe_hogar] || r.relacion_jefe_hogar || 'N/A',
            salud.length > 0 ? salud.join(', ') : 'OK'
          ];
          tableRows.push(residentData);
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 35,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [26, 127, 242] }
        });

        doc.save("Catastro_Residentes.pdf");
      } catch (err) {
        console.error("Error al exportar PDF:", err);
        alert("Ocurrió un error al generar el PDF.");
      } finally {
        setIsExportingPDF(false);
      }
    }, 100);
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
      matchFilter = r.relacion_jefe_hogar === 'FAMILIAR_ADULTO_MAYOR' || (age !== null && age >= 60);
    } else if (filterType === 'menor') {
      matchFilter = r.relacion_jefe_hogar === 'FAMILIAR_MENOR' || (age !== null && age < 18);
    } else if (filterType === 'incompleto') {
      matchFilter = !isFichaCompleta(r);
    } else if (filterType === 'completo') {
      matchFilter = isFichaCompleta(r);
    } else if (filterType === 'sin_residentes') {
      matchFilter = false; // Residentes individuales no pueden ser "unidades sin residentes"
    }

    // Cuentas sub tab filter
    let matchCuentas = true;
    if (activeTab === 'cuentas') {
      if (cuentasSubTab === 'activas') {
        matchCuentas = r.tiene_cuenta === true;
      } else if (cuentasSubTab === 'pendientes') {
        matchCuentas = r.tiene_cuenta === false;
      }
    }

    return matchSearch && matchFilter && matchCuentas;
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
              className="tour-step-add px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Registrar Nuevo Residente
            </button>
          )}
        </div>
        
        {activeTab === 'cuentas' && (
          <p className="text-slate-500 mb-8 -mt-4 text-sm">Administre las cuentas de usuario y credenciales de acceso</p>
        )}

        {/* Tabs */}
        <div className="tour-step-tabs flex border-b border-slate-200 mb-8">
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
          <div className="tour-step-filters flex flex-col md:flex-row gap-4 w-full">
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
          
          {activeTab === 'residentes' && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
              <div className="tour-step-exports flex gap-2">
                <button 
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Exportar a Excel
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className={`px-4 py-2 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-2 ${isExportingPDF ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  {isExportingPDF ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12v6"></path><path d="M14 12v6"></path><path d="M8 12h8"></path></svg>
                      Exportar a PDF
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
          
          {activeTab === 'cuentas' && (
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
              <div className="tour-step-subtabs flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setCuentasSubTab('todos')}
                  className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${cuentasSubTab === 'todos' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setCuentasSubTab('activas')}
                  className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${cuentasSubTab === 'activas' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Cuentas Activas
                </button>
                <button 
                  onClick={() => setCuentasSubTab('pendientes')}
                  className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${cuentasSubTab === 'pendientes' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sin Cuenta (Pendientes)
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/dashboard/admin/cuentas/nueva')}
                  className="tour-step-add px-4 py-2 bg-[#1A7FF2] hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  Crear Nueva Cuenta de Usuario
                </button>
                <a 
                  href="/plantilla_residentes.xlsx"
                  download="plantilla_residentes.xlsx"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Descargar Plantilla Excel
                </a>
                <button 
                  onClick={() => {
                    document.getElementById('excel-upload').click();
                  }}
                  className="tour-step-massive px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
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
                      <th className="tour-step-vigencia p-4 font-medium text-center">Vigencia Datos</th>
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
                    
                    let diasVigencia = 0;
                    let isExpired = true;
                    let isWarning = false;
                    if (row.fecha_ultima_actualizacion) {
                      const ultima = new Date(row.fecha_ultima_actualizacion);
                      const hoy = new Date();
                      const diasPasados = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24));
                      diasVigencia = 180 - diasPasados;
                      isExpired = diasVigencia <= 0;
                      isWarning = diasVigencia > 0 && diasVigencia <= 30;
                    }

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
                            <td className="p-4">
                              <div className="flex justify-center">
                                {isExpired ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg text-[10px] font-medium bg-rose-100 text-rose-800">Vencido</span>
                                ) : isWarning ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg text-[10px] font-medium bg-amber-100 text-amber-800">Vence en {diasVigencia} d</span>
                                ) : (
                                  <span className="inline-flex px-3 py-1 rounded-lg text-[10px] font-medium bg-emerald-100 text-emerald-800">Vigente ({diasVigencia} d)</span>
                                )}
                              </div>
                            </td>
                            <td className="tour-step-table-actions p-4 text-blue-600 font-medium leading-relaxed max-w-[200px]">
                              <span 
                                onClick={() => navigate('/dashboard/admin/residentes/detalles', { state: { integrante: row } })}
                                className="cursor-pointer hover:underline"
                              >
                                Ver Detalles
                              </span>
                              {' | '}
                              <span 
                                onClick={() => navigate('/dashboard/admin/residentes/editar', { state: { integrante: row } })}
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
                            <td className="p-4 text-slate-500">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">{row.correo || 'sin-correo@condo.cl'}</span>
                                {row.tiene_cuenta ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                    Cuenta Activa
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                    Sin Cuenta
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                <span className={`inline-flex px-4 py-1.5 rounded-lg text-xs font-medium ${isUpdated ? 'bg-slate-100 text-slate-950 font-semibold' : 'bg-slate-100 text-slate-500'}`}>
                                  {isUpdated ? 'Completo' : 'Incompleto'}
                                </span>
                              </div>
                            </td>
                            <td className="tour-step-table-actions p-4 text-blue-600 font-medium leading-relaxed max-w-[300px] text-xs">
                              {!row.tiene_cuenta ? (
                                <span 
                                  onClick={() => navigate('/dashboard/admin/cuentas/enviar-invitacion', { state: { residente: row } })} 
                                  className="cursor-pointer hover:underline"
                                >
                                  Enviar Invitación
                                </span>
                              ) : (
                                <>
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
                                    onClick={() => handleDeleteCuenta(row.id, row.nombre)}
                                    className="cursor-pointer hover:underline text-red-500"
                                  >
                                    Eliminar Cuenta
                                  </span>
                                </>
                              )}
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

        {/* Modal de Reporte de Carga Masiva */}
        {reportData && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Reporte de Carga Masiva</h3>
                <button 
                  onClick={() => setReportData(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-emerald-600">{reportData.creados}</div>
                    <div className="text-xs text-emerald-700 font-medium uppercase tracking-wider mt-1">Creados</div>
                  </div>
                  <div className="flex-1 bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600">{reportData.invitaciones}</div>
                    <div className="text-xs text-blue-700 font-medium uppercase tracking-wider mt-1">Invitaciones</div>
                  </div>
                  <div className="flex-1 bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-rose-600">{reportData.errores.length}</div>
                    <div className="text-xs text-rose-700 font-medium uppercase tracking-wider mt-1">Errores</div>
                  </div>
                </div>

                {reportData.errores.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      Detalle de Errores ({reportData.errores.length})
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                      <ul className="space-y-2">
                        {reportData.errores.map((err, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-rose-500 font-bold mt-0.5">•</span>
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {reportData.errores.length === 0 && (
                  <div className="text-center text-slate-500 py-4">
                    ¡Todos los registros fueron procesados exitosamente sin errores!
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                {reportData.errores.length > 0 && (
                  <button 
                    onClick={() => {
                      const text = "REPORTE DE ERRORES - CARGA MASIVA\n" + "-".repeat(40) + "\n\n" + reportData.errores.join('\n');
                      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'errores_carga_masiva.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Descargar Errores (.txt)
                  </button>
                )}
                <button 
                  onClick={() => setReportData(null)}
                  className="px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
