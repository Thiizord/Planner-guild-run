// data.test.ts — Valida consistencia dos dados: herois, habilidades, specs, imagens.
import { describe, it, expect } from 'vitest';
import { HEROES_DATA, ITEMS_DATA, RELICS_DATA, SYNERGY_CONFIG } from '../src/data/data';
import { HERO_BASE_ABILITIES } from '../src/data/heroAbilities';
import { SPECIALIZATIONS } from '../src/data/specializations';
import fs from 'node:fs';
import path from 'node:path';

const heroIds = HEROES_DATA.map((h) => h.id);
const abilityIds = Object.keys(HERO_BASE_ABILITIES);
const specIds = Object.keys(SPECIALIZATIONS);
const CLASSES = ['Warrior', 'Tank', 'Vanguard', 'Assassin', 'Duelist', 'Mystic', 'Mage'];

describe('HEROES_DATA', () => {
  it('tem exatamente 25 herois', () => {
    expect(HEROES_DATA).toHaveLength(25);
  });

  it('todos os herois tem id unico', () => {
    const ids = HEROES_DATA.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos os herois tem classe valida', () => {
    for (const h of HEROES_DATA) {
      expect(CLASSES).toContain(h.class);
      if (h.class2) expect(CLASSES).toContain(h.class2);
    }
  });

  it('todos os herois tem baseStats', () => {
    for (const h of HEROES_DATA) {
      expect(h.baseStats).toBeDefined();
      expect(Object.keys(h.baseStats).length).toBeGreaterThan(0);
    }
  });

  it('todos os herois tem role', () => {
    for (const h of HEROES_DATA) {
      expect(h.role).toBeTruthy();
    }
  });
});

describe('HERO_BASE_ABILITIES', () => {
  it('tem exatamente 25 entradas (uma por heroi)', () => {
    expect(abilityIds).toHaveLength(25);
  });

  it('cada heroi tem uma habilidade base', () => {
    for (const id of heroIds) {
      expect(abilityIds).toContain(id);
    }
  });

  it('nao ha entradas orfas', () => {
    for (const id of abilityIds) {
      expect(heroIds).toContain(id);
    }
  });

  it('cada habilidade tem nome, tipo e descricao', () => {
    for (const [id, ab] of Object.entries(HERO_BASE_ABILITIES)) {
      expect(ab.name, `${id}.name`).toBeTruthy();
      expect(['active', 'passive']).toContain(ab.kind);
      expect(ab.description.length).toBeGreaterThan(10);
    }
  });
});

describe('SPECIALIZATIONS', () => {
  it('tem exatamente 25 entradas (uma por heroi)', () => {
    expect(specIds).toHaveLength(25);
  });

  it('cada heroi tem exatamente 3 especializacoes', () => {
    for (const [id, specs] of Object.entries(SPECIALIZATIONS)) {
      expect(specs, id).toHaveLength(3);
    }
  });

  it('cada spec tem id, nome, tier, tipo e descricao', () => {
    for (const [heroId, specs] of Object.entries(SPECIALIZATIONS)) {
      for (const spec of specs) {
        expect(spec.id, `${heroId} spec id`).toBeTruthy();
        expect(spec.name).toBeTruthy();
        expect(['S', 'A', 'B', 'C', 'D']).toContain(spec.tier);
        expect(['active', 'passive']).toContain(spec.kind);
        expect(spec.description.length).toBeGreaterThan(5);
      }
    }
  });

  it('nao ha entradas orfas', () => {
    for (const id of specIds) {
      expect(heroIds).toContain(id);
    }
  });
});

describe('SYNERGY_CONFIG', () => {
  it('cobre todas as 7 classes', () => {
    for (const cls of CLASSES) {
      expect(SYNERGY_CONFIG[cls]).toBeDefined();
    }
  });

  it('cada classe tem icon e label', () => {
    for (const [cls, cfg] of Object.entries(SYNERGY_CONFIG)) {
      expect(cfg.icon, cls).toBeTruthy();
      expect(cfg.label).toBeTruthy();
    }
  });
});

describe('IMAGES', () => {
  const pub = path.resolve(__dirname, '..', 'public');

  const checkExists = (imgPath: string) => {
    const clean = imgPath.replace('./', '');
    return fs.existsSync(path.join(pub, clean));
  };

  it('todos os herois com imagem tem arquivo correspondente', () => {
    const withImg = HEROES_DATA.filter((h) => h.image);
    expect(withImg.length).toBe(25);
    for (const h of withImg) {
      expect(checkExists(h.image!), `heroi ${h.id}: ${h.image}`).toBe(true);
    }
  });

  it('itens com icone tem arquivo correspondente', () => {
    const withIcon = ITEMS_DATA.filter((i) => i.icon);
    for (const item of withIcon) {
      expect(checkExists(item.icon!), `item ${item.id}`).toBe(true);
    }
  });

  it('reliquias com icone tem arquivo correspondente', () => {
    const withIcon = RELICS_DATA.filter((r) => r.icon);
    for (const relic of withIcon) {
      expect(checkExists(relic.icon!), `relic ${relic.id}`).toBe(true);
    }
  });

  it('background do campo de batalha existe', () => {
    expect(fs.existsSync(path.join(pub, 'assets', 'battlefield-background.png'))).toBe(true);
  });

  it('banner existe', () => {
    expect(fs.existsSync(path.join(pub, 'assets', 'banner.webp'))).toBe(true);
  });
});
