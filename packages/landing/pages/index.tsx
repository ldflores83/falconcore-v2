
import Head from 'next/head';
import { createAnalyticsTracker } from '../lib/analytics';

import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Send, Rocket, Github, Globe } from "lucide-react";

// Landing con i18n simple (ES/EN) + animaciones sutiles.
// Tailwind + Framer Motion + un selector de idioma (auto detecta por navigator.language).

export default function UayLabsLanding() {
  // Parallax blob en hero
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  // Idioma: detectar y permitir toggle
  const defaultLang = useMemo(() => (typeof navigator !== "undefined" && navigator.language?.startsWith("es")) ? "es" : "en", []);
  const [lang, setLang] = useState<"es" | "en">(defaultLang);

  useEffect(() => {
    document.title = lang === "es"
      ? "Uay Labs – Acompañantes digitales con alma"
      : "Uay Labs – Digital copilots with soul";
  }, [lang]);

  const t = useMemo(() => translations[lang], [lang]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-emerald-300/30 selection:text-emerald-100">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="#" className="font-semibold tracking-tight text-lg">Uay Labs</a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
            <a href="#razon" className="hover:text-white transition">{t.nav.reason}</a>
            <a href="#copilotos" className="hover:text-white transition">{t.nav.copilots}</a>
            <a href="#enfoque" className="hover:text-white transition">{t.nav.method}</a>
            <a href="#contacto" className="hover:text-white transition">{t.nav.contact}</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-3 py-2 text-xs hover:border-white/30">
              <Globe size={14} /> {lang.toUpperCase()}
            </button>
            <a href="#contacto" className="inline-flex items-center gap-2 rounded-2xl bg-white text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-emerald-200 transition">
              {t.nav.cta} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div style={{ y, opacity }} className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
          <motion.div style={{ y }} className="absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 md:pb-24">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl md:text-6xl font-semibold tracking-tight">
            {t.hero.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }} className="mt-5 max-w-2xl text-neutral-300 text-lg">
            {t.hero.subtitle_1} <span className="text-white">{t.hero.subtitle_bold}</span> {t.hero.subtitle_2}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href="#copilotos" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 text-neutral-900 px-5 py-3 text-sm font-semibold hover:bg-emerald-300 transition">
              {t.hero.cta_primary} <Sparkles size={16} />
            </a>
            <a href="#razon" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm hover:border-white/40 transition">
              {t.hero.cta_secondary} <Rocket size={16} />
            </a>
          </motion.div>

          {/* Founder card (punchy) */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, delay: 0.28 }} className="mt-10 p-4 md:p-5 rounded-3xl border border-white/10 bg-white/5">
            <p className="text-sm text-neutral-300">
              {t.founder.statement}
            </p>
          </motion.div>
        </div>

        {/* Ambient marquee */}
        <div className="relative border-y border-white/5 bg-neutral-900/40 py-2">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div initial={{ x: 0 }} animate={{ x: [0, -400] }} transition={{ repeat: Infinity, repeatType: "mirror", duration: 20, ease: "linear" }} className="whitespace-nowrap text-xs md:text-sm text-neutral-400">
              <span className="mr-10">Snapshot → MVP → Validación</span>
              <span className="mr-10">FalconCore · IA con contexto</span>
              <span className="mr-10">Lanzar, iterar, escuchar</span>
              <span className="mr-10">Productos útiles, no humo</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RAZÓN DE SER */}
      <section id="razon" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">{t.reason.title}</h2>
            <p className="mt-4 text-neutral-300">{t.reason.p1}</p>
            <p className="mt-3 text-neutral-300">{t.reason.p2}</p>
          </div>
          <div className="md:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-6">
              <h3 className="text-lg font-medium">{t.why.title}</h3>
              <p className="mt-2 text-neutral-300">{t.why.p1}</p>
              <ul className="mt-4 space-y-2 text-neutral-300 text-sm">
                <li>• {t.why.b1}</li>
                <li>• {t.why.b2}</li>
              </ul>
              <p className="mt-4 text-neutral-300">{t.why.p2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* COPILOTOS ACTIVOS */}
      <section id="copilotos" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">{t.copilots.title}</h2>
          <span className="text-xs text-neutral-400">{t.copilots.note}</span>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Pulzio */}
          <HoverCard>
            <div className="p-6">
              <div className="flex items-center gap-2 text-emerald-300">
                <Sparkles size={18} />
                <span className="uppercase tracking-wide text-xs">Pulzio</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold">{t.copilots.pulzioTitle}</h3>
              <p className="mt-2 text-neutral-300 text-sm">{t.copilots.pulzioDesc}</p>
              <div className="mt-4 flex items-center gap-3">
                <a href="#contacto" className="inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-emerald-200 transition">
                  {t.actions.learnMore} <ArrowRight size={16} />
                </a>
                <a href="#" className="text-xs text-neutral-400 hover:text-neutral-200">{t.actions.roadmap}</a>
              </div>
            </div>
          </HoverCard>

          {/* Ahau */}
          <HoverCard>
            <div className="p-6">
              <div className="flex items-center gap-2 text-cyan-300">
                <Rocket size={18} />
                <span className="uppercase tracking-wide text-xs">Ahau</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold">{t.copilots.ahauTitle}</h3>
              <p className="mt-2 text-neutral-300 text-sm">{t.copilots.ahauDesc}</p>
              <div className="mt-4 flex items-center gap-3">
                <a href="#contacto" className="inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-emerald-200 transition">
                  {t.actions.joinBeta} <Send size={16} />
                </a>
                <a href="#" className="text-xs text-neutral-400 hover:text-neutral-200">{t.actions.quickDemo}</a>
              </div>
            </div>
          </HoverCard>
        </div>

        <p className="mt-6 text-xs text-neutral-400">{t.copilots.future}</p>
      </section>

      {/* ENFOQUE */}
      <section id="enfoque" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-6">
          <MethodCard title="Snapshot" text={t.method.snapshot} />
          <MethodCard title="MVP Copilot" text={t.method.mvp} />
          <MethodCard title={t.method.validationTitle} text={t.method.validation} />
        </div>
      </section>

      {/* CIERRE MANIFIESTO */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-white/10 p-6 md:p-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-white/0 to-transparent">
          <motion.blockquote initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7 }} className="text-lg md:text-xl text-neutral-200">
            {t.manifesto}
          </motion.blockquote>
          <div className="mt-6 flex items-center gap-4 text-xs text-neutral-400">
            <a className="inline-flex items-center gap-1 hover:text-neutral-200" href="#">
              <Github size={14} /> {t.actions.codeSnapshots}
            </a>
            <span>•</span>
            <a className="hover:text-neutral-200" href="#contacto">{t.actions.contact}</a>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <footer id="contacto" className="border-t border-white/5 bg-neutral-950/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h3 className="text-xl font-semibold">{t.contact.title}</h3>
              <p className="mt-2 text-neutral-300 text-sm max-w-md">{t.contact.p}</p>
            </div>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <input className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30" placeholder={t.contact.name}/>
                <input className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30" placeholder={t.contact.email}/>
              </div>
              <textarea className="w-full rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30 min-h-[120px]" placeholder={t.contact.msg}/>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 text-neutral-900 px-5 py-3 text-sm font-semibold hover:bg-emerald-300 transition">
                {t.contact.send} <Send size={16} />
              </button>
              <p className="text-xs text-neutral-500">{t.contact.note}</p>
            </form>
          </div>
          <div className="mt-10 text-xs text-neutral-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Uay Labs. {t.footer.madeIn}</p>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-neutral-300">{t.footer.privacy}</a>
              <a href="#" className="hover:text-neutral-300">{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HoverCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="relative rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      {children}
    </motion.div>
  );
}

function MethodCard({ title, text }: { title: string; text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} className="rounded-3xl border border-white/10 p-6 bg-white/5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-neutral-300">{text}</p>
    </motion.div>
  );
}

const translations = {
  es: {
    nav: { reason: "Razón de ser", copilots: "Copilotos", method: "Enfoque", contact: "Contacto", cta: "Hablemos" },
    hero: {
      title: "Acompañantes digitales con alma",
      subtitle_1: "Uay Labs es mi laboratorio como solopreneur. Construyo",
      subtitle_bold: "copilotos que nacen de experiencias reales",
      subtitle_2: "y ayudan a transformar cómo trabajamos y vivimos.",
      cta_primary: "Explora los copilotos",
      cta_secondary: "¿Por qué Uay?"
    },
    founder: {
      statement: "Soy Luis. Diseñador de sistemas, builder y estratega de Customer Success. Me obsesiona convertir dolores reales en productos útiles. Uay Labs es mi espacio para lanzar copilotos con identidad, claridad y propósito."
    },
    reason: {
      title: "Razón de ser",
      p1: "Crear sin pedir permiso. Vivir en estado de juego, exploración y propósito. Usar la tecnología como puente entre visión y acción.",
      p2: "No busco solo ingresos: construyo lo que me habría gustado tener en mi propio camino. Uay Labs es el contenedor donde esas ideas se vuelven reales."
    },
    why: {
      title: "¿Por qué ‘Uay’?",
      p1: "En la cosmovisión maya, Uay (se pronuncia guay) es el espíritu acompañante: una fuerza que protege, complementa y transforma. Así como cada persona tenía su uay, cada proyecto tiene un espíritu que lo mueve.",
      b1: "Símbolo de poder mutante y vínculo con lo invisible.",
      b2: "Metáfora perfecta de un copiloto: presencia que acompaña, no reemplaza.",
      p2: "Uay Labs existe para encontrar ese espíritu, nutrirlo y lanzarlo al mundo."
    },
    copilots: {
      title: "Copilotos activos",
      note: "(hoy enfocado en 2 proyectos; más en camino)",
      pulzioTitle: "Narrativa viva con clientes",
      pulzioDesc: "El copiloto que da visibilidad real a la relación con clientes: simplifica señales, centraliza contexto y convierte la interacción en decisiones.",
      ahauTitle: "Voces de liderazgo sincronizadas",
      ahauDesc: "Copiloto para crear y personalizar contenido auténtico en LinkedIn, alineado a la estrategia del equipo de liderazgo.",
      future: "Próximos copilotos: iremos anunciando betas conforme maduren los MVPs."
    },
    method: {
      snapshot: "Claridad inmediata del problema, contexto y alcance. Documentación viva que guía el sprint.",
      mvp: "Versión mínima útil orientada a acompañar: IA + modularidad + decisiones simples.",
      validationTitle: "Validación",
      validation: "Pruebas con usuarios reales, aprendizaje rápido y siguientes pasos sin humo."
    },
    manifesto: "No creo apps. Creo acompañantes digitales con alma. Creemos en lanzar, iterar y escuchar. En copilotos con contexto y en tecnología que eleva, no que abruma.",
    actions: { codeSnapshots: "Código y snapshots", contact: "Contactar", learnMore: "Quiero saber más", roadmap: "Roadmap", joinBeta: "Únete al beta", quickDemo: "Demo rápida" },
    contact: { title: "¿Construimos algo juntos?", p: "Si quieres colaborar, probar un copiloto o dar feedback, escríbeme. Me enfoco en problemas reales y validación honesta.", name: "Nombre", email: "Email", msg: "¿En qué estás pensando?", send: "Enviar", note: "Formulario estático; conecta tu endpoint cuando estés listo." },
    footer: { madeIn: "Hecho en CDMX.", privacy: "Privacidad", terms: "Términos" }
  },
  en: {
    nav: { reason: "Why it exists", copilots: "Copilots", method: "Method", contact: "Contact", cta: "Say hi" },
    hero: {
      title: "Digital copilots with soul",
      subtitle_1: "Uay Labs is my solo builder lab. I create",
      subtitle_bold: "copilots born from lived pain and real use",
      subtitle_2: "— built to transform how we work and live.",
      cta_primary: "Explore the copilots",
      cta_secondary: "Why ‘Uay’?"
    },
    founder: {
      statement: "I’m Luis — systems thinker, builder, and Customer Success strategist. I turn real-world pain into useful products. Uay Labs is where I ship copilots with identity, clarity, and purpose."
    },
    reason: {
      title: "Reason to exist",
      p1: "Create without asking for permission. Live in a state of play, exploration, and purpose. Use technology as a bridge between vision and action.",
      p2: "I’m not chasing revenue alone: I build what I wish I had on my own path. Uay Labs is where those ideas become real."
    },
    why: {
      title: "Why ‘Uay’?",
      p1: "In Mayan cosmovision, Uay (pronounced ‘why’) is an accompanying spirit — a force that protects, complements, and transforms. As every person had a uay, every project has a spirit that moves it.",
      b1: "Symbol of mutating power and a bridge to the invisible.",
      b2: "A perfect metaphor for a copilot: presence that accompanies, not replaces.",
      p2: "Uay Labs exists to find that spirit, nurture it, and push it into the world."
    },
    copilots: {
      title: "Active copilots",
      note: "(focused on 2 for now; more coming)",
      pulzioTitle: "Customer narrative, alive",
      pulzioDesc: "The copilot that brings real visibility to customer relationships: simplifies signals, centralizes context, and turns interactions into decisions.",
      ahauTitle: "Leadership voices, synchronized",
      ahauDesc: "Copilot to create and personalize authentic LinkedIn content, aligned with your leadership team’s strategy.",
      future: "More copilots soon: I’ll announce betas as MVPs mature."
    },
    method: {
      snapshot: "Immediate clarity on the problem, context, and scope. A living document that guides each sprint.",
      mvp: "Minimum useful copilot: AI + modularity + simple decisions.",
      validationTitle: "Validation",
      validation: "Real-user testing, fast learning, and honest next steps."
    },
    manifesto: "I don’t build apps. I build digital copilots with soul. I believe in shipping, iterating, and listening. In copilots with context and technology that elevates rather than overwhelms.",
    actions: { codeSnapshots: "Code & snapshots", contact: "Contact", learnMore: "Learn more", roadmap: "Roadmap", joinBeta: "Join beta", quickDemo: "Quick demo" },
    contact: { title: "Shall we build something?", p: "If you want to collaborate, test a copilot, or share feedback, message me. I focus on real problems and honest validation.", name: "Name", email: "Email", msg: "What’s on your mind?", send: "Send", note: "Static form; plug your endpoint when ready." },
    footer: { madeIn: "Made in Mexico City.", privacy: "Privacy", terms: "Terms" }
  }
} as const;
