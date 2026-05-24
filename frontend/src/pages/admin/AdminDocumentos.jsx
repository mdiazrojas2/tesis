import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Search, Upload, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AdminDocumentos() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for the inline "nueva versión" panel
  const [versionModal, setVersionModal] = useState(null); // { docId, titulo, currentVersion }
  const [newVersionNum, setNewVersionNum] = useState('');
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [newFechaEmision, setNewFechaEmision] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const fetchDocumentos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/catastro/documentos/');
      setDocumentos(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocumentos(); }, []);

  const handleDelete = async (id, titulo) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el documento "${titulo}"?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/catastro/documentos/${id}/`);
        setDocumentos(prev => prev.filter(d => d.id !== id));
        alert('Documento eliminado con éxito.');
      } catch (err) {
        console.error(err);
        alert('Error al eliminar el documento.');
      }
    }
  };

  const openVersionModal = (doc) => {
    const current = parseFloat(doc.version || '1.0');
    const suggested = (Math.round((current + 0.1) * 10) / 10).toFixed(1);
    setVersionModal({ docId: doc.id, titulo: doc.titulo, currentVersion: doc.version || '1.0' });
    setNewVersionNum(suggested);
    setNewVersionFile(null);
  };

  const closeVersionModal = () => {
    setVersionModal(null);
    setNewVersionNum('');
    setNewVersionFile(null);
    setNewFechaEmision('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitVersion = async () => {
    if (!newVersionFile) {
      alert('Por favor seleccione un archivo.');
      return;
    }
    if (!newVersionNum.trim()) {
      alert('Por favor ingrese el número de versión.');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('archivo', newVersionFile);
      data.append('version', newVersionNum.trim());
      if (newFechaEmision) {
        data.append('fecha_emision', newFechaEmision);
      }

      await axios.patch(
        `http://localhost:8000/api/catastro/documentos/${versionModal.docId}/`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      closeVersionModal();
      await fetchDocumentos();
      alert(`Versión ${newVersionNum} subida exitosamente.`);
    } catch (err) {
      console.error(err);
      alert('Error al subir la nueva versión. Intente nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documentos.filter(doc => {
    const title = doc.titulo.toLowerCase();
    const desc = (doc.descripcion || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || desc.includes(query);
  });

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Gestión Documental</h1>
          <button 
            onClick={() => navigate('/dashboard/admin/documentos/nuevo')}
            className="tour-step-add px-6 py-2.5 bg-[#1A7FF2] hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Subir Nuevo Documento
          </button>
        </div>

        {/* Search */}
        <div className="space-y-4 mb-8">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="tour-step-table border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="p-4 font-medium">Título</th>
                <th className="p-4 font-medium">Subida</th>
                <th className="p-4 font-medium">Emisión</th>
                <th className="p-4 font-medium">Vencimiento</th>
                <th className="p-4 font-medium">Versión</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-500">Cargando documentos...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-500">No se encontraron documentos.</td></tr>
              ) : (
                filteredDocs.map((doc) => {
                  const uploadDate = doc.fecha_subida
                    ? new Date(doc.fecha_subida).toLocaleDateString('es-CL')
                    : '—';
                  const emisionDateStr = doc.fecha_emision 
                    ? new Date(doc.fecha_emision + 'T00:00:00').toLocaleDateString('es-CL') 
                    : '—';
                  
                  let vencimientoDate = null;
                  if (doc.fecha_emision) {
                    const d = new Date(doc.fecha_emision + 'T00:00:00');
                    d.setFullYear(d.getFullYear() + 1);
                    vencimientoDate = d;
                  } else if (doc.fecha_subida) {
                    const d = new Date(doc.fecha_subida);
                    d.setFullYear(d.getFullYear() + 1);
                    vencimientoDate = d;
                  }
                  
                  const vencimientoStr = vencimientoDate ? vencimientoDate.toLocaleDateString('es-CL') : '—';
                  
                  let isExpired = false;
                  let isExpiringSoon = false;
                  if (vencimientoDate) {
                    const now = new Date();
                    const diffDays = (vencimientoDate - now) / (1000 * 60 * 60 * 24);
                    if (diffDays < 0) isExpired = true;
                    else if (diffDays <= 30) isExpiringSoon = true;
                  }

                  const isThisOpen = versionModal?.docId === doc.id;

                  return (
                    <React.Fragment key={doc.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-900 font-medium">{doc.titulo}</td>
                        <td className="p-4 text-slate-500">{uploadDate}</td>
                        <td className="p-4 text-slate-500">{emisionDateStr}</td>
                        <td className="p-4">
                          <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-500' : 'text-slate-500'}`}>
                            {vencimientoStr}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">v{doc.version || '1.0'}</td>
                        <td className="p-4 text-slate-500">{doc.tipo_documento || 'PDF'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 text-xs font-medium flex-wrap">
                            {doc.archivo && (
                              <>
                                <button
                                  onClick={() => window.open(`${doc.archivo}?v=${doc.version || '1.0'}`, '_blank')}
                                  className="text-blue-600 hover:underline"
                                >
                                  Ver Documento
                                </button>
                                <span className="text-slate-300">|</span>
                              </>
                            )}
                            <button
                              onClick={() => isThisOpen ? closeVersionModal() : openVersionModal(doc)}
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              Subir Nueva Versión
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleDelete(doc.id, doc.titulo)}
                              className="text-red-500 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline version upload panel */}
                      {isThisOpen && (
                        <tr className="bg-blue-50/50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="flex flex-col gap-3 max-w-xl">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-800">
                                  Nueva versión para: <span className="text-blue-600">{versionModal.titulo}</span>
                                  <span className="ml-2 text-xs text-slate-400 font-normal">(actual: v{versionModal.currentVersion})</span>
                                </p>
                                <button onClick={closeVersionModal} className="text-slate-400 hover:text-slate-700">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3 flex-wrap">
                                {/* Version number input */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-slate-500 font-medium">Número de versión</label>
                                  <input
                                    type="text"
                                    value={newVersionNum}
                                    onChange={(e) => setNewVersionNum(e.target.value)}
                                    placeholder="ej: 1.1"
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                                  />
                                </div>

                                {/* Fecha Emision */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-slate-500 font-medium">Fecha Emisión</label>
                                  <input
                                    type="date"
                                    value={newFechaEmision}
                                    onChange={(e) => setNewFechaEmision(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white"
                                  />
                                </div>

                                {/* File picker */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-slate-500 font-medium">Archivo</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      ref={fileInputRef}
                                      onChange={(e) => setNewVersionFile(e.target.files[0] || null)}
                                      className="hidden"
                                    />
                                    <button
                                      onClick={() => fileInputRef.current?.click()}
                                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
                                    >
                                      Seleccionar archivo
                                    </button>
                                    {newVersionFile && (
                                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {newVersionFile.name}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Submit */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-slate-500 font-medium opacity-0">Subir</label>
                                  <button
                                    onClick={handleSubmitVersion}
                                    disabled={uploading || !newVersionFile}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                      uploading || !newVersionFile
                                        ? 'bg-blue-200 text-white cursor-not-allowed'
                                        : 'bg-[#1A7FF2] hover:bg-blue-600 text-white shadow-sm'
                                    }`}
                                  >
                                    {uploading ? 'Subiendo...' : 'Confirmar Subida'}
                                  </button>
                                </div>
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

      </main>
    </div>
  );
}
