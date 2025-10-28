import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuthCtx } from '../context/AuthContext';
import { useRouter } from 'next/router';
import HeroSection from '../components/HeroSection';
import WaitlistForm from '../components/WaitlistForm';
import { createAnalyticsTracker } from '../lib/analytics';

export default function Ahau() {
  const { user, session } = useAuthCtx();
  const router = useRouter();
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user && session?.tenantId) {
      router.push('/dashboard');
    }
  }, [user, session, router]);

  useEffect(() => {
    const tracker = createAnalyticsTracker('ahau');
    tracker.trackPageVisit('ahau-landing');

    const handleBeforeUnload = () => {
      tracker.trackPageExit();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleCTAClick = () => {
    const tracker = createAnalyticsTracker('ahau');
    tracker.trackPageVisit('cta-click');

    setShowWaitlist(true);
    document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWaitlistSubmit = (success: boolean, message: string) => {
    if (success) {
      const tracker = createAnalyticsTracker('ahau');
      tracker.trackPageVisit('waitlist-success');

      setSuccessMessage(message);
      setShowSuccessModal(true);
    } else {
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <Head>
        <title>Ahau - El liderazgo, sincronizado</title>
        <meta name="description" content="Sincroniza las voces de tus líderes para amplificar tu marca en LinkedIn" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Ahau - El liderazgo, sincronizado" />
        <meta property="og:description" content="Sincroniza las voces de tus líderes para amplificar tu marca en LinkedIn" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uaylabs.web.app/ahau" />
      </Head>

      {/* Hero Section */}
      <HeroSection onCTAClick={handleCTAClick} content={{
        badge: 'Acceso temprano disponible',
        title: 'El liderazgo, sincronizado para amplificar tu marca',
        subtitle: 'Activa y coordina las voces de tus líderes en LinkedIn con IA',
        description: 'Ahau ayuda a tu equipo ejecutivo a publicar contenido consistente y de alto impacto, alineado con tu estrategia de marca.',
        ctaPrimary: 'Únete a la lista de espera',
        socialProof: [
          'Confianza de equipos en LATAM',
          'Contenido 3x más consistente',
          'Alineación de marca basada en IA'
        ]
      }} />

      {/* Problem Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">El problema que resolvemos</h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Falta de alineación, tiempo e ideas frena la participación en LinkedIn. Las marcas pierden alcance orgánico porque cada líder publica de forma aislada y sin consistencia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-white font-semibold mb-2">Desalineación de voces</h3>
              <p className="text-gray-300">Los mensajes no están coordinados; se diluye el posicionamiento.</p>
            </div>
            <div className="card">
              <h3 className="text-white font-semibold mb-2">Falta de tiempo</h3>
              <p className="text-gray-300">Líderes con agenda llena no logran publicar con frecuencia.</p>
            </div>
            <div className="card">
              <h3 className="text-white font-semibold mb-2">Baja participación</h3>
              <p className="text-gray-300">Sin incentivos ni métricas compartidas, la constancia cae.</p>
            </div>
            <div className="card">
              <h3 className="text-white font-semibold mb-2">ROI poco visible</h3>
              <p className="text-gray-300">Sin seguimiento, es difícil demostrar impacto en marca y ventas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-r from-ahau-blue/10 to-ahau-dark/10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Cómo Ahau lo resuelve</h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              De la estrategia a la publicación, sin fricción. Coordina y amplifica la voz de líderes con IA.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-white font-semibold mb-2">Personalización por tono</h3>
              <p className="text-gray-300">Analizamos publicaciones pasadas para adaptar estilo y voz de cada líder.</p>
            </div>
            <div className="card">
              <h3 className="text-white font-semibold mb-2">Gamificación y métricas</h3>
              <p className="text-gray-300">Rankings y KPIs visibles para incentivar la participación.</p>
            </div>
            <div className="card">
              <h3 className="text-white font-semibold mb-2">Velocidad de entrega</h3>
              <p className="text-gray-300">Contenido listo en minutos, no días.</p>
            </div>
            <div className="card">
              <h3 className="text-white font-semibold mb-2">Escalable</h3>
              <p className="text-gray-300">Pensado para publicar automáticamente vía API en fases posteriores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Beneficios</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-white mb-3">Más visibilidad de marca</h3>
              <p className="text-gray-300">Amplifica el alcance orgánico coordinando las voces clave.</p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-white mb-3">Alineación interna</h3>
              <p className="text-gray-300">Todos comunican un mismo mensaje estratégico con su propia voz.</p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-white mb-3">Ahorro de tiempo</h3>
              <p className="text-gray-300">Menos fricción para pasar de la idea a la publicación.</p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-white mb-3">ROI medible</h3>
              <p className="text-gray-300">Métricas claras para demostrar impacto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <div id="waitlist-section">
        <WaitlistForm onSubmit={handleWaitlistSubmit} />
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Ahau. Built by UayLabs.
          </p>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¡Bienvenido a Ahau!
              </h3>
              <p className="text-gray-600 mb-6">
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-ahau-gold to-ahau-coral hover:from-yellow-500 hover:to-red-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
