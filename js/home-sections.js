/* ==========================================================================
   STARTSEITE — Standorte (Liste + Deutschlandkarte) und Bewertungs-Slider
   Nur von index.html/artifact.html geladen. js/main.js bleibt unverändert.

   Filialdaten 1:1 aus den offiziellen Daten von pizzabulls.de übernommen
   (Name, Adresse, Telefon, Koordinaten, Öffnungszeiten, Bestell-Slug).
   Öffnungszeiten im Google-Places-Format: [Tag auf, Std, Min, Tag zu, Std, Min],
   Tag 0 = Sonntag, Zeiten in deutscher Zeit (Europe/Berlin).
   Karte: Leaflet + OpenStreetMap-Kacheln statt Google Maps —
   der Google-Maps-Schlüssel der Originalseite ist an deren Domain gebunden.
   ========================================================================== */
(function(){
  var STORES = 
[
  {"name":"Pizza & Burger Bulls Schöneberg","city":"Berlin","address":"Hohenstaufenstraße 40","zip":"10779","lat":52.4941643,"lon":13.3380238,"phone":"+49 30 23636699","slug":"pizzaburgerbullsschoneberg","hours":[[0,11,0,1,2,0],[1,11,0,2,2,0],[2,11,0,3,2,0],[3,11,0,4,2,0],[4,11,0,5,2,0],[5,11,0,6,2,0],[6,11,0,0,2,0]]},
  {"name":"Pizza & Burger Bulls Marzahn","city":"Berlin","address":"Allee der Kosmonauten 151C","zip":"12685","lat":52.53427,"lon":13.5515,"phone":"+49 30 28707690","slug":"pizzaburgerbullsmarzahn","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza&Burger Bulls Falkenberg","city":"Berlin","address":"Dorfstraße","zip":"13057","lat":52.5694936,"lon":13.5390914,"phone":"+49 30 93669333","slug":"pizzaburgerbullsfalkenberg","hours":[[0,11,0,0,22,30],[1,11,0,1,22,30],[2,11,0,2,22,30],[3,11,0,3,22,30],[4,11,0,4,22,30],[5,11,0,5,22,30],[6,11,0,6,22,30]]},
  {"name":"Pizza & Burger Bulls Velbert","city":"Velbert","address":"Heidestraße 139","zip":"42549","lat":51.3315836,"lon":7.0351269,"phone":"+49 2051 8074000","slug":"pizzaburgerbullsvelbert","hours":[[0,11,0,1,1,0],[1,11,0,2,1,0],[2,11,0,3,1,0],[3,11,0,4,1,0],[4,11,0,5,1,0],[5,1,0,5,2,0],[5,11,0,6,2,0],[5,11,0,6,2,0],[5,11,0,6,2,0],[5,11,0,6,2,0],[6,1,0,6,2,0],[6,11,0,0,2,0],[6,11,0,0,2,0],[6,11,0,0,2,0],[6,11,0,0,2,0]]},
  {"name":"Pizza & Burger Bulls Hameln","city":"Hameln","address":"Emmernstraße 30","zip":"31785","lat":52.1066831,"lon":9.3580408,"phone":"+49 5151 8099755","slug":"pizzaburgerbullshameln","hours":[[0,11,0,0,22,0],[0,11,0,1,10,0],[0,11,0,1,10,0],[0,11,0,0,22,0],[0,11,0,0,22,0],[0,11,0,0,22,0],[0,11,0,0,22,0],[1,11,0,1,22,0],[1,11,0,2,10,0],[1,11,0,2,10,0],[1,11,0,1,22,0],[1,11,0,1,22,0],[1,11,0,1,22,0],[1,11,0,1,22,0],[2,11,0,2,22,0],[2,11,0,3,10,0],[2,11,0,3,10,0],[2,11,0,2,22,0],[2,11,0,2,22,0],[2,11,0,2,22,0],[2,11,0,2,22,0],[3,11,0,3,22,0],[3,11,0,4,10,0],[3,11,0,4,10,0],[3,11,0,3,22,0],[3,11,0,3,22,0],[3,11,0,3,22,0],[3,11,0,3,22,0],[4,11,0,4,22,0],[4,11,0,5,10,0],[4,11,0,5,10,0],[4,11,0,4,22,0],[4,11,0,4,22,0],[4,11,0,4,22,0],[4,11,0,4,22,0]]},
  {"name":"Pizza & Burger Bulls Lemgo","city":"Lemgo","address":"Hamelner Straße 31","zip":"32657","lat":52.02631,"lon":8.91659,"phone":"+49 5261 7777309","slug":"pizzaburgerbullslemgo","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Saarbrücken","city":"Saarbrücken","address":"Trierer Straße 52","zip":"66111","lat":49.2409535,"lon":6.984432,"phone":"+49 681 94886266","slug":"pizzaburgerbullssaarbrucken","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Löhne","city":"Löhne","address":"Koblenzer Straße 128","zip":"32584","lat":52.1908795,"lon":8.767919,"phone":"+49 5731 4998599","slug":"pizzaburgerbullslohne","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Weißensee","city":"Berlin","address":"Langhansstraße 135","zip":"13086","lat":52.550035,"lon":13.445586,"phone":"+49 30 32896642","slug":"pizzaburgerbullsweissensee","hours":[[0,12,0,1,0,0],[1,12,0,2,0,0],[2,12,0,3,0,0],[3,12,0,4,0,0],[4,12,0,5,0,0],[5,12,0,6,0,0],[6,12,0,0,0,0]]},
  {"name":"Pizza & Burger Bulls Zossen","city":"Zossen","address":"Baruther Straße 12","zip":"15806","lat":52.214626,"lon":13.4523104,"phone":"+49 3377 3819797","slug":"pizzaburgerbullszossen","hours":[[0,11,0,0,22,0],[1,11,0,1,22,0],[2,11,0,2,22,0],[3,11,0,3,22,0],[4,11,0,4,22,0],[5,11,0,5,22,0],[6,11,0,6,22,0]]},
  {"name":"Pizza & Burger Bulls Hannover Bothfeld","city":"Hannover","address":"Leipziger Str. 116","zip":"30179","lat":52.4171394,"lon":9.7603223,"phone":"+49 511 84877700","slug":"pizzaburgerbullshannoverbothfeld","hours":[[0,12,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,15,0,6,2,30],[6,15,0,0,2,30]]},
  {"name":"Pizza & Burger Bulls Kleefeld Hannover","city":"Hannover","address":"Kirchröder Str. 94","zip":"30625","lat":52.3721741,"lon":9.7884812,"phone":"+49 511 90887799","slug":"pizzaburgerbullskleefeldhannover","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Niederschönweide","city":"Berlin","address":"Fennstraße 24","zip":"12439","lat":52.4544029,"lon":13.5169938,"phone":"+49 30 81302827","slug":"pizzaburgerbullsniederschonweide","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Spandau","city":"Berlin","address":"Wittgensteiner Weg 21","zip":"13583","lat":52.5446217,"lon":13.1824192,"phone":"+49 30 92900860","slug":"pizzaburgerbullsspandau","hours":[[0,14,0,1,2,0],[1,14,0,2,2,0],[2,14,0,3,2,0],[3,14,0,4,2,0],[4,14,0,5,2,0],[5,14,0,6,2,0],[6,14,0,0,2,0]]},
  {"name":"Pizza & Burger Bulls Königs Wusterhausen","city":"Königs Wusterhausen","address":"Goethestraße 55D","zip":"15711","lat":52.291385,"lon":13.6232135,"phone":"+49 3375 9211188","slug":"pizzaburgerbullskonigswusterhausen","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Hellersdorf","city":"Berlin","address":"Hönower Str. 65","zip":"12623","lat":52.5102455,"lon":13.6125964,"phone":"+49 15563 966925","slug":"pizzaburgerbullshellersdorf","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Zehlendorf","city":"Berlin","address":"Teltower Damm 266","zip":"14167","lat":52.4106043,"lon":13.26614,"phone":"+49 30 81490949","slug":"pizzabullszehlendorf","hours":[[0,11,0,0,21,30],[1,11,0,1,21,30],[2,11,0,2,21,30],[3,11,0,3,21,30],[4,11,0,4,21,30],[5,11,0,5,21,30],[6,11,0,6,21,30]]},
  {"name":"Pizza & Burger Bulls Panketal","city":"Panketal","address":"Alt Zepernick 6","zip":"16341","lat":52.6522318,"lon":13.5422112,"phone":"+49 30 94392939","slug":"pizzaburgerbullspanketal","hours":[[0,11,0,0,21,45],[1,11,0,1,21,45],[2,11,0,2,21,45],[3,11,0,3,21,45],[4,11,0,4,21,45],[5,11,0,5,21,45],[6,11,0,6,21,45]]},
  {"name":"Pizza & Burger Bulls Lankwitz","city":"Berlin","address":"Kaiser-Wilhelm-Straße 38","zip":"12247","lat":52.432703,"lon":13.3390493,"phone":"+49 30 77206767","slug":"pizzaburgerbullslankwitz","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Lichtenberg","city":"Berlin","address":"Josef-Orlopp-Straße 53","zip":"10365","lat":52.5232586,"lon":13.489554,"phone":"+49 30 55153030","slug":"pizzaburgerbullslichtenberg","hours":[[0,16,0,1,2,0],[1,10,30,2,1,30],[1,16,0,2,2,0],[2,10,30,3,1,30],[2,16,0,3,2,0],[3,10,30,4,1,30],[3,16,0,4,2,0],[4,16,0,5,2,0],[5,16,0,6,2,0],[6,16,0,0,2,0]]},
  {"name":"Pizza & Burger Bulls Hannover Laatzen","city":"Laatzen","address":"Hildesheimer Straße 40A","zip":"30880","lat":52.3176388,"lon":9.7884064,"phone":"+49 511 72713783","slug":"pizzaburgerbullshannoverlaatzen","hours":[[0,12,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,6,0,0],[6,15,0,0,0,0]]},
  {"name":"Pizza & Burger Bulls Rinteln","city":"Rinteln","address":"Mühlenstraße 10","zip":"31737","lat":52.1892737,"lon":9.0824676,"phone":"+49 173 5228188","slug":"pizzaburgerbullsrinteln","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Bad Kreuznach","city":"Bad Kreuznach","address":"Bosenheimer Straße 130","zip":"55543","lat":49.8447234,"lon":7.8787386,"phone":"+49 671 97099849","slug":"pizzaburgerbulls","hours":[[0,14,0,0,22,0],[1,14,0,1,22,0],[2,14,0,2,22,0],[3,14,0,3,22,0],[4,14,0,4,22,0],[5,14,0,5,22,0],[6,14,0,6,22,0]]},
  {"name":"Pizza Burger Bulls Bielefeld","city":"Bielefeld","address":"Gustav-Freytag-Straße 20","zip":"33613","lat":52.0389192,"lon":8.5155842,"phone":"+49 176 20458265","slug":"pizzaburgerbullsbielefeld","hours":[[0,11,0,0,23,0],[1,11,0,1,23,0],[2,11,0,2,23,0],[3,11,0,3,23,0],[4,11,0,4,23,0],[5,11,0,5,23,0],[6,11,0,6,23,0]]},
  {"name":"Pizza & Burger Bulls Krefeld","city":"Krefeld","address":"Uerdinger Straße 713","zip":"47800","lat":51.3490215,"lon":6.6265035,"phone":"+49 2151 477855","slug":"pizzaburgerbullskrefeld","hours":[[0,11,0,1,1,0],[1,11,0,2,1,0],[2,11,0,3,1,0],[3,11,0,4,1,0],[4,11,0,5,1,0],[5,11,0,6,1,0],[6,11,0,0,1,0]]},
  {"name":"Pizza & Burger Bulls Sulzbach","city":"Sulzbach/Saar","address":"Friedrichstraße 6","zip":"66280","lat":49.3003847,"lon":7.0632659,"phone":"+49 6897 3626","slug":"pizzaburgerbullssulzbach","hours":[[0,12,0,0,22,0],[1,12,0,1,22,0],[2,12,0,2,22,0],[3,12,0,3,22,0],[4,12,0,4,22,0],[5,12,0,5,22,0],[6,12,0,6,22,0]]},
  {"name":"Pizza & Burger Bulls Seelze","city":"Seelze","address":"Kantstraße 2","zip":"30926","lat":52.3918406,"lon":9.5950548,"phone":"+49 5137 8149708","slug":"pizzaburgerbullsseelze","hours":[[0,11,0,1,0,0],[1,11,0,2,0,0],[2,11,0,3,0,0],[3,11,0,4,0,0],[4,11,0,5,0,0],[5,11,0,6,0,0],[6,11,0,0,0,0]]}
];

  var ORDER_BASE = 'https://www.pizzabulls.de/menu/';
  var WEEK = 7 * 1440;

  function pad(n){ return (n < 10 ? '0' : '') + n; }

  /* Aktuelle Zeit in Berlin als Wochentag (0 = So) + Minuten */
  function berlinNow(){
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var map = {};
    parts.forEach(function(p){ map[p.type] = p.value; });
    var day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(map.weekday);
    var hour = parseInt(map.hour, 10) % 24;
    return { day: day, minutes: day * 1440 + hour * 60 + parseInt(map.minute, 10) };
  }

  function isOpen(store, now){
    return store.hours.some(function(h){
      var o = h[0] * 1440 + h[1] * 60 + h[2];
      var c = h[3] * 1440 + h[4] * 60 + h[5];
      if (c <= o) c += WEEK;
      return (now.minutes >= o && now.minutes < c) || (now.minutes + WEEK >= o && now.minutes + WEEK < c);
    });
  }

  function todayHours(store, now){
    var seen = [];
    store.hours.forEach(function(h){
      if (h[0] !== now.day) return;
      var t = pad(h[1]) + ':' + pad(h[2]) + '-' + pad(h[4]) + ':' + pad(h[5]);
      if (seen.indexOf(t) === -1) seen.push(t);
    });
    return seen.length ? seen.join(', ') : 'geschlossen';
  }

  function distanceKm(a, b){
    var R = 6371, toRad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toRad, dLon = (b.lon - a.lon) * toRad;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------------------------------------------------------------------- */
  var section = document.getElementById('standorte');
  if (section){
    var listEl = section.querySelector('.home-stores__list');
    var countEl = section.querySelector('.home-stores__count');
    var input = section.querySelector('.home-stores__input');
    var form = section.querySelector('.home-stores__search');
    var locateBtn = section.querySelector('.home-stores__locate');
    var mapEl = section.querySelector('.home-stores__map');
    var map = null, markers = [], userMarker = null, activeIndex = -1;
    var visible = STORES.map(function(_, i){ return i; });
    var distances = null;

    if (window.L && mapEl){
      map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende'
      }).addTo(map);
      var icon = L.divIcon({ className: 'home-stores__pin', html: '<span></span>', iconSize: [26, 34], iconAnchor: [13, 32], popupAnchor: [0, -28] });
      STORES.forEach(function(s, i){
        var m = L.marker([s.lat, s.lon], { icon: icon, title: s.name, alt: s.name }).addTo(map);
        m.bindPopup('<strong>' + esc(s.name) + '</strong><br>' + esc(s.address) + ', ' + esc(s.zip) + ' ' + esc(s.city) +
          '<br><a href="' + ORDER_BASE + s.slug + '" target="_blank" rel="noopener">Bestellen</a> · ' +
          '<a href="https://www.google.com/maps/dir/?api=1&amp;destination=' + s.lat + ',' + s.lon + '" target="_blank" rel="noopener">Route</a>');
        m.on('click', function(){ setActive(i, false); });
        markers.push(m);
      });
      fitTo(visible);
    } else if (mapEl){
      mapEl.classList.add('home-stores__map--unavailable');
      mapEl.textContent = 'Die Karte konnte nicht geladen werden.';
    }

    function fitTo(indices){
      if (!map || !indices.length) return;
      var b = L.latLngBounds(indices.map(function(i){ return [STORES[i].lat, STORES[i].lon]; }));
      if (userMarker) b.extend(userMarker.getLatLng());
      map.fitBounds(b, { padding: [30, 30], maxZoom: 13 });
    }

    function render(){
      var now = berlinNow();
      countEl.textContent = visible.length + (visible.length === 1 ? ' Standort gefunden' : ' Standorte gefunden');
      if (!visible.length){
        listEl.innerHTML = '<p class="home-stores__empty">Kein Standort gefunden. Bitte andere PLZ oder Stadt versuchen.</p>';
        return;
      }
      listEl.innerHTML = visible.map(function(i){
        var s = STORES[i], open = isOpen(s, now);
        var dist = distances ? '<span class="home-stores__dist">' + distances[i].toFixed(1).replace('.', ',') + ' km</span>' : '';
        return '<article class="home-store' + (i === activeIndex ? ' is-active' : '') + '" data-index="' + i + '" tabindex="0">' +
          '<div class="home-store__head">' +
            '<div><h3 class="home-store__name">' + esc(s.name) + '</h3><p class="home-store__city">' + esc(s.city) + dist + '</p></div>' +
            '<span class="home-store__status ' + (open ? 'is-open' : 'is-closed') + '">' + (open ? 'Offen' : 'Geschlossen') + '</span>' +
          '</div>' +
          '<p class="home-store__line">' + esc(s.address) + ', ' + esc(s.zip) + ' ' + esc(s.city) + '</p>' +
          '<p class="home-store__line">Heute: ' + esc(todayHours(s, now)) + '</p>' +
          '<p class="home-store__line"><a href="tel:' + s.phone.replace(/\s+/g, '') + '">' + esc(s.phone) + '</a></p>' +
          '<div class="home-store__actions">' +
            '<a class="btn btn--green home-store__btn" href="' + ORDER_BASE + s.slug + '" target="_blank" rel="noopener">Bestellen</a>' +
            '<a class="home-store__route" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + s.lat + ',' + s.lon + '" target="_blank" rel="noopener">Route</a>' +
          '</div>' +
        '</article>';
      }).join('');
    }

    function setActive(i, fromList){
      activeIndex = i;
      Array.prototype.forEach.call(listEl.querySelectorAll('.home-store'), function(el){
        el.classList.toggle('is-active', +el.getAttribute('data-index') === i);
      });
      if (map && fromList){
        map.setView([STORES[i].lat, STORES[i].lon], 14);
        markers[i].openPopup();
      }
      if (!fromList){
        var el = listEl.querySelector('.home-store[data-index="' + i + '"]');
        if (el) listEl.scrollTo({ top: el.offsetTop - listEl.offsetTop - 8, behavior: 'smooth' });
      }
    }

    function applyFilter(){
      var q = input.value.trim().toLowerCase();
      visible = STORES.map(function(_, i){ return i; }).filter(function(i){
        if (!q) return true;
        var s = STORES[i];
        return (s.name + ' ' + s.city + ' ' + s.address + ' ' + s.zip).toLowerCase().indexOf(q) !== -1;
      });
      if (distances) visible.sort(function(a, b){ return distances[a] - distances[b]; });
      if (map) markers.forEach(function(m, i){
        if (visible.indexOf(i) === -1) map.removeLayer(m); else if (!map.hasLayer(m)) m.addTo(map);
      });
      activeIndex = -1;
      render();
      fitTo(visible);
    }

    listEl.addEventListener('click', function(e){
      if (e.target.closest('a')) return;
      var card = e.target.closest('.home-store');
      if (card) setActive(+card.getAttribute('data-index'), true);
    });
    listEl.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' || e.target.closest('a')) return;
      var card = e.target.closest('.home-store');
      if (card) setActive(+card.getAttribute('data-index'), true);
    });
    form.addEventListener('submit', function(e){ e.preventDefault(); applyFilter(); });
    input.addEventListener('input', function(){ if (!input.value.trim()) applyFilter(); });

    locateBtn.addEventListener('click', function(){
      if (!navigator.geolocation){ locateBtn.setAttribute('data-state', 'error'); return; }
      locateBtn.setAttribute('data-state', 'loading');
      navigator.geolocation.getCurrentPosition(function(pos){
        var me = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        distances = STORES.map(function(s){ return distanceKm(me, s); });
        locateBtn.setAttribute('data-state', 'ok');
        if (map){
          if (userMarker) map.removeLayer(userMarker);
          userMarker = L.circleMarker([me.lat, me.lon], { radius: 8, color: '#FFFFFF', weight: 3, fillColor: '#913133', fillOpacity: 1 }).addTo(map).bindPopup('Dein Standort');
        }
        input.value = '';
        applyFilter();
        if (map && visible.length) fitTo(visible.slice(0, 3));
      }, function(){
        locateBtn.setAttribute('data-state', 'error');
      }, { timeout: 10000, maximumAge: 300000 });
    });

    render();
  }

  /* ---------------------------------------------------------------------- */
  /* Bewertungs-Slider: natives horizontales Scrollen + Pfeil-Buttons       */
  var reviews = document.querySelector('.home-reviews');
  if (reviews){
    var track = reviews.querySelector('.home-reviews__track');
    var prev = reviews.querySelector('.home-reviews__nav--prev');
    var next = reviews.querySelector('.home-reviews__nav--next');
    function step(){
      var card = track.querySelector('.home-review');
      return card ? card.getBoundingClientRect().width + 20 : track.clientWidth;
    }
    function update(){
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    prev.addEventListener('click', function(){ track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function(){ track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------------- */
  /* Header-Dropdown (Franchise Konzept): Desktop per Hover/Fokus (CSS).     */
  /* Touch-Geräte/Smartphone: Pfeil-Button klappt auf und zu; auf Tablets     */
  /* ohne Hover öffnet der erste Tipp auf den Menüpunkt das Dropdown, der     */
  /* zweite folgt dem Link. Klick außerhalb oder Escape schließt.            */
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dd'));
  if (dropdowns.length){
    var noHover = window.matchMedia('(hover: none)');
    var narrow = window.matchMedia('(max-width: 899px)');
    function setOpen(dd, open){
      dd.classList.toggle('is-open', open);
      dd.querySelector('.nav-dd__trigger').setAttribute('aria-expanded', open ? 'true' : 'false');
      dd.querySelector('.nav-dd__toggle').setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function closeAll(except){
      dropdowns.forEach(function(dd){ if (dd !== except) setOpen(dd, false); });
    }
    dropdowns.forEach(function(dd){
      dd.querySelector('.nav-dd__toggle').addEventListener('click', function(e){
        e.preventDefault();
        var open = !dd.classList.contains('is-open');
        closeAll(dd);
        setOpen(dd, open);
      });
      dd.querySelector('.nav-dd__trigger').addEventListener('click', function(e){
        if (narrow.matches || !noHover.matches || dd.classList.contains('is-open')) return;
        e.preventDefault();
        closeAll(dd);
        setOpen(dd, true);
      });
    });
    document.addEventListener('click', function(e){
      if (!e.target.closest('.nav-dd')) closeAll(null);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeAll(null);
    });
  }
})();
