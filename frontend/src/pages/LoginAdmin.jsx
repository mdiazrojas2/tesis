import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Usamos el endpoint de SimpleJWT
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password
      });
      
      const { access, refresh } = response.data;
      
      // Decodificar token manualmente para obtener el rol (sin librerías extras aquí)
      const payload = JSON.parse(atob(access.split('.')[1]));
      const realRole = payload.rol?.toLowerCase();
      
      if (realRole !== 'admin') {
        setError('No tienes permisos de administrador.');
        setLoading(false);
        return;
      }

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userRole', realRole);
      
      navigate('/dashboard/admin');
    } catch (err) {
      setError('Credenciales incorrectas o acceso denegado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header */}
      <header className="w-full p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="font-semibold text-slate-900">Portal Administrativo</span>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-950 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl flex flex-col items-center">
        
        {/* Banner Logo */}
        <div className="w-full h-48 bg-[#2C5E50] mb-8 overflow-hidden flex items-center justify-center">
           <svg width="200" height="200" viewBox="0 0 24 24" fill="white" className="mt-24">
              <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 3.8L18.2 12H16v6h-3v-4h-2v4H8v-6H5.8L12 5.8z"/>
           </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-8">Acceso de Administrador</h1>

        <form onSubmit={handleLogin} className="w-full max-w-lg space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-800">
              Correo Electrónico o Nombre de Usuario
            </label>
            <input 
              type="text" 
              placeholder="Ingresa tu correo electrónico o nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-800">
              Contraseña
            </label>
            <input 
              type="password" 
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>
          
          <div className="pt-2">
            <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A7FF2] hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
      </main>
    </div>
  );
}
