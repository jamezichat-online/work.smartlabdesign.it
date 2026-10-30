paths.prev='M17 7 7 17M7 7v10h10';
polishIcons();
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const targetButton=document.querySelector('.target-pause');targetButton.onclick=()=>{const p=document.querySelector('.workspace-panel').classList.toggle('target-stopped');targetButton.setAttribute('aria-pressed',String(p));targetButton.setAttribute('aria-label',p?'Riprendi il bersaglio':'Metti in pausa il bersaglio');targetButton.innerHTML=icon(p?'play':'pause')};
const colors=['#008c45','#ffffff','#cd212a'];let siteIndex=0,sitePaused=reduced.matches;
const deck=document.getElementById('site-deck'),counter=document.getElementById('site-counter'),pause=document.getElementById('site-pause');

deck.innerHTML=sites.map((s,i)=>`<article class="site-sheet" data-seat="${i}" style="--sheet-color:${colors[i%colors.length]};--sheet-ink:${i%colors.length===1?'#008c45':'#ffffff'}"><span class="sheet-label">SEDE CDP</span><h3>${s[0]}</h3><strong>${s[2]?fmt(s[2]):'n.d.'}</strong><small>${s[2]?'metri quadri':'Superficie non disponibile'}</small></article>`).join('');
function renderDeck(manual=false){deck.querySelectorAll('.site-sheet').forEach((el,i)=>{let offset=(i-siteIndex+sites.length)%sites.length;if(offset>sites.length/2)offset-=sites.length;el.dataset.position=offset>=-2&&offset<=2?String(offset):'hidden';el.setAttribute('aria-hidden',String(offset!==0))});counter.setAttribute('aria-live',manual?'polite':'off');counter.textContent=`${siteIndex+1} / ${sites.length}`;pause.innerHTML=icon(sitePaused?'play':'pause');pause.setAttribute('aria-label',sitePaused?'Riprendi le schede sedi':'Metti in pausa le schede sedi');pause.setAttribute('aria-pressed',String(sitePaused))}
function step(n,manual){siteIndex=(siteIndex+n+sites.length)%sites.length;renderDeck(manual)}
document.getElementById('site-prev').onclick=()=>{sitePaused=true;step(-1,true)};document.getElementById('site-next').onclick=()=>{sitePaused=true;step(1,true)};pause.onclick=()=>{sitePaused=!sitePaused;renderDeck(true)};
let inView=false;new IntersectionObserver(e=>inView=e[0].isIntersecting,{threshold:.2}).observe(deck);setInterval(()=>{if(!sitePaused&&!document.hidden&&inView&&!document.querySelector('.site-carousel:hover')&&!document.querySelector('.site-carousel:focus-within'))step(1,false)},4500);reduced.addEventListener('change',e=>{if(e.matches){sitePaused=true;renderDeck()}});renderDeck();
function syncIntroBackground(){const hero=document.querySelector('.hero');document.body.style.setProperty('--hero-background-height',Math.ceil(hero.getBoundingClientRect().bottom+window.scrollY)+'px')}
new ResizeObserver(syncIntroBackground).observe(document.querySelector('.hero'));window.addEventListener('resize',syncIntroBackground);syncIntroBackground();
