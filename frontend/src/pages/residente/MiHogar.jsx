import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { Eye } from 'lucide-react';
import api from '../../api/axiosConfig';
import useResidentUnit from '../../hooks/useResidentUnit';

export default function MiHogar() {
  const navigate = useNavigate();
  const [integrantes, setIntegrantes] = useState([]);
  const { unitId, unitInfo, loading: unitLoading } = useResidentUnit();

  useEffect(() => {
    if (unitLoading) return;
    // Backend filters residents by authenticated user's email
    api.get('catastro/residentes/')
      .then(res => setIntegrantes(res.data))
      .catch(err => console.error('Error fetching integrantes:', err));
  }, [unitLoading]);

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="residente" unitInfo={unitInfo} />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Mi Hogar</h1>
        
        <p className="text-slate-600 mb-8 max-w-3xl">
          La información proporcionada se utilizará de forma confidencial y exclusiva para la elaboración de planes de
          emergencia y evacuación. Su colaboración es fundamental para garantizar la seguridad de todos los residentes.
        </p>

        {/* Progreso */}
        <div className="mb-12">
          <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
            <span>Progreso</span>
            <span>25%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="h-full bg-slate-900 w-[25%] rounded-full"></div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-6">Integrantes del Hogar</h2>

        {integrantes.length === 0 ? (
          <p className="text-slate-500 mb-6">No hay integrantes registrados.</p>
        ) : (
          integrantes.map((int) => (
            <div key={int.id} className="border border-slate-200 rounded-xl p-6 mb-6 flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{int.nombre} {int.apellidos}</h3>
                <p className="text-sm text-slate-500 mb-4">{int.relacion_jefe_hogar || 'Familiar'}</p>
                <button 
                  onClick={() => navigate('/dashboard/residente/hogar/detalles', { state: { integrante: int } })}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Ver Detalles <Eye className="w-4 h-4" />
                </button>
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => navigate('/dashboard/residente/hogar/editar', { state: { integrante: int } })}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    Editar Datos
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm(`¿Está seguro de que desea eliminar a ${int.nombre}?`)) {
                        try {
                          await api.delete(`catastro/residentes/${int.id}/`);
                          setIntegrantes(prev => prev.filter(item => item.id !== int.id));
                          alert('Integrante eliminado con éxito.');
                        } catch (err) {
                          console.error(err);
                          alert('Error al eliminar integrante.');
                        }
                      }
                    }}
                    className="px-4 py-2 text-slate-600 hover:text-red-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="w-full md:w-64 h-40 bg-[#F4D6C3] rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                <span>Sin Foto</span>
              </div>
            </div>
          ))
        )}

        <button 
          onClick={() => navigate('/dashboard/residente/hogar/nuevo')}
          className="bg-[#1A7FF2] hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          Agregar integrante
        </button>

      </main>
    </div>
  );
}
