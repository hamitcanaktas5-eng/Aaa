/* AktaşScore — match.js v0.2 */
AS.requireAuth();

const params   = new URLSearchParams(location.search);
const matchId  = params.get('id') || 'sl1';
const fromPage = params.get('from') || 'home.html';
const match    = MATCHES.getMatch(matchId);
if (!match) { window.location.href = fromPage; }

// ── TOPBAR ──────────────────────────────────────
document.getElementById('topbar-league').textContent = match.leagueName;
document.getElementById('topbar-date').textContent   = match.date + ' · ' + match.time;
document.getElementById('back-btn').addEventListener('click', () => goBack());

// ── NOTIF TOGGLE ────────────────────────────────
const notifBtn = document.getElementById('notif-toggle');
function updateNotifBtn() {
  const on = AS.isFavMatch(match.id);
  notifBtn.classList.toggle('active', on);
  notifBtn.title = on ? 'Bildirimi Kapat' : 'Maç Bildirimi Al';
}
updateNotifBtn();
notifBtn.addEventListener('click', () => {
  const added = AS.toggleFavMatch(match.id);
  updateNotifBtn();
  showToast(added ? '🔔' : '🔕', added ? 'Maç favorilere eklendi' : 'Maç favorilerden çıkarıldı', '', 'neutral');
});

// ── HERO ────────────────────────────────────────
document.getElementById('home-logo').innerHTML = buildLogo(match.home.id, 'lg');
document.getElementById('away-logo').innerHTML = buildLogo(match.away.id, 'lg');
document.getElementById('home-name').textContent = match.home.name;
document.getElementById('away-name').textContent = match.away.name;

// Hero gradient from team colors
document.getElementById('hero-bg').style.background =
  `linear-gradient(90deg, ${match.home.color}18 0%, transparent 40%, transparent 60%, ${match.away.color}18 100%),
   linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%)`;

const hasScore = match.score.home !== null;
if (match.status === 'live') {
  document.getElementById('live-badge').classList.remove('hidden');
  document.getElementById('hero-status').textContent = match.minute + "'";
  document.getElementById('hero-status').style.color = 'var(--red)';
} else if (match.status === 'finished') {
  document.getElementById('hero-status').textContent = 'MAÇ SONU';
  document.getElementById('hero-status').style.color = 'var(--sub)';
} else {
  document.getElementById('hero-status').textContent = match.time;
  document.getElementById('hero-status').style.color = 'var(--green)';
}
document.getElementById('score-home').textContent = hasScore ? match.score.home : '-';
document.getElementById('score-away').textContent = hasScore ? match.score.away : '-';
if (!hasScore) {
  ['score-home','score-away'].forEach(id => document.getElementById(id).style.color = 'var(--sub)');
}
if (match.ht) document.getElementById('hero-ht').textContent = 'İY: ' + match.ht;

// Events ribbon
const ribbon = document.getElementById('events-ribbon');
ribbon.innerHTML = match.events
  .filter(e => e.type === 'goal' || e.type === 'red')
  .map(e => {
    const icon = e.type === 'goal'
      ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="var(--green)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`
      : `<svg width="9" height="12" viewBox="0 0 10 14" fill="var(--red)"><rect width="10" height="14" rx="2"/></svg>`;
    return `<div class="evt-chip ${e.type}">${icon} ${e.player} <span style="opacity:.6">${e.min}'</span></div>`;
  }).join('');

// ── FAV BUTTONS ─────────────────────────────────
function initFavBtn(btnId, teamData) {
  const btn = document.getElementById(btnId);
  function upd() { btn.classList.toggle('active', AS.isFavTeam(teamData.id)); }
  upd();
  btn.addEventListener('click', () => {
    const added = AS.toggleFavTeam(teamData);
    upd();
    showToast(added ? '⭐' : '💔', added ? `${teamData.name} favorilere eklendi` : `${teamData.name} favorilerden çıkarıldı`, '', added ? 'goal' : 'neutral');
  });
}
initFavBtn('home-fav-btn', { id:match.home.id, name:match.home.name, short:match.home.short, color:match.home.color, color2:match.home.color2, league:match.leagueName });
initFavBtn('away-fav-btn', { id:match.away.id, name:match.away.name, short:match.away.short, color:match.away.color, color2:match.away.color2, league:match.leagueName });

// ── TABS ────────────────────────────────────────
const tabs = document.querySelectorAll('.tab');
const indicator = document.getElementById('tab-indicator');
function updateIndicator(tabEl) {
  const pr = document.getElementById('tabs').getBoundingClientRect();
  const r  = tabEl.getBoundingClientRect();
  indicator.style.left  = (r.left - pr.left) + 'px';
  indicator.style.width = r.width + 'px';
}
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updateIndicator(tab);
    renderTab(tab.dataset.tab);
  });
});
setTimeout(() => updateIndicator(document.querySelector('.tab.active')), 50);

// ── RENDER ──────────────────────────────────────
function renderTab(tab) {
  const c = document.getElementById('tab-content');
  c.scrollTop = 0;
  c.classList.remove('fade-in'); void c.offsetWidth; c.classList.add('fade-in');
  if      (tab === 'summary') renderSummary();
  else if (tab === 'stats')   renderStats();
  else if (tab === 'lineup')  renderLineup();
  else if (tab === 'h2h')     renderH2H();
}

function empty(icon, title, sub) {
  return `<div style="text-align:center;padding:60px 24px;color:var(--sub)">
    <div style="font-size:40px;margin-bottom:12px">${icon}</div>
    <div style="font-family:var(--font-h);font-size:18px;font-weight:700">${title}</div>
    <div style="font-size:13px;margin-top:6px;color:var(--muted)">${sub}</div>
  </div>`;
}

function renderSummary() {
  const evts = match.events;
  if (!evts.length) { document.getElementById('tab-content').innerHTML = empty('⚽','Henüz Olay Yok', match.status === 'upcoming' ? 'Maç başlamadı' : 'Maç devam ediyor'); return; }
  let html = '<div class="timeline">'; let htAdded = false;
  evts.forEach(e => {
    if (!htAdded && e.min > 45) {
      htAdded = true;
      html += `<div class="ht-divider"><span class="ht-label">İlk Yarı Sonu${match.ht ? ' · '+match.ht : ''}</span></div>`;
    }
    const icon = { goal: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 7l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 16l-4 2.5 1.5-4.5L6 11.5h4.5z"/></svg>`,
      yellow: `<svg width="10" height="13" viewBox="0 0 10 14" fill="#ffd600"><rect width="10" height="14" rx="2"/></svg>`,
      red:    `<svg width="10" height="13" viewBox="0 0 10 14" fill="#ff3d57"><rect width="10" height="14" rx="2"/></svg>`,
      sub:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.3 2.3-4.9 4.9-4-4L2 16.6 3.4 18l6-6 4 4 6.3-6.3L22 12V6z"/></svg>`,
    }[e.type] || '•';
    const cls = { goal:'goal-icon', yellow:'yellow-icon', red:'red-icon', sub:'' }[e.type] || '';
    const nameHtml = `<span class="tl-name">${e.player}</span><span class="tl-sub">${e.detail}</span>`;
    if (e.side === 'home') {
      html += `<div class="timeline-item"><div class="tl-home">${nameHtml}</div><div class="tl-center"><div class="tl-icon ${cls}">${icon}</div><span class="tl-min">${e.min}'</span></div><div></div></div>`;
    } else {
      html += `<div class="timeline-item"><div></div><div class="tl-center"><div class="tl-icon ${cls}">${icon}</div><span class="tl-min">${e.min}'</span></div><div class="tl-away">${nameHtml}</div></div>`;
    }
  });
  if (!htAdded) html += `<div class="ht-divider"><span class="ht-label">İlk Yarı Sonu${match.ht ? ' · '+match.ht : ''}</span></div>`;
  if (match.status === 'live') html += `<div class="ht-divider"><span class="ht-label" style="color:var(--red);border-color:rgba(255,61,87,.3);background:var(--red-dim)">● CANLI · ${match.minute}'</span></div>`;
  html += '</div>';
  document.getElementById('tab-content').innerHTML = html;
}

function renderStats() {
  if (!match.stats.length) { document.getElementById('tab-content').innerHTML = empty('📊','İstatistik Yok','Maç başladığında istatistikler görünecek'); return; }
  const poss = match.stats.find(s => s.type === 'possession');
  let html = '';
  if (poss) {
    html += `<div class="possession-row"><div class="possession-labels"><span class="home-col">${poss.home}%</span><span class="mid-label">Topa Sahip Olma</span><span class="away-col">${poss.away}%</span></div><div class="possession-bar-wrap"><div class="pos-home" style="width:${poss.home}%"></div><div class="pos-away" style="width:${poss.away}%"></div></div></div>`;
  }
  html += '<div class="section-title">Maç İstatistikleri</div><div class="stats-list">';
  match.stats.filter(s => s.type !== 'possession').forEach(s => {
    const total = s.home + s.away || 1;
    const hp = Math.round(s.home/total*100);
    html += `<div class="stat-row"><div class="stat-val home">${s.home}</div><div class="stat-bar-wrap"><div class="stat-label">${s.label}</div><div class="stat-bar"><div class="stat-fill-home" style="width:${hp}%"></div><div class="stat-fill-away" style="width:${100-hp}%"></div></div></div><div class="stat-val away">${s.away}</div></div>`;
  });
  html += '</div>';
  document.getElementById('tab-content').innerHTML = html;
}

function renderLineup() {
  const posClass = p => ({ GK:'pos-gk', DEF:'pos-def', MID:'pos-mid', FWD:'pos-fwd' }[p] || '');
  const buildPl  = pl => pl.map(p => `<div class="player-row"><div class="player-num">${p.num}</div><div class="player-name">${p.name}</div>${p.event ? `<span class="player-event">${p.event}</span>` : ''}<div class="player-pos ${posClass(p.pos)}">${p.pos}</div></div>`).join('');
  if (!match.lineup.home.starting.length) { document.getElementById('tab-content').innerHTML = empty('👥','Kadro Açıklanmadı','Maç öncesi kadro burada görünecek'); return; }
  document.getElementById('tab-content').innerHTML = `<div class="lineup-wrap">
    <div class="lineup-team-header">${buildLogo(match.home.id,'sm')}<div class="lt-name">${match.home.name}</div><div class="lt-formation">${match.lineup.home.formation}</div></div>
    <div class="player-list">${buildPl(match.lineup.home.starting)}</div>
    <div class="subs-header"><svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg><span class="subs-title">Yedekler</span></div>
    <div class="player-list">${buildPl(match.lineup.home.subs)}</div>
    <div class="lineup-team-header" style="margin-top:16px">${buildLogo(match.away.id,'sm')}<div class="lt-name">${match.away.name}</div><div class="lt-formation">${match.lineup.away.formation}</div></div>
    <div class="player-list">${buildPl(match.lineup.away.starting)}</div>
    <div class="subs-header"><svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg><span class="subs-title">Yedekler</span></div>
    <div class="player-list">${buildPl(match.lineup.away.subs)}</div>
  </div>`;
}

function renderH2H() {
  const h2h = match.h2h;
  const total = h2h.wins.home + h2h.wins.draw + h2h.wins.away;
  const rows = h2h.matches.map(m => {
    const hs = m.homeScore > m.awayScore ? 'color:var(--green)' : '';
    const as = m.awayScore > m.homeScore ? 'color:var(--blue)'  : '';
    return `<div class="h2h-match"><div class="h2h-team right" style="${hs}">${match.home.name}</div><div class="h2h-center"><div class="h2h-score">${m.homeScore} - ${m.awayScore}</div><div class="h2h-date">${m.date}</div></div><div class="h2h-team" style="${as}">${match.away.name}</div></div>`;
  }).join('');
  document.getElementById('tab-content').innerHTML = `<div class="h2h-wrap">
    <div class="section-title">Son ${total} Karşılaşma</div>
    <div class="h2h-summary">
      <div class="h2h-stat-box home-win"><div class="big-num">${h2h.wins.home}</div><div class="box-label">${match.home.name.split(' ')[0]}</div></div>
      <div class="h2h-stat-box draw"><div class="big-num">${h2h.wins.draw}</div><div class="box-label">Beraberlik</div></div>
      <div class="h2h-stat-box away-win"><div class="big-num">${h2h.wins.away}</div><div class="box-label">${match.away.name.split(' ')[0]}</div></div>
    </div>
    <div class="section-title">Son Maçlar</div>
    <div class="h2h-matches">${rows || empty('📅','Veri Yok','Geçmiş maç kaydı bulunamadı')}</div>
  </div>`;
}

renderTab('summary');
