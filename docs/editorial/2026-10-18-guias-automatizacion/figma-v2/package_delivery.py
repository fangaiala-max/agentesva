"""Refresh the existing local delivery and create a focused Figma asset pack."""
import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
FOLDER = Path('docs/editorial/2026-10-18-guias-automatizacion')
DEST = Path(sys.argv[1])
SITE = DEST / 'site'
shutil.copytree(ROOT / '.vercel/output/static', SITE, dirs_exist_ok=True)
shutil.copytree(ROOT / FOLDER, SITE / '_review' / FOLDER, dirs_exist_ok=True)
shutil.copytree(ROOT / 'research', SITE / '_review/research', dirs_exist_ok=True)

index = SITE / '_review/index.html'
source = index.read_text()
state = json.loads((ROOT / FOLDER / 'figma-v2/state.json').read_text())
for kind in ['processes', 'claude', 'social']:
    asset = next(a for a in state['assets'] if a['name'] == f'{kind}-atlas-en')
    source = source.replace(f'src="/images/guides/buying/{kind}-cover.jpg" width="1440" height="960"',
                            f'src="/images/guides/figma/{kind}-atlas-en.png" width="{asset["width"]}" height="{asset["height"]}"')
    source = source.replace(f'/images/guides/buying/{kind}-infographic-', f'/images/guides/figma/{kind}-infographic-')
source = source.replace('Ediciones completas en español e inglés. Portadas originales, comparativas, ejemplos, límites y una infografía final para guardar.',
                        'Edición visual Figma: 36 composiciones nativas para español, inglés, escritorio y móvil. Un 62–66% menos de texto HTML expuesto inicialmente; reseñas completas desplegables.')
figma_link = '<p><a href="https://www.figma.com/design/uuDKTEYcwWqKNGevy5l2Xt?node-id=5-2">Abrir los originales editables en Figma</a></p>'
source = source.replace(figma_link, '').replace('<section class="grid">', figma_link + '<section class="grid">')
index.write_text(source)

def archive(path, files, base):
    temporary = path.with_suffix('.zip.tmp')
    with zipfile.ZipFile(temporary, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
        for file in files:
            if file.is_file():
                output.write(file, file.relative_to(base))
    temporary.replace(path)
    checksum = hashlib.sha256(path.read_bytes()).hexdigest()
    path.with_suffix('.sha256').write_text(f'{checksum}  {path.name}\n')
    with zipfile.ZipFile(path) as output:
        assert output.testzip() is None
    return {'file': str(path), 'bytes': path.stat().st_size, 'sha256': checksum}

assets = sorted((ROOT / 'public/images/guides/figma').rglob('*'))
assets += sorted((ROOT / FOLDER / 'figma-v2').rglob('*'))
asset_pack = archive(DEST.parent / 'agentesva-figma-assets-2026-10-18.zip', assets, ROOT)
full_pack = archive(DEST.parent / 'agentesva-editorial-2026-10-18.zip', sorted(DEST.rglob('*')), DEST.parent)
print(json.dumps({'assets': asset_pack, 'full': full_pack}))
