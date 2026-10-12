#!/usr/bin/env python3
"""Inserisce (o aggiorna) lo snippet dell'intro in auxcore-catania/index.html.

Da lanciare dopo ogni nuova pubblicazione del sito, se la build sostituisce index.html:
    python3 auxcore-catania/intro/install.py
È idempotente: se lo snippet c'è già lo sostituisce con la versione corrente.
"""
import re, sys, pathlib

here = pathlib.Path(__file__).resolve().parent
index = here.parent / "index.html"
snippet = (here / "snippet.html").read_text(encoding="utf-8").strip()

html = index.read_text(encoding="utf-8")
START, END = "<!-- AUXCORE intro v", "<script src=\"/auxcore-catania/intro/intro.js\" charset=\"utf-8\" defer></script>"

# rimuove una versione precedente, se presente
if START in html:
    a = html.index(START)
    b = html.index(END, a) + len(END)
    html = html[:a] + html[b:]

m = re.search(r"<meta name=\"viewport\"[^>]*>", html)
if not m:
    sys.exit("meta viewport non trovato: inserire lo snippet a mano subito dopo <head>")
html = html[: m.end()] + "\n" + snippet + "\n" + html[m.end():]
index.write_text(html, encoding="utf-8")
print("snippet installato in", index)
