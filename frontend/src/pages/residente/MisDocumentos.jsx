import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { FileText } from 'lucide-react';
import axios from 'axios';

export default function MisDocumentos() {
  const [documentos, setDocumentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/catastro/documentos/')
      .then(res => {
        setDocumentos(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error cargando documentos:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="residente" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mis Documentos</h1>
        
        <h2 className="text-lg font-bold text-slate-900 mb-6">Documentos del Condominio</h2>

        {isLoading ? (
          <p className="text-slate-500 text-sm">Cargando documentos...</p>
        ) : documentos.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay documentos cargados en el condominio.</p>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {documentos.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-medium text-slate-900">{doc.titulo}</h3>
                    <p className="text-sm text-slate-500">{doc.descripcion || `Tipo: ${doc.tipo_documento} | Versión: ${doc.version || '1.0'}`}</p>
                  </div>
                </div>
                {doc.archivo && (
                  <button 
                    onClick={() => window.open(`${doc.archivo}?v=${doc.version || '1.0'}`, '_blank')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Descargar / Ver
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
