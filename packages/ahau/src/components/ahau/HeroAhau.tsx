'use client';
import React, { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";

// ---------------- Helper ----------------
const Bubble = ({ delay = 0, x = 0, y = 0, align = false, text = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, x, y, rotate: -6 }}
    animate={{ opacity: 1, scale: 1, x: align ? 0 : x, y: align ? 0 : y, rotate: align ? 0 : -6 }}
    transition={{ type: "spring", stiffness: 120, damping: 16, delay }}
    className="rounded-2xl shadow-lg px-3 py-2 md:px-4 md:py-2 bg-white/90 text-slate-800 backdrop-blur-sm border border-white/60 max-w-[220px]"
  >
    <div className="text-xs md:text-sm leading-snug">{text}</div>
  </motion.div>
);

// ---------------- Hero ------------------
export default function HeroAhau() {
  const controls = useAnimation();
  const [phase, setPhase] = useState(0); // 0: dispersed, 1: aligned, 2: post

  // Headline shimmer loop
  useEffect(() => {
    const loop = async () => {
      while (true) {
        await controls.start({ opacity: [1, 0.35, 1], scale: [1, 0.97, 1], transition: { duration: 2.6 } });
      }
    };
    loop();
  }, [controls]);

  // Auto demo phase machine (≈10s)
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      while (mounted) {
        setPhase(0); await new Promise(r => setTimeout(r, 3200));
        setPhase(1); await new Promise(r => setTimeout(r, 3200));
        setPhase(2); await new Promise(r => setTimeout(r, 3200));
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  const Progress = () => (
    <motion.div key={phase} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3.2, ease: "linear" }} className="h-0.5 bg-gradient-to-r from-white to-white/0 rounded" />
  );

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-10 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Collective Thought Leadership
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
              El mensaje de tu liderazgo se dispersa…
              <br />
              <motion.span animate={controls} className="inline-block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Ahau lo sincroniza.
              </motion.span>
            </h1>

            <p className="mt-6 text-white/80 text-base md:text-lg max-w-xl">
              Alinea las voces de tu equipo directivo sin perder autenticidad: drafts neutrales alineados al tenant, personalización por líder y publicación consistente en LinkedIn.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#try-tone-trainer" className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow transition">
                <Play className="h-4 w-4" /> Probar Tone Trainer
              </a>
              <a href="#join-waitlist" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition">
                Únete a la lista <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Social proof tiny */}
            <div className="mt-6 text-xs text-white/60">En piloto con equipos B2B en consultoría y SaaS.</div>
          </div>

          {/* Animated visual */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/0 blur-xl" />
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur p-5 md:p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="text-white/80 text-sm">Auto-demo • {phase === 0 ? "Ideas dispersas" : phase === 1 ? "Alineación del tenant" : "Post final"}</div>
                <div className="text-white/40 text-xs">~10s loop</div>
              </div>

              {/* Body */}
              <div className="mt-4 min-h-[240px] md:min-h-[280px] grid place-items-center">
                <AnimatePresence mode="wait">
                  {phase === 0 && (
                    <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                      <div className="grid grid-cols-2 gap-3">
                        <Bubble delay={0.05} x={-40} y={-6} text="CEO: Big picture, quarterly bets" />
                        <Bubble delay={0.15} x={26} y={-20} text="CTO: Roadmap técnico y delivery" />
                        <Bubble delay={0.25} x={-18} y={22} text="CRO: Pipeline, cuota, wins" />
                        <Bubble delay={0.35} x={18} y={14} text="CS: Retención, valor en vivo" />
                      </div>
                    </motion.div>
                  )}

                  {phase === 1 && (
                    <motion.div key="p1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="w-full">
                      <motion.div initial="scatter" animate="align" variants={{ align: { transition: { staggerChildren: 0.08 } } }} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { t: "Tema: Narrative shift del quarter" },
                          { t: "Tone: claro, cálido, sin hype" },
                          { t: "Keywords: ICP, uso real, métricas" },
                          { t: "CTA: conversación > venta directa" },
                          { t: "Formato: post corto + hilo" },
                          { t: "Cadencia: 2× por semana" },
                        ].map((b, i) => (
                          <motion.div
                            key={i}
                            variants={{ align: { opacity: 1, x: 0, y: 0, rotate: 0 } }}
                            initial={{ opacity: 0, x: [8, -8, 0][i % 3], y: [6, -12, 10][i % 3], rotate: [-2, 3, -1][i % 3] }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.06 * i }}
                            className="rounded-2xl border border-white/15 bg-white/80 text-slate-900 px-3 py-2 text-xs md:text-sm shadow"
                          >
                            {b.t}
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}

                  {phase === 2 && (
                    <motion.div key="p2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full">
                      <div className="rounded-2xl bg-white text-slate-900 border border-white/20 shadow-lg overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
                          <div className="h-8 w-8 rounded-full bg-slate-200" />
                          <div className="text-sm font-medium">Líder – VP Product</div>
                          <div className="ml-auto text-xs text-slate-500">Ahora</div>
                        </div>
                        <div className="p-4 text-sm leading-relaxed">
                          <div className="font-semibold mb-1">De la dispersión a la dirección</div>
                          Hoy alineamos nuestra comunicación de liderazgo: un marco común del tenant, cada voz con su propia historia… y una cadencia clara. Más conversación, menos hype.
                        </div>
                        <div className="px-4 py-3 text-xs text-slate-500 border-t border-slate-200 flex items-center gap-4">
                          <div>• ICP • uso real • métricas</div>
                          <div className="ml-auto">Listo para publicar</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress + Caption */}
              <div className="mt-4 space-y-2">
                <Progress />
                <div className="text-[11px] md:text-xs text-white/70">
                  {phase === 0 && "Ideas dispersas por líder → difícil amplificar la marca"}
                  {phase === 1 && "Marco común del tenant → parámetros claros para todos"}
                  {phase === 2 && "Post listo: cada voz conserva autenticidad, la marca mantiene dirección"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------- Sections ----------------
export function LogosStrip() {
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-white/60 text-xs uppercase tracking-wider mb-4">En evaluación por equipos de</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 opacity-80">
          {["Consultoría", "SaaS B2B", "Fintech", "EdTech", "Servicios", "Agencias"].map((t) => (
            <div key={t} className="h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-white/70 text-xs">
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  const items = [
    { title: "Tenant primero", desc: "Marco común: tono, temas, keywords y cadencia para alinear a toda la dirección." },
    { title: "Draft neutral → voz personal", desc: "El admin crea el borrador base; cada líder lo personaliza sin perder dirección." },
    { title: "Tone Trainer", desc: "Ajusta formalidad, cercanía y especificidad. Guarda presets por líder." },
    { title: "Workflow simple", desc: "Idea → Asignado → Edición → Listo → Publicado. Visibilidad del estado real." },
    { title: "Analytics esenciales", desc: "Conteo de publicaciones por líder y por semana. Sin dependencia de APIs cerradas." },
    { title: "Privacidad mínima viable", desc: "Consentimiento claro, control de datos y eliminación a un clic." },
  ];
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Lo que hace a Ahau diferente</h2>
        <p className="text-white/70 mt-2 max-w-2xl">No es employee advocacy masivo. Es sincronización de liderazgo con autenticidad y dirección.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur p-5 text-white shadow">
              <div className="text-lg font-medium">{f.title}</div>
              <div className="text-white/80 text-sm mt-2">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { title: "Define el tenant", desc: "Identidad, tono, temas, cadencia." },
    { title: "Genera draft base", desc: "Admin crea borrador neutral alineado al tenant." },
    { title: "Asigna a líderes", desc: "Cada quien personaliza con su voz." },
    { title: "Publica y mide", desc: "Cadencia simple + conteo esencial de publicaciones." },
  ];
  return (
    <section className="py-16 md:py-20" id="como-funciona">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Cómo funciona</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur p-5 text-white">
              <div className="text-sm text-white/60">Paso {i + 1}</div>
              <div className="text-lg font-medium mt-1">{s.title}</div>
              <div className="text-white/80 text-sm mt-2">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ToneTrainerTeaser() {
  return (
    <section id="try-tone-trainer" className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl md:text-3xl font-semibold text-white">Prueba el Tone Trainer</h3>
          <p className="text-white/80 mt-3 max-w-xl">Muéstrale a Ahau cómo suena tu liderazgo: ajusta formalidad, cercanía y especificidad, y genera ejemplos inmediatos. Guarda tu preset cuando te represente bien.</p>
          <a href="#join-waitlist" className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow transition mt-6">
            Solicitar acceso temprano
          </a>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur p-5 text-white">
          <div className="text-sm text-white/70">Demo simple</div>
          <div className="mt-3 grid gap-2 text-sm">
            <label className="grid gap-1">
              <span className="text-white/70">Tono</span>
              <input placeholder="claro, cálido, específico" className="px-3 py-2 rounded-xl bg-white text-slate-900" />
            </label>
            <label className="grid gap-1">
              <span className="text-white/70">Keywords</span>
              <input placeholder="ICP, uso real, métricas" className="px-3 py-2 rounded-xl bg-white text-slate-900" />
            </label>
            <button className="mt-3 rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-medium">Generar ejemplo</button>
            <div className="rounded-xl bg-white text-slate-900 p-3 text-sm">Ejemplo: Post neutral del tenant listo para personalizar…</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WaitlistForm() {
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as any;
    const email = form.email.value;
    const role = form.role.value;
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, source: "ahau-landing" }),
      });
      const data = await res.json().catch(()=>({}));
      alert(data?.message || (res.ok ? "Gracias, te contactaremos pronto." : "Error al registrar."));
      if (res.ok) form.reset();
    } catch {
      alert("Error de red. Intenta de nuevo.");
    }
  }

  return (
    <section id="join-waitlist" className="py-16 md:py-20">
      <div className="max-w-3xl mx:auto px-6 md:px-10">
        <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur p-6 md:p-8 text-white">
          <h3 className="text-2xl font-semibold">Únete a la lista</h3>
          <p className="text-white/80 mt-2">Acceso temprano para equipos B2B. Déjanos tu correo y rol para priorizar pilotos.</p>
          <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={submit}>
            <input name="email" required type="email" placeholder="tu@empresa.com" className="px-3 py-2 rounded-xl bg-white text-slate-900" />
            <input name="role" placeholder="Rol (CEO, CMO, VP CS, etc.)" className="px-3 py-2 rounded-xl bg-white text-slate-900" />
            <button className="rounded-xl bg-white text-slate-900 px-4 py-2 text-sm font-medium">Solicitar acceso</button>
          </form>
          <div className="text-xs text-white/60 mt-3">Al enviar aceptas nuestro aviso de privacidad y el uso de datos para contactar sobre el piloto.</div>
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const qs = [
    { q: "¿Es employee advocacy?", a: "No. Comienza top-down con liderazgo y luego escala con el equipo. Es sincronización, no spam masivo." },
    { q: "¿Necesita LinkedIn API?", a: "Para métricas básicas, no. Contamos publicaciones y cadencias; más adelante exploraremos integraciones oficiales." },
    { q: "¿Privacidad?", a: "Mínimos claros: consentimiento, control de datos y eliminación total bajo solicitud." },
    { q: "¿Idiomas?", a: "Español e inglés desde el día 1." },
  ];
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <h3 className="text-2xl md:text-3xl font-semibold text-white">Preguntas frecuentes</h3>
        <div className="mt-6 grid gap-3">
          {qs.map((x) => (
            <details key={x.q} className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur p-4 text-white">
              <summary className="cursor-pointer text-base md:text-lg">{x.q}</summary>
              <div className="text-white/80 mt-2 text-sm md:text-base">{x.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-10 border-t border-white/10 text-white/70">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} Uay Labs • Ahau</div>
        <div className="text-xs">Privacidad • Términos • hello@ahau.io</div>
      </div>
    </footer>
  );
}


