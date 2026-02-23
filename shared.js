/* ================================================
   AktaşScore — shared.js
   Sayfa geçiş yöneticisi + ortak yardımcılar
   ================================================ */

// ── NAVIGATION WITH ANIMATION ──────────────────
function goTo(url, direction = 'forward') {
  const cls = direction === 'back' ? 'page-exit-right' : 'page-exit';
  document.body.classList.add(cls);
  setTimeout(() => { window.location.href = url; }, 180);
}

function goBack() {
  if (history.length > 1) {
    document.body.classList.add('page-exit-right');
    setTimeout(() => history.back(), 180);
  } else {
    goTo('home.html', 'back');
  }
}

// ── CSS LOGO BUILDER ────────────────────────────
// Takım rengi ve kısaltması ile CSS logo oluşturur
// API gelince bu fonksiyon <img> döndürecek
function buildLogo(teamId, size = 'sm') {
  const t = TEAM_PROFILES[teamId];
  if (!t) {
    const initials = (teamId || '??').substring(0, 2).toUpperCase();
    return `<div class="tl tl-${size}" style="--tc:#1e2740;--tc2:#2c3550">${initials}</div>`;
  }
  return `<div class="tl tl-${size}" style="--tc:${t.color};--tc2:${t.color2||'rgba(255,255,255,0.2)'}">${t.short}</div>`;
}

// ── TOAST (shared) ──────────────────────────────
function showToast(emoji, title, sub, type = 'goal', ms = 3500) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<div class="toast-emoji">${emoji}</div><div class="toast-body"><div class="toast-title">${title}</div>${sub ? `<div class="toast-sub">${sub}</div>` : ''}</div>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, ms);
}
