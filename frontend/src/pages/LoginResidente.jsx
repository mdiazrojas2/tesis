import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, ArrowLeft } from 'lucide-react';

export default function LoginResidente() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: email, // Usamos el correo como username
        password
      });
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('userRole', 'residente');
      navigate('/dashboard/residente');
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header */}
      <header className="w-full p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-800" />
          <span className="font-semibold text-slate-900">Condominio Volcanes</span>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-950 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl flex flex-col items-center">
          
          {/* Logo Box Placeholder */}
          <div className="w-full h-64 md:h-80 bg-[#12282A] rounded-xl flex items-center justify-center mb-8 shadow-sm">
            <div className="flex flex-col items-center text-[#F2E5D5]">
              {/* Mock Logo Icon */}
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18"></path>
                <path d="M9 21V9a3 3 0 0 1 3-3a3 3 0 0 1 3 3v12"></path>
                <path d="M5 21V11a3 3 0 0 1 3-3V7a3 3 0 0 1 3-3a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3v10"></path>
              </svg>
              <h2 className="text-2xl tracking-[0.2em] mt-4 font-light">CONDOMINIO</h2>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso de Residente</h1>
          <p className="text-slate-500 mb-8 text-sm">Ingrese su correo electrónico y contraseña para acceder al sistema.</p>

          <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Nombre de usuario o correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mt-2">
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A7FF2] hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
            
            <div className="text-center mt-4">
              <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                ¿Olvidaste tu contraseña? <span className="text-slate-400">Recuperar Contraseña</span>
              </a>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
