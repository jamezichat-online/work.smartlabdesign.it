# Intro AUXCORE · ASP Catania

Animazione di apertura (~36 s) mostrata **sopra** la home di `/auxcore-catania/`; a fine sequenza si dissolve in un bagliore bianco e lascia la home reale già navigabile. L'indirizzo non cambia.

## Come resta "fissa" col sito

La home viene rigenerata a ogni pubblicazione e può perdere lo snippet. Tre livelli di protezione:

| Livello | Cosa fa |
|---|---|
| `payload/` + `snippet.html` | Copia di riferimento dell'intro, fuori dalla cartella del sito, quindi non toccata da una nuova pubblicazione |
| `.github/workflows/auxcore-intro.yml` | A ogni push su `main` che tocca `auxcore-catania/` esegue `install.py`; se l'intro è sparita, la rimette e fa commit |
| `install.py` | Ripristino manuale: `python3 .github/auxcore-intro/install.py` (idempotente) |

Dopo una pubblicazione il workflow impiega circa un minuto: in quel lasso la home può essere online senza intro.
Il workflow parte solo se GitHub Actions è abilitato per il repository.

## Aggiornare l'intro

1. Sostituire i file in `payload/` (e, se cambia, `snippet.html`).
2. `python3 .github/auxcore-intro/install.py` e commit. `auxcore-catania/intro/` è una copia generata: non va modificata a mano.

## Quando parte

| Condizione | Comportamento |
|---|---|
| Prima visita della sessione | Intro completa, poi home |
| Visite successive nella stessa scheda | Home diretta |
| `?intro=1` | Forza l'intro (test, demo al cliente) |
| `prefers-reduced-motion: reduce` | Mai |
| Risparmio dati, rete ≤3G, ≤2 GB RAM, ≤2 core | Home diretta |
| Finestra molto piccola (< ~864 × 486 in orizzontale, < ~302 × 420 in verticale) | Home diretta |
| Meno di ~22 fps per due finestre consecutive | L'intro si dissolve sulla home |
| Un'immagine non si carica entro 7 s | L'intro si dissolve sulla home |
| Rotazione del dispositivo durante l'intro | L'intro si dissolve sulla home |

Skip manuale: pulsante **Salta intro** o `Esc` (si vede comunque il bagliore finale).

## Orizzontale e verticale

- **Orizzontale** (desktop, tablet): palco 1920 × 1080, trio notebook / tablet / smartphone, dolly finale nello schermo del notebook.
- **Verticale** (smartphone, tablet in verticale; rapporto < 0,95): palco 1080 px di larghezza e alto quanto lo schermo; titoli in alto, device in basso, dolly finale nello schermo dello smartphone, che coincide con la home mobile.
Stessa timeline, stessi tempi, stessa musica.

## Musica

Una sola traccia (`payload/media/music.mp3`), **attivabile dall'utente** con il pulsante "Attiva audio" o con il tasto `M`. Mai in riproduzione automatica (i browser non lo consentono) e scaricata solo dopo l'attivazione.
Prima di tenerla in produzione va verificata la licenza d'uso commerciale del piano con cui è stata generata.

## Rimuovere l'intro

Eliminare il workflow `.github/workflows/auxcore-intro.yml`, poi il blocco `AUXCORE intro` dall'`<head>` di `auxcore-catania/index.html` e la cartella `auxcore-catania/intro/`.
