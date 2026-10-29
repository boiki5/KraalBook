/* KraalBook pilot, pieces 1 and 2: animals, tags, tasks and reminders, saved on this device only.
   No server, no account, no analytics. Records live in the browser's IndexedDB. */
(function () {
  'use strict';
  var VERSION = '0.3';

  /* ---------- small helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pref(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; }
    return null;
  }
  function uid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- language ---------- */
  var EN = {
    pilot: 'Pilot', offline: 'Offline', offlineReady: 'Ready to work offline', add: 'Add animal',
    sampleBanner: 'Sample farm. All animals are made up.', useMine: 'Use my own farm',
    cattle: 'Cattle', goats: 'Goats', sheep: 'Sheep', all: 'All', cattleOne: 'Cattle', goatOne: 'Goat', sheepOne: 'Sheep',
    search: 'Search by tag, breed or camp',
    needTag1: '1 animal needs an ear tag', needTagN: '{n} animals need an ear tag', nextDue: 'Next one due {d}', overdueN: '{n} overdue',
    tagBy: 'Tag by {d}', tagOverdue: 'Tag overdue', noTag: 'No tag yet', noDob: 'No birth date',
    emptyTitle: 'No animals yet', emptyText: 'Add your first animal. Everything is saved on this phone only.', addFirst: 'Add an animal', trySample: 'Try sample data',
    nothing: 'No animals match.',
    cancel: 'Cancel', close: 'Close', save: 'Save', saveAnimal: 'Save animal', edit: 'Edit', remove: 'Remove from records',
    editTitle: 'Edit animal', newTitle: 'Add animal',
    species: 'Species', sex: 'Sex', female: 'Female', male: 'Male', dob: 'Date of birth', dobHint: 'Leave empty if you are not sure.',
    origin: 'Origin', born: 'Born on the farm', bought: 'Bought', breed: 'Breed', camp: 'Camp or kraal', notes: 'Notes',
    tags: 'Ear tags', farmTag: 'Tag number or name', tagged: 'Tagged', tagLater: 'Not tagged yet',
    ana: 'Analogue tag number', ele: 'Electronic tag number', eleHint: 'The last 8 digits must match the analogue tag.',
    colour: 'Tag colour', yellow: 'Yellow (local)', red: 'Red (imported)', taggedOn: 'Tagging date',
    chk_empty: 'Enter both numbers', chk_ana: 'Analogue tag needs 8 digits', chk_bad: 'Last 8 digits do not match', chk_ok: 'Numbers match',
    dupTag: 'Another animal already has this tag.', futureDob: 'Date of birth cannot be in the future.', needDate: 'Enter the tagging date.',
    status: 'Status', healthy: 'Healthy', sick: 'Sick', injured: 'Injured', reason: 'Reason', saveStatus: 'Save status',
    history: 'History', ev_added: 'Added to your records', ev_tagged: 'Tagged {tag}', ev_status: 'Marked {status}', ev_statusNote: 'Marked {status}: {note}',
    ageUnder1: 'under 1 month', ageMo: '{n} mo', ageYr: '{y} yr', ageYrMo: '{y} yr {m} mo',
    notTagged: 'Not tagged yet', tagWindow: 'Tag by {d} ({n} days left)', tagLate: 'Tagging was due {d}', addTags: 'Add tags',
    analogue: 'Analogue tag', electronic: 'Electronic tag',
    removeAsk: 'Remove {tag} from your records? This cannot be undone.', removeYes: 'Yes, remove',
    settings: 'Settings', language: 'Language',
    yourData: 'Your data',
    dataText: 'Your records are saved on this phone only. KraalBook does not receive or keep them. If you lose the phone or clear the browser data, they cannot be recovered, so back up often.',
    storage: 'Storage', storageOk: 'Protected from automatic clearing', storageNo: 'Not protected. Add the app to your home screen and back up often.', storageNA: 'Not available. Records will be lost when you close the page.',
    backup: 'Backup', exportB: 'Save a backup file', importB: 'Restore from a backup file', lastBackup: 'Last backup: {d}', neverBackup: 'No backup yet',
    imported: 'Restored {n} animals', importBad: 'That file is not a KraalBook backup.', exported: 'Backup file saved',
    backupNudge: 'Back up your records', backupNudgeText: 'Save a backup file so you do not lose them.', backupBtn: 'Back up',
    erase: 'Erase all my data', eraseAsk: 'Erase every animal on this phone? This cannot be undone.', eraseYes: 'Yes, erase everything', erased: 'All data erased',
    install: 'Install the app', iosInstall: 'On iPhone, tap Share, then Add to Home Screen.',
    sampleMode: 'Sample farm', sampleOn: 'You are looking at the sample farm. Nothing here is real.', openSample: 'Open the sample farm',
    offlineStatus: 'Works without internet', offlineYes: 'Yes. The app is saved on this phone.', offlineNo: 'Not yet. Open the app once with internet.',
    welcomeTitle: 'Your records stay on this phone', w1: 'No account and no sign-up.', w2: 'Works without internet after the first visit.',
    w3: 'Nothing is sent to anyone. Save a backup file that you keep yourself.', startMine: 'Start with my farm',
    version: 'Pilot version {v}. This is a test version.', saved: 'Saved', cantSave: 'Could not save. Storage may be full or blocked.',
    memWarn: 'Storage is blocked in this browser. Records will be lost when you close the page.',
    changesN: '{n} changes since your last backup.', restoreAsk: 'Restore {a} animals and {k} tasks from the backup of {d}? Newer records on this phone are kept.', restoreYes: 'Restore'
  };
  var TN = {
    pilot: 'Teko', offline: 'Ga o na inthanete', offlineReady: 'E siame go dira ntle le inthanete', add: 'Tsenya phologolo',
    sampleBanner: 'Polase ya sekai. Diphologolo tsotlhe ke tsa maitirelo.', useMine: 'Dirisa polase ya me',
    cattle: 'Dikgomo', goats: 'Dipodi', sheep: 'Dinku', all: 'Tsotlhe', cattleOne: 'Kgomo', goatOne: 'Podi', sheepOne: 'Nku',
    search: 'Batla ka tag, mofuta kana lesaka',
    needTag1: 'Phologolo e le 1 e tlhoka tag ya tsebe', needTagN: 'Diphologolo di le {n} di tlhoka tag ya tsebe', nextDue: 'E e latelang e tshwanetse {d}', overdueN: '{n} di feditse nako',
    tagBy: 'Tag pele ga {d}', tagOverdue: 'Nako ya go tshwaya e feditse', noTag: 'Ga e na tag', noDob: 'Ga go na letlha la go tsalwa',
    emptyTitle: 'Ga go na diphologolo le fa e le tse dingwe', emptyText: 'Tsenya phologolo ya ntlha. Sengwe le sengwe se bolokilwe mo mogaleng ono fela.', addFirst: 'Tsenya phologolo', trySample: 'Leka data ya sekai',
    nothing: 'Ga go na diphologolo tse di tshwanang.',
    cancel: 'Khansela', close: 'Tswala', save: 'Boloka', saveAnimal: 'Boloka phologolo', edit: 'Fetola', remove: 'Tlosa mo direkotong',
    editTitle: 'Fetola phologolo', newTitle: 'Tsenya phologolo',
    species: 'Mofuta', sex: 'Bong', female: 'Tshadi', male: 'Tona', dob: 'Letlha la go tsalwa', dobHint: 'Tlogela e se na sepe fa o sa itse.',
    origin: 'Tshimologo', born: 'E belegetswe mo polaseng', bought: 'E rekilwe', breed: 'Mofuta wa kgomo/podi', camp: 'Lesaka kana kampa', notes: 'Dintlha',
    tags: 'Ditag tsa tsebe', farmTag: 'Nomoro ya tag kana leina', tagged: 'E na le tag', tagLater: 'Ga e na tag le fa e le nngwe',
    ana: 'Nomoro ya tag ya analogue', ele: 'Nomoro ya tag ya elektronike', eleHint: 'Dinomoro tse 8 tsa bofelo di tshwanetse go tshwana le tag ya analogue.',
    colour: 'Mmala wa tag', yellow: 'Serolwane (wa selegae)', red: 'Khibidu (e e tswang kwa ntle)', taggedOn: 'Letlha la go tshwaya',
    chk_empty: 'Kwala dinomoro tsotlhe pedi', chk_ana: 'Tag ya analogue e tlhoka dinomoro tse 8', chk_bad: 'Dinomoro tse 8 tsa bofelo ga di tshwane', chk_ok: 'Dinomoro di a tshwana',
    dupTag: 'Phologolo e nngwe e setse e na le tag eno.', futureDob: 'Letlha la go tsalwa ga le kake la nna kwa moragonyana.', needDate: 'Kwala letlha la go tshwaya.',
    status: 'Maemo', healthy: 'E siame', sick: 'E a lwala', injured: 'E gobetse', reason: 'Lebaka', saveStatus: 'Boloka maemo',
    history: 'Histori', ev_added: 'E tsentswe mo direkotong tsa gago', ev_tagged: 'E tshwaisitswe {tag}', ev_status: 'E tshwailwe jaaka {status}', ev_statusNote: 'E tshwailwe jaaka {status}: {note}',
    ageUnder1: 'ga e ise e ke e nne kgwedi', ageMo: 'dikgwedi di le {n}', ageYr: 'dingwaga di le {y}', ageYrMo: 'dingwaga di le {y} le dikgwedi di le {m}',
    notTagged: 'Ga e na tag le fa e le nngwe', tagWindow: 'Tag pele ga {d} (matsatsi a le {n} a setse)', tagLate: 'Go tshwaya go ne go tshwanetse {d}', addTags: 'Tsenya ditag',
    analogue: 'Tag ya analogue', electronic: 'Tag ya elektronike',
    removeAsk: 'A o batla go tlosa {tag} mo direkotong tsa gago? Se ka se boelediwe.', removeYes: 'Ee, e tlose',
    settings: 'Dithulaganyo', language: 'Puo', yourData: 'Data ya gago',
    dataText: 'Direkoto tsa gago di bolokilwe mo mogaleng ono fela. KraalBook ga e di amogele le fa e le go di boloka. Fa o latlhegelwa ke mogala kana o phimola data ya browser, ga di kake tsa boelediwa, ka jalo di boloke gantsi.',
    storage: 'Polokelo', storageOk: 'E sireletsegile mo go phimolweng ka boyone', storageNo: 'Ga e sireletsege. Tsenya app mo sekirining sa gae mme o boloke gantsi.', storageNA: 'Ga e yo. Direkoto di tla latlhega fa o tswala tsebe.',
    backup: 'Polokelo ya bobedi', exportB: 'Boloka faele ya polokelo', importB: 'Busetsa go tswa mo faeleng ya polokelo', lastBackup: 'Polokelo ya bofelo: {d}', neverBackup: 'Ga go na polokelo',
    imported: 'Go busediwe diphologolo di le {n}', importBad: 'Faele eo ga se polokelo ya KraalBook.', exported: 'Faele ya polokelo e bolokilwe',
    backupNudge: 'Boloka direkoto tsa gago', backupNudgeText: 'Boloka faele ya polokelo gore o se ka wa di latlhegelwa.', backupBtn: 'Boloka',
    erase: 'Phimola data yotlhe ya me', eraseAsk: 'A o batla go phimola diphologolo tsotlhe mo mogaleng ono? Se ka se boelediwe.', eraseYes: 'Ee, phimola tsotlhe', erased: 'Data yotlhe e phimotswe',
    install: 'Kenya app', iosInstall: 'Mo iPhone, kgotla Share, mme o kgethe Add to Home Screen.',
    sampleMode: 'Polase ya sekai', sampleOn: 'O leba polase ya sekai. Ga go na sepe se e leng sa nnete fano.', openSample: 'Bula polase ya sekai',
    offlineStatus: 'E dira ntle le inthanete', offlineYes: 'Ee. App e bolokilwe mo mogaleng ono.', offlineNo: 'Ga ise. Bula app gangwe o na le inthanete.',
    welcomeTitle: 'Direkoto tsa gago di nna mo mogaleng ono', w1: 'Ga go na akhaonto le go ineela.', w2: 'E dira ntle le inthanete morago ga go e bula ga ntlha.',
    w3: 'Ga go sepe se se romelwang. Boloka faele ya polokelo e o e sireletsang o le nosi.', startMine: 'Simolola ka polase ya me',
    version: 'Kgatiso ya teko {v}. Ke kgatiso ya go leka.', saved: 'E bolokilwe', cantSave: 'Ga e a bolokwa. Polokelo e ka nna e tletse kana e thibetswe.',
    memWarn: 'Polokelo e thibetswe mo browser eno. Direkoto di tla latlhega fa o tswala tsebe.',
    changesN: 'Diphetogo di le {n} go tloga fa o boloka la bofelo.', restoreAsk: 'A o batla go busetsa diphologolo di le {a} le ditiro di le {k} go tswa mo polokelong ya {d}? Direkoto tse dintšha mo mogaleng ono di a bolokwa.', restoreYes: 'Busetsa'
  };
  var MONTHS = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    tn: ['Fer', 'Tlh', 'Mop', 'Mor', 'Mot', 'See', 'Phu', 'Pha', 'Lwe', 'Diph', 'Ngw', 'Sed']
  };
  var lang = pref('kb-lang') === 'tn' ? 'tn' : 'en';
  function t(k, v) {
    var s = (lang === 'tn' && TN[k]) || EN[k] || k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function applyI18n(root) {
    $$('[data-i18n]', root).forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.documentElement.lang = lang === 'tn' ? 'tn' : 'en';
  }

  /* ---------- dates ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return isoOf(new Date()); }
  function parts(iso) { var p = iso.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function fmtDate(iso) { if (!iso) return ''; var p = parts(iso); return p.d + ' ' + MONTHS[lang][p.m - 1] + ' ' + p.y; }
  function addMonths(iso, n) {
    var p = parts(iso), last = new Date(p.y, p.m - 1 + n + 1, 0).getDate(), dt = new Date(p.y, p.m - 1 + n, 1);
    dt.setDate(Math.min(p.d, last)); return isoOf(dt);
  }
  function addDays(iso, n) { var p = parts(iso); return isoOf(new Date(p.y, p.m - 1, p.d + n)); }
  function daysBetween(a, b) { var x = parts(a), y = parts(b); return Math.round((Date.UTC(y.y, y.m - 1, y.d) - Date.UTC(x.y, x.m - 1, x.d)) / 864e5); }
  function ageText(dob) {
    if (!dob) return '';
    var a = parts(dob), b = parts(today()), months = (b.y - a.y) * 12 + (b.m - a.m) - (b.d < a.d ? 1 : 0);
    if (months < 1) return t('ageUnder1');
    if (months < 12) return t('ageMo', { n: months });
    var y = Math.floor(months / 12), m = months % 12;
    return m ? t('ageYrMo', { y: y, m: m }) : t('ageYr', { y: y });
  }

  /* ---------- tags ---------- */
  function digits(v) { return (v || '').replace(/\D/g, ''); }
  function tagCheck(ana, ele) {
    var a = digits(ana), e = digits(ele);
    if (!a || !e) return { k: 'chk_empty', ok: false, cls: '' };
    if (a.length !== 8) return { k: 'chk_ana', ok: false, cls: 'bad' };
    if (e.length < 8 || e.slice(-8) !== a) return { k: 'chk_bad', ok: false, cls: 'bad' };
    return { k: 'chk_ok', ok: true, cls: 'ok' };
  }
  function fmtAna(a) { a = digits(a); return 'BW ' + a.slice(0, 4) + ' ' + a.slice(4); }
  function tagLabel(a) {
    if (a.species === 'cattle') return a.tags && a.tags.ana ? fmtAna(a.tags.ana) : t('noTag');
    return a.farmTag || t('noTag');
  }
  function needsTag(a) { return a.species === 'cattle' && !(a.tags && a.tags.ana); }
  function tagBy(a) { return a.dob ? addMonths(a.dob, 3) : null; }

  function bump() { if (mode === 'real') pref('kb-changes', String((parseInt(pref('kb-changes'), 10) || 0) + 1)); }
  function changes() { return parseInt(pref('kb-changes'), 10) || 0; }

  /* ---------- storage (IndexedDB, with an in-memory fallback) ---------- */
  var mode = pref('kb-mode') === 'sample' ? 'sample' : 'real';
  var DB_NAME = mode === 'sample' ? 'kraalbook-sample' : 'kraalbook';
  var db = null, memOnly = false, memAnimals = [];
  function openDB() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      var r;
      try { r = indexedDB.open(DB_NAME, 2); } catch (e) { return rej(e); }
      r.onupgradeneeded = function () { var d = r.result; if (!d.objectStoreNames.contains('animals')) d.createObjectStore('animals', { keyPath: 'id' }); if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' }); if (!d.objectStoreNames.contains('tasks')) d.createObjectStore('tasks', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
      r.onblocked = function () { rej(new Error('blocked')); };
    });
  }
  function run(store, type, fn) {
    return new Promise(function (res, rej) {
      var tx = db.transaction(store, type), st = tx.objectStore(store), out = fn(st);
      tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : undefined); };
      tx.onerror = tx.onabort = function () { rej(tx.error || new Error('tx')); };
    });
  }
  function dbAll() { if (memOnly) return Promise.resolve(memAnimals.slice()); return run('animals', 'readonly', function (s) { return s.getAll(); }); }
  function dbPut(a) {
    if (memOnly) { var i = memAnimals.findIndex(function (x) { return x.id === a.id; }); if (i < 0) memAnimals.push(clone(a)); else memAnimals[i] = clone(a); return Promise.resolve(); }
    bump(); return run('animals', 'readwrite', function (s) { s.put(a); });
  }
  function dbDel(id) { if (memOnly) { memAnimals = memAnimals.filter(function (x) { return x.id !== id; }); return Promise.resolve(); } bump(); return run('animals', 'readwrite', function (s) { s.delete(id); }); }
  function dbClear() { if (memOnly) { memAnimals = []; return Promise.resolve(); } return run('animals', 'readwrite', function (s) { s.clear(); }); }
  function dbMetaGet(k) { if (memOnly) return Promise.resolve(null); return run('meta', 'readonly', function (s) { return s.get(k); }).then(function (r) { return r ? r.value : null; }); }
  function dbMetaSet(k, v) { if (memOnly) return Promise.resolve(); return run('meta', 'readwrite', function (s) { s.put({ key: k, value: v }); }); }

  /* ---------- state ---------- */
  var state = { animals: [], gone: [], tasks: [], filter: 'all', q: '', persisted: null, swReady: false, installEvt: null };
  var main = $('#main'), layer = $('#layer');
  var stack = [];

  function sortAnimals(list) {
    return list.slice().sort(function (a, b) {
      var an = needsTag(a), bn = needsTag(b);
      if (an !== bn) return an ? -1 : 1;
      if (an && bn) { var x = tagBy(a) || '9999', y = tagBy(b) || '9999'; if (x !== y) return x < y ? -1 : 1; }
      return tagLabel(a).localeCompare(tagLabel(b), undefined, { numeric: true });
    });
  }
  function speciesOne(s) { return t(s === 'cattle' ? 'cattleOne' : s === 'goat' ? 'goatOne' : 'sheepOne'); }

  /* ---------- toast and sheets ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }
  function openSheet(html, onReady) {
    var w = document.createElement('div');
    w.className = 'layer-in';
    w.innerHTML = '<div class="scrim"></div><section class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</section>';
    layer.appendChild(w); stack.push(w);
    $('.scrim', w).addEventListener('click', function () { closeSheet(w); });
    applyI18n(w);
    if (onReady) onReady(w, $('.sheet', w));
    return w;
  }
  function closeSheet(w) {
    var i = stack.indexOf(w); if (i < 0) return;
    stack.splice(i, 1); if (w.parentNode) w.parentNode.removeChild(w);
  }
  function closeAll() { stack.slice().forEach(closeSheet); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && stack.length) closeSheet(stack[stack.length - 1]); });

  /* ---------- main screen ---------- */
  function renderBanner() {
    var h = '';
    if (mode === 'sample') h += '<div class="note sample"><span>' + esc(t('sampleBanner')) + '</span><button id="n-mine">' + esc(t('useMine')) + '</button></div>';
    if (memOnly) h += '<div class="note"><span>' + esc(t('memWarn')) + '</span></div>';
    var lb = pref('kb-lastbackup');
    var stale = !lb || daysBetween(lb, today()) > 30, many = changes() >= 10;
    if (mode === 'real' && state.animals.length >= 3 && (stale || many)) h += '<div class="note"><span><b>' + esc(t('backupNudge')) + '.</b> ' + esc(many ? t('changesN', { n: changes() }) : t('backupNudgeText')) + '</span><button id="n-backup">' + esc(t('backupBtn')) + '</button></div>';
    var at = attention();
    if (view === 'herd' && at.total) h += '<div class="note"><span><b>' + esc(at.total === 1 ? t('remBanner1') : t('remBannerN', { n: at.total })) + '.</b> ' + esc(t('remSub', { o: at.over, t: at.now })) + '</span><button id="n-tasks">' + esc(t('open')) + '</button></div>';
    $('#banner').innerHTML = h;
    var nt = $('#n-tasks'); if (nt) nt.addEventListener('click', function () { setView('tasks'); });
    var m = $('#n-mine'); if (m) m.addEventListener('click', function () { switchMode('real'); });
    var b = $('#n-backup'); if (b) b.addEventListener('click', openSettings);
  }

  function renderMain() {
    var list = state.animals;
    if (!list.length) {
      main.innerHTML = '<div class="empty"><h2>' + esc(t('emptyTitle')) + '</h2><p>' + esc(t('emptyText')) + '</p>' +
        '<button class="btn" id="e-add">' + esc(t('addFirst')) + '</button>' +
        (mode === 'real' ? '<button class="btn alt" id="e-sample">' + esc(t('trySample')) + '</button>' : '') + '</div>';
      $('#e-add').addEventListener('click', function () { openForm(null); });
      var s = $('#e-sample'); if (s) s.addEventListener('click', function () { switchMode('sample'); });
      $('#b-add').hidden = true; return;
    }
    $('#b-add').hidden = false;
    var c = { cattle: 0, goat: 0, sheep: 0 };
    list.forEach(function (a) { c[a.species]++; });
    var need = list.filter(needsTag), td = today();
    var late = need.filter(function (a) { var d = tagBy(a); return d && d < td; }).length;
    var nextDue = need.map(tagBy).filter(Boolean).sort()[0];
    var h = '<div class="tiles">' +
      '<div class="tile"><div class="n">' + c.cattle + '</div><div class="l">' + esc(t('cattle')) + '</div></div>' +
      '<div class="tile"><div class="n">' + c.goat + '</div><div class="l">' + esc(t('goats')) + '</div></div>' +
      '<div class="tile"><div class="n">' + c.sheep + '</div><div class="l">' + esc(t('sheep')) + '</div></div></div>';
    if (need.length) {
      var sub = [];
      if (nextDue) sub.push(t('nextDue', { d: fmtDate(nextDue) }));
      if (late) sub.push(t('overdueN', { n: late }));
      h += '<button class="alert' + (late ? ' bad' : '') + '" id="a-need"><span class="tx"><b>' + esc(need.length === 1 ? t('needTag1') : t('needTagN', { n: need.length })) + '</b><span>' + esc(sub.join(' · ')) + '</span></span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>';
    }
    h += '<div class="tools"><div class="chips" id="f-chips">' +
      [['all', 'all'], ['cattle', 'cattle'], ['goat', 'goats'], ['sheep', 'sheep'], ['needtag', 'noTag']].map(function (f) {
        return '<button class="chip" data-f="' + f[0] + '" aria-pressed="' + (state.filter === f[0]) + '">' + esc(t(f[1])) + '</button>';
      }).join('') + '</div><input class="search" id="q" type="search" placeholder="' + esc(t('search')) + '" value="' + esc(state.q) + '" autocomplete="off"></div>' +
      '<div class="rows" id="rows"></div>';
    main.innerHTML = h;
    $$('#f-chips .chip').forEach(function (b) { b.addEventListener('click', function () { state.filter = b.getAttribute('data-f'); $$('#f-chips .chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); renderRows(); }); });
    $('#q').addEventListener('input', function (e) { state.q = e.target.value; renderRows(); });
    var an = $('#a-need'); if (an) an.addEventListener('click', function () { state.filter = 'needtag'; renderMain(); });
    renderRows();
  }

  function rowPill(a) {
    if (a.status === 'sick' || a.status === 'injured') return '<span class="pill warn">' + esc(t(a.status)) + '</span>';
    if (needsTag(a)) {
      var d = tagBy(a);
      if (!d) return '<span class="pill">' + esc(t('noTag')) + '</span>';
      return d < today() ? '<span class="pill bad">' + esc(t('tagOverdue')) + '</span>' : '<span class="pill warn">' + esc(t('tagBy', { d: fmtDate(d) })) + '</span>';
    }
    return '';
  }
  function renderRows() {
    var q = state.q.trim().toLowerCase();
    var list = sortAnimals(state.animals).filter(function (a) {
      if (state.filter === 'needtag') { if (!needsTag(a)) return false; }
      else if (state.filter !== 'all' && a.species !== state.filter) return false;
      if (!q) return true;
      return [tagLabel(a), digits(tagLabel(a)), a.breed, a.camp, a.notes].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    var el = $('#rows');
    if (!list.length) { el.innerHTML = '<p class="none">' + esc(t('nothing')) + '</p>'; return; }
    el.innerHTML = list.map(function (a) {
      var sub = [speciesOne(a.species), t(a.sex === 'F' ? 'female' : 'male'), a.breed, ageText(a.dob), a.camp].filter(Boolean).join(' · ');
      return '<button class="arow" data-id="' + esc(a.id) + '"><span class="atx"><b>' + esc(tagLabel(a)) + '</b><span>' + esc(sub) + '</span></span>' + rowPill(a) + '</button>';
    }).join('');
    $$('.arow', el).forEach(function (b) { b.addEventListener('click', function () { openDetail(b.getAttribute('data-id')); }); });
  }

  function refresh() {
    renderBanner();
    if (view === 'tasks') renderTasks(); else renderMain();
    var fab = $('#b-add'), lab = $('span', fab);
    lab.setAttribute('data-i18n', view === 'tasks' ? 'addTask' : 'add'); lab.textContent = t(view === 'tasks' ? 'addTask' : 'add');
    if (view === 'tasks') fab.hidden = false;
    $$('#tabs [data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    updateBadge();
  }
  function findAnimal(id) { return state.animals.filter(function (a) { return a.id === id; })[0]; }

  /* ---------- animal detail ---------- */
  function openDetail(id) {
    var a = findAnimal(id); if (!a) return;
    var rows = [[t('species'), speciesOne(a.species)], [t('sex'), t(a.sex === 'F' ? 'female' : 'male')]];
    if (a.dob) rows.push([t('dob'), fmtDate(a.dob) + ' (' + ageText(a.dob) + ')']);
    if (a.origin) rows.push([t('origin'), t(a.origin === 'bought' ? 'bought' : 'born')]);
    if (a.breed) rows.push([t('breed'), a.breed]);
    if (a.camp) rows.push([t('camp'), a.camp]);
    if (a.notes) rows.push([t('notes'), a.notes]);

    var tagHtml = '';
    if (a.species === 'cattle') {
      if (a.tags && a.tags.ana) {
        tagHtml = '<dl class="dl"><dt>' + esc(t('analogue')) + '</dt><dd>' + esc(fmtAna(a.tags.ana)) + '</dd><dt>' + esc(t('electronic')) + '</dt><dd>' + esc(a.tags.ele) + '</dd>' +
          '<dt>' + esc(t('colour')) + '</dt><dd>' + esc(t(a.tags.colour === 'red' ? 'red' : 'yellow')) + '</dd><dt>' + esc(t('taggedOn')) + '</dt><dd>' + esc(fmtDate(a.tags.taggedOn)) + '</dd></dl>';
      } else {
        var d = tagBy(a), late = d && d < today();
        tagHtml = '<div class="box' + (late ? ' bad' : '') + '"><b>' + esc(t('notTagged')) + '</b><span class="hint">' +
          esc(d ? (late ? t('tagLate', { d: fmtDate(d) }) : t('tagWindow', { d: fmtDate(d), n: daysBetween(today(), d) })) : t('noDob')) + '</span>' +
          '<button class="btn small" id="d-addtags">' + esc(t('addTags')) + '</button></div>';
      }
    }
    var hist = (a.events || []).slice().sort(function (x, y) { return x.at < y.at ? 1 : x.at > y.at ? -1 : 0; }).map(function (ev) {
      var txt = ev.type === 'task' ? t('ev_task', { task: ev.task === 'custom' ? (ev.title || t('tt_custom')) : t('tt_' + ev.task) }) : ev.type === 'added' ? t('ev_added') : ev.type === 'tagged' ? t('ev_tagged', { tag: ev.tag || '' }) : (ev.note ? t('ev_statusNote', { status: t(ev.status), note: ev.note }) : t('ev_status', { status: t(ev.status) }));
      return '<li><time>' + esc(fmtDate(ev.at)) + '</time><span>' + esc(txt) + '</span></li>';
    }).join('');

    var html = '<div class="sheet-in"><div class="sheet-head"><div><h2>' + esc(tagLabel(a)) + '</h2><div class="sub">' + esc([speciesOne(a.species), ageText(a.dob)].filter(Boolean).join(' · ')) + '</div></div>' +
      '<button class="x" id="d-close" aria-label="' + esc(t('close')) + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<dl class="dl">' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      (tagHtml ? '<h3 class="sec-title">' + esc(t('tags')) + '</h3>' + tagHtml : '') +
      '<h3 class="sec-title">' + esc(t('status')) + '</h3>' +
      '<div class="chips" id="d-status">' + ['healthy', 'sick', 'injured'].map(function (s) { return '<button class="chip" data-s="' + s + '" aria-pressed="' + (a.status === s) + '">' + esc(t(s)) + '</button>'; }).join('') + '</div>' +
      '<div class="field" id="d-reasonf" ' + (a.status === 'healthy' ? 'hidden' : '') + '><label for="d-reason">' + esc(t('reason')) + '</label><input id="d-reason" value="' + esc(a.statusNote || '') + '"></div>' +
      '<button class="btn alt" id="d-savestat">' + esc(t('saveStatus')) + '</button>' +
      '<h3 class="sec-title">' + esc(t('history')) + '</h3><ul class="hist">' + hist + '</ul>' +
      '<div id="d-confirm"></div></div>' +
      '<div class="foot"><button class="btn alt" id="d-remove">' + esc(t('remove')) + '</button><button class="btn" id="d-edit">' + esc(t('edit')) + '</button></div>';

    openSheet(html, function (w) {
      $('#d-close', w).addEventListener('click', function () { closeSheet(w); });
      $('#d-edit', w).addEventListener('click', function () { closeSheet(w); openForm(a); });
      var at = $('#d-addtags', w); if (at) at.addEventListener('click', function () { closeSheet(w); openForm(a, { tagNow: true }); });
      var pressed = a.status;
      $$('#d-status .chip', w).forEach(function (b) { b.addEventListener('click', function () {
        pressed = b.getAttribute('data-s');
        $$('#d-status .chip', w).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        $('#d-reasonf', w).hidden = pressed === 'healthy';
      }); });
      $('#d-savestat', w).addEventListener('click', function () {
        var note = pressed === 'healthy' ? '' : $('#d-reason', w).value.trim();
        if (pressed === a.status && note === (a.statusNote || '')) { closeSheet(w); return; }
        var n = clone(a); n.status = pressed; n.statusNote = note; n.updatedAt = new Date().toISOString();
        n.events = (n.events || []).concat([{ at: today(), type: 'status', status: pressed, note: note }]);
        save(n, function () { closeSheet(w); openDetail(n.id); toast(t('saved')); });
      });
      $('#d-remove', w).addEventListener('click', function () {
        $('#d-confirm', w).innerHTML = '<div class="confirm"><span>' + esc(t('removeAsk', { tag: tagLabel(a) })) + '</span><div class="row2"><button class="btn alt small" id="c-no">' + esc(t('cancel')) + '</button><button class="btn danger small" id="c-yes">' + esc(t('removeYes')) + '</button></div></div>';
        $('#c-no', w).addEventListener('click', function () { $('#d-confirm', w).innerHTML = ''; });
        $('#c-yes', w).addEventListener('click', function () {
          dbDel(a.id).then(function () { state.animals = state.animals.filter(function (x) { return x.id !== a.id; }); closeSheet(w); refresh(); toast(t('saved')); }).catch(function () { toast(t('cantSave')); });
        });
      });
    });
  }

  function save(a, done) {
    dbPut(a).then(function () {
      var i = state.animals.findIndex(function (x) { return x.id === a.id; });
      if (i < 0) state.animals.push(a); else state.animals[i] = a;
      requestPersist();
      return ensureReturnTask(a).then(function () { refresh(); if (done) done(); });
    }).catch(function () { toast(t('cantSave')); });
  }

  /* ---------- add / edit form ---------- */
  function openForm(existing, opts) {
    opts = opts || {};
    var isNew = !existing;
    var a = existing ? clone(existing) : { species: 'cattle', sex: 'F', origin: 'born', tags: { colour: 'yellow' }, status: 'healthy', events: [] };
    a.tags = a.tags || { colour: 'yellow' };
    var tagged = a.species === 'cattle' ? !!(a.tags.ana) || (isNew) : false;
    if (opts.tagNow) tagged = true;
    var camps = []; state.animals.forEach(function (x) { if (x.camp && camps.indexOf(x.camp) < 0) camps.push(x.camp); });
    var breeds = { cattle: ['Tswana', 'Brahman', 'Tuli', 'Bonsmara', 'Afrikaner', 'Simmentaler', 'Mixed'], goat: ['Tswana', 'Boer', 'Mixed'], sheep: ['Dorper', 'Karakul', 'Tswana', 'Mixed'] };

    function chips(id, items, sel) { return '<div class="chips" id="' + id + '">' + items.map(function (i) { return '<button type="button" class="chip" data-v="' + i[0] + '" aria-pressed="' + (sel === i[0]) + '">' + esc(i[1]) + '</button>'; }).join('') + '</div>'; }

    var html = '<div class="sheet-in"><div class="sheet-head"><h2>' + esc(t(isNew ? 'newTitle' : 'editTitle')) + '</h2>' +
      '<button class="x" id="f-close" aria-label="' + esc(t('close')) + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="field"><span class="lab">' + esc(t('species')) + '</span>' + chips('f-species', [['cattle', t('cattleOne')], ['goat', t('goatOne')], ['sheep', t('sheepOne')]], a.species) + '</div>' +
      '<div class="field"><span class="lab">' + esc(t('sex')) + '</span>' + chips('f-sex', [['F', t('female')], ['M', t('male')]], a.sex) + '</div>' +
      '<div class="group" id="g-tags"><h3>' + esc(t('tags')) + '</h3>' +
        '<div id="g-cattle"><div class="field"><span class="lab">&nbsp;</span>' + chips('f-tagged', [['yes', t('tagged')], ['no', t('tagLater')]], tagged ? 'yes' : 'no') + '</div>' +
        '<div id="g-baits" style="display:flex;flex-direction:column;gap:12px;margin-top:12px">' +
          '<div class="field"><label for="f-ana">' + esc(t('ana')) + '</label><div class="inp"><span class="pre">BW</span><input id="f-ana" inputmode="numeric" autocomplete="off" value="' + esc(a.tags.ana ? digits(a.tags.ana).slice(0, 4) + ' ' + digits(a.tags.ana).slice(4) : '') + '" placeholder="0000 0000"></div></div>' +
          '<div class="field"><label for="f-ele">' + esc(t('ele')) + '</label><div class="inp"><input id="f-ele" inputmode="numeric" autocomplete="off" value="' + esc(a.tags.ele || '') + '"></div><span class="hint">' + esc(t('eleHint')) + '</span></div>' +
          '<p class="check" id="f-chk" role="status"></p>' +
          '<div class="field"><span class="lab">' + esc(t('colour')) + '</span>' + chips('f-colour', [['yellow', t('yellow')], ['red', t('red')]], a.tags.colour || 'yellow') + '</div>' +
          '<div class="field"><label for="f-tdate">' + esc(t('taggedOn')) + '</label><input id="f-tdate" type="date" value="' + esc(a.tags.taggedOn || today()) + '" max="' + today() + '"></div>' +
        '</div></div>' +
        '<div id="g-small"><div class="field"><label for="f-ftag">' + esc(t('farmTag')) + '</label><input id="f-ftag" autocomplete="off" value="' + esc(a.farmTag || '') + '"></div></div>' +
      '</div>' +
      '<div class="field"><label for="f-dob">' + esc(t('dob')) + '</label><input id="f-dob" type="date" value="' + esc(a.dob || '') + '" max="' + today() + '"><span class="hint">' + esc(t('dobHint')) + '</span></div>' +
      '<div class="field"><span class="lab">' + esc(t('origin')) + '</span>' + chips('f-origin', [['born', t('born')], ['bought', t('bought')]], a.origin || 'born') + '</div>' +
      '<div class="field"><label for="f-breed">' + esc(t('breed')) + '</label><input id="f-breed" list="dl-breed" autocomplete="off" value="' + esc(a.breed || '') + '"><datalist id="dl-breed"></datalist></div>' +
      '<div class="field"><label for="f-camp">' + esc(t('camp')) + '</label><input id="f-camp" list="dl-camp" autocomplete="off" value="' + esc(a.camp || '') + '"><datalist id="dl-camp">' + camps.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></div>' +
      '<div class="field"><label for="f-notes">' + esc(t('notes')) + '</label><textarea id="f-notes">' + esc(a.notes || '') + '</textarea></div>' +
      '<p class="err" id="f-err" role="alert" hidden></p></div>' +
      '<div class="foot"><button class="btn alt" id="f-cancel">' + esc(t('cancel')) + '</button><button class="btn" id="f-save">' + esc(t('saveAnimal')) + '</button></div>';

    openSheet(html, function (w) {
      var species = a.species, sex = a.sex, origin = a.origin || 'born', colour = a.tags.colour || 'yellow', isTagged = tagged;
      function group(id, cb) { $$('#' + id + ' .chip', w).forEach(function (b) { b.addEventListener('click', function () { $$('#' + id + ' .chip', w).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); cb(b.getAttribute('data-v')); }); }); }
      function sync() {
        $('#g-cattle', w).hidden = species !== 'cattle';
        $('#g-small', w).hidden = species === 'cattle';
        $('#g-baits', w).hidden = !(species === 'cattle' && isTagged);
        var dl = $('#dl-breed', w); dl.innerHTML = breeds[species].map(function (b) { return '<option value="' + b + '">'; }).join('');
        check();
      }
      function check() {
        var c = $('#f-chk', w);
        if (species !== 'cattle' || !isTagged) { c.textContent = ''; return null; }
        var r = tagCheck($('#f-ana', w).value, $('#f-ele', w).value);
        c.className = 'check ' + r.cls;
        c.textContent = (r.cls === 'ok' ? '✓ ' : r.cls === 'bad' ? '✕ ' : '') + t(r.k);
        return r;
      }
      group('f-species', function (v) { species = v; sync(); });
      group('f-sex', function (v) { sex = v; });
      group('f-origin', function (v) { origin = v; });
      group('f-colour', function (v) { colour = v; });
      group('f-tagged', function (v) { isTagged = v === 'yes'; sync(); });
      $('#f-ana', w).addEventListener('input', check);
      $('#f-ele', w).addEventListener('input', check);
      $('#f-close', w).addEventListener('click', function () { closeSheet(w); });
      $('#f-cancel', w).addEventListener('click', function () { closeSheet(w); });
      sync();
      if (opts.tagNow) setTimeout(function () { var f = $('#f-ana', w); if (f) f.focus(); }, 60);

      $('#f-save', w).addEventListener('click', function () {
        var err = $('#f-err', w); err.hidden = true;
        function fail(msg) { err.textContent = msg; err.hidden = false; err.scrollIntoView({ block: 'nearest' }); }
        var dob = $('#f-dob', w).value;
        if (dob && dob > today()) return fail(t('futureDob'));
        var n = clone(a);
        n.species = species; n.sex = sex; n.origin = origin; n.dob = dob || '';
        n.breed = $('#f-breed', w).value.trim(); n.camp = $('#f-camp', w).value.trim(); n.notes = $('#f-notes', w).value.trim();
        var oldTag = existing && existing.species === 'cattle' ? (existing.tags && existing.tags.ana) : (existing && existing.farmTag);
        var newTag = '';
        if (species === 'cattle') {
          n.farmTag = '';
          if (isTagged) {
            var r = check();
            if (!r || !r.ok) return fail(t(r ? r.k : 'chk_empty'));
            var tdate = $('#f-tdate', w).value; if (!tdate) return fail(t('needDate'));
            if (tdate > today()) return fail(t('futureDob'));
            var ana = digits($('#f-ana', w).value);
            var dup = state.animals.filter(function (x) { return x.id !== n.id && x.tags && digits(x.tags.ana) === ana; })[0];
            if (dup) return fail(t('dupTag'));
            n.tags = { ana: ana, ele: $('#f-ele', w).value.trim(), colour: colour, taggedOn: tdate };
            newTag = ana;
          } else { n.tags = { colour: colour }; }
        } else {
          n.tags = { colour: 'yellow' }; n.farmTag = $('#f-ftag', w).value.trim(); newTag = n.farmTag;
        }
        var now = new Date().toISOString(); n.updatedAt = now;
        if (isNew) { n.id = uid(); n.createdAt = now; n.status = 'healthy'; n.statusNote = ''; n.events = [{ at: today(), type: 'added' }]; }
        n.events = n.events || [];
        if (newTag && newTag !== oldTag && species === 'cattle') n.events.push({ at: n.tags.taggedOn, type: 'tagged', tag: fmtAna(newTag) });
        else if (newTag && newTag !== oldTag) n.events.push({ at: today(), type: 'tagged', tag: newTag });
        save(n, function () { closeSheet(w); toast(t('saved')); });
      });
    });
  }

  /* ---------- settings, backup, sample mode ---------- */
  function requestPersist() {
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(function (ok) { state.persisted = ok; }).catch(function () {});
    } catch (e) {}
  }
  function download(name, text) {
    var blob = new Blob([text], { type: 'application/json' }), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function switchMode(m) { pref('kb-mode', m === 'sample' ? 'sample' : null); location.reload(); }

  function openSettings() {
    var storageP = Promise.resolve(state.persisted);
    try { if (navigator.storage && navigator.storage.persisted) storageP = navigator.storage.persisted(); } catch (e) {}
    storageP.then(function (persisted) {
      var lb = pref('kb-lastbackup');
      var storageTxt = memOnly ? t('storageNA') : persisted ? t('storageOk') : t('storageNo');
      var html = '<div class="sheet-in"><div class="sheet-head"><h2>' + esc(t('settings')) + '</h2><button class="x" id="s-close" aria-label="' + esc(t('close')) + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
        '<div class="field"><span class="lab">' + esc(t('language')) + '</span><div class="chips" id="s-lang"><button class="chip" data-v="en" aria-pressed="' + (lang === 'en') + '">English</button><button class="chip" data-v="tn" aria-pressed="' + (lang === 'tn') + '">Setswana</button></div></div>' +
        '<div class="group"><h3>' + esc(t('yourData')) + '</h3><p class="hint" style="font-size:13.5px;margin:0">' + esc(t('dataText')) + '</p>' +
          '<div class="kv"><span>' + esc(t('storage')) + '</span><span style="text-align:right">' + esc(storageTxt) + '</span></div>' +
          '<div class="kv"><span>' + esc(t('offlineStatus')) + '</span><span style="text-align:right">' + esc(state.swReady ? t('offlineYes') : t('offlineNo')) + '</span></div></div>' +
        '<div class="group"><h3>' + esc(t('backup')) + '</h3><div class="hint">' + esc((lb ? t('lastBackup', { d: fmtDate(lb) }) : t('neverBackup')) + (changes() ? ' · ' + t('changesN', { n: changes() }) : '')) + '</div>' +
          '<button class="btn" id="s-export">' + esc(t('exportB')) + '</button>' +
          '<label class="btn alt" for="s-file" style="cursor:pointer">' + esc(t('importB')) + '</label><input type="file" id="s-file" accept="application/json,.json" hidden></div>' +
        '<div class="group"><h3>' + esc(t('sampleMode')) + '</h3>' + (mode === 'sample' ? '<p class="hint" style="font-size:13.5px;margin:0">' + esc(t('sampleOn')) + '</p><button class="btn alt" id="s-mine">' + esc(t('useMine')) + '</button>' : '<button class="btn alt" id="s-sample">' + esc(t('openSample')) + '</button>') + '</div>' +
        '<div id="s-install"></div>' +
        '<div class="group"><button class="btn danger" id="s-erase">' + esc(t('erase')) + '</button><div id="s-confirm"></div></div>' +
        '<p class="hint" style="text-align:center">' + esc(t('version', { v: VERSION })) + '</p></div>';
      openSheet(html, function (w) {
        $('#s-close', w).addEventListener('click', function () { closeSheet(w); });
        $$('#s-lang .chip', w).forEach(function (b) { b.addEventListener('click', function () { lang = b.getAttribute('data-v'); pref('kb-lang', lang); applyI18n(document); refresh(); closeSheet(w); openSettings(); }); });
        $('#s-export', w).addEventListener('click', function () {
          var data = { app: 'kraalbook', version: 2, exportedAt: new Date().toISOString(), animals: state.animals.concat(state.gone), tasks: state.tasks };
          download('kraalbook-backup-' + today() + '.json', JSON.stringify(data, null, 2));
          if (mode === 'real') { pref('kb-lastbackup', today()); pref('kb-changes', '0'); }
          toast(t('exported')); renderBanner(); closeSheet(w); openSettings();
        });
        $('#s-file', w).addEventListener('change', function (e) {
          var f = e.target.files && e.target.files[0]; if (!f) return;
          var rd = new FileReader();
          rd.onload = function () {
            var d; try { d = JSON.parse(rd.result); } catch (x) { d = null; }
            if (!d || d.app !== 'kraalbook' || !Array.isArray(d.animals)) { toast(t('importBad')); return; }
            var na = d.animals.filter(function (a) { return a && a.id && a.species; }).length, nt = (d.tasks || []).length;
            $('#s-confirm', w).innerHTML = '<div class="confirm" style="margin-top:10px"><span>' + esc(t('restoreAsk', { a: na, k: nt, d: d.exportedAt ? fmtDate(d.exportedAt.slice(0, 10)) : '?' })) + '</span><div class="row2"><button class="btn alt small" id="r-no">' + esc(t('cancel')) + '</button><button class="btn small" id="r-yes">' + esc(t('restoreYes')) + '</button></div></div>';
            $('#r-no', w).addEventListener('click', function () { $('#s-confirm', w).innerHTML = ''; $('#s-file', w).value = ''; });
            $('#r-yes', w).addEventListener('click', function () { var save0 = mode; doRestore(d, w); });
          };
          rd.readAsText(f);
        });
        var sm = $('#s-sample', w); if (sm) sm.addEventListener('click', function () { switchMode('sample'); });
        var mi = $('#s-mine', w); if (mi) mi.addEventListener('click', function () { switchMode('real'); });
        if (state.installEvt) {
          $('#s-install', w).innerHTML = '<button class="btn alt" id="s-inst">' + esc(t('install')) + '</button>';
          $('#s-inst', w).addEventListener('click', function () { state.installEvt.prompt(); });
        } else if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone) {
          $('#s-install', w).innerHTML = '<p class="hint" style="font-size:13.5px;margin:0">' + esc(t('iosInstall')) + '</p>';
        }
        $('#s-erase', w).addEventListener('click', function () {
          $('#s-confirm', w).innerHTML = '<div class="confirm" style="margin-top:10px"><span>' + esc(t('eraseAsk')) + '</span><div class="row2"><button class="btn alt small" id="e-no">' + esc(t('cancel')) + '</button><button class="btn danger small" id="e-yes">' + esc(t('eraseYes')) + '</button></div></div>';
          $('#e-no', w).addEventListener('click', function () { $('#s-confirm', w).innerHTML = ''; });
          $('#e-yes', w).addEventListener('click', function () {
            dbClear().then(function () { return dbTaskClear(); }).then(function () { state.animals = []; state.gone = []; state.tasks = []; if (mode === 'sample') return dbMetaSet('seeded', false).then(function () { return dbMetaSet('seededTasks', false); }); }).then(function () { pref('kb-lastbackup', null); closeSheet(w); refresh(); toast(t('erased')); }).catch(function () { toast(t('cantSave')); });
          });
        });
      });
    });
  }

  function doRestore(d, w) {
            var n = 0, chain = Promise.resolve();
            d.animals.forEach(function (a) {
              if (!a || !a.id || !a.species) return;
              var cur = findAnyAnimal(a.id);
              if (cur && (cur.updatedAt || '') >= (a.updatedAt || '')) return;
              n++; chain = chain.then(function () { return dbPut(a); }).then(function () { state.animals = state.animals.filter(function (x) { return x.id !== a.id; }); state.gone = state.gone.filter(function (x) { return x.id !== a.id; }); if (a.gone) state.gone.push(a); else state.animals.push(a); });
            });
            (d.tasks || []).forEach(function (k) {
              if (!k || !k.id || !k.type) return;
              var ck = state.tasks.filter(function (x) { return x.id === k.id; })[0];
              if (ck && (ck.updatedAt || '') >= (k.updatedAt || '')) return;
              chain = chain.then(function () { return putTask(k); });
            });
            chain.then(function () { refresh(); closeSheet(w); toast(t('imported', { n: n })); }).catch(function () { toast(t('cantSave')); });
  }

  function openWelcome() {
    var html = '<div class="sheet-in"><h2>' + esc(t('welcomeTitle')) + '</h2><ul class="wl"><li>' + esc(t('w1')) + '</li><li>' + esc(t('w2')) + '</li><li>' + esc(t('w3')) + '</li></ul>' +
      '<div class="chips" id="w-lang"><button class="chip" data-v="en" aria-pressed="' + (lang === 'en') + '">English</button><button class="chip" data-v="tn" aria-pressed="' + (lang === 'tn') + '">Setswana</button></div>' +
      '<button class="btn" id="w-start">' + esc(t('startMine')) + '</button><button class="btn alt" id="w-sample">' + esc(t('trySample')) + '</button></div>';
    openSheet(html, function (w) {
      $$('#w-lang .chip', w).forEach(function (b) { b.addEventListener('click', function () { lang = b.getAttribute('data-v'); pref('kb-lang', lang); closeSheet(w); applyI18n(document); refresh(); openWelcome(); }); });
      $('#w-start', w).addEventListener('click', function () { pref('kb-welcomed', '1'); closeSheet(w); requestPersist(); });
      $('#w-sample', w).addEventListener('click', function () { pref('kb-welcomed', '1'); switchMode('sample'); });
    });
  }

  /* ---------- sample data (fictional, dates relative to today) ---------- */
  function sampleData() {
    var td = today(), out = [];
    function ev(at, type, extra) { var e = { at: at, type: type }; for (var k in (extra || {})) e[k] = extra[k]; return e; }
    function cattle(n, sex, ageMonths, breed, camp, status) {
      var dob = addMonths(td, -ageMonths), ana = String(90000100 + n), tdate = addDays(dob, 40 < ageMonths * 30 ? 40 : 1);
      if (tdate > td) tdate = td;
      var a = { id: uid(), species: 'cattle', sex: sex, dob: dob, origin: 'born', breed: breed, camp: camp, notes: '', status: status || 'healthy', statusNote: '', farmTag: '',
        tags: { ana: ana, ele: '0000' + ana, colour: 'yellow', taggedOn: tdate }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), events: [ev(dob, 'added'), ev(tdate, 'tagged', { tag: fmtAnaEN(ana) })] };
      if (status && status !== 'healthy') { a.statusNote = status === 'injured' ? 'Limping, left hind leg' : 'Not eating well'; a.events.push(ev(addDays(td, -2), 'status', { status: status, note: a.statusNote })); }
      return a;
    }
    function fmtAnaEN(a) { return 'BW ' + a.slice(0, 4) + ' ' + a.slice(4); }
    function calf(sex, ageMonths, camp) {
      var dob = addMonths(td, -ageMonths);
      return { id: uid(), species: 'cattle', sex: sex, dob: dob, origin: 'born', breed: 'Tuli', camp: camp, notes: '', status: 'healthy', statusNote: '', farmTag: '', tags: { colour: 'yellow' },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), events: [ev(dob, 'added')] };
    }
    function small(sp, n, sex, ageMonths, breed, camp, status) {
      var dob = addMonths(td, -ageMonths), tag = (sp === 'goat' ? 'G-' : 'S-') + String(n).padStart(3, '0');
      var a = { id: uid(), species: sp, sex: sex, dob: dob, origin: 'born', breed: breed, camp: camp, notes: '', status: status || 'healthy', statusNote: '', farmTag: tag, tags: { colour: 'yellow' },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), events: [ev(dob, 'added'), ev(dob, 'tagged', { tag: tag })] };
      if (status && status !== 'healthy') { a.statusNote = 'Not eating well'; a.events.push(ev(addDays(td, -1), 'status', { status: status, note: a.statusNote })); }
      return a;
    }
    out.push(cattle(1, 'F', 52, 'Brahman', 'Kraal A'), cattle(2, 'F', 40, 'Brahman', 'Kraal A'), cattle(3, 'M', 72, 'Tuli', 'Camp 2'), cattle(4, 'F', 30, 'Tswana', 'Kraal A'),
      cattle(5, 'M', 20, 'Tuli', 'Camp 2', 'injured'), cattle(6, 'F', 14, 'Tswana', 'Kraal B'), calf('M', 2, 'Kraal B'), calf('F', 1, 'Kraal A'), calf('F', 4, 'Kraal B'));
    out.push(small('goat', 18, 'F', 24, 'Boer', 'Goat pen', 'sick'), small('goat', 19, 'F', 30, 'Boer', 'Goat pen'), small('goat', 23, 'M', 1, 'Boer', 'Goat pen'), small('goat', 24, 'F', 12, 'Tswana', 'Goat pen'));
    out.push(small('sheep', 4, 'F', 28, 'Dorper', 'Camp 1'), small('sheep', 5, 'M', 18, 'Dorper', 'Camp 1'));
    return out;
  }

  /* ================= tasks and in-app reminders ================= */
  var EN2 = {
    tabHerd: 'Herd', tabTasks: 'Tasks', addTask: 'Add task',
    g_overdue: 'Overdue', g_today: 'Today', g_week: 'Next 7 days', g_later: 'Later', g_done: 'Done recently',
    due_today: 'Today', due_tomorrow: 'Tomorrow', due_overdue1: '1 day overdue', due_overdueN: '{n} days overdue',
    noTasksTitle: 'No tasks yet', noTasksText: 'Add a task like dipping or vaccination. Ear-tag reminders appear here by themselves.',
    tt_dip: 'Dipping', tt_vaccinate: 'Vaccination', tt_weigh: 'Weighing', tt_dose: 'Dosing (dewormer)', tt_dehorn: 'Dehorning', tt_brand: 'Branding',
    tt_custom: 'Your own task', tt_move: 'Movement permit', tt_mort: 'Mortality report', tt_arr: 'Arrival registration', tt_xfer: 'Transfer of ownership',
    tt_repl: 'Replace a lost tag', tt_ret: 'Submit BAITS return', tt_bolus: 'Return bolus to DVS office', tt_tag: 'Ear-tagging',
    pickType: 'What do you want to add?', grpEveryday: 'Everyday tasks', grpBaits: 'BAITS tasks (cattle)', grpOwn: 'Your own',
    cattleOnly: 'Cattle only', anySpecies: 'Cattle, goats, sheep', baitsPill: 'BAITS', ownSub: 'Make up a task for your farm',
    taskName: 'Task name', taskNamePh: 'For example: Weaning calves', who: 'Which animals', wholeGroup: 'Whole group', chooseAnimals: 'Choose animals',
    noAnimals: 'No animals (farm job)', sp_all: 'All animals', selAll: 'Select all', clearSel: 'Clear', selectedN: '{n} selected',
    dueDate: 'Due date', repeat: 'Repeat', rep_none: 'Does not repeat', rep_w1: 'Every week', rep_w2: 'Every 2 weeks', rep_m1: 'Every month', rep_m3: 'Every 3 months', rep_y1: 'Every year',
    saveTask: 'Add task', needAnimal: 'Choose at least one animal.', needName: 'Enter a task name.', needOne: 'Choose one animal.', back: 'Back',
    moveDate: 'Moving date', applyBy: 'Apply by {d}', tooSoon: 'Too soon. Apply at least 2 working days before moving.', moveHint: 'Counts Monday to Friday only. Ask DVS if a public holiday falls in between.',
    whatHappened: 'What happened', m_dis: 'Disease', m_inj: 'Injury', m_slaug: 'Slaughtered', m_oth: 'Other', hadBolus: 'Had a bolus', yes: 'Yes', no: 'No', dateOfDeath: 'Date',
    lostTag: 'Which tag was lost', elec: 'Electronic', analog: 'Analogue', arrNotes: 'Animals and where they came from',
    before: 'Before you start', baitsNote: 'You submit this in BAITS or at a DVS office. KraalBook only tracks it.',
    r_m1: 'You are a registered keeper', r_m2: 'Animals are registered to you in BAITS', r_m3: 'Your brand certificate is valid', r_m4: 'Animals and holding are not under restrictions', r_m5: 'Wait for DVS approval before moving',
    r_d1: 'Animal is identified and registered in BAITS', r_d2: 'Report to DVS online or at any DVS office', r_d3: 'Return any bolus to the nearest DVS office',
    r_a2: 'Animals are officially identified and registered in BAITS', r_a3: 'Register every move to a new holding, even without a permit', r_a4: 'Register online or at any DVS office',
    r_x1: 'Both keepers are registered', r_x2: 'Both brands are valid', r_x4: 'Current keeper starts it online; new owner accepts',
    r_r1: 'Buy replacement tags from the LAC or an authorised seller', r_r2: 'Electronic tag lost: replace both tags', r_r3: 'Only the analogue tag lost: replace the analogue tag', r_r4: 'Submit a return within 14 days of tagging',
    r_t1: 'The animal is tagged and the holding is registered in BAITS', r_t2: 'Submit within 14 days of tagging, online or on the form',
    dueOn: 'Due', repeats: 'Repeats', animalsL: 'Animals', details: 'Details', doneOnL: 'Done on', markDone: 'Mark as done', changeDue: 'Change due date', saveDate: 'Save date',
    deleteTask: 'Delete task', deleteAsk: 'Delete this task? This cannot be undone.', deleteYes: 'Yes, delete', taskDone: 'Task done', dateSaved: 'Date changed', taskAdded: 'Task added', taskDeleted: 'Task deleted',
    doneTitle: 'Mark as done', doneOn: 'Done on', doneFor: 'Done for these animals', leftOut: 'Left out: {why}', followUp: 'Keep a follow-up task for the animals left out (due in 7 days)',
    confirmBaits: 'I did this in BAITS or at a DVS office.', needConfirm: 'Tick the box to confirm.', removeHerd: 'Remove from my herd', doneBtn: 'Done', nextDue: 'Next one is due {d}', noAnimalsHere: 'No animals are linked to this task.',
    ev_task: '{task} done',
    tagCardOne: 'Ear-tag 1 animal', tagCardN: 'Ear-tag {n} animals', tagCardHint: 'Done when you save the tag numbers.', tagListTitle: 'Animals that need an ear tag',
    remTitle: 'Reminders', remText: 'These tasks need attention.', remBanner1: '1 task needs attention', remBannerN: '{n} tasks need attention', remSub: '{o} overdue · {t} due today', open: 'Open', openTasks: 'Open tasks', later: 'Later',
    farmJob: 'Farm job', nAnimals: '{n} animals', allOf: 'All {sp} ({n})', autoTag: 'Added automatically after tagging',
    sick: 'Sick', injured: 'Injured', sickLeft: 'sick', injuredLeft: 'injured', remindNote: 'Reminders show inside the app. KraalBook sends no messages.'
  };
  var TN2 = {
    tabHerd: 'Mohlape', tabTasks: 'Ditiro', addTask: 'Tsenya tiro',
    g_overdue: 'Di feditse nako', g_today: 'Gompieno', g_week: 'Matsatsi a le 7 a a tlang', g_later: 'Moragonyana', g_done: 'Di dirilwe jaaka moragonyana',
    due_today: 'Gompieno', due_tomorrow: 'Kamoso', due_overdue1: 'Letsatsi le le 1 le feditse', due_overdueN: 'Matsatsi a le {n} a feditse',
    noTasksTitle: 'Ga go na ditiro', noTasksText: 'Tsenya tiro jaaka go thapisa kana go kentela. Dikgopotso tsa ditag tsa tsebe di tla tla ka bodiyo.',
    tt_dip: 'Go thapisa', tt_vaccinate: 'Ditlhabelo', tt_weigh: 'Go kala boima', tt_dose: 'Go naya moriana', tt_dehorn: 'Go tlosa dinaka', tt_brand: 'Go gatisa letshwao',
    tt_custom: 'Tiro ya gago', tt_move: 'Tetla ya go fudusa', tt_mort: 'Pegelo ya go swa', tt_arr: 'Go kwadisa go goroga', tt_xfer: 'Go fetisa go nna mong',
    tt_repl: 'Go busetsa tag e e latlhegileng', tt_ret: 'Romela pegelo ya BAITS', tt_bolus: 'Busetsa bolus kwa ofising ya DVS', tt_tag: 'Go tshwaya ka tag ya tsebe',
    pickType: 'O batla go tsenya eng?', grpEveryday: 'Ditiro tsa letsatsi le letsatsi', grpBaits: 'Ditiro tsa BAITS (dikgomo)', grpOwn: 'Tsa gago',
    cattleOnly: 'Dikgomo fela', anySpecies: 'Dikgomo, dipodi, dinku', baitsPill: 'BAITS', ownSub: 'Dira tiro ya polase ya gago',
    taskName: 'Leina la tiro', taskNamePh: 'Sekai: Go gagola ditsala', who: 'Ke diphologolo dife', wholeGroup: 'Setlhopha sotlhe', chooseAnimals: 'Kgetha diphologolo',
    noAnimals: 'Ga go na diphologolo (tiro ya polase)', sp_all: 'Diphologolo tsotlhe', selAll: 'Kgetha tsotlhe', clearSel: 'Phimola', selectedN: '{n} di kgethilwe',
    dueDate: 'Letlha la go dira', repeat: 'Boeletsa', rep_none: 'Ga e boelediwe', rep_w1: 'Beke le beke', rep_w2: 'Dibeke tse pedi dingwe le dingwe', rep_m1: 'Kgwedi le kgwedi', rep_m3: 'Dikgwedi tse 3 dingwe le dingwe', rep_y1: 'Ngwaga le ngwaga',
    saveTask: 'Tsenya tiro', needAnimal: 'Kgetha bonnye phologolo e le nngwe.', needName: 'Kwala leina la tiro.', needOne: 'Kgetha phologolo e le nngwe.', back: 'Boela morago',
    moveDate: 'Letlha la go fudusa', applyBy: 'Kopa pele ga {d}', tooSoon: 'Go sa le gale. Kopa bonnye matsatsi a le 2 a tiro pele o fudusa.', moveHint: 'Go bala Mosupologo go ya go Labotlhano fela. Botsa DVS fa letsatsi la boikhutso le le gare.',
    whatHappened: 'Go diragetse eng', m_dis: 'Bolwetse', m_inj: 'Kgobalo', m_slaug: 'E tlhabilwe', m_oth: 'Tse dingwe', hadBolus: 'E ne e na le bolus', yes: 'Ee', no: 'Nnyaa', dateOfDeath: 'Letlha',
    lostTag: 'Ke tag efe e e latlhegileng', elec: 'Elektronike', analog: 'Analogue', arrNotes: 'Diphologolo le gore di tswa kae',
    before: 'Pele o simolola', baitsNote: 'O e romela mo BAITS kana kwa ofising ya DVS. KraalBook e e latela fela.',
    r_m1: 'O kwadisitswe jaaka motlhokomedi wa diruiwa', r_m2: 'Diphologolo di kwadisitswe mo go wena mo BAITS', r_m3: 'Setifikeiti sa gago sa letshwao se a dira', r_m4: 'Diphologolo le polase ga di mo tlase ga dithibelo', r_m5: 'Leta tetla ya DVS pele o fudusa',
    r_d1: 'Phologolo e itsisitswe e bile e kwadisitswe mo BAITS', r_d2: 'Bega kwa DVS kwa inthaneteng kana kwa ofising epe ya DVS', r_d3: 'Busetsa bolus epe kwa ofising e e gaufi ya DVS',
    r_a2: 'Diphologolo di itsisitswe ka semmuso e bile di kwadisitswe mo BAITS', r_a3: 'Kwadisa gotlhe go fudusetsa kwa polaseng e nngwe, le fa go se na tetla', r_a4: 'Kwadisa kwa inthaneteng kana kwa ofising epe ya DVS',
    r_x1: 'Batlhokomedi botlhe ba babedi ba kwadisitswe', r_x2: 'Matshwao otlhe a babedi a a dira', r_x4: 'Motlhokomedi wa jaanong o e simolola kwa inthaneteng; mong yo moswa o a e amogela',
    r_r1: 'Reka ditag tse dintšha kwa LAC kana kwa morekising yo o letlelelwang', r_r2: 'Tag ya elektronike e latlhegile: busetsa ditag tsotlhe pedi', r_r3: 'Tag ya analogue fela e latlhegile: busetsa ya analogue', r_r4: 'Romela pegelo mo matsatsing a le 14 morago ga go tshwaya',
    r_t1: 'Phologolo e na le tag mme polase e kwadisitswe mo BAITS', r_t2: 'Romela mo matsatsing a le 14 morago ga go tshwaya, kwa inthaneteng kana ka foromo',
    dueOn: 'Nako', repeats: 'E boelediwa', animalsL: 'Diphologolo', details: 'Dintlha', doneOnL: 'E dirilwe ka', markDone: 'Tshwaya e dirilwe', changeDue: 'Fetola letlha', saveDate: 'Boloka letlha',
    deleteTask: 'Phimola tiro', deleteAsk: 'A o batla go phimola tiro eno? Se ka se boelediwe.', deleteYes: 'Ee, phimola', taskDone: 'Tiro e dirilwe', dateSaved: 'Letlha le fetotswe', taskAdded: 'Tiro e okeditswe', taskDeleted: 'Tiro e phimotswe',
    doneTitle: 'Tshwaya e dirilwe', doneOn: 'E dirilwe ka', doneFor: 'E dirilwe mo diphologolong tse', leftOut: 'Di tlogetswe: {why}', followUp: 'Boloka tiro ya go latela ya diphologolo tse di tlogetsweng (mo matsatsing a le 7)',
    confirmBaits: 'Ke e dirile mo BAITS kana kwa ofising ya DVS.', needConfirm: 'Tshwaya lebokose go netefatsa.', removeHerd: 'Tlosa mo mohlapeng wa me', doneBtn: 'E dirilwe', nextDue: 'E e latelang e tshwanetse {d}', noAnimalsHere: 'Ga go na diphologolo tse di golaganngwang le tiro eno.',
    ev_task: '{task} e dirilwe',
    tagCardOne: 'Tshwaya phologolo e le 1 ka tag ya tsebe', tagCardN: 'Tshwaya diphologolo di le {n} ka tag ya tsebe', tagCardHint: 'E fela fa o boloka dinomoro tsa ditag.', tagListTitle: 'Diphologolo tse di tlhokang tag ya tsebe',
    remTitle: 'Dikgopotso', remText: 'Ditiro tse di tlhoka kakgelo.', remBanner1: 'Tiro e le 1 e tlhoka kakgelo', remBannerN: 'Ditiro di le {n} di tlhoka kakgelo', remSub: '{o} di feditse nako · {t} gompieno', open: 'Bula', openTasks: 'Bula ditiro', later: 'Moragonyana',
    farmJob: 'Tiro ya polase', nAnimals: 'Diphologolo di le {n}', allOf: '{sp} tsotlhe ({n})', autoTag: 'E okeditswe ka bodiyo morago ga go tshwaya',
    sick: 'E a lwala', injured: 'E gobetse', sickLeft: 'e a lwala', injuredLeft: 'e gobetse', remindNote: 'Dikgopotso di bonala mo teng ga app. KraalBook ga e romele melaetsa.'
  };
  (function () { for (var k in EN2) EN[k] = EN2[k]; for (var j in TN2) TN[j] = TN2[j]; })();
  var WD = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], tn: ['Sontaga', 'Mosupologo', 'Labobedi', 'Laboraro', 'Labone', 'Labotlhano', 'Matlhatso'] };
  function wdayOf(iso) { var p = parts(iso); return new Date(p.y, p.m - 1, p.d).getDay(); }
  function fmtDay(iso) { var p = parts(iso); return WD[lang][wdayOf(iso)] + ' ' + p.d + ' ' + MONTHS[lang][p.m - 1]; }
  function applyBy(moveIso, n) {
    var d = moveIso, c = 0;
    while (c < n) { d = addDays(d, -1); var w = wdayOf(d); if (w !== 0 && w !== 6) c++; }
    return d;
  }

  var TT = {
    dip: { kind: 'std', sp: 'all', ui: 'group', rep: true }, vaccinate: { kind: 'std', sp: 'all', ui: 'group', rep: true },
    weigh: { kind: 'std', sp: 'all', ui: 'group', rep: true }, dose: { kind: 'std', sp: 'all', ui: 'group', rep: true },
    dehorn: { kind: 'std', sp: 'cattle', ui: 'group', rep: true }, brand: { kind: 'std', sp: 'all', ui: 'group', rep: true },
    custom: { kind: 'custom', sp: 'all', ui: 'group', rep: true },
    move: { kind: 'baits', sp: 'cattle', ui: 'pick', x: 'move' }, mort: { kind: 'baits', sp: 'cattle', ui: 'one', x: 'mort' },
    arr: { kind: 'baits', sp: 'cattle', ui: 'free', x: 'arr' }, xfer: { kind: 'baits', sp: 'cattle', ui: 'pick', x: 'xfer' },
    repl: { kind: 'baits', sp: 'cattle', ui: 'one', x: 'repl' }, ret: { kind: 'baits', sp: 'cattle', ui: 'auto' }, bolus: { kind: 'baits', sp: 'cattle', ui: 'auto' }
  };
  var RULES = { move: ['r_m1', 'r_m2', 'r_m3', 'r_m4', 'r_m5'], mort: ['r_d1', 'r_d2', 'r_d3'], arr: ['r_m1', 'r_a2', 'r_a3', 'r_a4'], xfer: ['r_x1', 'r_x2', 'r_a2', 'r_x4'], repl: ['r_r1', 'r_r2', 'r_r3', 'r_r4'], ret: ['r_t1', 'r_t2'], bolus: ['r_d3'] };
  var EVERYDAY = ['dip', 'vaccinate', 'weigh', 'dose', 'dehorn', 'brand'];
  var BAITS = ['move', 'mort', 'arr', 'xfer', 'repl'];

  function toDays(rep) { return null; }
  function nextDue(from, rep) {
    var n = +rep.slice(1), u = rep.charAt(0);
    return u === 'w' ? addDays(from, 7 * n) : addMonths(from, u === 'y' ? 12 * n : n);
  }
  function taskName(k) { return k.type === 'custom' ? (k.title || t('tt_custom')) : t('tt_' + k.type); }
  function speciesPlural(s) { return t(s === 'cattle' ? 'cattle' : s === 'goat' ? 'goats' : 'sheep'); }
  function scopeAnimals(k) {
    var s = k.scope || { mode: 'none' };
    if (s.mode === 'all') return state.animals.filter(function (a) { return k.species === 'all' || a.species === k.species; });
    if (s.mode === 'animals') return state.animals.filter(function (a) { return (s.ids || []).indexOf(a.id) >= 0; });
    return [];
  }
  function scopeText(k) {
    var s = k.scope || { mode: 'none' };
    if (s.mode === 'all') { var n = scopeAnimals(k).length; return k.species === 'all' ? t('sp_all') + ' (' + n + ')' : t('allOf', { sp: speciesPlural(k.species), n: n }); }
    if (s.mode === 'animals') {
      var list = (k.scope.ids || []).map(findAnyAnimal).filter(Boolean);
      if (!list.length) return t('farmJob');
      return list.length === 1 ? tagLabel(list[0]) : t('nAnimals', { n: list.length });
    }
    return k.type === 'arr' ? (k.notes || t('farmJob')) : t('farmJob');
  }
  function dueLabel(due) {
    var d = daysBetween(today(), due);
    if (d < 0) return d === -1 ? t('due_overdue1') : t('due_overdueN', { n: -d });
    if (d === 0) return t('due_today'); if (d === 1) return t('due_tomorrow');
    return d <= 7 ? fmtDay(due) : fmtDate(due);
  }
  function duePill(due) {
    var d = daysBetween(today(), due), c = d < 0 ? 'bad' : d === 0 ? 'warn' : '';
    return '<span class="pill ' + c + '">' + esc(dueLabel(due)) + '</span>';
  }
  function groupOf(due) { var d = daysBetween(today(), due); return d < 0 ? 'overdue' : d === 0 ? 'today' : d <= 7 ? 'week' : 'later'; }
  function openTaskList() { return state.tasks.filter(function (k) { return k.status === 'open'; }); }
  function untagged() { return state.animals.filter(needsTag); }
  function tagItem() {
    var list = untagged(); if (!list.length) return null;
    var dues = list.map(tagBy).filter(Boolean).sort();
    return { virtual: true, animals: list, due: dues[0] || null };
  }
  function attention() {
    var td = today(), over = 0, now = 0;
    openTaskList().forEach(function (k) { if (k.due < td) over++; else if (k.due === td) now++; });
    var ti = tagItem(); if (ti && ti.due) { if (ti.due < td) over++; else if (ti.due === td) now++; }
    return { over: over, now: now, total: over + now };
  }
  function updateBadge() {
    var a = attention(), b = $('#tab-badge');
    if (b) { b.textContent = a.total; b.hidden = !a.total; }
  }

  /* --- storage for tasks --- */
  var memTasks = [];
  function dbTaskAll() { if (memOnly) return Promise.resolve(memTasks.slice()); return run('tasks', 'readonly', function (s) { return s.getAll(); }); }
  function dbTaskPut(k) {
    if (memOnly) { var i = memTasks.findIndex(function (x) { return x.id === k.id; }); if (i < 0) memTasks.push(clone(k)); else memTasks[i] = clone(k); return Promise.resolve(); }
    bump(); return run('tasks', 'readwrite', function (s) { s.put(k); });
  }
  function dbTaskDel(id) { if (memOnly) { memTasks = memTasks.filter(function (x) { return x.id !== id; }); return Promise.resolve(); } return run('tasks', 'readwrite', function (s) { s.delete(id); }); }
  function dbTaskClear() { if (memOnly) { memTasks = []; return Promise.resolve(); } return run('tasks', 'readwrite', function (s) { s.clear(); }); }
  function loadTasks() { return dbTaskAll().then(function (l) { state.tasks = l; }); }
  function splitAnimals(list) { state.animals = list.filter(function (a) { return !a.gone; }); state.gone = list.filter(function (a) { return a.gone; }); }
  function findAnyAnimal(id) { return state.animals.concat(state.gone).filter(function (a) { return a.id === id; })[0]; }
  function putTask(k) {
    k.updatedAt = new Date().toISOString();
    return dbTaskPut(k).then(function () { var i = state.tasks.findIndex(function (x) { return x.id === k.id; }); if (i < 0) state.tasks.push(k); else state.tasks[i] = k; });
  }
  function newTask(f) {
    var now = new Date().toISOString();
    return { id: uid(), type: f.type, title: f.title || '', species: f.species || 'all', scope: f.scope || { mode: 'none' }, due: f.due || today(), repeat: f.repeat || 'none',
      status: 'open', doneAt: '', notes: f.notes || '', meta: f.meta || {}, auto: !!f.auto, createdAt: now, updatedAt: now };
  }
  function ensureReturnTask(a) {
    if (!(a.species === 'cattle' && a.tags && a.tags.ana && a.tags.taggedOn)) return Promise.resolve();
    var due = addDays(a.tags.taggedOn, 14); if (due < today()) return Promise.resolve();
    var exists = state.tasks.some(function (x) { return x.type === 'ret' && x.status === 'open' && x.scope && (x.scope.ids || []).indexOf(a.id) >= 0; });
    if (exists) return Promise.resolve();
    return putTask(newTask({ type: 'ret', species: 'cattle', scope: { mode: 'animals', ids: [a.id] }, due: due, auto: true }));
  }

  /* --- the Tasks screen --- */
  var view = 'herd';
  function setView(v) {
    view = v;
    $$('#tabs .tab').forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('data-v') === v ? 'page' : 'false'); });
    refresh(); window.scrollTo(0, 0);
  }
  function taskRow(k, opts) {
    opts = opts || {};
    var sub = k.auto ? t('autoTag') : scopeText(k);
    var tick = opts.done ? '<span class="tick on" aria-hidden="true"></span>' : '<button class="tick" data-done="' + esc(k.id) + '" aria-label="' + esc(t('markDone')) + '"></button>';
    var pill = opts.done ? '<span class="pill ok">' + esc(fmtDate(k.doneAt)) + '</span>' : duePill(k.due);
    return '<div class="trow' + (opts.done ? ' isdone' : '') + '">' + tick + '<button class="tbody" data-open="' + esc(k.id) + '"><span class="atx"><b>' + esc(taskName(k)) + '</b><span>' + esc(sub) + '</span></span>' + pill + '</button></div>';
  }
  function renderTasks() {
    var open = openTaskList(), ti = tagItem(), groups = { overdue: [], today: [], week: [], later: [] };
    open.forEach(function (k) { groups[groupOf(k.due)].push(k); });
    Object.keys(groups).forEach(function (g) { groups[g].sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; }); });
    var tagG = ti ? (ti.due ? groupOf(ti.due) : 'later') : null;
    var cutoff = addDays(today(), -30);
    var done = state.tasks.filter(function (k) { return k.status === 'done' && k.doneAt >= cutoff; }).sort(function (a, b) { return a.doneAt < b.doneAt ? 1 : -1; }).slice(0, 12);
    var h = '', any = false;
    [['overdue', 'g_overdue'], ['today', 'g_today'], ['week', 'g_week'], ['later', 'g_later']].forEach(function (g) {
      var items = groups[g[0]], hasTag = tagG === g[0];
      if (!items.length && !hasTag) return;
      any = true;
      h += '<section class="tgroup"><h3 class="grp">' + esc(t(g[1])) + ' <span class="cnt">' + (items.length + (hasTag ? 1 : 0)) + '</span></h3><div class="trows">';
      if (hasTag) h += '<div class="trow"><span class="tick auto" aria-hidden="true"></span><button class="tbody" id="t-tags"><span class="atx"><b>' + esc(ti.animals.length === 1 ? t('tagCardOne') : t('tagCardN', { n: ti.animals.length })) + '</b><span>' + esc(t('tagCardHint')) + '</span></span>' + (ti.due ? duePill(ti.due) : '') + '</button></div>';
      h += items.map(function (k) { return taskRow(k); }).join('') + '</div></section>';
    });
    if (!any) h += '<div class="empty"><h2>' + esc(t('noTasksTitle')) + '</h2><p>' + esc(t('noTasksText')) + '</p><button class="btn" id="t-add0">' + esc(t('saveTask')) + '</button></div>';
    if (done.length) h += '<details class="donebox2"><summary>' + esc(t('g_done')) + ' (' + done.length + ')</summary><div class="trows">' + done.map(function (k) { return taskRow(k, { done: true }); }).join('') + '</div></details>';
    h += '<p class="hint" style="text-align:center;margin-top:18px">' + esc(t('remindNote')) + '</p>';
    main.innerHTML = h;
    $$('[data-done]', main).forEach(function (b) { b.addEventListener('click', function () { openDone(b.getAttribute('data-done')); }); });
    $$('[data-open]', main).forEach(function (b) { b.addEventListener('click', function () { openTaskDetail(b.getAttribute('data-open')); }); });
    var tg = $('#t-tags'); if (tg) tg.addEventListener('click', openTagList);
    var a0 = $('#t-add0'); if (a0) a0.addEventListener('click', function () { openAddTask(); });
  }
  function openTagList() {
    var list = untagged().sort(function (a, b) { return (tagBy(a) || '9999') < (tagBy(b) || '9999') ? -1 : 1; });
    var html = '<div class="sheet-in"><div class="sheet-head"><h2>' + esc(t('tagListTitle')) + '</h2><button class="x" id="l-close" aria-label="' + esc(t('close')) + '">' + XICON + '</button></div><div class="rows">' +
      list.map(function (a) {
        var d = tagBy(a);
        return '<button class="arow" data-id="' + esc(a.id) + '"><span class="atx"><b>' + esc(speciesOne(a.species)) + ' · ' + esc(t(a.sex === 'F' ? 'female' : 'male')) + '</b><span>' + esc([ageText(a.dob), a.camp].filter(Boolean).join(' · ')) + '</span></span>' + (d ? duePill(d) : '') + '</button>';
      }).join('') + '</div></div>';
    openSheet(html, function (w) {
      $('#l-close', w).addEventListener('click', function () { closeSheet(w); });
      $$('.arow', w).forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-id'); closeSheet(w); openDetail(id); }); });
    });
  }
  var XICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* --- add a task --- */
  function openAddTask(typeId) {
    if (typeId) return openTaskForm(typeId);
    var row = function (id, sub, baits) {
      return '<button class="arow" data-type="' + id + '"><span class="atx"><b>' + esc(t('tt_' + id)) + '</b><span>' + esc(sub) + '</span></span>' + (baits ? '<span class="pill warn">' + esc(t('baitsPill')) + '</span>' : '') + '</button>';
    };
    var html = '<div class="sheet-in"><div class="sheet-head"><h2>' + esc(t('pickType')) + '</h2><button class="x" id="p-close" aria-label="' + esc(t('close')) + '">' + XICON + '</button></div>' +
      '<h3 class="grp">' + esc(t('grpEveryday')) + '</h3><div class="rows" style="margin-top:0">' + EVERYDAY.map(function (id) { return row(id, t(TT[id].sp === 'cattle' ? 'cattleOnly' : 'anySpecies')); }).join('') + '</div>' +
      '<h3 class="grp">' + esc(t('grpBaits')) + '</h3><div class="rows" style="margin-top:0">' + BAITS.map(function (id) { return row(id, t('cattleOnly'), true); }).join('') + '</div>' +
      '<h3 class="grp">' + esc(t('grpOwn')) + '</h3><div class="rows" style="margin-top:0">' + row('custom', t('ownSub')) + '</div></div>';
    openSheet(html, function (w) {
      $('#p-close', w).addEventListener('click', function () { closeSheet(w); });
      $$('[data-type]', w).forEach(function (b) { b.addEventListener('click', function () { closeSheet(w); openTaskForm(b.getAttribute('data-type')); }); });
    });
  }

  function animalChecklist(list, one, selected) {
    return list.map(function (a) {
      return '<label class="chk"><input type="' + (one ? 'radio' : 'checkbox') + '" name="pick" value="' + esc(a.id) + '"' + (selected.indexOf(a.id) >= 0 ? ' checked' : '') + '><span class="atx"><b>' + esc(tagLabel(a)) + '</b><span>' +
        esc([speciesOne(a.species), t(a.sex === 'F' ? 'female' : 'male'), ageText(a.dob), a.camp].filter(Boolean).join(' · ')) + '</span></span></label>';
    }).join('');
  }
  function chipsHtml(id, items, sel) { return '<div class="chips" id="' + id + '">' + items.map(function (i) { return '<button type="button" class="chip" data-v="' + i[0] + '" aria-pressed="' + (sel === i[0]) + '">' + esc(i[1]) + '</button>'; }).join('') + '</div>'; }

  function openTaskForm(typeId) {
    var spec = TT[typeId], isCustom = typeId === 'custom';
    var f = { species: spec.sp === 'cattle' ? 'cattle' : 'all', scope: 'group', repeat: 'none', reason: 'dis', bolus: '1', lost: 'e' };
    var rules = RULES[typeId] || [];
    var html = '<div class="sheet-in"><div class="sheet-head"><h2>' + esc(t('tt_' + typeId)) + '</h2><button class="x" id="k-close" aria-label="' + esc(t('close')) + '">' + XICON + '</button></div>';
    if (isCustom) html += '<div class="field"><label for="k-title">' + esc(t('taskName')) + '</label><input id="k-title" placeholder="' + esc(t('taskNamePh')) + '" autocomplete="off"></div>';
    if (spec.ui === 'group') {
      var sps = spec.sp === 'cattle' ? [] : [['all', t('sp_all')], ['cattle', t('cattle')], ['goat', t('goats')], ['sheep', t('sheep')]];
      if (isCustom) sps.push(['none', t('noAnimals')]);
      html += '<div id="k-spf" class="field" ' + (sps.length ? '' : 'hidden') + '><span class="lab">' + esc(t('who')) + '</span>' + chipsHtml('k-sp', sps, f.species) + '</div>' +
        '<div id="k-scf" class="field"><span class="lab">' + (sps.length ? '&nbsp;' : esc(t('who'))) + '</span>' + chipsHtml('k-scope', [['group', t('wholeGroup')], ['pick', t('chooseAnimals')]], 'group') + '</div>';
    }
    if (spec.ui === 'pick' || spec.ui === 'one' || spec.ui === 'group') {
      var one = spec.ui === 'one';
      html += '<div id="k-listf" class="field" ' + (spec.ui === 'group' ? 'hidden' : '') + '><span class="lab">' + esc(one ? t('needOne').replace('.', '') : t('chooseAnimals')) + '</span>' +
        (one ? '' : '<div class="chips"><button type="button" class="chip" id="k-all">' + esc(t('selAll')) + '</button><button type="button" class="chip" id="k-none">' + esc(t('clearSel')) + '</button><span class="hint" id="k-cnt" style="align-self:center"></span></div>') +
        '<div class="chklist" id="k-list"></div></div>';
    }
    if (spec.x === 'move') html += '<div class="field"><label for="k-move">' + esc(t('moveDate')) + '</label><input id="k-move" type="date" value="' + addDays(today(), 6) + '" min="' + today() + '"><p class="check" id="k-ab" role="status"></p><span class="hint">' + esc(t('moveHint')) + '</span></div>';
    if (spec.x === 'mort') html += '<div class="field"><span class="lab">' + esc(t('whatHappened')) + '</span>' + chipsHtml('k-reason', [['dis', t('m_dis')], ['inj', t('m_inj')], ['slaug', t('m_slaug')], ['oth', t('m_oth')]], 'dis') + '</div>' +
      '<div class="field"><span class="lab">' + esc(t('hadBolus')) + '</span>' + chipsHtml('k-bolus', [['1', t('yes')], ['0', t('no')]], '1') + '</div>';
    if (spec.x === 'repl') html += '<div class="field"><span class="lab">' + esc(t('lostTag')) + '</span>' + chipsHtml('k-lost', [['e', t('elec')], ['a', t('analog')]], 'e') + '</div>';
    if (spec.x !== 'move') html += '<div class="field"><label for="k-due">' + esc(spec.x === 'mort' ? t('dateOfDeath') : t('dueDate')) + '</label><input id="k-due" type="date" value="' + today() + '"' + (spec.x === 'mort' ? ' max="' + today() + '"' : '') + '></div>';
    if (spec.rep) html += '<div class="field"><span class="lab">' + esc(t('repeat')) + '</span>' + chipsHtml('k-rep', [['none', t('rep_none')], ['w1', t('rep_w1')], ['w2', t('rep_w2')], ['m1', t('rep_m1')], ['m3', t('rep_m3')], ['y1', t('rep_y1')]], 'none') + '</div>';
    html += '<div class="field"><label for="k-notes">' + esc(spec.x === 'arr' ? t('arrNotes') : t('notes')) + '</label><textarea id="k-notes"></textarea></div>';
    if (rules.length) html += '<div class="group"><h3>' + esc(t('before')) + '</h3><ul class="rules">' + rules.map(function (r) { return '<li>' + esc(t(r)) + '</li>'; }).join('') + '</ul><span class="hint">' + esc(t('baitsNote')) + '</span></div>';
    html += '<p class="err" id="k-err" role="alert" hidden></p></div><div class="foot"><button class="btn alt" id="k-back">' + esc(t('back')) + '</button><button class="btn" id="k-save">' + esc(t('saveTask')) + '</button></div>';

    openSheet(html, function (w) {
      function sel(id) { var b = $('#' + id + ' [aria-pressed="true"]', w); return b ? b.getAttribute('data-v') : null; }
      function group(id, cb) { $$('#' + id + ' .chip', w).forEach(function (b) { b.addEventListener('click', function () { $$('#' + id + ' .chip', w).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); if (cb) cb(b.getAttribute('data-v')); }); }); }
      function checked() { return $$('#k-list input:checked', w).map(function (i) { return i.value; }); }
      function relist() {
        var el = $('#k-list', w); if (!el) return;
        var sp = spec.sp === 'cattle' ? 'cattle' : (f.species === 'none' ? 'all' : f.species);
        var list = sortAnimals(state.animals.filter(function (a) { return (sp === 'all' || a.species === sp) && !((typeId === 'move' || typeId === 'xfer') && needsTag(a)); }));
        el.innerHTML = animalChecklist(list, spec.ui === 'one', []);
        $$('#k-list input', w).forEach(function (i) { i.addEventListener('change', count); });
        count();
      }
      function count() { var c = $('#k-cnt', w); if (c) c.textContent = t('selectedN', { n: checked().length }); }
      function showList() {
        var f2 = $('#k-listf', w); if (!f2) return;
        if (spec.ui === 'group') f2.hidden = !(f.scope === 'pick' && f.species !== 'none');
      }
      function abCheck() {
        if (spec.x !== 'move') return null;
        var mv = $('#k-move', w).value, c = $('#k-ab', w);
        if (!mv) { c.textContent = ''; return null; }
        var ab = applyBy(mv, 2), ok = ab >= today();
        c.className = 'check ' + (ok ? 'ok' : 'bad');
        c.textContent = ok ? '✓ ' + t('applyBy', { d: fmtDay(ab) }) : '✕ ' + t('tooSoon');
        return ok ? ab : false;
      }
      $('#k-close', w).addEventListener('click', function () { closeSheet(w); });
      $('#k-back', w).addEventListener('click', function () { closeSheet(w); openAddTask(); });
      if (spec.ui === 'group') {
        group('k-sp', function (v) {
          f.species = v; $('#k-scf', w).hidden = v === 'none'; showList(); relist();
        });
        group('k-scope', function (v) { f.scope = v; showList(); });
      }
      group('k-rep', function (v) { f.repeat = v; });
      group('k-reason', function (v) { f.reason = v; });
      group('k-bolus', function (v) { f.bolus = v; });
      group('k-lost', function (v) { f.lost = v; });
      var ka = $('#k-all', w); if (ka) ka.addEventListener('click', function () { $$('#k-list input', w).forEach(function (i) { i.checked = true; }); count(); });
      var kn = $('#k-none', w); if (kn) kn.addEventListener('click', function () { $$('#k-list input', w).forEach(function (i) { i.checked = false; }); count(); });
      var mvEl = $('#k-move', w); if (mvEl) { mvEl.addEventListener('input', abCheck); abCheck(); }
      relist(); showList();

      $('#k-save', w).addEventListener('click', function () {
        var err = $('#k-err', w); err.hidden = true;
        function fail(m) { err.textContent = m; err.hidden = false; err.scrollIntoView({ block: 'nearest' }); }
        var title = isCustom ? $('#k-title', w).value.trim() : '';
        if (isCustom && !title) return fail(t('needName'));
        var base = { type: typeId, title: title, notes: $('#k-notes', w).value.trim(), repeat: f.repeat, species: spec.sp === 'cattle' ? 'cattle' : 'all' };
        var due = $('#k-due', w) ? $('#k-due', w).value : today();
        if (!due) due = today();
        var tasks = [], ids;
        if (spec.ui === 'group') {
          base.species = f.species === 'none' ? 'all' : f.species;
          if (f.species === 'none') base.scope = { mode: 'none' };
          else if (f.scope === 'pick') { ids = checked(); if (!ids.length) return fail(t('needAnimal')); base.scope = { mode: 'animals', ids: ids }; }
          else base.scope = { mode: 'all' };
          base.due = due; tasks.push(newTask(base));
        } else if (typeId === 'move') {
          ids = checked(); if (!ids.length) return fail(t('needAnimal'));
          var ab = abCheck(); if (ab === false) return fail(t('tooSoon'));
          base.scope = { mode: 'animals', ids: ids }; base.due = ab || today(); base.meta = { moveDate: $('#k-move', w).value };
          tasks.push(newTask(base));
        } else if (typeId === 'xfer') {
          ids = checked(); if (!ids.length) return fail(t('needAnimal'));
          base.scope = { mode: 'animals', ids: ids }; base.due = due; tasks.push(newTask(base));
        } else if (typeId === 'mort') {
          ids = checked(); if (ids.length !== 1) return fail(t('needOne'));
          base.scope = { mode: 'animals', ids: ids }; base.due = due; base.meta = { reason: f.reason, bolus: f.bolus === '1' };
          tasks.push(newTask(base));
          if (f.bolus === '1') tasks.push(newTask({ type: 'bolus', species: 'cattle', scope: { mode: 'animals', ids: ids }, due: due, auto: true }));
        } else if (typeId === 'repl') {
          ids = checked(); if (ids.length !== 1) return fail(t('needOne'));
          base.scope = { mode: 'animals', ids: ids }; base.due = due; base.meta = { lost: f.lost }; tasks.push(newTask(base));
        } else if (typeId === 'arr') {
          base.scope = { mode: 'none' }; base.due = due; tasks.push(newTask(base));
        }
        var chain = Promise.resolve();
        tasks.forEach(function (k) { chain = chain.then(function () { return putTask(k); }); });
        chain.then(function () { closeSheet(w); if (view !== 'tasks') setView('tasks'); else refresh(); toast(t('taskAdded')); }).catch(function () { toast(t('cantSave')); });
      });
    });
  }

  /* --- task details --- */
  function metaText(k) {
    var m = k.meta || {}, out = [];
    if (m.moveDate) out.push([t('moveDate'), fmtDate(m.moveDate)]);
    if (m.reason) out.push([t('whatHappened'), t('m_' + m.reason)]);
    if (m.lost) out.push([t('lostTag'), t(m.lost === 'e' ? 'elec' : 'analog')]);
    return out;
  }
  function openTaskDetail(id) {
    var k = state.tasks.filter(function (x) { return x.id === id; })[0]; if (!k) return;
    var isDone = k.status === 'done';
    var rows = [[t('dueOn'), isDone ? fmtDate(k.doneAt) : dueLabel(k.due) + ' (' + fmtDate(k.due) + ')'], [t('animalsL'), scopeText(k)]];
    if (isDone) rows[0][0] = t('doneOnL');
    if (k.repeat && k.repeat !== 'none') rows.push([t('repeats'), t('rep_' + k.repeat)]);
    metaText(k).forEach(function (r) { rows.push(r); });
    if (k.notes) rows.push([t('notes'), k.notes]);
    var rules = RULES[k.type] || [];
    var html = '<div class="sheet-in"><div class="sheet-head"><div><h2>' + esc(taskName(k)) + '</h2><div class="sub">' + esc(k.auto ? t('autoTag') : (TT[k.type] && TT[k.type].kind === 'baits' ? 'BAITS' : '')) + '</div></div><button class="x" id="td-close" aria-label="' + esc(t('close')) + '">' + XICON + '</button></div>' +
      '<dl class="dl">' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      (rules.length ? '<div class="group"><h3>' + esc(t('before')) + '</h3><ul class="rules">' + rules.map(function (r) { return '<li>' + esc(t(r)) + '</li>'; }).join('') + '</ul><span class="hint">' + esc(t('baitsNote')) + '</span></div>' : '') +
      (isDone ? '' : '<div class="field"><label for="td-due">' + esc(t('changeDue')) + '</label><div style="display:flex;gap:8px"><input id="td-due" type="date" value="' + esc(k.due) + '" style="flex:1"><button class="btn alt small" id="td-save">' + esc(t('saveDate')) + '</button></div></div>') +
      '<div id="td-confirm"></div></div>' +
      '<div class="foot"><button class="btn alt" id="td-del">' + esc(t('deleteTask')) + '</button>' + (isDone ? '' : '<button class="btn" id="td-done">' + esc(t('markDone')) + '</button>') + '</div>';
    openSheet(html, function (w) {
      $('#td-close', w).addEventListener('click', function () { closeSheet(w); });
      var dn = $('#td-done', w); if (dn) dn.addEventListener('click', function () { closeSheet(w); openDone(k.id); });
      var sv = $('#td-save', w); if (sv) sv.addEventListener('click', function () {
        var v = $('#td-due', w).value; if (!v) return;
        var n = clone(k); n.due = v; putTask(n).then(function () { closeSheet(w); refresh(); toast(t('dateSaved')); });
      });
      $('#td-del', w).addEventListener('click', function () {
        $('#td-confirm', w).innerHTML = '<div class="confirm"><span>' + esc(t('deleteAsk')) + '</span><div class="row2"><button class="btn alt small" id="dc-no">' + esc(t('cancel')) + '</button><button class="btn danger small" id="dc-yes">' + esc(t('deleteYes')) + '</button></div></div>';
        $('#dc-no', w).addEventListener('click', function () { $('#td-confirm', w).innerHTML = ''; });
        $('#dc-yes', w).addEventListener('click', function () {
          dbTaskDel(k.id).then(function () { state.tasks = state.tasks.filter(function (x) { return x.id !== k.id; }); closeSheet(w); refresh(); toast(t('taskDeleted')); });
        });
      });
    });
  }

  /* --- mark done: standard for everyone, except animals that are sick or injured --- */
  function openDone(id) {
    var k = state.tasks.filter(function (x) { return x.id === id; })[0]; if (!k || k.status !== 'open') return;
    var spec = TT[k.type] || {}, animals = scopeAnimals(k), isBaits = spec.kind === 'baits', isMort = k.type === 'mort';
    var html = '<div class="sheet-in"><div class="sheet-head"><div><h2>' + esc(t('doneTitle')) + '</h2><div class="sub">' + esc(taskName(k)) + '</div></div><button class="x" id="dn-close" aria-label="' + esc(t('close')) + '">' + XICON + '</button></div>' +
      '<div class="field"><label for="dn-date">' + esc(t('doneOn')) + '</label><input id="dn-date" type="date" value="' + today() + '" max="' + today() + '"></div>';
    if (animals.length) {
      html += '<div class="field"><span class="lab">' + esc(t('doneFor')) + '</span><div class="chklist" id="dn-list">' + animals.map(function (a) {
        var sickWhy = a.status === 'sick' ? t('sickLeft') : a.status === 'injured' ? t('injuredLeft') : '';
        var on = !sickWhy;
        return '<label class="chk"><input type="checkbox" value="' + esc(a.id) + '"' + (on ? ' checked' : '') + ' data-why="' + esc(sickWhy) + '"><span class="atx"><b>' + esc(tagLabel(a)) + '</b><span>' +
          esc(sickWhy ? t('leftOut', { why: sickWhy }) : [speciesOne(a.species), ageText(a.dob), a.camp].filter(Boolean).join(' · ')) + '</span></span></label>';
      }).join('') + '</div></div>' +
      '<label class="chk" id="dn-fu-w" hidden><input type="checkbox" id="dn-fu" checked><span class="atx"><span>' + esc(t('followUp')) + '</span></span></label>';
    } else if (!isBaits) { html += '<p class="hint">' + esc(t('noAnimalsHere')) + '</p>'; }
    if (isMort) html += '<label class="chk"><input type="checkbox" id="dn-gone" checked><span class="atx"><b>' + esc(t('removeHerd')) + '</b></span></label>';
    if (isBaits) html += '<label class="chk"><input type="checkbox" id="dn-ok"><span class="atx"><span>' + esc(t('confirmBaits')) + '</span></span></label>';
    html += '<p class="err" id="dn-err" role="alert" hidden></p></div><div class="foot"><button class="btn alt" id="dn-cancel">' + esc(t('cancel')) + '</button><button class="btn" id="dn-go">' + esc(t('doneBtn')) + '</button></div>';

    openSheet(html, function (w) {
      function fuToggle() {
        var w2 = $('#dn-fu-w', w); if (!w2) return;
        w2.hidden = !$$('#dn-list input', w).some(function (i) { return !i.checked; });
      }
      $$('#dn-list input', w).forEach(function (i) { i.addEventListener('change', fuToggle); }); fuToggle();
      $('#dn-close', w).addEventListener('click', function () { closeSheet(w); });
      $('#dn-cancel', w).addEventListener('click', function () { closeSheet(w); });
      $('#dn-go', w).addEventListener('click', function () {
        var err = $('#dn-err', w); err.hidden = true;
        if (isBaits && !$('#dn-ok', w).checked) { err.textContent = t('needConfirm'); err.hidden = false; return; }
        var date = $('#dn-date', w).value || today();
        var inc = $$('#dn-list input', w).filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
        var out = animals.filter(function (a) { return inc.indexOf(a.id) < 0; }).map(function (a) { return a.id; });
        var chain = Promise.resolve(), nk = clone(k);
        nk.status = 'done'; nk.doneAt = date;
        chain = chain.then(function () { return putTask(nk); });
        animals.forEach(function (a) {
          if (inc.indexOf(a.id) < 0) return;
          var n = clone(a); n.events = (n.events || []).concat([{ at: date, type: 'task', task: k.type, title: k.title || '' }]); n.updatedAt = new Date().toISOString();
          if (isMort && $('#dn-gone', w) && $('#dn-gone', w).checked) n.gone = { at: date, reason: (k.meta && k.meta.reason) || 'oth' };
          chain = chain.then(function () { return dbPut(n); }).then(function () {
            state.animals = state.animals.filter(function (x) { return x.id !== n.id; });
            if (n.gone) state.gone.push(n); else state.animals.push(n);
          });
        });
        var msg = t('taskDone');
        if (k.repeat && k.repeat !== 'none' && !isBaits) {
          var nx = newTask({ type: k.type, title: k.title, species: k.species, scope: clone(k.scope), due: nextDue(date, k.repeat), repeat: k.repeat, notes: k.notes });
          chain = chain.then(function () { return putTask(nx); }); msg = t('taskDone') + '. ' + t('nextDue', { d: fmtDate(nx.due) });
        }
        if (out.length && $('#dn-fu', w) && $('#dn-fu', w).checked && k.scope && k.scope.mode !== 'none') {
          var fu = newTask({ type: k.type, title: k.title, species: k.species, scope: { mode: 'animals', ids: out }, due: addDays(today(), 7), repeat: 'none', notes: k.notes });
          chain = chain.then(function () { return putTask(fu); });
        }
        if (k.type === 'repl' && k.scope && k.scope.ids && k.scope.ids.length) {
          var rt = newTask({ type: 'ret', species: 'cattle', scope: { mode: 'animals', ids: k.scope.ids }, due: addDays(date, 14), auto: true });
          chain = chain.then(function () { return putTask(rt); });
        }
        chain.then(function () { closeSheet(w); refresh(); toast(msg); }).catch(function () { toast(t('cantSave')); });
      });
    });
  }

  /* --- in-app reminders (no messages are sent) --- */
  function maybeRemind() {
    var a = attention(); if (!a.total) return;
    var key = 'kb-remind-' + mode;
    if (pref(key) === today()) return;
    pref(key, today());
    var items = [];
    openTaskList().filter(function (k) { return k.due <= today(); }).sort(function (x, y) { return x.due < y.due ? -1 : 1; }).forEach(function (k) { items.push({ k: k }); });
    var ti = tagItem(); if (ti && ti.due && ti.due <= today()) items.unshift({ tag: ti });
    var html = '<div class="sheet-in"><div class="sheet-head"><div><h2>' + esc(t('remTitle')) + '</h2><div class="sub">' + esc(t('remText')) + '</div></div><button class="x" id="r-close" aria-label="' + esc(t('close')) + '">' + XICON + '</button></div><div class="trows">' +
      items.slice(0, 8).map(function (it) {
        if (it.tag) return '<div class="trow"><span class="tick auto" aria-hidden="true"></span><button class="tbody" data-rt="1"><span class="atx"><b>' + esc(it.tag.animals.length === 1 ? t('tagCardOne') : t('tagCardN', { n: it.tag.animals.length })) + '</b></span>' + duePill(it.tag.due) + '</button></div>';
        return '<div class="trow"><span class="tick auto" aria-hidden="true"></span><button class="tbody" data-ro="' + esc(it.k.id) + '"><span class="atx"><b>' + esc(taskName(it.k)) + '</b><span>' + esc(scopeText(it.k)) + '</span></span>' + duePill(it.k.due) + '</button></div>';
      }).join('') + '</div><button class="btn" id="r-open">' + esc(t('openTasks')) + '</button></div>';
    openSheet(html, function (w) {
      $('#r-close', w).addEventListener('click', function () { closeSheet(w); });
      $('#r-open', w).addEventListener('click', function () { closeSheet(w); setView('tasks'); });
      $$('[data-ro]', w).forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-ro'); closeSheet(w); setView('tasks'); openTaskDetail(id); }); });
      $$('[data-rt]', w).forEach(function (b) { b.addEventListener('click', function () { closeSheet(w); setView('tasks'); openTagList(); }); });
    });
  }

  /* --- sample tasks (fictional, dates relative to today) --- */
  function sampleTasks() {
    var td = today(), A = state.animals;
    function by(sp, i) { return A.filter(function (a) { return a.species === sp && !needsTag(a); })[i]; }
    var out = [], goats = by('goat', 0), bull = A.filter(function (a) { return a.species === 'cattle' && a.sex === 'M'; })[0];
    var cows = A.filter(function (a) { return a.species === 'cattle' && a.tags && a.tags.ana; });
    out.push(newTask({ type: 'dip', species: 'all', scope: { mode: 'all' }, due: addDays(td, -2), repeat: 'w2' }));
    out.push(newTask({ type: 'vaccinate', species: 'cattle', scope: { mode: 'all' }, due: td, repeat: 'y1' }));
    if (bull) out.push(newTask({ type: 'weigh', species: 'cattle', scope: { mode: 'animals', ids: [bull.id] }, due: addDays(td, 2) }));
    out.push(newTask({ type: 'dehorn', species: 'cattle', scope: { mode: 'animals', ids: cows.slice(5, 6).map(function (a) { return a.id; }) }, due: addDays(td, 5) }));
    out.push(newTask({ type: 'custom', title: 'Order lucerne', species: 'all', scope: { mode: 'none' }, due: addDays(td, 3) }));
    if (cows.length > 1) out.push(newTask({ type: 'move', species: 'cattle', scope: { mode: 'animals', ids: [cows[0].id, cows[1].id] }, due: addDays(td, 4), meta: { moveDate: addDays(td, 8) } }));
    if (cows.length > 2) out.push(newTask({ type: 'ret', species: 'cattle', scope: { mode: 'animals', ids: [cows[2].id] }, due: addDays(td, 6), auto: true }));
    var d = newTask({ type: 'dose', species: 'goat', scope: { mode: 'all' }, due: addDays(td, -6) }); d.status = 'done'; d.doneAt = addDays(td, -5); out.push(d);
    return out;
  }

  /* ---------- start up ---------- */
  function start() {
    applyI18n(document);
    $('#b-settings').addEventListener('click', openSettings);
    $('#b-add').addEventListener('click', function () { if (view === 'tasks') openAddTask(); else openForm(null); });
    $$('#tabs .tab').forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-v')); }); });
    function net() { $('#net').hidden = navigator.onLine !== false; }
    window.addEventListener('online', net); window.addEventListener('offline', net); net();
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); state.installEvt = e; });

    openDB().catch(function () { memOnly = true; return null; }).then(function (d) {
      db = d;
      return dbAll();
    }).then(function (list) {
      splitAnimals(list);
      return loadTasks();
    }).then(function () {
      if (mode !== 'sample') return;
      return dbMetaGet('seeded').then(function (s) {
        if (s || state.animals.length) return;
        var seed = sampleData(), chain = Promise.resolve();
        seed.forEach(function (a) { chain = chain.then(function () { return dbPut(a); }); });
        return chain.then(function () { state.animals = seed; return dbMetaSet('seeded', true); });
      }).then(function () {
        return dbMetaGet('seededTasks').then(function (s) {
          if (s || state.tasks.length || !state.animals.length) return;
          var chain = Promise.resolve();
          sampleTasks().forEach(function (k) { chain = chain.then(function () { return putTask(k); }); });
          return chain.then(function () { return dbMetaSet('seededTasks', true); });
        });
      });
    }).catch(function () {}).then(function () {
      refresh();
      if (!pref('kb-welcomed') && mode === 'real' && !state.animals.length) openWelcome();
      else maybeRemind();
    });

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (reg.active) state.swReady = true;
        var w = reg.installing || reg.waiting;
        if (w) w.addEventListener('statechange', function () { if (w.state === 'activated') { state.swReady = true; toast(t('offlineReady')); } });
      }).catch(function () {});
    }
  }
  start();
})();
