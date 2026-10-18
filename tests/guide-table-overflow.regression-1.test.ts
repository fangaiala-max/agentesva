import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());

describe('tablas de guías en viewports estrechos', () => {
  // Regression: ISSUE-001 — las tablas ensanchaban la página y recortaban columnas en móvil
  // Found by /qa on 2026-08-13
  // Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-13.md
  it('limita cada tabla al artículo y permite desplazar sus columnas', () => {
    const css = fs.readFileSync(path.join(root, 'src/styles/global.css'), 'utf8');
    const tableRule = css.match(/\.prose table\s*\{([^}]+)\}/)?.[1];

    expect(tableRule).toBeDefined();
    expect(tableRule).toMatch(/display:\s*block/);
    expect(tableRule).toMatch(/max-width:\s*100%/);
    expect(tableRule).toMatch(/overflow-x:\s*auto/);
  });
});
