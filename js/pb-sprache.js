/* ==========================================================================
   SPRACHAUSWAHL (Globus-Symbol im Header) – Nutzervorgabe 07.10.2026
   Deutsch (Standard) · English · Türkçe. Die Seiten sind deutsch im HTML;
   bei EN/TR werden Texte, Buttons, Alt-Texte, aria-Beschriftungen,
   Platzhalter und der Seitentitel ueber das Woerterbuch js/i18n-dict.js
   ersetzt (wird nur bei Bedarf nachgeladen). Auch nachtraeglich per JS
   erzeugte Inhalte (Standortliste, Meldungen, Popups) werden ueber einen
   MutationObserver uebersetzt. Auswahl wird im Browser gespeichert
   (localStorage "pb-sprache") und gilt auf allen Unterseiten.

   Schluessel: Ein "Baustein" ist ein Element, das nur Text und Inline-Tags
   enthaelt; Schluessel = sein innerHTML OHNE Attribute (Leerraum
   zusammengefasst). Beim Ersetzen werden die Attribute (Links, Klassen)
   vom Original uebernommen - die Tag-Folge der Uebersetzung muss deshalb
   identisch sein. Sonst: einzelne Textknoten.
   Nicht uebersetzt: Rechtstexte (.legal, mit Hinweis), Google-Bewertungen,
   Filialnamen/Adressen, alte Gerichteliste (.menu-grid).
   ========================================================================== */
(function () {
  var SPRACHEN = [
    { code: 'de', name: 'Deutsch', flagge: '🇩🇪' },
    { code: 'en', name: 'English', flagge: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flagge: '🇹🇷' }
  ];
  var SPEICHER = 'pb-sprache';
  var INLINE = { A: 1, STRONG: 1, EM: 1, B: 1, I: 1, SPAN: 1, BR: 1, SMALL: 1, SUP: 1, SUB: 1, U: 1, MARK: 1, ABBR: 1, TIME: 1, BUTTON: 1 };
  var SKIP = 'script,style,svg,noscript,template,[data-i18n-skip],.legal,.menu-grid,' +
    '.location-card h3,.location-card__city,.location-card address,' +
    '.home-review__text,.home-review__author,.home-store__name,.home-store__city';
  var ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
  var BUCHSTABE = /[A-Za-zÄÖÜäöüß]/;

  var skript = document.currentScript;
  var basis = skript ? skript.src.replace(/pb-sprache\.js.*$/, '') : 'js/';
  var version = skript && /[?&]v=([^&]+)/.test(skript.src) ? RegExp.$1 : '';

  var aktuell = 'de';
  var aenderungen = [];
  var beobachter = null;
  var originalTitel = document.title;

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function lesen() { try { return localStorage.getItem(SPEICHER) || 'de'; } catch (e) { return 'de'; } }
  function speichern(c) { try { localStorage.setItem(SPEICHER, c); } catch (e) { /* privat/gesperrt */ } }
  function gueltig(c) { return SPRACHEN.some(function (s) { return s.code === c; }); }

  /* Nicht-deutsche Sprache gespeichert: Seite kurz unsichtbar halten, bis
     die Uebersetzung steht (verhindert ein Aufblitzen deutscher Texte). */
  var gespeichert = lesen();
  if (gespeichert !== 'de' && gueltig(gespeichert)) {
    document.documentElement.classList.add('pb-i18n-laedt');
    setTimeout(function () { document.documentElement.classList.remove('pb-i18n-laedt'); }, 1500);
  }

  function ladeWoerterbuch(fertig) {
    if (window.PB_I18N) { fertig(); return; }
    var s = document.createElement('script');
    s.src = basis + 'i18n-dict.js' + (version ? '?v=' + version : '');
    s.onload = fertig;
    s.onerror = fertig;
    document.head.appendChild(s);
  }

  function dekodiere(html) {
    if (html.indexOf('&') === -1) return html;
    var t = document.createElement('textarea');
    t.innerHTML = html;
    return t.value;
  }

  function suche(schluessel) {
    var d = window.PB_I18N;
    if (!d || aktuell === 'de' || !d[aktuell]) return null;
    var tabelle = d[aktuell];
    if (Object.prototype.hasOwnProperty.call(tabelle, schluessel)) return tabelle[schluessel];
    var muster = d.patterns || [];
    for (var i = 0; i < muster.length; i++) {
      var m = schluessel.match(new RegExp(muster[i].re));
      if (m) {
        var gruppenUebersetzen = !!muster[i].gruppen; /* nur z. B. "Heute: geschlossen" - nie Namen */
        return muster[i][aktuell].replace(/\$(\d)/g, function (_, n) {
          var g = m[+n];
          return gruppenUebersetzen && Object.prototype.hasOwnProperty.call(tabelle, g) ? tabelle[g] : g;
        });
      }
    }
    return null;
  }

  function nurInline(el) {
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3 || c.nodeType === 8) continue;
      if (c.nodeType !== 1 || !INLINE[c.tagName] || c.matches(SKIP) || !nurInline(c)) return false;
    }
    return true;
  }

  function schluesselVon(el) {
    var k = el.cloneNode(true);
    var alle = k.querySelectorAll('*');
    for (var i = 0; i < alle.length; i++) {
      while (alle[i].attributes.length) alle[i].removeAttribute(alle[i].attributes[0].name);
    }
    for (var c = k.firstChild; c;) { var n = c.nextSibling; if (c.nodeType === 8) k.removeChild(c); c = n; }
    return norm(k.innerHTML);
  }

  function setzeHtml(el, html) {
    var vorlage = document.createElement('template');
    vorlage.innerHTML = html;
    var alt = el.querySelectorAll('*');
    var neu = vorlage.content.querySelectorAll('*');
    if (alt.length !== neu.length) return false;
    for (var i = 0; i < alt.length; i++) if (alt[i].tagName !== neu[i].tagName) return false;
    for (var j = 0; j < alt.length; j++) {
      for (var a = 0; a < alt[j].attributes.length; a++) neu[j].setAttribute(alt[j].attributes[a].name, alt[j].attributes[a].value);
    }
    aenderungen.push({ typ: 'html', el: el, alt: el.innerHTML });
    el.innerHTML = '';
    el.appendChild(vorlage.content);
    return true;
  }

  function uebersetzeText(knoten) {
    var roh = knoten.nodeValue;
    var k = norm(roh);
    if (!k || !BUCHSTABE.test(k)) return;
    var t = suche(k);
    if (t == null) return;
    aenderungen.push({ typ: 'text', node: knoten, alt: roh });
    knoten.nodeValue = roh.match(/^\s*/)[0] + dekodiere(t) + roh.match(/\s*$/)[0];
  }

  function bearbeite(el) {
    if (el.nodeType !== 1 || el.matches(SKIP) || el.closest('[data-i18n-skip],.legal')) return;
    if (el !== document.body && nurInline(el) && BUCHSTABE.test(el.textContent)) {
      var t = suche(schluesselVon(el));
      if (t != null && setzeHtml(el, t)) return;
    }
    var kinder = Array.prototype.slice.call(el.childNodes);
    for (var i = 0; i < kinder.length; i++) {
      if (kinder[i].nodeType === 3) uebersetzeText(kinder[i]);
      else if (kinder[i].nodeType === 1) bearbeite(kinder[i]);
    }
  }

  function bearbeiteAttribute(wurzel) {
    var liste = [wurzel].concat(Array.prototype.slice.call(wurzel.querySelectorAll('[placeholder],[aria-label],[alt],[title]')));
    liste.forEach(function (el) {
      if (el.nodeType !== 1 || !el.getAttribute || el.closest('[data-i18n-skip],.legal')) return;
      ATTRS.forEach(function (name) {
        var wert = el.getAttribute(name);
        if (!wert || !BUCHSTABE.test(wert)) return;
        var t = suche(norm(wert));
        if (t == null) return;
        aenderungen.push({ typ: 'attr', el: el, name: name, alt: wert });
        el.setAttribute(name, dekodiere(t));
      });
    });
  }

  /* Rechtstexte bleiben deutsch - Hinweis oberhalb einblenden */
  function rechtsHinweis(an) {
    var legal = document.querySelector('.legal');
    var alt = document.getElementById('pbRechtsHinweis');
    if (alt) alt.parentNode.removeChild(alt);
    if (!an || !legal) return;
    var p = document.createElement('p');
    p.id = 'pbRechtsHinweis';
    p.className = 'pb-legal-hinweis';
    p.textContent = 'Diese Seite ist aus rechtlichen Gründen nur auf Deutsch verfügbar.';
    legal.parentNode.insertBefore(p, legal);
  }

  function zuruecksetzen() {
    for (var i = aenderungen.length - 1; i >= 0; i--) {
      var a = aenderungen[i];
      if (a.typ === 'html') a.el.innerHTML = a.alt;
      else if (a.typ === 'text') a.node.nodeValue = a.alt;
      else if (a.typ === 'attr') a.el.setAttribute(a.name, a.alt);
    }
    aenderungen = [];
    document.title = originalTitel;
    rechtsHinweis(false);
    if (beobachter) beobachter.takeRecords();
  }

  function vollerDurchlauf() {
    rechtsHinweis(true);
    bearbeite(document.body);
    bearbeiteAttribute(document.body);
    var t = suche(norm(originalTitel));
    if (t != null) document.title = dekodiere(t);
    if (beobachter) beobachter.takeRecords();
    document.documentElement.classList.remove('pb-i18n-laedt');
  }

  function beobachten() {
    if (!('MutationObserver' in window)) return;
    beobachter = new MutationObserver(function (eintraege) {
      if (aktuell === 'de' || !window.PB_I18N) return;
      var ziele = [];
      eintraege.forEach(function (e) {
        var z = e.type === 'characterData' ? e.target.parentNode : e.target;
        if (z && z.nodeType === 1 && ziele.indexOf(z) === -1) ziele.push(z);
      });
      ziele.forEach(function (z) {
        if (!document.contains(z)) return;
        bearbeite(z);
        bearbeiteAttribute(z);
      });
      beobachter.takeRecords();
    });
    beobachter.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  /* ---------------- Auswahlmenue am Globus-Symbol ---------------- */
  var menue = null, globus = null;

  function baueMenue() {
    var rechts = document.querySelector('.site-header__right');
    if (!rechts) return;
    globus = rechts.querySelector('button.site-header__icon-btn');
    if (!globus) return;
    globus.setAttribute('aria-label', 'Sprache wählen');
    globus.setAttribute('aria-haspopup', 'true');
    globus.setAttribute('aria-expanded', 'false');
    globus.setAttribute('aria-controls', 'pbSprachMenue');
    rechts.classList.add('pb-header-tools');

    menue = document.createElement('div');
    menue.className = 'pb-pop pb-sprache';
    menue.id = 'pbSprachMenue';
    menue.setAttribute('role', 'menu');
    menue.setAttribute('data-i18n-skip', '');
    menue.hidden = true;
    SPRACHEN.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pb-pop__item';
      b.setAttribute('role', 'menuitemradio');
      b.setAttribute('lang', s.code);
      b.setAttribute('data-sprache', s.code);
      b.innerHTML = '<span class="pb-pop__flagge" aria-hidden="true">' + s.flagge + '</span><span>' + s.name + '</span>' +
        '<svg class="pb-pop__haken" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
      menue.appendChild(b);
    });
    rechts.appendChild(menue);
    markiere();

    globus.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menue.hidden) oeffne(); else schliesse();
    });
    menue.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sprache]');
      if (!b) return;
      setze(b.getAttribute('data-sprache'));
      schliesse();
      globus.focus();
    });
    menue.addEventListener('keydown', function (e) {
      var items = Array.prototype.slice.call(menue.querySelectorAll('[data-sprache]'));
      var i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!menue.hidden && !menue.contains(e.target) && e.target !== globus) schliesse();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menue.hidden) { schliesse(); globus.focus(); }
    });
  }

  function oeffne() {
    document.dispatchEvent(new CustomEvent('pb-pop-oeffnen', { detail: 'sprache' }));
    menue.hidden = false;
    globus.setAttribute('aria-expanded', 'true');
    var aktiv = menue.querySelector('[aria-checked="true"]');
    if (aktiv) aktiv.focus();
  }
  function schliesse() {
    if (!menue) return;
    menue.hidden = true;
    globus.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('pb-pop-oeffnen', function (e) { if (e.detail !== 'sprache') schliesse(); });

  function markiere() {
    if (!menue) return;
    Array.prototype.forEach.call(menue.querySelectorAll('[data-sprache]'), function (b) {
      b.setAttribute('aria-checked', b.getAttribute('data-sprache') === aktuell ? 'true' : 'false');
    });
  }

  function setze(code) {
    if (!gueltig(code)) code = 'de';
    speichern(code);
    if (code === aktuell) return;
    zuruecksetzen();
    aktuell = code;
    document.documentElement.lang = code;
    markiere();
    if (code === 'de') { document.documentElement.classList.remove('pb-i18n-laedt'); return; }
    ladeWoerterbuch(function () { if (aktuell === code) vollerDurchlauf(); });
  }

  /* Oeffentliche Hilfsfunktion (z. B. fuer Tests): window.pbSprache('en') */
  window.pbSprache = setze;

  baueMenue();
  beobachten();
  if (gespeichert !== 'de' && gueltig(gespeichert)) setze(gespeichert);
})();
