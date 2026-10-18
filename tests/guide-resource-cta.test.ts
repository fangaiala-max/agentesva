import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { compraUrlDeItem } from '../src/data/biblioteca/compra-urls';
import { ITEMS } from '../src/data/biblioteca';

const root = path.resolve(process.cwd());
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('CTA editorial de recursos en guías', () => {
  it('resuelve gr22 desde la fuente central', () => {
    expect(ITEMS.find((item) => item.id === 'gr22')?.titulo).toContain('ChatGPT y Perplexity');
    expect(compraUrlDeItem('gr22')).toMatch(/^https:\/\/buy\.stripe\.com\//);
  });

  it('el renderer separa CTA de servicio y CTA de recurso', () => {
    const page = read('src/pages/guias/[slug].astro');
    expect(page).toContain('d.servicio &&');
    expect(page).toContain('d.recurso &&');
    expect(page).toContain('GuideResourceCTA');
  });

  it('el CTA de recurso usa el evento y los atributos seguros', () => {
    const cta = read('src/components/GuideResourceCTA.astro');
    expect(cta).toContain('compraUrlDeItem(resourceId)');
    expect(cta).toContain('data-track-event="resource_cta_click"');
    expect(cta).toContain('data-track-resource-id={resourceId}');
    expect(cta).toContain('data-track-destination="stripe"');
    expect(cta).not.toContain('buy.stripe.com');
  });
});
