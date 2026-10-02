const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// nav
const nav = $('#siteNav');
const menu = $('.nav-menu');
menu?.addEventListener('click',()=>{
  const open = nav.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
});
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}));
document.addEventListener('click',e=>{if(!nav.contains(e.target)){nav.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}});
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>25),{passive:true});

// Scroll polish: lightweight progress bar + current section indicator.
const scrollProgress = $('#scrollProgress i');
const navSectionLinks = $$('.nav-links a[href^=\"#\"]');
const sectionTargets = navSectionLinks.map(a=>({a,el:$(a.getAttribute('href'))})).filter(x=>x.el);
let scrollRaf=0;
function updateScrollUI(){
  scrollRaf=0;
  const doc=document.documentElement;
  const max=doc.scrollHeight-window.innerHeight;
  const pct=max>0 ? Math.min(100,Math.max(0,(window.scrollY/max)*100)) : 0;
  if(scrollProgress) scrollProgress.style.width=pct+'%';
  let current=null;
  for(const item of sectionTargets){
    const top=item.el.getBoundingClientRect().top;
    if(top<=window.innerHeight*0.35) current=item;
  }
  navSectionLinks.forEach(a=>a.classList.remove('active'));
  current?.a.classList.add('active');
}
window.addEventListener('scroll',()=>{if(!scrollRaf) scrollRaf=requestAnimationFrame(updateScrollUI)},{passive:true});
window.addEventListener('resize',()=>{if(!scrollRaf) scrollRaf=requestAnimationFrame(updateScrollUI)},{passive:true});
updateScrollUI();

// cursor glow
const orb = $('.cursor-orb');
let orbRaf = 0, orbX = 0, orbY = 0;
const finePointer = matchMedia('(pointer:fine)').matches;
if(orb && finePointer && !reduceMotion){
  window.addEventListener('pointermove', e => {
    orbX = e.clientX; orbY = e.clientY;
    if(orbRaf) return;
    orbRaf = requestAnimationFrame(() => {
      orb.style.transform = `translate3d(${orbX}px,${orbY}px,0) translate(-50%,-50%)`;
      orbRaf = 0;
    });
  }, {passive:true});
}else if(orb){ orb.style.display='none'; }

// count-up stats
$$('[data-count]').forEach(el=>{
  const target = Number(el.dataset.count);
  if(reduceMotion){el.textContent=target.toLocaleString();return}
  const start=performance.now(),duration=1100;
  const tick=now=>{const p=Math.min(1,(now-start)/duration), eased=1-Math.pow(1-p,3);el.textContent=Math.round(target*eased).toLocaleString();if(p<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
});

// Small hero signal ticker. It stays decorative and stops when the tab is hidden.
const signalTicker = $('#signalTicker');
const signalMessages = [
  'CHROMEUS FEED: ONLINE',
  'NEXUS SIGNAL: STABLE-ISH',
  '1,446 SLIDES DETECTED',
  'PORTAL ROUTE: AVAILABLE',
  'DIMENSIONAL MESS: 01'
];
let signalIndex = 0;
let signalTimer = null;
function rotateSignal(){
  if(document.hidden){ signalTimer=null; return; }
  if(signalTicker){
    signalTicker.style.opacity='0';
    window.setTimeout(()=>{
      signalIndex=(signalIndex+1)%signalMessages.length;
      signalTicker.textContent=signalMessages[signalIndex];
      signalTicker.style.opacity='1';
    },140);
  }
  signalTimer=window.setTimeout(rotateSignal,4200);
}
rotateSignal();
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){ clearTimeout(signalTimer); signalTimer=null; }
  else if(!signalTimer) rotateSignal();
});

// reveal on scroll
const revealItems = $$('.route-card,.act-grid article,.universe-card,.cast-card,.poster-card,.crew-card,.making-grid,.watch-card,.credits-grid,.hub-hero-card,.statement-grid');
if('IntersectionObserver' in window){
  const ro = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      ro.unobserve(entry.target);
    }
  }),{threshold:.08});
  revealItems.forEach(el=>{el.classList.add('will-reveal');ro.observe(el)});
}

// scan joke
const scanButton = $('#scanButton');
const scanResult = $('#scanResult');
const scanLines = [
  'scan complete. result: absolutely no reason this needed 1,446 slides.',
  'scan complete. chromeus is still somewhere over there.',
  'scan complete. dimensional stability remains questionable.',
  'scan complete. pleuh levels: within expected range.',
  'scan complete. recommendation: watch the movie.'
];
scanButton?.addEventListener('click',()=>{
  scanResult.textContent='scanning...';
  setTimeout(()=>scanResult.textContent=scanLines[Math.floor(Math.random()*scanLines.length)],420);
});

// Poster room: the character posters are grouped by their source universe.
const universePosterData = {
  bots: {
    name:'THE BOT GAMES', className:'room-bots', mark:'BOT', kicker:'SIGNAL: BOT GAMES', stat:'235 PLAYERS', mood:'MECHANICAL / COMPETITIVE / LOUD', note:'The robots get a proper technical bay: scanlines, diagnostics and a little game-show energy around their posters.',
    posters:[
      ['p05','Geobot'],['p06','Subot'],['p07','Maxbot'],['p08','Emobot'],['p09','Nerdbot'],['p10','Frank'],['p26','Maxbot — feature']
    ]
  },
  eightfit: {
    name:'8FIT', className:'room-8fit', mark:'8F', kicker:'SIGNAL: 8FIT', stat:'4 HUMAN POSTERS', mood:'HUMAN / LATE-NIGHT / CHAOS', note:'A warmer, more human corner for the 8FIT crew, with diary-card details and a slightly less robotic interface.',
    posters:[
      ['p11','Elijah'],['p12','Malachi'],['p13','Shay'],['p14','Ayaan'],['p25','Elijah — feature']
    ]
  },
  colours: {
    name:'COLOURS', className:'room-colours', mark:'C', kicker:'SIGNAL: COLOURS', stat:'6 COLOUR SIGNALS', mood:'COLOUR / POWERS / PERSONALITY', note:'This bay gets colour bars, little power-signature readouts and a deliberately vibrant treatment to match the source world.',
    posters:[
      ['p15','Turquoise'],['p16','Gold'],['p17','Blue'],['p18','Green'],['p19','Cyan'],['p20','Red'],['p24','Turquoise — feature']
    ]
  },
  algo: {
    name:'ALGOTRIACONTATHLON', className:'room-algo', mark:'EXQ', kicker:'SIGNAL: ALGOTRIACONTATHLON', stat:'EXQ ONLINE', mood:'HOST / COMPETITION / BROADCAST', note:'A broadcast-style bay for EXQ Genius, with competition markers and host-console decoration around the original poster art.',
    posters:[
      ['p21','EXQ Genius'],['p27','EXQ Genius — feature']
    ]
  },
  crossover: {
    name:'NEXUS COLLISION', className:'room-crossover', mark:'×', kicker:'SIGNAL: CROSSOVER', stat:'COLLISION FILES', mood:'ENSEMBLE / PORTALS / DIMENSIONAL', note:'The shared artwork lives here: ensemble pieces, release artwork and the posters built around the Transdimensionalizer.',
    posters:[
      ['p02','Ensemble teaser'],['p03','Main release'],['p23','Ensemble'],
      ['p02','Transdimensionalizer 2000','landscape'],['p03','Main crossover poster','landscape'],['p06','Faceoff','landscape']
    ]
  }
};

const posterRoom = $('#posterRoom');
const posterPortalTransition = $('#posterPortalTransition');
const posterRoomGroups = $('#posterRoomGroups');
const posterGrid = posterRoomGroups;
const portalOpenButton = $('#openPosterRoom');
const portalCloseButton = $('#closePosterRoom');
let filteredPosters=[];
let portalTimers=[];
function clearPortalTimers(){portalTimers.forEach(clearTimeout);portalTimers=[];}

function posterPath(id, type='portrait'){ return `assets/posters/${type}/${id}.png`; }
function posterThumbPath(id, type='portrait'){ return `assets/poster-thumbs/${type}/${id}.webp`; }
let roomPosterCache=null;
function allRoomPosters(){
  if(!roomPosterCache) roomPosterCache=Object.entries(universePosterData).flatMap(([universe,data])=>data.posters.map(([id,title,type='portrait'])=>({id,title,type,universe,className:data.className,src:posterPath(id,type),thumb:posterThumbPath(id,type)})));
  return roomPosterCache;
}

function renderPosterRoom(filter='all', focusUniverse=null){
  if(!posterRoomGroups) return;
  const entries=Object.entries(universePosterData).filter(([key])=>filter==='all'||key===filter);
  posterRoomGroups.innerHTML=entries.map(([key,data])=>{
    const cards=data.posters.map(([id,title,type='portrait'],i)=>{
      const src=posterPath(id,type);
      const thumb=posterThumbPath(id,type);
      const index = allRoomPosters().findIndex(p=>p.id===id&&p.title===title&&p.type===type);
      const dims = type==='landscape' ? 'width=600 height=338' : 'width=450 height=636';
      const feature = /feature/i.test(title);
      return `<button class="room-poster ${type}${feature?' feature-poster':''}" type="button" data-room-index="${index}" aria-label="Open ${title} poster"><span class="poster-pin"></span>${feature?'<span class="feature-ribbon">FEATURE</span>':''}<img src="${thumb}" data-full="${src}" alt="${title} poster" loading="lazy" decoding="async" ${dims}><span class="room-poster-caption"><b>${title}</b><small>${type==='landscape'?'LANDSCAPE':'CHARACTER'} / ORIGINAL ART</small></span></button>`;
    }).join('');
    return `<article class="poster-universe-group ${data.className}" data-universe-group="${key}">
      <div class="universe-plaque"><div class="plaque-mark">${data.mark}</div><div class="plaque-copy"><span>${data.kicker}</span><h3>${data.name}</h3><p>${data.note}</p><div class="plaque-tags"><b>${data.stat}</b><span>${data.mood}</span></div></div><div class="plaque-scan"><i></i><b>ONLINE</b></div></div>
      <div class="room-poster-grid">${cards}</div>
    </article>`;
  }).join('');
  if(focusUniverse){
    const el=$(`.poster-universe-group[data-universe-group="${focusUniverse}"]`);
    el?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
  }
  $$('.room-poster',posterRoomGroups).forEach(card=>card.addEventListener('click',()=>{
    const visible = Array.from(posterRoomGroups.querySelectorAll('.poster-universe-group'))
      .flatMap(group => Array.from(group.querySelectorAll('.room-poster')).map(x => Number(x.dataset.roomIndex)))
      .map(i => allRoomPosters()[i]);
    const clicked = allRoomPosters()[Number(card.dataset.roomIndex)];
    filteredPosters = visible;
    const localIndex = filteredPosters.findIndex(p=>p.id===clicked.id && p.title===clicked.title && p.type===clicked.type);
    openLightbox(localIndex < 0 ? 0 : localIndex);
  }));
}
// Poster Room is rendered lazily when opened. This avoids decoding 27 large posters on page load.


function openPosterPortal(focusUniverse=null){
  if(!posterRoom || !posterPortalTransition) return;
  if(posterPortalTransition.classList.contains('show')) return;
  clearPortalTimers();
  const portalTitle=$('#portalTransitionTitle');
  const portalStatus=$('#portalTransitionStatus');
  document.body.classList.add('poster-portal-pull');
  posterPortalTransition.classList.add('show');
  posterPortalTransition.setAttribute('aria-hidden','false');
  posterRoom.classList.remove('open');
  portalTitle && (portalTitle.textContent=focusUniverse && universePosterData[focusUniverse] ? `ENTERING ${universePosterData[focusUniverse].name.toUpperCase()} ARCHIVE...` : 'ENTERING POSTER ARCHIVE...');
  portalStatus && (portalStatus.textContent='locking coordinates · please keep all limbs inside the dimension.');
  portalTimers.push(window.setTimeout(()=>{ if(portalStatus) portalStatus.textContent='coordinates locked · dimensional passage stable-ish.'; },620));
  portalTimers.push(window.setTimeout(()=>{ if(portalStatus) portalStatus.textContent='arrival vector confirmed · opening archive.'; },1080));
  portalTimers.push(window.setTimeout(()=>{
    posterRoom.classList.add('open');
    posterRoom.setAttribute('aria-hidden','false');
    document.body.classList.remove('poster-portal-pull');
    document.body.style.overflow='hidden';
    $$('.room-filter').forEach(b=>b.classList.toggle('active',b.dataset.roomFilter===(focusUniverse||'all')));
    renderPosterRoom(focusUniverse||'all',focusUniverse);
  },1350));
  portalTimers.push(window.setTimeout(()=>{
    posterPortalTransition.classList.remove('show');
    posterPortalTransition.setAttribute('aria-hidden','true');
  },1540));
}
function closePosterPortal(){
  if(!posterRoom) return;
  clearPortalTimers();
  posterRoom.classList.remove('open');
  posterRoom.setAttribute('aria-hidden','true');
  posterPortalTransition?.classList.remove('show');
  posterPortalTransition?.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  document.body.classList.remove('poster-portal-pull');
  window.setTimeout(()=>{
    if(!posterRoom?.classList.contains('open') && posterRoomGroups){
      posterRoomGroups.innerHTML='';
    }
  },120);
}
portalOpenButton?.addEventListener('click',()=>openPosterPortal());
portalCloseButton?.addEventListener('click',closePosterPortal);
window.nvvcOpenPosterPortal=openPosterPortal;
posterRoom?.addEventListener('click',e=>{ if(e.target===posterRoom || e.target.closest('.poster-room-backdrop')) closePosterPortal(); });
$$('.directory-jump').forEach(btn=>btn.addEventListener('click',()=>openPosterPortal(btn.dataset.openUniverse)));
$$('.room-filter').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.room-filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderPosterRoom(btn.dataset.roomFilter);
  posterRoom?.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
}));

// poster lightbox
const lightbox=$('#lightbox'), lbImg=$('#lightboxImg'), lbMeta=$('#lightboxMeta'), lbTitle=$('#lightboxTitle');let lbIndex=0;
function openLightbox(i){
  lbIndex=i;
  const p=filteredPosters[lbIndex];
  if(!p) return;
  lbImg.src=p.src || posterPath(p.id,p.type);
  lbImg.alt=p.title+' poster';
  lbMeta.textContent=`${p.type} / original marketing art`;
  lbTitle.textContent=p.title;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  window.setTimeout(()=>{ if(!lightbox.classList.contains('open')) lbImg.removeAttribute('src'); },220);
}
function moveLightbox(dir){lbIndex=(lbIndex+dir+filteredPosters.length)%filteredPosters.length;openLightbox(lbIndex)}
$('#lightboxClose')?.addEventListener('click',closeLightbox);$('#lightboxPrev')?.addEventListener('click',()=>moveLightbox(-1));$('#lightboxNext')?.addEventListener('click',()=>moveLightbox(1));lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeLightbox();closeCast();closePosterPortal()}
  if(lightbox.classList.contains('open')){if(e.key==='ArrowRight')moveLightbox(1);if(e.key==='ArrowLeft')moveLightbox(-1)}
});

// Making-of player: local file builds cannot reliably provide YouTube the referrer
// information its embedded player expects, which is a known cause of Error 153.
// On file://, use a polished local fallback that opens the real video instead.
// On an actual hosted page, use the privacy-enhanced embed with an explicit referrer policy.
const makingOfFrame = $('#makingOfFrame');
const videoStatus = $('#videoStatus');
const makingOfVideoId = 'GgjMURUGig8';
const makingOfUrl = `https://www.youtube.com/watch?v=${makingOfVideoId}`;
function renderMakingOfPlayer(){
  if(!makingOfFrame) return;
  if(location.protocol === 'file:'){
    makingOfFrame.innerHTML = `<a class="video-fallback" href="${makingOfUrl}" target="_blank" rel="noopener noreferrer"><strong>WATCH THE MAKING-OF ON YOUTUBE ↗</strong><span>The embedded player is disabled for local file previews. Open the video directly and it will play normally.</span><em class="video-local-note">LOCAL PREVIEW MODE / YOUTUBE EMBEDS NEED A WEB OR HTTPS ORIGIN</em></a>`;
    if(videoStatus) videoStatus.textContent='LOCAL PREVIEW';
    return;
  }
  const origin = encodeURIComponent(location.origin);
  makingOfFrame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${makingOfVideoId}?rel=0&modestbranding=1&playsinline=1&origin=${origin}" title="Nexus-Verse vs Colours making-of video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  if(videoStatus) videoStatus.textContent='EMBED READY';
}
renderMakingOfPlayer();

// tiny stability Easter egg
const stability=$('#stability');
let stabilityTimer=null;
function rotateStability(){
  if(document.hidden){ stabilityTimer=null; return; }
  const states=['QUESTIONABLE','STABLE-ISH','PROBABLY FINE','UNKNOWN','QUESTIONABLE'];
  if(stability) stability.textContent=states[Math.floor(Math.random()*states.length)];
  stabilityTimer=window.setTimeout(rotateStability,3200);
}
rotateStability();
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){ clearTimeout(stabilityTimer); stabilityTimer=null; }
  else if(!stabilityTimer) rotateStability();
});

// secret spoiler mode — type PLEUH anywhere on the page
const spoilerZone = $('#spoilerZone');
const spoilerUnlock = $('#spoilerUnlock');
const lockSpoilers = $('#lockSpoilers');
const spoilerChip = $('.nav-pill');
let pleuhBuffer = '';
let spoilerTimer = null;

function setSpoilerMode(open, showFlash=true){
  document.body.classList.toggle('spoilers-unlocked', open);
  spoilerZone?.setAttribute('aria-hidden', String(!open));
  if(spoilerChip) spoilerChip.textContent = open ? 'SPOILERS UNLOCKED' : 'SPOILER-FREE';
  if(open){
    spoilerZone?.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'center'});
  }
  if(showFlash && open){
    spoilerUnlock?.classList.add('show');
    spoilerUnlock?.setAttribute('aria-hidden','false');
    clearTimeout(spoilerTimer);
    spoilerTimer=setTimeout(()=>{spoilerUnlock?.classList.remove('show');spoilerUnlock?.setAttribute('aria-hidden','true')},1900);
  }
}

window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const tag=document.activeElement?.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable) return;
  if(e.key.length!==1) return;
  pleuhBuffer=(pleuhBuffer+e.key.toLowerCase()).slice(-5);
  if(pleuhBuffer==='pleuh'){
    pleuhBuffer='';
    setSpoilerMode(!document.body.classList.contains('spoilers-unlocked'));
  }
});

lockSpoilers?.addEventListener('click',()=>setSpoilerMode(false,false));

/* =========================================================
   V3 INTERACTIONS
   ========================================================= */

// Chromeus navigator: click the actual supplied Transdimensionalizer image.
const transDevice = $('#transDimensionalizer');
const chromeusBg = $('#chromeusBg');
const chromeusViewport = $('#chromeusViewport');
const deviceStatus = $('#deviceStatus');
const deviceShots = $('#deviceShots');
const dimensionLabel = $('#dimensionLabel');
const viewportCorner = $('#viewportCorner');
const viewportMessage = $('#viewportMessage');
const viewportSub = $('#viewportSub');
const viewportReadout = $('#viewportReadout');
const viewportCoords = $('#viewportCoords');

const chromeusScenes = [
  {src:'assets/interactive/chromeus-01.png', label:'RED DESERT', message:'CHROMEUS // RED-SANDED DESERT', sub:'the red-sanded corner. dimensional signal detected.', signal:'86%', coords:'14 / 07 / 22'},
  {src:'assets/interactive/chromeus-02.png', label:'THE CITY', message:'CHROMEUS // CITY', sub:'the city corner. the route continues toward the centre.', signal:'71%', coords:'31 / 18 / 05'},
  {src:'assets/interactive/chromeus-03.png', label:'THE JUNGLE', message:'CHROMEUS // JUNGLE', sub:'the jungle corner. visibility: pleasantly terrible.', signal:'93%', coords:'04 / 42 / 19'},
  {src:'assets/interactive/chromeus-04.png', label:'THE PLAINS', message:'CHROMEUS // PLAINS', sub:'the plains corner. strangely calm.', signal:'99%', coords:'27 / 03 / 61'}
];
let chromeusCurrent=-1;
let shots=10;
let lastScene=-1;

function randomScene(){
  let i=Math.floor(Math.random()*chromeusScenes.length);
  if(chromeusScenes.length>1) while(i===lastScene) i=Math.floor(Math.random()*chromeusScenes.length);
  lastScene=i;
  return chromeusScenes[i];
}
function activateTransdimensionalizer(){
  const scene=randomScene();
  chromeusViewport?.classList.add('active','device-loading');
  deviceStatus.textContent='ACTIVE';
  deviceShots.textContent=`SHOTS: ${shots}`;
  dimensionLabel.textContent='TRANSITIONING...';
  viewportMessage.textContent='OPENING PORTAL...';
  viewportSub.textContent='please remain calm. probably.';
  viewportReadout.textContent='SIGNAL: ACQUIRING';
  viewportCoords.textContent='COORDS: CALCULATING';
  transDevice?.classList.add('firing');

  window.setTimeout(()=>{
    chromeusBg.style.backgroundImage=`url("${scene.src}")`;
    viewportCorner.textContent=scene.label;
    viewportMessage.textContent=scene.message;
    viewportSub.textContent=scene.sub;
    viewportReadout.textContent=`SIGNAL: ${scene.signal}`;
    viewportCoords.textContent=`COORDS: ${scene.coords}`;
    dimensionLabel.textContent='FEED LOCKED';
    deviceStatus.textContent='STABLE-ISH';
    shots = Math.max(0, shots - 1);
    deviceShots.textContent=`SHOTS: ${shots}`;
    chromeusViewport.classList.remove('device-loading');
    transDevice?.classList.remove('firing');
  }, 620);
}
transDevice?.addEventListener('click',activateTransdimensionalizer);

// Initial device hint
if(chromeusBg)chromeusBg.style.backgroundImage='url("assets/interactive/chromeus-04.png")';

// Universe terminal
const universeData = {
  colours: {
    label:'COLOURS',
    lines:[
      'loading source universe...',
      'visual signature: HIGHLY COLOURFUL',
      'status: <b>CONNECTED</b>'
    ]
  },
  algo: {
    label:'ALGOTRIACONTATHLON',
    lines:[
      'loading competition universe...',
      'host signature: EXQ GENIUS',
      'status: <b>CONNECTED</b>'
    ]
  },
  bots: {
    label:'THE BOT GAMES',
    lines:[
      'loading bot universe...',
      'participants: 235',
      'status: <b>CONNECTED</b>'
    ]
  },
  unknown: {
    label:'UNKNOWN DIMENSION',
    lines:[
      'loading...',
      'loading...',
      'WHY IS IT LOUD',
      'status: <b>NOPE</b>'
    ]
  }
};
const terminalLines = $('#terminalLines');
$$('.terminal-choice').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.terminal-choice').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const key=btn.dataset.universe;
  const data=universeData[key];
  terminalLines.classList.remove('universe-glitch');
  void terminalLines.offsetWidth;
  terminalLines.classList.add('universe-glitch');
  terminalLines.innerHTML=data.lines.map((line,i)=>`<p><span>${String(i+1).padStart(2,'0')}</span>&gt; ${line}</p>`).join('');
  if(key==='unknown'){
    const chrome=$('#chromeus');
    chrome?.classList.add('universe-glitch');
    setTimeout(()=>chrome?.classList.remove('universe-glitch'),600);
  }
}));

// Fake archive viewer
const archiveInfo = {
  final:['PROJECT_NEXUS_FINAL.pptx','1,446 slides detected. finality level: suspicious.','/nexus/archive/project/final/final.pptx'],
  real:['PROJECT_NEXUS_FINAL_REAL.pptx','This file contains absolutely no evidence that the first file was final.','/nexus/archive/project/final/final_REAL.pptx'],
  '67':['SLIDE_67_DO_NOT_OPEN','You were specifically warned. The archive has nothing useful to say about slide 67.','/nexus/archive/67/uh-oh'],
  pleuh:['PLEUH.txt','Contents: pleuh\\n\\nEnd of file.','/nexus/archive/misc/pleuh.txt']
};
const archiveTitle=$('#archiveTitle'), archiveText=$('#archiveText'), archiveCode=$('#archiveCode'), archiveState=$('#archiveState');
$$('.archive-file').forEach(btn=>btn.addEventListener('click',()=>{
  const data=archiveInfo[btn.dataset.archive];
  $$('.archive-file').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  archiveState.textContent='FILE OPEN';
  archiveTitle.textContent=data[0];
  archiveText.textContent=data[1];
  archiveCode.textContent=data[2];
}));

// "DO NOT PRESS"
const dontClick=$('#dontClick'), dontClickStatus=$('#dontClickStatus');
let dontCount=0;
const dontMessages=[
  'i literally told you.',
  'why.',
  'okay you clicked it again.',
  'the machine is judging you.',
  'please stop assisting the machine.',
  'this is now officially a bit.',
  'you have pressed it 7 times. impressive.',
  'NO.',
  'fine. one last warning.',
  '...pleuh.'
];
dontClick?.addEventListener('click',()=>{
  dontCount++;
  dontClick.classList.remove('pressed'); void dontClick.offsetWidth; dontClick.classList.add('pressed');
  dontClickStatus.textContent = dontMessages[Math.min(dontCount-1,dontMessages.length-1)];
  if(dontCount===5){
    dontClick.textContent='I SAID NO';
  }
  if(dontCount>=10){
    dontClick.textContent='BUTTON DEFEATED';
    dontClickStatus.textContent='you won. the button has retired.';
    dontClick.disabled=true;
  }
});

// Production timeline
const timelineMessages={
  idea:'01 // IDEA — start with the extremely normal thought: “what if these universes met?”',
  script:'02 // SCRIPT — stitch the crossover together without losing everybody’s personalities.',
  assets:'03 // ASSETS — characters, environments, props, logos and enough tiny pieces to build scenes.',
  slides:'04 // SLIDES — the number starts climbing. 1,446 eventually becomes a real problem.',
  animites:'05 // ANIMITES — turn the static slide language into movement, one frame at a time.',
  release:'06 // RELEASE — publish the thing and let other humans experience the consequences.'
};
const timelineReadout=$('#timelineReadout');
$$('.timeline-track button').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.timeline-track button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  timelineReadout.textContent=timelineMessages[btn.dataset.time];
}));


// Slide 67 secret
function showSlide67(){
  if($('.slide67-overlay')) return;
  const overlay=document.createElement('div');
  overlay.className='slide67-overlay';
  overlay.innerHTML=`<div class="slide67-inner"><div class="slide67-chaos"></div><p>YOU FOUND IT.</p><h2>THE 67TH<br>SLIDE!!</h2><p>it does nothing.</p><button type="button">RETURN TO REALITY</button></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('button').addEventListener('click',()=>{
    overlay.remove();
    document.body.classList.remove('slide67-mode');
  });
}
let secret67='';
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(document.querySelector('.slide67-overlay')) return;
  if(e.key.length!==1) return;
  secret67=(secret67+e.key).slice(-2);
  if(secret67==='67'){
    secret67='';
    showSlide67();
  }
});

// Character signal: a tiny click glitch before opening the card.
$$('.cast-card').forEach(card=>card.addEventListener('dblclick',()=>{
  card.classList.add('universe-glitch');
  setTimeout(()=>card.classList.remove('universe-glitch'),550);
}));

// End-of-site delayed reveal
const endExtra=$('#endExtra');
const endSection=$('#end');
if('IntersectionObserver' in window && endExtra && endSection){
  let endRevealed=false;
  const eo=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting && !endRevealed){
      endRevealed=true;
      setTimeout(()=>endExtra.classList.add('show'),1450);
      eo.disconnect();
    }
  },{threshold:.35});
  eo.observe(endSection);
}
$('#backToTopWeird')?.addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
});


// Tiny hidden typing easter eggs. They intentionally avoid input fields.
const secretToast=$('#secretToast');
const secretToastLabel=$('#secretToastLabel');
const secretToastText=$('#secretToastText');
let toastTimer=null;
function showSecretToast(label,text,glitch=true){
  if(!secretToast) return;
  if(secretToastLabel) secretToastLabel.textContent=label;
  if(secretToastText) secretToastText.textContent=text;
  secretToast.classList.toggle('glitch',glitch);
  void secretToast.offsetWidth;
  secretToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=window.setTimeout(()=>{secretToast.classList.remove('show');secretToast.classList.remove('glitch')},2300);
}
let secretWord='';
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const tag=document.activeElement?.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable) return;
  if(e.key.length!==1) return;
  secretWord=(secretWord+e.key.toLowerCase()).slice(-8);
  if(secretWord.endsWith('eatery')){
    secretWord='';
    showSecretToast('DIMENSIONAL TRANSLATION','WHAT ON EATERY..?',true);
  } else if(secretWord.endsWith('2000')){
    secretWord='';
    showSecretToast('DEVICE CODE','TRANSDIMENSIONALIZER 2000: STANDING BY.',false);
    $('#chromeus')?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    transDevice?.classList.add('firing');
    setTimeout(()=>transDevice?.classList.remove('firing'),700);
  } else if(secretWord.endsWith('3000')){
    secretWord='';
    showSecretToast('UNEXPECTED DEVICE','TRANSDIMENSIONALIZER 3000 DETECTED.',true);
  } else if(secretWord.endsWith('404')){
    secretWord='';
    showSecretToast('DIMENSION ERROR','404: DIMENSION NOT FOUND. obviously.',true);
    document.body.classList.add('universe-glitch');
    setTimeout(()=>document.body.classList.remove('universe-glitch'),500);
  } else if(secretWord.endsWith('nexus')){
    secretWord='';
    showSecretToast('NEXUS ACCESS','TERMINAL LINK ESTABLISHED.',false);
    $('#terminalInput')?.focus();
    $('#terminalInput')?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
  }
});

/* =========================================================
   V4: TERMINAL COMMANDS + SMALL SYSTEM POLISH
   ========================================================= */
const terminalForm = $('#terminalForm');
const terminalInput = $('#terminalInput');
const terminalShell = $('.terminal-shell');
const deviceHeatBar = $('#deviceHeatBar');
const deviceHeatText = $('#deviceHeatText');
let deviceHeat = 8;
let heatTimer = null;

function setDeviceHeat(value){
  deviceHeat = Math.max(0, Math.min(100, value));
  if(deviceHeatBar) deviceHeatBar.style.width = `${Math.max(4, deviceHeat)}%`;
  const label = deviceHeat >= 80 ? 'CRITICAL' : deviceHeat >= 55 ? 'WARM' : deviceHeat >= 25 ? 'WARM-ISH' : 'COOL';
  if(deviceHeatText) deviceHeatText.textContent = label;
  deviceStatus?.classList.remove('cool','warm','hot');
  deviceStatus?.classList.add(deviceHeat >= 80 ? 'hot' : deviceHeat >= 25 ? 'warm' : 'cool');
}
setDeviceHeat(8);
function coolDevice(){
  clearInterval(heatTimer);
  const tick=()=>{
    if(deviceHeat<=8){ heatTimer=null; return; }
    setDeviceHeat(deviceHeat-2);
    heatTimer=window.setTimeout(tick,1800);
  };
  heatTimer=window.setTimeout(tick,1800);
}
coolDevice();

// Wrap the existing activation with a little heat buildup, without changing its visual result.
const oldActivateTransdimensionalizer = activateTransdimensionalizer;
activateTransdimensionalizer = function(){
  setDeviceHeat(deviceHeat + 24);
  oldActivateTransdimensionalizer();
  if(deviceHeat >= 85 && deviceHeatText) deviceHeatText.textContent = 'CRITICAL';
};

function terminalWrite(lines){
  if(!terminalLines) return;
  const current = terminalLines.querySelectorAll('p').length;
  terminalLines.innerHTML = lines.map((line,i)=>`<p><span>${String(current+i+1).padStart(2,'0')}</span>&gt; ${line}</p>`).join('');
}
function terminalCommand(raw){
  const cmd = raw.trim().toLowerCase();
  if(!cmd) return;
  const responses = {
    help:[
      'AVAILABLE COMMANDS:',
      'scan · scan the dimensional environment',
      'chromeus · jump to the Chromeus navigator',
      'movie · open the movie hub',
      'posters · open the poster vault',
      'archive · open the Nexus archives',
      'crew · open Meet the Crew',
      'pleuh · toggle spoiler mode',
      '67 · open the 67th slide',
      'banana · absolutely useless',
      'top · return to the beginning',
      'type eatery / 2000 / 3000 / 404 / nexus for hidden responses'
    ],
    banana:['BANANA PROTOCOL ENABLED.','...nothing happened.','BANANA PROTOCOL DISABLED.'],
    scan:[scanLines[Math.floor(Math.random()*scanLines.length)]],
    status:['SYSTEM STATUS: <b>PROBABLY FINE</b>','DIMENSIONAL STABILITY: <b>'+stability.textContent+'</b>','DEVICE HEAT: <b>'+Math.round(deviceHeat)+'%</b>']
  };
  terminalShell?.classList.remove('command-flash');
  void terminalShell?.offsetWidth;
  terminalShell?.classList.add('command-flash');
  if(responses[cmd]){terminalWrite([`> ${cmd}`,...responses[cmd]]);return;}
  const jumps = {
    chromeus:'#chromeus', movie:'#hub', home:'#top', top:'#top', posters:'#posters', archive:'#archives', archives:'#archives', crew:'#crew'
  };
  if(jumps[cmd]){
    terminalWrite([`> ${cmd}`,'NAVIGATING...']);
    setTimeout(()=>$(jumps[cmd])?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'}),180);
    return;
  }
  if(cmd==='pleuh'){
    terminalWrite(['> pleuh','SEQUENCE RECOGNISED.']);
    setTimeout(()=>setSpoilerMode(!document.body.classList.contains('spoilers-unlocked')),160);
    return;
  }
  if(cmd==='67'){
    terminalWrite(['> 67','ARCHIVE FRAGMENT FOUND.']);
    setTimeout(showSlide67,160);
    return;
  }
  terminalWrite([`> ${cmd}`,'command not recognised.','try `help`.']);
}
terminalForm?.addEventListener('submit',e=>{
  e.preventDefault();
  terminalCommand(terminalInput.value);
  terminalInput.value='';
  terminalInput.focus();
});

// Let the little end joke reflect that the viewer has actually been poking around.
let systemTouches = 0;
function noteSystemTouch(){
  systemTouches++;
  if(systemTouches===5 && stability) stability.textContent='WATCHED';
  if(systemTouches===10 && stability) stability.textContent='WHY';
}
transDevice?.addEventListener('click',noteSystemTouch);
$('#scanButton')?.addEventListener('click',noteSystemTouch);
$$('.archive-file').forEach(btn=>btn.addEventListener('click',noteSystemTouch));
$$('.terminal-choice').forEach(btn=>btn.addEventListener('click',noteSystemTouch));

/* =========================================================
   V10 PERFORMANCE PASS
   Keep the playful visuals, but stop painting/animating work the
   viewer cannot currently see.
   ========================================================= */
const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
if(lowPowerDevice) document.body.classList.add('lite-mode');

if('IntersectionObserver' in window){
  const animatedSections = $$('.section, .site-footer').filter(el=>el.id!=='posters');
  const animationObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  }, {rootMargin:'180px 0px'});
  animatedSections.forEach(el=>animationObserver.observe(el));
}


/* Final navigation polish: floating back-to-top control. */
const quickTop = $('#quickTop');
let quickTopRaf=0;
function updateQuickTop(){
  quickTopRaf=0;
  quickTop?.classList.toggle('show', window.scrollY > Math.max(520, window.innerHeight * .7));
}
window.addEventListener('scroll',()=>{if(!quickTopRaf) quickTopRaf=requestAnimationFrame(updateQuickTop)},{passive:true});
quickTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));
updateQuickTop();


/* =========================================================
   V17: FINAL FINISH — LOADER + MICRO SFX
   ========================================================= */
const siteLoader = $('#siteLoader');
const loaderStatus = $('#loaderStatus');
const loaderStates = [
  'ESTABLISHING DIMENSIONAL LINK...',
  'CHECKING 1,446 SLIDES...',
  'CALIBRATING COLOURS...',
  'DIMENSIONAL STABILITY: PROBABLY FINE.'
];
let loaderStateIndex = 0;
let loaderStateTimer = null;
function finishSiteLoader(){
  if(!siteLoader) return;
  siteLoader.classList.add('loaded');
  clearTimeout(loaderStateTimer);
  window.setTimeout(()=>siteLoader.remove(),650);
}
function runLoader(){
  if(!siteLoader) return;
  const started=performance.now();
  const tick=()=>{
    if(!loaderStatus) return;
    loaderStateIndex=(loaderStateIndex+1)%loaderStates.length;
    loaderStatus.textContent=loaderStates[loaderStateIndex];
    if(performance.now()-started<950){ loaderStateTimer=window.setTimeout(tick,230); }
  };
  loaderStateTimer=window.setTimeout(tick,230);
  window.setTimeout(finishSiteLoader,700);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',runLoader,{once:true});
else runLoader();

// Tiny UI sound design. Audio is created only after a real user gesture, so
// browsers' autoplay policies are respected and there are no extra audio files.
let audioCtx=null;
function getAudioContext(){
  if(audioCtx) return audioCtx;
  try{ audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }catch{return null}
}
function blip({freq=520,duration=.045,volume=.035,type='sine',slide=0}={}){
  const ctx=getAudioContext();
  if(!ctx) return;
  if(ctx.state==='suspended') ctx.resume().catch(()=>{});
  const osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type; osc.frequency.setValueAtTime(freq,ctx.currentTime);
  if(slide) osc.frequency.exponentialRampToValueAtTime(Math.max(60,freq+slide),ctx.currentTime+duration);
  gain.gain.setValueAtTime(0.0001,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.006);
  gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+duration);
  osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration+.01);
}
function portalSfx(){
  const ctx=getAudioContext();
  if(!ctx) return;
  if(ctx.state==='suspended') ctx.resume().catch(()=>{});
  const now=ctx.currentTime;
  const osc=ctx.createOscillator(), gain=ctx.createGain(), filter=ctx.createBiquadFilter();
  osc.type='sine'; osc.frequency.setValueAtTime(160,now); osc.frequency.exponentialRampToValueAtTime(880,now+.42);
  gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(.07,now+.08); gain.gain.exponentialRampToValueAtTime(.0001,now+.5);
  filter.type='lowpass'; filter.frequency.setValueAtTime(650,now); filter.frequency.exponentialRampToValueAtTime(1800,now+.42);
  osc.connect(filter).connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now+.52);
  blip({freq:1040,duration:.09,volume:.02,type:'triangle',slide:-300});
}
function sfxClick(){ blip({freq:520,duration:.045,volume:.024,type:'triangle',slide:-120}); }
function sfxScan(){ blip({freq:720,duration:.07,volume:.03,type:'sine',slide:260}); }

document.addEventListener('click',e=>{
  const target=e.target?.closest?.('.btn,.terminal-choice,.archive-file,.room-filter,#scanButton,#dontClick,#quickTop');
  if(target && target.id!=='openPosterRoom') sfxClick();
},{passive:true});
portalOpenButton?.addEventListener('click',portalSfx,{passive:true});
transDevice?.addEventListener('click',()=>{portalSfx();}, {passive:true});
scanButton?.addEventListener('click',sfxScan,{passive:true});

// Make the making-of player feel intentional while it initializes, and provide
// a direct-watch route if an embed doesn't finish loading in a reasonable time.
(function improveMakingOfLoading(){
  if(!makingOfFrame) return;
  const revealFallback=()=>{
    if(makingOfFrame.querySelector('.video-timeout')) return;
    const a=document.createElement('a');
    a.className='video-timeout';
    a.href=makingOfUrl; a.target='_blank'; a.rel='noopener noreferrer';
    a.textContent='EMBED TAKING TOO LONG? OPEN THE VIDEO DIRECTLY ↗';
    makingOfFrame.appendChild(a);
  };
  const observer=new MutationObserver(()=>{
    const iframe=makingOfFrame.querySelector('iframe');
    if(!iframe || iframe.dataset.v17Bound) return;
    iframe.dataset.v17Bound='1';
    iframe.addEventListener('load',()=>{ if(videoStatus) videoStatus.textContent='EMBED LOADED'; },{once:true});
    window.setTimeout(revealFallback,8000);
  });
  observer.observe(makingOfFrame,{childList:true});
  window.setTimeout(revealFallback,8500);
})();

window.addEventListener('pagehide',()=>{
  clearTimeout(stabilityTimer);
  clearTimeout(heatTimer);
  clearTimeout(signalTimer);
  clearTimeout(toastTimer);
});



/* =========================================================
   V18: NEXUS OS / EXPLORATION SYSTEM
   Everything below is self-contained so the existing V17 machinery stays intact.
   ========================================================= */
(function nexusOSV18(){
  const storage={
    get(key,fallback=null){try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch{return fallback}},
    set(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}},
  };
  const sessionKey='nvvcV18SessionId';
  const visitKey='nvvcV18Visits';
  const achKey='nvvcV18Achievements';
  let sessionId=`NV-${String(Math.floor(Math.random()*10000)).padStart(4,'0')}`;
  try{sessionId=sessionStorage.getItem(sessionKey)||sessionId;sessionStorage.setItem(sessionKey,sessionId)}catch{}
  const oldVisits=Number(storage.get(visitKey,0)||0);
  const visits=oldVisits+1;
  storage.set(visitKey,visits);

  const osSessionId=$('#osSessionId'), osVisitCount=$('#osVisitCount'), osReturnLabel=$('#osReturnLabel'), osReturnHeadline=$('#osReturnHeadline'), osReturnText=$('#osReturnText');
  if(osSessionId) osSessionId.textContent=sessionId;
  if(osVisitCount) osVisitCount.textContent=String(visits).padStart(2,'0');
  if(osReturnLabel) osReturnLabel.textContent=visits===1?'FIRST VISIT':'RETURNING VISITOR';
  if(osReturnHeadline) osReturnHeadline.textContent=visits===1?'you have entered the Nexus.':'you came back. the Nexus remembers.';
  if(osReturnText) osReturnText.textContent=visits===1?'explore the system and your browser will quietly remember your discoveries.':`session ${sessionId} restored. previous discoveries remain in local memory.`;
  const achievements=[
    {id:'boot',name:'BOOTED THE NEXUS',desc:'Opened the exploration system.',check:()=>true},
    {id:'map',name:'READ THE MAP',desc:'Interacted with a universe node.'},
    {id:'posters',name:'ENTERED THE VAULT',desc:'Entered the Poster Room.'},
    {id:'archive',name:'ARCHIVE DIVER',desc:'Opened a project archive file.'},
    {id:'desk',name:'AT THE DESK',desc:'Inspected a production artifact.'},
    {id:'broadcast',name:'BREAKING NEWS',desc:'Rotated the Nexus broadcast feed.'},
    {id:'slide',name:'NUMBER GOES BRRR',desc:'Opened the Slide Index.'},
    {id:'random',name:"I'M BORED",desc:'Used the random destination system.'},
    {id:'terminal',name:'COMMAND LINE',desc:'Ran an extra Nexus terminal command.'},
    {id:'classified',name:'CLEARANCE GRANTED',desc:'Unlocked a classified file.'},
    {id:'arcade',name:'ARCADE RAT',desc:'Played one of the Nexus mini-games.'},
    {id:'forge',name:'DIMENSION BUILDER',desc:'Generated a fake dimension.'},
    {id:'roulette',name:'SPUN THE VAULT',desc:'Used Poster Roulette.'},
    {id:'poster_master',name:'POSTER COMPLETIONIST',desc:'Opened three different posters in the vault.'},
    {id:'return',name:'WELCOME BACK',desc:'Returned for another visit.'}
  ];
  const ach=storage.get(achKey,[])||[];
  function has(id){return ach.includes(id)}
  function unlock(id,render=true){
    if(!achievements.some(a=>a.id===id)||has(id)) return;
    ach.push(id); storage.set(achKey,ach);
    if(render) renderAchievements();
    showSecretToast?.('NEXUS ACHIEVEMENT',achievements.find(a=>a.id===id)?.name||'DISCOVERY UNLOCKED',false);
  }
  window.nvvcUnlockAchievement=unlock;
  if(visits>1) unlock('return',false);

  const achievementTotal=achievements.filter(a=>a.id!=='return').length;
  const achievementGrid=$('#achievementGrid'), achievementCount=$('#achievementCount'), achievementBar=$('#achievementProgressBar'), achievementHint=$('#achievementHint'), osAnomalyCount=$('#osAnomalyCount'), osAchievementLabel=$('#osAchievementLabel'), osMemoryBar=$('#osMemoryBar'), osMemoryPct=$('#osMemoryPct');
  function renderAchievements(){
    const unlockedCount=achievements.filter(a=>has(a.id)).length;
    if(achievementGrid) achievementGrid.innerHTML=achievements.filter(a=>a.id!=='return').map(a=>`<article class="achievement-card ${has(a.id)?'unlocked':'locked'}"><span>${has(a.id)?'DISCOVERY':'LOCKED'}</span><b>${has(a.id)?a.name:'???'}</b><small>${a.desc}</small></article>`).join('');
    if(achievementCount) achievementCount.textContent=`${Math.min(unlockedCount,achievementTotal)} / ${achievementTotal}`;
    if(achievementBar) achievementBar.style.width=`${Math.min(100,(unlockedCount/achievementTotal)*100)}%`;
    if(achievementHint) achievementHint.textContent=unlockedCount>=achievementTotal?'all systems investigated. somehow.':'there are no prizes. obviously.';
    if(osAnomalyCount) osAnomalyCount.textContent=`${Math.min(unlockedCount,achievementTotal)}/${achievementTotal}`;
    if(osAchievementLabel) osAchievementLabel.textContent=`${unlockedCount} unlocked`;
    const mem=Math.min(100,Math.round((unlockedCount/achievementTotal)*100));
    if(osMemoryBar) osMemoryBar.style.setProperty('--memory',`${mem}%`);
    if(osMemoryPct) osMemoryPct.textContent=`${mem}%`;
  }
  unlock('boot',false);
  renderAchievements();

  // harmless local-memory indicator
  const memoryMessage=$('#osTaskMessage');
  if(memoryMessage) memoryMessage.textContent=visits===1?'all systems nominal-ish.':'local memory restored. proceed at your own risk.';

  const osShell=$('#nexusOS');
  $('#openNexusOS')?.addEventListener('click',()=>{
    document.documentElement.style.scrollBehavior='smooth';
    osShell?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    setTimeout(()=>osShell?.classList.add('booting'),350);
    setTimeout(()=>osShell?.classList.remove('booting'),1150);
  });
  $('#osBootAgain')?.addEventListener('click',()=>{
    osShell?.classList.remove('booting'); void osShell?.offsetWidth; osShell?.classList.add('booting');
    const status=$('#osLiveState'); if(status){status.textContent='BOOTING';setTimeout(()=>status.textContent='ONLINE',680)}
  });

  // system telemetry — intentionally cosmetic, but consistent with the existing device state.
  const osStabilityValue=$('#osStabilityValue'), osStabilityBar=$('#osStabilityBar'), osPortalLoad=$('#osPortalLoad'), osChromeusState=$('#osChromeusState'), osMachineHeat=$('#osMachineHeat'), osMood=$('#osMood');
  function refreshTelemetry(){
    const stabilityValue=72+Math.floor(Math.random()*28);
    const portalLoad=24+Math.floor(Math.random()*57);
    if(osStabilityValue) osStabilityValue.textContent=stabilityValue;
    if(osStabilityBar) osStabilityBar.style.width=`${stabilityValue}%`;
    if(osPortalLoad) osPortalLoad.textContent=`${portalLoad}%`;
    if(osChromeusState) osChromeusState.textContent=portalLoad>70?'WATCHING':'LINKED';
    if(osMachineHeat) osMachineHeat.textContent=`${String(Math.round(deviceHeat)).padStart(2,'0')}%`;
    const moods=['QUESTIONABLE','PROBABLY FINE','LOUD','STABLE-ISH','MYSTERIOUS'];
    if(osMood) osMood.textContent=moods[Math.floor(Math.random()*moods.length)];
  }
  refreshTelemetry();
  $('#refreshSystem')?.addEventListener('click',()=>{refreshTelemetry();noteSystemTouch?.();unlock('terminal');});
  setInterval(()=>{if(!document.hidden) refreshTelemetry()},4200);

  // Universe map
  const mapDetails={
    nexus:{kicker:'NODE 00',title:'THE NEXUS',text:'Everything on this site keeps pointing back here. The map is decorative, but the routes actually work.',role:'COLLISION POINT',signal:'UNKNOWN',action:'ENTER THE HUB',target:'#hub'},
    colours:{kicker:'NODE 01',title:'COLOURS',text:'A colourful source world represented throughout the crossover. The site routes this node into the movie archive and poster collection.',role:'SOURCE WORLD',signal:'COLOURFUL',action:'OPEN COLOURS POSTERS',universe:'colours'},
    algo:{kicker:'NODE 02',title:'ALGOTRIACONTATHLON',text:'EXQ Genius’s competition universe, connected here as one of the crossover’s source worlds.',role:'SOURCE WORLD',signal:'COMPETITION',action:'OPEN ALGO POSTERS',universe:'algo'},
    bots:{kicker:'NODE 03',title:'THE BOT GAMES',text:'The mechanical competition world. Its signal remains surprisingly loud even when the site is quiet.',role:'SOURCE WORLD',signal:'MECHANICAL',action:'OPEN BOT POSTERS',universe:'bots'}
  };
  const mapDetail=$('#mapDetail');
  function showMapNode(key){
    const d=mapDetails[key]||mapDetails.nexus;
    $$('.map-node').forEach(n=>n.classList.toggle('active',n.dataset.mapNode===key));
    if(mapDetail){mapDetail.innerHTML=`<span class="map-detail-kicker">${d.kicker}</span><h4>${d.title}</h4><p>${d.text}</p><div class="map-detail-meta"><span>ROLE <b>${d.role}</b></span><span>SIGNAL <b>${d.signal}</b></span></div><button class="btn btn-ghost" type="button" id="mapDetailAction">${d.action} ↗</button>`}
    const action=$('#mapDetailAction');
    action?.addEventListener('click',()=>{
      if(d.universe){unlock('map');openPosterPortal(d.universe);return}
      scrollToSection('#hub');
    });
    $('#universeMap')?.classList.add('map-pulse'); setTimeout(()=>$('#universeMap')?.classList.remove('map-pulse'),650);
    unlock('map');
  }
  $$('.map-node').forEach(n=>n.addEventListener('click',()=>showMapNode(n.dataset.mapNode)));
  $('#mapDetailAction')?.addEventListener('click',()=>$('#hub')?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'}));

  // Character index, backed entirely by the poster dataset already present in this build.
  const characterResults=$('#characterResults'), characterSearch=$('#characterSearch');
  let activeCharFilter='all';
  const characters=Object.entries(universePosterData).flatMap(([universe,data])=>data.posters.filter(([id,title,type='portrait'])=>type==='portrait'&&!/feature/i.test(title)).map(([id,title])=>({id,title,universe,name:data.name,className:data.className}))).filter((v,i,a)=>a.findIndex(x=>x.title===v.title&&x.universe===v.universe)===i);
  function renderCharacters(){
    const q=(characterSearch?.value||'').trim().toLowerCase();
    const list=characters.filter(c=>activeCharFilter==='all'||c.universe===activeCharFilter).filter(c=>!q||c.title.toLowerCase().includes(q)||c.name.toLowerCase().includes(q));
    if(!characterResults) return;
    characterResults.innerHTML=list.length?list.map(c=>`<button type="button" class="character-card" data-char-universe="${c.universe}" data-char-id="${c.id}"><img src="${posterThumbPath(c.id,'portrait')}" alt="${c.title} poster" loading="lazy" decoding="async" width="450" height="636"><span><b>${c.title}</b><small>${c.name}</small><span class="char-chip">OPEN IN POSTER ROOM ↗</span></span></button>`).join(''):`<div class="character-empty">NO SIGNAL. TRY A DIFFERENT QUERY.</div>`;
    $$('.character-card',characterResults).forEach(card=>card.addEventListener('click',()=>{unlock('posters');openPosterPortal(card.dataset.charUniverse)}));
  }
  $$('.char-filter').forEach(b=>b.addEventListener('click',()=>{$$('.char-filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeCharFilter=b.dataset.charFilter;renderCharacters()}));
  characterSearch?.addEventListener('input',renderCharacters);
  renderCharacters();

  // Director's desk artifacts
  const deskData={
    slides:{title:'PROJECT_NEXUS_FINAL.pptx',text:'1,446 slides. finality level: suspicious. The number is the point: this project got very, very large.',type:'SLIDES',status:'OVERDUE'},
    animites:{title:'ANIMITE_FRAME_NOTES.txt',text:'Frame-by-frame animation notes. Small timing decisions turning a giant deck into something that actually moves.',type:'PRODUCTION',status:'IN PROGRESS'},
    movie:{title:'NEXUS_VERSE_VS_COLOURS',text:'Feature-length crossover project. One movie, multiple source worlds, and an unreasonable amount of Google Slides.',type:'MOVIE',status:'COMPLETE'}
  };
  const deskState=$('#deskState'), deskFileKicker=$('#deskFileKicker'), deskFileTitle=$('#deskFileTitle'), deskFileText=$('#deskFileText'), deskFileType=$('#deskFileType'), deskFileStatus=$('#deskFileStatus');
  $$('.desk-folder').forEach(btn=>btn.addEventListener('click',()=>{
    const key=btn.dataset.deskFile; const d=deskData[key]; if(!d) return;
    $$('.desk-folder').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');
    if(deskState) deskState.textContent='FILE OPEN';
    if(deskFileKicker) deskFileKicker.textContent=`/nexus/desk/${key}/`;
    if(deskFileTitle) deskFileTitle.textContent=d.title;
    if(deskFileText) deskFileText.textContent=d.text;
    if(deskFileType) deskFileType.textContent=d.type;
    if(deskFileStatus) deskFileStatus.textContent=d.status;
    $('.desk-viewer')?.classList.remove('desk-file-open'); void $('.desk-viewer')?.offsetWidth; $('.desk-viewer')?.classList.add('desk-file-open');
    unlock('desk');
  }));

  // Broadcast
  const broadcastData=[
    ['DIMENSIONAL ACTIVITY DETECTED','source: nexus telemetry / confidence: questionable','BREAKING // 1,446 SLIDES REMAIN DETECTED // MORE AFTER THIS NON-EXISTENT COMMERCIAL'],
    ['CHROMEUS REPORTS CALM-ISH CONDITIONS','source: chromeus feed / confidence: surprisingly high','UPDATE // REGION 04 APPEARS PEACEFUL // THIS MAY BE A TRAP OR JUST A FLOWER FIELD'],
    ['POSTER ARCHIVE NOW FULLY INDEXED','source: marketing archive / confidence: 100%','ARCHIVE // 27 PIECES CATALOGUED // PLEASE STOP TRYING TO STEAL THE POSTERS'],
    ['NEXUS OS HAS NOT CRASHED','source: local session / confidence: 63%','TECH // SYSTEM STABILITY REMAINS QUESTIONABLE // ENGINEERS DECLINE TO COMMENT'],
    ['MOVIE DETECTED','source: Google Slides / confidence: extremely obvious','CULTURE // THE MOVIE IS 1,446 SLIDES LONG // THIS IS STILL TRUE']
  ];
  const broadcastHeadline=$('#broadcastHeadline'), broadcastSubline=$('#broadcastSubline'), broadcastTicker=$('#broadcastTicker'), broadcastTimestamp=$('#broadcastTimestamp'), tvSet=$('.tv-set');
  let broadcastIndex=1;
  function rotateBroadcast(){
    const d=broadcastData[broadcastIndex%broadcastData.length]; broadcastIndex++;
    if(broadcastHeadline) broadcastHeadline.textContent=d[0]; if(broadcastSubline) broadcastSubline.textContent=d[1]; if(broadcastTicker) broadcastTicker.textContent=d[2];
    if(broadcastTimestamp) broadcastTimestamp.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
    tvSet?.classList.remove('feed-flash'); void tvSet?.offsetWidth; tvSet?.classList.add('feed-flash');
    unlock('broadcast');
  }
  $('#rotateBroadcast')?.addEventListener('click',rotateBroadcast); $('#broadcastNext')?.addEventListener('click',rotateBroadcast);
  if(broadcastTimestamp){
    const updateBroadcastClock=()=>{if(!document.hidden)broadcastTimestamp.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})};
    setInterval(updateBroadcastClock,1000);
    updateBroadcastClock();
  }

  // OS modals
  const systemModal=$('#systemModal'), systemModalTitle=$('#systemModalKicker'), systemModalContent=$('#systemModalContent');
  const closeModal=()=>{systemModal?.classList.remove('open');systemModal?.setAttribute('aria-hidden','true');document.body.style.overflow=''};
  const openModal=(kicker,html,achievementId=null)=>{if(systemModalTitle) systemModalTitle.textContent=kicker;if(systemModalContent) systemModalContent.innerHTML=html;systemModal?.classList.add('open');systemModal?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(achievementId)unlock(achievementId);systemModalContent?.querySelector('[autofocus]')?.focus()};
  $('#systemModalClose')?.addEventListener('click',closeModal); $('.system-modal-backdrop')?.addEventListener('click',closeModal);

  function scrollToSection(id){const el=$(id);if(el){el.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});return}const localMovieIds=['#hub','#story','#universes','#cast','#making','#crew','#watch','#credits'];if(localMovieIds.includes(id)){location.href=`index.html${id}`}}
  function openSlideIndex(){
    openModal('NEXUS OS / SLIDE INDEX',`<div class="slide-index-modal"><p class="eyebrow">THE VERY LARGE NUMBER MACHINE</p><div class="slide-index-readout"><div class="slide-index-number" id="slideIndexNumber">67</div><div class="slide-index-total">/ 1,446</div></div><input id="slideIndexRange" type="range" min="1" max="1446" value="67" aria-label="Choose a slide number"><div class="slide-index-note" id="slideIndexNote">SLIDE 0067 // ARCHIVE ADDRESS /nexus/slides/67 // this is an index, not a copy of the actual deck.</div><div class="modal-buttons"><a class="btn btn-primary" href="https://docs.google.com/presentation/d/1CAi43fJJo9jHStGkUWmvqc_izJuN1JYpJ8gC7mbEJ_g/edit?usp=sharing" target="_blank" rel="noopener">OPEN MOVIE HUB ↗</a><button type="button" class="btn btn-ghost" id="slide67Mini">CHECK 67</button></div></div>`, 'slide');
    const range=$('#slideIndexRange'), num=$('#slideIndexNumber'), note=$('#slideIndexNote');
    range?.addEventListener('input',()=>{const n=Number(range.value);if(num) num.textContent=n.toLocaleString();if(note) note.textContent=`SLIDE ${String(n).padStart(4,'0')} // ARCHIVE ADDRESS /nexus/slides/${n} // this is an index, not a copy of the actual deck.`});
    $('#slide67Mini')?.addEventListener('click',()=>{closeModal();showSlide67()});
  }

  function openClassified(){
    openModal('NEXUS OS / CLASSIFIED ACCESS',`<div><p class="eyebrow">ACCESS LEVEL: UNKNOWN</p><h3 style="font:900 clamp(34px,5vw,70px)/.9 var(--display);margin:8px 0;text-transform:uppercase">prove you found this.</h3><p style="color:#a8b2c0;line-height:1.6;font-size:13px">Enter a known project code. The files are harmless, the security theatre is not.</p><form class="modal-form" id="classifiedForm"><input id="classifiedInput" autofocus autocomplete="off" spellcheck="false" placeholder="enter code…"><button type="submit">UNLOCK</button></form><div class="modal-message" id="classifiedMessage"></div></div>`,'classified');
    const form=$('#classifiedForm'), input=$('#classifiedInput'), msg=$('#classifiedMessage');
    form?.addEventListener('submit',e=>{e.preventDefault();const code=input.value.trim().toLowerCase();const files={
      '67':['FILE 067','The 67th slide has been located. It is still not particularly useful.'],
      '2000':['DEVICE 2000','Transdimensionalizer 2000: archived and somehow still warm.'],
      '3000':['DEVICE 3000','Unexpected machine designation detected. No further notes provided.'],
      'nexus':['NEXUS ROOT','Project hub recognised. Route integrity: acceptable.'],
      'pleuh':['PLEUH OVERRIDE','Spoiler sequence exists. This file contains no additional plot information.']
    }; if(files[code]){const f=files[code];msg.textContent=`${f[0]} // ${f[1]}`;unlock('classified');showSecretToast('CLASSIFIED FILE',f[0],false)}else{msg.textContent='ACCESS DENIED // try a code you already know.'}});
  }

  function randomDestination(){
    unlock('random');
    const options=['#system','#chromeus','#posters','#arcade','#forge','#desk','#broadcast','#archives','#achievements'];
    const pick=Math.floor(Math.random()*(options.length+2));
    if(pick===options.length){openPosterPortal();return}
    if(pick===options.length+1){openDimensionError('A randomizer route tried to send you somewhere that does not exist. It has been logged.');return}
    scrollToSection(options[pick%options.length]);
    showSecretToast('RANDOM DESTINATION',options[pick%options.length].replace('#','').toUpperCase(),false);
  }

  $$('.os-app').forEach(app=>app.addEventListener('click',()=>{
    const action=app.dataset.osAction;
    if(action==='movie') scrollToSection('#hub');
    if(action==='map') scrollToSection('#universeMap');
    if(action==='posters'){unlock('posters');openPosterPortal()}
    if(action==='archive'){scrollToSection('#archives');setTimeout(()=>$('.archive-file')?.click(),350);unlock('archive')}
    if(action==='desk') scrollToSection('#desk');
    if(action==='broadcast') scrollToSection('#broadcast');
    if(action==='slide') openSlideIndex();
    if(action==='classified') openClassified();
    if(action==='achievements') scrollToSection('#achievements');
    if(action==='random') randomDestination();
    if(action==='arcade') scrollToSection('#arcade');
    if(action==='forge') scrollToSection('#forge');
    if(action==='roulette') scrollToSection('#roulette');
  }));

  // Expand the existing terminal without replacing its original command set.
  const baseTerminalCommand=terminalCommand;
  terminalCommand=function(raw){
    const cmd=raw.trim().toLowerCase();
    if(['os','system'].includes(cmd)){terminalWrite(['> '+cmd,'NEXUS OS / ONLINE','LOCAL SESSION: '+sessionId]);scrollToSection('#system');unlock('terminal');return}
    if(cmd==='map'){terminalWrite(['> map','UNIVERSE ROUTER OPEN.']);scrollToSection('#universeMap');unlock('terminal');return}
    if(cmd==='desk'){terminalWrite(['> desk','DIRECTOR DESK LOCATED.']);scrollToSection('#desk');unlock('terminal');return}
    if(cmd==='broadcast'||cmd==='news'){terminalWrite(['> '+cmd,'NEXUS NEWS CONNECTED.']);scrollToSection('#broadcast');rotateBroadcast();unlock('terminal');return}
    if(cmd==='slide'||cmd==='slides'){terminalWrite(['> slide','OPENING SLIDE INDEX...']);openSlideIndex();unlock('terminal');return}
    if(cmd==='random'||cmd==='bored'){terminalWrite(['> '+cmd,'RANDOM ROUTE SELECTED.']);randomDestination();unlock('terminal');return}
    if(cmd==='achievements'||cmd==='achieve'){terminalWrite(['> achievements','LOCAL PROGRESS LOADED.']);scrollToSection('#achievements');unlock('terminal');return}
    if(cmd==='classified'||cmd==='secret'){terminalWrite(['> classified','CLEARANCE TERMINAL READY.']);openClassified();unlock('terminal');return}
    if(cmd==='404'||cmd==='error'){terminalWrite(['> 404','DIMENSION NOT FOUND.']);openDimensionError('The terminal requested a route outside the indexed realities.');unlock('terminal');return}
    if(cmd==='ai'){terminalWrite(['> ai','NEXUS AI / LOCAL MODEL ONLINE.','query the archive, not the meaning of life.','suggested: scan · status · chromeus · archive · banana']);unlock('terminal');return}
    if(cmd==='resetmemory'){storage.set(achKey,[]);renderAchievements();terminalWrite(['> resetmemory','LOCAL DISCOVERIES CLEARED.','visit count retained.']);return}
    if(cmd==='help'){
      terminalWrite(['> help','AVAILABLE COMMANDS:','movie · chromeus · posters · archive · crew','os · map · desk · broadcast · slide','random · achievements · classified · 404','pleuh · 67 · status · banana · ai','dontpress if you enjoy consequences.','try an exact command and the system will route you.']);return;
    }
    baseTerminalCommand(raw);
    if(cmd) unlock('terminal');
  };

  // The button that should obviously not be pressed.
  const dontPress=$('#osDontPress');
  let dontPressCount=0;
  dontPress?.addEventListener('click',()=>{
    dontPressCount++;
    dontPress.classList.remove('pressed');
    void dontPress.offsetWidth;
    dontPress.classList.add('pressed');
    unlock('terminal');
    const messages=[
      'good choice.',
      'that was explicitly labelled.',
      'NEXUS has recorded your decision.',
      'why are we doing this.',
      'DO NOT PRESS means do not press.',
      '...okay, you win.',
      'BUTTON LIMIT: RAPIDLY APPROACHING NONSENSE.'
    ];
    const message=messages[Math.min(dontPressCount-1,messages.length-1)];
    $('#osTaskMessage')?.replaceChildren(document.createTextNode(message));
    showSecretToast('QUESTIONABLE DECISION',message.toUpperCase(),dontPressCount>2);
    if(dontPressCount===3 && stability){stability.textContent='RUDE';refreshTelemetry()}
    if(dontPressCount===7){openDimensionError('The button has exceeded its recommended number of presses. The site has requested that you stop.');}
  });

  // Dimension error overlay
  const dimensionError=$('#dimensionError'), dimensionErrorText=$('#dimensionErrorText');
  function openDimensionError(message){
    if(dimensionErrorText) dimensionErrorText.textContent=message||'The requested reality could not be located.';
    dimensionError?.classList.add('open');dimensionError?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    document.body.classList.add('universe-glitch');setTimeout(()=>document.body.classList.remove('universe-glitch'),520);
  }
  function closeDimensionError(){dimensionError?.classList.remove('open');dimensionError?.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  window.openDimensionError=openDimensionError;
  $('#dimensionErrorClose')?.addEventListener('click',closeDimensionError);
  dimensionError?.addEventListener('click',e=>{if(e.target===dimensionError)closeDimensionError()});

  // Session keyboard shortcuts. Input fields remain sacred.
  window.addEventListener('keydown',e=>{
    if(document.activeElement?.matches?.('input,textarea,[contenteditable=true]')) return;
    if(e.key==='Escape'){closeModal();closeDimensionError()}
    if(e.key.toLowerCase()==='?'){showSecretToast('NEXUS SHORTCUTS','OS · MAP · RANDOM · 404 · CLASSIFIED',false)}
  });

  // Existing Easter-egg events can feed the V18 achievement state without changing them.
  transDevice?.addEventListener('click',()=>{unlock('terminal');refreshTelemetry()},{passive:true});
  portalOpenButton?.addEventListener('click',()=>unlock('posters'),{passive:true});
  $$('.archive-file').forEach(b=>b.addEventListener('click',()=>unlock('archive'),{passive:true}));

  // One intentional “wrong page” moment after enough exploration. It is opt-in via the system, never an autoplay interruption.
  const endSignal=document.querySelector('#end');
  let wrongPageArmed=false;
  let armTimer=null;
  const arm=()=>{if(!wrongPageArmed && ach.length>=4){wrongPageArmed=true;$('#osTaskMessage')?.replaceChildren(document.createTextNode('anomaly threshold reached.'));if(armTimer)clearInterval(armTimer);}};
  armTimer=setInterval(arm,1500);

})();


/* =========================================================
   V19 FUN LAB EXTRAS
   Small, local, deterministic enough to test, but chaotic enough to be fun.
   ========================================================= */
(function funLabExtras(){
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const unlock=window.nvvcUnlockAchievement||(()=>{});

  // Reaction test
  const reactionButton=q('#reactionButton'),reactionState=q('#reactionState'),reactionHint=q('#reactionHint'),reactionBest=q('#reactionBest'),reactionLast=q('#reactionLast'),reactionReset=q('#reactionReset');
  let reactionPhase='idle',reactionTimer=null,reactionStarted=0,best=0;
  try{best=Number(localStorage.getItem('nvvcReactionBest')||0)||0}catch{best=0}
  if(reactionBest)reactionBest.textContent=best?`${best} ms`:'—';
  function reactionMessage(state,hint){if(reactionState)reactionState.textContent=state;if(reactionHint)reactionHint.textContent=hint}
  reactionButton?.addEventListener('click',()=>{
    if(reactionPhase==='idle'||reactionPhase==='done'){
      reactionPhase='armed';reactionMessage('WAIT FOR FIRE…','do not click yet.');
      const delay=900+Math.random()*2800;
      clearTimeout(reactionTimer);
      reactionTimer=setTimeout(()=>{reactionPhase='live';reactionStarted=performance.now();reactionMessage('FIRE!','CLICK NOW.');reactionButton.classList.add('ready')},delay);return;
    }
    if(reactionPhase==='armed'){
      clearTimeout(reactionTimer);reactionPhase='done';reactionMessage('TOO SOON.','the portal was not ready.');return;
    }
    if(reactionPhase==='live'){
      const score=Math.max(1,Math.round(performance.now()-reactionStarted));
      reactionPhase='done';reactionButton.classList.remove('ready');reactionMessage(`${score} MS`,`that is now part of Nexus history.`);if(reactionLast)reactionLast.textContent=`${score} ms`;
      if(!best||score<best){best=score;try{localStorage.setItem('nvvcReactionBest',String(best))}catch{}if(reactionBest)reactionBest.textContent=`${best} ms`;}unlock('arcade');return;
    }
  });
  reactionReset?.addEventListener('click',()=>{clearTimeout(reactionTimer);reactionPhase='idle';reactionButton?.classList.remove('ready');reactionMessage('ARM THE TEST','don\'t click early.');if(reactionLast)reactionLast.textContent='—'});

  // Portal Catch
  const catchStage=q('#catchStage'),catchTarget=q('#catchTarget'),catchOverlay=q('#catchOverlay'),catchStart=q('#catchStart'),catchScore=q('#catchScore'),catchTime=q('#catchTime');
  let catchRunning=false,catchScoreValue=0,catchEnd=0,catchTimer=null;
  function placeCatchTarget(){if(!catchStage||!catchTarget)return;const r=catchStage.getBoundingClientRect();const tr=catchTarget.getBoundingClientRect();const pad=12;const x=pad+Math.random()*Math.max(0,r.width-tr.width-pad*2),y=pad+Math.random()*Math.max(0,r.height-tr.height-pad*2);catchTarget.style.left=`${x}px`;catchTarget.style.top=`${y}px`}
  function updateCatchTime(){if(!catchRunning)return;const left=Math.max(0,catchEnd-performance.now());if(catchTime)catchTime.textContent=(left/1000).toFixed(1);if(left<=0){catchRunning=false;catchOverlay?.classList.add('show');if(catchOverlay)catchOverlay.innerHTML='<b>ROUND OVER</b><small>START ANOTHER ROUND</small>';catchStart&&(catchStart.textContent='START ROUND');clearInterval(catchTimer);return}requestAnimationFrame(updateCatchTime)}
  catchStart?.addEventListener('click',()=>{catchRunning=true;catchScoreValue=0;catchEnd=performance.now()+15000;if(catchScore)catchScore.textContent='0';if(catchOverlay)catchOverlay.classList.remove('show');catchStart.textContent='RUNNING…';placeCatchTarget();clearInterval(catchTimer);catchTimer=null;requestAnimationFrame(updateCatchTime);unlock('arcade')});
  catchTarget?.addEventListener('click',e=>{e.stopPropagation();if(!catchRunning)return;catchScoreValue++;if(catchScore)catchScore.textContent=String(catchScoreValue);placeCatchTarget()});
  catchStage?.addEventListener('click',e=>{if(!catchRunning)return;if(e.target===catchStage){} });
  window.addEventListener('resize',()=>{if(catchRunning)placeCatchTarget()});

  // Dimension Forge
  const forgeGenerate=q('#forgeGenerate'),forgeStatus=q('#forgeStatus'),forgeCode=q('#forgeCode'),forgeName=q('#forgeName'),forgeStability=q('#forgeStability'),forgeChaos=q('#forgeChaos'),forgeColour=q('#forgeColour'),forgeDescription=q('#forgeDescription'),forgeTags=q('#forgeTags');
  const forgeWords={terrain:['glass desert','floating city','neon forest','endless corridor','quiet ocean','giant staircase','paper valley','crystal plain'],weather:['electric rain','no weather at all','permanent sunset','sideways snow','warm fog','purple thunder','clear skies','tiny meteors'],hazard:['none detected','gravity reverses','doors move','everything echoes','time is slightly wrong','floor may be lava','unknown singing','too many buttons'],mood:['suspiciously calm','loud','adventurous','confusing','cozy','dramatic','questionable','beautifully broken'],colour:['RED','CYAN','VIOLET','GOLD','GREEN','PINK','BLUE','ALL OF THEM']};
  function pick(a){return a[Math.floor(Math.random()*a.length)]}
  function generateDimension(){
    const terrain=pick(forgeWords.terrain),weather=pick(forgeWords.weather),hazard=pick(forgeWords.hazard),mood=pick(forgeWords.mood),colour=pick(forgeWords.colour);const n=Math.floor(100+Math.random()*900);const stability=Math.floor(45+Math.random()*56),chaos=101-stability+Math.floor(Math.random()*10);const safeChaos=Math.min(99,chaos);const name=`${pick(['THE','NEW','LOST','ULTIMATE','VERY NORMAL','ABSOLUTELY NOT'])} ${pick(['SECTOR','REALM','ZONE','DIMENSION','WORLD','LAYER'])}`;
    if(forgeStatus)forgeStatus.textContent='GENERATED';if(forgeCode)forgeCode.textContent=`N-${n}`;if(forgeName)forgeName.textContent=name;if(forgeStability)forgeStability.textContent=`STABILITY ${stability}%`;if(forgeChaos)forgeChaos.textContent=`CHAOS ${safeChaos}%`;if(forgeColour)forgeColour.textContent=`SIGNAL ${colour}`;
    if(forgeDescription)forgeDescription.textContent=`A ${mood} reality built from ${terrain}. Forecast: ${weather}. Hazard report: ${hazard}.`;
    if(forgeTags)forgeTags.innerHTML=`<span>terrain: ${terrain}</span><span>weather: ${weather}</span><span>hazard: ${hazard}</span><span>mood: ${mood}</span>`;
    unlock('forge');
  }
  forgeGenerate?.addEventListener('click',generateDimension);

  // Poster Roulette. It uses the same poster dataset as the vault, never invents files.
  const spinPoster=q('#spinPoster'),roulettePoster=q('#roulettePoster'),rouletteUniverse=q('#rouletteUniverse'),rouletteTitle=q('#rouletteTitle'),rouletteType=q('#rouletteType'),rouletteCard=q('#rouletteCard');let posterRouletteClicks=0;
  spinPoster?.addEventListener('click',()=>{
    const list=typeof allRoomPosters==='function'?allRoomPosters():[];if(!list.length)return;const p=list[Math.floor(Math.random()*list.length)];const full=p.src||posterPath(p.id,p.type); window.__nvvcLastRoulettePoster=p;if(rouletteCard){rouletteCard.classList.remove('spin');void rouletteCard.offsetWidth;rouletteCard.classList.add('spin');}if(roulettePoster){roulettePoster.src=p.thumb||posterThumbPath(p.id,p.type);roulettePoster.alt=`${p.title} poster`;}if(rouletteUniverse)rouletteUniverse.textContent=p.universe.replace(/^./,m=>m.toUpperCase());if(rouletteTitle)rouletteTitle.textContent=p.title.toUpperCase();if(rouletteType)rouletteType.textContent=`${p.type.toUpperCase()} / ORIGINAL ART`;posterRouletteClicks++;if(posterRouletteClicks>=3)unlock('poster_master');unlock('roulette');
  });
  rouletteCard?.addEventListener('click',()=>{
    const list=typeof allRoomPosters==='function'?allRoomPosters():[];const target=window.__nvvcLastRoulettePoster;const idx=target?list.findIndex(p=>p.id===target.id&&p.title===target.title&&p.type===target.type):-1;if(idx>=0){window.__nvvcRouletteList=list;filteredPosters=list;openLightbox?.(idx)}
  });

  // Extra OS shortcut cards and fun-page routing.
  qa('.fun-quick-links a,.fun-page .nav-links a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav-menu')?.setAttribute('aria-expanded','false')));

  // Tiny rotating signal messages for the fun hero.
  const funSignal=q('#funSignal');const funSignals=['ARCHIVE: OPEN','CHROMEUS: CALM-ISH','ARCADE: ONLINE','PORTAL: WARM','NEXUS: QUESTIONABLE'];let si=0;if(funSignal){setInterval(()=>{if(!document.hidden){si=(si+1)%funSignals.length;funSignal.textContent=funSignals[si]}},2800)}
})();


/* =========================================================
   V23: NEXUS MIXER
   ========================================================= */
(function nexusMixer(){
  const q=s=>document.querySelector(s),pick=a=>a[Math.floor(Math.random()*a.length)];
  const spin=q('#mixerSpin'),copy=q('#mixerCopy'),status=q('#mixerStatus'),code=q('#mixerCode'),callsign=q('#mixerCallsign'),universe=q('#mixerUniverse'),character=q('#mixerCharacter'),mood=q('#mixerMood'),tag=q('#mixerTag'),card=q('#mixerCard');
  if(!spin)return;
  const data={universe:['COLOURS','THE BOT GAMES','ALGOTRIACONTATHLON','CHROMEUS','NEXUS ROBOTICS'],character:['Turquoise','Red','Black','EXQ Genius','Geobot','Subot','Maxbot','Cyan','Gold','Green','Malachi','Frank','Nerdbot'],mood:['DIMENSIONALLY CURIOUS','QUESTIONABLE','ABSOLUTELY UNPREPARED','WEIRDLY CALM','MAXIMUM CHAOS','MAIN-CHARACTER ENERGY','ARCHIVE GOBLIN','PROBABLY FINE'],prefix:['Captain','Agent','Professor','Chief','Certified','Supreme','Local','Interdimensional'],suffix:['PORTAL','NEXUS','STATIC','GLITCH','RIFT','VECTOR','BEAM','ARCHIVE']};
  let latest='';
  spin.addEventListener('click',()=>{const u=pick(data.universe),c=pick(data.character),m=pick(data.mood),name=`${pick(data.prefix)} ${c.toUpperCase()} ${pick(data.suffix)}`,n=`N-${Math.floor(1000+Math.random()*9000)}`;code.textContent=n;callsign.textContent=name;universe.textContent=u;character.textContent=c;mood.textContent=m;tag.textContent=`SIGNAL ${Math.floor(40+Math.random()*60)}%`;status.textContent='GENERATED / LOCAL RESULT';copy.disabled=false;card.classList.remove('mixer-spin');void card.offsetWidth;card.classList.add('mixer-spin');latest=`${n} — ${name} | ${u} | ${c} | ${m}`;try{localStorage.setItem('nvvcLastMixer',latest)}catch{}window.nvvcUnlockAchievement?.('mixer')});
  copy.addEventListener('click',async()=>{if(!latest)return;try{await navigator.clipboard.writeText(latest);status.textContent='COPIED TO CLIPBOARD'}catch{status.textContent='CLIPBOARD BLOCKED / READ IT WITH YOUR EYES'}});
})();

/* =========================================================
   V26 MUST-HAVES — direct Chromeus corners, poster wall, slide pointer
   ========================================================= */
const chromeusCornerData={
  desert:{src:'assets/interactive/chromeus-01.png',label:'CORNER 01 // RED-SANDED DESERT',message:'CHROMEUS // RED-SANDED BIOME',sub:'hot horizon detected. the sand is doing its best.',signal:'78%',coords:'01 / 11 / 04'},
  city:{src:'assets/interactive/chromeus-02.png',label:'CORNER 02 // THE CITY',message:'CHROMEUS // CITY SECTOR',sub:'urban silhouettes detected. road map still unavailable.',signal:'72%',coords:'02 / 18 / 31'},
  jungle:{src:'assets/interactive/chromeus-03.png',label:'CORNER 03 // THE JUNGLE',message:'CHROMEUS // JUNGLE SECTOR',sub:'trees detected. visibility: suspiciously low.',signal:'91%',coords:'03 / 42 / 19'},
  plains:{src:'assets/interactive/chromeus-04.png',label:'CORNER 04 // THE PLAINS',message:'CHROMEUS // OPEN PLAINS',sub:'clear skies. flowers. absolutely no suspicious activity.',signal:'99%',coords:'04 / 03 / 61'},
  centre:{src:null,label:'CENTRE // WASTELAND',message:'CHROMEUS // CENTRE ANOMALY',sub:'the central area is a separate dimensional state. proceed carefully.',signal:'NULL',coords:'Ø / Ø / Ø'}
};
function setChromeusCorner(key){
  const d=chromeusCornerData[key]||chromeusCornerData.plains;
  $$('.chromeus-corner').forEach(b=>b.classList.toggle('active',b.dataset.chromeusCorner===key));
  if(chromeusBg){chromeusBg.style.backgroundImage=d.src?`url("${d.src}")`:'';chromeusViewport?.classList.toggle('centre-feed',!d.src)}
  if(viewportCorner)viewportCorner.textContent=d.label;
  if(viewportMessage)viewportMessage.textContent=d.message;
  if(viewportSub)viewportSub.textContent=d.sub;
  if(viewportReadout)viewportReadout.textContent=`SIGNAL: ${d.signal}`;
  if(viewportCoords)viewportCoords.textContent=`COORDS: ${d.coords}`;
  if(dimensionLabel)dimensionLabel.textContent='DIRECT FEED LOCKED';
  if(deviceStatus)deviceStatus.textContent='STABLE-ISH';
  if(chromeusViewport){chromeusViewport.classList.remove('active');void chromeusViewport.offsetWidth;chromeusViewport.classList.add('active');}
  if(key==='centre') window.nvvcUnlockAchievement?.('chromeus');
}
$$('.chromeus-corner').forEach(b=>b.addEventListener('click',()=>setChromeusCorner(b.dataset.chromeusCorner)));

// Poster wall shortcuts: open the existing portal in the requested archive bay.
$$('.wall-poster').forEach(b=>b.addEventListener('click',()=>{window.nvvcOpenPosterPortal?.(b.dataset.wallUniverse||null);}));
$('#wallOpenVault')?.addEventListener('click',()=>window.nvvcOpenPosterPortal?.());

// Slide pointer. It is intentionally an index, not a fabricated screenshot browser.
const slideNumber=$('#slideNumber'),slideGo=$('#slideGo'),slideRandom=$('#slideRandom');
function clampSlide(v){return Math.min(1446,Math.max(1,Math.round(Number(v)||1)))}
function setSlidePointer(v){
  const n=clampSlide(v); if(slideNumber)slideNumber.value=n;
  const pct=(n/1446)*100;
  const slideIndexNumberEl=$('#slideIndexNumber'); if(slideIndexNumberEl) slideIndexNumberEl.textContent=String(n).padStart(3,'0');
  const slideIndexPctEl=$('#slideIndexPct'); if(slideIndexPctEl) slideIndexPctEl.textContent=`${pct.toFixed(1)}%`;
  const bar=$('#slideIndexBar'); if(bar)bar.style.width=`${pct}%`;
  const state=$('#slideIndexState'); if(state)state.textContent=n===67?'ARCHIVE FRAGMENT':n===1446?'FINAL SLIDE':'POINTER LOCKED';
  const note=$('#slideIndexNote'); if(note){if(n===67)note.textContent='slide 067. yes, the number is still following us.';else if(n===1446)note.textContent='slide 1,446. you have reached the end of the indexed project.';else if(n<362)note.textContent='early project territory. the pointer makes no claims about what happens here.';else if(n<1086)note.textContent='middle project territory. a lot of slides live around here.';else note.textContent='late project territory. you are approaching the end of the deck.';}
  const slideCard=$('#slideIndexCard'); if(slideCard){slideCard.classList.remove('slide-pointer-hit');void slideCard.offsetWidth;slideCard.classList.add('slide-pointer-hit');}
}
slideGo?.addEventListener('click',()=>setSlidePointer(slideNumber?.value));
slideRandom?.addEventListener('click',()=>setSlidePointer(1+Math.floor(Math.random()*1446)));
slideNumber?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();setSlidePointer(slideNumber.value)}});
setSlidePointer(1);

// Deep links from the Movie Hub can open a specific Poster Vault universe.
const initialPosterUniverse = new URLSearchParams(window.location.search).get('universe');
if(initialPosterUniverse && universePosterData[initialPosterUniverse] && location.hash==='#posters'){
  window.setTimeout(()=>openPosterPortal(initialPosterUniverse),240);
}

