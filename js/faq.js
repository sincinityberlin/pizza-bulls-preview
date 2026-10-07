/* ==========================================================================
   FAQ-SEITE (Nutzervorgabe 07.10.2026): Akkordeons fuer Kategorien und
   Fragen. Klick auf die Zeile klappt weich auf bzw. wieder zu (Animation per
   CSS ueber grid-template-rows). aria-expanded wird mitgefuehrt.
   Erst wenn dieses Skript laeuft, bekommt .faq-list die Klasse "is-ready" -
   ohne JavaScript bleiben alle Antworten sichtbar.
   ========================================================================== */
(function () {
  var liste = document.querySelector('.faq-list');
  if (!liste) return;
  liste.classList.add('is-ready');

  liste.addEventListener('click', function (e) {
    var knopf = e.target.closest('.faq-toggle');
    if (!knopf || !liste.contains(knopf)) return;
    var panel = document.getElementById(knopf.getAttribute('aria-controls'));
    if (!panel) return;
    var offen = knopf.getAttribute('aria-expanded') === 'true';
    knopf.setAttribute('aria-expanded', offen ? 'false' : 'true');
    panel.classList.toggle('is-open', !offen);
  });
})();
