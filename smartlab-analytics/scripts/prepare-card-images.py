"""Export thumbnails from existing project hero assets; do not generate new art."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request
import base64
import re
import colorsys
import json
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
TEMP = ROOT.parents[1] / 'card-references'
TEMP.mkdir(parents=True, exist_ok=True)
OUT = ROOT / 'public' / 'card-images'
OUT.mkdir(exist_ok=True)
URLS = {
    'auxcore': 'https://live.smartlabdesign.it/auxcore/hero-poster.jpg',
    'milanosport': 'https://live.smartlabdesign.it/milanosport-control-hub/assets/hero-cozzi.webp',
    'ras': 'https://live.smartlabdesign.it/ras-service-hub/assets/hero-01.webp',
    'sport': 'https://live.smartlabdesign.it/sport-salute-control-hub/hero-control-hub-green-wide.webp',
    'burger': 'https://sites.smartlabdesign.it/giggiooo-burger/assets/hero-poster-v2.jpg',
    'right': 'https://d2ol7oe51mr4n9.cloudfront.net/user_37u4BdIWLdxIKRnNlGRqjLjMgTw/46aa4109-9f74-4251-8837-866468284918.png',
    'fold02': 'https://sites.smartlabdesign.it/fold-3d-study-02/background.png',
    'fold03': 'https://sites.smartlabdesign.it/fold-3d-study-03/background.png',
    'portfolio': 'https://sites.smartlabdesign.it/assets/og-home.jpg'
}

def download(item):
    key, url = item
    request = urllib.request.Request(url, headers={'User-Agent': 'SmartLab-asset-export/1.0'})
    with urllib.request.urlopen(request, timeout=40) as response:
        content = response.read()
    target = TEMP / (key + '.original')
    target.write_bytes(content)
    return key, target

images = dict(ThreadPoolExecutor(max_workers=5).map(download, URLS.items()))
veritas_url = 'https://raw.githubusercontent.com/jamezichat-online/work.smartlabdesign.it/main/veritas-control-hub/index.html'
with urllib.request.urlopen(veritas_url, timeout=40) as response:
    source = response.read().decode()
match = re.search(r'<section[^>]*class="hero-section"[^>]*data:image/jpeg;base64,([A-Za-z0-9+/=]+)', source)
if not match:
    raise RuntimeError('Veritas hero not found in current page')
target = TEMP / 'veritas.original'
target.write_bytes(base64.b64decode(match.group(1)))
images['veritas'] = target

palette = {}
montage = Image.new('RGB', (1000, 880), '#042125')
draw = ImageDraw.Draw(montage)
for index, (key, target) in enumerate(images.items()):
    image = ImageOps.exif_transpose(Image.open(target)).convert('RGB')
    original_size = image.size
    image.thumbnail((600, 450), Image.Resampling.LANCZOS)
    output = OUT / (key + '.webp')
    # Keep card assets small enough for quick previews and repository review.
    for quality in range(78, 37, -8):
        image.save(output, 'WEBP', quality=quality, method=6)
        if output.stat().st_size <= 20000:
            break
    while output.stat().st_size > 20000:
        image.thumbnail((int(image.width * .85), int(image.height * .85)), Image.Resampling.LANCZOS)
        image.save(output, 'WEBP', quality=62, method=6)
    sample = image.resize((120, 80)).quantize(colors=12)
    candidates = []
    colors = sample.getpalette()
    for count, color_index in sorted(sample.getcolors(), reverse=True):
        rgb = tuple(colors[color_index*3:color_index*3+3])
        hue, lightness, saturation = colorsys.rgb_to_hls(*(v / 255 for v in rgb))
        candidates.append({'hex': '#%02x%02x%02x' % rgb, 'coverage': round(count/9600, 3), 'h': round(hue*360), 's': round(saturation, 2), 'l': round(lightness, 2)})
    palette[key] = {'source': URLS.get(key, veritas_url), 'size': original_size, 'colors': candidates}
    x, y = (index % 5)*200, (index // 5)*440
    tile = ImageOps.fit(image, (196, 220))
    montage.paste(tile, (x, y+24))
    draw.text((x+8, y+6), key, fill='white')
    for n, c in enumerate(candidates[:8]):
        draw.rectangle((x+4,y+252+n*20,x+30,y+266+n*20), fill=c['hex'])
        draw.text((x+37,y+253+n*20), c['hex']+' '+str(c['coverage']), fill='white')
montage.save(TEMP / 'montage.jpg')
print(json.dumps(palette))
