# Monitoraggio automatico SmartLab Analytics

## Endpoint e separazione degli accessi

`GET /api/monitoring/visits` richiede `Authorization: Bearer <MONITORING_TOKEN>`.
Il secret deve avere almeno 32 caratteri e deve essere diverso da `ADMIN_TOKEN`.
Il token amministrativo, il cookie della dashboard e i parametri nell'URL non
autorizzano questa API. Il token di monitoraggio non apre le API amministrative.
La raccolta pubblica esistente mantiene i propri controlli indipendenti.

La risposta contiene solo ID evento, sequenza di inserimento, progetto, nome e
timestamp UTC. Nessun IP, cookie, referrer, credenziale o percorso viene esposto.
Nessuna risposta è memorizzabile in cache e non viene abilitato CORS.
La route esegue soltanto SELECT; non inizializza tabelle e non aggiorna cursori
nel database di produzione. Il binding D1 del Worker mantiene i permessi necessari
alla raccolta; la restrizione read-only è applicata dalla route, non dal binding.

## Confronto incrementale

La tabella esistente `views` è append-only: SQLite assegna un rowid crescente
all'inserimento. `after` è l'ultimo rowid elaborato. Ogni lettura acquisisce
`through = MAX(rowid)` usando una sessione D1 `first-primary`. Le pagine successive
restano entro questo limite, tramite cursori firmati HMAC. Una scrittura completata
dopo il limite viene letta al prossimo controllo, anche se ha un timestamp vecchio.
Il limite è 500 record per pagina; il client verifica ordine, origine e completezza.

Il primo controllo può usare `since` (timestamp incluso) per importare il precedente
`last_successful_check_ms`. Dopo la lettura completa si usa solo la sequenza.
Gli ID delle prove già salvati vengono esclusi dal riepilogo.
Il limite viene aggiornato solo dopo una lettura completa. Errori di rete,
autenticazione, pagine malformate e richieste concorrenti non fanno avanzare lo stato.

**Vincolo:** non cancellare/reimportare la tabella, non modificarne i rowid e non
eseguire VACUUM senza una migrazione del checkpoint. Un ripristino con limite
inferiore viene rifiutato (409); un ripristino che riusa gli stessi rowid non può
essere rilevato sempre. In caso di ripristino D1 occorre riconciliare gli ID prima
di riattivare il controllo. L'app attuale non effettua queste operazioni.

## Configurazione e deploy

Usare l'account Cloudflare SmartLab già associato al Worker. Prima di distribuire,
verificare impostazioni e binding remoti: `DB` deve indicare
`smartlab-analytics-db`, ID `217e137b-a2a4-4a31-9118-402e3f532be3`.
Preservare i secret esistenti. Non inserire token nella chat o nel repository.
Per il deploy usare un accesso Cloudflare valido con Workers Scripts Edit e i
permessi di lettura necessari all'ispezione di Workers/D1 nell'account SmartLab.
Non cambiare piano e non attivare servizi a pagamento.

Da questa cartella, dopo la verifica dei binding:

```sh
npm ci
npm test
npm run test:monitoring:e2e
npx wrangler deploy --dry-run
node scripts/configure-monitoring.mjs /percorso/privato/smartlab-monitor
```

Lo script genera un token casuale di 256 bit, lo conserva in `credentials.json`
con permessi 0600 e lo carica come secret insieme al codice. Non ruota token già
presenti nel file locale e non sostituisce `ADMIN_TOKEN`. Il file temporaneo di
deploy viene rimosso anche se la pubblicazione fallisce. Verifica poi l'API reale
con una sola lettura, senza generare visualizzazioni fittizie.
`--strict` impedisce di sovrascrivere modifiche remote in conflitto; riconciliarle
prima di riprovare. Non aggirare il controllo togliendo il flag.

## Stato locale, notifiche e pianificazione

Copiare lo stato precedente in `state.json` nella cartella privata, mantenendo
`dashboard_url`, `last_successful_check_ms` ed `excluded_test_event_ids`.
Non inserire `after` finché il primo confronto completo non lo determina.

```sh
node scripts/monitor.mjs check /percorso/privato/state.json /percorso/privato/credentials.json
```

`unchanged` significa nessuna notifica. `new_views` prepara un lotto persistente
con ID stabile, totale e progetti con primo/ultimo orario. Il lotto resta in
`pending` fino alla conferma della consegna; ripetere il controllo restituisce
lo stesso lotto, senza modificarne il checkpoint. Dopo aver verificato che il
riepilogo sia visibile nella chat:

```sh
node scripts/monitor.mjs ack /percorso/privato/state.json /percorso/privato/credentials.json ID_LOTTO
```

L'attività del **lunedì alle 08:00 Europe/Rome** deve usare questi stessi percorsi
persistenti. All'inizio di ogni esecuzione confrontare un eventuale lotto pending
con l'ultimo riepilogo nella chat: se già pubblicato, confermarlo prima di leggere
le nuove visite; altrimenti riproporre quel lotto con il suo ID. Non confermare
un lotto prima della consegna. Questo garantisce recupero dopo interruzioni; non
è una transazione atomica tra filesystem e notifiche della piattaforma.

Formattare gli orari in Europe/Rome, con ora legale. Notificare solo lotti con
visualizzazioni nuove; nessun messaggio di routine quando il totale è zero.
Non confondere visualizzazioni e persone uniche. In caso di errore conservare
lo stato e segnalare soltanto problemi nuovi o che richiedano un intervento.
Un lock abbandonato dopo arresto forzato richiede verifica che non vi siano altri
controlli in esecuzione prima di rimuoverlo.

## Verifiche

I test unitari verificano autenticazione, sola lettura, limiti, cursori alterati,
timestamp uguali, scritture successive al limite, bootstrap, esclusione prove ed
errori intermedi. Il test end-to-end esegue il codice nel runtime workerd con D1
locale, raccoglie eventi, controlla l'idempotenza, verifica login amministrativo,
preparazione/conferma del riepilogo, silenzio senza novità, stato immutato dopo
errori e dati persistenti dopo il riavvio. Non scrive nel database di produzione.

La prova remota richiede inoltre accesso valido a Cloudflare, lettura del registro
reale, confronto con lo stato precedente e verifica del task effettivamente attivo.
La consegna di notifiche nella chat va verificata nella piattaforma; il test locale
valida l'outbox e il suo contenuto, non il servizio di notifiche esterno.

Riferimenti: [D1 Sessions](https://developers.cloudflare.com/d1/best-practices/read-replication/),
[Secrets](https://developers.cloudflare.com/workers/configuration/secrets/),
[test D1 locali](https://developers.cloudflare.com/d1/best-practices/local-development/).
