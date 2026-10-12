# Intro AUXCORE · ASP Catania

Animazione di apertura (~36 s) che si mostra **sopra** la home di `/auxcore-catania/` e, a fine sequenza, si dissolve in un bagliore bianco lasciando la home reale già navigabile. L'indirizzo non cambia: nessun redirect, nessuna pagina in più.

## Quando parte

| Condizione | Comportamento |
|---|---|
| Prima visita della sessione, desktop o tablet orizzontale | Intro completa, poi home |
| Visita successiva nella stessa sessione (stessa scheda) | Home diretta |
| `?intro=1` nell'URL | Forza l'intro (utile per test e per mostrarla al cliente) |
| `prefers-reduced-motion: reduce` | Mai, nemmeno con `?intro=1` |
| Risparmio dati attivo, rete 2G/3G, ≤ 2 GB di RAM o ≤ 2 core | Home diretta |
| Finestra più piccola di circa 864 × 486 px (smartphone, tablet verticale) | Home diretta |
| Il dispositivo non regge ~22 fps per due finestre consecutive | L'intro si dissolve sulla home |
| Un'immagine non si carica entro 7 s | L'intro si dissolve sulla home |

L'utente può sempre saltarla con il pulsante **Salta intro** o con **Esc**: in quel caso si vede comunque il bagliore finale.

## File

- `intro.js`: motore (IIFE, nessuna dipendenza oltre a GSAP). Tutto vive in uno Shadow DOM: non eredita né modifica gli stili del sito.
- `gsap.min.js`: GSAP 3.12.5 ospitato qui (nessuna CDN).
- `media/`: device (4 risoluzioni, caricate solo quando servono), maschere degli schermi, simbolo, sfondi e font Inter / JetBrains Mono ospitati (licenza OFL in `media/fonts/OFL.txt`). **Nessuna richiesta a servizi esterni.**
- `snippet.html`: blocco da tenere nell'`<head>` di `../index.html`.
- `install.py`: inserisce o aggiorna lo snippet.

Il video e il poster mostrati negli schermi dei device sono quelli della home (`../hero-catania-scrub.mp4`, `../hero-catania-poster.jpg`).

## Dopo ogni nuova pubblicazione del sito

Se la build sostituisce `auxcore-catania/index.html`, lo snippet sparisce. Per rimetterlo:

```bash
python3 auxcore-catania/intro/install.py
```

Lo script è idempotente. Lo snippet deve stare solo in `index.html` (la home): non va aggiunto a `dashboard/index.html`, così i link diretti alla dashboard restano immediati.

## Modificare le impostazioni

Le opzioni stanno in `window.AUX_INTRO` dentro lo snippet:

| Chiave | Valore attuale | Effetto |
|---|---|---|
| `once` | `true` | Una sola volta per sessione. `false` = a ogni visita |
| `minScale` | `.45` (default del motore) | Soglia di dimensione sotto cui l'intro non parte. `0` = anche su smartphone, in formato ridotto |
| `perfGuard` | `true` (default) | Dissolvenza automatica se il dispositivo non regge. `false` = mai |
| `music` | non impostata | Elenco di tracce audio opt-in (vedi sotto) |

## Musica (opzionale, non attiva)

Il motore supporta una traccia audio **attivabile dall'utente** (pulsante "Attiva audio", tasto `M`), mai in riproduzione automatica. Per attivarla servono un file e una riga nello snippet:

```js
music:[{url:'/auxcore-catania/intro/media/music.mp3'}]
```

Prima di pubblicare una traccia va verificata la licenza d'uso commerciale.

## Rimuovere l'intro

Eliminare il blocco `AUXCORE intro` dall'`<head>` di `index.html`. La cartella `intro/` può restare o essere cancellata.
