import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export default function DetallesIntegrante() {
  const navigate = useNavigate();
  const location = useLocation();

  const int = location.state?.integrante || {
    nombre: 'Lucía',
    apellidos: 'Mendoza',
    fecha_nacimiento: '1990-03-15',
    rut_dni: '1234567890',
    nacionalidad: 'Mexicana',
    relacion_jefe_hogar: 'Hija',
    condicion_medica: false,
    movilidad_reducida: false,
    detalles_salud_sensibles: 'Ninguna',
    telefono: '+52 55 1234 5678',
    correo: 'lucia.mendoza@example.com',
    idioma_principal: 'Español',
    contacto_emergencia_nombre: 'Ricardo Mendoza',
    contacto_emergencia_parentesco: 'Padre',
    contacto_emergencia_telefono: '+52 55 9876 5432',
    contacto_emergencia_correo: 'ricardo.mendoza@example.com'
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="residente" />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        
        {/* Breadcrumb / Nav */}
        <div className="text-sm text-slate-500 mb-6">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/dashboard/residente/hogar')}>Mi Hogar</span>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Ver Detalles</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-10">Detalles del Integrante del Hogar</h1>
        
        <div className="max-w-4xl space-y-10 pb-12">
          
          {/* Sección 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-sm text-slate-500 mb-1">Nombre Completo</p>
                <p className="font-medium text-slate-900">{int.nombre} {int.apellidos || ''}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Fecha de Nacimiento</p>
                <p className="font-medium text-slate-900">{int.fecha_nacimiento || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Número de Identificación (RUT/DNI)</p>
                <p className="font-medium text-slate-900">{int.rut_dni || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Nacionalidad</p>
                <p className="font-medium text-slate-900">{int.nacionalidad || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Relación con Jefe de Hogar</p>
                <p className="font-medium text-slate-900">{int.relacion_jefe_hogar || 'Familiar'}</p>
              </div>
            </div>
          </section>

          {/* Sección 2 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Información Médica y de Asistencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-sm text-slate-500 mb-1">Movilidad Reducida</p>
                <p className="font-medium text-slate-900">{int.movilidad_reducida ? 'Sí' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Condiciones Médicas Relevantes</p>
                <p className="font-medium text-slate-900">{int.condicion_medica ? 'Sí' : 'No'}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-slate-500 mb-1">Observaciones Adicionales / Ficha de Salud</p>
                <p className="font-medium text-slate-900 whitespace-pre-wrap">{int.detalles_salud_sensibles || 'Ninguna'}</p>
              </div>
            </div>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Contacto y Comunicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-sm text-slate-500 mb-1">Número de Teléfono</p>
                <p className="font-medium text-slate-900">{int.telefono || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Correo Electrónico</p>
                <p className="font-medium text-slate-900">{int.correo || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Idioma de Preferencia</p>
                <p className="font-medium text-slate-900">{int.idioma_principal || 'No especificado'}</p>
              </div>
            </div>
          </section>

          {/* Sección 4 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Contacto de Emergencia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-sm text-slate-500 mb-1">Nombre del Contacto</p>
                <p className="font-medium text-slate-900">{int.contacto_emergencia_nombre || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Relación / Parentesco</p>
                <p className="font-medium text-slate-900">{int.contacto_emergencia_parentesco || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Número de Teléfono de Emergencia</p>
                <p className="font-medium text-slate-900">{int.contacto_emergencia_telefono || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Dirección de Correo Electrónico de Emergencia</p>
                <p className="font-medium text-slate-900">{int.contacto_emergencia_correo || 'No especificado'}</p>
              </div>
            </div>
          </section>

          <div className="pt-8">
            <button 
              onClick={() => navigate('/dashboard/residente/hogar')}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
            >
              Volver a Mi Hogar
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
