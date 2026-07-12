type Lang = 'es' | 'en';

const dict: Record<string, Record<Lang, string>> = {
  'nav.about': { es: 'Sobre mí', en: 'About' },
  'nav.projects': { es: 'Proyectos', en: 'Projects' },
  'nav.stack': { es: 'Stack', en: 'Stack' },
  'nav.contact': { es: 'Contacto', en: 'Contact' },

  'hero.eyebrow': { es: 'Medellín, Colombia', en: 'Medellín, Colombia' },
  'hero.role': {
    es: 'Estudiante de desarrollo de software · ITM',
    en: 'Software development student · ITM',
  },
  'hero.intro': {
    es: 'Este es mi portafolio. Aquí reúno los proyectos que construyo mientras me formo como desarrollador en el Instituto Tecnológico Metropolitano.',
    en: 'This is my portfolio. Here I gather the projects I build while training as a developer at Instituto Tecnológico Metropolitano.',
  },
  'hero.cta': { es: 'Ver proyectos', en: 'View projects' },
  'hero.cta2': { es: 'Escríbeme', en: 'Get in touch' },
  'hero.scroll': { es: 'desliza', en: 'scroll' },

  'about.eyebrow': { es: '~/sobre-mí', en: '~/about' },
  'about.title': { es: 'Sobre mí', en: 'About me' },
  'about.p': {
    es: 'Soy Santiago Orrego Castaño, estudiante de desarrollo de software en Medellín. Me gusta construir aplicaciones de principio a fin: entender el problema, escribir el código y verlo funcionando. Este espacio crece con cada proyecto que termino.',
    en: "I'm Santiago Orrego Castaño, a software development student in Medellín. I like building applications end to end: understanding the problem, writing the code and seeing it run. This space grows with every project I finish.",
  },

  'sec.projects.eyebrow': { es: '~/proyectos', en: '~/projects' },
  'sec.projects.title': { es: 'Proyectos', en: 'Projects' },
  'admin.modo': { es: 'Modo edición activo', en: 'Edit mode on' },
  'admin.exportar': { es: 'Exportar', en: 'Export' },
  'admin.agregar': { es: '＋ Agregar proyecto', en: '＋ Add project' },

  'sec.stack.eyebrow': { es: '~/stack', en: '~/stack' },
  'sec.stack.title': { es: 'Con qué construyo', en: 'What I build with' },
  'stack.col2': { es: 'Backend y datos', en: 'Backend & data' },
  'stack.col3': { es: 'Herramientas', en: 'Tools' },

  'sec.contact.eyebrow': { es: '~/contacto', en: '~/contact' },
  'sec.contact.title': { es: 'Hablemos', en: "Let's talk" },
  'contact.desc': {
    es: '¿Tienes una idea, una pregunta o una oportunidad? Escríbeme y te respondo pronto.',
    en: 'Got an idea, a question or an opportunity? Write me and I reply soon.',
  },

  'footer.made': { es: 'Hecho en Medellín · © 2026 Santiago Orrego', en: 'Made in Medellín · © 2026 Santiago Orrego' },
  'footer.credit': { es: 'Diseño inspirado en el trabajo de', en: 'Design inspired by the work of' },
};

const STORAGE_KEY = 'lang';

export function currentLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'en' ? 'en' : 'es';
}

export function applyLang(lang: Lang): void {
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n!;
    const entry = dict[key];
    if (entry) el.textContent = entry[lang];
  });

  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });
}

export function initI18n(): void {
  applyLang(currentLang());
  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang as Lang));
  });
}
