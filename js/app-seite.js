/* ==========================================================================
   APP-SEITE (Nutzervorgabe 05.10.2026): Gutscheincode BULLS per Klick
   kopieren. Jeder [data-copy-btn] kopiert den Code aus dem naechsten
   [data-copy-code] (oder seinem eigenen Attribut). Rueckmeldung im Button
   ("Kopiert!") und fuer Screenreader im zugehoerigen role="status".
   Rueckfall (keine oder abgelehnte Clipboard-API): unsichtbares Textfeld +
   execCommand('copy'); klappt auch das nicht, wird der Code markiert und
   der Button zeigt "Code markiert".
   ========================================================================== */
(function () {
  /* Klassischer Weg ueber ein unsichtbares Textfeld (auch als Rueckfall,
     wenn der Browser die Clipboard-API ablehnt, z. B. in eingebetteten Ansichten). */
  function kopierenKlassisch(text) {
    var feld = document.createElement('textarea');
    feld.value = text;
    feld.setAttribute('readonly', '');
    feld.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(feld);
    feld.select();
    var geklappt = false;
    try { geklappt = document.execCommand('copy'); } catch (e) { geklappt = false; }
    document.body.removeChild(feld);
    return geklappt;
  }

  function kopieren(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (!kopierenKlassisch(text)) throw new Error('copy');
      });
    }
    return kopierenKlassisch(text) ? Promise.resolve() : Promise.reject(new Error('copy'));
  }

  document.addEventListener('click', function (e) {
    var knopf = e.target.closest('[data-copy-btn]');
    if (!knopf) return;
    var quelle = knopf.hasAttribute('data-copy-code') ? knopf : knopf.closest('[data-copy-code]');
    var code = quelle ? quelle.getAttribute('data-copy-code') : 'BULLS';
    var label = knopf.querySelector('[data-copy-label]');
    var status = document.getElementById(knopf.getAttribute('aria-describedby'));
    var alterText = label ? label.getAttribute('data-original') || label.textContent : '';
    if (label && !label.getAttribute('data-original')) label.setAttribute('data-original', alterText);

    kopieren(code).then(function () {
      knopf.classList.add('is-copied');
      if (label) label.textContent = 'Kopiert!';
      if (status) status.textContent = 'Code ' + code + ' wurde kopiert.';
    }).catch(function () {
      var wert = (quelle && quelle.querySelector('.app-code__value')) ||
                 (knopf.closest('.app-step') && knopf.closest('.app-step').querySelector('.app-step__code'));
      if (wert && window.getSelection) {
        var bereich = document.createRange();
        bereich.selectNodeContents(wert);
        var auswahl = window.getSelection();
        auswahl.removeAllRanges();
        auswahl.addRange(bereich);
      }
      if (label) label.textContent = 'Code markiert';
      if (status) status.textContent = 'Automatisches Kopieren nicht möglich – der Code ' + code + ' ist markiert und kann mit Strg/Cmd + C kopiert werden.';
    }).then(function () {
      clearTimeout(knopf._zuruecksetzen);
      knopf._zuruecksetzen = setTimeout(function () {
        knopf.classList.remove('is-copied');
        if (label) label.textContent = label.getAttribute('data-original');
        if (status) status.textContent = '';
      }, 2200);
    });
  });
})();
