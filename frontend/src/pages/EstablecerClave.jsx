import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EstablecerClave() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/establecer-clave/', {
        uid,
        token,
        password,
      });
      alert('Contraseña establecida con éxito. Ya puede iniciar sesión.');
      navigate('/login/residente');
    } catch (err) {
      console.error(err);
      setError('Error al establecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Establecer Contraseña</h1>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-800">Nueva Contraseña</label>
          <input
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-800">Confirmar Contraseña</label>
          <input
            type="password"
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A7FF2] hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Estableciendo...' : 'Establecer Contraseña'}
        </button>
      </form>
    </div>
  );
}
