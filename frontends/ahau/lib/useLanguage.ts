import { useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    socialProof: string[];
  };
  problem: {
    title: string;
    subtitle: string;
    painPoints: string[];
  };
  solution: {
    title: string;
    subtitle: string;
    features: string[];
  };
  benefits: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  waitlist: {
    title: string;
    description: string;
    form: {
      name: string;
      email: string;
      company: string;
      role: string;
      submit: string;
    };
  };
}

const content: Record<Language, LanguageContent> = {
  es: {
    hero: {
      badge: "El liderazgo, sincronizado",
      title: "Sincroniza las voces de tus líderes para amplificar tu marca",
      subtitle: "Convierte la estrategia de marketing en publicaciones personalizadas y consistentes en LinkedIn",
      description: "Ahau alinea y amplifica la voz de líderes y equipos clave dentro de empresas B2B, manteniendo la voz auténtica de cada participante.",
      ctaPrimary: "🚀 Únete a la Waitlist",
      socialProof: ["Personalización por tono", "Gamificación interna", "Velocidad de entrega"]
    },
    problem: {
      title: "¿Por qué fallan las estrategias de LinkedIn?",
      subtitle: "Los equipos de liderazgo luchan con la consistencia y alineación",
      painPoints: [
        "Falta de alineación entre líderes",
        "Tiempo excesivo en crear contenido",
        "Inconsistencia en el mensaje de marca",
        "Baja participación del equipo"
      ]
    },
    solution: {
      title: "La solución: Coordinación inteligente",
      subtitle: "Ahau transforma la estrategia en acción coordinada",
      features: [
        "Análisis de publicaciones pasadas para personalizar el tono",
        "Generación de contenido alineado con la estrategia",
        "Gamificación para incentivar la participación",
        "Métricas en tiempo real del impacto"
      ]
    },
    benefits: {
      title: "Beneficios que obtienes",
      items: [
        { title: "Más visibilidad de marca", description: "Amplifica el alcance con voces coordinadas" },
        { title: "Alineación interna", description: "Todos los líderes transmiten el mismo mensaje" },
        { title: "Ahorro de tiempo", description: "Publicaciones listas en minutos, no días" },
        { title: "ROI medible", description: "Métricas claras del impacto en LinkedIn" }
      ]
    },
    waitlist: {
      title: "¿Listo para sincronizar tu liderazgo?",
      description: "Únete a la waitlist y sé de los primeros en experimentar el poder de la coordinación inteligente.",
      form: {
        name: "Tu nombre",
        email: "Tu email",
        company: "Empresa",
        role: "Rol",
        submit: "Unirse a la Waitlist"
      }
    }
  },
  en: {
    hero: {
      badge: "Leadership, synchronized",
      title: "Synchronize your leaders' voices to amplify your brand",
      subtitle: "Transform marketing strategy into personalized and consistent LinkedIn posts",
      description: "Ahau aligns and amplifies the voice of leaders and key teams within B2B companies, maintaining the authentic voice of each participant.",
      ctaPrimary: "🚀 Join the Waitlist",
      socialProof: ["Tone personalization", "Internal gamification", "Fast delivery"]
    },
    problem: {
      title: "Why do LinkedIn strategies fail?",
      subtitle: "Leadership teams struggle with consistency and alignment",
      painPoints: [
        "Lack of alignment between leaders",
        "Excessive time creating content",
        "Inconsistent brand messaging",
        "Low team participation"
      ]
    },
    solution: {
      title: "The solution: Intelligent coordination",
      subtitle: "Ahau transforms strategy into coordinated action",
      features: [
        "Analysis of past posts to personalize tone",
        "Content generation aligned with strategy",
        "Gamification to incentivize participation",
        "Real-time metrics of impact"
      ]
    },
    benefits: {
      title: "Benefits you get",
      items: [
        { title: "More brand visibility", description: "Amplify reach with coordinated voices" },
        { title: "Internal alignment", description: "All leaders convey the same message" },
        { title: "Time savings", description: "Posts ready in minutes, not days" },
        { title: "Measurable ROI", description: "Clear metrics of LinkedIn impact" }
      ]
    },
    waitlist: {
      title: "Ready to synchronize your leadership?",
      description: "Join the waitlist and be among the first to experience the power of intelligent coordination.",
      form: {
        name: "Your name",
        email: "Your email",
        company: "Company",
        role: "Role",
        submit: "Join the Waitlist"
      }
    }
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('es');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const detectLanguage = () => {
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
