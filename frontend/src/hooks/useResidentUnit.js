import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

/**
 * Hook que obtiene la información de la unidad del residente logueado.
 * Usa la instancia `api` (con token) para las peticiones.
 * El backend ya filtra residentes por email del usuario autenticado,
 * así que la respuesta solo contiene al residente actual.
 */
export default function useResidentUnit() {
  const [unitId, setUnitId] = useState(null);
  const [unitInfo, setUnitInfo] = useState(null);
  const [residenteData, setResidenteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('catastro/residentes/')
      .then(res => {
        const residents = res.data;
        if (residents.length > 0) {
          const myResident = residents[0]; // Backend already filters by user email
          setResidenteData(myResident);
          const uid = myResident.unidad;
          setUnitId(uid);
          // Fetch unit details
          return api.get(`catastro/unidades/${uid}/`)
            .then(uRes => {
              setUnitInfo(uRes.data);
              setLoading(false);
            });
        } else {
          setLoading(false);
          setError(new Error('Residente no encontrado'));
        }
      })
      .catch(err => {
        console.error('Error en useResidentUnit:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { unitId, unitInfo, residenteData, loading, error };
}
