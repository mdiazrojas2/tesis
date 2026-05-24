import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';

const TOUR_STEPS = {
  '/dashboard/admin': [
    { target: 'body', content: '¡Bienvenido al Panel de Administración! Este es un breve recorrido para que conozcas las herramientas a tu disposición.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-sidebar', content: 'Usa este menú lateral para navegar entre las diferentes secciones del sistema.' },
    { target: '.tour-step-stats-filters', content: 'Filtra las estadísticas rápidas por periodo de tiempo (Semanal, Mensual, Anual).' },
    { target: '.tour-step-stats', content: 'Aquí puedes ver un resumen rápido del estado de tu condominio: cantidad de unidades, residentes registrados y documentos.' },
    { target: '.tour-step-chart', content: 'Este gráfico interactivo te muestra la ocupación real por cada departamento. Puedes hacer clic en las barras para ir directo al detalle.' },
  ],
  '/dashboard/admin/residentes': [
    { target: 'body', content: 'Bienvenido a la Gestión de Residentes. Aquí administras a las personas y sus cuentas.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-tabs', content: 'Navega entre las vistas de Residentes, Cuentas de Usuario y el Estado por Unidades.' },
    { target: '.tour-step-subtabs', content: 'En Cuentas de Usuario, puedes filtrar rápidamente por Cuentas Activas o ver los Residentes Pendientes (Sin Cuenta) para invitar.' },
    { target: '.tour-step-filters', content: 'Busca por nombre o RUT, y aplica filtros rápidos como "Adultos Mayores" o "Movilidad Reducida".' },
    { target: '.tour-step-add', content: 'Utiliza este botón para registrar a un nuevo residente o cuenta de usuario de forma manual.' },
    { target: '.tour-step-vigencia', content: 'La columna Vigencia de Datos te avisa mediante colores (Verde, Amarillo, Rojo) si el residente tiene sus datos médicos actualizados o vencidos.' },
    { target: '.tour-step-table-actions', content: 'En cada fila encontrarás opciones para Ver Detalles, Editar la ficha, Eliminar el registro, o Enviar Invitación al residente.' },
    { target: '.tour-step-exports', content: 'Genera reportes en PDF y Excel respetando los filtros que tengas aplicados.' },
    { target: '.tour-step-massive', content: 'Descarga la plantilla Excel oficial, llénala, y súbela aquí para cargas masivas evitando unidades repetidas.' }
  ],
  '/dashboard/admin/notificaciones': [
    { target: 'body', content: 'Aquí gestionas las notificaciones y correos que se envían a los residentes.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-add', content: 'Haz clic aquí para redactar un nuevo mensaje y enviarlo a todo el condominio o a personas específicas.' },
    { target: '.tour-step-filters', content: 'Filtra el historial de notificaciones por fecha de envío, tipo (Correo, Aviso), o por unidad.' },
    { target: '.tour-step-table', content: 'Esta tabla muestra el registro de todos los comunicados emitidos previamente. Las notificaciones del sistema (como un residente eliminado) se generarán automáticamente.' }
  ],
  '/dashboard/admin/documentos': [
    { target: 'body', content: 'Biblioteca de documentos del condominio (Reglamentos, Actas, Planes de Emergencia).', placement: 'center', disableBeacon: true },
    { target: '.tour-step-add', content: 'Presiona aquí para subir un nuevo PDF o archivo que los residentes podrán visualizar.' },
    { target: '.tour-step-table', content: 'Aquí puedes administrar los documentos. El sistema notificará automáticamente a los residentes si subes o actualizas un Plan de Emergencia.' }
  ],
  '/dashboard/admin/configuracion': [
    { target: 'body', content: 'Configuración base de tu Condominio.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-form', content: 'Actualiza el nombre, dirección y correo de contacto de la administración. Los residentes usarán este correo para contactarte.' },
    { target: '.tour-step-unidades', content: 'Gestiona la estructura de tu condominio: puedes agregar, editar o eliminar unidades. Si borras una unidad, se limpiarán todos los residentes en ella.' },
    { target: '.tour-step-save', content: '¡No olvides guardar los cambios antes de salir!' }
  ],
  '/dashboard/residente': [
    { target: 'body', content: '¡Bienvenido a tu panel de Residente! Aquí tienes un resumen de tu actividad en el condominio.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-sidebar', content: 'Desde este menú puedes acceder a tus documentos, a tu grupo familiar y pedir soporte.' },
    { target: '.tour-step-vigencia-datos', content: 'Este panel te avisa si tus datos de salud y emergencia están vigentes. Por ley, debes confirmarlos cada 6 meses (180 días).' },
    { target: '.tour-step-integrantes', content: 'Aquí puedes ver rápidamente cuántos integrantes componen tu grupo familiar.' },
    { target: '.tour-step-notifications-filter', content: 'Puedes filtrar las notificaciones de tu unidad por fechas Desde y Hasta.' },
    { target: '.tour-step-notifications', content: 'Mantente al día con los últimos avisos enviados por la Administración o por el sistema.' },
    { target: '.tour-step-quick-actions', content: 'Accesos rápidos para descargar los documentos más importantes.' }
  ],
  '/dashboard/residente/hogar': [
    { target: 'body', content: 'Gestión de tu Grupo Familiar.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-cards', content: 'Aquí verás las tarjetas con la información técnica y médica de quienes viven contigo.' },
    { target: '.tour-step-add', content: 'Añade a un nuevo integrante, ya sea tu cónyuge, hijos o algún familiar sin necesidad de crearle una cuenta si no es necesario.' }
  ],
  '/dashboard/residente/documentos': [
    { target: 'body', content: 'Repositorio de Documentos.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-filters', content: 'Busca el documento que necesitas ingresando palabras clave.' },
    { target: '.tour-step-table', content: 'Visualiza o descarga actas, reglamentos de copropiedad y planes de emergencia actualizados.' }
  ],
  '/dashboard/residente/soporte': [
    { target: 'body', content: 'Centro de Ayuda y Soporte.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-form', content: 'Aquí puedes revisar respuestas a Preguntas Frecuentes, ver el correo directo de la administración o enviarles un mensaje desde el formulario.' }
  ]
};

export default function PageTour({ runTour, setRunTour }) {
  const location = useLocation();
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const currentSteps = TOUR_STEPS[location.pathname] || TOUR_STEPS[location.pathname.replace(/\/$/, '')];
    if (currentSteps) {
      // We filter out any steps that target elements not currently visible in the DOM.
      // This prevents Joyride from crashing when tabs hide certain elements.
      const validSteps = currentSteps.filter(step => {
        if (step.target === 'body' || step.target === 'h1') return true;
        const el = document.querySelector(step.target);
        // offsetParent is null if display: none or not in DOM
        return el !== null;
      });
      setSteps(validSteps);
    } else {
      setSteps([]);
    }
  }, [location.pathname, runTour]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      floaterProps={{ disableAnimation: true, hideArrow: true }}
      callback={handleJoyrideCallback}
      styles={{
        options: { primaryColor: '#1A7FF2', zIndex: 10000 },
        buttonClose: { display: 'none' }
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar Tour',
      }}
    />
  );
}
