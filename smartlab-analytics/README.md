# SmartLab Analytics

App privata per visualizzare gli accessi ai siti SmartLabDesign. Card personalizzate nello stile del portfolio, riepilogo delle visualizzazioni, filtri per sito e periodo, registro cronologico con giorno e ora in `Europe/Rome`.

**Stato:** sorgenti pronti; il servizio deve essere attivato sul proprio account Cloudflare. Le pagine esistenti non contengono ancora il tracker e non vengono monitorate.

[Apri l'anteprima interattiva](https://live.smartlabdesign.it/smartlab-analytics/public/preview.html) — tutti i numeri dell'anteprima sono dimostrativi.

## Attivazione su Cloudflare Free

Non attivare Workers Paid, trial o servizi a pagamento. Il progetto usa soltanto Workers Free e D1 Free, e può usare il dominio incluso `workers.dev`. Se raggiungi le quote del piano gratuito, Cloudflare interrompe le richieste: il codice non attiva alcun upgrade.

1. Nel tuo pannello Cloudflare apri **Workers & Pages → Create application → Import a repository** (le etichette possono variare). Collega il repository GitHub `jamezichat-online/work.smartlabdesign.it`.
2. Seleziona il ramo `main` e imposta **Root directory** su `smartlab-analytics`.
3. Nome Worker: `smartlab-analytics`. Lascia il build command vuoto e imposta il deploy command su `npm run deploy`.
4. Pubblica. Wrangler crea automaticamente il database D1 per il binding `DB`. Le tabelle vengono inizializzate al primo accesso. Se il database non compare, aggiungi manualmente un database D1 al binding `DB` nelle impostazioni del Worker.
5. Nel Worker, **Settings → Variables & Secrets**, aggiungi un **Secret** di nome `ADMIN_TOKEN`: scegli una password casuale di almeno 20 caratteri. Non inserirla nel codice, nel repository o nella chat. Salva la configurazione e ridistribuisci se richiesto dal pannello.
6. Apri l'indirizzo `workers.dev` del Worker e accedi con la password appena scelta. All'inizio le card mostreranno zero accessi.
7. Apri **Collega i siti** e copia lo script. Inseriscilo prima di `</head>` nelle pagine da monitorare. Comunica l'URL pubblico dell'app all'assistente per completare l'inserimento nel GitHub e verificare una visita reale.

Non serve spostare i siti, modificare il dominio o creare utenti per i visitatori.

## Siti predisposti

Sono registrati i 5 progetti su `live.smartlabdesign.it` (AUXCORE, Milanosport, RAS, Sport e Salute, Veritas), i progetti Giggiooo Burger, The Right One, Fold Study 02 e 03 e la home portfolio su `sites.smartlabdesign.it`. Le corrispondenze sono definite in `public/catalog.json`. Per aggiungere un sito modifica quel file, aggiungi la copertina in `public/card-images/` e rigenera l'anteprima con `npm run build:preview`.

## Card, link e grafico

Le dieci card usano copie locali ottimizzate delle immagini originali dei progetti: hero, sfondi o immagine di presentazione del portfolio. Veritas riprende la hero incorporata nella pagina originale. Accenti, badge, bordi e sfondi seguono la palette delle immagini. Nei dettagli gli URL HTTPS reali aprono il sito o la dashboard in una nuova scheda.

Dopo **Il registro** compare il grafico a barre degli accessi per singolo progetto: una barra per ogni card, con il medesimo colore e il totale del periodo. I pulsanti **7, 30 e 90 giorni** sono sincronizzati con il selettore generale. I conteggi provengono dal riepilogo completo, includono i progetti senza accessi e seguono il filtro Dashboard/Personali; i KPI in alto restano globali. Ogni etichetta mostra anche il sottotitolo per distinguere i due Fold Study. Su schermi piccoli il grafico scorre orizzontalmente, anche con la tastiera. Il dettaglio “Vedi tutti” mantiene l’andamento giornaliero in ora italiana.

`npm run build:preview` sincronizza il catalogo dimostrativo e genera `anteprima.html`, collegata agli asset locali del progetto. Per una copia scaricabile autonoma usa `npm run build:preview -- --standalone /percorso/SmartLab-Analytics.html`: immagini, stili e app vengono incorporati nel file. La copia autonoma può essere aperta direttamente senza un server; i font esterni hanno un'alternativa locale. Per aggiornare le copertine dalle fonti originali usa `python3 scripts/prepare-card-images.py` (richiede Pillow e accesso alla rete), poi controlla le immagini e aggiorna i colori del catalogo se necessario prima di rigenerare l'anteprima.

Il tracker registra **una visualizzazione per caricamento di pagina visibile**, compresi i refresh. Non deduplica persone e non registra l'apertura dei modal o le navigazioni interne SPA. Per AUXCORE può essere inserito anche in `auxcore/dashboard/index.html`.

Per escludere le tue verifiche visita ogni dominio con `?smartlab-ignore=1` aggiunto al link. La preferenza viene salvata localmente solo sul tuo browser. `?smartlab-ignore=0` riattiva la raccolta. I browser che abilitano Do Not Track o Global Privacy Control vengono rispettati. Nessun sistema basato su script garantisce il conteggio di tutti gli accessi: blocchi del browser, errori di rete e automazioni possono incidere sui numeri.

## Dati e accesso

La tabella `views` conserva soltanto un ID casuale della singola apertura (per evitare duplicati dello stesso evento), l'ID del progetto, il percorso della pagina e il timestamp assegnato dal server. Non vengono salvati IP, user agent, email, referrer, query string, frammenti, cookie o identificatori persistenti dei visitatori. L'ID dell'evento cambia a ogni caricamento e non è un ID utente. La piattaforma hosting può comunque trattare metadati di rete per erogare il servizio; le impostazioni generali dell'account Cloudflare non sono gestite da questa app.

Le API di lettura sono protette; la consultazione usa un cookie di sessione del solo proprietario, `Secure`, `HttpOnly`, `SameSite=Strict`, valido 12 ore. La password resta un secret lato server. Non esistono password predefinite e l'accesso resta chiuso se il secret manca. La raccolta è pubblica e consente soltanto gli origin e percorsi registrati. Un origin può essere simulato da client esterni: i conteggi non sono una prova forense né una certificazione dell'identità dei visitatori.

Le date sono salvate in UTC e visualizzate in ora italiana, con gestione dell'ora legale. I filtri coprono oggi, 7, 30 e 90 giorni. I dati non vengono cancellati automaticamente; lo spazio rimane soggetto alle quote gratuite. Aggiorna l'informativa privacy dei siti per descrivere la raccolta e stabilire una conservazione adeguata prima di attivarla.

## Sviluppo e verifica

Richiede Node 24 per i test locali (`node:sqlite`) e Node compatibile con Wrangler per il deploy.

```sh
npm ci
npm test
npm run build:preview
npm run preview
npx wrangler deploy --dry-run
```

L'anteprima locale è disponibile su `http://localhost:4173` e non raccoglie visite. Per sviluppare il Worker copia `.dev.vars.example` in `.dev.vars`, imposta una password locale e avvia `npm run dev`. Il database di sviluppo è locale.

I test verificano la protezione delle API, cookie di sessione e CSRF, raccolta e minimizzazione dei dati, idempotenza, validazione degli origin, paginazione e cambio dell'ora legale. Il binding SQLite dei test riproduce le operazioni D1; la verifica finale del deploy e della raccolta va completata sull'account Cloudflare reale.

Documentazione: [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/), [D1 Free](https://developers.cloudflare.com/d1/platform/pricing/), [provisioning automatico](https://developers.cloudflare.com/workers/wrangler/configuration/#automatic-provisioning), [importazione GitHub e root directory](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
