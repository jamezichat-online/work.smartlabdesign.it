'use strict';
// Dataset dimostrativo. Nessun dato proviene dai sistemi del cliente.
const PERIODS={nov:'1–17 novembre 2026',oct:'1–17 ottobre 2026',dec:'1–17 dicembre 2026'};
const BASE=[
 {name:'Calabria',plan:[180,48,36],done:[178,45,35],extra:[9,4,3],closed:[8,4,3],response:[14,11,9],shifts:[70,30,20],covered:[70,29,20],hoursPlan:960,hours:952,people:12,substitutions:3,checks:40,nc:4,resolved:3,days:3.2,products:16,cam:15,detergent:86,disinfectant:32,paper:180,textile:24,emissions:[58,32],waste:[92,36,24,8,4],restock:16,verified:48,devices:50,tickets:2},
 {name:'Sardegna',plan:[204,54,42],done:[203,52,41],extra:[11,5,2],closed:[11,4,2],response:[12,10,8],shifts:[80,36,24],covered:[80,36,24],hoursPlan:1120,hours:1120,people:14,substitutions:2,checks:46,nc:3,resolved:3,days:2.6,products:18,cam:18,detergent:98,disinfectant:36,paper:210,textile:28,emissions:[66,38],waste:[108,42,28,9,5],restock:19,verified:59,devices:60,tickets:1},
 {name:'Sicilia',plan:[324,84,60],done:[320,80,57],extra:[17,7,5],closed:[16,6,4],response:[15,12,10],shifts:[120,60,40],covered:[119,59,40],hoursPlan:1760,hours:1744,people:22,substitutions:5,checks:68,nc:7,resolved:4,days:4.1,products:24,cam:23,detergent:154,disinfectant:58,paper:330,textile:44,emissions:[104,64],waste:[168,66,44,15,7],restock:28,verified:92,devices:95,tickets:3}
];
const BRANCHES = {
 Sicilia: [
  { id: 'palermo', name: 'Palermo', label: 'Palermo (filiale capo circoscrizione)' },
  { id: 'agrigento', name: 'Agrigento', label: 'Agrigento' },
  { id: 'catania', name: 'Catania', label: 'Catania' }
 ],
 Calabria: [
  { id: 'catanzaro', name: 'Catanzaro', label: 'Catanzaro' },
  { id: 'reggio-calabria', name: 'Reggio Calabria', label: 'Reggio Calabria' }
 ],
 Sardegna: [
  { id: 'cagliari', name: 'Cagliari', label: 'Cagliari' },
  { id: 'sassari', name: 'Sassari', label: 'Sassari' }
 ]
};

function branchRecord(base, branch, period) {
 let seed = 2166136261;
 for (const char of branch.id + ':' + period) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
 const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
 };
 const scale = 0.44 + random() * 0.35;
 const vary = value => Math.max(1, Math.round(value * scale * (0.84 + random() * 0.32)));
 const completed = value => Math.max(0, value - Math.round(value * random() * 0.09));
 const plan = base.plan.map(vary);
 const extra = base.extra.map(vary);
 const shifts = base.shifts.map(vary);
 const hoursPlan = vary(base.hoursPlan);
 const checks = vary(base.checks);
 const nc = Math.min(checks, vary(base.nc));
 const products = vary(base.products);
 const devices = vary(base.devices);
 return {
  name: branch.name, id: branch.id, region: base.name, plan, done: plan.map(completed),
  extra, closed: extra.map(value => Math.max(0, value - Math.round(random() * 2))),
  response: base.response.map(value => +(value * (0.75 + random() * 0.5)).toFixed(1)),
  shifts, covered: shifts.map(completed), hoursPlan, hours: completed(hoursPlan),
  people: vary(base.people), substitutions: vary(base.substitutions), checks, nc,
  resolved: Math.round(nc * (0.4 + random() * 0.6)), days: +(2 + random() * 3).toFixed(1),
  products, cam: completed(products), detergent: vary(base.detergent),
  disinfectant: vary(base.disinfectant), paper: vary(base.paper), textile: vary(base.textile),
  emissions: base.emissions.map(vary), waste: base.waste.map(vary), restock: vary(base.restock),
  verified: completed(devices), devices, tickets: vary(base.tickets)
 };
}

const DATA = Object.fromEntries(Object.keys(PERIODS).map(period => [
 period, period === 'dec' ? [] : BASE.flatMap(base =>
  BRANCHES[base.name].map(branch => branchRecord(base, branch, period)))
]));
const AREA=[
 {id:'canone',title:'Operazioni ordinarie',full:'Operazioni ordinarie',tabs:['Quotidiane','Periodiche','Ore di servizio'],intro:'Monitoraggio delle attività programmate di pulizia e sanificazione della filiale.'},
 {id:'extra',title:'Operazioni aggiuntive',full:'Operazioni aggiuntive',tabs:['Richieste','Plafond'],intro:'Richieste di prestazioni aggiuntive, approvazione e consuntivo.'},
 {"id":"urgent","title":"Pronto intervento","full":"Pronto intervento","tabs":["Interventi","Tempi"],"intro":"Interventi su richiesta e tempi distinti di presa in carico ed esecuzione."},
 {"id":"presence","title":"Presidio estemporaneo","full":"Presidio estemporaneo","tabs":["Richieste e ore","Turni"],"intro":"Presenza di addetti attivata su richiesta per le attività di pulizia della filiale."},
 {"id":"ancillary","title":"Prestazioni accessorie","full":"Prestazioni accessorie","tabs":["Prestazioni","Sorveglianza"],"intro":"Attività accessorie della filiale, stato di esecuzione e supervisione."},
 {id:'staff',title:'Personale e presenze',desc:'Copertura turni, sostituzioni, ore erogate e reperibilità dei referenti.',full:'Personale, presenze e copertura turni',tabs:['Copertura turni','Ore e presenze','Reperibilità'],intro:'Lettura aggregata di turni programmati, copertura effettiva e sostituzioni. I dati del prototipo sono aggregati per filiale e non contengono nominativi o presenze individuali.'},
 {id:'quality',title:'Qualità e verifiche',desc:'Check-list RIS/PRO, non conformità e avanzamento delle azioni correttive.',full:'Qualità, verifiche ispettive e non conformità',tabs:['Verifiche RIS','Verifiche PRO','Azioni correttive'],intro:'Controlli di risultato e di processo, rilievi NCQ/NCP, stato delle azioni correttive ed evidenze. Gli esiti seguenti sono esempi per la revisione del cruscotto.'},
 {id:'report',title:'Reporting direzionale',desc:'Indicatori, confronto territoriale e report per DEC e Struttura di Gestione.',full:'Reporting direzionale, KPI e andamento del servizio',tabs:['Indicatori','Dati della filiale','Report'],intro:'Sintesi degli indicatori operativi per DEC e Struttura di Gestione. Tutti i valori sono ricavati dallo stesso dataset delle schede di dettaglio.'},
 {id:'sustain',title:'Sostenibilità e CAM',desc:'Prodotti, consumi e impronta ambientale del servizio.',full:'Sostenibilità, CAM e consumi',tabs:['Prodotti e CAM','Consumi','Impronta ambientale'],intro:'Monitoraggio dei prodotti, delle evidenze ambientali e dei consumi. '},
 {id:'waste',title:'Rifiuti e dotazioni',desc:'Raccolta differenziata, materiali di consumo, dispenser e rifornimenti.',full:'Rifiuti, materiali di consumo e dotazioni igieniche',tabs:['Rifiuti','Materiali e dotazioni','Segnalazioni'],intro:'Tracciamento dei flussi di raccolta, dei rifornimenti e delle anomalie alle dotazioni igieniche. Le quantità e le segnalazioni mostrate sono esclusivamente dimostrative.'}
];
const state = { region: 'Sicilia', branch: 'palermo', period: 'nov', area: null, tab: 0 };
const $=s=>document.querySelector(s), sum=a=>a.reduce((s,v)=>s+v,0),fmt=(v,d=0)=>new Intl.NumberFormat('it-IT',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v),pct=(a,b)=>b?100*a/b:null,pc=(a,b)=>b?fmt(pct(a,b),1)+'%':'—',esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rows() {
 return DATA[state.period].filter(record => record.id === state.branch);
}

function currentBranch() {
 return BRANCHES[state.region].find(branch => branch.id === state.branch);
}

const regionSelect = $('#region-select');
const branchSelect = $('#branch-select');
for (const region of Object.keys(BRANCHES)) regionSelect.add(new Option(region, region));
regionSelect.value = state.region;

function populateBranches() {
 branchSelect.replaceChildren(...BRANCHES[state.region].map(branch => new Option(branch.name, branch.id)));
 branchSelect.value = state.branch;
}
populateBranches();

regionSelect.addEventListener('change', () => {
 state.region = regionSelect.value;
 state.branch = BRANCHES[state.region][0].id;
 populateBranches();
});
branchSelect.addEventListener('change', () => {
 state.branch = branchSelect.value;
});
function total(rs=rows()){
 const o={};['hoursPlan','hours','people','substitutions','checks','nc','resolved','products','cam','detergent','disinfectant','paper','textile','restock','verified','devices','tickets'].forEach(k=>o[k]=sum(rs.map(r=>r[k])));
 ['plan','done','extra','closed','shifts','covered','emissions','waste'].forEach(k=>o[k]=Array.from({length:k==='waste'?5: k==='emissions'?2:3},(_,i)=>sum(rs.map(r=>r[k][i]))));
 o.response=Array.from({length:3},(_,i)=>rs.length?sum(rs.map(r=>r.response[i]*r.extra[i]))/sum(rs.map(r=>r.extra[i])):0);
 o.open=o.nc-o.resolved;o.days=o.resolved?sum(rs.map(r=>r.days*r.resolved))/o.resolved:0;
 o.p=sum(o.plan);o.d=sum(o.done);o.requested=sum(o.extra);o.completed=sum(o.closed);o.s=sum(o.shifts);o.c=sum(o.covered);return o;
}
function metrics(items){return items.map(([v,label])=>`<div><span class="card-number">${v}</span><span class="card-label">${label}</span></div>`).join('')}
function status(text,kind='muted'){return `<span class="status ${kind}">${text}</span>`}
function progress(a,b){return `<div class="small-progress" aria-hidden="true"><span style="width:${b?Math.min(100,a/b*100):0}%"></span></div>`}
function table(headers,values,numeric=[]){return `<div class="table-scroll"><table><thead><tr>${headers.map((h,i)=>`<th scope="col" class="${numeric.includes(i)?'num':''}">${h}</th>`).join('')}</tr></thead><tbody>${values.map(row=>`<tr>${row.map((v,i)=>`<td class="${numeric.includes(i)?'num':''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function chart(labels,actual,planned=null,unit='',compact=false){
 const W=560,H=compact?120:210,left=45,right=12,top=10,bottom=31,plotW=W-left-right,plotH=H-top-bottom;
 const max=Math.max(...actual,...(planned||[]),1);const rough=max/3;const power=10**Math.floor(Math.log10(rough));const step=[1,2,5,10].find(n=>n*power>=rough)*power;const cap=Math.ceil((max*1.06)/step)*step;
 let parts=[];for(let v=0;v<=cap;v+=step){const y=top+plotH*(1-v/cap);parts.push(`<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}"/><text x="${left-10}" y="${y+4}" text-anchor="end">${fmt(v,v<1?1:0)}</text>`)}
 labels.forEach((l,i)=>{const slot=plotW/labels.length,cx=left+slot*(i+.5),bw=Math.min(40,slot*(planned?.24:.38));if(planned){let h=planned[i]/cap*plotH;parts.push(`<rect class="neutral-bar" x="${cx-bw-2}" y="${top+plotH-h}" width="${bw}" height="${h}"><title>${esc(l)}: pianificate ${fmt(planned[i])}${unit}</title></rect>`)}const h=actual[i]/cap*plotH;parts.push(`<rect class="bar" x="${planned?cx+2:cx-bw/2}" y="${top+plotH-h}" width="${bw}" height="${h}"><title>${esc(l)}: ${planned?'eseguite ':''}${fmt(actual[i])}${unit}</title></rect><text x="${cx}" y="${H-9}" text-anchor="middle">${esc(l)}</text>`)});
 return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(labels.map((l,i)=>l+': '+fmt(actual[i])+unit+(planned?' su '+fmt(planned[i])+unit+' pianificate':'')).join('; '))}">${parts.join('')}</svg>${planned?'<div class="legend"><span><i class="neutral"></i>Pianificate</span><span><i></i>Eseguite</span></div>':''}`;
}

const ICON_PATHS = {
 canone: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16m-12 5 2 2 4-4"/>',
 urgent: '<path d="m13 2-8 12h6l-1 8 9-12h-6z"/>',
 presence: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 ancillary: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9"/>',
 extra: '<path d="M8 5h12M8 12h12M8 19h12M4 3v4M2 5h4M4 12h.01M4 19h.01"/>',
 staff: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3"/>',
 quality: '<path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10z"/><path d="m9 12 2 2 4-4"/>',
 sustain: '<path d="M20 4c-9 0-14 4-14 10a4 4 0 0 0 4 4c6 0 10-5 10-14zM4 21c3-4 7-8 11-11"/>',
 waste: '<path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/>',
 report: '<path d="M4 20V4m0 16h16M8 16v-4m5 4V8m5 8v-4"/>',
 table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 14.5h16m-10-9v13"/>',
 chart: '<path d="M4 20V4m0 16h16M8 16v-4m5 4V8m5 8v-6"/>',
 circle: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
 calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 10h16"/>',
 branch: '<path d="M4 21h16M6 21V9l6-5 6 5v12m-9-7h.01m6 0h.01M11 21v-3h2v3"/>',
 arrow: '<path d="M6 18 18 6M8 6h10v10"/>',
 info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5m0-8h.01"/>'
};
function icon(name) {
 return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+ICON_PATHS[name]+'</svg>';
}

const CARD_META={
 canone:{image:0,tag:'Attività e pianificazione',description:'Consulta le pulizie e le sanificazioni quotidiane e periodiche, con piano di lavoro e avanzamento.'},
 extra:{image:1,tag:'Richieste e approvazioni',description:'Segui le operazioni aggiuntive dalla richiesta al consuntivo e consulta il plafond.'},
 urgent:{image:'urgent',tag:'Interventi su richiesta',description:'Consulta gli interventi urgenti e i tempi di presa in carico ed esecuzione.'},
 presence:{image:'presence',tag:'Presenza su richiesta',description:'Verifica i presidi attivati, le fasce di servizio e le ore erogate.'},
 ancillary:{image:'ancillary',tag:'Servizi di supporto',description:'Segui le prestazioni accessorie, dalle dotazioni alla sorveglianza con fiduciario.'},
 staff:{image:2,tag:'Persone e continuità',description:'Presenze, copertura dei turni, ore erogate e sostituzioni. Verifica la continuità operativa del servizio.'},
 quality:{image:3,tag:'Controlli e miglioramento',description:'Verifiche RIS/PRO, non conformità ed evidenze. Monitora rilievi, azioni correttive e tempi di ripristino.'},
 sustain:{image:4,tag:'Ambiente e risorse',description:'Prodotti, requisiti ambientali, consumi e impronta carbonica. Consulta gli indicatori di sostenibilità del servizio.'},
 waste:{image:5,tag:'Materiali e dotazioni',description:'Raccolta differenziata, rifornimenti e dotazioni igieniche. Tieni sotto controllo disponibilità, anomalie e sostituzioni.'},
 report:{image:6,tag:'Sintesi e decisioni',description:'Una lettura trasversale dell’andamento del servizio: indicatori, riepiloghi per filiale e report per il DEC e la Struttura di Gestione.'}
};
function render(){
 const groups = [
  ['#activity-cards', ['canone','urgent','presence','ancillary','extra']],
  ['#control-cards', ['staff','quality','sustain','waste']],
  ['#report-cards', ['report']]
 ];
 for (const [container, order] of groups) $(container).innerHTML=order.map(id=>{const ar=AREA.find(a=>a.id===id),m=CARD_META[id];return `<article class="card landing-card ${id==='report'?'report-card':''}" data-category="${id}"><div class="card-photo photo-${m.image}" role="img" aria-label="${esc(ar.title)}: immagine illustrativa del servizio"></div><div class="landing-card-body"><p class="card-topic">${icon(id)}<span>${m.tag}</span></p><h3>${ar.title}</h3><p class="card-description">${m.description}</p><button class="card-access" data-open="${id}" aria-label="Apri dashboard: ${ar.title}">Apri dashboard ${icon("arrow")}</button></div></article>`}).join('');
}
function modalFilters() {
 return `<div class="modal-filters"><div class="modal-branch">${icon("branch")}<div><span>Filiale operativa</span><strong>${esc(currentBranch().label)}</strong></div></div><label><span class="modal-period-label">${icon("calendar")} Periodo</span><select data-modal-period>${Object.entries(PERIODS).map(([key, label]) => `<option value="${key}" ${state.period === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div>`;
}
function modalStats(a,id){const op=operations(a); const by={
 urgent:[['Interventi richiesti',fmt(a.extra[2])],['Interventi chiusi',fmt(a.closed[2])],['Esecuzione media',fmt(op.urgentDuration,1)+' min']],
 presence:[['Presidi richiesti',fmt(a.shifts[2])],['Presidi coperti',fmt(a.covered[2])],['Ore erogate',fmt(op.presenceHours)+' h']],
 ancillary:[['Prestazioni eseguite',fmt(sum(op.ancillary.map(([,count])=>count)))],['Supervisioni svolte',fmt(sum(op.supervision.map(([,count])=>count)))],['Tipologie',fmt(op.ancillary.length)]],
 canone:[['Attività pianificate',fmt(a.p)],['Completamento',pc(a.d,a.p)],['Da completare',fmt(a.p-a.d)]],
 extra:[['Richieste ricevute',fmt(op.extraRequested)],['Approvate',fmt(op.extraApproved)],['Consuntivato',fmt(op.spent)+' €']],
 staff:[['Copertura turni',pc(a.c,a.s)],['Ore erogate',fmt(a.hours)+' h'],['Sostituzioni',fmt(a.substitutions)]],
 quality:[['Check-list eseguite',fmt(a.checks)],['Azioni aperte',fmt(a.open)],['Chiusura media',fmt(a.days,1)+' gg']],
 report:[['Completamento attività',pc(a.d,a.p)],['Copertura turni',pc(a.c,a.s)],['Controlli conformi',pc(a.checks-a.nc,a.checks)]],
 sustain:[['Prodotti verificati CAM',pc(a.cam,a.products)],['Detergenti',fmt(a.detergent)+' L'],['Emissioni · stima demo',fmt(sum(a.emissions))+' kg CO₂e']],
 waste:[['Rifornimenti',fmt(a.restock)],['Segnalazioni aperte',fmt(a.tickets)],['Dotazioni verificate',pc(a.verified,a.devices)]]};return by[id].map(([label,value],index)=>`<div class="modal-stat"><div class="stat-label">${icon([id,'chart','circle'][index])}<span>${label}</span></div><strong>${value}</strong></div>`).join('')}
function operations(a) {
 const supervision = [['Ordinarie',Math.round(a.d/21)],['Pronto intervento',Math.floor(a.closed[2]/3)],['Aggiuntive',Math.floor(a.closed[0]/2)]];
 const extraRequested = a.extra[0] + a.extra[1];
 const extraClosed = a.closed[0] + a.closed[1];
 const spent = a.closed[0] * 165 + a.closed[1] * 225;
 return {
  urgentDuration: Math.round((a.response[2] * 1.45 + 6) * 10) / 10,
  presenceHoursPlanned: a.shifts[2] * 4, presenceHours: a.covered[2] * 4,
  extraRequested, extraClosed, extraApproved: Math.floor((extraRequested + extraClosed) / 2),
  spent, budget: extraRequested * 250 + 900, supervision,
  ancillary: [
   ['Raccolta e conferimento rifiuti',Math.round(a.d/8)], ['Dotazioni igieniche',a.verified],
   ['Distributori no touch',Math.round(a.restock/2)], ['Fornitura di beni di consumo',a.restock],
   ['Gestione tende',Math.round(a.people/3)], ['Sorveglianza con fiduciario',sum(supervision.map(([,count])=>count))],
   ['Rimozione guano e carcasse',Math.floor(a.tickets/2)]
  ]
 };
}

function horizontalBars(items, unit = '', decimals = 0, limit = Math.max(1,...items.map(([,value])=>value))) {
 return '<ul class="horizontal-chart">' + items.map(([label,value]) =>
  '<li><span>'+esc(label)+'</span><strong>'+fmt(value,decimals)+(unit?' '+unit:'')+'</strong>' +
  '<div class="horizontal-track" aria-hidden="true"><span style="width:'+Math.min(100,value/limit*100)+'%"></span></div></li>'
 ).join('') + '</ul>';
}

function donut(items, unit = '') {
 const total = sum(items.map(([,value])=>value));
 const ratio = total ? items[0][1]/total : 0;
 return '<figure class="donut-chart"><div class="donut-ring" style="--share:'+ratio*360+'deg" aria-hidden="true"><span>'+fmt(total)+(unit?'<small>'+esc(unit)+'</small>':'')+'</span></div>' +
  '<figcaption><ul aria-label="Totale '+fmt(total)+(unit?' '+esc(unit):'')+'">' + items.map(([label,value])=>
   '<li><i aria-hidden="true"></i><span>'+esc(label)+'</span><strong>'+fmt(value)+(unit?' '+esc(unit):'')+'</strong></li>'
  ).join('')+'</ul></figcaption></figure>';
}

function panel(title, body, note = '') {
 const chartType = body.includes('class="donut-chart"') ? 'ring'
  : body.includes('class="horizontal-chart"') || body.includes('class="chart"') ? 'chart' : '';
 const isTable = body.startsWith('<div class="table-scroll">');
 const columns = (body.match(/<th\s/g) || []).length;
 const tableClass = isTable && columns <= 3 ? ' data-compact' : '';
 const panelClass = chartType ? ' visual-panel visual-' + chartType : tableClass;
 return `<section class="detail-section${panelClass}"><h3>${icon(chartType ? 'chart' : isTable ? 'table' : 'info')}<span>${title}</span></h3>${body}${note ? `<p class="chart-caption">${note}</p>` : ''}</section>`;
}
function insight(text) {
 return `<div class="insight">${icon('info')}<div><strong>Lettura del dato</strong><p>${text}</p></div></div>`;
}
function detailContent(id,tab,a){const rs=rows(); const op=operations(a);
 switch(id){
 case 'canone': {
  const label = tab === 0 ? 'Quotidiane' : 'Periodiche';
  if (tab === 2) return panel('Ore di servizio', horizontalBars([['Pianificate',a.hoursPlan],['Erogate',a.hours]], 'h'));
  const planned = tab === 0 ? a.plan[0] + a.plan[2] : a.plan[1];
  const done = tab === 0 ? a.done[0] + a.done[2] : a.done[1];
  return panel(label + ' · avanzamento', donut([['Eseguite',done],['Da completare',planned-done]]))
   + panel('Piano delle attività', table(['Categoria','Pianificate','Eseguite'],[[label,fmt(planned),fmt(done)]],[1,2]))
   + panel('Ambiti operativi','<p class="chart-caption">Pulizia, disinfezione, disinfestazione, derattizzazione e deblattizzazione.</p>');
 }
 case 'urgent':
  if (tab === 1) return panel('Tempi medi per fase',horizontalBars([['Presa in carico',a.response[2]],['Esecuzione',op.urgentDuration]],'min',1));
  return panel('Stato degli interventi',donut([['Chiusi',a.closed[2]],['Aperti',a.extra[2]-a.closed[2]]]))
   + panel('Riepilogo interventi',table(['Richiesti','Chiusi','Aperti'],[[fmt(a.extra[2]),fmt(a.closed[2]),fmt(a.extra[2]-a.closed[2])]],[0,1,2]));
 case 'presence':
  if (tab === 1) return panel('Copertura dei presidi',donut([['Coperti',a.covered[2]],['Da coprire',a.shifts[2]-a.covered[2]]]));
  return panel('Ore di presidio estemporaneo',horizontalBars([['Richieste',op.presenceHoursPlanned],['Erogate',op.presenceHours]],'h'))
   + panel('Richieste di presidio',table(['Presidi richiesti','Presidi coperti'],[[fmt(a.shifts[2]),fmt(a.covered[2])]],[0,1]));
 case 'ancillary': {
  if (tab === 1) return panel('Sorveglianza con fiduciario',table(['Ambito supervisionato','Prestazioni'],op.supervision.map(([name,count])=>[name,fmt(count)]),[1]))
   + insight('La supervisione è conteggiata tra le prestazioni accessorie. Le operazioni supervisionate restano nel rispettivo ambito.');
  return panel('Prestazioni eseguite per tipologia',horizontalBars(op.ancillary))
   + panel('Dettaglio delle prestazioni',table(['Tipologia','Eseguite'],op.ancillary.map(([name,count])=>[name,fmt(count)]),[1]));
 }
 case 'extra':
  if (tab === 1) return panel('Utilizzo del plafond dimostrativo',donut([['Consuntivato',op.spent],['Disponibile',op.budget-op.spent]],'€'))
   + panel('Riepilogo economico',table(['Plafond','Consuntivato','Disponibile'],[[fmt(op.budget)+' €',fmt(op.spent)+' €',fmt(op.budget-op.spent)+' €']],[0,1,2]));
  return panel('Avanzamento delle richieste',horizontalBars([['Da approvare',op.extraRequested-op.extraApproved],['Approvate da chiudere',op.extraApproved-op.extraClosed],['Chiuse',op.extraClosed]]))
   + panel('Flusso della richiesta','<div class="flow"><span>Richiesta</span><span>Approvazione</span><span>Esecuzione</span><span>Consuntivo</span></div>');
 case 'staff':
 if(tab===0)return panel('Turni programmati e coperti',chart(['Mattina','Pomeriggio','Presidio'],a.covered,a.shifts))+panel('Dettaglio della copertura',table(['Fascia · esempio','Programmati','Coperti','Copertura'],['Mattina','Pomeriggio','Presidio'].map((n,i)=>[n,fmt(a.shifts[i]),fmt(a.covered[i]),pc(a.covered[i],a.shifts[i])]),[1,2,3]));
 if(tab===1)return panel('Ore e sostituzioni',table(['Filiale','Addetti','Ore erogate','Sostituzioni'],rs.map(r=>[r.name,fmt(r.people),fmt(r.hours),fmt(r.substitutions)]),[1,2,3]))+panel('Presenze e continuità',chart(rs.map(r=>r.name),rs.map(r=>r.hours),rs.map(r=>r.hoursPlan),' h'))+insight('La versione di riferimento cita INAZ Iterm. Questa anteprima non è collegata a INAZ o ad altri sistemi di rilevazione presenze.');
 return panel('Reperibilità e responsabilità locali',table(['Filiale','Responsabile locale','Recapito di servizio','Stato'],rs.map(r=>[r.name,'Da assegnare','Da configurare','Non configurato'])))+insight('Nominativi, recapiti e finestre di reperibilità devono essere forniti e autorizzati. Non sono stati inventati riferimenti personali.');
 case 'quality':
 if(tab<2){const ris=tab===0;return panel(ris?'Check-list di risultato (RIS)':'Check-list di processo (PRO)',table(['Ambito','Parametro di verifica','Evidenza'],(ris?[
 ['Pavimenti','Assenza di sporco diffuso e macchie'],['Arredi e superfici','Assenza di polvere e impronte'],['Superfici di contatto','Pulizia di maniglie e pulsanti'],['Vetri e infissi','Assenza di impronte e aloni'],['Servizi igienici','Pulizia e asciugatura di sanitari e lavabi'],['Dotazioni igieniche','Presenza di carta, sapone e asciugamani']]:[
 ['Piano di lavoro','Rispetto di sequenze e frequenze'],['Prodotti','Corretta diluizione e schede tecniche'],['Attrezzature','Manutenzione e idoneità all’uso'],['Sicurezza','DPI, procedure e formazione'],['Sanificazione','Tracciamento delle operazioni e dei prodotti']]).map(r=>[...r,'Nessun allegato nel prototipo'])))+panel('Controlli per filiale',table(['Filiale','Controlli','Rilievi','Conformi'],rs.map(r=>[r.name,fmt(r.checks),fmt(r.nc),pc(r.checks-r.nc,r.checks)]),[1,2,3]))+insight('Il registro definitivo deve collegare ogni esito all’ambiente controllato, alla data, all’auditor e all’evidenza fotografica o documentale. Gli allegati non sono simulati.');}
 return panel('Avanzamento delle azioni correttive',donut([['Chiuse',a.resolved],['Aperte',a.open]]))+panel('Rilievi e risoluzioni',table(['Filiale','Rilevati','Chiusi','Aperti','Chiusura media'],rs.map(r=>[r.name,fmt(r.nc),fmt(r.resolved),fmt(r.nc-r.resolved),fmt(r.days,1)+' gg']),[1,2,3,4]))+'<div class="flow"><span>Verifica</span><span>Rilievo NCQ/NCP</span><span>Presa in carico</span><span>Trattamento</span><span>Chiusura</span><span>Storico</span></div>'+insight('NCQ e NCP restano classificazioni del registro da configurare sul piano di controllo approvato.');
 case 'report':
 if(tab===0)return panel('Quadro degli indicatori',table(['Indicatore','Consuntivo','Base di calcolo'],[
 ['Completamento attività',pc(a.d,a.p),`${fmt(a.d)} / ${fmt(a.p)} attività`],['Copertura turni',pc(a.c,a.s),`${fmt(a.c)} / ${fmt(a.s)} turni`],['Controlli conformi',pc(a.checks-a.nc,a.checks),`${fmt(a.checks-a.nc)} / ${fmt(a.checks)} controlli`],['Pronto intervento: chiusi',pc(a.closed[2],a.extra[2]),`${fmt(a.closed[2])} / ${fmt(a.extra[2])} richieste`],['Ore di presidio erogate',fmt(op.presenceHours)+' h',fmt(op.presenceHoursPlanned)+' h richieste'],['Prestazioni accessorie',fmt(sum(op.ancillary.map(([,count])=>count))), '7 tipologie'],['Plafond aggiuntive utilizzato',pc(op.spent,op.budget),fmt(op.spent)+' € su '+fmt(op.budget)+' €'],['Prodotti verificati CAM',pc(a.cam,a.products),`${fmt(a.cam)} / ${fmt(a.products)} prodotti`],['Dotazioni verificate',pc(a.verified,a.devices),`${fmt(a.verified)} / ${fmt(a.devices)} dotazioni`]], [1]));
 if(tab===1)return panel('Completamento delle prestazioni per filiale',horizontalBars([['Completamento attività',pct(a.d,a.p)],['Copertura turni',pct(a.c,a.s)],['Controlli conformi',pct(a.checks-a.nc,a.checks)]],'%',1,100))+panel('Riepilogo della filiale',table(['Filiale','Attività eseguite','Completamento','Ore','Azioni aperte'],rs.map(r=>[r.name,fmt(sum(r.done)),pc(sum(r.done),sum(r.plan)),fmt(r.hours),fmt(r.nc-r.resolved)]),[1,2,3,4]));
 return panel('Report consultabili', '<p class="modal-intro">Esporta il consuntivo dimostrativo relativo ai filtri correnti oppure apri la versione stampabile del dettaglio.</p><button class="button" data-print>Stampa / Salva PDF <span aria-hidden="true">↗</span></button>')+panel('Ambiti inclusi',table(['Report','Contenuto','Destinatari'],[['Consuntivo del servizio','Attività, ore e copertura','DEC / Struttura di Gestione'],['Qualità e azioni correttive','Verifiche RIS/PRO e NCQ/NCP','DEC / Struttura di Gestione'],['Monitoraggio ambientale','CAM, consumi, emissioni e rifiuti','DEC / Struttura di Gestione']]))+insight('L’esportazione CSV genera un file locale dai dati visualizzati. Non esistono invii automatici, archivi remoti o report firmati in questa anteprima.');
 case 'sustain':
 if(tab===0)return panel('Verifiche documentali sui prodotti',chart(rs.map(r=>r.name),rs.map(r=>r.cam),rs.map(r=>r.products)))+panel('Prodotti e documentazione',table(['Filiale','Prodotti','Verificati CAM','Da verificare'],rs.map(r=>[r.name,fmt(r.products),fmt(r.cam),fmt(r.products-r.cam)]),[1,2,3]))+insight('“Verificato CAM” è un campo dimostrativo. Certificazioni, Ecolabel UE, FSC ed evidenze devono essere comprovati dai documenti dei prodotti effettivamente impiegati.');
 if(tab===1)return panel('Consumi distinti per unità',table(['Categoria','Consumo','Unità','Documento'],[['Detergenti',fmt(a.detergent),'L','Schede tecniche da acquisire'],['Disinfettanti',fmt(a.disinfectant),'L','Schede tecniche da acquisire'],['Carta igienica',fmt(a.paper),'rotoli','Forniture da registrare'],['Tessili lavabili',fmt(a.textile),'kg','Cicli e quantità da registrare']], [1]))+insight('Litri, chilogrammi e rotoli non vengono sommati o rappresentati sullo stesso asse. Imballaggi e macchinari restano categorie da integrare con il registro effettivo.');
 return panel('Ripartizione delle emissioni dimostrative',donut([['Prodotti',a.emissions[0]],['Trasporti',a.emissions[1]]],'kg CO₂e'))+panel('Stima per filiale',table(['Filiale','Prodotti (kg CO₂e)','Trasporti (kg CO₂e)','Totale (kg CO₂e)'],rs.map(r=>[r.name,...r.emissions.map(v=>fmt(v)),fmt(sum(r.emissions))]),[1,2,3]))+insight('I valori di CO₂e sono un dataset sintetico per dimostrare l’interfaccia, non una valutazione LCA. Per l’uso operativo servono perimetro, fattori emissivi, fonti e metodologia approvati.');
 case 'waste':
 if(tab===0)return panel('Quantità raccolte per frazione',chart(['Carta','Imball.','Organico','Residuo','Altri'],a.waste,'',' kg'))+panel('Registro delle frazioni · esempio',table(['Frazione','Quantità (kg)','Tracciamento'],['Carta','Plastica, vetro e metalli','Organico','Indifferenziato','Toner, pile e assorbenti'].map((n,i)=>[n,fmt(a.waste[i]),'Conferimenti da documentare']),[1]))+insight('Il raggruppamento “Altri” è solo grafico. Toner, pile e assorbenti richiedono registrazioni distinte nel sistema operativo e non si assumono intercambiabili.');
 if(tab===1)return panel('Stato delle dotazioni per filiale',table(['Filiale','Verificate','Totali','Rifornimenti'],rs.map(r=>[r.name,fmt(r.verified),fmt(r.devices),fmt(r.restock)]),[1,2,3]))+panel('Materiali e controlli previsti',table(['Dotazione','Controllo','Inventario'],[['Carta igienica','Scorta e reintegro','Da acquisire'],['Sapone / igienizzante','Scorta e integrità dispenser','Da acquisire'],['Asciugamani carta','Scorta e reintegro','Da acquisire'],['Dispenser','Guasti, sostituzioni e ripristino','Da acquisire']]))+insight('Le quantità disponibili a magazzino e le prossime date di rifornimento non sono state fornite e non vengono inventate.');
 return panel('Segnalazioni aperte per territorio',chart(rs.map(r=>r.name),rs.map(r=>r.tickets)))+panel('Coda delle anomalie · dati aggregati',table(['Filiale','Segnalazioni aperte','Dettaglio operativo'],rs.map(r=>[r.name,fmt(r.tickets),'Ticket individuali da collegare']),[1]))+insight('Il registro definitivo conterrà tipologia del guasto, stabile, ambiente, priorità, presa in carico, intervento e chiusura. Non sono presenti ticket reali nella demo.');
 }
}
function openArea(id){state.area=id;state.tab=0;renderModal();openDialog($('#detail'))}
function renderModal(){const ar=AREA.find(x=>x.id===state.area),a=total(),empty=!rows().length;$('#modal-title').textContent=ar.full;const group = ar.id === 'report' ? 'Reporting' : ['staff','quality','sustain','waste'].includes(ar.id) ? 'Controllo' : 'Attività';
 $('#modal-area-icon').innerHTML=icon(ar.id);
 $('#modal-scope').textContent=group+' · Lotto 2 · '+state.region;$('#export').hidden=empty;
 $('#modal-body').innerHTML=`<div class="modal-overview">${modalFilters()}<p class="modal-intro">${ar.intro}</p></div>${empty?'<div class="empty"><strong>Nessun dato nel periodo selezionato</strong>Seleziona ottobre o novembre 2026 per esplorare il dataset dimostrativo.</div>':`<div class="modal-stats">${modalStats(a,ar.id)}</div><div class="modal-tabs" role="tablist" aria-label="Dettaglio ${ar.title}">${ar.tabs.map((t,i)=>`<button id="tab-${i}" role="tab" aria-selected="${i===state.tab}" tabindex="${i===state.tab?'0':'-1'}" aria-controls="tab-content" data-tab="${i}">${t}</button>`).join('')}</div><div id="tab-content" class="modal-panel-grid" role="tabpanel" aria-labelledby="tab-${state.tab}" tabindex="0">${detailContent(ar.id,state.tab,a)}</div>`}`;
}
function exportCsv(){const rs=rows();const headers=['Periodo','Regione','Filiale','Pianificate','Eseguite','Ore pianificate','Ore erogate','Turni programmati','Turni coperti','Controlli','Rilievi','Azioni chiuse','Azioni aperte','Richieste extra','Interventi chiusi','Prodotti','Prodotti verificati CAM','Detergenti L','Disinfettanti L','Carta rotoli','Tessili kg','CO2e kg demo','Rifiuti kg','Rifornimenti','Dotazioni verificate','Dotazioni totali','Segnalazioni aperte'];const lines=[['DATI DIMOSTRATIVI - NON DATI OPERATIVI BANCA D’ITALIA'],headers,...rs.map(r=>[PERIODS[state.period],r.region,r.name,sum(r.plan),sum(r.done),r.hoursPlan,r.hours,sum(r.shifts),sum(r.covered),r.checks,r.nc,r.resolved,r.nc-r.resolved,sum(r.extra),sum(r.closed),r.products,r.cam,r.detergent,r.disinfectant,r.paper,r.textile,sum(r.emissions),sum(r.waste),r.restock,r.verified,r.devices,r.tickets])];const csv='\uFEFF'+lines.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`BI-LogiControl_Lotto2_DEMO_${state.period}_${state.branch}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Esportazione CSV dei dati dimostrativi completata.')}
let toastTimer;function notify(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500)}
document.addEventListener('click', event => {
 const open = event.target.closest('[data-open]');
 const tab = event.target.closest('[data-tab]');
 if (open) openArea(open.dataset.open);
 if (tab) {
  state.tab = Number(tab.dataset.tab);
  renderModal();
  $('#tab-' + state.tab).focus();
 }
 if (event.target.closest('[data-print]')) window.print();
});
$('#detail').addEventListener('change', event => {
 if (!event.target.matches('[data-modal-period]')) return;
 state.period = event.target.value;
 renderModal();
 $('[data-modal-period]').focus();
});
$('#detail .close').addEventListener('click', () => $('#detail').close());
$('#export').addEventListener('click', exportCsv);

const detailDialog = $('#detail');
const accessDialog = $('#access-dialog');
const dialogPositions = new WeakMap();

function openDialog(dialog) {
 if (dialog.open) return;
 const position = { x: window.scrollX, y: window.scrollY };
 dialogPositions.set(dialog, position);
 document.body.style.setProperty('--modal-scroll-top', '-' + position.y + 'px');
 document.documentElement.classList.add('modal-scroll-lock');
 try {
  dialog.showModal();
 } catch (error) {
  restorePageScroll(dialog);
  throw error;
 }
 dialog.querySelector('[autofocus]').focus({ preventScroll: true });
}

function restorePageScroll(dialog) {
 const position = dialogPositions.get(dialog);
 if (!position || dialog.open) return;
 dialogPositions.delete(dialog);
 document.documentElement.classList.remove('modal-scroll-lock');
 document.body.style.removeProperty('--modal-scroll-top');
 window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
}

for (const dialog of [detailDialog, accessDialog]) {
 dialog.addEventListener('close', () => restorePageScroll(dialog));
}

const accessForm = $('#access-form');
const accessStatus = $('#access-status');
$('#open-access').addEventListener('click', () => {
 accessForm.reset();
 accessStatus.hidden = true;
 openDialog(accessDialog);
});
$('#close-access').addEventListener('click', () => accessDialog.close());
accessDialog.addEventListener('close', () => accessForm.reset());
accessForm.addEventListener('input', () => { accessStatus.hidden = true; });
accessForm.addEventListener('submit', event => {
 event.preventDefault();
 accessForm.reset();
 accessStatus.textContent = 'Accesso non disponibile.';
 accessStatus.hidden = false;
});
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=$('#detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#detail').close()}});
$('#detail').addEventListener('keydown',e=>{if(e.target.matches('[role=tab]')&&['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const count=AREA.find(area=>area.id===state.area).tabs.length;state.tab=e.key==='Home'?0:e.key==='End'?count-1:(state.tab+(e.key==='ArrowRight'?1:count-1))%count;renderModal();$('#tab-'+state.tab).focus()}});
for(const [period,rs]of Object.entries(DATA))for(const r of rs){console.assert(sum(r.done)<=sum(r.plan),'Completamenti incoerenti',period,r.name);console.assert(r.resolved<=r.nc&&r.nc<=r.checks,'Controlli incoerenti',period,r.name);console.assert(sum(r.covered)<=sum(r.shifts),'Copertura incoerente',period,r.name);console.assert(sum(r.closed)<=sum(r.extra),'Interventi incoerenti',period,r.name);console.assert(r.cam<=r.products&&r.verified<=r.devices,'Verifiche incoerenti',period,r.name)}
render();
