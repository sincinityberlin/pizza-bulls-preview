/* ==========================================================================
   KUNDENKONTO (Profil-Symbol im Header) – Nutzervorgabe 07.10.2026
   Nicht angemeldet: Fenster mit "Anmelden" / "Account erstellen" /
   "Passwort vergessen?". Angemeldet: kleines Konto-Menue (Mein Konto, Meine
   Daten, Meine Bestellungen, Meine Vorteile, Abmelden).

   BACKEND: Es ist KEIN Login-/Konto-System angeschlossen. Solange die
   Adressen unten leer sind, wird nichts gesendet und dem Nutzer ehrlich
   angezeigt, dass das Kundenkonto noch nicht freigeschaltet ist - es wird
   keine Anmeldung vorgetaeuscht.
   Anbindung: window.PB_KONTO_CONFIG VOR diesem Skript setzen (oder unten
   eintragen). Erwartete Schnittstellen (JSON, Sitzung per HttpOnly-Cookie,
   fetch mit credentials: "include"):
     anmelden           POST {email, passwort}              -> 200 {vorname, ...}
     registrieren       POST {vorname, nachname, email, passwort, datenschutz:true} -> 200/201 {vorname, ...}
     passwortVergessen  POST {email}                        -> 2xx (immer neutrale Meldung)
     sitzung            GET                                 -> 200 {vorname, ...} wenn angemeldet, sonst 401
     abmelden           POST                                -> 2xx
     seiten.{konto,daten,bestellungen,vorteile}: Ziel-URLs des Konto-Menues
   Passwoerter werden NIE gespeichert (kein localStorage/sessionStorage,
   Felder werden nach jedem Absenden geleert); Speicherung/Hashing ist
   Aufgabe des Servers.
   ========================================================================== */
(function () {
  var C = window.PB_KONTO_CONFIG || {};
  var CONFIG = {
    anmelden: C.anmelden || '',
    registrieren: C.registrieren || '',
    passwortVergessen: C.passwortVergessen || '',
    sitzung: C.sitzung || '',
    abmelden: C.abmelden || '',
    seiten: C.seiten || { konto: '', daten: '', bestellungen: '', vorteile: '' }
  };
  var NICHT_AKTIV = 'Das Kundenkonto ist noch nicht freigeschaltet. Es wurden keine Daten gesendet.';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var skript = document.currentScript;
  var basis = skript ? skript.src.replace(/js\/pb-konto\.js.*$/, '') : '';

  var rechts = document.querySelector('.site-header__right');
  if (!rechts) return;
  var profil = rechts.querySelector('a.site-header__icon-btn, .site-header__icon-btn:last-child');
  if (!profil) return;
  profil.setAttribute('href', '#konto');
  profil.setAttribute('role', 'button');
  profil.setAttribute('aria-label', 'Konto – anmelden oder registrieren');
  profil.setAttribute('aria-haspopup', 'dialog');
  rechts.classList.add('pb-header-tools');

  var nutzer = null;
  var letzterAusloeser = null;

  var AUGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  function feld(label, typ, name, auto, extra) {
    return '<label class="vip-modal__field"><span class="vip-modal__label">' + label + '</span>' +
      (typ === 'password'
        ? '<span class="pb-konto__pw"><input type="password" name="' + name + '" autocomplete="' + auto + '" required minlength="' + (extra || 0) + '" />' +
          '<button type="button" class="pb-konto__auge" data-pw-toggle aria-label="Passwort anzeigen" aria-pressed="false">' + AUGE + '</button></span>'
        : '<input type="' + typ + '" name="' + name + '" autocomplete="' + auto + '" required' + (typ === 'email' ? ' inputmode="email" maxlength="120"' : ' maxlength="60"') + ' />') +
      '</label>';
  }

  /* ---------------- Fenster ---------------- */
  var modal = document.createElement('div');
  modal.className = 'app-modal pb-konto';
  modal.id = 'pbKontoModal';
  modal.hidden = true;
  modal.innerHTML =
    '<div class="app-modal__backdrop" data-konto-close></div>' +
    '<div class="app-modal__box pb-konto__box" role="dialog" aria-modal="true" aria-labelledby="pbKontoTitel">' +
      '<button class="app-modal__close" type="button" aria-label="Schließen" data-konto-close>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<h2 class="pb-konto__titel" id="pbKontoTitel">Mein Pizza Bulls Konto</h2>' +
      '<div class="pb-konto__tabs" role="tablist">' +
        '<button type="button" role="tab" id="pbTabAnmelden" aria-controls="pbPanelAnmelden" aria-selected="true" data-konto-tab="anmelden">Anmelden</button>' +
        '<button type="button" role="tab" id="pbTabRegistrieren" aria-controls="pbPanelRegistrieren" aria-selected="false" tabindex="-1" data-konto-tab="registrieren">Account erstellen</button>' +
      '</div>' +

      '<div class="pb-konto__panel" id="pbPanelAnmelden" role="tabpanel" aria-labelledby="pbTabAnmelden">' +
        '<form class="vip-modal__form" data-konto-form="anmelden" novalidate>' +
          feld('E-Mail-Adresse', 'email', 'email', 'email') +
          feld('Passwort', 'password', 'passwort', 'current-password') +
          '<button type="button" class="pb-konto__link pb-konto__vergessen" data-konto-ansicht="vergessen">Passwort vergessen?</button>' +
          '<button class="vip-modal__btn" type="submit">Anmelden</button>' +
          '<p class="vip-modal__status" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<p class="pb-konto__wechsel"><span>Noch keinen Account?</span> <button type="button" class="pb-konto__link" data-konto-tab="registrieren">Jetzt registrieren</button></p>' +
      '</div>' +

      '<div class="pb-konto__panel" id="pbPanelRegistrieren" role="tabpanel" aria-labelledby="pbTabRegistrieren" hidden>' +
        '<form class="vip-modal__form" data-konto-form="registrieren" novalidate>' +
          '<div class="pb-konto__reihe">' + feld('Vorname', 'text', 'vorname', 'given-name') + feld('Nachname', 'text', 'nachname', 'family-name') + '</div>' +
          feld('E-Mail-Adresse', 'email', 'email', 'email') +
          feld('Passwort', 'password', 'passwort', 'new-password', 8) +
          '<p class="pb-konto__hinweis">Mindestens 8 Zeichen</p>' +
          feld('Passwort wiederholen', 'password', 'passwort2', 'new-password', 8) +
          '<label class="pb-konto__check"><input type="checkbox" name="datenschutz" required />' +
            '<span>Ich habe die <a href="' + basis + 'datenschutz.html">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu.</span></label>' +
          '<button class="vip-modal__btn" type="submit">Account erstellen</button>' +
          '<p class="vip-modal__status" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<p class="pb-konto__wechsel"><span>Schon registriert?</span> <button type="button" class="pb-konto__link" data-konto-tab="anmelden">Jetzt anmelden</button></p>' +
      '</div>' +

      '<div class="pb-konto__panel" id="pbPanelVergessen" hidden>' +
        '<h3 class="pb-konto__untertitel">Passwort zurücksetzen</h3>' +
        '<p class="pb-konto__text">Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.</p>' +
        '<form class="vip-modal__form" data-konto-form="vergessen" novalidate>' +
          feld('E-Mail-Adresse', 'email', 'email', 'email') +
          '<button class="vip-modal__btn" type="submit">Link anfordern</button>' +
          '<p class="vip-modal__status" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<p class="pb-konto__wechsel"><button type="button" class="pb-konto__link" data-konto-tab="anmelden">Zurück zur Anmeldung</button></p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var tabs = modal.querySelector('.pb-konto__tabs');
  var panels = {
    anmelden: modal.querySelector('#pbPanelAnmelden'),
    registrieren: modal.querySelector('#pbPanelRegistrieren'),
    vergessen: modal.querySelector('#pbPanelVergessen')
  };

  function zeige(ansicht) {
    Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== ansicht; });
    tabs.hidden = ansicht === 'vergessen';
    Array.prototype.forEach.call(tabs.querySelectorAll('[role="tab"]'), function (t) {
      var an = t.getAttribute('data-konto-tab') === ansicht;
      t.setAttribute('aria-selected', an ? 'true' : 'false');
      t.tabIndex = an ? 0 : -1;
    });
    Array.prototype.forEach.call(modal.querySelectorAll('.vip-modal__status'), function (s) { s.textContent = ''; s.className = 'vip-modal__status'; });
    Array.prototype.forEach.call(modal.querySelectorAll('.is-invalid'), function (f) { f.classList.remove('is-invalid'); });
    var erstes = panels[ansicht].querySelector('input');
    if (erstes && !modal.hidden) erstes.focus();
  }

  function oeffneFenster(ausloeser) {
    letzterAusloeser = ausloeser || null;
    document.dispatchEvent(new CustomEvent('pb-pop-oeffnen', { detail: 'konto' }));
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    zeige('anmelden');
  }
  function schliesseFenster() {
    modal.hidden = true;
    document.body.style.overflow = '';
    leerePasswoerter();
    if (letzterAusloeser) letzterAusloeser.focus();
    letzterAusloeser = null;
  }
  function leerePasswoerter() {
    Array.prototype.forEach.call(modal.querySelectorAll('input[type="password"], input[data-war-passwort]'), function (f) {
      f.value = '';
      if (f.hasAttribute('data-war-passwort')) { f.type = 'password'; f.removeAttribute('data-war-passwort'); }
    });
    Array.prototype.forEach.call(modal.querySelectorAll('[data-pw-toggle]'), function (b) {
      b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Passwort anzeigen');
    });
  }

  modal.addEventListener('click', function (e) {
    if (e.target.closest('[data-konto-close]')) { e.preventDefault(); schliesseFenster(); return; }
    var tab = e.target.closest('[data-konto-tab]');
    if (tab) { e.preventDefault(); zeige(tab.getAttribute('data-konto-tab')); return; }
    var ansicht = e.target.closest('[data-konto-ansicht]');
    if (ansicht) { e.preventDefault(); zeige(ansicht.getAttribute('data-konto-ansicht')); return; }
    var auge = e.target.closest('[data-pw-toggle]');
    if (auge) {
      var input = auge.parentNode.querySelector('input');
      var sichtbar = auge.getAttribute('aria-pressed') === 'true';
      if (sichtbar) { input.type = 'password'; input.removeAttribute('data-war-passwort'); }
      else { input.type = 'text'; input.setAttribute('data-war-passwort', ''); }
      auge.setAttribute('aria-pressed', sichtbar ? 'false' : 'true');
      auge.setAttribute('aria-label', sichtbar ? 'Passwort anzeigen' : 'Passwort verbergen');
    }
  });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var ziel = tabs.querySelector('[aria-selected="false"]');
    if (ziel) { zeige(ziel.getAttribute('data-konto-tab')); ziel.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) schliesseFenster();
  });
  modal.addEventListener('input', function (e) { if (e.target.matches('input')) e.target.classList.remove('is-invalid'); });

  /* ---------------- Formulare ---------------- */
  function meldung(form, text, art) {
    var s = form.querySelector('.vip-modal__status');
    s.textContent = text || '';
    s.className = 'vip-modal__status' + (art ? ' is-' + art : '');
  }
  function fehler(form, el, text) {
    el.classList.add('is-invalid');
    meldung(form, text, 'error');
    el.focus();
    return false;
  }
  function pruefe(form, art) {
    var f = form.elements;
    if (art === 'registrieren') {
      if (!f.vorname.value.trim()) return fehler(form, f.vorname, 'Bitte gib deinen Vornamen an.');
      if (!f.nachname.value.trim()) return fehler(form, f.nachname, 'Bitte gib deinen Nachnamen an.');
    }
    var mail = f.email.value.trim();
    if (!mail) return fehler(form, f.email, 'Bitte gib deine E-Mail-Adresse ein.');
    if (!EMAIL.test(mail)) return fehler(form, f.email, 'Bitte gib eine gültige E-Mail-Adresse ein.');
    if (art === 'anmelden' && !f.passwort.value) return fehler(form, f.passwort, 'Bitte gib dein Passwort ein.');
    if (art === 'registrieren') {
      if (f.passwort.value.length < 8) return fehler(form, f.passwort, 'Das Passwort muss mindestens 8 Zeichen lang sein.');
      if (f.passwort2.value !== f.passwort.value) return fehler(form, f.passwort2, 'Die Passwörter stimmen nicht überein.');
      if (!f.datenschutz.checked) return fehler(form, f.datenschutz, 'Bitte stimme der Datenschutzerklärung zu.');
    }
    return true;
  }
  function sende(url, daten) {
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(daten)
    });
  }

  modal.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-konto-form]');
    if (!form) return;
    e.preventDefault();
    var art = form.getAttribute('data-konto-form');
    if (!pruefe(form, art)) return;
    var f = form.elements;
    var url = art === 'anmelden' ? CONFIG.anmelden : art === 'registrieren' ? CONFIG.registrieren : CONFIG.passwortVergessen;
    if (!url) {
      meldung(form, NICHT_AKTIV, 'info');
      leerePasswoerter();
      return;
    }
    var daten = { email: f.email.value.trim() };
    if (art !== 'vergessen') daten.passwort = f.passwort.value;
    if (art === 'registrieren') { daten.vorname = f.vorname.value.trim(); daten.nachname = f.nachname.value.trim(); daten.datenschutz = true; }
    var knopf = form.querySelector('button[type="submit"]');
    knopf.disabled = true;
    meldung(form, 'Wird gesendet …', 'info');
    leerePasswoerter();
    sende(url, daten).then(function (antwort) {
      if (art === 'vergessen') {
        meldung(form, 'Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link gesendet.', 'success');
        return;
      }
      if (!antwort.ok) {
        meldung(form, art === 'anmelden' ? 'Anmeldung fehlgeschlagen. Bitte prüfe E-Mail-Adresse und Passwort.' : 'Das hat leider nicht geklappt. Bitte versuche es später noch einmal.', 'error');
        return;
      }
      return antwort.json().catch(function () { return {}; }).then(function (daten2) {
        angemeldet(daten2 || {});
        form.reset();
        schliesseFenster();
      });
    }).catch(function () {
      meldung(form, 'Das hat leider nicht geklappt. Bitte versuche es später noch einmal.', 'error');
    }).then(function () { knopf.disabled = false; });
  });

  /* ---------------- Angemeldet: Konto-Menue ---------------- */
  var menue = document.createElement('div');
  menue.className = 'pb-pop pb-konto-menue';
  menue.id = 'pbKontoMenue';
  menue.setAttribute('role', 'menu');
  menue.setAttribute('aria-label', 'Konto-Menü');
  menue.hidden = true;
  rechts.appendChild(menue);

  function baueKontoMenue() {
    var s = CONFIG.seiten;
    function eintrag(text, url) {
      return url
        ? '<a class="pb-pop__item" role="menuitem" href="' + url + '"><span>' + text + '</span></a>'
        : '<span class="pb-pop__item is-disabled" role="menuitem" aria-disabled="true"><span>' + text + '</span></span>';
    }
    menue.innerHTML =
      '<p class="pb-pop__kopf">Hallo, ' + String(nutzer.vorname || '').replace(/[&<>"]/g, '') + '</p>' +
      eintrag('Mein Konto', s.konto) + eintrag('Meine Daten', s.daten) +
      eintrag('Meine Bestellungen', s.bestellungen) + eintrag('Meine Vorteile', s.vorteile) +
      '<button type="button" class="pb-pop__item pb-pop__abmelden" role="menuitem" data-konto-abmelden><span>Abmelden</span></button>';
  }

  function angemeldet(daten) {
    nutzer = daten;
    profil.classList.add('is-angemeldet');
    profil.setAttribute('aria-label', 'Konto-Menü öffnen');
    profil.setAttribute('aria-haspopup', 'menu');
    profil.setAttribute('aria-controls', 'pbKontoMenue');
    profil.setAttribute('aria-expanded', 'false');
    baueKontoMenue();
  }
  function abgemeldet() {
    nutzer = null;
    menue.hidden = true;
    menue.innerHTML = '';
    profil.classList.remove('is-angemeldet');
    profil.setAttribute('aria-label', 'Konto – anmelden oder registrieren');
    profil.setAttribute('aria-haspopup', 'dialog');
    profil.removeAttribute('aria-controls');
    profil.removeAttribute('aria-expanded');
  }
  function schliesseMenue() {
    if (menue.hidden) return;
    menue.hidden = true;
    profil.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('pb-pop-oeffnen', function (e) { if (e.detail !== 'konto') schliesseMenue(); });

  profil.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!nutzer) { oeffneFenster(profil); return; }
    if (menue.hidden) {
      document.dispatchEvent(new CustomEvent('pb-pop-oeffnen', { detail: 'konto' }));
      menue.hidden = false;
      profil.setAttribute('aria-expanded', 'true');
      var erstes = menue.querySelector('a, button');
      if (erstes) erstes.focus();
    } else {
      schliesseMenue();
    }
  });
  menue.addEventListener('click', function (e) {
    if (!e.target.closest('[data-konto-abmelden]')) return;
    e.preventDefault();
    var fertig = function () { abgemeldet(); profil.focus(); };
    if (CONFIG.abmelden) {
      fetch(CONFIG.abmelden, { method: 'POST', credentials: 'include' }).then(fertig, fertig);
    } else {
      fertig();
    }
  });
  document.addEventListener('click', function (e) {
    if (!menue.hidden && !menue.contains(e.target) && !profil.contains(e.target)) schliesseMenue();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menue.hidden) { schliesseMenue(); profil.focus(); }
  });

  /* Sitzung beim Laden pruefen (Login bleibt ueber Unterseiten erhalten,
     sofern der Server ein Sitzungs-Cookie setzt). */
  if (CONFIG.sitzung) {
    fetch(CONFIG.sitzung, { credentials: 'include', headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) angemeldet(d); })
      .catch(function () { /* nicht angemeldet / nicht erreichbar */ });
  }
})();
