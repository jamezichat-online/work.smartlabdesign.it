window.RAS_DATA = (() => {
  const lots = [
    {id:'4', name:'Lotto 4', surface:409366.02, entities:[
      {id:'asl7',name:'ASL 7 Sulcis',surface:140087.88,risk:[10124.20,27318.20,7354.96,25974.21,69316.31]},
      {id:'asl8',name:'ASL 8 Cagliari',surface:250244.31,risk:[22232.34,53984.91,17067.19,43595.21,113364.66]},
      {id:'ares-ca',name:'ARES Cagliari',surface:9907.92,risk:[0,0,0,4707.92,5200]},
      {id:'areus-sc',name:'AREUS Sulcis-Cagliari',surface:9125.91,risk:[0,2138.80,1215.47,1841.20,3930.44]}
    ]},
    {id:'5', name:'Lotto 5', surface:221160, entities:[{id:'brotzu',name:'AO Brotzu',surface:221160,risk:[15055,43830,12415,42790,107070],note:'I mq del blocco operatorio non rientrano nel canone €/mq/mese: la pulizia e sanificazione è ricompresa nel presidio sostitutivo.'}]},
    {id:'6', name:'Lotto 6', surface:140100, entities:[{id:'aou-ca',name:'AOU Cagliari',surface:140100,risk:[9600,23500,9000,23000,75000]}]},
    {id:'7', name:'Lotto 7', surface:242166.24, entities:[{id:'aou-ss',name:'AOU Sassari',surface:242166.24,risk:[11611.24,16555,34200,66800,113000]}]}
  ];

  const products = [
    ['P1','Tea','ÈCOSÌ','Ordinario','detergente multiuso autoasciugante','Superfici dure e vetri','EPD, CFP, PSV, Ecolabel','IT/020/011','100%','assente','pronto all’uso','Consente di detergere e spolverare le superfici rallentando l’insediamento della polvere grazie alle proprietà antistatiche.'],
    ['P2','Brixen','ÈCOSÌ','Ordinario','detergente sgrassante','Superfici dure e cucine','EPD, CFP, PSV, Ecolabel','IT/020/011','100%','assente','pronto all’uso','Detergente sgrassante per superfici dure generiche e di cucina; efficace su piani di lavoro e attrezzature in acciaio.'],
    ['P3','Ultra Blue','ÈCOSÌ','Ordinario','detergente superconcentrato multiuso','Superfici lavabili e vetri','EPD, CFP, PSV, Ecolabel','IT/020/011','100%','assente','40 ml / 750 ml','Detergente superconcentrato per superfici lavabili quali arredi, porte e mobili; riduce i consumi di prodotto.'],
    ['P4','Ultra Yellow','ÈCOSÌ','Ordinario','detergente superconcentrato sgrassante','Pavimenti e superfici lavabili','EPD, CFP, PSV, Ecolabel','IT/020/011','100%','assente','40 ml / 750 ml','Azione sgrassante per attrezzature, piani di lavoro, arredi e pavimenti ad alto calpestio.'],
    ['P5','Tulip','ÈCOSÌ','Ordinario','detergente anticalcare disincrostante','Bagni e sanitari','EPD, CFP, PSV, Ecolabel','IT/020/011','100%','assente','pronto all’uso','Detergente acido per bagni e sanitari; la schiumosità favorisce l’aderenza alle superfici verticali.'],
    ['P6','Ultra Red','ÈCOSÌ','Ordinario','detergente acido superconcentrato','Superfici dure e bagni','EPD, CFP, PSV, Ecolabel','IT/020/011','100%','assente','40 ml / 750 ml','Detergente superconcentrato per rimuovere calcare e sporco; non aggredisce metalli e superfici dure.'],
    ['P7','Ultra Green','ÈCOSÌ','Periodico','detergente manutentore multiuso','Pavimenti e superfici lavabili','EPD, CFP, PSV, Ecolabel','IT/020/011','100%','assente','0,8 ml / 1 l','Detergente superconcentrato per manutenzione ordinaria; non necessita risciacquo.'],
    ['P8','TANET Karacho','Green Care','Periodico','detergente senza tensioattivi','Superfici tessili','Cradle to Cradle, Ecolabel','DE/020/385','>80%','assente','2,5–7,5 ml / 1 l','Privo di tensioattivi, enzimi e sbiancanti ottici; adatto a tappeti, tessili e mobili imbottiti.'],
    ['P9','Eco Wax','Sutter','Periodico','emulsione polimerica superbrillante','Pavimenti','PSV, Umweltzeichen','UW-1407','>80%','assente','pronto all’uso','Emulsione ecologica per pavimenti incerabili, resilienti in PVC, linoleum, gomma e pavimenti duri.'],
    ['P10','Eco Stripper','Sutter','Straordinario','decerante senza risciacquo','Pavimenti','PSV, Umweltzeichen','UW-1407','>80%','assente','10%','Decerante per la rapida rimozione di strati di cera acrilico metallizzata e stratificazioni persistenti.'],
    ['P11','Deornet Clor','ÈCOSÌ','Disinfettante','detergente disinfettante sgrassante cloroattivo','Pavimenti, rivestimenti, sanitari, acciaio e spogliatoi','EPD, CFP, PSV, PMC','',null,'tipico','1–100%','Ipoclorito di sodio, 16–18% cloro attivo. Azione battericida, micobattericida, fungicida, sporicida e virucida.','19805'],
    ['P12','RifraxSan','ÈCOSÌ','Disinfettante','detergente disinfettante','Superfici lavabili','EPD, CFP, PSV, PMC','',null,'agrumato alcolico','pronto all’uso','Soluzione etanolo 3–5%. Detergente autoasciugante per il controllo di batteri, micobatteri, funghi, spore e virus.','19435'],
    ['P13','Perox','ÈCOSÌ','Disinfettante','disinfettante per ambienti a rischio','Utensili e superfici verticali e orizzontali','EPD, CFP, PMC','',null,'tipico','1–100%','Perossido di idrogeno al 50%. Disinfezione mediante nebulizzatore; azione battericida, fungicida, virucida e micobattericida.','19829'],
    ['P14','EtilSan','ÈCOSÌ','Disinfettante','disinfettante mani','Mani','CFP, PMC','',null,'alcolico','pronto all’uso','Disinfettante mani a base idroalcolica, attivo contro batteri Gram+, Gram-, funghi e virus.','20603'],
    ['P15','Sanispray','Marka','Disinfettante','disinfettante alcolico','Superfici verticali e orizzontali','PMC','',null,'leggermente alcolico','pronto all’uso','Soluzione etanolo >70%, ad azione virucida, battericida e fungicida per superfici.','20677']
  ].map((p,i)=>({id:p[0],name:p[1],maker:p[2],category:p[3],type:p[4],application:p[5],certifications:p[6],ecolabel:p[7],recycled:p[8],fragrance:p[9],dose:p[10],description:p[11],pmc:p[12]||'',cam:true,stock:72-i*3,consumption:+(0.8+i*.17).toFixed(1),status:i===9?'Riordino':'Regolare'}));

  const materials = [
    ['MAT-01','ECO Z','Carta asciugamani','Fibre rigenerate, 2 veli, formato 23 × 23,5 cm, 220 fogli per confezione.'],
    ['MAT-02','ECO 10','Carta igienica','Fibre rigenerate, 2 veli, 200 strappi, 24 m, 10 rotoli per confezione.'],
    ['MAT-03','Identity Frequent Foam','Sapone liquido a schiuma','Sapone ipoallergenico con aloe vera; fino a 2.500 erogazioni, dose 0,4 ml.'],
    ['MAT-04','Identity folded hand towel','Dispenser carta asciugamani','ABS con chiusura a chiave, capacità 2,5 confezioni, visibilità consumi; 38,8 × 30,5 × 13,3 cm.'],
    ['MAT-05','Identity Mini Jumbo','Dispenser carta igienica','ABS con chiusura a chiave, rotoli fino a 220 mm; 25,6 × 28 × 12,8 cm.'],
    ['MAT-06','Identity foam soap dispenser','Dispenser sapone liquido','ABS con chiusura a chiave, compatibile con Frequent Foam; 27,2 × 11 × 11,3 cm.'],
    ['MAT-07','Asciugamani mini jet','Asciugamani elettrico','Asciugatura in 20 s, 800 W, motore 350 W, 70 m/s, infrarossi.'],
    ['MAT-08','Lineacqualba','Scopino e porta scopino','Corpo in ABS, setole in polipropilene, colore bianco; 49 × 15 × 15 cm.'],
    ['MAT-09','DN45745','Posacenere per esterni','Graniglia di marmo levigato, inserto in ferro zincato, 50 × 50 × 70 cm, 135 kg.'],
    ['MAT-10','G-Mat','Tappeto','Nylon 100%, supporto in gomma, resistente ai raggi UV e impermeabile.'],
    ['MAT-11','GEO','Contenitori raccolta differenziata','Contenitore metallico/plastico, finitura metallica, gancio porta sacco e piedini antislittamento.']
  ].map((m,i)=>({id:m[0],name:m[1],category:m[2],description:m[3],stock:Math.max(18,92-i*6),avg:4+i,status:i===8?'Critico':i===5?'Riordino':'Regolare'}));

  const machines = [
    ['MAC-01','FIMAP','V1','Lavasciuga ergonomica','Pista 46 cm; resa 1.380 mq/h; potenza 810 W; serbatoio 5 l; batteria fino a 2 h.'],
    ['MAC-02','FIMAP','GXL','Lavasciuga uomo a terra','Pista 43 cm; resa 1.720 mq/h; potenza 930 W; serbatoio 25 l; batteria fino a 3 h.'],
    ['MAC-03','FIMAP','EMx','Lavasciuga uomo a terra','Pista 51 cm; resa fino a 2.040 mq/h; serbatoio 40 l; autonomia 4 h; potenza 920 W.'],
    ['MAC-04','FIMAP','MMg','Lavasciuga uomo a bordo','Pista 85 cm; resa fino a 6.800 mq/h; serbatoio 110 l; autonomia 5,15 h; potenza 12.040 W.'],
    ['MAC-05','FIMAP','Magna','Lavasciuga uomo a bordo','Pista 100 cm; resa fino a 9.450 mq/h; serbatoio 190 l; autonomia 9 h; potenza 3.050 W.'],
    ['MAC-06','FIMAP','FSW5','Spazzatrice uomo a terra','Pista 65 cm; resa fino a 2.600 mq/h; raccolta 50 dm³; autonomia fino a 2 h.'],
    ['MAC-07','FIMAP','FSR 8','Spazzatrice uomo a bordo','Pista 150 cm; resa fino a 15.000 mq/h; raccolta 140 l; autonomia 5 h; potenza 3.930 W.'],
    ['MAC-08','Kärcher','HD 4/10 C Bp','Idropulitrice','Portata 320–400 l/h; pressione 70–110 bar; potenza 1.600 W; 30 min per batteria.'],
    ['MAC-09','Kärcher','HDS 8/18-4 CX','Idropulitrice a caldo','Portata 300–800 l/h; pressione 30–180 bar; potenza 6.000 W; 80–155 °C.'],
    ['MAC-10','FIMAP','FM 1500 V','Monospazzola alta velocità','Pista 51 cm; resa fino a 714 mq/h; 1.500 giri/min; potenza 1.100 W.'],
    ['MAC-11','FIMAP','FM 43 Tp Orbital','Monospazzola bassa velocità','Pista 42 cm; resa fino a 180 mq/h; serbatoio 15 l; pressione 28 g/cm²; potenza 1.100 W.'],
    ['MAC-12','FIMAP','FV60 HEPA','Aspirapolvere e liquidi','Portata aria 194 m³/h; fusto 60 l; cavo 15 m; potenza 1.600 W.'],
    ['MAC-13','FIMAP','FV 15.1','Aspirapolvere','Resa fino a 250 mq/h; fusto 15 l; filtro HEPA; portata 35 l/s; potenza 800 W.'],
    ['MAC-14','Kärcher','BVL 3/1 BP','Aspirapolvere spallabile','Resa fino a 130 mq/h; fusto 3 l; filtro HEPA; portata 35,4 l/s; batteria litio; 350 W.'],
    ['MAC-15','FIMAP','UP 35','Battitappeto','Filtro HEPA; fusto 6,5 l; portata 43 l/s; cavo 12 m; potenza 670 W.'],
    ['MAC-16','FIMAP','P 35.1 WD','Lava superfici tessili','Potenza 1.200 W; resa 46 m²/h; contenitore 35 l; cavo 7 m; sacco 8 l.'],
    ['MAC-17','Polti','Sani System Pro','Generatore vapore','Fino al 99,999% dei microrganismi; 6 bar; vapore 180 °C; serbatoio 5 l; potenza 2.300 W.'],
    ['MAC-18','—','Out Compact Pro','Pulitore facciate','Pre-filtri e membrana osmotica; aste carbonio; lavoro fino a 20 m; tubo 100 m.'],
    ['MAC-19','FIMAP','E-Spray','Sanificatore nebulizzatore','Serbatoio 1 l; batteria litio 8 h; resa fino a 850 mq/h; portata 0,062 l/min.']
  ].map((m,i)=>({id:m[0],brand:m[1],name:m[2],category:m[3],specs:m[4],status:i===8?'Manutenzione':i===14?'Verifica':'Operativa',hours:420+i*73,next:`${(i%25)+1} ott 2026`,cam:true}));

  const equipmentRaw = [
    ['Magic + R720E','Carrelli','PSV; polipropilene; sistema brevettato di ganci modulari.'],['Microrapid 2 inox','Carrelli area sanitaria','EPD; ruote 100 mm; trasporto frange.'],['Micropensile inox','Carrelli area sanitaria','Trolley certificato per frange e prodotti.'],['RS 20 inox','Carrelli','Trasporto vasche di tessili pre-impregnati.'],['Microrapid Compact Big-Foot inox','Carrelli area sanitaria','EPD; compatto; secchi orientati per semplificare l’aggancio delle frange.'],['Microtech HR inox','Carrelli area sanitaria','Compatto per sale operatorie e aree ad alto/altissimo rischio.'],['Kubi Robot Big-Foot','Carrelli','Trasporto di macchine e attrezzature per attività periodiche e risanamenti.'],['KUBI','Carrelli','Mobile carrellato Ecolabel per ambienti in cui prodotti e attrezzature devono restare confinati.'],['Kubi Economale','Carrelli economali','Grande volume per distribuzione del materiale economale.'],['Clean Room inox','Carrelli area sanitaria','Acciaio inox per camere bianche; sterilizzabile in autoclave.'],['Alpha A-B Plus','Carrelli area sanitaria','Plastica antibatterica per rifiuti, lavaggio e disinfezione.'],['Alpha Metal Free','Carrelli area sanitaria','PSV, senza parti metalliche, per aree di risonanza magnetica.'],['Alpha con Equodose','Carrelli','PSV con stazione d’impregnazione Equodose on board.'],['Picobello Metropol','Carrelli rifiuti','Raccolta rifiuti esterni con pinza, pala, scopa e freno.'],['2050-4500 CR','Carrelli rifiuti','Lega leggera AlMg3 anodizzata per trasporto interno rifiuti.'],['OSP 180','Carrelli rifiuti','Rimorchio inox 180×90×170 cm per trasporto esterno rifiuti ospedalieri.'],['Micropanno','Panni','Microfibra TNT ad alta capillarità e potere pulente.'],['r-Micro Tuff Swift','Panni','100% poliestere riciclato; rimozione 99,9% virus e batteri con sola acqua.'],['MicroRoll','Panni','Usa e getta per AAR/AR e contaminazione patogena; rimozione 99,9%.'],['Ultrarapid Honeycomb 3D','Mop','Microfibra 100% riciclata con aggancio a strappo Honeycomb 3D.'],['Panno spolvero pavimenti','Panni','Impregnazione con vaselina farmaceutica per trattenere le polveri.'],['Microrapid','Pavimenti','Telaio Loopfix leggero e robusto per frange.'],['Kit lavaggio vetri','Lavavetri','Bocchette, prolunghe, filtri e attrezzi per vetri interni.'],['Cleano 600','Lavavetri','Superfici vetrate fino a 5 m.'],['Prospeed','Pavimenti','Applicatore cera da 2,5 l con tampone monouso.'],['SPP','Pavimenti','Disco decerante abrasivo senza impiego di prodotti chimici.'],['Scalissima','Lavori in quota','Scala telescopica multi-posizione in alluminio.'],['ESSM','Lavori in quota','Trabattello modulare in alluminio per spazi limitati.'],['Deragnatore','Altro','Spazzola con manici in alluminio e aste telescopiche.'],['Kit raccolta liquidi biologici','Kit emergenza','Polvere assorbente per urina, sangue e vomito; assorbimento in 5 minuti.'],['PW 6243','Tessili','Lavatrice a due vie con parete divisoria e controllo Profitronic M.'],['Asciugatrice','Tessili','Pompa di calore a basso consumo con sistema Profitronic M.']
  ];
  const equipment = equipmentRaw.map((e,i)=>({id:`ATT-${String(i+1).padStart(2,'0')}`,name:e[0],category:e[1],description:e[2],status:i===25?'Verifica':'Disponibile'}));

  const uniforms = [
    ['LF9A_3273217001','Casacca unisex maniche corte scollo V','Bianco; tre tasche a toppa; twill 100% cotone; tutte le misure.','—'],
    ['LF9A_3273925001','Casacca unisex maniche corte scollo V','Viola; tre tasche a toppa; twill 100% cotone; tutte le misure.','—'],
    ['H81_2273925001','Pantalone unisex','Elastico e laccio; colore personalizzabile; twill 100% cotone.','—'],
    ['ZCB236475','Felpa girocollo unisex','60% poliestere riciclato GRS, 40% cotone non garzato.','GRS'],
    ['JIX_1611923001','Giubbotto imbottito unisex','Maniche staccabili; esterno 65% poliestere, 35% cotone; interno 100% poliestere.','—'],
    ['ZCF386302','Pantalone unisex','Kaki Pantone 4241C; twill antistrappo 65% poliestere riciclato GRS, 35% cotone.','GRS'],
    ['YA6_1611923001','Casacca unisex','Chiusura con lacci; due tasche; 65% poliestere, 35% cotone.','—']
  ].map((u,i)=>({id:u[0],name:u[1],description:u[2],certification:u[3],assigned:42+i*9,status:i===4?'In riordino':'Disponibile'}));

  const tickets = [
    ['TCK-260914','Guasto dispenser sapone','Anomalia','ASL 8 Cagliari','Alta','In presa','01:42'],
    ['TCK-260913','Risanamento area ad alto rischio','Straordinario','AO Brotzu','Critica','Autorizzazione','00:38'],
    ['TCK-260912','Pulizia vetrate esterne','Extra-canone','AOU Sassari','Media','Pianificata','18:20'],
    ['TCK-260911','Materiale economale esaurito','A chiamata','AOU Cagliari','Alta','Esecuzione','02:11'],
    ['TCK-260910','Verifica frequenza corridoio','Informazione','ASL 7 Sulcis','Bassa','Chiusa','—']
  ].map(t=>({id:t[0],title:t[1],type:t[2],entity:t[3],priority:t[4],status:t[5],sla:t[6]}));

  const nc = [
    ['NC-1042','Pulizia non conforme','ASL 8 Cagliari','Alta','Azione correttiva','03:18'],
    ['NC-1041','Mancata frequenza','AO Brotzu','Critica','Presa in carico','00:44'],
    ['NC-1040','Prodotto non idoneo','AOU Sassari','Media','Verifica','12:22'],
    ['NC-1039','Attrezzatura','ASL 7 Sulcis','Bassa','Chiusa','—']
  ].map(n=>({id:n[0],cause:n[1],entity:n[2],severity:n[3],status:n[4],sla:n[5]}));

  const people = Array.from({length:12},(_,i)=>({
    id:`DEMO-${String(i+1).padStart(3,'0')}`,name:`Operatore Demo ${String(i+1).padStart(2,'0')}`,
    role:i%4===0?'Caposquadra':'Addetto servizi',lot:String(4+(i%4)),entity:lots[i%4].entities[0].name,
    hours:30+(i%3)*6,status:i===7?'Formazione':'Attivo',shift:i%2?'07:00–13:00':'13:00–19:00'
  }));

  const activities = [
    ['07:00','ASL 7 Sulcis','Area ad alto rischio','Detersione e disinfezione','Operatore Demo 01','Completata'],
    ['08:30','ASL 8 Cagliari','Area a medio rischio','Pulizia ordinaria','Operatore Demo 02','In corso'],
    ['09:15','AO Brotzu','Blocco operatorio','Presidio sostitutivo','Squadra Demo A','In corso'],
    ['10:00','AOU Cagliari','Aree esterne','Derattizzazione programmata','Squadra Demo B','Pianificata'],
    ['11:30','AOU Sassari','Area a basso rischio','Risanamento periodico','Operatore Demo 05','In ritardo']
  ].map((a,i)=>({id:`POG-${2600+i}`,time:a[0],entity:a[1],area:a[2],task:a[3],operator:a[4],status:a[5]}));

  return {lots,products,materials,machines,equipment,uniforms,tickets,nc,people,activities,
    meta:{totalSurface:1012792.26,realCounts:{products:15,materials:11,machines:19,equipment:32,uniforms:7},updated:'22 set 2026, 12:18'}};
})();
