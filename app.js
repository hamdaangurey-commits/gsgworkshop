/* ==========================================================
   HAMDAN PERSONAL OS — application logic
   All data is stored in the browser (localStorage).
   ========================================================== */
(() => {
  'use strict';

  /* ---------------- constants ---------------- */
  const KEY = 'hamdan_os_v1';
  const SESSION = 'hamdan_os_session';
  const USER = 'hamdan';
  const PASS = '2288';
  const ACC_COLORS = ['#2f7bff', '#22c3a6', '#7c6cff', '#5cc8ff', '#f5b942', '#ff6b8b'];
  const ACC_NAMES = ['Cash', 'EVC Plus', 'Bank Account', 'Savings', 'Business', 'Emergency Fund'];
  const INCOME_CATS = ['Salary', 'Business', 'Freelance', 'Gift', 'Investment Return', 'Bonus', 'Other income'];
  const EXPENSE_CATS = ['Food', 'Transport', 'Rent', 'Bills & Utilities', 'Family', 'Health', 'Education', 'Shopping', 'Airtime & Data', 'Charity', 'Other expense'];
  const INV_TYPES = ['Land', 'Livestock', 'Business', 'Gold', 'Hagbad / Savings group', 'Shares', 'Property', 'Crypto', 'Other'];
  const NOTE_TAGS = [['general', 'General', ''], ['income', 'Income', 'green'], ['expense', 'Expense', 'red'], ['goal', 'Goal', 'violet'], ['reminder', 'Reminder', 'amber']];
  const NOTE_COLORS = { general: '#2f7bff', income: '#34d399', expense: '#fb7185', goal: '#8b7bff', reminder: '#fbbf24' };
  const COL_LABEL = { transactions: 'Transaction', investments: 'Investment', notes: 'Note', bills: 'Bill' };

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const z = n => String(n).padStart(2, '0');
  const ymd = (d = new Date()) => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  const ym = (d = new Date()) => ymd(d).slice(0, 7);
  const parseDate = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const fmtDate = s => s ? parseDate(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const fmtLong = s => parseDate(s).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtMonth = s => parseDate(s + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const money = n => (n < 0 ? '-' : '') + '$' + Math.abs(num(n)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
  const byDateDesc = (a, b) => (String(b.date) + (b.createdAt || '')).localeCompare(String(a.date) + (a.createdAt || ''));

  /* ---------------- icons ---------------- */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
    swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    calc: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7v3h-7z"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 17h.01M12 17h.01M15.5 17h.01"/>',
    note: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/>',
    report: '<path d="M4 20V11M10 20V4M16 20v-7M21 20H3"/>',
    bill: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/><path d="M10 11v6M14 11v6"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 21h16"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    in: '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
    out: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    scale: '<path d="M12 3v18M5 21h14"/><path d="M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/>',
  };
  const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------------- state ---------------- */
  function defaults() {
    return {
      version: 1,
      settings: { target: 200, wallpaper: 'blue', photo: '', billCounter: 0 },
      accounts: ACC_NAMES.map((name, i) => ({ id: 'acc' + (i + 1), name, opening: 0, color: ACC_COLORS[i], note: '' })),
      transactions: [], investments: [], notes: [], bills: [], bin: [], calcHistory: [],
    };
  }
  function normalize(d) {
    const base = defaults();
    if (!d || typeof d !== 'object') return base;
    const out = { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) } };
    ['transactions', 'investments', 'notes', 'bills', 'bin', 'calcHistory'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
    const accs = Array.isArray(d.accounts) ? d.accounts.slice(0, 6) : [];
    out.accounts = base.accounts.map((a, i) => ({ ...a, ...(accs[i] || {}), id: (accs[i] && accs[i].id) || a.id }));
    return out;
  }
  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(KEY))); } catch { return defaults(); }
  }
  let S = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
    catch (e) { toast('Storage is full — export a backup and empty the recycle bin.', 'error'); return false; }
  }

  /* ---------------- computations ---------------- */
  const totals = (list = S.transactions) => {
    const inc = sum(list.filter(t => t.type === 'income'), t => num(t.amount));
    const exp = sum(list.filter(t => t.type === 'expense'), t => num(t.amount));
    return { inc, exp, bal: inc - exp };
  };
  const accById = id => S.accounts.find(a => a.id === id);
  const accBalance = a => num(a.opening) + sum(S.transactions.filter(t => t.accountId === a.id), t => t.type === 'income' ? num(t.amount) : -num(t.amount));
  const billSubtotal = b => sum(b.items || [], it => num(it.qty) * num(it.price));
  const billTotal = b => Math.max(0, billSubtotal(b) - num(b.discount));

  /* ---------------- toast ---------------- */
  function toast(msg, type = 'ok', opts = {}) {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<span>${esc(msg)}</span>${opts.action ? `<button type="button">${esc(opts.action)}</button>` : ''}`;
    if (opts.action) t.querySelector('button').onclick = () => { opts.onAction(); t.remove(); };
    $('#toasts').append(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, opts.ms || 3200);
  }

  /* ---------------- modal ---------------- */
  let modalOnClose = null;
  function openModal(title, html, { wide = false } = {}) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    $('.modal-card').classList.toggle('wide', wide);
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    $('#modal').hidden = true;
    $('#modalBody').innerHTML = '';
    document.body.style.overflow = '';
    const cb = modalOnClose; modalOnClose = null; cb && cb();
  }
  $('#modalX').innerHTML = icon('x');
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

  function confirmBox(msg, okText = 'Delete', tone = 'danger') {
    return new Promise(res => {
      openModal('Please confirm', `<p>${msg}</p><div class="form-actions"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn ${tone}" id="okBtn">${esc(okText)}</button></div>`);
      let done = false;
      modalOnClose = () => { if (!done) res(false); };
      $('#okBtn').onclick = () => { done = true; closeModal(); res(true); };
    });
  }

  function fieldHTML(f, val) {
    const lab = `<span class="label">${esc(f.label)}</span>`;
    const cls = `field${f.half ? ' half' : ''}`;
    if (f.type === 'html') return f.html;
    if (f.type === 'segmented') return `<div class="${cls}">${lab}<div class="seg">${f.options.map(([v, l]) => `<label><input type="radio" name="${f.name}" value="${esc(v)}" ${String(v) === String(val) ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></div>`;
    if (f.type === 'select') return `<label class="${cls}">${lab}<select name="${f.name}">${f.options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    if (f.type === 'textarea') return `<label class="${cls}">${lab}<textarea name="${f.name}" rows="${f.rows || 4}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''}>${esc(val)}</textarea></label>`;
    const attrs = [
      f.step && `step="${f.step}"`, f.min != null && `min="${f.min}"`, f.required && 'required', f.list && `list="${f.list}"`,
      f.type === 'number' && 'inputmode="decimal"', f.maxlength && `maxlength="${f.maxlength}"`,
    ].filter(Boolean).join(' ');
    return `<label class="${cls}">${lab}<input name="${f.name}" type="${f.type || 'text'}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}" ${attrs}></label>`;
  }

  function openForm({ title, fields, values = {}, submit = 'Save', onSubmit, onMount, wide }) {
    openModal(title, `<form id="mform" class="form" novalidate>${fields.map(f => fieldHTML(f, values[f.name] ?? f.value ?? '')).join('')}
      <div class="form-actions"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary" type="submit">${esc(submit)}</button></div></form>`, { wide });
    const form = $('#mform');
    form.onsubmit = e => {
      e.preventDefault();
      const bad = $$('[required]', form).find(el => !String(el.value).trim());
      if (bad) { bad.focus(); toast('Please fill in the required fields', 'error'); return; }
      const data = {};
      fields.forEach(f => {
        if (!f.name || f.type === 'html') return;
        if (f.type === 'segmented') data[f.name] = (form.querySelector(`[name="${f.name}"]:checked`) || {}).value;
        else data[f.name] = String(form.elements[f.name].value).trim();
      });
      if (onSubmit(data, form) !== false) closeModal();
    };
    onMount && onMount(form);
  }

  /* ---------------- recycle bin core ---------------- */
  function moveToBin(col, id) {
    const i = S[col].findIndex(x => x.id === id);
    if (i < 0) return;
    const [item] = S[col].splice(i, 1);
    const entry = { id: uid(), col, item, deletedAt: new Date().toISOString() };
    S.bin.unshift(entry);
    save(); render(false);
    toast(`${COL_LABEL[col]} moved to Recycle Bin`, 'ok', { action: 'Undo', onAction: () => restoreBin(entry.id) });
  }
  function restoreBin(binId, silent) {
    const i = S.bin.findIndex(b => b.id === binId);
    if (i < 0) return;
    const [b] = S.bin.splice(i, 1);
    if (!Array.isArray(S[b.col])) S[b.col] = [];
    if (!S[b.col].some(x => x.id === b.item.id)) S[b.col].push(b.item);
    save(); render(false); updateBadge();
    if (!silent) toast(`${COL_LABEL[b.col]} restored`, 'success');
  }
  function itemTitle(col, it) {
    switch (col) {
      case 'transactions': return `${it.type === 'income' ? 'Income' : 'Expense'} · ${money(it.amount)} · ${it.category || ''}`;
      case 'investments': return `${it.kind === 'family' ? 'Family' : 'Personal'} investment · ${it.name}`;
      case 'notes': return it.title || 'Untitled note';
      case 'bills': return `${it.number} · ${it.customer || 'No customer'} · ${money(billTotal(it))}`;
      default: return 'Item';
    }
  }

  /* ---------------- login ---------------- */
  function applyWallpaper() {
    const wp = S.settings.wallpaper === 'light' ? 'light' : 'blue';
    document.body.classList.toggle('wp-light', wp === 'light');
    document.body.classList.toggle('wp-blue', wp === 'blue');
    $$('[data-wp]').forEach(b => b.classList.toggle('active', b.dataset.wp === wp));
    document.querySelector('meta[name=theme-color]').content = wp === 'light' ? '#0a2a7a' : '#061434';
  }
  const isLogged = () => localStorage.getItem(SESSION) === '1' || sessionStorage.getItem(SESSION) === '1';

  function initLogin() {
    $$('[data-wp]').forEach(b => b.onclick = () => { S.settings.wallpaper = b.dataset.wp; save(); applyWallpaper(); });
    const pt = $('#pwToggle');
    pt.innerHTML = icon('eye');
    pt.onclick = () => { const i = $('#lp'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; pt.innerHTML = icon(show ? 'eyeOff' : 'eye'); };
    $('#loginForm').onsubmit = e => {
      e.preventDefault();
      const u = $('#lu').value.trim().toLowerCase(), p = $('#lp').value.trim();
      if (u === USER && p === PASS) {
        $('#loginErr').textContent = '';
        ($('#remember').checked ? localStorage : sessionStorage).setItem(SESSION, '1');
        enterApp(true);
      } else {
        $('#loginErr').textContent = !u || !p ? 'Please enter username and password.' : 'Incorrect username or password.';
        const c = $('#loginCard'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
      }
    };
  }

  function enterApp(fresh) {
    $('#login').hidden = true;
    $('#app').hidden = false;
    updateAvatars(); updateBadge();
    route();
    if (fresh) {
      const sp = $('#splash');
      sp.hidden = false; sp.classList.remove('out');
      const hide = () => { if (sp.hidden) return; sp.classList.add('out'); setTimeout(() => { sp.hidden = true; }, 500); };
      sp.onclick = hide;
      setTimeout(hide, 2300);
      setTimeout(() => toast('Waad bilaawi kartaa xisaabta', 'success'), 2500);
    }
  }
  function logout() {
    localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION);
    $('#app').hidden = true; $('#login').hidden = false;
    $('#lp').value = ''; closeDrawer();
    history.replaceState(null, '', location.pathname);
  }

  /* ---------------- navigation ---------------- */
  const NAV = [
    ['dashboard', 'Dashboard', 'home'],
    ['accounts', 'Accounts', 'wallet'],
    ['transactions', 'Income & Expenses', 'swap'],
    ['family', 'Family Investment', 'users'],
    ['personal', 'Personal Investment', 'trend'],
    ['calculator', 'Calculator', 'calc'],
    ['notes', 'Daily Notes', 'note'],
    ['reports', 'Daily Reports', 'report'],
    ['bills', 'Bills', 'bill'],
    ['calendar', 'Calendar', 'calendar'],
    ['bin', 'Recycle Bin', 'trash'],
    ['backup', 'Backup & Settings', 'database'],
  ];
  const BOTTOM = [['dashboard', 'Home', 'home'], ['transactions', 'Money', 'swap'], ['calculator', 'Calc', 'calc'], ['calendar', 'Calendar', 'calendar']];

  $('#nav').innerHTML = NAV.map(([k, l, i]) => `<a class="nav-item" href="#/${k}" data-nav="${k}">${icon(i)}<span>${l}</span>${k === 'bin' ? '<span class="badge" id="binBadge" hidden></span>' : ''}</a>`).join('');
  $('#bottombar').innerHTML = BOTTOM.map(([k, l, i]) => `<a class="bb-item" href="#/${k}" data-nav="${k}">${icon(i)}<span>${l}</span></a>`).join('') +
    `<button class="bb-item" type="button" id="bbMenu">${icon('menu')}<span>More</span></button>`;
  $('#logoutBtn').innerHTML = `${icon('logout')}<span>Logout</span>`;
  $('#menuBtn').innerHTML = icon('menu');
  $('#fab').innerHTML = icon('plus');

  const openDrawer = () => { $('#sidebar').classList.add('open'); $('#scrim').classList.add('show'); };
  const closeDrawer = () => { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); };
  $('#menuBtn').onclick = openDrawer;
  $('#bbMenu').onclick = openDrawer;
  $('#scrim').onclick = closeDrawer;
  $('#nav').addEventListener('click', e => { if (e.target.closest('a')) closeDrawer(); });
  $('#logoutBtn').onclick = async () => { if (await confirmBox('Log out of HAMDAN PERSONAL OS?', 'Logout', 'primary')) logout(); };
  $('#topAvatar').onclick = () => { location.hash = '#/dashboard'; };

  function updateBadge() {
    const b = $('#binBadge'); if (!b) return;
    b.hidden = !S.bin.length; b.textContent = S.bin.length;
  }
  function avatarHTML() {
    return S.settings.photo ? `<img src="${S.settings.photo}" alt="Mr Hamdan">` : `<span class="initials">H</span>`;
  }
  function updateAvatars() { $('#topAvatar').innerHTML = avatarHTML(); }

  /* ---------------- router ---------------- */
  let current = 'dashboard';
  let actions = {};
  let fabAction = null;
  const VIEWS = {};

  function route() {
    const name = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('?')[0];
    current = VIEWS[name] ? name : 'dashboard';
    render(true);
    window.scrollTo({ top: 0 });
  }
  function render(anim = false) {
    if ($('#app').hidden) return;
    const v = $('#view');
    actions = { ...COMMON };
    fabAction = null;
    VIEWS[current](v);
    v.classList.remove('enter');
    if (anim) { void v.offsetWidth; v.classList.add('enter'); }
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === current));
    $('#pageTitle').textContent = (NAV.find(n => n[0] === current) || NAV[0])[1];
    $('#fab').hidden = !fabAction;
    closeDrawer(); updateBadge();
  }
  window.addEventListener('hashchange', () => { if (isLogged()) route(); });
  $('#view').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || !actions[b.dataset.act]) return;
    e.preventDefault();
    actions[b.dataset.act](b.dataset.id, b);
  });
  $('#fab').onclick = () => fabAction && fabAction();

  /* ---------------- shared UI pieces ---------------- */
  const stat = (label, value, ic, tone) => `<div class="stat" style="--tone:${tone}"><div class="s-ico">${icon(ic)}</div><span>${label}</span><strong>${value}</strong></div>`;
  const empty = (ic, title, text, btn = '') => `<div class="empty"><div class="e-ico">${icon(ic)}</div><strong>${title}</strong><p>${text}</p>${btn ? `<div style="margin-top:14px">${btn}</div>` : ''}</div>`;

  function txRow(t) {
    const acc = accById(t.accountId);
    const inc = t.type === 'income';
    return `<div class="row">
      <div class="r-ico ${inc ? 'in' : 'out'}">${icon(inc ? 'in' : 'out')}</div>
      <div class="r-main"><strong>${esc(t.category || (inc ? 'Income' : 'Expense'))}</strong><small>${esc([fmtDate(t.date), acc && acc.name, t.note].filter(Boolean).join(' · '))}</small></div>
      <div class="r-amt ${inc ? 'pos' : 'neg'}">${inc ? '+' : '−'}${money(t.amount)}</div>
      <div class="r-acts"><button class="icon-btn sm" data-act="editTx" data-id="${t.id}" aria-label="Edit">${icon('edit')}</button><button class="icon-btn sm danger" data-act="delTx" data-id="${t.id}" aria-label="Delete">${icon('trash')}</button></div>
    </div>`;
  }
  function txList(list, group = false) {
    if (!list.length) return empty('swap', 'No transactions yet', 'Add your first income or expense to start tracking.', `<button class="btn primary" data-act="addIncome">${icon('plus')}Add income</button>`);
    if (!group) return `<div class="list">${list.map(txRow).join('')}</div>`;
    const groups = {};
    list.forEach(t => { (groups[t.date] = groups[t.date] || []).push(t); });
    return `<div class="list">${Object.keys(groups).sort().reverse().map(d => {
      const tt = totals(groups[d]);
      return `<div class="group-label"><span>${fmtDate(d)}</span><span class="${tt.bal >= 0 ? 'pos' : 'neg'}">${money(tt.bal)}</span></div>${groups[d].map(txRow).join('')}`;
    }).join('')}</div>`;
  }

  function txForm(pre = {}) {
    const isEdit = !!pre.id;
    const type = pre.type || 'income';
    const values = { type, amount: '', category: '', accountId: S.accounts[0].id, date: ymd(), note: '', ...pre };
    openForm({
      title: isEdit ? 'Edit transaction' : (type === 'income' ? 'Add income' : 'Add expense'),
      submit: isEdit ? 'Save changes' : 'Save',
      values,
      fields: [
        { name: 'type', label: 'Type', type: 'segmented', options: [['income', 'Income'], ['expense', 'Expense']] },
        { name: 'amount', label: 'Amount ($)', type: 'number', step: '0.01', min: '0', required: true, placeholder: '0.00', half: true },
        { name: 'date', label: 'Date', type: 'date', required: true, half: true },
        { name: 'category', label: 'Category', list: 'catList', placeholder: 'Choose or type a category', required: true },
        { type: 'html', html: '<datalist id="catList"></datalist>' },
        { name: 'accountId', label: 'Account', type: 'select', options: S.accounts.map(a => [a.id, a.name]) },
        { name: 'note', label: 'Note (optional)', placeholder: 'e.g. Monthly salary from…' },
      ],
      onMount(form) {
        const fill = () => {
          const t = (form.querySelector('[name=type]:checked') || {}).value;
          $('#catList').innerHTML = (t === 'expense' ? EXPENSE_CATS : INCOME_CATS).map(c => `<option value="${esc(c)}">`).join('');
          if (!isEdit) $('#modalTitle').textContent = t === 'expense' ? 'Add expense' : 'Add income';
        };
        $$('[name=type]', form).forEach(r => r.addEventListener('change', fill));
        fill();
      },
      onSubmit(d) {
        const amount = num(d.amount);
        if (amount <= 0) { toast('Amount must be greater than 0', 'error'); return false; }
        const rec = { type: d.type || 'income', amount, category: d.category, accountId: d.accountId, date: d.date || ymd(), note: d.note };
        if (isEdit) Object.assign(S.transactions.find(t => t.id === pre.id) || {}, rec);
        else S.transactions.push({ id: uid(), createdAt: new Date().toISOString(), ...rec });
        save(); render(false);
        toast(isEdit ? 'Transaction updated' : `${rec.type === 'income' ? 'Income' : 'Expense'} of ${money(amount)} saved`, 'success');
      },
    });
  }

  const COMMON = {
    editTx: id => { const t = S.transactions.find(x => x.id === id); if (t) txForm({ ...t }); },
    delTx: id => moveToBin('transactions', id),
    addIncome: () => txForm({ type: 'income' }),
    addExpense: () => txForm({ type: 'expense' }),
    addNote: () => noteForm({}),
    newBill: () => billForm(),
    go: (id) => { location.hash = '#/' + id; },
  };

  /* ==========================================================
     VIEW: Dashboard
     ========================================================== */
  VIEWS.dashboard = v => {
    const t = totals();
    const m = ym();
    const mt = totals(S.transactions.filter(x => String(x.date).startsWith(m)));
    const target = num(S.settings.target) || 200;
    const pct = Math.min(100, (mt.inc / target) * 100);
    const C = 2 * Math.PI * 52;
    const invest = sum(S.investments, i => num(i.current || i.amount));
    const recent = [...S.transactions].sort(byDateDesc).slice(0, 5);
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 6 + i);
      const k = ymd(d);
      return { label: d.toLocaleDateString('en', { weekday: 'short' }), ...totals(S.transactions.filter(x => x.date === k)) };
    });
    const max = Math.max(1, ...days.map(d => Math.max(d.inc, d.exp)));
    const remaining = Math.max(0, target - mt.inc);

    v.innerHTML = `
      <section class="hero">
        <div class="hero-wall" aria-hidden="true"></div>
        <div class="hero-inner">
          <button class="avatar xl" data-act="photo" type="button" aria-label="Upload profile photo">${avatarHTML()}<span class="cam">${icon('camera')}</span></button>
          <div>
            <p class="eyebrow">HAMdan · Personal OS</p>
            <h1>Welcome Mr Hamdan</h1>
            <p class="hero-date">${fmtLong(ymd())}</p>
          </div>
        </div>
        <div class="hero-balance">
          <div><span>Current balance</span><strong class="num">${money(t.bal)}</strong></div>
          <span class="hero-brand">HAMdan</span>
        </div>
      </section>

      <section class="grid stats">
        ${stat('Total income', money(t.inc), 'in', '#34d399')}
        ${stat('Total expenses', money(t.exp), 'out', '#fb7185')}
        ${stat('Balance', money(t.bal), 'scale', '#5cc8ff')}
        ${stat('Investments', money(invest), 'gem', '#8b7bff')}
      </section>

      <section class="grid two">
        <div class="card target-card">
          <div class="ring">
            <svg viewBox="0 0 120 120"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5cc8ff"/><stop offset="1" stop-color="#2f7bff"/></linearGradient></defs>
              <circle class="track" cx="60" cy="60" r="52" fill="none" stroke-width="12"/>
              <circle class="bar" cx="60" cy="60" r="52" fill="none" stroke-width="12" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - pct / 100)).toFixed(2)}" style="--c:${C.toFixed(2)}"/>
            </svg>
            <div class="center"><strong>${Math.round(pct)}%</strong><small>of target</small></div>
          </div>
          <div class="target-info">
            <h3>Monthly income target · ${fmtMonth(m)}</h3>
            <div class="big num">${money(target)}</div>
            <p>${money(mt.inc)} earned this month · ${remaining > 0 ? `${money(remaining)} to go` : 'Target reached 🎉'}</p>
            <button class="btn sm" data-act="target" type="button">${icon('target')}Edit target</button>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Last 7 days</h3><div class="legend"><span><i style="background:#2f7bff"></i>Income</span><span><i style="background:#e11d48"></i>Expense</span></div></div>
          <div class="bars">${days.map((d, i) => `<div class="bar-col" title="${d.label}: +${money(d.inc)} / −${money(d.exp)}"><div class="bar-pair"><i class="in" style="height:${(d.inc / max) * 100}%;animation-delay:${i * 50}ms"></i><i class="out" style="height:${(d.exp / max) * 100}%;animation-delay:${i * 50 + 25}ms"></i></div><small>${d.label}</small></div>`).join('')}</div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h3>Quick actions</h3></div>
        <div class="quick">
          <button class="q-btn" data-act="addIncome" style="--tone:#34d399"><span class="qi">${icon('in')}</span>Income</button>
          <button class="q-btn" data-act="addExpense" style="--tone:#fb7185"><span class="qi">${icon('out')}</span>Expense</button>
          <button class="q-btn" data-act="addNote" style="--tone:#5cc8ff"><span class="qi">${icon('note')}</span>Note</button>
          <button class="q-btn" data-act="newBill" style="--tone:#fbbf24"><span class="qi">${icon('bill')}</span>Bill</button>
          <button class="q-btn" data-act="go" data-id="calculator" style="--tone:#8b7bff"><span class="qi">${icon('calc')}</span>Calculator</button>
          <button class="q-btn" data-act="go" data-id="reports" style="--tone:#2f7bff"><span class="qi">${icon('report')}</span>Report</button>
        </div>
      </section>

      <section class="grid two">
        <div class="card">
          <div class="card-head"><h3>Recent transactions</h3><a href="#/transactions">View all</a></div>
          ${txList(recent)}
        </div>
        <div class="card">
          <div class="card-head"><h3>Accounts</h3><a href="#/accounts">Manage</a></div>
          <div class="list">${S.accounts.map(a => `<div class="row"><div class="r-ico" style="background:${a.color}26;color:${a.color}">${icon('wallet')}</div><div class="r-main"><strong>${esc(a.name)}</strong><small>${S.transactions.filter(t => t.accountId === a.id).length} transactions</small></div><div class="r-amt num">${money(accBalance(a))}</div></div>`).join('')}</div>
        </div>
      </section>`;

    actions.photo = () => $('#photoInput').click();
    actions.target = editTarget;
    fabAction = () => txForm({ type: 'income' });
  };

  function editTarget() {
    openForm({
      title: 'Monthly income target', values: { target: S.settings.target },
      fields: [{ name: 'target', label: 'Target amount ($)', type: 'number', step: '0.01', min: '0', required: true }],
      onSubmit(d) {
        const n = num(d.target);
        if (n <= 0) { toast('Target must be greater than 0', 'error'); return false; }
        S.settings.target = n; save(); render(false); toast('Monthly target updated', 'success');
      },
    });
  }

  /* profile photo */
  $('#photoInput').addEventListener('change', e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast('Please choose an image file', 'error'); return; }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const s = 320, c = document.createElement('canvas');
      c.width = c.height = s;
      const m = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s);
      URL.revokeObjectURL(url);
      S.settings.photo = c.toDataURL('image/jpeg', 0.86);
      if (save()) { updateAvatars(); render(false); toast('Profile photo updated', 'success'); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('Could not read that image', 'error'); };
    img.src = url;
  });

  /* ==========================================================
     VIEW: Accounts
     ========================================================== */
  VIEWS.accounts = v => {
    const total = sum(S.accounts, accBalance);
    v.innerHTML = `
      <div class="page-head"><div><h1>Accounts</h1><p>Six editable accounts. Balance = opening balance + linked income − linked expenses.</p></div></div>
      <section class="grid stats">
        ${stat('All accounts', money(total), 'wallet', '#5cc8ff')}
        ${stat('Opening balances', money(sum(S.accounts, a => num(a.opening))), 'scale', '#8b7bff')}
      </section>
      <section class="acc-grid">
        ${S.accounts.map((a, i) => `
          <article class="acc" style="--c:${esc(a.color)}">
            <div class="acc-top"><div><small>Account ${i + 1}</small><h3>${esc(a.name)}</h3></div><button class="icon-btn sm" data-act="editAcc" data-id="${a.id}" aria-label="Edit account">${icon('edit')}</button></div>
            <div class="acc-bal"><strong>${money(accBalance(a))}</strong><span>Opening ${money(a.opening)}${a.note ? ' · ' + esc(a.note) : ''}</span></div>
            <div class="acc-foot">
              <button class="btn sm" data-act="accIn" data-id="${a.id}">${icon('in')}Income</button>
              <button class="btn sm" data-act="accOut" data-id="${a.id}">${icon('out')}Expense</button>
              <button class="btn sm" data-act="accView" data-id="${a.id}">${icon('eye')}History</button>
            </div>
          </article>`).join('')}
      </section>`;
    actions.editAcc = id => {
      const a = accById(id);
      openForm({
        title: 'Edit account', values: a,
        fields: [
          { name: 'name', label: 'Account name', required: true, maxlength: 40 },
          { name: 'opening', label: 'Opening balance ($)', type: 'number', step: '0.01', half: true },
          { name: 'color', label: 'Colour', type: 'color', half: true },
          { name: 'note', label: 'Note (optional)', placeholder: 'e.g. Account number, provider…' },
        ],
        onSubmit(d) { Object.assign(a, { name: d.name, opening: num(d.opening), color: d.color || a.color, note: d.note }); save(); render(false); toast('Account updated', 'success'); },
      });
    };
    actions.accIn = id => txForm({ type: 'income', accountId: id });
    actions.accOut = id => txForm({ type: 'expense', accountId: id });
    actions.accView = id => { txFilter = { type: 'all', month: '', acc: id, q: '' }; location.hash = '#/transactions'; };
  };

  /* ==========================================================
     VIEW: Income & Expenses
     ========================================================== */
  let txFilter = { type: 'all', month: ym(), acc: '', q: '' };
  VIEWS.transactions = v => {
    v.innerHTML = `
      <div class="page-head"><div><h1>Income & Expenses</h1><p>Track every dollar in and out.</p></div>
        <div class="actions"><button class="btn success" data-act="addIncome">${icon('in')}Income</button><button class="btn danger" data-act="addExpense">${icon('out')}Expense</button></div></div>
      <section class="grid stats" id="txStats"></section>
      <section class="card filters">
        <div class="chips">${[['all', 'All'], ['income', 'Income'], ['expense', 'Expenses']].map(([k, l]) => `<button class="chip ${txFilter.type === k ? 'active' : ''}" data-act="txType" data-id="${k}">${l}</button>`).join('')}</div>
        <div class="filter-row">
          <input type="month" id="fMonth" value="${txFilter.month}" aria-label="Month">
          <select id="fAcc" aria-label="Account"><option value="">All accounts</option>${S.accounts.map(a => `<option value="${a.id}" ${txFilter.acc === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
          <input type="search" id="fQ" class="full" placeholder="Search category or note…" value="${esc(txFilter.q)}">
        </div>
      </section>
      <section class="card" id="txListBox"></section>`;
    const draw = () => {
      const q = txFilter.q.toLowerCase();
      const list = S.transactions.filter(t =>
        (txFilter.type === 'all' || t.type === txFilter.type) &&
        (!txFilter.month || String(t.date).startsWith(txFilter.month)) &&
        (!txFilter.acc || t.accountId === txFilter.acc) &&
        (!q || `${t.category} ${t.note}`.toLowerCase().includes(q))
      ).sort(byDateDesc);
      const tt = totals(list);
      $('#txStats').innerHTML = stat('Income', money(tt.inc), 'in', '#34d399') + stat('Expenses', money(tt.exp), 'out', '#fb7185') + stat('Net', money(tt.bal), 'scale', '#5cc8ff') + stat('Entries', list.length, 'file', '#8b7bff');
      const label = txFilter.month ? fmtMonth(txFilter.month) : 'All time';
      $('#txListBox').innerHTML = `<div class="card-head"><h3>${label}</h3>${txFilter.month || txFilter.acc || txFilter.q ? '<button class="btn sm ghost" data-act="txClear">Show all</button>' : ''}</div>${txList(list, true)}`;
    };
    $('#fMonth').onchange = e => { txFilter.month = e.target.value; draw(); };
    $('#fAcc').onchange = e => { txFilter.acc = e.target.value; draw(); };
    $('#fQ').oninput = e => { txFilter.q = e.target.value; draw(); };
    actions.txType = k => { txFilter.type = k; $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.id === k)); draw(); };
    actions.txClear = () => { txFilter = { type: txFilter.type, month: '', acc: '', q: '' }; render(false); };
    draw();
    fabAction = () => txForm({ type: 'income' });
  };

  /* ==========================================================
     VIEW: Investments (family + personal)
     ========================================================== */
  function investView(kind) {
    return v => {
      const fam = kind === 'family';
      const list = S.investments.filter(i => i.kind === kind).sort(byDateDesc);
      const inv = sum(list, i => num(i.amount));
      const cur = sum(list, i => num(i.current || i.amount));
      const gain = cur - inv;
      v.innerHTML = `
        <div class="page-head"><div><h1>${fam ? 'Family Investment' : 'Personal Investment'}</h1><p>${fam ? 'Shared investments with family — land, livestock, business and savings groups.' : 'Your own investments and how they are performing.'}</p></div>
          <div class="actions"><button class="btn primary" data-act="addInv">${icon('plus')}Add investment</button></div></div>
        <section class="grid stats">
          ${stat('Invested', money(inv), 'wallet', '#2f7bff')}
          ${stat('Current value', money(cur), 'gem', '#8b7bff')}
          ${stat('Gain / loss', `<span class="${gain >= 0 ? 'pos' : 'neg'}">${gain >= 0 ? '+' : ''}${money(gain)}</span>`, 'chart', gain >= 0 ? '#34d399' : '#fb7185')}
          ${stat('Return', `${inv ? ((gain / inv) * 100).toFixed(1) : '0.0'}%`, 'trend', '#5cc8ff')}
        </section>
        <section class="card">
          ${list.length ? `<div class="inv-grid">${list.map(i => {
            const g = num(i.current || i.amount) - num(i.amount);
            return `<article class="inv">
              <div class="inv-top"><div><h4>${esc(i.name)}</h4><small>${esc([i.type, fam && i.member, fmtDate(i.date)].filter(Boolean).join(' · '))}</small></div>
                <div class="r-acts"><button class="icon-btn sm" data-act="editInv" data-id="${i.id}" aria-label="Edit">${icon('edit')}</button><button class="icon-btn sm danger" data-act="delInv" data-id="${i.id}" aria-label="Delete">${icon('trash')}</button></div></div>
              <div class="inv-nums"><div><span>Invested</span><strong>${money(i.amount)}</strong></div><div><span>Value</span><strong>${money(i.current || i.amount)}</strong></div><div><span>Gain</span><strong class="${g >= 0 ? 'pos' : 'neg'}">${g >= 0 ? '+' : ''}${money(g)}</strong></div></div>
              ${i.note ? `<p class="note">${esc(i.note)}</p>` : ''}
            </article>`;
          }).join('')}</div>` : empty(fam ? 'users' : 'trend', 'No investments yet', 'Record what you have invested and track its current value.', `<button class="btn primary" data-act="addInv">${icon('plus')}Add investment</button>`)}
        </section>`;
      const form = (pre = {}) => openForm({
        title: pre.id ? 'Edit investment' : (fam ? 'New family investment' : 'New personal investment'),
        values: { date: ymd(), type: INV_TYPES[0], ...pre },
        fields: [
          { name: 'name', label: 'Investment name', required: true, placeholder: fam ? 'e.g. Family farm in Afgooye' : 'e.g. Shop shares' },
          { name: 'type', label: 'Type', list: 'invTypes', half: true },
          { type: 'html', html: `<datalist id="invTypes">${INV_TYPES.map(t => `<option value="${esc(t)}">`).join('')}</datalist>` },
          { name: 'date', label: 'Date', type: 'date', half: true },
          ...(fam ? [{ name: 'member', label: 'Family member / partner', placeholder: 'e.g. Brother Ahmed' }] : []),
          { name: 'amount', label: 'Amount invested ($)', type: 'number', step: '0.01', min: '0', required: true, half: true },
          { name: 'current', label: 'Current value ($)', type: 'number', step: '0.01', min: '0', half: true, placeholder: 'Same as invested' },
          { name: 'note', label: 'Notes', type: 'textarea', rows: 3 },
        ],
        onSubmit(d) {
          if (num(d.amount) <= 0) { toast('Amount must be greater than 0', 'error'); return false; }
          const rec = { kind, name: d.name, type: d.type, date: d.date || ymd(), member: d.member || '', amount: num(d.amount), current: d.current === '' ? num(d.amount) : num(d.current), note: d.note };
          if (pre.id) Object.assign(S.investments.find(x => x.id === pre.id), rec);
          else S.investments.push({ id: uid(), createdAt: new Date().toISOString(), ...rec });
          save(); render(false); toast(pre.id ? 'Investment updated' : 'Investment added', 'success');
        },
      });
      actions.addInv = () => form();
      actions.editInv = id => form({ ...S.investments.find(x => x.id === id) });
      actions.delInv = id => moveToBin('investments', id);
      fabAction = () => form();
    };
  }
  VIEWS.family = investView('family');
  VIEWS.personal = investView('personal');

  /* ==========================================================
     VIEW: Calculator
     ========================================================== */
  const calc = { expr: '', result: '0', done: false };
  const OPS = '+−×÷';
  function calcEval(e) {
    if (!e) return 0;
    let s = e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/%/g, '/100');
    s = s.replace(/[+\-*/.]+$/, '');
    if (!s || !/^[\d+\-*/.()\s]+$/.test(s)) return null;
    try {
      const r = Function('"use strict";return (' + s + ')')();
      if (typeof r !== 'number' || !Number.isFinite(r)) return null;
      return Math.round(r * 1e10) / 1e10;
    } catch { return null; }
  }
  function calcPress(k) {
    const last = calc.expr.slice(-1);
    if (k === 'C') { calc.expr = ''; calc.result = '0'; calc.done = false; }
    else if (k === '⌫') { calc.expr = calc.done ? '' : calc.expr.slice(0, -1); calc.done = false; }
    else if (k === '=') {
      const r = calcEval(calc.expr);
      if (r === null) { calc.result = 'Error'; }
      else if (calc.expr && calc.expr !== String(r)) {
        S.calcHistory.unshift({ e: calc.expr, r, at: new Date().toISOString() });
        S.calcHistory = S.calcHistory.slice(0, 25); save();
        calc.expr = String(r).replace('-', '−'); calc.result = String(r); calc.done = true;
      }
      drawCalc(); return;
    }
    else if (k === '±') {
      if (calc.expr) calc.expr = /^−\(.*\)$/.test(calc.expr) ? calc.expr.slice(2, -1) : `−(${calc.expr})`;
      calc.done = false;
    }
    else if (OPS.includes(k)) {
      if (!calc.expr) { if (k === '−') calc.expr = '−'; }
      else if (OPS.includes(last) || last === '.') calc.expr = calc.expr.slice(0, -1) + k;
      else calc.expr += k;
      calc.done = false;
    }
    else if (k === '%') { if (/[\d)]/.test(last)) calc.expr += '%'; calc.done = false; }
    else if (k === '.') {
      if (calc.done) { calc.expr = ''; calc.done = false; }
      const seg = calc.expr.split(/[+−×÷(]/).pop();
      if (!seg.includes('.')) calc.expr += seg === '' ? '0.' : '.';
    }
    else if (/\d/.test(k)) {
      if (calc.done) { calc.expr = ''; calc.done = false; }
      if (last === '%' || last === ')') calc.expr += '×';
      calc.expr += k;
    }
    const r = calcEval(calc.expr);
    if (r !== null) calc.result = String(r);
    drawCalc();
  }
  function drawCalc() {
    const ex = $('#cExpr'), rs = $('#cRes');
    if (!ex) return;
    ex.textContent = calc.expr || ' ';
    rs.textContent = calc.result === 'Error' ? 'Error' : num(calc.result).toLocaleString('en-US', { maximumFractionDigits: 10 });
    const h = $('#cHist');
    if (h) h.innerHTML = S.calcHistory.length
      ? `<div class="list">${S.calcHistory.map((x, i) => `<div class="row" data-act="useHist" data-id="${i}"><div class="r-ico blue">${icon('calc')}</div><div class="r-main"><small>${esc(x.e)} =</small><strong>${num(x.r).toLocaleString('en-US', { maximumFractionDigits: 10 })}</strong></div></div>`).join('')}</div>`
      : empty('calc', 'No history yet', 'Your calculations appear here.');
  }
  VIEWS.calculator = v => {
    const keys = ['C', '⌫', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '±', '0', '.', '='];
    v.innerHTML = `
      <div class="page-head"><div><h1>Calculator</h1><p>Calculate, then save the result directly as income or expense.</p></div></div>
      <div class="calc-wrap">
        <section class="calc">
          <div class="calc-screen"><div class="expr" id="cExpr"></div><div class="res" id="cRes">0</div></div>
          <div class="keys">${keys.map(k => `<button type="button" class="key ${OPS.includes(k) ? 'op' : ''} ${['C', '⌫', '%', '±'].includes(k) ? 'fn' : ''} ${k === '=' ? 'eq' : ''}" data-act="key" data-id="${k}">${k}</button>`).join('')}</div>
          <div class="calc-save"><button class="btn success" data-act="calcIn">${icon('in')}Save as income</button><button class="btn danger" data-act="calcOut">${icon('out')}Save as expense</button></div>
        </section>
        <section class="card hist"><div class="card-head"><h3>History</h3><button class="btn sm ghost" data-act="clearHist">Clear</button></div><div id="cHist"></div></section>
      </div>`;
    actions.key = k => calcPress(k);
    const useRes = type => {
      const r = calcEval(calc.expr);
      const val = r !== null ? r : num(calc.result);
      if (val <= 0) { toast('Result must be a positive amount', 'error'); return; }
      txForm({ type, amount: val });
    };
    actions.calcIn = () => useRes('income');
    actions.calcOut = () => useRes('expense');
    actions.clearHist = () => { S.calcHistory = []; save(); drawCalc(); };
    actions.useHist = i => { const h = S.calcHistory[+i]; if (h) { calc.expr = String(h.r).replace('-', '−'); calc.result = String(h.r); calc.done = true; drawCalc(); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    drawCalc();
  };
  document.addEventListener('keydown', e => {
    if (current !== 'calculator' || $('#app').hidden || !$('#modal').hidden) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    const map = { '*': '×', '/': '÷', '-': '−', '+': '+', Enter: '=', '=': '=', Backspace: '⌫', Escape: 'C', '%': '%', '.': '.', ',': '.' };
    const k = /^\d$/.test(e.key) ? e.key : map[e.key];
    if (!k) return;
    e.preventDefault();
    calcPress(k);
    const b = $(`.key[data-id="${CSS.escape(k)}"]`);
    if (b) { b.classList.add('pressed'); setTimeout(() => b.classList.remove('pressed'), 120); }
  });

  /* ==========================================================
     VIEW: Daily notes
     ========================================================== */
  let noteQ = '';
  function noteForm(pre = {}) {
    openForm({
      title: pre.id ? 'Edit note' : 'New daily note',
      values: { date: ymd(), tag: 'general', ...pre },
      fields: [
        { name: 'date', label: 'Date', type: 'date', required: true, half: true },
        { name: 'tag', label: 'Tag', type: 'select', options: NOTE_TAGS.map(([v, l]) => [v, l]), half: true },
        { name: 'title', label: 'Title', required: true, placeholder: 'e.g. Plan for this week' },
        { name: 'body', label: 'Note', type: 'textarea', rows: 6, placeholder: 'Write your financial thoughts, plans and reminders…' },
      ],
      onSubmit(d) {
        const rec = { date: d.date || ymd(), tag: d.tag, title: d.title, body: d.body };
        if (pre.id) Object.assign(S.notes.find(n => n.id === pre.id), rec, { updatedAt: new Date().toISOString() });
        else S.notes.push({ id: uid(), createdAt: new Date().toISOString(), ...rec });
        save(); render(false); toast(pre.id ? 'Note updated' : 'Note saved', 'success');
      },
    });
  }
  function noteCard(n) {
    const tag = NOTE_TAGS.find(t => t[0] === n.tag) || NOTE_TAGS[0];
    return `<article class="note-card" style="--nc:${NOTE_COLORS[n.tag] || '#2f7bff'}">
      <h4>${esc(n.title)}</h4>${n.body ? `<p>${esc(n.body)}</p>` : ''}
      <div class="n-foot"><span class="tag ${tag[2]}">${tag[1]}</span><div class="r-acts"><button class="icon-btn sm" data-act="editNote" data-id="${n.id}" aria-label="Edit">${icon('edit')}</button><button class="icon-btn sm danger" data-act="delNote" data-id="${n.id}" aria-label="Delete">${icon('trash')}</button></div></div>
    </article>`;
  }
  VIEWS.notes = v => {
    v.innerHTML = `
      <div class="page-head"><div><h1>Daily Notes</h1><p>Your daily financial journal.</p></div><div class="actions"><button class="btn primary" data-act="addNote">${icon('plus')}New note</button></div></div>
      <section class="card filters"><input type="search" id="nQ" placeholder="Search notes…" value="${esc(noteQ)}"></section>
      <section class="card" id="notesBox"></section>`;
    const draw = () => {
      const q = noteQ.toLowerCase();
      const list = S.notes.filter(n => !q || `${n.title} ${n.body}`.toLowerCase().includes(q)).sort(byDateDesc);
      if (!list.length) { $('#notesBox').innerHTML = empty('note', q ? 'No matching notes' : 'No notes yet', 'Write a daily note about your money, goals or reminders.', `<button class="btn primary" data-act="addNote">${icon('plus')}New note</button>`); return; }
      const g = {};
      list.forEach(n => (g[n.date] = g[n.date] || []).push(n));
      $('#notesBox').innerHTML = `<div class="list">${Object.keys(g).sort().reverse().map(d => `<div class="group-label"><span>${fmtLong(d)}</span><span>${g[d].length}</span></div>${g[d].map(noteCard).join('')}`).join('')}</div>`;
    };
    $('#nQ').oninput = e => { noteQ = e.target.value; draw(); };
    draw();
    fabAction = () => noteForm({});
  };
  COMMON.editNote = id => { const n = S.notes.find(x => x.id === id); if (n) noteForm({ ...n }); };
  COMMON.delNote = id => moveToBin('notes', id);

  /* ==========================================================
     VIEW: Daily reports
     ========================================================== */
  let reportDate = ymd();
  function dayData(d) {
    const tx = S.transactions.filter(t => t.date === d).sort(byDateDesc);
    return { tx, notes: S.notes.filter(n => n.date === d), bills: S.bills.filter(b => b.date === d), ...totals(tx) };
  }
  VIEWS.reports = v => {
    const d = dayData(reportDate);
    const m = reportDate.slice(0, 7);
    const mt = totals(S.transactions.filter(t => String(t.date).startsWith(m)));
    const byCat = {};
    d.tx.filter(t => t.type === 'expense').forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + num(t.amount); });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    v.innerHTML = `
      <div class="page-head"><div><h1>Daily Report</h1><p>${fmtLong(reportDate)}</p></div><div class="actions"><button class="btn primary" data-act="printReport">${icon('print')}Print report</button></div></div>
      <section class="card"><div class="day-nav">
        <button class="icon-btn" data-act="dayPrev" aria-label="Previous day">${icon('left')}</button>
        <input type="date" class="input" id="rDate" value="${reportDate}" aria-label="Report date">
        <button class="icon-btn" data-act="dayNext" aria-label="Next day">${icon('right')}</button>
        <button class="btn sm" data-act="dayToday">Today</button>
      </div></section>
      <section class="report-sum">
        ${stat('Income', money(d.inc), 'in', '#34d399')}${stat('Expenses', money(d.exp), 'out', '#fb7185')}${stat('Net', `<span class="${d.bal >= 0 ? 'pos' : 'neg'}">${money(d.bal)}</span>`, 'scale', '#5cc8ff')}
      </section>
      <section class="grid two">
        <div class="card"><div class="card-head"><h3>Transactions (${d.tx.length})</h3><button class="btn sm" data-act="addTxDay">${icon('plus')}Add</button></div>
          ${d.tx.length ? `<div class="list">${d.tx.map(txRow).join('')}</div>` : empty('swap', 'Nothing recorded', 'No income or expenses on this day.')}</div>
        <div class="grid" style="align-content:start">
          <div class="card"><div class="card-head"><h3>Spending by category</h3></div>
            ${cats.length ? `<div class="list">${cats.map(([c, a]) => `<div><div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:600;margin-bottom:6px"><span>${esc(c)}</span><span class="num">${money(a)}</span></div><div style="height:8px;border-radius:9px;background:rgba(126,174,255,.12);overflow:hidden"><div style="height:100%;width:${(a / d.exp) * 100}%;background:linear-gradient(90deg,#fb7185,#e11d48);border-radius:9px"></div></div></div>`).join('')}</div>` : '<p class="muted">No expenses on this day.</p>'}</div>
          <div class="card"><div class="card-head"><h3>Month so far · ${fmtMonth(m)}</h3></div>
            <div class="list"><div class="row"><div class="r-main"><strong>Income</strong></div><div class="r-amt pos">${money(mt.inc)}</div></div><div class="row"><div class="r-main"><strong>Expenses</strong></div><div class="r-amt neg">${money(mt.exp)}</div></div><div class="row"><div class="r-main"><strong>Target progress</strong><small>${money(mt.inc)} of ${money(S.settings.target)}</small></div><div class="r-amt">${Math.round(Math.min(100, (mt.inc / (num(S.settings.target) || 200)) * 100))}%</div></div></div></div>
        </div>
      </section>
      <section class="card"><div class="card-head"><h3>Notes of the day (${d.notes.length})</h3><button class="btn sm" data-act="addNoteDay">${icon('plus')}Add</button></div>
        ${d.notes.length ? `<div class="list">${d.notes.map(noteCard).join('')}</div>` : '<p class="muted">No notes for this day.</p>'}</section>`;
    const shift = n => { const x = parseDate(reportDate); x.setDate(x.getDate() + n); reportDate = ymd(x); render(false); };
    $('#rDate').onchange = e => { if (e.target.value) { reportDate = e.target.value; render(false); } };
    actions.dayPrev = () => shift(-1);
    actions.dayNext = () => shift(1);
    actions.dayToday = () => { reportDate = ymd(); render(false); };
    actions.addTxDay = () => txForm({ type: 'income', date: reportDate });
    actions.addNoteDay = () => noteForm({ date: reportDate });
    actions.printReport = () => printReport(reportDate);
    fabAction = () => txForm({ type: 'income', date: reportDate });
  };

  const printHead = (title, meta) => `<div class="p-head"><div class="p-brand"><div class="p-logo">H</div><div><h1>HAMDAN PERSONAL OS</h1><p>HAMdan · Personal finance</p></div></div><div class="p-meta"><h2>${title}</h2>${meta}</div></div>`;
  function doPrint(html) {
    $('#print-area').innerHTML = `<div class="p-doc">${html}</div>`;
    setTimeout(() => window.print(), 60);
  }
  function printReport(date) {
    const d = dayData(date);
    doPrint(`${printHead('DAILY REPORT', `<p>${fmtLong(date)}</p><p>Printed ${new Date().toLocaleString('en-GB')}</p>`)}
      <div class="p-box"><div><small>Income</small><strong>${money(d.inc)}</strong></div><div><small>Expenses</small><strong>${money(d.exp)}</strong></div><div><small>Net</small><strong>${money(d.bal)}</strong></div></div>
      <h3 class="p-sec">Transactions</h3>
      ${d.tx.length ? `<table class="p-table"><thead><tr><th>Type</th><th>Category</th><th>Account</th><th>Note</th><th class="r">Amount</th></tr></thead><tbody>${d.tx.map(t => `<tr><td>${t.type === 'income' ? 'Income' : 'Expense'}</td><td>${esc(t.category)}</td><td>${esc((accById(t.accountId) || {}).name || '')}</td><td>${esc(t.note)}</td><td class="r">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td></tr>`).join('')}</tbody></table>` : '<p>No transactions recorded.</p>'}
      ${d.notes.length ? `<h3 class="p-sec">Notes</h3>${d.notes.map(n => `<div class="p-notes"><strong>${esc(n.title)}</strong>${n.body ? '\n' + esc(n.body) : ''}</div>`).join('')}` : ''}
      <div class="p-foot"><span>Generated by HAMDAN PERSONAL OS</span><div class="p-sign">Mr Hamdan</div></div>`);
  }

  /* ==========================================================
     VIEW: Bills
     ========================================================== */
  function billForm(pre) {
    const isEdit = !!(pre && pre.id);
    const b = pre ? JSON.parse(JSON.stringify(pre)) : { number: `HMD-${z(S.settings.billCounter + 1).padStart(4, '0')}`, customer: '', phone: '', date: ymd(), items: [{ desc: '', qty: 1, price: '' }], discount: 0, status: 'unpaid', notes: '' };
    openModal(isEdit ? `Edit bill ${b.number}` : 'New bill', `
      <form id="billF" class="form" novalidate>
        <label class="field half"><span class="label">Bill number</span><input name="number" value="${esc(b.number)}" required></label>
        <label class="field half"><span class="label">Date</span><input name="date" type="date" value="${esc(b.date)}" required></label>
        <label class="field half"><span class="label">Customer / Billed to</span><input name="customer" value="${esc(b.customer)}" placeholder="Name" required></label>
        <label class="field half"><span class="label">Phone (optional)</span><input name="phone" type="tel" value="${esc(b.phone)}" placeholder="+252…"></label>
        <div class="field"><span class="label">Items</span>
          <div class="bill-head"><span>Description</span><span>Qty</span><span>Price</span><span></span></div>
          <div class="bill-items" id="billItems"></div>
          <button type="button" class="btn sm" id="addItem" style="justify-self:start">${icon('plus')}Add item</button>
        </div>
        <label class="field half"><span class="label">Discount ($)</span><input name="discount" type="number" inputmode="decimal" step="0.01" min="0" value="${esc(b.discount)}"></label>
        <div class="field half"><span class="label">Status</span><div class="seg"><label><input type="radio" name="status" value="unpaid" ${b.status !== 'paid' ? 'checked' : ''}><span>Unpaid</span></label><label><input type="radio" name="status" value="paid" ${b.status === 'paid' ? 'checked' : ''}><span>Paid</span></label></div></div>
        <label class="field"><span class="label">Notes (optional)</span><textarea name="notes" rows="2" placeholder="Payment terms, thank-you message…">${esc(b.notes)}</textarea></label>
        <div class="bill-total" id="billTot"></div>
        <label class="check" style="width:100%"><input type="checkbox" name="record"> <span>Also record total as income (Cash account)</span></label>
        <div class="form-actions"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn" id="billSavePrint">${icon('print')}Save & print</button><button class="btn primary" type="submit">Save bill</button></div>
      </form>`, { wide: true });
    const f = $('#billF');
    const box = $('#billItems');
    const drawItems = () => {
      box.innerHTML = b.items.map((it, i) => `<div class="bill-item" data-i="${i}">
        <input class="input" data-k="desc" value="${esc(it.desc)}" placeholder="Item ${i + 1}">
        <input class="input" data-k="qty" type="number" inputmode="decimal" min="0" step="any" value="${esc(it.qty)}">
        <input class="input" data-k="price" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(it.price)}" placeholder="0.00">
        <button type="button" class="icon-btn sm danger" data-rm="${i}" aria-label="Remove item">${icon('x')}</button></div>`).join('');
      drawTot();
    };
    const drawTot = () => {
      b.discount = num(f.elements.discount.value);
      const st = billSubtotal(b);
      $('#billTot').innerHTML = `<div><span>Subtotal</span><span class="num">${money(st)}</span></div><div><span>Discount</span><span class="num">−${money(b.discount)}</span></div><div class="grand"><span>Total</span><span class="num">${money(billTotal(b))}</span></div>`;
    };
    box.addEventListener('input', e => { const row = e.target.closest('[data-i]'); if (!row) return; b.items[+row.dataset.i][e.target.dataset.k] = e.target.value; drawTot(); });
    box.addEventListener('click', e => { const r = e.target.closest('[data-rm]'); if (!r) return; b.items.splice(+r.dataset.rm, 1); if (!b.items.length) b.items.push({ desc: '', qty: 1, price: '' }); drawItems(); });
    $('#addItem').onclick = () => { b.items.push({ desc: '', qty: 1, price: '' }); drawItems(); box.lastElementChild.querySelector('input').focus(); };
    f.elements.discount.oninput = drawTot;
    const commit = () => {
      const bad = $$('[required]', f).find(el => !el.value.trim());
      if (bad) { bad.focus(); toast('Please fill in the required fields', 'error'); return null; }
      const items = b.items.filter(it => String(it.desc).trim() || num(it.price)).map(it => ({ desc: String(it.desc).trim(), qty: num(it.qty) || 1, price: num(it.price) }));
      if (!items.length) { toast('Add at least one item', 'error'); return null; }
      const rec = { number: f.elements.number.value.trim(), date: f.elements.date.value, customer: f.elements.customer.value.trim(), phone: f.elements.phone.value.trim(), items, discount: num(f.elements.discount.value), status: f.querySelector('[name=status]:checked').value, notes: f.elements.notes.value.trim() };
      let saved;
      if (isEdit) { saved = S.bills.find(x => x.id === pre.id); Object.assign(saved, rec); }
      else { saved = { id: uid(), createdAt: new Date().toISOString(), ...rec }; S.bills.push(saved); S.settings.billCounter++; }
      if (f.elements.record.checked && billTotal(saved) > 0) {
        S.transactions.push({ id: uid(), createdAt: new Date().toISOString(), type: 'income', amount: billTotal(saved), category: 'Business', accountId: S.accounts[0].id, date: saved.date, note: `Bill ${saved.number} · ${saved.customer}` });
      }
      save(); closeModal(); render(false);
      toast(isEdit ? 'Bill updated' : `Bill ${saved.number} saved`, 'success');
      return saved;
    };
    f.onsubmit = e => { e.preventDefault(); commit(); };
    $('#billSavePrint').onclick = () => { const s = commit(); if (s) printBill(s); };
    drawItems();
  }
  function printBill(b) {
    doPrint(`${printHead('BILL', `<p><strong>${esc(b.number)}</strong></p><p>${fmtDate(b.date)}</p>`)}
      <div class="p-to"><div><small>Billed to</small><strong>${esc(b.customer)}</strong>${b.phone ? `<br>${esc(b.phone)}` : ''}</div><div style="text-align:right"><small>From</small><strong>Mr Hamdan</strong><br>HAMDAN PERSONAL OS</div></div>
      <table class="p-table"><thead><tr><th>#</th><th>Description</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead>
        <tbody>${b.items.map((it, i) => `<tr><td>${i + 1}</td><td>${esc(it.desc)}</td><td class="r">${it.qty}</td><td class="r">${money(it.price)}</td><td class="r">${money(num(it.qty) * num(it.price))}</td></tr>`).join('')}</tbody></table>
      <div class="p-totals"><div><span>Subtotal</span><span>${money(billSubtotal(b))}</span></div><div><span>Discount</span><span>−${money(b.discount)}</span></div><div class="g"><span>Total</span><span>${money(billTotal(b))}</span></div></div>
      ${b.notes ? `<h3 class="p-sec">Notes</h3><div class="p-notes">${esc(b.notes)}</div>` : ''}
      <div class="p-foot"><span class="p-stamp ${b.status === 'paid' ? 'paid' : 'unpaid'}">${b.status === 'paid' ? 'Paid' : 'Unpaid'}</span><div class="p-sign">Authorised signature</div></div>`);
  }
  VIEWS.bills = v => {
    const list = [...S.bills].sort(byDateDesc);
    const unpaid = list.filter(b => b.status !== 'paid');
    v.innerHTML = `
      <div class="page-head"><div><h1>Bills</h1><p>Create professional printable bills and track payments.</p></div><div class="actions"><button class="btn primary" data-act="newBill">${icon('plus')}New bill</button></div></div>
      <section class="grid stats">
        ${stat('Bills', list.length, 'bill', '#2f7bff')}
        ${stat('Total billed', money(sum(list, billTotal)), 'wallet', '#5cc8ff')}
        ${stat('Paid', money(sum(list.filter(b => b.status === 'paid'), billTotal)), 'check', '#34d399')}
        ${stat('Unpaid', money(sum(unpaid, billTotal)), 'out', '#fbbf24')}
      </section>
      <section class="card">${list.length ? `<div class="list">${list.map(b => `<div class="row">
          <div class="r-ico blue">${icon('bill')}</div>
          <div class="r-main"><strong>${esc(b.number)} · ${esc(b.customer)}</strong><small>${fmtDate(b.date)} · ${b.items.length} item${b.items.length === 1 ? '' : 's'}</small></div>
          <button class="tag ${b.status === 'paid' ? 'green' : 'amber'}" data-act="toggleBill" data-id="${b.id}" title="Toggle status">${b.status === 'paid' ? 'Paid' : 'Unpaid'}</button>
          <div class="r-amt num">${money(billTotal(b))}</div>
          <div class="r-acts"><button class="icon-btn sm" data-act="printBill" data-id="${b.id}" aria-label="Print">${icon('print')}</button><button class="icon-btn sm" data-act="editBill" data-id="${b.id}" aria-label="Edit">${icon('edit')}</button><button class="icon-btn sm danger" data-act="delBill" data-id="${b.id}" aria-label="Delete">${icon('trash')}</button></div>
        </div>`).join('')}</div>` : empty('bill', 'No bills yet', 'Create a bill, then print it or save it as PDF.', `<button class="btn primary" data-act="newBill">${icon('plus')}New bill</button>`)}</section>`;
    fabAction = () => billForm();
  };
  COMMON.printBill = id => { const b = S.bills.find(x => x.id === id); if (b) printBill(b); };
  COMMON.editBill = id => { const b = S.bills.find(x => x.id === id); if (b) billForm(b); };
  COMMON.delBill = id => moveToBin('bills', id);
  COMMON.toggleBill = id => { const b = S.bills.find(x => x.id === id); if (!b) return; b.status = b.status === 'paid' ? 'unpaid' : 'paid'; save(); render(false); toast(`${b.number} marked ${b.status}`, 'success'); };

  /* ==========================================================
     VIEW: Calendar
     ========================================================== */
  let calMonth = ym();
  let calSel = ymd();
  VIEWS.calendar = v => {
    const first = parseDate(calMonth + '-01');
    const start = new Date(first); start.setDate(1 - first.getDay());
    const today = ymd();
    const cells = [...Array(42)].map((_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    const sel = dayData(calSel);
    v.innerHTML = `
      <section class="card">
        <div class="cal-head">
          <button class="icon-btn" data-act="calPrev" aria-label="Previous month">${icon('left')}</button>
          <h3>${fmtMonth(calMonth)}</h3>
          <button class="icon-btn" data-act="calNext" aria-label="Next month">${icon('right')}</button>
        </div>
        <div class="cal-grid">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
          ${cells.map(d => {
            const k = ymd(d); const dd = dayData(k);
            const dots = [dd.inc && 'd-in', dd.exp && 'd-out', dd.notes.length && 'd-note', dd.bills.length && 'd-bill'].filter(Boolean);
            return `<button type="button" class="cal-day ${k.slice(0, 7) !== calMonth ? 'other' : ''} ${k === today ? 'today' : ''} ${k === calSel ? 'sel' : ''}" data-act="calDay" data-id="${k}">
              <span>${d.getDate()}</span>${dd.tx.length ? `<span class="cal-amt">${dd.bal >= 0 ? '+' : ''}${Math.round(dd.bal)}</span>` : ''}
              <span class="cal-dots">${dots.map(c => `<i class="${c}"></i>`).join('')}</span></button>`;
          }).join('')}
        </div>
        <div class="legend" style="margin-top:14px;flex-wrap:wrap"><span><i style="background:var(--green)"></i>Income</span><span><i style="background:var(--red)"></i>Expense</span><span><i style="background:var(--sky)"></i>Note</span><span><i style="background:var(--amber)"></i>Bill</span><button class="btn sm ghost" data-act="calToday" style="margin-left:auto">Today</button></div>
      </section>
      <section class="card">
        <div class="card-head"><div><h3>${fmtLong(calSel)}</h3><p class="muted" style="font-size:13px">Income ${money(sel.inc)} · Expenses ${money(sel.exp)} · Net ${money(sel.bal)}</p></div></div>
        <div class="actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
          <button class="btn sm success" data-act="calIn">${icon('in')}Income</button>
          <button class="btn sm danger" data-act="calOut">${icon('out')}Expense</button>
          <button class="btn sm" data-act="calNote">${icon('note')}Note</button>
          <button class="btn sm" data-act="calReport">${icon('report')}Open report</button>
        </div>
        ${sel.tx.length || sel.notes.length || sel.bills.length ? `<div class="list">
          ${sel.tx.map(txRow).join('')}
          ${sel.bills.map(b => `<div class="row"><div class="r-ico blue">${icon('bill')}</div><div class="r-main"><strong>${esc(b.number)} · ${esc(b.customer)}</strong><small>Bill · ${b.status}</small></div><div class="r-amt">${money(billTotal(b))}</div><button class="icon-btn sm" data-act="printBill" data-id="${b.id}" aria-label="Print">${icon('print')}</button></div>`).join('')}
          ${sel.notes.map(noteCard).join('')}
        </div>` : '<p class="muted">Nothing recorded on this day yet.</p>'}
      </section>`;
    const shift = n => { const d = parseDate(calMonth + '-01'); d.setMonth(d.getMonth() + n); calMonth = ym(d); render(false); };
    actions.calPrev = () => shift(-1);
    actions.calNext = () => shift(1);
    actions.calToday = () => { calMonth = ym(); calSel = ymd(); render(false); };
    actions.calDay = k => { calSel = k; if (k.slice(0, 7) !== calMonth) calMonth = k.slice(0, 7); render(false); };
    actions.calIn = () => txForm({ type: 'income', date: calSel });
    actions.calOut = () => txForm({ type: 'expense', date: calSel });
    actions.calNote = () => noteForm({ date: calSel });
    actions.calReport = () => { reportDate = calSel; location.hash = '#/reports'; };
    fabAction = () => txForm({ type: 'income', date: calSel });
  };

  /* ==========================================================
     VIEW: Recycle bin
     ========================================================== */
  VIEWS.bin = v => {
    v.innerHTML = `
      <div class="page-head"><div><h1>Recycle Bin</h1><p>Deleted items stay here until you restore them or delete them permanently.</p></div>
        ${S.bin.length ? `<div class="actions"><button class="btn" data-act="restoreAll">${icon('restore')}Restore all</button><button class="btn danger" data-act="emptyBin">${icon('trash')}Empty bin</button></div>` : ''}</div>
      <section class="card">${S.bin.length ? `<div class="list">${S.bin.map(b => `<div class="row">
          <div class="r-ico blue">${icon({ transactions: 'swap', investments: 'gem', notes: 'note', bills: 'bill' }[b.col] || 'file')}</div>
          <div class="r-main"><strong>${esc(itemTitle(b.col, b.item))}</strong><small>${COL_LABEL[b.col]} · deleted ${new Date(b.deletedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div>
          <div class="r-acts"><button class="btn sm" data-act="restore" data-id="${b.id}">${icon('restore')}<span class="only-desktop">Restore</span></button><button class="icon-btn sm danger" data-act="purge" data-id="${b.id}" aria-label="Delete permanently">${icon('x')}</button></div>
        </div>`).join('')}</div>` : empty('trash', 'Recycle bin is empty', 'Deleted transactions, notes, bills and investments appear here.')}</section>`;
    actions.restore = id => restoreBin(id);
    actions.purge = async id => {
      if (!(await confirmBox('Delete this item permanently? This cannot be undone.', 'Delete forever'))) return;
      S.bin = S.bin.filter(b => b.id !== id); save(); render(false); toast('Deleted permanently');
    };
    actions.restoreAll = () => { const n = S.bin.length; [...S.bin].forEach(b => restoreBin(b.id, true)); toast(`${n} item${n === 1 ? '' : 's'} restored`, 'success'); };
    actions.emptyBin = async () => {
      if (!(await confirmBox(`Permanently delete all ${S.bin.length} items in the recycle bin?`, 'Empty bin'))) return;
      S.bin = []; save(); render(false); toast('Recycle bin emptied');
    };
  };

  /* ==========================================================
     VIEW: Backup & settings
     ========================================================== */
  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  VIEWS.backup = v => {
    const bytes = new Blob([localStorage.getItem(KEY) || '']).size;
    const wp = S.settings.wallpaper;
    v.innerHTML = `
      <div class="page-head"><div><h1>Backup & Settings</h1><p>Your data lives in this browser. Export a backup regularly to keep it safe.</p></div></div>
      <section class="card">
        <div class="card-head"><h3>Data backup</h3><span class="tag">${(bytes / 1024).toFixed(1)} KB used</span></div>
        <div class="set-row"><div><h4>Export backup</h4><p>Download all accounts, transactions, investments, notes, bills and settings as a JSON file.</p></div><div class="actions"><button class="btn primary" data-act="export">${icon('download')}Export JSON</button></div></div>
        <div class="set-row"><div><h4>Import backup</h4><p>Restore from a previously exported HAMDAN OS backup file. Replaces current data.</p></div><div class="actions"><button class="btn" data-act="import">${icon('upload')}Import JSON</button></div></div>
        <div class="set-row"><div><h4>Export transactions (CSV)</h4><p>Open your income and expenses in Excel or Google Sheets.</p></div><div class="actions"><button class="btn" data-act="csv">${icon('file')}Export CSV</button></div></div>
      </section>
      <section class="card">
        <div class="card-head"><h3>Welcome wallpaper</h3></div>
        <div class="wp-pick">
          <button class="wp-tile blue ${wp !== 'light' ? 'active' : ''}" data-act="wp" data-id="blue">Blue 💙</button>
          <button class="wp-tile light ${wp === 'light' ? 'active' : ''}" data-act="wp" data-id="light">Light Blue</button>
        </div>
      </section>
      <section class="card">
        <div class="card-head"><h3>Profile & goals</h3></div>
        <div class="set-row"><div style="display:flex;align-items:center;gap:12px"><span class="avatar sm">${avatarHTML()}</span><div><h4>Profile photo</h4><p>Shown on your dashboard.</p></div></div><div class="actions"><button class="btn sm" data-act="photo">${icon('camera')}Change</button>${S.settings.photo ? `<button class="btn sm danger" data-act="rmPhoto">Remove</button>` : ''}</div></div>
        <div class="set-row"><div><h4>Monthly income target</h4><p>Currently ${money(S.settings.target)}</p></div><div class="actions"><button class="btn sm" data-act="target">${icon('target')}Edit</button></div></div>
      </section>
      <section class="card">
        <div class="card-head"><h3>Account</h3></div>
        <div class="set-row"><div><h4>Logout</h4><p>Signed in as Hamdan.</p></div><div class="actions"><button class="btn" data-act="logout">${icon('logout')}Logout</button></div></div>
        <div class="set-row"><div><h4>Reset all data</h4><p>Erase everything stored in this browser. Export a backup first.</p></div><div class="actions"><button class="btn danger" data-act="reset">${icon('trash')}Reset</button></div></div>
      </section>`;
    actions.export = () => {
      download(`hamdan-os-backup-${ymd()}.json`, JSON.stringify({ app: 'HAMDAN PERSONAL OS', exportedAt: new Date().toISOString(), data: S }, null, 2), 'application/json');
      toast('Backup exported', 'success');
    };
    actions.import = () => $('#importInput').click();
    actions.csv = () => {
      const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
      const rows = [['Date', 'Type', 'Category', 'Account', 'Amount', 'Note'], ...[...S.transactions].sort(byDateDesc).map(t => [t.date, t.type, t.category, (accById(t.accountId) || {}).name || '', num(t.amount).toFixed(2), t.note])];
      download(`hamdan-os-transactions-${ymd()}.csv`, '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n'), 'text/csv');
      toast('CSV exported', 'success');
    };
    actions.wp = id => { S.settings.wallpaper = id; save(); applyWallpaper(); render(false); toast(`Wallpaper set to ${id === 'light' ? 'Light Blue' : 'Blue 💙'}`, 'success'); };
    actions.photo = () => $('#photoInput').click();
    actions.rmPhoto = () => { S.settings.photo = ''; save(); updateAvatars(); render(false); toast('Photo removed'); };
    actions.target = editTarget;
    actions.logout = async () => { if (await confirmBox('Log out of HAMDAN PERSONAL OS?', 'Logout', 'primary')) logout(); };
    actions.reset = async () => {
      if (!(await confirmBox('This permanently erases ALL data in this browser. Continue?', 'Erase everything'))) return;
      S = defaults(); save(); applyWallpaper(); updateAvatars(); render(false); toast('All data has been reset');
    };
  };
  $('#importInput').addEventListener('change', e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      let parsed;
      try { parsed = JSON.parse(r.result); } catch { toast('That file is not valid JSON', 'error'); return; }
      const data = parsed && parsed.data ? parsed.data : parsed;
      if (!data || !Array.isArray(data.accounts) || !Array.isArray(data.transactions)) { toast('This is not a HAMDAN OS backup file', 'error'); return; }
      const n = data.transactions.length;
      if (!(await confirmBox(`Import backup with ${n} transaction${n === 1 ? '' : 's'}${parsed.exportedAt ? ` (exported ${new Date(parsed.exportedAt).toLocaleDateString('en-GB')})` : ''}? Current data will be replaced.`, 'Import', 'primary'))) return;
      S = normalize(data);
      if (save()) { applyWallpaper(); updateAvatars(); render(false); toast('Backup imported successfully', 'success'); }
    };
    r.onerror = () => toast('Could not read the file', 'error');
    r.readAsText(f);
  });

  /* ---------------- boot ---------------- */
  applyWallpaper();
  initLogin();
  if (isLogged()) enterApp(false);

  // keep multiple tabs in sync
  window.addEventListener('storage', e => { if (e.key === KEY) { S = load(); applyWallpaper(); updateAvatars(); render(false); } });
})();
