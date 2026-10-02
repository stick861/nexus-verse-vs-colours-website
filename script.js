const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

const nav=$('#siteNav'), menu=$('.nav-menu');
menu?.addEventListener('click',()=>{const open=nav?.classList.toggle('menu-open')||false;menu.setAttribute('aria-expanded',String(open));});
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}));
document.addEventListener('click',e=>{if(nav&&!nav.contains(e.target)){nav.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){nav?.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}});
window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>25),{passive:true});

const scrollProgress=$('#scrollProgress i');
const navSectionLinks=$$('.nav-links a[href^="#"]');
const sectionTargets=navSectionLinks.map(a=>({a,el:$(a.getAttribute('href'))})).filter(x=>x.el);
let scrollRaf=0;
function updateScrollUI(){
  scrollRaf=0;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  if(scrollProgress) scrollProgress.style.width=`${max>0?Math.min(100,Math.max(0,scrollY/max*100)):0}%`;
  let current=null;
  for(const item of sectionTargets){if(item.el.getBoundingClientRect().top<=window.innerHeight*.35) current=item;}
  navSectionLinks.forEach(a=>a.classList.remove('active')); current?.a.classList.add('active');
}
window.addEventListener('scroll',()=>{if(!scrollRaf)scrollRaf=requestAnimationFrame(updateScrollUI)},{passive:true});
window.addEventListener('resize',()=>{if(!scrollRaf)scrollRaf=requestAnimationFrame(updateScrollUI)},{passive:true});
updateScrollUI();

const orb=$('.cursor-orb');let orbRaf=0,orbX=0,orbY=0;
const finePointer=matchMedia('(pointer:fine)').matches;
if(orb&&finePointer&&!reduceMotion){window.addEventListener('pointermove',e=>{orbX=e.clientX;orbY=e.clientY;if(orbRaf)return;orbRaf=requestAnimationFrame(()=>{orb.style.transform=`translate3d(${orbX}px,${orbY}px,0) translate(-50%,-50%)`;orbRaf=0;});},{passive:true});}else if(orb){orb.style.display='none';}

$$('[data-count]').forEach(el=>{const target=Number(el.dataset.count);if(reduceMotion){el.textContent=target.toLocaleString();return}const start=performance.now();const tick=now=>{const p=Math.min(1,(now-start)/1100),eased=1-Math.pow(1-p,3);el.textContent=Math.round(target*eased).toLocaleString();if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)});



// Character database: filters and search on the movie hub.
// Kept spoiler-free and backed by the poster files packaged with the site.
const characterSearch=$('#characterSearch');
const characterResults=$('#characterResults');
let activeCharacterFilter='all';
const movieCharacters=[
  {name:'Geobot',universe:'bots',universeLabel:'THE BOT GAMES',thumb:'assets/poster-thumbs/portrait/p05.webp'},
  {name:'Subot',universe:'bots',universeLabel:'THE BOT GAMES',thumb:'assets/poster-thumbs/portrait/p06.webp'},
  {name:'Maxbot',universe:'bots',universeLabel:'THE BOT GAMES',thumb:'assets/poster-thumbs/portrait/p07.webp'},
  {name:'Emobot',universe:'bots',universeLabel:'THE BOT GAMES',thumb:'assets/poster-thumbs/portrait/p08.webp'},
  {name:'Nerdbot',universe:'bots',universeLabel:'THE BOT GAMES',thumb:'assets/poster-thumbs/portrait/p09.webp'},
  {name:'Frank',universe:'bots',universeLabel:'THE BOT GAMES',thumb:'assets/poster-thumbs/portrait/p10.webp'},
  {name:'Turquoise',universe:'colours',universeLabel:'COLOURS',thumb:'assets/poster-thumbs/portrait/p15.webp'},
  {name:'Gold',universe:'colours',universeLabel:'COLOURS',thumb:'assets/poster-thumbs/portrait/p16.webp'},
  {name:'Blue',universe:'colours',universeLabel:'COLOURS',thumb:'assets/poster-thumbs/portrait/p17.webp'},
  {name:'Green',universe:'colours',universeLabel:'COLOURS',thumb:'assets/poster-thumbs/portrait/p18.webp'},
  {name:'Cyan',universe:'colours',universeLabel:'COLOURS',thumb:'assets/poster-thumbs/portrait/p19.webp'},
  {name:'Red',universe:'colours',universeLabel:'COLOURS',thumb:'assets/poster-thumbs/portrait/p20.webp'},
  {name:'EXQ Genius',universe:'algo',universeLabel:'ALGOTRIACONTATHLON',thumb:'assets/poster-thumbs/portrait/p21.webp'},
  {name:'Elijah',universe:'eightfit',universeLabel:'8FIT',thumb:'assets/poster-thumbs/portrait/p11.webp'},
  {name:'Malachi',universe:'eightfit',universeLabel:'8FIT',thumb:'assets/poster-thumbs/portrait/p12.webp'},
  {name:'Shay',universe:'eightfit',universeLabel:'8FIT',thumb:'assets/poster-thumbs/portrait/p13.webp'},
  {name:'Ayaan',universe:'eightfit',universeLabel:'8FIT',thumb:'assets/poster-thumbs/portrait/p14.webp'}
];
function renderCharacterDatabase(){
  if(!characterResults) return;
  const query=(characterSearch?.value||'').trim().toLowerCase();
  const list=movieCharacters.filter(c=>activeCharacterFilter==='all'||c.universe===activeCharacterFilter)
    .filter(c=>!query||c.name.toLowerCase().includes(query)||c.universeLabel.toLowerCase().includes(query));
  if(!list.length){
    characterResults.innerHTML='<div class="character-empty">NO MATCHING SIGNAL. TRY ANOTHER QUERY.</div>';
    return;
  }
  characterResults.innerHTML=list.map(c=>`<a class="character-card" href="fun.html?universe=${c.universe}#posters" data-character-universe="${c.universe}" aria-label="Open ${c.name} in the poster vault"><img src="${c.thumb}" alt="${c.name} poster" loading="lazy" decoding="async" width="450" height="636"><span><b>${c.name}</b><small>${c.universeLabel}</small><span class="char-chip">OPEN IN POSTER VAULT ↗</span></span></a>`).join('');
}
$$('.char-filter').forEach(button=>button.addEventListener('click',()=>{
  $$('.char-filter').forEach(x=>x.classList.remove('active'));
  button.classList.add('active');
  activeCharacterFilter=button.dataset.charFilter||'all';
  renderCharacterDatabase();
}));
characterSearch?.addEventListener('input',renderCharacterDatabase);
renderCharacterDatabase();

const reveals=$$('.route-card,.act-grid article,.universe-card,.directory-card,.making-grid,.watch-card,.credits-grid,.hub-hero-card,.statement-grid,.fun-teaser-card');
if('IntersectionObserver'in window){const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');ro.unobserve(e.target)}}),{threshold:.08});reveals.forEach(el=>{el.classList.add('will-reveal');ro.observe(el)})}

// Making-of player: direct link on file://, embedded player on http(s).
const makingOfFrame=$('#makingOfFrame'),videoStatus=$('#videoStatus');
const makingOfVideoId='GgjMURUGig8',makingOfUrl=`https://www.youtube.com/watch?v=${makingOfVideoId}`;
function renderMakingOfPlayer(){
  if(!makingOfFrame)return;
  if(location.protocol==='file:'){
    makingOfFrame.innerHTML=`<a class="video-fallback" href="${makingOfUrl}" target="_blank" rel="noopener noreferrer"><strong>WATCH THE MAKING-OF ON YOUTUBE ↗</strong><span>The embedded player is disabled for local previews.</span><em class="video-local-note">LOCAL PREVIEW / OPEN THE VIDEO DIRECTLY</em></a>`;
    if(videoStatus)videoStatus.textContent='LOCAL PREVIEW';return;
  }
  const origin=encodeURIComponent(location.origin);
  makingOfFrame.innerHTML=`<iframe title="Nexus-Verse vs Colours making-of video" src="https://www.youtube-nocookie.com/embed/${makingOfVideoId}?rel=0&modestbranding=1&origin=${origin}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  if(videoStatus)videoStatus.textContent='LOADING';
}
renderMakingOfPlayer();
if(makingOfFrame){const mo=new MutationObserver(()=>{const f=makingOfFrame.querySelector('iframe');if(f&&!f.dataset.bound){f.dataset.bound='1';f.addEventListener('load',()=>{if(videoStatus)videoStatus.textContent='EMBED LOADED'},{once:true})}});mo.observe(makingOfFrame,{childList:true});}

// Production timeline.
const timelineMessages={
 idea:'01 // IDEA — start with the extremely normal thought: “what if these universes met?”',
 script:'02 // SCRIPT — stitch the crossover together without losing everybody’s personalities.',
 assets:'03 // ASSETS — characters, environments, props, logos and enough tiny pieces to build scenes.',
 slides:'04 // SLIDES — the number starts climbing. 1,446 eventually becomes a real problem.',
 animites:'05 // ANIMITES — turn the static slide language into movement, one frame at a time.',
 release:'06 // RELEASE — publish the thing and let other humans experience the consequences.'
};
const timelineReadout=$('#timelineReadout');
$$('.timeline-track button').forEach(btn=>btn.addEventListener('click',()=>{ $$('.timeline-track button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');if(timelineReadout)timelineReadout.textContent=timelineMessages[btn.dataset.time]||''; }));

// Spoiler mode: visible, deliberate, and confirmed in three steps. PLEUH now starts the same confirmation sequence.
const spoilerZone=$('#spoilerZone'),spoilerUnlock=$('#spoilerUnlock'),lockSpoilers=$('#lockSpoilers'),spoilerChip=$('#spoilerModeButton');
const spoilerModeButton=$('#spoilerModeButton'),storySpoilerButton=$('#storySpoilerButton');
const spoilerConfirm=$('#spoilerConfirm'),spoilerConfirmText=$('#spoilerConfirmText'),spoilerConfirmStep=$('#spoilerConfirmStep'),spoilerConfirmYes=$('#spoilerConfirmYes'),spoilerConfirmNo=$('#spoilerConfirmNo');
let spoilerTimer=null,pleuhBuffer='',spoilerConfirmStage=0,spoilerReturnFocus=null;
const spoilerStages=[
  {text:'This unlocks plot details, reveals, the full ending, and a movie quiz.',no:'NOPE, KEEP IT CLEAN',yes:"I KNOW WHAT I'M DOING"},
  {text:'You are about to see the complete crossover story. There is no fakeout here.',no:'WAIT, GO BACK',yes:'YES, I FINISHED THE MOVIE'},
  {text:'Red. Chromeus. Cyan. EXQ. The ending. The post-credits scenes. All of it.',no:'ABORT MISSION',yes:'UNLOCK SPOILER MODE'}
];
function setSpoilerChip(open){
  if(!spoilerChip)return;
  spoilerChip.innerHTML=`<span aria-hidden="true" class="spoiler-button-dot"></span>${open?'SPOILERS ON':'SPOILER MODE'}`;
  spoilerChip.classList.toggle('is-on',open);
  spoilerChip.setAttribute('aria-label',open?'Spoiler mode is active. Click to lock it.':'Open spoiler mode confirmation');
  spoilerChip.setAttribute('aria-pressed',String(open));
}
function closeSpoilerConfirm(){
  spoilerConfirm?.classList.remove('open');
  spoilerConfirm?.setAttribute('aria-hidden','true');
  document.body.classList.remove('spoiler-confirm-open');
  spoilerConfirmStage=0;
  const restoreTarget=spoilerReturnFocus;
  spoilerReturnFocus=null;
  if(restoreTarget?.focus) setTimeout(()=>{try{restoreTarget.focus()}catch{}},0);
}
function openSpoilerConfirm(){
  if(document.body.classList.contains('spoilers-unlocked')){setSpoilerMode(false,false);return;}
  spoilerReturnFocus=document.activeElement;
  spoilerConfirmStage=0;
  const s=spoilerStages[0];
  spoilerConfirm?.classList.add('open'); spoilerConfirm?.setAttribute('aria-hidden','false');
  document.body.classList.add('spoiler-confirm-open');
  if(spoilerConfirmText)spoilerConfirmText.textContent=s.text;
  if(spoilerConfirmYes)spoilerConfirmYes.textContent=s.yes;
  if(spoilerConfirmNo)spoilerConfirmNo.textContent=s.no;
  if(spoilerConfirmStep)spoilerConfirmStep.textContent='CONFIRMATION 1 / 3';
  setTimeout(()=>spoilerConfirmYes?.focus(),40);
}
function setSpoilerMode(open,showFlash=true){
  document.body.classList.toggle('spoilers-unlocked',open);
  spoilerZone?.setAttribute('aria-hidden',String(!open));
  setSpoilerChip(open);
  if(open){closeSpoilerConfirm();spoilerZone?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});}
  if(showFlash&&open&&spoilerUnlock){
    spoilerUnlock.classList.add('show');spoilerUnlock.setAttribute('aria-hidden','false');
    clearTimeout(spoilerTimer);spoilerTimer=setTimeout(()=>{spoilerUnlock.classList.remove('show');spoilerUnlock.setAttribute('aria-hidden','true')},1900);
  }
}
spoilerModeButton?.addEventListener('click',openSpoilerConfirm);
storySpoilerButton?.addEventListener('click',openSpoilerConfirm);
spoilerConfirmNo?.addEventListener('click',closeSpoilerConfirm);
spoilerConfirm?.querySelector('[data-spoiler-close]')?.addEventListener('click',closeSpoilerConfirm);
spoilerConfirmYes?.addEventListener('click',()=>{
  const next=spoilerConfirmStage+1;
  if(next<spoilerStages.length){
    spoilerConfirmStage=next; const s=spoilerStages[next];
    if(spoilerConfirmText)spoilerConfirmText.textContent=s.text;
    if(spoilerConfirmYes)spoilerConfirmYes.textContent=s.yes;
    if(spoilerConfirmNo)spoilerConfirmNo.textContent=s.no;
    if(spoilerConfirmStep)spoilerConfirmStep.textContent=`CONFIRMATION ${next+1} / 3`;
    spoilerConfirm?.classList.remove('nudge'); void spoilerConfirm?.offsetWidth; spoilerConfirm?.classList.add('nudge'); return;
  }
  try{sessionStorage.setItem('nvvcSpoilers','1')}catch{}
  setSpoilerMode(true,true);
});
lockSpoilers?.addEventListener('click',()=>{setSpoilerMode(false,false);try{sessionStorage.setItem('nvvcSpoilers','0')}catch{}});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&spoilerConfirm?.classList.contains('open')){closeSpoilerConfirm();return;}
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(document.activeElement?.matches?.('input,textarea,[contenteditable=true]'))return;
  if(e.key.length!==1)return;
  pleuhBuffer=(pleuhBuffer+e.key.toLowerCase()).slice(-5);
  if(pleuhBuffer==='pleuh'){pleuhBuffer=''; if(document.body.classList.contains('spoilers-unlocked'))setSpoilerMode(false,false);else openSpoilerConfirm();}
});
setSpoilerChip(false);

// Full-movie spoiler quiz. Questions are based only on the canonical plot + voice lines supplied for NV × C.
const movieQuiz=[
 {act:'ACT 01',q:'What invention causes the four groups to be pulled into Chromeus?',opts:['The Transdimensionaliser','A portal gun from TBG','Brown’s invention','The growth potion'],a:0},
 {act:'ACT 01',q:'Where do the Colourites initially land on Chromeus?',opts:['The City','The jungle biome','The red-sanded desert','The plains'],a:1},
 {act:'ACT 02',q:'Who discovers the locked vent while looking for somewhere to sit?',opts:['Cyan','Malachi','Maxbot','EXQ Genius'],a:1},
 {act:'ACT 02',q:'What does Subot reveal he secretly kept from Honey Bomb?',opts:['A portal map','A chair','A bullet for his gun','A Transdimensionaliser'],a:2},
 {act:'ACT 03',q:'Who presses the button that disables the barrier and light?',opts:['Turquoise','Malachi','Green','EXQ Genius'],a:1},
 {act:'ACT 03',q:'Who correctly spots Red before the others fully believe the warning?',opts:['Malachi','Gold','Frank','Blue'],a:0},
 {act:'ACT 03',q:'What does Maxbot do that gives Red the group’s surprise-attack plan?',opts:['He steals the Transdimensionaliser','He tells Red about the surprise attack','He disables Gold’s power','He destroys the button'],a:1},
 {act:'ACT 04',q:'Who escapes the first defeat in time to try to revive everyone?',opts:['Turquoise','Black','EXQ Genius','Nerdbot'],a:2},
 {act:'ACT 04',q:'What makes Red enormous after the group reaches the Colours universe?',opts:['Cyan’s power','A growth potion leaking onto him','The Chromeus light','Brown’s invention'],a:1},
 {act:'ACT 04',q:'Who uses the antidote to shrink Red back down?',opts:['Nerdbot','Geobot','Turquoise','Black'],a:0},
 {act:'ACT 05',q:'Why does the group start jumping through many different universes?',opts:['They are looking for a missing portal key','They are trying to find Cyan and get home','They are chasing Maxbot','The city disappears'],a:1},
 {act:'ACT 05',q:'Who trips on a wire in Phantasmia and shuts off the lights?',opts:['Shay','Subot','Frank','Malachi'],a:1},
 {act:'ACT 05',q:'In the dream universe, what causes EXQ Genius’s insecurities and fears to manifest?',opts:['Nerdbot’s machine','The blank world itself','The button','A crack in Chromeus'],a:2},
 {act:'ACT 05',q:'What does Elijah finally tell EXQ Genius during their heart-to-heart?',opts:['He should leave the show','He is a great host','He should stay in Chromeus','He should stop talking to Turquoise'],a:1},
 {act:'ACT 05',q:'Who do Emobot and Maxbot meet in the Algo universe who can help them escape?',opts:['Algo Brown','Algo Cyan','Algo Gold','Algo Blue'],a:0},
 {act:'ACT 06',q:'What special feature does the new Transdimensionaliser have?',opts:['It gives everyone new powers','It automatically detects each person’s home universe','It has unlimited shots','It can revive people'],a:1},
 {act:'ACT 06',q:'Why does EXQ Genius hesitate to enter the final portal?',opts:['He lost his power','He is afraid of Red','He doesn’t want to leave his new friend Turquoise','He cannot see the portal'],a:2},
 {act:'EPILOGUE',q:'What happens when the TBG group finally returns home?',opts:['They immediately start a game','They quietly go to sleep','They crash into their beds and start a fight over the noise','They open another portal'],a:2},
 {act:'POST-CREDITS',q:'Who is revealed as Red’s accomplice?',opts:['Black','White','Brown','Maxbot'],a:1},
 {act:'POST-CREDITS',q:'What does EXQ say at the very end of the second post-credit scene?',opts:['“Hello, Genius.”','“You missed me?”','“Hiya, Turquoise.”','“Open the portal!”'],a:2},
];
let quizIndex=0,quizScore=0,quizLocked=false;
const quizCard=$('#quizCard'),quizAct=$('#quizAct'),quizQuestion=$('#quizQuestion'),quizOptions=$('#quizOptions'),quizFeedback=$('#quizFeedback'),quizNext=$('#quizNext'),quizProgressLabel=$('#quizProgressLabel'),quizProgressBar=$('#quizProgressBar'),quizScoreEl=$('#quizScore'),quizFinale=$('#quizFinale'),quizFinalScore=$('#quizFinalScore'),quizFinalText=$('#quizFinalText'),quizRestart=$('#quizRestart');
function renderQuiz(){
  if(!quizQuestion||!movieQuiz.length)return;
  const item=movieQuiz[quizIndex]; quizLocked=false;
  quizAct.textContent=item.act; quizQuestion.textContent=item.q; quizFeedback.textContent=''; quizNext.disabled=true; quizNext.textContent=quizIndex===movieQuiz.length-1?'SEE RESULTS →':'NEXT QUESTION →';
  quizProgressLabel.textContent=`QUESTION ${String(quizIndex+1).padStart(2,'0')} / ${movieQuiz.length}`;
  if(quizProgressBar)quizProgressBar.style.width=`${(quizIndex/movieQuiz.length)*100}%`;
  if(quizScoreEl)quizScoreEl.textContent=`SCORE ${quizScore}`;
  quizOptions.innerHTML=item.opts.map((opt,i)=>`<button type="button" class="quiz-option" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${opt}</button>`).join('');
  $$('.quiz-option',quizOptions).forEach(btn=>btn.addEventListener('click',()=>answerQuiz(Number(btn.dataset.answer))));
}
function answerQuiz(choice){
  if(quizLocked)return; quizLocked=true; const item=movieQuiz[quizIndex]; const correct=choice===item.a; if(correct)quizScore++;
  $$('.quiz-option',quizOptions).forEach((btn,i)=>{btn.disabled=true;if(i===item.a)btn.classList.add('correct');if(i===choice&&i!==item.a)btn.classList.add('wrong')});
  quizFeedback.innerHTML=correct?'CORRECT. Nexus signal accepted.':`NOT QUITE. The correct answer was <strong>${item.opts[item.a]}</strong>.`;
  if(quizScoreEl)quizScoreEl.textContent=`SCORE ${quizScore}`; quizNext.disabled=false;
}
quizNext?.addEventListener('click',()=>{
  if(!quizLocked)return;
  if(quizIndex<movieQuiz.length-1){quizIndex++;renderQuiz();return;}
  quizCard?.setAttribute('hidden','true');quizFinale?.removeAttribute('hidden');quizFinalScore.textContent=`${quizScore} / ${movieQuiz.length}`;
  quizFinalText.textContent=quizScore===movieQuiz.length?'20/20. Questionably perfect.':quizScore>=15?'Strong run. The Nexus recognises your memory.':quizScore>=10?'You know the movie. The Nexus is mildly impressed.':'The Nexus recommends another viewing.';
  try{localStorage.setItem('nvvcQuizBest',String(Math.max(Number(localStorage.getItem('nvvcQuizBest')||0),quizScore)))}catch{}
});
quizRestart?.addEventListener('click',()=>{quizIndex=0;quizScore=0;quizFinale?.setAttribute('hidden','true');quizCard?.removeAttribute('hidden');renderQuiz()});
renderQuiz();

// Friendly page-top control.
const quickTop=$('#quickTop');
function updateQuickTop(){quickTop?.classList.toggle('show',scrollY>Math.max(520,innerHeight*.7))}
window.addEventListener('scroll',updateQuickTop,{passive:true});quickTop?.addEventListener('click',()=>scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));updateQuickTop();

// Loader.
const loader=$('#siteLoader'),loaderStatus=$('#loaderStatus');
const loaderStates=['ESTABLISHING MOVIE LINK...','CHECKING 1,446 SLIDES...','CALIBRATING THEATER ROUTE...','MOVIE HUB READY.'];
function finishLoader(){if(!loader)return;loader.classList.add('loaded');setTimeout(()=>loader.remove(),650)}
function runLoader(){if(!loader)return;let i=0;const tick=()=>{if(loaderStatus)loaderStatus.textContent=loaderStates[i%loaderStates.length];i++;if(i<4)setTimeout(tick,210)};tick();setTimeout(finishLoader,720)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',runLoader,{once:true});else runLoader();

// Local-only tiny click sound, created after user gesture.
let audioCtx=null;function getAudio(){if(audioCtx)return audioCtx;try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx}catch{return null}}
function blip(freq=540,duration=.04,volume=.018,type='triangle'){const ctx=getAudio();if(!ctx)return;if(ctx.state==='suspended')ctx.resume().catch(()=>{});const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.005);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration+.01)}
document.addEventListener('click',e=>{const t=e.target?.closest?.('.btn,.route-card a,.universe-card a,.directory-jump,.fun-cta');if(t)blip()}, {passive:true});

// Persistent visit count keeps the site feeling alive without sending data anywhere.
try{const k='nvvcMovieVisits';const n=(Number(localStorage.getItem(k)||0)+1);localStorage.setItem(k,String(n));const el=$('#movieVisitCount');if(el)el.textContent=String(n).padStart(2,'0')}catch{}
