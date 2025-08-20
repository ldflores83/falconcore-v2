import React from 'react';
import Head from 'next/head';

export default function UayLabsLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Head>
        <title>UayLabs - Venture Builder</title>
        <meta name="description" content="UayLabs es un venture builder que desarrolla productos innovadores para validar tracción y escalar negocios." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">
              UayLabs
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">Nosotros</a>
              <a href="#approach" className="text-gray-300 hover:text-white transition-colors">Enfoque</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Venture Builder
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Desarrollamos productos innovadores que validan tracción y escalan negocios
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Conoce Nuestros Productos
            </button>
            <button className="border border-white text-white hover:bg-white hover:text-purple-900 px-8 py-3 rounded-lg font-semibold transition-colors">
              Contáctanos
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              ¿Qué es UayLabs?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🚀 Innovación</h3>
                <p className="text-gray-300">
                  Identificamos oportunidades de mercado y desarrollamos soluciones tecnológicas 
                  que resuelven problemas reales.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">📈 Validación</h3>
                <p className="text-gray-300">
                  Construimos MVPs rápidamente para validar hipótesis de mercado 
                  y medir la tracción real de nuestros productos.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">⚡ Velocidad</h3>
                <p className="text-gray-300">
                  Utilizamos metodologías ágiles y tecnologías modernas para 
                  lanzar productos al mercado en tiempo récord.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🎯 Escalabilidad</h3>
                <p className="text-gray-300">
                  Diseñamos productos con arquitectura modular que permiten 
                  escalar de manera eficiente y sostenible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section id="approach" className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
              Nuestro Enfoque
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Identificación</h3>
                <p className="text-gray-300">
                  Analizamos tendencias y oportunidades de mercado
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Desarrollo</h3>
                <p className="text-gray-300">
                  Construimos MVPs con tecnologías modernas
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Escalado</h3>
                <p className="text-gray-300">
                  Validamos tracción y escalamos productos exitosos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            ¿Listo para innovar?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a nosotros en la construcción del futuro digital
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Contáctanos
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            © 2025 UayLabs. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
} 