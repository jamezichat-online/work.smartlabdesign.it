/* CWE-06 operational storytelling; semantic content remains independent. */
(()=>{
const stages=[['Richieste','extra','file','Interventi e segnalazioni'],['Pianificazione','services','calendar','Programma e sedi'],['Risorse','staff','people','Operatori e copertura'],['Esecuzione','daily','spark','Attività del servizio'],['Controllo','quality','shield','Qualità e conformità'],['Report','reports','file','Verifiche e verbali']];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const timeline={segments:[{type:'range',start:0,end:1,frames:[0,100]}]};
let observer,raf;
function enhance(){const main=document.querySelector('main');if(!main||main.querySelector('.process-nav'))return;const home=!document.body.classList.contains('dashboard');if(home)return;const current=location.hash.slice(1)||'home';let nav=document.createElement('nav');nav.className='process-nav';nav.setAttribute('aria-label','Percorso operativo del servizio');nav.innerHTML=stages.map(([label,key,symbol,desc],i)=>`<a href="#${key}" class="process-step ${key===current?'is-current':''}" ${key===current?'aria-current="page"':''}><span class="process-symbol">${icon(symbol)}</span><span><strong>${label}</strong><small>${desc}</small></span><span class="process-arrow" aria-hidden="true">›</span></a>`).join('');if(home){main.querySelector('.home-content')?.prepend(nav)}else{main.querySelector('.page-title')?.after(nav)}
const root=home?main.querySelector('.home-content'):main;root?.classList.add('cwe-surface');
main.querySelectorAll('.activity-card,.info-card,.panel,.kpi').forEach((el,i)=>{el.style.setProperty('--entry-delay',`${Math.min(i%5,4)*35}ms`);el.classList.add('cwe-enter')});
main.querySelectorAll('.table-wrap').forEach(el=>{el.tabIndex=0;el.setAttribute('role','region');el.setAttribute('aria-label',el.closest('.panel')?.querySelector('h2')?.textContent||'Registro scorrevole')});
main.querySelectorAll('.status').forEach(el=>{el.insertAdjacentHTML('afterbegin','<i class="status-dot" aria-hidden="true"></i>')});
if(!reduced.matches)main.animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});}
observer=new MutationObserver(()=>enhance());observer.observe(document.querySelector('main'),{childList:true});enhance();
})();
