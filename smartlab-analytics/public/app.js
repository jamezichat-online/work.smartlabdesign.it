(() => {
  'use strict';
  const preview = document.documentElement.dataset.mode === 'preview';
  const $ = id => document.getElementById(id);
  const state = { sites: [], summary: null, recent: [], category: 'all', days: 7, site: null, next: null, detailRows: [], fake: [] };
  const number = new Intl.NumberFormat('it-IT');
  const date = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const shortDate = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit' });
  const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' });
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const periodName = () => state.days === 1 ? 'oggi' : 'ultimi ' + state.days + ' giorni';
  function todayStart(now = Date.now()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
    const midnight = Date.UTC(+parts.year, +parts.month - 1, +parts.day);
    const hour = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', hourCycle: 'h23' }).format(midnight - 10800000);
    return midnight - ((hour - 21 + 24) % 24) * 3600000;
  }
  const periodStart = () => todayStart(todayStart() + 43200000 - (state.days - 1) * 86400000);
  async function api(path, options) {
    const response = await fetch(path, { credentials: 'same-origin', ...options });
    let data; try { data = await response.json(); } catch { throw new Error('Servizio non disponibile. Riprova tra poco.'); }
    if (!response.ok) { const error = new Error(data.error || 'Impossibile caricare i dati.'); error.status = response.status; throw error; }
    return data;
  }
  function notify(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(notify.timer); notify.timer = setTimeout(() => $('toast').hidden = true, 3000); }
  function showLogin() { $('workspace').hidden = true; $('login').hidden = false; $('logout').hidden = true; }
  function showWorkspace() { $('login').hidden = true; $('workspace').hidden = false; $('logout').hidden = preview; }
  function fakeData() {
    const counts = [128, 91, 69, 47, 28, 104, 33, 17, 12, 59];
    state.fake = state.sites.flatMap((s, index) => Array.from({ length: counts[index] || 20 }, (_, i) => {
      const day = (i * 5 + index * 2) % 14;
      const dayStart = todayStart(todayStart() + 43200000 - day * 86400000);
      let ts = dayStart + (8 + (i * 3 + index) % 11) * 3600000 + ((i * 17) % 60) * 60000 + (i % 60) * 1000;
      if (day === 0 && ts > Date.now()) ts = Date.now() - (i * 61000 + index * 32000);
      return { id: 'demo-' + index + '-' + i, site: s.id, path: s.path, ts };
    })).sort((a, b) => b.ts - a.ts || b.id.localeCompare(a.id));
  }
  function previewSummary() {
    const rows = state.fake.filter(r => r.ts >= periodStart());
    const sites = state.sites.map(s => { const records = rows.filter(r => r.site === s.id); return { site: s.id, total: records.length, today: records.filter(r => dayKey.format(r.ts) === dayKey.format(Date.now())).length, last: records[0]?.ts || null }; });
    const hours = new Map(); for (const r of rows) { const h = Math.floor(r.ts / 3600000) * 3600000; hours.set(h, (hours.get(h) || 0) + 1); }
    return { sites, hours: [...hours].map(([hour, total]) => ({ hour, total })), from: periodStart(), updatedAt: Date.now() };
  }
  function previewViews(site, cursor) {
    const rows = state.fake.filter(r => r.ts >= periodStart() && (!site || r.site === site) && (!cursor || r.ts < cursor.ts || r.ts === cursor.ts && r.id < cursor.id));
    const records = rows.slice(0, 50), last = records.at(-1);
    return { records, next: rows.length > 50 ? { ts: last.ts, id: last.id } : null };
  }
  const metrics = id => state.summary?.sites.find(row => row.site === id) || { total: 0, today: 0, last: null };
  const selectedSites = () => state.sites.filter(s => state.category === 'all' || s.category === state.category);
  function renderCards() {
    $('cards').innerHTML = selectedSites().map(s => {
      const m = metrics(s.id);
      const last = m.last ? date.format(m.last) + ' · ' + time.format(m.last).slice(0, 5) : 'Nessun accesso nel periodo';
      return `<button class="card" data-site="${escape(s.id)}" style="--accent:${escape(s.color)}" aria-label="Apri registro ${escape(s.name)}, ${number.format(m.total)} visualizzazioni"><div class="card-cover"><span class="card-number" aria-hidden="true">${escape(s.number)}</span>${s.image ? `<img src="${escape(s.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}<div class="card-meta"><span>${escape(s.number)} / SMARTLAB</span><span class="category-tag">${s.category === 'dashboard' ? 'DASHBOARD' : 'PERSONALE'}</span></div><h2 class="card-title">${escape(s.name)}<span>${escape(s.subtitle)}</span></h2></div><div class="card-data"><div class="card-stats"><div class="card-total"><strong>${number.format(m.total)}</strong><small>visualizzazioni</small></div><span class="today-pill">${number.format(m.today)} oggi</span></div><div class="card-bottom"><div class="last-view">Ultimo accesso<span>${escape(last)}</span></div><span class="open-detail" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/></svg></span></div></div></button>`;
    }).join('');
    $('cards').querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.hidden = true; }));
    const visible = selectedSites(); const rows = state.recent.filter(r => visible.some(s => s.id === r.site));
    renderTable($('recent-views'), rows.slice(0, 8));
  }
  function renderSummary() {
    const rows = state.summary.sites;
    $('total').textContent = number.format(rows.reduce((sum, row) => sum + row.total, 0));
    $('today').textContent = number.format(rows.reduce((sum, row) => sum + row.today, 0));
    $('active').textContent = rows.filter(row => row.total > 0).length;
    $('registered').textContent = state.sites.length + ' progetti registrati';
    $('all-count').textContent = state.sites.length;
    $('total-period').textContent = periodName();
    $('today-date').textContent = date.format(Date.now());
    $('updated').textContent = (preview ? 'Demo aggiornata ' : 'Aggiornato ') + time.format(state.summary.updatedAt).slice(0, 5);
    renderCards();
  }
  function renderTable(target, records) {
    if (!records.length) { target.innerHTML = '<div class="empty">Nessun accesso registrato in questo periodo.</div>'; return; }
    target.innerHTML = `<table><thead><tr><th scope="col">Progetto</th><th scope="col">Giorno</th><th scope="col">Ora italiana</th><th scope="col">Pagina</th></tr></thead><tbody>${records.map(r => {
      const s = state.sites.find(s => s.id === r.site);
      return `<tr><td><span class="site-dot" style="--accent:${escape(s?.color || '#00bfc4')}" aria-hidden="true"></span>${escape(s?.name || r.site)}</td><td>${date.format(r.ts)}</td><td class="table-time">${time.format(r.ts)}</td><td class="path" title="${escape(r.path)}">${escape(r.path)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
  async function refresh() {
    $('refresh').disabled = true; $('days').disabled = true; $('error').hidden = true;
    try {
      const [summary, recent] = await Promise.all([preview ? previewSummary() : api('/api/summary?days=' + state.days), preview ? previewViews(null, null) : api('/api/views?days=' + state.days)]);
      state.summary = summary; state.recent = recent.records; renderSummary();
    } catch (e) { if (e.status === 401) showLogin(); else { $('error').textContent = e.message; $('error').hidden = false; } }
    finally { $('refresh').disabled = false; $('days').disabled = false; }
  }
  function chart(hours, records) {
    const buckets = new Map();
    if (records) for (const r of records) { const key = dayKey.format(r.ts); buckets.set(key, (buckets.get(key) || 0) + 1); }
    else for (const row of hours) { const key = dayKey.format(row.hour); buckets.set(key, (buckets.get(key) || 0) + row.total); }
    const dates = Array.from({ length: state.days }, (_, i) => todayStart(todayStart() + 43200000 - (state.days - 1 - i) * 86400000));
    const values = dates.map(ts => ({ ts, total: buckets.get(dayKey.format(ts)) || 0 }));
    const max = Math.max(1, ...values.map(v => v.total));
    $('detail-chart').innerHTML = `<div class="chart-title">VISUALIZZAZIONI PER GIORNO · ${periodName().toUpperCase()}</div><div class="chart-bars">${values.map((v, i) => `<div class="chart-column" title="${date.format(v.ts)}: ${v.total} visualizzazioni"><div class="chart-bar" style="--height:${Math.max(1, v.total / max * 85)}%" role="img" aria-label="${date.format(v.ts)}: ${v.total} visualizzazioni"></div><span class="chart-label">${state.days <= 7 || i === 0 || i === values.length - 1 || i % Math.ceil(state.days / 6) === 0 ? shortDate.format(v.ts) : ''}</span></div>`).join('')}</div>`;
  }
  async function getViews(site, cursor) {
    if (preview) return previewViews(site, cursor);
    const params = new URLSearchParams({ days: state.days }); if (site) params.set('site', site); if (cursor) params.set('before', JSON.stringify(cursor));
    return api('/api/views?' + params);
  }
  async function openDetail(site) {
    state.site = site; state.detailRows = []; state.next = null;
    const s = state.sites.find(s => s.id === site);
    const chosen = s ? [s] : state.sites;
    const m = chosen.reduce((acc, s) => { const row = metrics(s.id); return { total: acc.total + row.total, today: acc.today + row.today }; }, { total: 0, today: 0 });
    $('detail-title').textContent = s ? s.name : 'Tutti gli accessi.';
    $('detail-description').textContent = s ? s.host + s.path : 'Registro dei siti · ' + periodName();
    $('detail-summary').innerHTML = `<div><strong>${number.format(m.total)}</strong><span>${periodName()}</span></div><div><strong>${number.format(m.today)}</strong><span>oggi</span></div>`;
    $('detail-chart').hidden = !!site;
    if (!site) chart(state.summary.hours);
    $('detail-views').innerHTML = '<div class="empty">Caricamento degli accessi…</div>'; $('load-more').hidden = true;
    $('detail').showModal();
    try { const result = await getViews(site, null); state.detailRows = result.records; state.next = result.next; renderTable($('detail-views'), state.detailRows); $('load-more').hidden = !state.next; }
    catch (e) { $('detail-views').innerHTML = `<div class="empty">${escape(e.message)}</div>`; }
  }
  async function init() {
    if (preview) {
      $('mode-badge').textContent = 'ANTEPRIMA / DEMO'; $('mode-badge').classList.add('preview'); $('preview-note').hidden = false;
      $('setup').textContent = 'Come si attiva';
      state.sites = await api('./preview-catalog.json'); fakeData(); showWorkspace(); await refresh();
    } else {
      try { state.sites = await api('/api/sites'); showWorkspace(); await refresh(); }
      catch (e) { showLogin(); if (e.status !== 401) $('login-message').textContent = e.message; }
    }
  }
  $('cards').addEventListener('click', event => { const card = event.target.closest('[data-site]'); if (card && state.summary) openDetail(card.dataset.site); });
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    state.category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(b => { const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', active); });
    renderCards();
  }));
  $('refresh').addEventListener('click', refresh);
  $('days').addEventListener('change', () => { state.days = Number($('days').value); refresh(); });
  $('all-views').addEventListener('click', () => { if (state.summary) openDetail(null); });
  $('load-more').addEventListener('click', async () => {
    $('load-more').disabled = true;
    try { const result = await getViews(state.site, state.next); state.detailRows.push(...result.records); state.next = result.next; renderTable($('detail-views'), state.detailRows); $('load-more').hidden = !state.next; }
    catch (e) { notify(e.message); } finally { $('load-more').disabled = false; }
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); });
  });
  $('setup').addEventListener('click', () => {
    $('snippet').textContent = preview ? 'Il collegamento reale sarà disponibile dopo la pubblicazione sul tuo account Cloudflare Free. Nessun accesso reale viene raccolto da questa anteprima.' : '<script defer src="' + location.origin + '/tracker.js" referrerpolicy="no-referrer"></script>';
    $('copy-snippet').hidden = preview; $('connection').showModal();
  });
  $('copy-snippet').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('snippet').textContent); $('copy-result').textContent = 'Script copiato.'; } catch { $('copy-result').textContent = 'Seleziona e copia lo script qui sopra.'; } });
  $('login-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('login-form').querySelector('button'); button.disabled = true; $('login-message').textContent = '';
    try { await api('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('password').value }) }); $('password').value = ''; state.sites = await api('/api/sites'); showWorkspace(); await refresh(); }
    catch (e) { $('login-message').textContent = e.message; } finally { button.disabled = false; }
  });
  $('logout').addEventListener('click', async () => { try { await api('/api/logout', { method: 'POST' }); state.summary = null; state.recent = []; $('cards').replaceChildren(); $('recent-views').replaceChildren(); showLogin(); } catch (e) { notify(e.message); } });
  init().catch(e => { showLogin(); $('login-message').textContent = e.message; });
})();
