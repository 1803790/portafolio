import lottie from 'lottie-web';

// Animación profesional (Lottie) del hero: desarrollador programando,
// recoloreada a la paleta ámbar/verde del sitio. El JSON vive en /public.

export function initHeroLottie(): void {
  const contenedor = document.getElementById('hero-lottie');
  if (!contenedor) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const anim = lottie.loadAnimation({
    container: contenedor,
    renderer: 'svg',
    loop: true,
    autoplay: !reduced,
    path: '/animacion-dev.json',
  });

  if (reduced) {
    anim.addEventListener('DOMLoaded', () => anim.goToAndStop(anim.totalFrames * 0.4, true));
    return;
  }

  // pausar cuando la pestaña no está visible (ahorra batería)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) anim.pause();
    else anim.play();
  });
}
