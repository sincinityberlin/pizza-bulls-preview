/* ==========================================================================
   VIP-CLUB-POPUP (Nutzervorgabe 05.10.2026)
   "Jetzt registrieren" in der Pizza-Bulls-Club-Karte und der schwebende
   Banner "Neukunde? 10€ Rabatt" (.vip-teaser) -> Ansicht 1 (Angebot)
   -> "Erhalte jetzt 10€ Rabatt" -> Ansicht 2 (Formular Vorname + E-Mail)
   -> NUR nach erfolgreicher Anmeldung (Endpunkt antwortet 2xx): Ansicht 3
   (Erfolg: "10€ Rabatt", CODE BULLS mit Kopieren-Button, "Meinen Rabatt
   einloesen" -> https://www.pizzabulls.de/menu im selben Tab).
   Schliessen: X, "Nein, danke", Klick auf den abgedunkelten Hintergrund, ESC.

   Versand: Es ist noch KEIN Newsletter-/CRM-System angeschlossen. Sobald ein
   Endpunkt existiert, ihn in index.html am <form id="vipForm"> unter
   data-endpoint eintragen (POST, JSON {vorname, email, quelle}). Solange das
   Attribut leer ist, wird nichts gesendet und dem Nutzer ehrlich angezeigt,
   dass die Anmeldung noch nicht freigeschaltet ist - es wird kein Rabattcode
   vorgetaeuscht.
   ========================================================================== */
(function () {
  var modal = document.getElementById('vipModal');
  if (!modal) return;
  var form = document.getElementById('vipForm');
  var status = modal.querySelector('.vip-modal__status');
  var schritt1 = modal.querySelector('[data-vip-step="1"]');
  var schritt2 = modal.querySelector('[data-vip-step="2"]');
  var schritt3 = modal.querySelector('[data-vip-step="3"]');
  var box = modal.querySelector('.vip-modal__box');
  var letzterAusloeser = null;

  function zeigeSchritt(nr) {
    schritt1.hidden = nr !== 1;
    schritt2.hidden = nr !== 2;
    if (schritt3) schritt3.hidden = nr !== 3;
    /* Erfolgsansicht: gemeinsame Kopfzeilen ausblenden, Dialog-Titel umstellen */
    box.classList.toggle('is-success', nr === 3);
    box.setAttribute('aria-labelledby', nr === 3 ? 'vipSuccessTitle' : 'vipModalTitle');
  }

  /* Code in die Zwischenablage: Clipboard-API, sonst unsichtbares Textfeld */
  function kopieren(text) {
    function klassisch() {
      var feld = document.createElement('textarea');
      feld.value = text; feld.setAttribute('readonly', '');
      feld.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(feld); feld.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(feld);
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (!klassisch()) throw new Error('copy');
      });
    }
    return klassisch() ? Promise.resolve() : Promise.reject(new Error('copy'));
  }

  function meldung(text, art) {
    status.textContent = text || '';
    status.className = 'vip-modal__status' + (art ? ' is-' + art : '');
  }

  function oeffnen(ausloeser) {
    letzterAusloeser = ausloeser || null;
    zeigeSchritt(1);
    meldung('');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var x = modal.querySelector('.app-modal__close');
    if (x) x.focus();
  }

  function schliessen() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (letzterAusloeser) letzterAusloeser.focus();
    letzterAusloeser = null;
  }

  document.addEventListener('click', function (e) {
    var auf = e.target.closest('[data-vip-modal-open]');
    if (auf) { e.preventDefault(); oeffnen(auf); return; }
    if (modal.hidden) return;
    if (e.target.closest('[data-vip-modal-close]')) { e.preventDefault(); schliessen(); return; }
    var kopierKnopf = e.target.closest('[data-vip-copy]');
    if (kopierKnopf) {
      e.preventDefault();
      var code = kopierKnopf.getAttribute('data-vip-copy');
      var label = kopierKnopf.querySelector('[data-vip-copy-label]');
      var info = document.getElementById('vipCopyStatus');
      kopieren(code).then(function () {
        kopierKnopf.classList.add('is-copied');
        if (label) label.textContent = 'Kopiert!';
        if (info) info.textContent = 'Code ' + code + ' wurde kopiert.';
      }).catch(function () {
        if (info) info.textContent = 'Automatisches Kopieren nicht möglich – bitte den Code ' + code + ' abschreiben.';
      }).then(function () {
        clearTimeout(kopierKnopf._zurueck);
        kopierKnopf._zurueck = setTimeout(function () {
          kopierKnopf.classList.remove('is-copied');
          if (label) label.textContent = 'Kopieren';
          if (info) info.textContent = '';
        }, 2200);
      });
      return;
    }
    if (e.target.closest('[data-vip-weiter]')) {
      e.preventDefault();
      zeigeSchritt(2);
      var erstes = form.querySelector('input[name="vorname"]');
      if (erstes) erstes.focus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) schliessen();
  });

  /* Neukunden-Banner unten rechts: ganz am Seitenende ausblenden, sobald die
     Copyright-Zeile des Footers sichtbar ist - sonst wuerde er sie verdecken. */
  var teaser = document.querySelector('.vip-teaser');
  var fussZeile = document.querySelector('.pb-footer__bottom');
  if (teaser && fussZeile && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (eintraege) {
      teaser.classList.toggle('is-hidden', eintraege[0].isIntersecting);
    }).observe(fussZeile);
  }

  form.addEventListener('input', function (e) {
    if (e.target.matches('input')) e.target.classList.remove('is-invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var vorname = form.elements.vorname;
    var email = form.elements.email;
    vorname.value = vorname.value.trim();
    email.value = email.value.trim();

    var fehler = null;
    [vorname, email].forEach(function (feld) {
      var ok = feld.value !== '' && feld.checkValidity();
      feld.classList.toggle('is-invalid', !ok);
      if (!ok && !fehler) fehler = feld;
    });
    if (fehler) {
      meldung(fehler === email && email.value !== ''
        ? 'Bitte gib eine gültige E-Mail-Adresse ein.'
        : 'Bitte fülle Vorname und E-Mail aus.', 'error');
      fehler.focus();
      return;
    }

    var endpunkt = (form.getAttribute('data-endpoint') || '').trim();
    if (!endpunkt) {
      meldung('Die VIP-Anmeldung ist noch nicht freigeschaltet. Es wurden keine Daten gesendet und noch kein Rabattcode verschickt.', 'info');
      return;
    }

    var knopf = form.querySelector('button[type="submit"]');
    knopf.disabled = true;
    meldung('Wird gesendet …', 'info');
    fetch(endpunkt, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ vorname: vorname.value, email: email.value, quelle: 'vip-club' })
    }).then(function (antwort) {
      if (!antwort.ok) throw new Error('HTTP ' + antwort.status);
      /* Anmeldung bestaetigt -> Erfolgsansicht mit Code */
      form.reset();
      meldung('');
      zeigeSchritt(3);
      var einloesen = modal.querySelector('.vip-success__cta');
      if (einloesen) einloesen.focus();
    }).catch(function () {
      meldung('Das hat leider nicht geklappt. Bitte versuche es später noch einmal.', 'error');
    }).then(function () {
      knopf.disabled = false;
    });
  });
})();
