import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initMotion(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    gsap.set('.nav, .hero__inner > *, .hero__scroll, [data-reveal]', { clearProps: 'all' });
    return;
  }

  // Scroll suave
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anclas internas con Lenis
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href')!);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -24 });
      }
    });
  });

  // Secuencia de entrada del hero
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero__valley', { opacity: 0, duration: 1.6, ease: 'none' }, 0)
    .from('.nav', { y: -16, opacity: 0, duration: 0.7 }, 0.2)
    .from('.hero .eyebrow', { y: 12, opacity: 0, duration: 0.6 }, 0.35)
    .from('.hero__title', { y: 22, opacity: 0, duration: 0.85 }, 0.45)
    .from('.hero__role, .hero__sub, .hero__actions', { y: 18, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.75)
    .from('.hero__avatar', { opacity: 0, scale: 0.94, duration: 0.9 }, 0.6)
    .from('.hero__scroll', { opacity: 0, duration: 0.8 }, 1.3);

  // Revelado por scroll
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 32,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}
