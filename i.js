/* ==================================================================
   WEBFEED — APPLICATION LOGIC
   Everything below runs on MOCK DATA held in-memory in `sites[]`.
   ---------------------------------------------------------------
   TO CONNECT YOUR OWN BACKEND:
   1. Replace `sites` initial value with a fetch() call to your API
      (GET /api/sites) and populate the array with the response.
   2. In handlePublish(), replace the local unshift() with a
      POST /api/sites call, then re-render on success.
   3. In toggleLike()/toggleDislike(), replace the local counter
      mutation with POST /api/sites/:id/like (etc).
   4. In submitComment(), replace with POST /api/sites/:id/comments.
   5. Swap AVATAR_COLORS / mock comment authors for real user data
      from your auth system.
   All functions are isolated so swapping mock logic for real fetch
   calls should not require touching the rendering code below.
   ================================================================== */

// ---------- ICONS (reused inline as strings) ----------
const ICONS = {
  webapp: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 8.5h18" stroke="currentColor" stroke-width="1.8"/><rect x="8.5" y="11.5" width="7" height="6" rx="1.6" stroke="currentColor" stroke-width="1.8"/></svg>`,
  webgame: `<svg viewBox="0 0 24 24" fill="none"><path d="M6.8 8.2h10.4c2.1 0 3.9 1.6 4.2 3.7l.7 4.8a2.3 2.3 0 01-3.9 1.9l-2.1-2.1H9.9l-2.1 2.1a2.3 2.3 0 01-3.9-1.9l.7-4.8c.3-2.1 2.1-3.7 4.2-3.7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.4 11v3.2M6.8 12.6H10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="15.6" cy="11.3" r="1" fill="currentColor"/><circle cx="17.6" cy="13.3" r="1" fill="currentColor"/></svg>`,
  like: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 22V11M2 13v7a2 2 0 002 2h12.6a2 2 0 002-1.7l1.3-8A2 2 0 0018 10h-5l1-5.5a1.5 1.5 0 00-2.6-1.2L7 11H2z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.6"/></svg>`,
  dislike: `<svg viewBox="0 0 24 24" fill="none"><path d="M17 2v11M22 11V4a2 2 0 00-2-2H7.4a2 2 0 00-2 1.7l-1.3 8A2 2 0 006 14h5l-1 5.5a1.5 1.5 0 002.6 1.2L17 13h5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
  comment: `<svg viewBox="0 0 24 24" fill="none"><path d="M21 12a8 8 0 01-8 8H7l-4 3 1-4.5A8 8 0 1121 12z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none"><path d="M10 14a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1.2 1.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M14 10a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1.1-1.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  external: `<svg viewBox="0 0 24 24" fill="none"><path d="M14 4h6v6M20 4l-9 9M6 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  flag: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 3v18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4h11l-2.2 4L16 12H5V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  wave: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 12.5V6a1.5 1.5 0 013 0v5M11 11V4.5a1.5 1.5 0 013 0V11M14 11.5V6a1.5 1.5 0 013 0v7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12l-1.8-1.8a1.4 1.4 0 00-2 2L8.5 16.5a5.5 5.5 0 004 2h3a4 4 0 004-4v-1.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="2.8" stroke="currentColor" stroke-width="1.7"/><circle cx="6" cy="12" r="2.8" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="19" r="2.8" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5l7-4M8.5 13.5l7 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
};

const AVATAR_COLORS = ['#7c5cff','#2fe6c8','#ff8a5c','#ff5c7c','#5c9eff','#c85cff'];
function avatarColor(name){ let h=0; for(const c of name) h+=c.charCodeAt(0); return AVATAR_COLORS[h % AVATAR_COLORS.length]; }
function initials(name){ return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

// ---------- SUPABASE ----------
const SUPABASE_URL = 'https://obateqtiggoplrvkgvju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iYXRlcXRpZ2dvcGxydmtndmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNTYwNDMsImV4cCI6MjEwMTYzMjA0M30.uskWu-wOFe08BZMgFKsXbGp912WHAmlFd2eIdgIjg7I';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const IMAGE_BUCKET = 'webfeed-images';

// ---------- LIVE DATA (populated from Supabase) ----------
let sites = [];         // current feed, mapped from the sites_feed view
let myVotes = {};        // { site_id: 'like' | 'dislike' }, current user's own votes

// The logged-in user, populated after auth. Null until signed in.
let CURRENT_USER = null;

function authorAvatarHtml(author, size){
  size = size || 22;
  const name = (author && author.name) || 'Unknown';
  const url = author && author.avatarUrl;
  if(url){
    return `<img src="${url}" alt="${escapeHtml(name)}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;">`;
  }
  return `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.4)}px;background:${avatarColor(name)};flex-shrink:0;">${initials(name)}</div>`;
}
function authorRowHtml(author, size){
  const name = (author && author.name) || 'Unknown';
  return `<div style="display:flex;align-items:center;gap:7px;">${authorAvatarHtml(author,size)}<span style="font-size:12.5px;color:var(--text-dim);font-weight:500;">${escapeHtml(name)}</span></div>`;
}

let currentGenre = 'webapp'; // publish-form selection
let editingId = null; // set when publish modal is in edit mode
let userSettings = { emailNotifs: true, publicProfile: true, autoplayPreviews: false };

// ---------- HELPERS ----------
function timeAgo(ts){
  const diff = Math.floor((Date.now()-ts)/1000);
  if(diff < 3600) return Math.max(1,Math.floor(diff/60))+'m ago';
  if(diff < 86400) return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}
function genreLabel(g){ return g==='webapp' ? 'Web App' : 'Web Game'; }
function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function showToast(msg, duration=2200){
  const t = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.remove('show'), duration);
}

// ---------- PUBLISH SPAM PREVENTION ----------
// Enforced server-side by a Postgres trigger (enforce_publish_cooldown) on the
// sites table — a 3 min cooldown between publishes that doubles per repeat
// offense while blocked (capped at 30 min). This can't be bypassed by clearing
// browser storage since the database, not the client, is what tracks it.
// Rejected inserts come back as an error with message "SPAM_COOLDOWN:<seconds>".
function formatWaitTime(ms){
  const totalSec = Math.max(1, Math.ceil(ms/1000));
  const min = Math.floor(totalSec/60);
  const sec = totalSec%60;
  if(min===0) return `${sec} sec`;
  if(sec===0) return `${min} min`;
  return `${min} min ${sec} sec`;
}
function parseSpamCooldownError(err){
  const msg = err && err.message ? err.message : '';
  const match = msg.match(/SPAM_COOLDOWN:(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}


// ---------- LIVE COUNT ANIMATION ----------
let displayedCount = 0;
function animateSiteCount(target){
  const el = document.getElementById('siteCount');
  const start = displayedCount;
  if(start === target) return;
  const duration = 500;
  const startTime = performance.now();
  function tick(now){
    const progress = Math.min(1, (now-startTime)/duration);
    const eased = 1 - Math.pow(1-progress, 3); // ease-out cubic
    const value = Math.round(start + (target-start)*eased);
    el.textContent = value;
    if(progress < 1){ requestAnimationFrame(tick); }
    else{
      el.textContent = target;
      displayedCount = target;
      el.classList.add('bump');
      setTimeout(()=>el.classList.remove('bump'), 350);
    }
  }
  requestAnimationFrame(tick);
}

// ---------- RECOMMENDED FOR YOU ----------
function renderRecommendations(){
  const section = document.getElementById('recSection');
  const rail = document.getElementById('recRail');
  if(!section || !rail) return;

  const pool = sites.filter(s=>!s.mine);
  if(pool.length===0){ section.classList.add('hidden'); return; }

  // Build genre affinity from the user's own likes.
  const affinity = {};
  sites.forEach(s=>{ if(s.userVote==='like') affinity[s.genre] = (affinity[s.genre]||0) + 1; });
  const hasAffinity = Object.keys(affinity).length > 0;

  const score = s => {
    let sc = s.likes*2 - s.dislikes + s.commentCount;
    if(hasAffinity) sc += (affinity[s.genre]||0) * 25; // strong nudge toward liked genres
    if(s.userVote==='like') sc -= 1000; // don't recommend what they already liked
    return sc;
  };

  const picks = pool.slice().sort((a,b)=>score(b)-score(a)).slice(0,10);
  if(picks.length===0){ section.classList.add('hidden'); return; }
  section.classList.remove('hidden');

  rail.innerHTML = picks.map(s=>{
    const topGenre = hasAffinity && affinity[s.genre] ? genreLabel(s.genre) : null;
    const why = topGenre ? `Because you liked ${topGenre} sites` : 'Trending with the community';
    return `
    <div class="rec-card glass" onclick="openInfo('${s.id}')">
      <div class="rec-thumb">
        <img src="${s.img}" alt="${escapeHtml(s.title)} thumbnail" loading="lazy">
        <div class="rec-badge genre-${s.genre}">${ICONS[s.genre]}${genreLabel(s.genre)}</div>
      </div>
      <div class="rec-body">
        <div class="rec-title">${escapeHtml(s.title)}</div>
        <div class="rec-why"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>${why}</div>
        <div class="rec-stats">
          <div class="stat">${ICONS.like}<span>${s.likes}</span></div>
          <div class="stat">${ICONS.comment}<span>${s.commentCount}</span></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ---------- RENDER FEED ----------
function adCardHtml(type){
  if(type === 'welcome'){
    return `
    <div class="card glass ad-card">
      <div class="ad-label">Sponsored</div>
      <div class="ad-card-inner ad-welcome">
        <div class="ad-icon">${ICONS.wave}</div>
        <div class="ad-title">Welcome to WebFeed! 👋</div>
        <div class="ad-desc">Discover indie web apps and browser games from creators like you. Like, comment, and share what you find.</div>
      </div>
    </div>`;
  }
  return `
  <div class="card glass ad-card">
    <div class="ad-label">Sponsored</div>
    <div class="ad-card-inner ad-publish">
      <div class="ad-icon">${ICONS.webapp}</div>
      <div class="ad-title">Ready to publish? 🚀</div>
      <div class="ad-desc">Share your own web app or game with the community in seconds.</div>
      <button class="btn btn-primary" style="margin-top:10px;" onclick="openPublish()">Publish now</button>
    </div>
  </div>`;
}

function renderFeed(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const genre = document.getElementById('genreFilter').value;
  const sort = document.getElementById('sortBy').value;

  let list = sites.filter(s=>{
    const matchesQ = !q || s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
    const matchesGenre = genre==='all' || s.genre===genre;
    return matchesQ && matchesGenre;
  });

  if(sort==='newest') list = list.slice().sort((a,b)=>b.createdAt-a.createdAt);
  else if(sort==='liked') list = list.slice().sort((a,b)=>b.likes-a.likes);
  else if(sort==='popular') list = list.slice().sort((a,b)=>(b.likes+b.dislikes+b.commentCount)-(a.likes+a.dislikes+a.commentCount));

  animateSiteCount(sites.length);

  const feed = document.getElementById('feed');
  if(list.length===0){
    feed.innerHTML = `<div class="empty" style="grid-column:1/-1;">
      <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <div>No websites match your search.</div>
    </div>`;
    renderRecommendations();
    return;
  }

  const cardHtmls = list.map(s=>`
    <div class="card glass" style="animation-delay:${Math.random()*.15}s">
      <div class="card-chrome">
        <div class="chrome-dots"><span></span><span></span><span></span></div>
        <div class="card-url mono">${escapeHtml(s.url)}</div>
      </div>
      <div class="card-thumb">
        <img src="${s.img}" alt="${escapeHtml(s.title)} thumbnail" loading="lazy">
        <div class="genre-badge genre-${s.genre}">${ICONS[s.genre]}${genreLabel(s.genre)}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(s.title)}</div>
        <div class="card-desc">${escapeHtml(s.desc)}</div>
        <div style="margin-top:2px;">${authorRowHtml(s.mine ? CURRENT_USER : s.author, 20)}</div>
      </div>
      <div class="card-stats">
        <div class="stat clickable ${s.userVote==='like'?'liked':''}" onclick="event.stopPropagation();toggleLike('${s.id}')">${ICONS.like}<span>${s.likes}</span></div>
        <div class="stat clickable ${s.userVote==='dislike'?'disliked':''}" onclick="event.stopPropagation();toggleDislike('${s.id}')">${ICONS.dislike}<span>${s.dislikes}</span></div>
        <div class="stat">${ICONS.comment}<span>${s.commentCount}</span></div>
      </div>
      ${s.mine ? `
      <div class="card-owner-actions">
        <button class="mini-btn" onclick="event.stopPropagation();openEdit('${s.id}')">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
          Edit
        </button>
        <button class="mini-btn danger" onclick="event.stopPropagation();deleteSite('${s.id}')">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4.5a1 1 0 011-1h4a1 1 0 011 1V7m2 0v13a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 20V7h12z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Delete
        </button>
      </div>` : ''}
      <div class="card-footer">
        <button class="btn btn-ghost" onclick="openInfo('${s.id}')">More Info</button>
        <button class="icon-btn" title="Share" onclick="event.stopPropagation();shareSite('${s.id}')">${ICONS.share}</button>
      </div>
    </div>
  `);

  feed.innerHTML = cardHtmls.join('');

  renderRecommendations();
}

// ---------- SHARE ----------
// Uses the native Web Share API (mobile share sheet / desktop share popover).
// Falls back to copying the link when the API isn't available (some desktop browsers).
async function shareSite(id){
  const s = sites.find(x=>x.id===id); if(!s) return;
  const shareUrl = `https://${s.url.replace(/^https?:\/\//,'')}`;
  const shareData = {
    title: s.title,
    text: s.desc,
    url: shareUrl
  };
  if(navigator.share){
    try{
      await navigator.share(shareData);
    }catch(err){
      if(err.name !== 'AbortError'){ console.error('shareSite failed', err); }
    }
  }else if(navigator.clipboard){
    try{
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link copied to clipboard');
    }catch(err){
      console.error('shareSite clipboard fallback failed', err);
      showToast('Could not share — try again');
    }
  }
}

// ---------- MODERATION ----------
let pendingWarnings = [];
async function moderatorDeleteSite(siteId){
  if(!CURRENT_USER || !CURRENT_USER.isModerator) return;
  if(!confirm('Delete this site permanently? This also removes its votes, comments, and reports.')) return;
  try{
    const {error} = await sb.from('sites').delete().eq('id', siteId);
    if(error) throw error;
    sites = sites.filter(s=>s.id !== siteId);
    showToast('Site deleted');
    renderProfile('reports');
    renderFeed();
  }catch(err){
    console.error('moderatorDeleteSite failed', err);
    showToast('Could not delete site');
  }
}

async function dismissReport(reportId){
  if(!CURRENT_USER || !CURRENT_USER.isModerator) return;
  try{
    const {error} = await sb.from('reports').update({status:'dismissed'}).eq('id', reportId);
    if(error) throw error;
    showToast('Report dismissed');
    renderProfile('reports');
  }catch(err){
    console.error('dismissReport failed', err);
    showToast('Could not dismiss report');
  }
}

async function warnUser(userId){
  if(!CURRENT_USER || !CURRENT_USER.isModerator) return;
  const reason = prompt('Reason for this warning:');
  if(!reason || !reason.trim()) return;
  try{
    const {error} = await sb.from('warnings').insert({user_id: userId, moderator_id: CURRENT_USER.id, reason: reason.trim()});
    if(error) throw error;
    showToast('Warning sent');
  }catch(err){
    console.error('warnUser failed', err);
    showToast('Could not send warning');
  }
}

async function banUser(userId){
  if(!CURRENT_USER || !CURRENT_USER.isModerator) return;
  const reason = prompt('Reason for this ban:');
  if(!reason || !reason.trim()) return;
  if(!confirm('Ban this user? They will be locked out immediately.')) return;
  try{
    const {error} = await sb.from('profiles').update({
      is_banned: true,
      ban_reason: reason.trim(),
      banned_at: new Date().toISOString(),
      banned_by: CURRENT_USER.id
    }).eq('id', userId);
    if(error) throw error;
    showToast('User banned');
  }catch(err){
    console.error('banUser failed', err);
    showToast('Could not ban user');
  }
}

// ---------- LIKE / DISLIKE ----------
async function toggleLike(id){
  if(!CURRENT_USER) return;
  const s = sites.find(x=>x.id===id); if(!s) return;
  const prevVote = s.userVote;

  // optimistic update
  if(prevVote==='like'){ s.likes--; s.userVote=null; }
  else{
    if(prevVote==='dislike'){ s.dislikes--; }
    s.likes++; s.userVote='like';
  }
  myVotes[id] = s.userVote;
  renderFeed();
  if(document.getElementById('infoOverlay').classList.contains('open')) renderInfo(id);
  if(document.getElementById('profileOverlay').classList.contains('open')) renderProfile(profileView);

  try{
    if(prevVote==='like'){
      await sb.from('votes').delete().eq('site_id', id).eq('user_id', CURRENT_USER.id);
    }else{
      await sb.from('votes').upsert({site_id:id, user_id:CURRENT_USER.id, vote_type:'like'}, {onConflict:'site_id,user_id'});
    }
    await refreshSiteCounts(id);
  }catch(err){
    console.error('toggleLike failed', err);
    showToast('Could not save your like — try again');
  }
}
async function toggleDislike(id){
  if(!CURRENT_USER) return;
  const s = sites.find(x=>x.id===id); if(!s) return;
  const prevVote = s.userVote;

  // optimistic update
  if(prevVote==='dislike'){ s.dislikes--; s.userVote=null; }
  else{
    if(prevVote==='like'){ s.likes--; }
    s.dislikes++; s.userVote='dislike';
  }
  myVotes[id] = s.userVote;
  renderFeed();
  if(document.getElementById('infoOverlay').classList.contains('open')) renderInfo(id);
  if(document.getElementById('profileOverlay').classList.contains('open')) renderProfile(profileView);

  try{
    if(prevVote==='dislike'){
      await sb.from('votes').delete().eq('site_id', id).eq('user_id', CURRENT_USER.id);
    }else{
      await sb.from('votes').upsert({site_id:id, user_id:CURRENT_USER.id, vote_type:'dislike'}, {onConflict:'site_id,user_id'});
    }
    await refreshSiteCounts(id);
  }catch(err){
    console.error('toggleDislike failed', err);
    showToast('Could not save your vote — try again');
  }
}

// re-syncs one site's like/dislike/comment counts from the source of truth
async function refreshSiteCounts(id){
  const {data, error} = await sb.from('sites_feed').select('likes,dislikes,comment_count').eq('id', id).single();
  if(error || !data) return;
  const s = sites.find(x=>x.id===id);
  if(!s) return;
  s.likes = data.likes;
  s.dislikes = data.dislikes;
  s.commentCount = data.comment_count;
  renderFeed();
  if(document.getElementById('infoOverlay').classList.contains('open')) renderInfo(id);
  if(document.getElementById('profileOverlay').classList.contains('open')) renderProfile(profileView);
}

// ---------- NOTIFICATIONS ----------
async function openNotifications(){
  document.getElementById('notifBody').innerHTML = `<div style="padding:60px 0;text-align:center;color:var(--text-faint);font-size:13.5px;">Loading...</div>`;
  document.getElementById('notifOverlay').classList.add('open');
  await loadNotifications();
}

async function loadNotifications(){
  if(!CURRENT_USER) return;
  const {data, error} = await sb
    .from('notifications_feed')
    .select('*')
    .eq('user_id', CURRENT_USER.id)
    .order('created_at', {ascending:false})
    .limit(50);

  if(error){
    console.error('loadNotifications failed', error);
    document.getElementById('notifBody').innerHTML = `<div class="empty" style="padding:40px 10px;"><div>Could not load notifications.</div></div>`;
    return;
  }

  renderNotifications(data || []);

  const unreadIds = (data || []).filter(n=>!n.read).map(n=>n.id);
  if(unreadIds.length){
    await sb.from('notifications').update({read:true}).in('id', unreadIds);
  }
  await refreshUnreadBadge();
}

function renderNotifications(list){
  const body = document.getElementById('notifBody');
  if(!list.length){
    body.innerHTML = `<div class="empty" style="padding:60px 10px;">
      <svg viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
      <div>No notifications yet.</div>
    </div>`;
    return;
  }

  body.innerHTML = list.map(n=>{
    let iconHtml = '', textHtml = '', previewHtml = '';

    if(n.type === 'welcome'){
      iconHtml = `<div class="notif-icon-wrap welcome">${ICONS.wave}</div>`;
      textHtml = `<span class="notif-text"><b>Welcome to WebFeed! 👋</b><br>We're glad you're here — publish your first website to get started.</span>`;
    }else if(n.type === 'like'){
      iconHtml = n.actor_avatar_url
        ? `<img src="${n.actor_avatar_url}" alt="" style="width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
        : `<div class="notif-icon-wrap like">${ICONS.like}</div>`;
      textHtml = `<span class="notif-text"><b>${escapeHtml(n.actor_name || 'Someone')}</b> liked your website <b>${escapeHtml(n.site_title || '')}</b></span>`;
    }else if(n.type === 'comment'){
      iconHtml = n.actor_avatar_url
        ? `<img src="${n.actor_avatar_url}" alt="" style="width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
        : `<div class="notif-icon-wrap comment">${ICONS.comment}</div>`;
      textHtml = `<span class="notif-text"><b>${escapeHtml(n.actor_name || 'Someone')}</b> commented on your website <b>${escapeHtml(n.site_title || '')}</b></span>`;
      if(n.comment_preview) previewHtml = `<div class="notif-preview">"${escapeHtml(n.comment_preview)}"</div>`;
    }

    const clickable = n.site_id ? `onclick="closeModal('notifOverlay');openInfo('${n.site_id}')" style="cursor:pointer;"` : '';

    return `
      <div class="notif-row ${n.read ? '' : 'unread'}" ${clickable}>
        ${iconHtml}
        <div class="notif-body">
          ${textHtml}
          ${previewHtml}
          <div class="notif-time">${timeAgo(new Date(n.created_at).getTime())}</div>
        </div>
        ${n.read ? '' : '<div class="notif-dot"></div>'}
      </div>
    `;
  }).join('');
}

async function refreshUnreadBadge(){
  if(!CURRENT_USER) return;
  const {count} = await sb.from('notifications').select('id', {count:'exact', head:true}).eq('user_id', CURRENT_USER.id).eq('read', false);
  const badge = document.getElementById('notifBadge');
  if(badge) badge.style.display = (count && count > 0) ? 'block' : 'none';
}

// ---------- REPORT ----------
let reportTargetId = null;
function openReport(id){
  reportTargetId = id;
  document.getElementById('reportForm').reset();
  document.querySelector('input[name="reportReason"][value="spam"]').checked = true;
  document.getElementById('reportOverlay').classList.add('open');
}
async function submitReport(e){
  e.preventDefault();
  if(!CURRENT_USER || !reportTargetId) return;
  const reason = document.querySelector('input[name="reportReason"]:checked').value;
  const details = document.getElementById('reportDetails').value.trim();
  const btn = document.getElementById('reportSubmitBtn');
  btn.disabled = true;

  try{
    const {error} = await sb.from('reports').insert({
      site_id: reportTargetId,
      reporter_id: CURRENT_USER.id,
      reason,
      details: details || null
    });
    if(error){
      if(error.code === '23505'){ // unique constraint — already reported
        showToast("You've already reported this website");
      }else{
        throw error;
      }
    }else{
      showToast('Report submitted — thanks for flagging it');
    }
    closeModal('reportOverlay');
  }catch(err){
    console.error('submitReport failed', err);
    showToast('Could not submit report — try again');
  }finally{
    btn.disabled = false;
  }
}

// ---------- INFO MODAL ----------
let activeSiteId = null;
async function openInfo(id){
  activeSiteId = id;
  const s = sites.find(x=>x.id===id);
  if(s && !s.comments) s.comments = []; // show empty while loading
  renderInfo(id);
  document.getElementById('infoOverlay').classList.add('open');
  await loadComments(id);
}
async function loadComments(id){
  const {data, error} = await sb
    .from('comments')
    .select('id, body, created_at, profiles(name, avatar_url)')
    .eq('site_id', id)
    .order('created_at', {ascending:false});
  const s = sites.find(x=>x.id===id); if(!s) return;
  if(error){ console.error('loadComments failed', error); return; }
  s.comments = (data||[]).map(c=>({
    id: c.id,
    name: c.profiles ? c.profiles.name : 'Unknown',
    avatarUrl: c.profiles ? c.profiles.avatar_url : null,
    text: c.body
  }));
  s.commentCount = s.comments.length;
  if(activeSiteId===id && document.getElementById('infoOverlay').classList.contains('open')) renderInfo(id);
  renderFeed();
}
function renderInfo(id){
  const s = sites.find(x=>x.id===id); if(!s) return;
  const comments = s.comments || [];
  const related = sites.filter(x=>x.id!==id && x.genre===s.genre).slice(0,4);
  const relatedHtml = related.length ? related.map(r=>`
    <div class="related-card" onclick="openInfo('${r.id}')">
      <img src="${r.img}" alt="">
      <div class="related-card-info">
        <div class="related-card-title">${escapeHtml(r.title)}</div>
        <div class="related-card-genre">${genreLabel(r.genre)}</div>
      </div>
    </div>`).join('') : `<div style="color:var(--text-faint);font-size:13px;">No related websites yet.</div>`;

  const commentsHtml = comments.length ? comments.map(c=>`
    <div class="comment">
      ${authorAvatarHtml({name:c.name, avatarUrl:c.avatarUrl}, 34)}
      <div class="comment-body">
        <div class="comment-name">${escapeHtml(c.name)}</div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>`).join('') : `<div style="color:var(--text-faint);font-size:13px;">No comments yet — be the first.</div>`;

  document.getElementById('infoContent').innerHTML = `
    <div class="info-hero">
      <img src="${s.img}" alt="${escapeHtml(s.title)}">
      <div class="info-hero-overlay"></div>
    </div>
    <div class="info-content">
      <div class="info-genre-row">
        <div class="genre-badge genre-${s.genre}" style="position:static;">${ICONS[s.genre]}${genreLabel(s.genre)}</div>
        <span style="font-size:12px;color:var(--text-faint);">Published ${timeAgo(s.createdAt)}</span>
      </div>
      <div class="info-title">${escapeHtml(s.title)}</div>
      <div style="margin-bottom:10px;">${authorRowHtml(s.mine ? CURRENT_USER : s.author, 26)}</div>
      <div class="info-url mono">${ICONS.link}${escapeHtml(s.url)}</div>
      <div class="info-desc">${escapeHtml(s.desc)}</div>

      <div class="info-actions">
        <a class="btn btn-primary" href="https://${escapeHtml(s.url.replace(/^https?:\/\//,''))}" target="_blank" rel="noopener">
          ${ICONS.external} Visit Website
        </a>
        <button class="action-pill ${s.userVote==='like'?'liked':''}" onclick="toggleLike('${s.id}')">${ICONS.like} ${s.likes}</button>
        <button class="action-pill ${s.userVote==='dislike'?'disliked':''}" onclick="toggleDislike('${s.id}')">${ICONS.dislike} ${s.dislikes}</button>
        <button class="action-pill report" onclick="openReport('${s.id}')">${ICONS.flag} Report</button>
        <button class="action-pill" onclick="shareSite('${s.id}')">${ICONS.share} Share</button>
      </div>

      <div class="section-title">Comments (${comments.length})</div>
      <div class="comments">${commentsHtml}</div>
      <form class="comment-form" onsubmit="submitComment(event,'${s.id}')">
        <input type="text" placeholder="Add a comment..." id="commentInput" required>
        <button type="submit" class="comment-send">${ICONS.send}</button>
      </form>

      <div class="section-title">Related websites</div>
      <div class="related-grid">${relatedHtml}</div>
    </div>
  `;
}
async function submitComment(e,id){
  e.preventDefault();
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  if(!text || !CURRENT_USER) return;
  input.value='';
  input.disabled = true;
  try{
    const {error} = await sb.from('comments').insert({site_id:id, user_id:CURRENT_USER.id, body:text});
    if(error) throw error;
    await loadComments(id);
    showToast('Comment added');
  }catch(err){
    console.error('submitComment failed', err);
    showToast('Could not post comment — try again');
    input.value = text;
  }finally{
    input.disabled = false;
  }
}

// ---------- URL VALIDATION (fake / placeholder URL detection) ----------
// Blocks obviously fake, placeholder, or unsafe URLs before publish.
// Swap/extend BLOCKED_DOMAINS or add a real DNS/HEAD-check on your backend later.
const BLOCKED_DOMAINS = [
  'example.com','example.org','example.net','test.com','testing.com',
  'fake.com','notreal.com','placeholder.com','yoursite.com','yourwebsite.com',
  'website.com','domain.com','mysite.com','sample.com','foo.com','bar.com',
  'localhost','127.0.0.1','0.0.0.0'
];
const BLOCKED_TLDS = ['.test','.invalid','.example','.local'];

// Allowlist of real, currently-registrable TLDs. If a domain's extension
// isn't in here, it's treated as fake (this is what catches things like
// ".fake", ".corp", ".lan", made-up extensions, or typos).
// Not exhaustive of all ~1500 ICANN TLDs, but covers the ones a real
// website is realistically going to use. Extend this list as needed.
const VALID_TLDS = new Set([
  // generic
  'com','net','org','info','biz','name','pro','mobi',
  // tech / startup favorites
  'io','app','dev','co','ai','xyz','gg','sh','so','to','me','ly','tv','fm','im','id',
  'cloud','tech','online','site','website','page','link','click','store','shop','blog',
  'digital','software','systems','network','codes','computer','solutions','agency',
  'studio','design','art','graphics','media','games','game','wiki','info',
  // country codes (common ones for real sites)
  'us','uk','ca','au','de','fr','es','it','nl','be','ch','at','se','no','dk','fi',
  'pl','pt','gr','ie','cz','hu','ro','bg','hr','sk','si','lt','lv','ee','is',
  'jp','cn','kr','in','sg','hk','tw','th','vn','id','my','ph','nz',
  'br','mx','ar','cl','co','pe','ve','uy',
  'ru','ua','by','kz',
  'za','ng','eg','ke','ma',
  'ae','sa','il','tr',
  'eu','asia'
]);

function isRealTld(host){
  const parts = host.split('.');
  if(parts.length < 2) return false;
  const tld = parts[parts.length-1].toLowerCase();
  return VALID_TLDS.has(tld);
}

// Heuristics for URLs that PARSE fine (not "fake") but show traits
// commonly associated with unsafe / phishing / scam sites.
// This is a lightweight client-side signal, not a real safe-browsing check —
// swap in a real API (Google Safe Browsing, VirusTotal, etc.) on your backend later.
const SUSPICIOUS_TLDS = ['.xyz','.top','.zip','.cam','.click','.rest','.gq','.tk','.ml','.cf','.icu','.buzz'];
const URL_SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','cutt.ly','rb.gy'];
const PHISHING_KEYWORDS = ['login-verify','verify-account','secure-update','account-confirm','wallet-connect','claim-reward','free-gift','urgent-action','password-reset-','signin-security'];
const IMPERSONATED_BRANDS = ['paypal','google','apple','microsoft','amazon','netflix','facebook','instagram','coinbase','binance'];

function analyzeUrlSafety(host, pathname){
  const flags = [];
  const fullHost = host.toLowerCase();
  const full = (fullHost + pathname).toLowerCase();

  if(URL_SHORTENERS.includes(fullHost)){
    flags.push('This is a link shortener — the real destination is hidden.');
  }
  if(SUSPICIOUS_TLDS.some(tld=>fullHost.endsWith(tld))){
    flags.push(`The "${fullHost.slice(fullHost.lastIndexOf('.'))}" domain extension is frequently used for scam or spam sites.`);
  }
  if(PHISHING_KEYWORDS.some(k=>full.includes(k))){
    flags.push('The URL contains wording commonly used in phishing links.');
  }
  const brandHit = IMPERSONATED_BRANDS.find(b=>full.includes(b));
  if(brandHit && !fullHost.endsWith(brandHit+'.com') && fullHost !== brandHit+'.com'){
    flags.push(`Mentions "${brandHit}" but isn't that company's actual domain — possible impersonation.`);
  }
  if(/xn--/.test(fullHost)){
    flags.push('Uses encoded international characters (punycode) — can be used to imitate real domains.');
  }
  if((fullHost.match(/-/g)||[]).length >= 4){
    flags.push('Unusually many hyphens in the domain — a common scam-site pattern.');
  }
  if(fullHost.split('.').length - 1 >= 4){
    flags.push('Unusually many subdomains — sometimes used to disguise the real host.');
  }
  if(/@/.test(full)){
    flags.push('Contains an "@" symbol, which can be used to disguise the true destination.');
  }

  return flags;
}

function analyzeUrl(raw){
  const value = raw.trim();
  if(!value) return {valid:false, reason:'URL is required.'};
  if(/^javascript:/i.test(value)) return {valid:false, reason:'That scheme isn\'t allowed.'};

  let parsed;
  try{
    parsed = new URL(/^https?:\/\//i.test(value) ? value : 'https://'+value);
  }catch(e){
    return {valid:false, reason:'That doesn\'t look like a real website URL.'};
  }

  const host = parsed.hostname.toLowerCase();

  if(!host.includes('.')) return {valid:false, reason:'Missing a domain extension (e.g. .com).'};
  if(BLOCKED_TLDS.some(tld=>host.endsWith(tld))) return {valid:false, reason:'That domain looks like a placeholder, not a real site.'};
  if(!isRealTld(host)) return {valid:false, reason:`".${host.split('.').pop()}" isn't a real domain extension.`};
  if(BLOCKED_DOMAINS.includes(host)) return {valid:false, reason:'That looks like a placeholder domain, not a real website.'};
  if(/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return {valid:false, reason:'Raw IP addresses aren\'t accepted — use a domain.'};
  if(/(.)\1{4,}/.test(host)) return {valid:false, reason:'That domain looks fake (repeated characters).'};
  if(/^(https?:\/\/)?(www\.)?[a-z0-9-]{1,3}\.[a-z]{2,}$/i.test(value) && /^(asdf|test|xxx|qwerty|abc)/i.test(host)){
    return {valid:false, reason:'That looks like a placeholder domain, not a real website.'};
  }

  return {valid:true, cleanHost: host + parsed.pathname.replace(/\/$/,''), safetyFlags: analyzeUrlSafety(host, parsed.pathname)};
}

function validateUrlField(){
  const input = document.getElementById('pUrl');
  const errorEl = document.getElementById('urlError');
  const validEl = document.getElementById('urlValid');
  const warnEl = document.getElementById('urlWarn');
  const warnText = document.getElementById('urlWarnText');
  const errorText = document.getElementById('urlErrorText');

  if(!input.value.trim()){
    input.classList.remove('invalid','unsafe');
    errorEl.classList.remove('show');
    validEl.classList.remove('show');
    warnEl.classList.remove('show');
    return null;
  }

  const result = analyzeUrl(input.value);
  if(!result.valid){
    input.classList.add('invalid');
    input.classList.remove('unsafe');
    errorText.textContent = result.reason;
    errorEl.classList.add('show');
    validEl.classList.remove('show');
    warnEl.classList.remove('show');
  }else if(result.safetyFlags && result.safetyFlags.length){
    input.classList.remove('invalid');
    input.classList.add('unsafe');
    errorEl.classList.remove('show');
    validEl.classList.remove('show');
    warnText.textContent = result.safetyFlags.length === 1
      ? result.safetyFlags[0]
      : result.safetyFlags.length + ' unsafe traits detected: ' + result.safetyFlags.join(' ');
    warnEl.classList.add('show');
  }else{
    input.classList.remove('invalid','unsafe');
    errorEl.classList.remove('show');
    validEl.classList.add('show');
    warnEl.classList.remove('show');
  }
  return result;
}

// ---------- PUBLISH ----------
let pendingImage = null;   // data URL for preview
let pendingImageFile = null; // actual File object to upload
function selectGenre(g){
  currentGenre = g;
  document.querySelectorAll('.genre-opt').forEach(el=>el.classList.toggle('active', el.dataset.genre===g));
}
function handleImagePreview(e){
  const file = e.target.files[0];
  if(!file) return;
  pendingImageFile = file;
  const reader = new FileReader();
  reader.onload = ev=>{
    pendingImage = ev.target.result;
    const preview = document.getElementById('uploadPreview');
    preview.src = pendingImage;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
];

// Uploads a File to Supabase Storage and returns its public URL
async function uploadImage(file, pathPrefix){
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${pathPrefix}/${CURRENT_USER.id}-${Date.now()}.${ext}`;
  const UPLOAD_TIMEOUT_MS = 20000;
  const timeout = new Promise((_,reject)=>setTimeout(()=>reject(new Error('UPLOAD_TIMEOUT')), UPLOAD_TIMEOUT_MS));
  const {error} = await Promise.race([
    sb.storage.from(IMAGE_BUCKET).upload(path, file, {upsert:true}),
    timeout
  ]);
  if(error) throw error;
  const {data} = sb.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function handlePublish(e){
  e.preventDefault();
  if(!CURRENT_USER) return;
  const title = document.getElementById('pTitle').value.trim();
  const urlResult = validateUrlField();
  const desc = document.getElementById('pDesc').value.trim();
  if(!title || !desc) return;
  if(!urlResult || !urlResult.valid){
    document.getElementById('pUrl').focus();
    showToast('Enter a real website URL to publish');
    return;
  }
  if(urlResult.safetyFlags && urlResult.safetyFlags.length){
    const proceed = confirm('This URL was flagged as potentially unsafe:\n\n' + urlResult.safetyFlags.map(f=>'• '+f).join('\n') + '\n\nPublish anyway?');
    if(!proceed) return;
  }
  const url = urlResult.cleanHost;

  const submitBtn = document.getElementById('publishSubmitBtn');
  submitBtn.disabled = true;

  try{
    let imageUrl = null;
    if(pendingImageFile){
      imageUrl = await uploadImage(pendingImageFile, 'sites');
    }

    if(editingId){
      // ---- EDIT existing site ----
      const updatePayload = {title, url, description:desc, genre:currentGenre};
      if(imageUrl) updatePayload.image_url = imageUrl;
      const {error} = await sb.from('sites').update(updatePayload).eq('id', editingId);
      if(error) throw error;
      showToast('Website updated');
    }else{
      // ---- CREATE new site ----
      const insertPayload = {
        owner_id: CURRENT_USER.id,
        title, url, description:desc, genre:currentGenre,
        image_url: imageUrl || FALLBACK_IMAGES[Math.floor(Math.random()*FALLBACK_IMAGES.length)]
      };
      const {error} = await sb.from('sites').insert(insertPayload);
      if(error) throw error;
      showToast('Website published');
    }

    // reset form
    document.getElementById('publishForm').reset();
    pendingImage = null;
    pendingImageFile = null;
    editingId = null;
    document.getElementById('uploadPreview').style.display='none';
    document.getElementById('pUrl').classList.remove('invalid','unsafe');
    document.getElementById('urlError').classList.remove('show');
    document.getElementById('urlValid').classList.remove('show');
    document.getElementById('urlWarn').classList.remove('show');
    selectGenre('webapp');

    closeModal('publishOverlay');
    await loadFeed();
    if(document.getElementById('profileOverlay').classList.contains('open')) renderProfile(profileView);
  }catch(err){
    console.error('handlePublish failed', err);
    const cooldownSeconds = parseSpamCooldownError(err);
    if(cooldownSeconds !== null){
      showToast(`You cannot spam uploads. Please wait ${formatWaitTime(cooldownSeconds*1000)} to try again.`, 4200);
    }else if(err && err.message === 'UPLOAD_TIMEOUT'){
      showToast('Image upload timed out — check your connection and try again', 4200);
    }else{
      showToast('Could not save website — try again');
    }
  }finally{
    submitBtn.disabled = false;
  }
}

function openPublish(){
  editingId = null;
  document.getElementById('publishModalTitle').textContent = 'Publish a website';
  document.getElementById('publishSubmitLabel').textContent = 'Publish website';
  document.getElementById('publishForm').reset();
  pendingImage = null;
  pendingImageFile = null;
  document.getElementById('uploadPreview').style.display='none';
  document.getElementById('pUrl').classList.remove('invalid','unsafe');
  document.getElementById('urlError').classList.remove('show');
  document.getElementById('urlValid').classList.remove('show');
  document.getElementById('urlWarn').classList.remove('show');
  selectGenre('webapp');
  document.getElementById('publishOverlay').classList.add('open');
}

function openEdit(id){
  const s = sites.find(x=>x.id===id); if(!s) return;
  editingId = id;
  document.getElementById('publishModalTitle').textContent = 'Edit website';
  document.getElementById('publishSubmitLabel').textContent = 'Save changes';
  document.getElementById('pTitle').value = s.title;
  document.getElementById('pUrl').value = s.url;
  document.getElementById('pDesc').value = s.desc;
  pendingImage = null;
  pendingImageFile = null;
  document.getElementById('uploadPreview').src = s.img;
  document.getElementById('uploadPreview').style.display = 'block';
  selectGenre(s.genre);
  validateUrlField();
  closeModal('profileOverlay');
  document.getElementById('publishOverlay').classList.add('open');
}

async function deleteSite(id){
  const s = sites.find(x=>x.id===id); if(!s) return;
  if(!confirm(`Delete "${s.title}"? This can't be undone.`)) return;
  try{
    const {error} = await sb.from('sites').delete().eq('id', id);
    if(error) throw error;
    sites = sites.filter(x=>x.id!==id);
    renderFeed();
    if(document.getElementById('profileOverlay').classList.contains('open')) renderProfile(profileView);
    showToast('Website deleted');
  }catch(err){
    console.error('deleteSite failed', err);
    showToast('Could not delete — try again');
  }
}

// ---------- PROFILE ----------
let profileView = 'home';

async function computeProfileStats(){
  if(!CURRENT_USER) return {published:0, liked:0, commentsGiven:0};
  const [pubRes, likeRes, commentRes] = await Promise.all([
    sb.from('sites').select('id', {count:'exact', head:true}).eq('owner_id', CURRENT_USER.id),
    sb.from('votes').select('site_id', {count:'exact', head:true}).eq('user_id', CURRENT_USER.id).eq('vote_type','like'),
    sb.from('comments').select('id', {count:'exact', head:true}).eq('user_id', CURRENT_USER.id),
  ]);
  return {
    published: pubRes.count || 0,
    liked: likeRes.count || 0,
    commentsGiven: commentRes.count || 0
  };
}

async function openProfile(){
  profileView = 'home';
  document.getElementById('profileBody').innerHTML = `<div style="padding:60px 0;text-align:center;color:var(--text-faint);font-size:13.5px;">Loading...</div>`;
  document.getElementById('profileOverlay').classList.add('open');
  await renderProfile('home');
}

async function renderProfile(view){
  profileView = view;
  const body = document.getElementById('profileBody');

  if(view === 'home'){
    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
        <label style="position:relative;width:56px;height:56px;cursor:pointer;flex-shrink:0;" title="Change profile picture">
          ${CURRENT_USER.avatarUrl
            ? `<img src="${CURRENT_USER.avatarUrl}" alt="Profile picture" style="width:56px;height:56px;border-radius:50%;object-fit:cover;display:block;">`
            : `<div class="avatar" style="width:56px;height:56px;font-size:20px;background:linear-gradient(135deg,var(--accent),var(--accent-2));">${initials(CURRENT_USER.name)}</div>`
          }
          <div style="position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;border-radius:50%;background:#0a0a0c;border:1px solid var(--border-hi);display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" fill="none" style="width:11px;height:11px;"><path d="M4 8a2 2 0 012-2h1.2a1 1 0 00.9-.55l.6-1.2A1 1 0 019.6 3.7h4.8a1 1 0 01.9.55l.6 1.2a1 1 0 00.9.55H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12.5" r="3.2" stroke="currentColor" stroke-width="1.6"/></svg>
          </div>
          <input type="file" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;" onchange="handleProfilePicChange(event)">
        </label>
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:center;gap:6px;">
            <div id="profileNameDisplay" style="font-weight:700;font-size:16px;">${escapeHtml(CURRENT_USER.name)}</div>
            <button class="row-icon-btn" title="Edit username" style="width:24px;height:24px;flex-shrink:0;" onclick="startEditUsername()">
              <svg viewBox="0 0 24 24" fill="none" style="width:13px;height:13px;"><path d="M12 20h9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div id="profileNameEdit" style="display:none;gap:6px;align-items:center;margin-top:2px;">
            <input type="text" id="usernameInput" value="${escapeHtml(CURRENT_USER.name)}" maxlength="30"
              onkeydown="if(event.key==='Enter'){saveUsername();}else if(event.key==='Escape'){cancelEditUsername();}"
              style="font-size:14px;padding:5px 8px;border-radius:8px;border:1px solid var(--border-hi);background:var(--bg);color:#fff;width:140px;">
            <button class="row-icon-btn" title="Save" onclick="saveUsername()">
              <svg viewBox="0 0 24 24" fill="none" style="width:14px;height:14px;"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="row-icon-btn danger" title="Cancel" onclick="cancelEditUsername()">
              <svg viewBox="0 0 24 24" fill="none" style="width:14px;height:14px;"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="mono" style="font-size:12px;color:var(--text-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(CURRENT_USER.email)}</div>
        </div>
      </div>
      <div class="profile-list" style="margin-top:14px;">
        <button class="profile-item" style="width:100%;text-align:left;" onclick="renderProfile('mysites')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 8.5h18"/><rect x="8.5" y="11.5" width="7" height="6" rx="1.6"/></svg> My published sites
        </button>
        <button class="profile-item" style="width:100%;text-align:left;" onclick="renderProfile('liked')">
          <svg viewBox="0 0 24 24" fill="none"><path d="M20.8 8.6c0 5.6-8.8 10.4-8.8 10.4S3.2 14.2 3.2 8.6a4.6 4.6 0 018.8-2 4.6 4.6 0 018.8 2z" stroke="currentColor" stroke-width="1.8"/></svg> Liked websites
        </button>
        <button class="profile-item" style="width:100%;text-align:left;" onclick="renderProfile('settings')">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 13a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V19a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H4a2 2 0 110-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H10a1.7 1.7 0 001-1.55V4a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V10a1.7 1.7 0 001.55 1H20a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z" stroke="currentColor" stroke-width="1.3"/></svg> Settings
        </button>
        ${CURRENT_USER.isModerator ? `
        <button class="profile-item" style="width:100%;text-align:left;color:#ff8a5c;" onclick="renderProfile('reports')">
          <svg viewBox="0 0 24 24" fill="none"><path d="M6 3v18M6 4h11l-2 4 2 4H6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg> Reports <span class="mono" style="font-size:10px;background:#ff8a5c22;color:#ff8a5c;padding:2px 6px;border-radius:6px;margin-left:auto;">MOD</span>
        </button>` : ''}
      </div>
    `;
    return;
  }

  if(view === 'reports'){
    if(!CURRENT_USER.isModerator){ body.innerHTML = `<div class="empty-state">Not authorized.</div>`; return; }
    body.innerHTML = `<div class="empty-state">Loading reports…</div>`;
    const {data, error} = await sb.from('reports')
      .select('id, reason, details, created_at, site_id, sites(id, title, url, owner_id), reporter_id, profiles!reports_reporter_id_fkey(name)')
      .eq('status', 'open')
      .order('created_at', {ascending:false});
    if(error){ console.error('load reports failed', error); body.innerHTML = `<div class="empty-state">Could not load reports.</div>`; return; }
    if(!data || !data.length){ body.innerHTML = `<div class="empty-state">No reports. Nice and clean. ✨</div>`; return; }
    body.innerHTML = `
      <button class="row-icon-btn" style="margin-bottom:12px;" onclick="renderProfile('home')">← Back</button>
      <div class="section-title">Reports (${data.length})</div>
      <div class="profile-list">
        ${data.map(r=>`
          <div class="profile-item" style="flex-direction:column;align-items:flex-start;gap:6px;">
            <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
              <b style="font-size:13.5px;">${escapeHtml(r.sites ? r.sites.title : 'Deleted site')}</b>
              <span class="mono" style="font-size:10.5px;color:var(--text-faint);">${new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <div style="font-size:12.5px;color:var(--text-dim);">Reason: <b>${escapeHtml(r.reason)}</b> — by ${escapeHtml(r.profiles ? r.profiles.name : 'unknown')}</div>
            ${r.details ? `<div style="font-size:12.5px;color:var(--text-faint);">"${escapeHtml(r.details)}"</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
              ${r.sites ? `<button class="btn btn-ghost" style="padding:6px 10px;font-size:12px;" onclick="openInfo('${r.site_id}')">View site</button>` : ''}
              ${r.sites ? `<button class="btn" style="padding:6px 10px;font-size:12px;background:#ff4d4d22;color:#ff6b6b;border:1px solid #ff4d4d44;" onclick="moderatorDeleteSite('${r.site_id}')">Delete site</button>` : ''}
              ${r.sites ? `<button class="btn" style="padding:6px 10px;font-size:12px;background:#ff8a5c22;color:#ff8a5c;border:1px solid #ff8a5c44;" onclick="warnUser('${r.sites.owner_id}')">Warn owner</button>` : ''}
              ${r.sites ? `<button class="btn" style="padding:6px 10px;font-size:12px;background:#8b0000;color:#fff;border:1px solid #ff000044;" onclick="banUser('${r.sites.owner_id}')">Ban owner</button>` : ''}
              <button class="btn btn-ghost" style="padding:6px 10px;font-size:12px;" onclick="dismissReport('${r.id}')">Dismiss</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  if(view === 'mysites'){
    const mine = sites.filter(s=>s.mine);
    body.innerHTML = `
      <button class="profile-back" onclick="renderProfile('home')">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back
      </button>
      <div class="section-title" style="margin-top:0;">My published sites (${mine.length})</div>
      ${mine.length ? mine.map(s=>`
        <div class="site-row" style="cursor:pointer;" onclick="closeModal('profileOverlay');openInfo('${s.id}')">
          <img src="${s.img}" alt="">
          <div class="site-row-info">
            <div class="site-row-title">${escapeHtml(s.title)}</div>
            <div class="site-row-meta">${genreLabel(s.genre)}</div>
            <div class="site-row-stats">
              <span class="site-row-stat">${ICONS.eye}${s.views||0}</span>
              <span class="site-row-stat">${ICONS.like}${s.likes}</span>
              <span class="site-row-stat">${ICONS.comment}${s.commentCount}</span>
            </div>
          </div>
          <div class="site-row-actions">
            <button class="row-icon-btn" title="Edit" onclick="event.stopPropagation();openEdit('${s.id}')">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            </button>
            <button class="row-icon-btn danger" title="Delete" onclick="event.stopPropagation();deleteSite('${s.id}')">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4.5a1 1 0 011-1h4a1 1 0 011 1V7m2 0v13a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 20V7h12z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      `).join('') : `<div class="empty" style="padding:40px 10px;"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6"/></svg><div>You haven't published anything yet.</div></div>`}
    `;
    return;
  }

  if(view === 'liked'){
    const liked = sites.filter(s=>s.userVote==='like');
    body.innerHTML = `
      <button class="profile-back" onclick="renderProfile('home')">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back
      </button>
      <div class="section-title" style="margin-top:0;">Liked websites (${liked.length})</div>
      ${liked.length ? liked.map(s=>`
        <div class="site-row" style="cursor:pointer;" onclick="closeModal('profileOverlay');openInfo('${s.id}')">
          <img src="${s.img}" alt="">
          <div class="site-row-info">
            <div class="site-row-title">${escapeHtml(s.title)}</div>
            <div class="site-row-meta">${genreLabel(s.genre)} · ${s.likes} likes</div>
          </div>
          <div class="site-row-actions">
            <button class="row-icon-btn danger" title="Unlike" onclick="event.stopPropagation();toggleLike('${s.id}').then(()=>renderProfile('liked'))">${ICONS.like}</button>
          </div>
        </div>
      `).join('') : `<div class="empty" style="padding:40px 10px;"><svg viewBox="0 0 24 24" fill="none"><path d="M20.8 8.6c0 5.6-8.8 10.4-8.8 10.4S3.2 14.2 3.2 8.6a4.6 4.6 0 018.8-2 4.6 4.6 0 018.8 2z" stroke="currentColor" stroke-width="1.6"/></svg><div>No liked websites yet.</div></div>`}
    `;
    return;
  }

  if(view === 'settings'){
    body.innerHTML = `
      <button class="profile-back" onclick="renderProfile('home')">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back
      </button>
      <div class="section-title" style="margin-top:0;">Settings</div>
      <div class="settings-row">
        <span>Email notifications</span>
        <div class="toggle ${userSettings.emailNotifs?'on':''}" onclick="toggleSetting('emailNotifs')"></div>
      </div>
      <div class="settings-row">
        <span>Public profile</span>
        <div class="toggle ${userSettings.publicProfile?'on':''}" onclick="toggleSetting('publicProfile')"></div>
      </div>
      <div class="settings-row" style="border-bottom:none;">
        <span>Autoplay previews</span>
        <div class="toggle ${userSettings.autoplayPreviews?'on':''}" onclick="toggleSetting('autoplayPreviews')"></div>
      </div>
      <button class="mini-btn danger" style="width:100%;margin-top:24px;justify-content:center;padding:11px;" onclick="handleSignOut()">
        <svg viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Sign out
      </button>
    `;
    return;
  }
}

function startEditUsername(){
  document.getElementById('profileNameDisplay').style.display = 'none';
  const editRow = document.getElementById('profileNameEdit');
  editRow.style.display = 'flex';
  const input = document.getElementById('usernameInput');
  input.focus();
  input.select();
}
function cancelEditUsername(){
  document.getElementById('profileNameDisplay').style.display = '';
  document.getElementById('profileNameEdit').style.display = 'none';
}
async function saveUsername(){
  const input = document.getElementById('usernameInput');
  const name = input.value.trim();
  if(!name){ showToast('Username cannot be empty'); return; }
  if(name.length > 30){ showToast('Username is too long'); return; }
  if(name === CURRENT_USER.name){ cancelEditUsername(); return; }

  try{
    const {error} = await sb.from('profiles').update({name}).eq('id', CURRENT_USER.id);
    if(error) throw error;
    CURRENT_USER.name = name;
    renderProfile('home');
    renderFeed();
    renderTopbarProfileBtn();
    showToast('Username updated');
  }catch(err){
    console.error('saveUsername failed', err);
    if(err.code === '23505'){ showToast('That username is already taken'); }
    else{ showToast('Could not update username — try again'); }
  }
}

function toggleSetting(key){
  userSettings[key] = !userSettings[key];
  renderProfile('settings');
  showToast('Settings updated');
}

async function handleProfilePicChange(e){
  const file = e.target.files[0];
  if(!file || !CURRENT_USER) return;
  try{
    const url = await uploadImage(file, 'avatars');
    const {error} = await sb.from('profiles').update({avatar_url:url}).eq('id', CURRENT_USER.id);
    if(error) throw error;
    CURRENT_USER.avatarUrl = url;
    renderProfile('home');
    renderFeed();
    renderTopbarProfileBtn();
    showToast('Profile picture updated');
  }catch(err){
    console.error('handleProfilePicChange failed', err);
    showToast('Could not update profile picture');
  }
}

// ---------- MODAL HELPERS ----------
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function closeOnOverlay(e, id){ if(e.target.id===id) closeModal(id); }
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){ ['infoOverlay','publishOverlay','profileOverlay','reportOverlay','notifOverlay'].forEach(closeModal); }
});

// ---------- AUTH ----------
let authMode = 'signin'; // or 'signup'

function togglePasswordVisibility(){
  const input = document.getElementById('authPassword');
  const icon = document.getElementById('pwEyeIcon');
  const btn = document.getElementById('pwToggleBtn');
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  icon.innerHTML = showing
    ? `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/>`
    : `<path d="M3 3l18 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M10.6 5.2A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a15.6 15.6 0 01-3.4 4.3M6.7 6.7C4 8.5 2 12 2 12s3.5 7 10 7a9.8 9.8 0 004.4-1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.9 9.9a3 3 0 004.2 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`;
}

function toggleAuthMode(){
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  document.getElementById('authTitle').textContent = authMode === 'signin' ? 'Welcome back' : 'Create your account';
  document.getElementById('authSubtitle').textContent = authMode === 'signin'
    ? 'Sign in to publish, like, and comment.'
    : 'Join WebFeed to start publishing.';
  document.getElementById('authSubmitLabel').textContent = authMode === 'signin' ? 'Sign in' : 'Sign up';
  document.getElementById('authToggleText').textContent = authMode === 'signin' ? "Don't have an account?" : 'Already have an account?';
  document.getElementById('authToggleLink').textContent = authMode === 'signin' ? 'Sign up' : 'Sign in';
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authPassword').autocomplete = authMode === 'signin' ? 'current-password' : 'new-password';
}

async function handleAuthSubmit(e){
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const errorEl = document.getElementById('authError');
  const btn = document.getElementById('authSubmitBtn');
  errorEl.style.display = 'none';
  btn.disabled = true;

  try{
    if(authMode === 'signin'){
      const {error} = await sb.auth.signInWithPassword({email, password});
      if(error) throw error;
    }else{
      const {error} = await sb.auth.signUp({
        email, password,
        options: {data: {name: email.split('@')[0]}}
      });
      if(error) throw error;
      // If email confirmation is required, there may be no session yet.
      const {data:{session}} = await sb.auth.getSession();
      if(!session){
        errorEl.style.display = 'block';
        errorEl.style.background = 'var(--accent-2-dim)';
        errorEl.style.borderColor = '#2fe6c855';
        errorEl.style.color = 'var(--accent-2)';
        errorEl.textContent = 'Account created — check your email to confirm, then sign in.';
        btn.disabled = false;
        return;
      }
    }
    // Explicitly prompt the browser to offer saving these credentials.
    // Needed because this is a JS-driven SPA login, not a real form POST —
    // without this, Chrome's native "Save password?" prompt often won't fire.
    if(window.PasswordCredential){
      try{
        const cred = new PasswordCredential({id: email, password, name: email});
        await navigator.credentials.store(cred);
      }catch(credErr){
        console.warn('Credential save prompt skipped', credErr);
      }
    }
    // onAuthStateChange will pick up the new session and boot the app.
  }catch(err){
    errorEl.style.display = 'block';
    errorEl.style.background = '#ff5c7c22';
    errorEl.style.borderColor = '#ff5c7c55';
    errorEl.style.color = '#ff5c7c';
    errorEl.textContent = err.message || 'Something went wrong. Try again.';
  }finally{
    btn.disabled = false;
  }
}

async function handleSignOut(){
  closeModal('profileOverlay');
  await sb.auth.signOut();
  // onAuthStateChange handles showing the auth gate again.
}

async function loadCurrentUserProfile(userId, email){
  const {data, error} = await sb.from('profiles').select('name, avatar_url, is_moderator, is_banned, ban_reason').eq('id', userId).single();
  if(error){ console.error('loadCurrentUserProfile failed', error); }
  CURRENT_USER = {
    id: userId,
    email,
    name: (data && data.name) || email.split('@')[0],
    avatarUrl: data ? data.avatar_url : null,
    isModerator: !!(data && data.is_moderator),
    isBanned: !!(data && data.is_banned),
    banReason: data ? data.ban_reason : null
  };
}

let banSubscription = null;
function subscribeToBanStatus(userId){
  if(banSubscription){ sb.removeChannel(banSubscription); banSubscription = null; }
  banSubscription = sb.channel(`profile-ban-${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${userId}`
    }, (payload) => {
      const row = payload.new;
      if(!row) return;
      if(row.is_banned){
        if(CURRENT_USER) CURRENT_USER.isBanned = true;
        CURRENT_USER.banReason = row.ban_reason || null;
        document.getElementById('appRoot').style.display = 'none';
        document.getElementById('banGate').style.display = 'flex';
        document.getElementById('banReasonText').textContent = row.ban_reason || 'No reason was given.';
      }
    })
    .subscribe();
}
function unsubscribeFromBanStatus(){
  if(banSubscription){ sb.removeChannel(banSubscription); banSubscription = null; }
}

async function checkPendingWarnings(){
  if(!CURRENT_USER) return;
  const {data, error} = await sb.from('warnings')
    .select('id, reason, created_at')
    .eq('user_id', CURRENT_USER.id)
    .eq('acknowledged', false)
    .order('created_at', {ascending:true});
  if(error){ console.error('checkPendingWarnings failed', error); return; }
  if(data && data.length){ showWarningScreen(data); }
}

function showWarningScreen(warnings){
  pendingWarnings = warnings;
  const list = document.getElementById('warningReasonList');
  list.innerHTML = warnings.map(w => `
    <div class="warning-item">
      <span class="mono" style="font-size:10.5px;color:var(--text-faint);">${new Date(w.created_at).toLocaleDateString()}</span>
      <div>${escapeHtml(w.reason)}</div>
    </div>
  `).join('');
  document.getElementById('warningOverlay').classList.add('open');
}

async function acknowledgeWarnings(){
  if(!pendingWarnings.length){ document.getElementById('warningOverlay').classList.remove('open'); return; }
  const ids = pendingWarnings.map(w=>w.id);
  try{
    const {error} = await sb.from('warnings').update({acknowledged:true, acknowledged_at:new Date().toISOString()}).in('id', ids);
    if(error) throw error;
  }catch(err){
    console.error('acknowledgeWarnings failed', err);
  }
  pendingWarnings = [];
  document.getElementById('warningOverlay').classList.remove('open');
}

// ---------- DATA LOADING ----------
async function loadFeed(){
  const [{data: feedRows, error: feedErr}, voteRows] = await Promise.all([
    sb.from('sites_feed').select('*').order('created_at', {ascending:false}),
    CURRENT_USER
      ? sb.from('votes').select('site_id, vote_type').eq('user_id', CURRENT_USER.id)
      : Promise.resolve({data:[]})
  ]);

  if(feedErr){ console.error('loadFeed failed', feedErr); showToast('Could not load the feed'); return; }

  myVotes = {};
  (voteRows.data || []).forEach(v=>{ myVotes[v.site_id] = v.vote_type; });

  const previousComments = {};
  sites.forEach(s=>{ if(s.comments) previousComments[s.id] = s.comments; });

  sites = (feedRows || []).map(r=>({
    id: r.id,
    title: r.title,
    url: r.url,
    desc: r.description,
    genre: r.genre,
    img: r.image_url,
    likes: r.likes,
    dislikes: r.dislikes,
    commentCount: r.comment_count,
    views: r.view_count || 0,
    createdAt: new Date(r.created_at).getTime(),
    mine: CURRENT_USER ? r.owner_id === CURRENT_USER.id : false,
    author: {name: r.author_name, avatarUrl: r.author_avatar_url},
    userVote: myVotes[r.id] || null,
    comments: previousComments[r.id] || null
  }));

  renderFeed();
}

// ---------- BOOT ----------
function renderTopbarProfileBtn(){
  const btn = document.getElementById('topbarProfileBtn');
  if(!btn || !CURRENT_USER) return;
  if(CURRENT_USER.avatarUrl){
    btn.innerHTML = `<img src="${CURRENT_USER.avatarUrl}" alt="Profile" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  }else{
    btn.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;background:${avatarColor(CURRENT_USER.name)};">${initials(CURRENT_USER.name)}</div>`;
  }
}

async function bootApp(){
  document.getElementById('authGate').style.display = 'none';
  if(CURRENT_USER) subscribeToBanStatus(CURRENT_USER.id);
  if(CURRENT_USER && CURRENT_USER.isBanned){
    document.getElementById('banGate').style.display = 'flex';
    document.getElementById('appRoot').style.display = 'none';
    document.getElementById('banReasonText').textContent = CURRENT_USER.banReason || 'No reason was given.';
    return;
  }
  document.getElementById('banGate').style.display = 'none';
  document.getElementById('appRoot').style.display = 'block';
  renderTopbarProfileBtn();
  refreshUnreadBadge();
  await loadFeed();
  await checkPendingWarnings();
}
function showAuthGate(){
  unsubscribeFromBanStatus();
  document.getElementById('appRoot').style.display = 'none';
  document.getElementById('banGate').style.display = 'none';
  document.getElementById('warningOverlay').classList.remove('open');
  document.getElementById('authGate').style.display = 'flex';
  CURRENT_USER = null;
  sites = [];
  pendingWarnings = [];
}

sb.auth.onAuthStateChange(async (event, session)=>{
  if(session && session.user){
    await loadCurrentUserProfile(session.user.id, session.user.email);
    await bootApp();
  }else{
    showAuthGate();
  }
});

// ---------- INIT ----------
(async function init(){
  const {data:{session}} = await sb.auth.getSession();
  if(session && session.user){
    await loadCurrentUserProfile(session.user.id, session.user.email);
    await bootApp();
  }else{
    showAuthGate();
  }
})();

