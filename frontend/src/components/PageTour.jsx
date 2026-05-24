import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';

const TOUR_STEPS = {
  '/dashboard/admin': [
    {
      target: 'body',
      content: '¡Bienvenido al Panel de Administración! Este es un breve recorrido para que conozcas las herramientas a tu disposición.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-step-stats',
      content: 'Aquí puedes ver un resumen rápido del estado de tu condominio: cantidad de unidades, residentes registrados y documentos.',
    },
    {
      target: '.tour-step-chart',
      content: 'Este gráfico interactivo te muestra la ocupación real por cada departamento. Puedes hacer clic en las barras para ir directo al detalle.',
    },
  ],
  '/dashboard/admin/residentes': [
    {
      target: 'body',
      content: 'Bienvenido a la Gestión de Residentes. Aquí puedes administrar a todas las personas y sus cuentas.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-step-tabs',
      content: 'Navega entre las vistas de Residentes, Cuentas de Usuario (para credenciales) y el Estado por Unidades.',
    },
    {
      target: '.tour-step-filters',
      content: 'Usa esta barra para buscar personas por nombre o RUT, o aplica filtros rápidos como "Adultos Mayores" o "Movilidad Reducida".',
    },
    {
      target: '.tour-step-exports',
      content: 'Con estos botones puedes generar reportes en PDF y Excel respetando los filtros que hayas aplicado.',
    },
    {
      target: '.tour-step-massive',
      content: 'Descarga la plantilla Excel oficial, llénala, y súbela aquí para cargar a docenas de residentes en un solo clic.',
    }
  ]
};

export default function PageTour({ runTour, setRunTour }) {
  const location = useLocation();
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    // Si la ruta exacta existe en nuestro objeto de steps, la cargamos
    const currentSteps = TOUR_STEPS[location.pathname];
    if (currentSteps) {
      setSteps(currentSteps);
    } else {
      setSteps([]);
    }
  }, [location.pathname]);

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
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#1A7FF2',
          zIndex: 10000,
        },
        buttonClose: {
          display: 'none',
        }
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
