/* AktaşScore — team.js */
AS.requireAuth();

const params  = new URLSearchParams(location.search);
const teamId  = params.get('id');
const fromPage = params.get('from') || 'home.html';
const team    = TEAM_PROFILES[teamId];

if (!team) { window.location.href = fromPage; }

// ── HERO ─────────────────────────────────────────
document.getElementById('topbar-league').textContent = team.league;
document.getElementById('hero-name').textContent    = team.name;
document.getElementById('hero-league').textContent  = team.league;

// CSS Logo
document.getElementById('hero-logo-wrap').innerHTML = buildLogo(teamId, 'xl');

// Hero bg gradient from team color
document.getElementById('hero-bg').style.background =
  `linear-gradient(135deg, ${team.color}22 0%, ${team.color2 ? team.color2+'11' : '#0c112000'} 50%, #070b16 100%),
   linear-gradient(180deg, #0c1120 0%, #070b16 100%)`;

// ── FAV TOGGLE ───────────────────────────────────
const favBtn = document.getElementById('fav-toggle');
function updateFav() {
  const active = AS.isFavTeam(teamId);
  favBtn.classList.toggle('active', active);
}
updateFav();
favBtn.addEventListener('click', () => {
  const added = AS.toggleFavTeam({ id: teamId, name: team.name, short: team.short, color: team.color, color2: team.color2, league: team.league });
  updateFav();
  showToast(added ? '⭐' : '💔', added ? `${team.name} favorilere eklendi` : `${team.name} favorilerden çıkarıldı`, '', added ? 'goal' : 'neutral');
});

// ── BACK ─────────────────────────────────────────
document.getElementById('back-btn').addEventListener('click', () => goBack());

// ── TABS ─────────────────────────────────────────
const tabs    = document.querySelectorAll('.tab');
const tabLine = document.getElementById('tab-line');
let activeTab = 'squad';

function updateLine(el) {
  const parent = el.closest('.tabs');
  const pr = parent.getBoundingClientRect();
  const r  = el.getBoundingClientRect();
  tabLine.style.left  = (r.left - pr.left) + 'px';
  tabLine.style.width = r.width + 'px';
}

tabs.forEach(t => {
  t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    activeTab = t.dataset.tab;
    updateLine(t);
    renderTab(activeTab);
  });
});
setTimeout(() => updateLine(document.querySelector('.tab.active')), 50);

// ── RENDER ───────────────────────────────────────
function renderTab(tab) {
  const c = document.getElementById('tab-content');
  c.scrollTop = 0;
  c.classList.remove('fade-in'); void c.offsetWidth; c.classList.add('fade-in');
  if (tab === 'squad')  renderSquad();
  else                  renderRecent();
}

// ── KADRO ────────────────────────────────────────
function renderSquad() {
  const c = document.getElementById('tab-content');
  const posClass = p => ({ GK:'pos-gk', DEF:'pos-def', MID:'pos-mid', FWD:'pos-fwd' }[p] || '');

  // Coach
  const coach = team.coach;
  const coachInitials = coach.name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
  const coachHtml = `
    <div class="sec-title">Teknik Direktör</div>
    <div class="coach-card">
      <div class="coach-avatar">${coachInitials}</div>
      <div class="coach-info">
        <div class="coach-name">${coach.name}</div>
        <div class="coach-meta">
          <span>${coach.nat}</span>
          <span class="coach-badge">Göreve Başlama: ${coach.since}</span>
          <span class="coach-badge formation">${coach.formation}</span>
        </div>
      </div>
    </div>`;

  // Squad
  const grouped = { GK:[], DEF:[], MID:[], FWD:[] };
  (team.squad || []).forEach(p => { if (grouped[p.pos]) grouped[p.pos].push(p); });

  const posLabels = { GK:'Kaleci', DEF:'Defans', MID:'Orta Saha', FWD:'Forvet' };
  let squadHtml = '';

  if (!team.squad?.length) {
    squadHtml = `<div style="text-align:center;padding:32px;color:var(--sub);font-size:13px">Kadro bilgisi yok</div>`;
  } else {
    ['GK','DEF','MID','FWD'].forEach(pos => {
      if (!grouped[pos].length) return;
      squadHtml += `<div class="sec-title">${posLabels[pos]}</div>
        <div class="player-list">
          ${grouped[pos].map(p => `
            <div class="player-row">
              <div class="player-num">${p.num}</div>
              <div class="player-name">${p.name}</div>
              ${p.event ? `<span class="player-event">${p.event}</span>` : ''}
              <div class="player-pos ${posClass(p.pos)}">${p.pos}</div>
            </div>`).join('')}
        </div>`;
    });
  }

  // Injured
  const injured = team.injured || [];
  let injuredHtml = '';
  if (!injured.length) {
    injuredHtml = `<div class="sec-title">Oynayamayacaklar</div>
      <div class="no-injured">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        Şu an sakatı veya cezalısı olmayan oyuncu yok
      </div>`;
  } else {
    injuredHtml = `<div class="sec-title">Oynayamayacaklar</div>
      ${injured.map(p => `
        <div class="injured-card">
          <div class="inj-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <div style="flex:1">
            <div class="inj-name">${p.name}</div>
            <div class="inj-detail">${p.reason}</div>
            <div class="inj-until">Tahmini: ${p.until}</div>
          </div>
          <div class="inj-num">#${p.num}</div>
        </div>`).join('')}`;
  }

  c.innerHTML = coachHtml + squadHtml + injuredHtml + '<div style="height:24px"></div>';
}

// ── SON MAÇLAR ───────────────────────────────────
function renderRecent() {
  const c = document.getElementById('tab-content');
  const ids = team.recentMatchIds || [];
  const matches = ids.map(id => MATCHES.getMatch(id)).filter(Boolean).slice(0, 5);

  if (!matches.length) {
    c.innerHTML = `<div class="empty-tab">
      <div class="e-icon">📅</div>
      <h3>Maç Bulunamadı</h3>
      <p>Bu takım için son maç verisi henüz yok.</p>
    </div>`;
    return;
  }

  c.innerHTML = `<div class="sec-title">Son Maçlar</div>
    <div class="recent-list">
      ${matches.map(m => {
        const isHome  = m.home.id === teamId;
        const myScore = isHome ? m.score.home : m.score.away;
        const oppScore = isHome ? m.score.away : m.score.home;
        const opp = isHome ? m.away : m.home;
        let result = 'rb-d';
        if (m.status === 'finished') {
          if (myScore > oppScore) result = 'rb-w';
          else if (myScore < oppScore) result = 'rb-l';
        }
        const resultText = m.status === 'finished' ? (result==='rb-w'?'G':result==='rb-l'?'M':'B') : m.status==='live'?'CANLI':'—';

        const hasScore = m.score.home !== null;
        return `<div class="recent-card" data-mid="${m.id}">
          <div class="recent-top">
            <span class="recent-league-flag">${m.leagueFlag}</span>
            <span class="recent-league-name">${m.leagueName}</span>
            <span class="recent-date">${m.date} ${m.time}</span>
          </div>
          <div class="recent-score-row">
            <div class="recent-team ${!isHome ? 'away' : ''}">
              ${buildLogo(m.home.id, 'sm')}
              <span class="recent-team-name">${m.home.name}</span>
            </div>
            <div class="recent-score-center">
              <div class="recent-scoreline" style="color:${m.status==='live'?'var(--red)':'var(--text)'}">
                ${hasScore ? m.score.home + ' — ' + m.score.away : '--:--'}
              </div>
              ${m.ht ? `<div class="recent-ht">İY: ${m.ht}</div>` : ''}
              ${m.status !== 'upcoming' ? `<span class="result-badge ${result}">${resultText}</span>` : ''}
            </div>
            <div class="recent-team ${isHome ? 'away' : ''}">
              <span class="recent-team-name" style="text-align:right">${m.away.name}</span>
              ${buildLogo(m.away.id, 'sm')}
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="height:24px"></div>`;

  c.querySelectorAll('.recent-card').forEach(card => {
    card.addEventListener('click', () => goTo(`match.html?id=${card.dataset.mid}&from=team.html?id=${teamId}`));
  });
}

renderTab('squad');
