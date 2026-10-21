/* ==========================================================================
   Pizza Bulls — Social-Media-Slider (Startseite, Bereich .home-social)
   - Endloslauf von rechts nach links (Karten werden 2x geklont, Position
     springt unsichtbar um genau eine Satzbreite zurueck -> keine Luecke)
   - Pause bei Maus-Hover, Tastatur-Fokus und waehrend manueller Bedienung
   - Manuell: Wischen (Touch), Trackpad/Shift-Mausrad (natives Scrollen),
     Ziehen mit der Maus (Klick danach wird unterdrueckt)
   - Videos spielen nur, solange sie sichtbar sind (IntersectionObserver)
   - prefers-reduced-motion: kein automatischer Lauf, Videos zeigen Standbild
   ========================================================================== */
(function () {
  'use strict';

  var slider = document.getElementById('homeSocialSlider');
  if (!slider) return;
  var track = slider.querySelector('.home-social__track');
  var originale = Array.prototype.slice.call(track.children);
  if (!originale.length) return;

  var KOPIEN = 2;              /* Original + 2 Klone: genug Vorlauf in beide Richtungen */
  var TEMPO = 40;              /* px pro Sekunde */
  var PAUSE_NACH_BEDIENUNG = 2500;
  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (var k = 0; k < KOPIEN; k++) {
    originale.forEach(function (li) {
      var klon = li.cloneNode(true);
      klon.setAttribute('aria-hidden', 'true');
      var a = klon.querySelector('a');
      if (a) a.setAttribute('tabindex', '-1');
      track.appendChild(klon);
    });
  }

  var satzBreite = 0;
  var pos = 0;                 /* eigene Gleitkomma-Position (scrollLeft rundet) */
  var gesetzt = -1;
  var hover = false, fokus = false, ziehen = false;
  var bedientBis = 0;
  var letzteZeit = 0;

  function messen() {
    var erstes = track.children[0];
    var ersterKlon = track.children[originale.length];
    satzBreite = ersterKlon.offsetLeft - erstes.offsetLeft;
  }

  function normieren() {
    if (satzBreite <= 0) return;
    while (pos < satzBreite) pos += satzBreite;
    while (pos >= satzBreite * 2) pos -= satzBreite;
  }

  function setzen() {
    normieren();
    gesetzt = Math.round(pos);
    slider.scrollLeft = gesetzt;
  }

  function start() {
    messen();
    pos = satzBreite;          /* mittlerer Satz -> nach links und rechts frei scrollbar */
    setzen();
  }

  /* Scrollen durch Nutzer (Wischen, Trackpad, Rad) uebernehmen */
  slider.addEventListener('scroll', function () {
    var sl = slider.scrollLeft;
    if (Math.abs(sl - gesetzt) <= 1) return;   /* eigene Bewegung */
    pos = sl;
    bedientBis = Date.now() + PAUSE_NACH_BEDIENUNG;
    if (pos < satzBreite || pos >= satzBreite * 2) setzen();
    else gesetzt = sl;
  }, { passive: true });

  slider.addEventListener('mouseenter', function () { hover = true; });
  slider.addEventListener('mouseleave', function () { hover = false; });
  slider.addEventListener('focusin', function () { fokus = true; });
  slider.addEventListener('focusout', function () { fokus = false; });
  slider.addEventListener('touchstart', function () { bedientBis = Date.now() + PAUSE_NACH_BEDIENUNG; }, { passive: true });

  /* Ziehen mit der Maus (nur Maus — Touch scrollt nativ) */
  var startX = 0, startPos = 0, bewegt = false;
  slider.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    ziehen = true; bewegt = false; startX = e.clientX; startPos = pos;
  });
  window.addEventListener('pointermove', function (e) {
    if (!ziehen) return;
    var dx = e.clientX - startX;
    if (!bewegt && Math.abs(dx) > 5) { bewegt = true; slider.classList.add('is-dragging'); }
    if (bewegt) { pos = startPos - dx; setzen(); e.preventDefault(); }
  });
  window.addEventListener('pointerup', function () {
    if (!ziehen) return;
    ziehen = false;
    bedientBis = Date.now() + PAUSE_NACH_BEDIENUNG;
    if (bewegt) setTimeout(function () { slider.classList.remove('is-dragging'); }, 0);
  });
  slider.addEventListener('click', function (e) { if (bewegt) { e.preventDefault(); bewegt = false; } }, true);
  slider.addEventListener('dragstart', function (e) { e.preventDefault(); });

  function schritt(zeit) {
    var dt = letzteZeit ? Math.min(zeit - letzteZeit, 100) : 0;
    letzteZeit = zeit;
    if (!ruhig && !hover && !fokus && !ziehen && Date.now() > bedientBis && satzBreite > 0) {
      pos += TEMPO * dt / 1000;
      setzen();
    }
    window.requestAnimationFrame(schritt);
  }

  /* Videos nur abspielen, wenn sichtbar */
  var videos = Array.prototype.slice.call(track.querySelectorAll('video'));
  function spielen(v) {
    if (ruhig) return;
    if (v.preload !== 'auto') v.preload = 'auto';
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  if ('IntersectionObserver' in window) {
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) spielen(e.target); else e.target.pause();
      });
    }, { root: slider, rootMargin: '0px 120px', threshold: 0.01 });
    var seite = new IntersectionObserver(function (eintraege) {
      var sichtbar = eintraege[0].isIntersecting;
      videos.forEach(function (v) { if (sichtbar) beobachter.observe(v); else { beobachter.unobserve(v); v.pause(); } });
    }, { rootMargin: '200px 0px' });
    seite.observe(slider);
  } else {
    videos.forEach(spielen);
  }

  window.addEventListener('resize', function () {
    var anteil = satzBreite ? (pos - satzBreite) / satzBreite : 0;
    messen();
    pos = satzBreite + anteil * satzBreite;
    setzen();
  });

  start();
  window.addEventListener('load', function () { var a = (pos - satzBreite) / (satzBreite || 1); messen(); pos = satzBreite * (1 + a); setzen(); });
  window.requestAnimationFrame(schritt);
})();
