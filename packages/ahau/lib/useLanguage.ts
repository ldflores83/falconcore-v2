import { useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContent {
  hero: {
    badge: string;
    phases: Array<{
      title: string;
      subtitle: string;
      description: string;
    }>;
    ctaPrimary: string;
    ctaSecondary: string;
    socialProof: string[];
  };
  logosStrip: {
    title: string;
    subtitle: string;
  };
  features: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{
      title: string;
      description: string;
      details: string[];
    }>;
  };
  toneTrainer: {
    title: string;
    subtitle: string;
    demoTitle: string;
    demoDescription: string;
    features: string[];
    cta: string;
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
    privacy: string;
  };
  faq: {
    title: string;
    subtitle: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  footer: {
    description: string;
    newsletter: {
      title: string;
      description: string;
      button: string;
    };
    copyright: string;
  };
}

const content: Record<Language, LanguageContent> = {
  es: {
    hero: {
      badge: "Acceso temprano disponible",
      phases: [
        {
          title: "El mensaje de tu liderazgo se dispersa...",
          subtitle: "Cada líder publica de forma aislada",
          description: "Sin coordinación, sin alineación, sin impacto"
        },
        {
          title: "Ahau lo sincroniza",
          subtitle: "Alinea las voces de tu equipo directivo",
          description: "Sin perder autenticidad, con máxima coherencia"
        },
        {
          title: "Amplifica tu marca",
          subtitle: "Contenido consistente y de alto impacto",
          description: "En LinkedIn, con la voz única de cada líder"
        }
      ],
      ctaPrimary: "Probar Tone Trainer",
      ctaSecondary: "Ver Demo",
      socialProof: [
        "Confianza de equipos en LATAM",
        "Contenido 3x más consistente",
        "Alineación de marca basada en IA"
      ]
    },
    logosStrip: {
      title: "Empresas que confían en la alineación de liderazgo",
      subtitle: "Más de 500+ equipos ejecutivos ya sincronizan sus voces"
    },
    features: {
      title: "Diferenciadores clave",
      subtitle: "Lo que hace único a Ahau en el mercado de herramientas de liderazgo",
      items: [
        {
          title: "Tenant primero",
          description: "Cada organización mantiene su privacidad y control total sobre sus datos y contenido."
        },
        {
          title: "Draft neutral → voz personal",
          description: "Nuestra IA analiza el estilo único de cada líder para mantener su autenticidad."
        },
        {
          title: "Tone Trainer",
          description: "Herramienta interactiva que enseña a los líderes a mantener coherencia en su comunicación."
        },
        {
          title: "Workflow simple",
          description: "De la idea a la publicación en minutos, no días. Proceso intuitivo y eficiente."
        },
        {
          title: "Analytics esenciales",
          description: "Métricas claras sobre el impacto del contenido y la participación del equipo."
        },
        {
          title: "Privacidad mínima",
          description: "Solo recopilamos lo necesario para funcionar. Transparencia total en el uso de datos."
        }
      ]
    },
    howItWorks: {
      title: "Cómo funciona Ahau",
      subtitle: "Un proceso simple pero poderoso para sincronizar las voces de tu liderazgo",
      steps: [
        {
          title: "Configura tu tenant",
          description: "Crea tu espacio organizacional y define los objetivos de marca.",
          details: [
            "Invita a tu equipo ejecutivo",
            "Define la estrategia de contenido",
            "Configura los tonos de voz objetivo"
          ]
        },
        {
          title: "IA analiza estilos",
          description: "Nuestro sistema estudia las publicaciones pasadas de cada líder.",
          details: [
            "Análisis de tono y estilo personal",
            "Identificación de patrones únicos",
            "Creación de perfil de voz individual"
          ]
        },
        {
          title: "Genera contenido",
          description: "Crea drafts alineados con la estrategia pero con la voz de cada líder.",
          details: [
            "Drafts personalizados por líder",
            "Alineación con objetivos de marca",
            "Mantiene autenticidad individual"
          ]
        },
        {
          title: "Coordina publicación",
          description: "Sincroniza el calendario y coordina las publicaciones del equipo.",
          details: [
            "Calendario compartido",
            "Aprobaciones en cascada",
            "Publicación coordinada"
          ]
        },
        {
          title: "Amplifica impacto",
          description: "Publica en LinkedIn con máxima coherencia y alcance.",
          details: [
            "Publicación automática",
            "Cross-promoción inteligente",
            "Máximo alcance orgánico"
          ]
        },
        {
          title: "Mide resultados",
          description: "Analiza el impacto y optimiza la estrategia continuamente.",
          details: [
            "Métricas de participación",
            "Análisis de alcance",
            "ROI de contenido"
          ]
        }
      ]
    },
    toneTrainer: {
      title: "Tone Trainer",
      subtitle: "La herramienta que enseña a tus líderes a mantener coherencia en su comunicación",
      demoTitle: "Entrena a tu equipo",
      demoDescription: "El Tone Trainer es una herramienta interactiva que enseña a cada líder a mantener coherencia en su comunicación mientras preserva su autenticidad personal.",
      features: [
        "Análisis de tono en tiempo real",
        "Feedback instantáneo y personalizado",
        "Ejercicios interactivos por líder",
        "Métricas de coherencia y alineación"
      ],
      cta: "Probar Tone Trainer"
    },
    waitlist: {
      title: "Únete a la lista de espera",
      description: "Recibe acceso temprano a Ahau y ayuda a definir el futuro de la alineación de liderazgo",
      form: {
        name: "Tu nombre",
        email: "Tu email",
        company: "Empresa (opcional)",
        role: "Rol (opcional)",
        submit: "Unirme a la lista"
      },
      privacy: "Al unirte, aceptas recibir actualizaciones sobre Ahau. Respetamos tu privacidad y no compartimos tu información."
    },
    faq: {
      title: "Preguntas frecuentes",
      subtitle: "Todo lo que necesitas saber sobre Ahau y cómo puede transformar tu liderazgo",
      ctaTitle: "¿Tienes más preguntas?",
      ctaDescription: "Únete a nuestra lista de espera y recibe respuestas directas de nuestro equipo",
      ctaButton: "Unirme a la lista de espera",
      items: [
        {
          question: "¿Qué es Ahau y cómo funciona?",
          answer: "Ahau es una plataforma que sincroniza las voces de tu equipo ejecutivo en LinkedIn. Usa IA para analizar el estilo único de cada líder, genera contenido alineado con tu estrategia de marca, y coordina las publicaciones para maximizar el alcance orgánico."
        },
        {
          question: "¿Cómo mantiene Ahau la autenticidad de cada líder?",
          answer: "Nuestro sistema de IA analiza las publicaciones pasadas de cada líder para entender su tono, estilo y personalidad única. Luego genera contenido que mantiene esa autenticidad mientras se alinea con los objetivos estratégicos de la empresa."
        },
        {
          question: "¿Es seguro para mi empresa?",
          answer: "Absolutamente. Ahau está diseñado con 'tenant primero', lo que significa que cada organización mantiene control total sobre sus datos. Solo recopilamos la información mínima necesaria y nunca compartimos datos entre empresas."
        },
        {
          question: "¿Qué es el Tone Trainer?",
          answer: "El Tone Trainer es una herramienta interactiva que enseña a tus líderes a mantener coherencia en su comunicación. Proporciona feedback en tiempo real y ejercicios personalizados para mejorar la alineación del equipo."
        },
        {
          question: "¿Cuánto tiempo toma configurar Ahau?",
          answer: "El proceso completo de configuración toma menos de 10 minutos. Incluye crear tu tenant, invitar a tu equipo, definir objetivos de marca, y configurar los tonos de voz objetivo."
        },
        {
          question: "¿Puedo probar Ahau antes de comprometerme?",
          answer: "Sí, ofrecemos acceso temprano gratuito para equipos que se unan a nuestra lista de espera. Esto te permite probar todas las funcionalidades y ver el impacto antes de cualquier compromiso."
        },
        {
          question: "¿Qué métricas proporciona Ahau?",
          answer: "Ahau te proporciona métricas esenciales como participación del equipo, alcance de contenido, coherencia de mensajes, y ROI de contenido. Todo diseñado para demostrar el impacto real de tu estrategia de liderazgo."
        },
        {
          question: "¿Ahau se integra con otras herramientas?",
          answer: "Actualmente nos enfocamos en LinkedIn como plataforma principal, pero estamos trabajando en integraciones con otras redes sociales y herramientas de marketing. Las futuras integraciones se anunciarán a los usuarios de la lista de espera."
        }
      ]
    },
    footer: {
      description: "Sincroniza las voces de tu liderazgo para amplificar tu marca en LinkedIn. Alineación sin perder autenticidad.",
      newsletter: {
        title: "Mantente actualizado",
        description: "Recibe las últimas actualizaciones sobre Ahau, nuevas funcionalidades y tips para maximizar tu liderazgo en LinkedIn.",
        button: "Unirse a la lista de espera"
      },
      copyright: "© 2025 Ahau. Built with ❤️ by UayLabs."
    }
  },
  en: {
    hero: {
      badge: "Early access available",
      phases: [
        {
          title: "Your leadership message gets scattered...",
          subtitle: "Each leader publishes in isolation",
          description: "No coordination, no alignment, no impact"
        },
        {
          title: "Ahau synchronizes it",
          subtitle: "Aligns your executive team's voices",
          description: "Without losing authenticity, with maximum coherence"
        },
        {
          title: "Amplify your brand",
          subtitle: "Consistent and high-impact content",
          description: "On LinkedIn, with each leader's unique voice"
        }
      ],
      ctaPrimary: "Try Tone Trainer",
      ctaSecondary: "Watch Demo",
      socialProof: [
        "Trusted by LATAM teams",
        "3x more consistent content",
        "AI-based brand alignment"
      ]
    },
    logosStrip: {
      title: "Companies that trust leadership alignment",
      subtitle: "500+ executive teams already synchronize their voices"
    },
    features: {
      title: "Key differentiators",
      subtitle: "What makes Ahau unique in the leadership tools market",
      items: [
        {
          title: "Tenant first",
          description: "Each organization maintains privacy and total control over their data and content."
        },
        {
          title: "Draft neutral → personal voice",
          description: "Our AI analyzes each leader's unique style to maintain their authenticity."
        },
        {
          title: "Tone Trainer",
          description: "Interactive tool that teaches leaders to maintain consistency in their communication."
        },
        {
          title: "Simple workflow",
          description: "From idea to publication in minutes, not days. Intuitive and efficient process."
        },
        {
          title: "Essential analytics",
          description: "Clear metrics on content impact and team participation."
        },
        {
          title: "Minimal privacy",
          description: "We only collect what's necessary to function. Total transparency in data usage."
        }
      ]
    },
    howItWorks: {
      title: "How Ahau works",
      subtitle: "A simple but powerful process to synchronize your leadership voices",
      steps: [
        {
          title: "Set up your tenant",
          description: "Create your organizational space and define brand objectives.",
          details: [
            "Invite your executive team",
            "Define content strategy",
            "Configure target voice tones"
          ]
        },
        {
          title: "AI analyzes styles",
          description: "Our system studies each leader's past publications.",
          details: [
            "Personal tone and style analysis",
            "Unique pattern identification",
            "Individual voice profile creation"
          ]
        },
        {
          title: "Generate content",
          description: "Create drafts aligned with strategy but with each leader's voice.",
          details: [
            "Personalized drafts per leader",
            "Brand objective alignment",
            "Maintains individual authenticity"
          ]
        },
        {
          title: "Coordinate publishing",
          description: "Synchronize calendar and coordinate team publications.",
          details: [
            "Shared calendar",
            "Cascade approvals",
            "Coordinated publishing"
          ]
        },
        {
          title: "Amplify impact",
          description: "Publish on LinkedIn with maximum coherence and reach.",
          details: [
            "Automatic publishing",
            "Smart cross-promotion",
            "Maximum organic reach"
          ]
        },
        {
          title: "Measure results",
          description: "Analyze impact and continuously optimize strategy.",
          details: [
            "Participation metrics",
            "Reach analysis",
            "Content ROI"
          ]
        }
      ]
    },
    toneTrainer: {
      title: "Tone Trainer",
      subtitle: "The tool that teaches your leaders to maintain consistency in their communication",
      demoTitle: "Train your team",
      demoDescription: "The Tone Trainer is an interactive tool that teaches each leader to maintain consistency in their communication while preserving their personal authenticity.",
      features: [
        "Real-time tone analysis",
        "Instant and personalized feedback",
        "Interactive exercises per leader",
        "Consistency and alignment metrics"
      ],
      cta: "Try Tone Trainer"
    },
    waitlist: {
      title: "Join the waitlist",
      description: "Get early access to Ahau and help define the future of leadership alignment",
      form: {
        name: "Your name",
        email: "Your email",
        company: "Company (optional)",
        role: "Role (optional)",
        submit: "Join the list"
      },
      privacy: "By joining, you agree to receive updates about Ahau. We respect your privacy and don't share your information."
    },
    faq: {
      title: "Frequently asked questions",
      subtitle: "Everything you need to know about Ahau and how it can transform your leadership",
      ctaTitle: "Have more questions?",
      ctaDescription: "Join our waitlist and get direct answers from our team",
      ctaButton: "Join the waitlist",
      items: [
        {
          question: "What is Ahau and how does it work?",
          answer: "Ahau is a platform that synchronizes your executive team's voices on LinkedIn. It uses AI to analyze each leader's unique style, generates content aligned with your brand strategy, and coordinates publications to maximize organic reach."
        },
        {
          question: "How does Ahau maintain each leader's authenticity?",
          answer: "Our AI system analyzes each leader's past publications to understand their tone, style, and unique personality. Then it generates content that maintains that authenticity while aligning with the company's strategic objectives."
        },
        {
          question: "Is it safe for my company?",
          answer: "Absolutely. Ahau is designed with 'tenant first', meaning each organization maintains total control over their data. We only collect the minimum necessary information and never share data between companies."
        },
        {
          question: "What is the Tone Trainer?",
          answer: "The Tone Trainer is an interactive tool that teaches your leaders to maintain consistency in their communication. It provides real-time feedback and personalized exercises to improve team alignment."
        },
        {
          question: "How long does it take to set up Ahau?",
          answer: "The complete setup process takes less than 10 minutes. It includes creating your tenant, inviting your team, defining brand objectives, and configuring target voice tones."
        },
        {
          question: "Can I try Ahau before committing?",
          answer: "Yes, we offer free early access for teams that join our waitlist. This allows you to try all features and see the impact before any commitment."
        },
        {
          question: "What metrics does Ahau provide?",
          answer: "Ahau provides essential metrics like team participation, content reach, message consistency, and content ROI. All designed to demonstrate the real impact of your leadership strategy."
        },
        {
          question: "Does Ahau integrate with other tools?",
          answer: "We currently focus on LinkedIn as the main platform, but we're working on integrations with other social networks and marketing tools. Future integrations will be announced to waitlist users."
        }
      ]
    },
    footer: {
      description: "Synchronize your leadership voices to amplify your brand on LinkedIn. Alignment without losing authenticity.",
      newsletter: {
        title: "Stay updated",
        description: "Receive the latest updates about Ahau, new features, and tips to maximize your LinkedIn leadership.",
        button: "Join the waitlist"
      },
      copyright: "© 2025 Ahau. Built with ❤️ by UayLabs."
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
