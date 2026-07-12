# Portafolio — Santiago

Portafolio personal de desarrollador full-stack. Diseño propio inspirado en el
trabajo de [David Huculak](https://david-hckh.com) (concepto y código construidos
desde cero — no es un fork).

**Concepto visual**: Medellín de noche — fondo verde-carbón de montaña y luces
ámbar del valle dibujadas en un canvas propio en el hero.

## Stack

- [Vite](https://vitejs.dev) + TypeScript (vanilla, sin framework)
- SCSS
- [GSAP](https://gsap.com) + ScrollTrigger — animaciones de entrada y por scroll
- [Lenis](https://lenis.darkroom.engineering) — scroll suave
- i18n propio ES/EN (diccionario en `src/i18n.ts`, persiste en localStorage)

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo
npm run build     # build de producción (incluye typecheck)
npm run preview   # previsualizar el build
```

## Dónde editar contenido

| Qué                                | Dónde                       |
| ---------------------------------- | --------------------------- |
| Textos en ambos idiomas            | `src/i18n.ts`               |
| Estructura y secciones             | `index.html`                |
| Colores, tipografía, espaciado     | `src/styles/main.scss` (variables en `:root`) |
| Luces del valle (canvas del hero)  | `src/lights.ts`             |
| Animaciones                        | `src/animations.ts`         |

## Agregar un proyecto nuevo

Duplica el bloque `<article class="featured">` en `index.html` (o convierte uno
de los `.slot` en tarjeta), agrega sus claves de texto en `src/i18n.ts` y listo.
