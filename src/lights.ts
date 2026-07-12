// Las luces del valle: puntos ámbar que dibujan las laderas de Medellín de noche
// y REACCIONAN al cursor — las cercanas se encienden, crecen y se apartan,
// volviendo a su sitio con un resorte suave.

interface Light {
  hx: number; // posición "hogar"
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
  color: string;
}

const COLORS = ['#ffb35c', '#ffd9a0', '#ff8f4d', '#e8c98f'];
const RADIO = 130; // radio de influencia del cursor (px css)

export function initValley(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const ctx: CanvasRenderingContext2D = context;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  let lights: Light[] = [];
  let raf = 0;
  const mouse = { x: -9999, y: -9999 };

  // Borde superior de la franja de luces: campana centrada (laderas en los bordes).
  function ridge(t: number): number {
    const bell = Math.exp(-((t - 0.5) ** 2) / (2 * 0.22 ** 2));
    return 0.38 + 0.42 * bell;
  }

  function seed(): void {
    lights = [];
    const count = Math.floor(w / 4);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const top = ridge(t);
      const depth = Math.pow(Math.random(), 0.55); // sesgo hacia el fondo del valle
      const x = t * w;
      const y = (top + (0.97 - top) * depth) * h;
      lights.push({
        hx: x,
        hy: y,
        x,
        y,
        vx: 0,
        vy: 0,
        r: 0.6 + Math.random() * 1.5,
        base: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }

  function frame(time: number): void {
    ctx.clearRect(0, 0, w, h);

    for (const l of lights) {
      // resorte de vuelta a casa
      l.vx += (l.hx - l.x) * 0.03;
      l.vy += (l.hy - l.y) * 0.03;

      // influencia del cursor: empuje + realce
      let boost = 0;
      const dx = l.x - mouse.x;
      const dy = l.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < RADIO * RADIO) {
        const d = Math.sqrt(d2) || 0.001;
        const f = (RADIO - d) / RADIO;
        l.vx += (dx / d) * f * 1.7;
        l.vy += (dy / d) * f * 1.7;
        boost = f;
      }

      l.vx *= 0.88;
      l.vy *= 0.88;
      l.x += l.vx;
      l.y += l.vy;

      const twinkle = reduced ? 1 : 0.7 + 0.3 * Math.sin(l.phase + time * 0.001 * l.speed);
      const radio = l.r * (1 + boost * 1.8);
      const alpha = Math.min(1, l.base * twinkle + boost * 0.7);

      // halo al encenderse cerca del cursor
      if (boost > 0.15) {
        ctx.globalAlpha = boost * 0.28;
        ctx.fillStyle = '#ffd9a0';
        ctx.beginPath();
        ctx.arc(l.x, l.y, radio * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = boost > 0.35 ? '#ffd9a0' : l.color;
      ctx.beginPath();
      ctx.arc(l.x, l.y, radio, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function drawStatic(): void {
    ctx.clearRect(0, 0, w, h);
    for (const l of lights) {
      ctx.globalAlpha = l.base;
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.arc(l.hx, l.hy, l.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function resize(): void {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduced) drawStatic();
  }

  resize();
  window.addEventListener('resize', resize);

  if (reduced) return;

  // el cursor se mide en coordenadas del canvas
  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('pointerleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(frame);
  });
}
