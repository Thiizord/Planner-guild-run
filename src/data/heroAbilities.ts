// heroAbilities.js - Kit base (rank C) de cada herói: 1 habilidade (passiva ou ativa).
// Fonte: guildrunbuild.com/en/abilities (patch 0.5.12)
// A passiva/ativa base NÃO tem tier — é o kit inicial no rank C.

export interface BaseAbility {
  name: string;
  kind: 'passive' | 'active';
  description: string;
}

export const HERO_BASE_ABILITIES: Record<string, BaseAbility> = {
  irini: {
    name: 'Limitless', kind: 'passive',
    description: 'Each auto attack, gain 1 Attack Speed. After Stall (15), auto attacks deal 100% Attack Speed bonus damage.',
  },
  hoyoung: {
    name: 'Killshot', kind: 'active',
    description: 'Fire an arrow at the farthest enemy. It deals 250 (+300% Attack, +300% Magic) damage and gains 100% Crit, +50 per Rank additional Crit.',
  },
  reyna: {
    name: 'Triple Threat', kind: 'active',
    description: 'Unleash a 3-punch combo. Each punch counts as an auto attack that deals 100% (+100% Attack, +50% Magic) damage (Max: 500%) and gives Reyna lasting Shields.',
  },
  yuuna: {
    name: 'Shuriken Shadow Strike', kind: 'active',
    description: 'Leap into the air and throw 1 (+1 per 40 Crit) shurikens at the lowest-health enemy for 150 (+150% Attack, +150% Magic) damage each. Max Shurikens: 10.',
  },
  zuri: {
    name: 'Stone Skin', kind: 'passive',
    description: 'On Crit, permanently gain 1 Defense and 1 Magic. Triggers 2 (+1 per 20 Crit, +1 per 60 Defense) times per combat.',
  },
  aria: {
    name: 'Requiem Barrage', kind: 'active',
    description: 'Channel an energy beam for 2.5 seconds. Each half second, deal 25 (+75% Magic) damage, inflict Frost and Burn on enemies in range.',
  },
  nyx: {
    name: 'Ferality', kind: 'passive',
    description: 'For Rush (5), gain 5 (+25% Attack Speed) Attack Speed and 5 (+25% Attack) Attack for each time this ability has triggered this combat.',
  },
  pollen: {
    name: 'Sanctuary of Bloom', kind: 'active',
    description: 'Create a flower field for 5 seconds. Each second, inflict Poison on enemies and apply Shields to Heroes inside the field.',
  },
  niklas: {
    name: 'Red Hot Deals', kind: 'passive',
    description: 'Niklas has an extra item slot. When he survives combat, consume the item in his leftmost item slot to permanently gain 50% of its stats.',
  },
  fiona: {
    name: 'Vault Spark', kind: 'active',
    description: 'Spark a protective vault. Apply 250 (+250% Magic) Shields to the 1 (+1 per 12 Mana Regen) lowest current % Max HP Heroes.',
  },
  rowan: {
    name: 'Hearty', kind: 'passive',
    description: 'After Stall (10), gain 2 (+1 per 100 Max Health, +1 per 15 Defense) HP/S.',
  },
  skorn: {
    name: 'Retribution', kind: 'passive',
    description: 'When auto attacked after Stall (10), deal 2 (+100% Magic) damage and inflict 1 (+1 per 50 Defense) Poison on the attacker.',
  },
  logan: {
    name: 'Execution', kind: 'active',
    description: 'Swing a crushing axe to deal damage scaling with Attack and Magic. Logan gains power by dealing damage with this ability.',
  },
  funke: {
    name: 'Wildfire', kind: 'active',
    description: "Blast a fireball at all enemies in Funke's range, dealing 175 (+200% Magic) damage and inflicting 75% Magic Burn.",
  },
  tilly: {
    name: 'Luxurious', kind: 'passive',
    description: 'Gain 25% Attack as Attack Speed and 25% Attack Speed as Attack. Every 25 auto attacks, gain 2 (+2 per Rank) Shards.',
  },
  gustav: {
    name: 'Blizzard', kind: 'active',
    description: 'Create a Blizzard for 5 seconds. Each second, inflict Frost and deal damage to enemies inside. Heroes inside gain Shields.',
  },
  ratna: {
    name: 'Starfall', kind: 'active',
    description: 'Conjure celestial magic to deal Magic damage. On kill, permanently gain Magic. On Crit, Stun all enemies.',
  },
  rip: {
    name: 'Bloodthirsty', kind: 'passive',
    description: 'For Rush (10), gain 5% Max Health Attack. Whenever Rip or an adjacent enemy first drops below 50% Max HP, refresh all Rush abilities and gain 2% Max Health Attack Speed.',
  },
  karsu: {
    name: 'Snowpiercer', kind: 'active',
    description: 'Loose a volley of 5 (+1 per 50 Attack Speed) arrows at nearby enemies. Each arrow deals 25 (+100% Attack, +100% Magic) damage and inflicts Frost.',
  },
  ming: {
    name: 'Inner Flame', kind: 'passive',
    description: 'Each second, inflict 1 per 600 Max Health Burn on adjacent enemies. For Rush (7), double the Burn.',
  },
  pimenta: {
    name: 'Pepper Spray', kind: 'active',
    description: 'Create a poison cloud around Pimenta for 4 seconds. Each second, deal damage and inflict Poison to enemies inside.',
  },
  sal: {
    name: 'Permafrost', kind: 'active',
    description: "Sal empowers her attacks, causing them to also hit the nearest enemy to Sal's target, dealing bonus damage and inflicting Frost.",
  },
  dragomir: {
    name: 'Devour', kind: 'active',
    description: 'Gain 1 (+10% Crit) Omnivamp, then deal 250 (+250% Magic, +1000% Omnivamp) damage. On kill, gain 2 (+2 per Rank) Shards.',
  },
  kai: {
    name: 'Resolute Strike', kind: 'active',
    description: 'Charge up a mighty attack, gaining 300 (+400% Attack, +250% Magic) Shields. After 2 seconds, deal damage plus bonus damage equal to Shields gained.',
  },
  grace: {
    name: 'Salvation', kind: 'active',
    description: 'Bless the lowest % Max HP Hero, applying Shields for 6 (+25% Mana Regen) seconds and healing them for half that amount.',
  },
};
