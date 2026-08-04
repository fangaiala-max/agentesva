import { describe, expect, it } from 'vitest';
import { PROMPTS } from '../src/data/biblioteca/prompts';
import { PROMPT_LANDINGS, promptLanding } from '../src/data/prompt-landings';

describe('landings SEO de prompts', () => {
  it('tienen slugs únicos y cubren los clústeres prioritarios', () => {
    const slugs = PROMPT_LANDINGS.map((landing) => landing.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(expect.arrayContaining([
      'chatgpt',
      'marketing',
      'ventas',
      'redes-sociales',
      'atencion-cliente',
      'empresas-pymes',
    ]));
  });

  it('cada landing referencia prompts existentes y no repite ids dentro de la página', () => {
    const ids = new Set(PROMPTS.map((prompt) => prompt.id));
    for (const landing of PROMPT_LANDINGS) {
      expect(landing.promptIds.length).toBeGreaterThanOrEqual(10);
      expect(new Set(landing.promptIds).size).toBe(landing.promptIds.length);
      for (const id of landing.promptIds) expect(ids.has(id), `${landing.slug}: ${id}`).toBe(true);
    }
  });

  it('incluye metadatos y FAQs suficientes para responder la intención', () => {
    for (const landing of PROMPT_LANDINGS) {
      expect(landing.seoTitle).toContain('AgentesVA');
      expect(landing.description.length).toBeGreaterThan(80);
      expect(landing.description.length).toBeLessThanOrEqual(165);
      expect(landing.faqs.length).toBeGreaterThanOrEqual(3);
    }
    expect(promptLanding('chatgpt')?.title).toContain('ChatGPT');
    expect(promptLanding('no-existe')).toBeUndefined();
  });
});
