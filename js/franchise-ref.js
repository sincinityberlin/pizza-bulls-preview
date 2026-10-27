/* ==========================================================================
   Franchise-Seiten (Markup 1:1 nach pizzabulls.de): Einblend-Animation wie
   auf der Referenz. Elemente starten mit opacity-0 / translate-y-8 / scale-95
   und erhalten beim Sichtbarwerden opacity-100 / translate-y-0 / scale-100.
   Ohne IntersectionObserver oder bei "Bewegung reduzieren" sofort sichtbar.
   ========================================================================== */
(function () {
  'use strict';
  var wurzel = document.querySelector('.pbref');
  if (!wurzel) return;
  var TAUSCH = [['opacity-0', 'opacity-100'], ['translate-y-8', 'translate-y-0'], ['scale-95', 'scale-100']];
  var elemente = Array.prototype.slice.call(wurzel.querySelectorAll('.transition-all.opacity-0'));

  function zeigen(el) {
    TAUSCH.forEach(function (t) {
      if (el.classList.contains(t[0])) { el.classList.remove(t[0]); el.classList.add(t[1]); }
    });
  }

  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ruhig || !('IntersectionObserver' in window)) { elemente.forEach(zeigen); return; }

  var beobachter = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) {
      if (e.isIntersecting) { zeigen(e.target); beobachter.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  elemente.forEach(function (el) { beobachter.observe(el); });

  /* Sprungziel (#franchise-anfrage): Inhalte oberhalb sofort zeigen */
  window.addEventListener('load', function () {
    elemente.forEach(function (el) { if (el.getBoundingClientRect().bottom < window.innerHeight) zeigen(el); });
  });
})();
