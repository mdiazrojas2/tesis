import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { FileText } from 'lucide-react';
import axios from 'axios';

export default function DashboardResidente() {
  const [residentesCount, setResidentesCount] = useState(150);
  const [notificaciones, setNotificaciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    // Fetch total residents count
    axios.get('http://localhost:8000/api/catastro/residentes/')
      .then(res => setResidentesCount(res.data.length || 150))
      .catch(err => console.error(err));

    // Fetch notifications
    axios.get('http://localhost:8000/api/catastro/notificaciones/')
      .then(res => setNotificaciones(res.data))
      .catch(err => console.error(err));

    // Fetch documents
    axios.get('http://localhost:8000/api/catastro/documentos/')
      .then(res => setDocumentos(res.data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  // Fallback notifications if none in DB
  const displayNotifications = notificaciones.length > 0 ? notificaciones : [
    {
      id: 1,
      titulo: 'Plan de emergencia actualizado',
      mensaje: 'El plan de emergencia de su condominio ha sido actualizado. Revise los cambios para estar preparado.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      titulo: 'Actualización de datos requerida',
      mensaje: 'Su unidad requiere actualizar los datos de sus residentes. Por favor, complete la actualización lo antes posible.',
      image: 'https://images.unsplash.com/photo-1506784951209-450f75e921d7?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role="residente" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Bienvenido Residentes</h1>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Resumen de mi unidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">Cantidad de habitantes actual del condominio</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">{residentesCount}</span>
                <span className="text-sm font-medium text-emerald-600">Al día</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">Incidentes ocurridos en el último período</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">0</span>
                <span className="text-sm font-medium text-emerald-600">Estable</span>
              </div>
            </div>

          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Notificaciones y Avisos</h2>
          <div className="space-y-6">
            {displayNotifications.map((note) => (
              <div key={note.id} className="flex flex-col md:flex-row gap-6 items-start bg-white p-4 border border-slate-100 rounded-xl shadow-sm">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{note.titulo}</h3>
                  <p className="text-sm text-slate-600">{note.mensaje}</p>
                  {note.fecha && <p className="text-[10px] text-slate-400 mt-2">{new Date(note.fecha).toLocaleString()}</p>}
                </div>
                <div className="w-full md:w-64 h-32 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                  <img src={note.image || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80"} alt="Notification preview" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Documentos Importantes</h2>
          {documentos.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Reglamento interno</h3>
                  <p className="text-sm text-slate-500">Reglamento interno del condominio</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Manual de convivencia</h3>
                  <p className="text-sm text-slate-500">Manual de convivencia</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {documentos.map((doc) => (
                <div key={doc.id} onClick={() => doc.archivo && window.open(`${doc.archivo}?v=${doc.version || '1.0'}`, '_blank')} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{doc.titulo}</h3>
                    <p className="text-sm text-slate-500">{doc.descripcion || `Versión: ${doc.version || '1.0'}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
