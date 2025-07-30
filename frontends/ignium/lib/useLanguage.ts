import { useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    socialProof: string[];
  };
  yeka: {
    badge: string;
    title: string;
    description: string;
    features: string[];
  };
  modules: {
    title: string;
    subtitle: string;
    items: Array<{
      name: string;
      description: string;
    }>;
  };
  differentiators: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  results: {
    title: string;
    items: string[];
    subtitle: string;
  };
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
}

const content: Record<Language, LanguageContent> = {
  es: {
    hero: {
      badge: "Copiloto Táctico para Solopreneurs",
      title: "De la idea suelta al primer cliente",
      subtitle: "Sin stack técnico. Sin comunidad. Sin complicaciones.",
      description: "Ignium es tu copiloto táctico que transforma ideas en proyectos validados y accionables desde el día 0.",
      ctaPrimary: "🚀 Unirse al Waitlist",
      ctaSecondary: "Ver Demo",
      socialProof: ["Sin código requerido", "Sin equipo técnico", "Sin audiencia previa"]
    },
    yeka: {
      badge: "🤖 Tu Copiloto Conversacional",
      title: "Conoce a Yeka",
      description: "Yeka es tu copiloto conversacional que no solo conversa, sino que propone rutas, activa módulos y te acompaña en cada decisión.",
      features: ["Estructura tus ideas sueltas", "Propone rutas accionables", "Activa módulos automáticamente"]
    },
    modules: {
      title: "Sistema Modular Inteligente",
      subtitle: "Ignium no es solo un chatbot. Es un ecosistema de módulos que trabajan juntos para transformar tu idea en realidad.",
      items: [
        { name: "MemorySync", description: "Mantiene el contexto vivo de tu proyecto, decisiones y avances para continuidad estratégica." },
        { name: "Pitch Generator", description: "Genera diferentes versiones de pitch: emocional, técnico, directo para cada audiencia." },
        { name: "Inbox Sync", description: "Conecta con tu email real para detectar señales de tracción y oportunidades." },
        { name: "Validation Planner", description: "Define hipótesis, canales de validación y estructuras de testeo para tu idea." },
        { name: "Traction Tracker", description: "Visualiza tu funnel de interacción: visitas, respuestas, seguimiento en tiempo real." },
        { name: "Deliverable Generator", description: "Crea assets accionables: mockups, imágenes, documentos compartibles sin código." }
      ]
    },
    differentiators: {
      title: "¿Por qué Ignium es diferente?",
      items: [
        { title: "No asume que ya tienes tracción", description: "Parte de cero: sin audiencia, sin claridad, sin equipo. Te acompaña desde la idea más suelta hasta el primer cliente." },
        { title: "Enfocado en ejecución, no solo ideación", description: "No solo conversa. Activa módulos reales que generan entregables accionables desde el día 0." },
        { title: "Integración real con tu inbox", description: "Conecta con tu email real para detectar señales de tracción y oportunidades desde el MVP." },
        { title: "Multi-LLM inteligente", description: "Selecciona automáticamente el mejor modelo según el caso de uso: GPT-4, Claude, Mistral y más." }
      ]
    },
    results: {
      title: "¿Qué obtienes al final?",
      items: ["Propuesta Clara", "Pitch Usable", "Mockup de Landing", "Canal de Validación", "Señales de Mercado", "Respuestas Sugeridas"],
      subtitle: "Todo guiado por un solo copiloto: Yeka"
    },
    cta: {
      title: "¿Listo para transformar tu idea?",
      description: "Únete al waitlist y sé de los primeros en experimentar el poder de un copiloto táctico real.",
      primary: "🚀 Unirse al Waitlist",
      secondary: "Ver Demo Completo"
    }
  },
  en: {
    hero: {
      badge: "Tactical Copilot for Solopreneurs",
      title: "From loose idea to first customer",
      subtitle: "No technical stack. No community. No complications.",
      description: "Ignium is your tactical copilot that transforms ideas into validated and actionable projects from day 0.",
      ctaPrimary: "🚀 Join Waitlist",
      ctaSecondary: "View Demo",
      socialProof: ["No code required", "No technical team", "No previous audience"]
    },
    yeka: {
      badge: "🤖 Your Conversational Copilot",
      title: "Meet Yeka",
      description: "Yeka is your conversational copilot who doesn't just chat, but proposes routes, activates modules and accompanies you in every decision.",
      features: ["Structures your loose ideas", "Proposes actionable routes", "Automatically activates modules"]
    },
    modules: {
      title: "Intelligent Modular System",
      subtitle: "Ignium is not just a chatbot. It's an ecosystem of modules that work together to transform your idea into reality.",
      items: [
        { name: "MemorySync", description: "Maintains the living context of your project, decisions and progress for strategic continuity." },
        { name: "Pitch Generator", description: "Generates different pitch versions: emotional, technical, direct for each audience." },
        { name: "Inbox Sync", description: "Connects with your real email to detect traction signals and opportunities." },
        { name: "Validation Planner", description: "Defines hypotheses, validation channels and testing structures for your idea." },
        { name: "Traction Tracker", description: "Visualizes your interaction funnel: visits, responses, follow-up in real time." },
        { name: "Deliverable Generator", description: "Creates actionable assets: mockups, images, shareable documents without code." }
      ]
    },
    differentiators: {
      title: "Why is Ignium different?",
      items: [
        { title: "Doesn't assume you already have traction", description: "Starts from zero: no audience, no clarity, no team. Accompanies you from the loosest idea to the first customer." },
        { title: "Focused on execution, not just ideation", description: "Not just chatting. Activates real modules that generate actionable deliverables from day 0." },
        { title: "Real inbox integration", description: "Connects with your real email to detect traction signals and opportunities from the MVP." },
        { title: "Intelligent Multi-LLM", description: "Automatically selects the best model according to the use case: GPT-4, Claude, Mistral and more." }
      ]
    },
    results: {
      title: "What do you get in the end?",
      items: ["Clear Proposal", "Usable Pitch", "Landing Mockup", "Validation Channel", "Market Signals", "Suggested Responses"],
      subtitle: "Everything guided by a single copilot: Yeka"
    },
    cta: {
      title: "Ready to transform your idea?",
      description: "Join the waitlist and be among the first to experience the power of a real tactical copilot.",
      primary: "🚀 Join Waitlist",
      secondary: "View Complete Demo"
    }
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('es');
  const [isLoading, setIsLoading] = useState(false); // Cambiado a false por defecto

  useEffect(() => {
    const detectLanguage = () => {
      // Solo detectar idioma en el cliente, no en SSR
      if (typeof window !== 'undefined') {
        const userCountry = navigator.language || 'es';
        const isEnglishSpeaking = userCountry.startsWith('en') || 
                                 userCountry.includes('US') || 
                                 userCountry.includes('CA') || 
                                 userCountry.includes('GB') || 
                                 userCountry.includes('AU');
        
        setLanguage(isEnglishSpeaking ? 'en' : 'es');
      }
    };

    detectLanguage();
  }, []);

  return {
    language,
    setLanguage,
    content: content[language],
    isLoading
  };
} 