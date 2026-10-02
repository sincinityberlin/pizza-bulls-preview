/* ==========================================================================
   FRANCHISE-ANFRAGE — Validierung + Bestätigungsansicht auf derselben Seite.
   Der Nutzer verlässt die Website nicht. Ist im Formular ein data-endpoint
   gesetzt (z. B. Formular-Dienst oder eigener Server), werden die Daten per
   fetch() dorthin geschickt; ohne Endpunkt (aktueller Stand auf GitHub Pages)
   wird nichts übertragen und direkt die Bestätigung angezeigt.
   ========================================================================== */
(function(){
  var form = document.getElementById('franchiseForm');
  var confirmBox = document.getElementById('franchiseConfirm');
  if (!form || !confirmBox) return;

  var status = form.querySelector('.fr-form__status');
  var submit = form.querySelector('.fr-form__submit');
  var LABELS = { eigenkapital: 'Eigenkapital', erfahrung: 'Gastro-Erfahrung', telefon: 'Telefon' };

  function fieldOf(el){ return el.closest('.fr-field'); }

  function validate(el){
    var ok = el.checkValidity();
    var field = fieldOf(el);
    if (field) field.classList.toggle('is-invalid', !ok);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function(el){
    el.addEventListener('blur', function(){ if (el.value || el.type === 'checkbox') validate(el); });
    el.addEventListener('input', function(){ if (fieldOf(el) && fieldOf(el).classList.contains('is-invalid')) validate(el); });
    el.addEventListener('change', function(){ if (el.type === 'checkbox') validate(el); });
  });

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function showConfirmation(data){
    confirmBox.querySelector('.fr-confirm__name').textContent = data.vorname;
    confirmBox.querySelector('.fr-confirm__ort').textContent = data.standort;
    confirmBox.querySelector('.fr-confirm__mail').textContent = data.email;
    var rows = [['Name', data.vorname + ' ' + data.nachname], ['E-Mail', data.email], ['Telefon', data.telefon], ['Wunschstandort', data.standort]];
    if (data.eigenkapital) rows.push([LABELS.eigenkapital, data.eigenkapital]);
    if (data.erfahrung) rows.push([LABELS.erfahrung, data.erfahrung]);
    confirmBox.querySelector('.fr-confirm__summary').innerHTML = '<dl>' + rows.map(function(r){
      return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
    }).join('') + '</dl>';
    form.hidden = true;
    confirmBox.hidden = false;
    confirmBox.focus();
    confirmBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    status.textContent = '';
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
    var firstInvalid = null;
    fields.forEach(function(el){ if (!validate(el) && !firstInvalid) firstInvalid = el; });
    if (firstInvalid){
      status.textContent = 'Bitte prüfe die markierten Felder.';
      firstInvalid.focus();
      return;
    }

    var data = {};
    new FormData(form).forEach(function(v, k){ data[k] = typeof v === 'string' ? v.trim() : v; });

    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint){ showConfirmation(data); return; }

    submit.disabled = true;
    submit.textContent = 'Wird gesendet …';
    fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
      .then(function(res){ if (!res.ok) throw new Error(res.status); showConfirmation(data); })
      .catch(function(){
        status.textContent = 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es in Kürze erneut.';
        submit.disabled = false;
        submit.textContent = 'Anfrage absenden';
      });
  });
})();
