import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, ArrowLeft, Mail } from 'lucide-react';

export default function RecuperarClave() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/catastro/recuperar-clave/', { email });
      setEnviado(true);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la solicitud. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-800" />
          <span className="font-semibold text-slate-900">Condominio Volcanes</span>
        </div>
        <button 
          onClick={() => navigate('/login/residente')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-950 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Login
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Icono */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#1A7FF2]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Recuperar Contraseña</h1>
          
          {!enviado ? (
            <>
              <p className="text-slate-500 mb-8 text-sm text-center">
                Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="email" 
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A7FF2] hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm mb-6">
                Si el correo está registrado, recibirá un enlace para restablecer su contraseña. Revise su bandeja de entrada y carpeta de spam.
              </div>
              <button 
                onClick={() => navigate('/login/residente')}
                className="text-sm text-[#1A7FF2] hover:text-blue-700 font-medium transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/login/residente')}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
