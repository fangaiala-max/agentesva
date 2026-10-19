"""Download actual Figma MCP exports. Signed URLs stay in a temporary input file."""
import concurrent.futures
import hashlib
import json
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'public/images/guides/figma'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = 'https://www.figma.com/design/uuDKTEYcwWqKNGevy5l2Xt'

def fetch(item):
    with urlopen(Request(item['url'], headers={'User-Agent': 'AgentesVA-editorial-export/1.0'}), timeout=60) as response:
        data = response.read()
    target = OUT / f"{item['name']}.{item['format']}"
    target.write_bytes(data)
    width, height = item['width'], item['height']
    if item['format'] == 'png':
        with Image.open(target) as image:
            image.verify()
        with Image.open(target) as image:
            width, height = image.size
        assert (width, height) == (item['width'], item['height']), (target.name, width, height)
    return {'file': str(target.relative_to(ROOT)), 'nodeId': item['id'],
            'source': f"{SOURCE}?node-id={item['id'].replace(':','-')}",
            'width': width, 'height': height, 'bytes': len(data),
            'sha256': hashlib.sha256(data).hexdigest(), 'format': item['format'],
            'fonts': ['DM Sans', 'JetBrains Mono'], 'origin': 'native Figma MCP export',
            'review': 'pending visual export review'}

items = json.loads(Path(sys.argv[1]).read_text())
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = list(pool.map(fetch, items))
manifest = Path(__file__).parent / 'asset-manifest.json'
existing = json.loads(manifest.read_text()) if manifest.exists() else []
by_file = {entry['file']: entry for entry in existing + records}
manifest.write_text(json.dumps(list(by_file.values()), indent=2, ensure_ascii=False) + '\n')
print(f'Downloaded and verified {len(records)} actual Figma exports.')
