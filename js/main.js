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
  // Pizza assembly animation — time-driven CSS loop.
  //
  // The motion itself lives entirely in the "pizzaCycle" @keyframes in
  // css/style.css (transform + opacity only, so it runs on the compositor
  // thread — smooth on mobile). Each of the 5 real slices shares that one
  // keyframe and only differs by its own --slot-rot (final position) and
  // animation-delay (stagger), so this script has nothing to compute frame
  // by frame. Its job: flip the section from "paused" to "running" a short
  // moment after it scrolls into view, and flip it back to "paused" (and
  // restart cleanly from 0%, not mid-frame) each time the section leaves
  // and re-enters the viewport — so the loop always replays from the start
  // when scrolled back to, instead of being caught mid-cycle. The Club
  // piece itself is never part of this — it has no "pizza-slice" class and
  // stays permanently visible, unaffected by "is-playing".
  // ------------------------------------------------------------------
  const section = document.getElementById('pizzaBuild');
  const stage = document.getElementById('pizzaStage');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (section && prefersReduced) {
    section.classList.add('pizza-build--static');
  } else if (section && stage && 'IntersectionObserver' in window) {
    // Re-arms on every entry (no disconnect) so the loop replays cleanly
    // each time the section re-enters the viewport, instead of continuing
    // an independent background loop that can be caught mid-pause.
    let playTimer = null;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        clearTimeout(playTimer);
        if (entry.isIntersecting) {
          // Drop the class and force a reflow first, so the next add
          // restarts the CSS animation from 0% instead of resuming from
          // wherever it was paused.
          section.classList.remove('is-playing');
          void stage.offsetWidth;
          playTimer = setTimeout(() => section.classList.add('is-playing'), 400);
        } else {
          section.classList.remove('is-playing');
        }
      });
    }, { threshold: 0.35 });
    observer.observe(section);
  } else if (section) {
    section.classList.add('is-playing');
  }
});
