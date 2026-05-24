import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import useResidentUnit from '../../hooks/useResidentUnit';
import axios from 'axios';

export default function Soporte() {
  const [openFaq, setOpenFaq] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@condominio.cl');
  const [isSending, setIsSending] = useState(false);
  const { unitInfo } = useResidentUnit();

  useEffect(() => {
    axios.get('http://localhost:8000/api/catastro/condominios/')
      .then(res => {
        if (res.data.length > 0 && res.data[0].email_administracion) {
          setAdminEmail(res.data[0].email_administracion);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const faqs = [
    {
      question: '¿Cómo reporto un problema en mi unidad?',
      answer: 'Para reportar un problema en tu unidad, por favor completa el formulario de reporte de problemas disponible en la sección \'Contactar a Administración\' o envía un correo electrónico a la dirección proporcionada. Asegúrate de incluir una descripción detallada del problema, incluyendo la ubicación específica y cualquier información adicional relevante.'
    },
    {
      question: '¿Cómo puedo contactar a la administración?',
      answer: `Puedes contactar a la administración usando el formulario en esta misma página o al correo ${adminEmail}.`
    },
    {
      question: '¿Dónde encuentro el reglamento del condominio?',
      answer: 'El reglamento se encuentra en la sección "Mis Documentos" de este portal.'
    }
  ];

  const handleSend = async () => {
    if (!mensaje.trim()) {
      alert("Por favor, escriba un mensaje antes de enviar.");
      return;
    }
    setIsSending(true);
    try {
      await axios.post('http://localhost:8000/api/catastro/residentes/enviar-soporte/', { mensaje });
      alert("Mensaje enviado con éxito a la administración. Recibirá una respuesta a la brevedad.");
      setMensaje('');
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al enviar el mensaje. Inténtelo más tarde.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      <Sidebar role="residente" unitInfo={unitInfo} />
      
      <main className="flex-1 p-8 md:p-12 lg:px-16 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Soporte</h1>
        
        {/* Preguntas Frecuentes */}
        <section className="mb-12 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="font-medium text-slate-900 text-sm">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contactar a Administración */}
        <section className="tour-step-form mb-12 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Contactar a Administración</h2>
          <textarea 
            rows="6"
            placeholder="Escribe tu mensaje aquí"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4 resize-none"
          ></textarea>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-xs text-slate-500">O envía un correo electrónico a: {adminEmail}</p>
            <button 
              onClick={handleSend}
              disabled={isSending}
              className={`text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm w-full md:w-auto ${isSending ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1A7FF2] hover:bg-blue-600'}`}
            >
              {isSending ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </div>
        </section>


      </main>
    </div>
  );
}
