// Pizza Bulls — header burger menu + auto-looping pizza assembly animation

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------
  // Burger menu
  // ------------------------------------------------------------------
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ------------------------------------------------------------------
  // Pizza assembly animation — time-driven CSS loop, no scroll control.
  //
  // The motion itself lives entirely in the "pizzaCycle" @keyframes in
  // css/style.css (transform + opacity only, so it runs on the compositor
  // thread — smooth on mobile). Each of the 8 slices shares that one
  // keyframe and only differs by its own --ox/--oy/--rot (start direction)
  // and animation-delay (stagger), so this script has nothing to compute
  // frame by frame. Its only job: flip the section from "paused" to
  // "running" once, the first time it scrolls into view — after a short
  // pause, exactly like the reference — and from then on the loop keeps
  // playing by itself regardless of further scrolling.
  // ------------------------------------------------------------------
  const section = document.getElementById('pizzaBuild');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (section && prefersReduced) {
    section.classList.add('pizza-build--static');
  } else if (section && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => section.classList.add('is-playing'), 400);
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });
    observer.observe(section);
  } else if (section) {
    section.classList.add('is-playing');
  }
});
