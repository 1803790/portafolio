# Portafolio — Santiago Orrego Castaño

Portafolio personal de Santiago Orrego Castaño, estudiante de desarrollo de
software en el **ITM** (Instituto Tecnológico Metropolitano, Medellín). Diseño
propio inspirado en el trabajo de [David Huculak](https://david-hckh.com)
(concepto y código construidos desde cero — no es un fork).

**Concepto visual**: Medellín de noche — fondo verde-carbón de montaña con luces
ámbar del valle que **reaccionan al cursor**, y una animación del hero en Lottie.

## Stack

- [Vite](https://vitejs.dev) + TypeScript (vanilla, sin framework)
- SCSS
- [GSAP](https://gsap.com) + ScrollTrigger — animaciones de entrada y por scroll
- [Lenis](https://lenis.darkroom.engineering) — scroll suave
- [lottie-web](https://airbnb.io/lottie/) — animación del hero
- i18n propio ES/EN (`src/i18n.ts`)
- Proyectos editables guardados en **IndexedDB** (`src/projects.ts`)

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo
npm run build     # build de producción (incluye typecheck)
npm run preview   # previsualizar el build
```

## Estructura

| Qué                                 | Dónde                    |
| ----------------------------------- | ------------------------ |
| Textos en ambos idiomas             | `src/i18n.ts`            |
| Estructura y secciones              | `index.html`            |
| Colores, tipografía, espaciado      | `src/styles/main.scss`   |
| Luces del valle (canvas del hero)   | `src/lights.ts`          |
| Animaciones de scroll               | `src/animations.ts`      |
| Animación Lottie del hero           | `src/hero-lottie.ts`     |
| Proyectos (agregar/editar/eliminar) | `src/projects.ts`        |
| Interruptor de edición              | `src/config.ts`          |

## Proyectos

Los proyectos se agregan desde la propia página con el **modo edición** activo
(botón «Agregar proyecto»). Se guardan en IndexedDB del navegador. Para dejar el
sitio de solo lectura, pon `EDITABLE = false` en `src/config.ts`.

## Flujo de trabajo con Git

Se usa un modelo de ramas sencillo:

- **`main`** — versión estable y desplegada (Vercel publica esta rama).
- **`develop`** — integración del trabajo en curso.
- **`feature/…`**, **`fix/…`** — una rama por cada cambio, se abre desde `develop`.

Ciclo típico:

```bash
git switch develop
git switch -c feature/mi-cambio   # nueva rama para el cambio
# ... trabajar y commitear ...
git switch develop
git merge --no-ff feature/mi-cambio
git branch -d feature/mi-cambio
```

Cuando `develop` está listo para publicar, se fusiona en `main` y se etiqueta la
versión (`v1.1.0`, etc.). El push a `main` dispara el despliegue en Vercel.

## Despliegue

Sitio estático: Vercel detecta Vite automáticamente
(build `npm run build`, salida `dist/`).
