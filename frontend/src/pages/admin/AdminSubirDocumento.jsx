import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { FileUp, File, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AdminSubirDocumento() {
  const navigate = useNavigate();
  const [condominios, setCondominios] = useState([]);
  const [formData, setFormData] = useState({
    condominio: '',
    titulo: '',
    descripcion: '',
    tipo_documento: '',
    version: '',
    fecha_emision: ''
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Fetch condominios
    axios.get('http://localhost:8000/api/catastro/condominios/')
      .then(res => setCondominios(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const simulateProgress = () => {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!file || !formData.condominio || !formData.titulo || !formData.tipo_documento) {
      alert("Por favor complete todos los campos obligatorios y seleccione un archivo.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append('archivo', file);
    data.append('condominio', formData.condominio);
    data.append('titulo', formData.titulo);
    data.append('descripcion', formData.descripcion);
    data.append('tipo_documento', formData.tipo_documento);
    data.append('version', formData.version);
    if (formData.fecha_emision) {
      data.append('fecha_emision', formData.fecha_emision);
    }

    try {
      // Simulate progress for UX
      await simulateProgress();

      await axios.post('http://localhost:8000/api/catastro/documentos/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setTimeout(() => {
        setIsUploading(false);
        navigate('/dashboard/admin/documentos');
      }, 500);
    } catch (error) {
      console.error(error);
      alert("Error al subir el documento.");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Subir Nuevo Documento</h1>
        
        <div className="max-w-2xl space-y-6 pb-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Condominio *</label>
              <select name="condominio" value={formData.condominio} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50">
                <option value="">Seleccione Condominio</option>
                {condominios.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Título del Documento *</label>
              <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej: Plan de Evacuación Anual" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Documento *</label>
              <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 text-slate-500">
                <option value="">Seleccionar tipo</option>
                <option value="Planes de Emergencia">Planes de Emergencia</option>
                <option value="Formatos y Plantillas">Formatos y Plantillas</option>
                <option value="Normativas">Normativas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Versión (Opcional)</label>
              <input type="text" name="version" value={formData.version} onChange={handleChange} placeholder="Ej: v1.2" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" />
            </div>
            {formData.tipo_documento === "Planes de Emergencia" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Emisión (Opcional)</label>
                <input type="date" name="fecha_emision" value={formData.fecha_emision} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción (Opcional)</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" placeholder="Breve descripción del contenido del documento..." className="w-full border border-slate-200 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-slate-50 resize-none"></textarea>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center mt-8"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h3 className="font-bold text-slate-900 mb-1">Arrastra y suelta el archivo aquí o</h3>
            <p className="text-xs text-slate-500 mb-4">Tipos de archivo permitidos: PDF, DOCX. Tamaño máximo: 20MB</p>
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <label htmlFor="file-upload" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block">
              Examinar Archivos
            </label>
            {file && <p className="mt-2 text-sm text-blue-600 font-medium">Archivo seleccionado: {file.name}</p>}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">{file?.name}</span>
                </div>
                {uploadProgress === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <button onClick={() => setIsUploading(false)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
                )}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-200 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-500">{file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB</span>
                <span className="text-xs font-medium text-slate-700">{uploadProgress}%</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 mt-12">
            <button 
              type="button"
              onClick={() => navigate('/dashboard/admin/documentos')}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !file}
              className={`px-6 py-2.5 font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2 ${
                isUploading || !file ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-[#1A7FF2] hover:bg-blue-600 text-white'
              }`}
            >
              <FileUp className="w-4 h-4" />
              {isUploading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
