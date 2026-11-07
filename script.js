// ===== SETTINGS: change your links here =====
const LINKS = {
  discord:       'https://discord.gg/solsv2',
  guidelines:    'https://pxckdev.github.io/solsv2-server-guidelines/',
  factionRoe:    'https://pxckdev.github.io/solsv2-faction-rules-of-engagement/',
  factionGuide:  'https://pxckdev.github.io/factions--simple-guide-to-serious-faction-roleplay/',
  lspdEms:       'https://pxckdev.github.io/solsv2-lspd-ems-guides/',
  factionHelper: 'https://pxckdev.github.io/solsv2-faction-helper/',
  changelogs:    'https://pxckdev.github.io/solsv2-changelogs/',
};

// Your cfx.re join code: the part after cfx.re/join/  (example: for cfx.re/join/abc123 put 'abc123')
// This turns on the Connect buttons AND the live server status.
const JOIN_CODE = 'connect 23.27.211.14:30130';

// ===== STAFF TEAM =====
// Put names between quotes with commas between them: ['Name1', 'Name2']
// A role with no names is hidden automatically. Rename or add roles however you like.
const STAFF = [
  { role: 'Official Server Owners',      members: ['Pxck', 'Jah'] },
  { role: 'Management', members: ['3xchuckyy', 'Luhkev'] },
  { role: 'Senior Administrators',      members: ['Harmonyruins', 'Fv0ds2', 'Buryfame', 'Whyamenleave'] },
  { role: 'Game Administrators',  members: ['pinkthirtys', 'BabyWalkDown'] },
];

// ===== Fill in the links =====
document.querySelectorAll('[data-link]').forEach((a) => {
  const url = LINKS[a.dataset.link];
  if (url) a.href = url;
  else a.hidden = true; // no link set = hide it
});

if (JOIN_CODE) {
  const btn = document.getElementById('connectBtn');
  btn.href = `https://cfx.re/join/${JOIN_CODE}`;
  btn.hidden = false;
}

// ===== Staff team =====
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
document.getElementById('staffList').innerHTML = STAFF
  .filter((g) => g.members && g.members.length)
  .map((g) => `<div class="staff-group">
      <h3>${esc(g.role)}</h3>
      <div class="staff-names">${g.members.map((m) => `<span class="staff-name">${esc(m)}</span>`).join('')}</div>
    </div>`)
  .join('');

// ===== Server status =====
// Uses FiveM's public server list. Checks again every minute.
const $ = (id) => document.getElementById(id);

function setStatus(state, text, sub) {
  $('statusDot').className = `dot ${state}`;
  $('statusText').textContent = text;
  $('statusSub').textContent = sub || '';
}

async function checkStatus() {
  if (!JOIN_CODE) {
    setStatus('unknown', 'Status unavailable', 'Live status is coming soon.');
    return;
  }
  $('statusConnect').href = `https://cfx.re/join/${JOIN_CODE}`;
  try {
    const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${encodeURIComponent(JOIN_CODE)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    const data = (await res.json()).Data || {};
    const players = data.clients ?? (data.players || []).length;
    const max = Number(data.sv_maxclients ?? data.vars?.sv_maxClients ?? 0);

    setStatus('online', 'Online', 'The city is open. Come through.');
    $('playerCount').textContent = players;
    $('playerMax').textContent = max ? `/ ${max} players` : 'players';
    $('statusPlayers').hidden = false;
    $('statusBar').hidden = !max;
    $('statusFill').style.width = max ? `${Math.min(100, (players / max) * 100)}%` : '0';
    $('statusConnect').hidden = false;
  } catch (_) {
    // FiveM's list drops servers that are offline, so a failed check means it's down
    setStatus('offline', 'Offline', 'The server is down or restarting. Check the Discord for updates.');
    $('statusPlayers').hidden = true;
    $('statusBar').hidden = true;
    $('statusConnect').hidden = true;
  }
  $('statusUpdated').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}
checkStatus();
setInterval(checkStatus, 60000);

// ===== "Latest update" banner =====
// Reads the newest post straight from your changelogs site, so it updates by itself.
function showLatest() {
  if (typeof CHANGELOGS === 'undefined' || !CHANGELOGS.length) return;
  const log = CHANGELOGS[0];
  document.getElementById('latestTitle').textContent = `${log.version ? `${log.version} · ` : ''}${log.title || 'New update'}`;
  const d = new Date(`${log.date}T12:00:00`);
  document.getElementById('latestDate').textContent = isNaN(d) ? (log.date || '') : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('latest').hidden = false;
}

if (LINKS.changelogs) {
  const s = document.createElement('script');
  s.src = `${LINKS.changelogs.replace(/\/?$/, '/')}changelogs.js?v=${Date.now()}`;
  s.onload = showLatest;
  document.body.appendChild(s); // if the changelogs site isn't up yet, the banner just stays hidden
}
