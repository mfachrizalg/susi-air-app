import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { DataService } from '../src/data/data.service.js';

// Pass-through by default. The test below swaps in a copy of one file with a key removed.
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) };
});

describe('DataService boot', () => {
  it('throws at construction when a required key is missing from a data file', () => {
    const real = vi.mocked(readFileSync).getMockImplementation();
    if (!real)
      throw new Error('readFileSync has no pass-through implementation');
    vi.mocked(readFileSync).mockImplementation((file, encoding) => {
      const json = JSON.parse(real(file, encoding) as string);
      if (String(file).endsWith('mock-documents.json')) delete json.thresholds;
      return JSON.stringify(json);
    });
    try {
      expect(() => new DataService()).toThrow(
        'mock-documents.json: missing "thresholds.warningDays"',
      );
    } finally {
      vi.mocked(readFileSync).mockImplementation(real);
    }
  });
});
