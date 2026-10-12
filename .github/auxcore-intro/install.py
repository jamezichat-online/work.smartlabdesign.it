#!/usr/bin/env python3
"""Mantiene l'intro AUXCORE nella home di ASP Catania, qualunque cosa faccia la pubblicazione del sito.

Cosa fa (idempotente, nessun effetto se e' tutto a posto):
  1. ripristina auxcore-catania/intro/ dalla copia di riferimento (.github/auxcore-intro/payload);
  2. rimette lo snippet nell'<head> di auxcore-catania/index.html (solo la home, mai la dashboard).

Uso manuale, dalla radice del repo:   python3 .github/auxcore-intro/install.py
Uso automatico: workflow .github/workflows/auxcore-intro.yml, a ogni push su main.
"""
import hashlib, pathlib, re, shutil, sys

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[1]
SITE = REPO / "auxcore-catania"
PAYLOAD = HERE / "payload"
SNIPPET = (HERE / "snippet.html").read_text(encoding="utf-8").strip()
START = "<!-- AUXCORE intro v"
END = '<script src="/auxcore-catania/intro/intro.js" charset="utf-8" defer></script>'
changed = []

def digest(p): return hashlib.sha1(p.read_bytes()).hexdigest()

if not (SITE / "index.html").exists():
    print("auxcore-catania/index.html non trovato: niente da fare"); sys.exit(0)

# 1) cartella intro/ = specchio esatto della copia di riferimento
dest = SITE / "intro"
want = {p.relative_to(PAYLOAD): p for p in PAYLOAD.rglob("*") if p.is_file()}
for rel, src in want.items():
    dst = dest / rel
    if not dst.exists() or digest(dst) != digest(src):
        dst.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(src, dst); changed.append(f"intro/{rel}")
if dest.exists():
    for f in sorted(dest.rglob("*"), reverse=True):
        if f.is_file() and f.relative_to(dest) not in want:
            f.unlink(); changed.append(f"rimosso intro/{f.relative_to(dest)}")
        elif f.is_dir() and not any(f.iterdir()): f.rmdir()

# 2) snippet nella home
index = SITE / "index.html"
html = index.read_text(encoding="utf-8")
new = html
if START in new:
    a = new.index(START)
    b = new.find(END, a)
    if b != -1:
        new = new[:a].rstrip("\n") + "\n" + new[b + len(END):].lstrip("\n")
m = re.search(r'<meta name="viewport"[^>]*>', new) or re.search(r"<head[^>]*>", new)
if not m:
    sys.exit("<head> non trovato in index.html: impossibile inserire lo snippet")
new = new[: m.end()] + "\n" + SNIPPET + "\n" + new[m.end():].lstrip("\n")
if new != html:
    index.write_text(new, encoding="utf-8"); changed.append("index.html (snippet)")

print("aggiornato: " + ", ".join(changed) if changed else "gia' a posto: nessuna modifica")
