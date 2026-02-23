/* AktaşScore — favorites.js v0.2 */
AS.requireAuth();

let activeTab = 'teams';

// ── TABS ────────────────────────────────────────
const ftabs    = document.querySelectorAll('.ftab');
const indicator = document.getElementById('ftab-indicator');

function updateIndicator(el) {
  const wrap = document.querySelector('.tabs-wrap');
  const r = el.getBoundingClientRect(), pr = wrap.getBoundingClientRect();
  indicator.style.left  = (r.left - pr.left) + 'px';
  indicator.style.width = r.width + 'px';
}

ftabs.forEach(tab => {
  tab.addEventListener('click', () => {
    ftabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    updateIndicator(tab);
    render();
  });
});
setTimeout(() => updateIndicator(document.querySelector('.ftab.active')), 50);

// ── RENDER ──────────────────────────────────────
function render() {
  const c = document.getElementById('content');
  c.classList.remove('fade-in'); void c.offsetWidth; c.classList.add('fade-in');
  if (activeTab === 'teams') renderTeams();
  else renderNotifs();
}

function renderTeams() {
  const teams = AS.getFavTeams();
  const c     = document.getElementById('content');

  if (!teams.length) {
    c.innerHTML = `<div class="empty-state">
      <div class="e-icon">⭐</div>
      <h3>Favori Takım Yok</h3>
      <p>Maç ekranlarında takım adına veya yıldıza tıklayarak takımları favorilere ekleyebilirsin.</p>
      <button class="empty-btn" onclick="goTo('home.html')">Maçlara Git</button>
    </div>`;
    return;
  }

  c.innerHTML = `<div class="team-grid">
    ${teams.map(t => `
      <div class="team-card" data-tid="${t.id}">
        <button class="team-card-remove" data-id="${t.id}">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <div class="team-card-logo">${buildLogo(t.id, 'lg')}</div>
        <div class="team-card-name">${t.name}</div>
        <div class="team-card-league">${t.league || ''}</div>
        <button class="team-card-detail" data-tid="${t.id}">Detay</button>
      </div>`).join('')}
  </div>`;

  c.querySelectorAll('.team-card-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id   = btn.dataset.id;
      const team = teams.find(t => t.id === id);
      AS.toggleFavTeam(team);
      showToast('💔', `${team.name} favorilerden çıkarıldı`, '', 'neutral');
      render();
    });
  });

  c.querySelectorAll('.team-card-detail').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      goTo(`team.html?id=${btn.dataset.tid}&from=favorites.html`);
    });
  });

  c.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => goTo(`team.html?id=${card.dataset.tid}&from=favorites.html`));
  });
}

function renderNotifs() {
  const favMatchIds = AS.getFavMatches();
  const c = document.getElementById('content');

  if (!favMatchIds.length) {
    c.innerHTML = `<div class="empty-state">
      <div class="e-icon">🔔</div>
      <h3>Bildirim Yok</h3>
      <p>Maç kartlarındaki zil ikonuna basarak maç bildirimleri alabilirsin. Favori maçlar ana sayfada şeritte gösterilir.</p>
      <button class="empty-btn" onclick="goTo('home.html')">Maçlara Git</button>
    </div>`;
    return;
  }

  const matches = favMatchIds.map(id => MATCHES.getMatch(id)).filter(Boolean);

  c.innerHTML = `<div class="notif-list">
    ${matches.map(m => {
      let statusHtml = '', cls = '';
      if (m.status === 'live')      { statusHtml = `<span class="notif-status s-live">🔴 ${m.minute}'</span>`; cls = 'live'; }
      else if (m.status === 'finished') statusHtml = `<span class="notif-status s-finished">MS</span>`;
      else                          statusHtml = `<span class="notif-status s-upcoming">${m.time}</span>`;

      return `<div class="notif-item ${cls}" data-mid="${m.id}">
        <div style="display:flex;align-items:center;gap:8px;flex:1">
          ${buildLogo(m.home.id, 'sm')}
          <div class="notif-info">
            <div class="notif-teams">${m.home.name} — ${m.away.name}</div>
            <div class="notif-league">${m.leagueName} ${statusHtml}</div>
          </div>
          ${buildLogo(m.away.id, 'sm')}
        </div>
        <button class="notif-remove" data-mid="${m.id}">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>`;
    }).join('')}
  </div>`;

  c.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('.notif-remove')) return;
      goTo('match.html?id=' + item.dataset.mid);
    });
  });
  c.querySelectorAll('.notif-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      AS.toggleFavMatch(btn.dataset.mid);
      showToast('🔕', 'Bildirim kapatıldı', '', 'neutral');
      render();
    });
  });
}

render();
