// specializations.js - 75 especializacoes (3 por heroi), desbloqueadas no rank B.
// Fonte: guildrunbuild.com/en/specializations (patch 0.5.12)
// Cada spec concede uma habilidade; algumas dao +slots de item ou classe secundaria.

export const SPECIALIZATIONS = {
  irini: [
    { id: 'the-electric', name: 'The Electric', tier: 'A', kind: 'active', description: 'Call down lightning, dealing damage per Stall and Rush triggered this game.' },
    { id: 'the-mighty', name: 'The Mighty', tier: 'B', kind: 'passive', description: 'After Stall (10), whenever a Duelist auto attacks it gains Attack Speed and Attack per Rank.' },
    { id: 'the-olympic', name: 'The Olympic', tier: 'D', kind: 'passive', description: 'Gain the unique quest item Zeus Thunder.' },
  ],
  hoyoung: [
    { id: 'the-conduit', name: 'The Conduit', tier: 'B', kind: 'passive', description: 'On kill, permanently gain Mana Regen and Stealth. Shares Mana Regen with Assassins and Mystics.' },
    { id: 'the-hunter', name: 'The Hunter', tier: 'C', kind: 'passive', description: 'Killshot gains Crit the first times it is cast each combat. On kill, gain Shards per hex from the enemy.' },
    { id: 'the-sniper', name: 'The Sniper', tier: 'D', kind: 'passive', description: 'Always target the furthest enemy. Auto attacks gain Attack and Crit per hex from the enemy.' },
  ],
  reyna: [
    { id: 'the-champion', name: 'The Champion', tier: 'A', kind: 'passive', description: 'Gain Attack per Rush triggered. Warriors gain Crit and Omnivamp per Rush. Backup.' },
    { id: 'the-brawler', name: 'The Brawler', tier: 'C', kind: 'passive', description: 'Triple Threat applies more Shields. Gain Attack per Shields, up to 50% Max HP.' },
    { id: 'the-boxer', name: 'The Boxer', tier: 'A', kind: 'passive', description: 'Every 3 auto attacks, deal bonus damage and inflict Burn.' },
  ],
  yuuna: [
    { id: 'the-shadow', name: 'The Shadow', tier: 'B', kind: 'passive', description: 'Below 75% Max HP, gains Stealth. Gains Mana and Stealth on trigger.' },
    { id: 'the-collector', name: 'The Collector', tier: 'C', kind: 'passive', description: 'Shuriken Shadow Strike fires an additional shuriken. On kill, gain Shards.' },
    { id: 'the-nightshade', name: 'The Nightshade', tier: 'B', kind: 'passive', description: 'Shuriken Shadow Strike gains Crit vs Poisoned. Assassins inflict Poison on Crit. Backup.' },
  ],
  zuri: [
    { id: 'the-cruel', name: 'The Cruel', tier: 'C', kind: 'active', description: 'Petrify all enemies targeting Zuri, dealing damage, inflicting Poison, and Stunning.' },
    { id: 'the-serpents-kiss', name: "The Serpent's Kiss", tier: 'B', kind: 'passive', description: 'When auto attacked, inflict Poison on the attacker and gain HP/S per Rank.' },
    { id: 'the-bladedancer', name: 'The Bladedancer', tier: 'C', kind: 'passive', description: 'For Rush, auto attacks deal bonus damage and heal. After Stall, effect increases.' },
  ],
  aria: [
    { id: 'the-crescendo', name: 'The Crescendo', tier: 'C', kind: 'passive', description: 'On Stall trigger, permanently gain Magic. After Stall thresholds, gain Magic% and duration.' },
    { id: 'the-resplendent', name: 'The Resplendent', tier: 'B', kind: 'passive', description: 'Mages inflict more Debuffs. Aria inflicts even more. Backup.' },
    { id: 'the-harmony', name: 'The Harmony', tier: 'B', kind: 'passive', description: 'Requiem Barrage Shields Heroes.' },
  ],
  nyx: [
    { id: 'the-keen-eyed', name: 'The Keen-Eyed', tier: 'B', kind: 'passive', description: 'Assassins and Duelists instantly kill enemies below threshold Max HP. Backup.' },
    { id: 'the-wild', name: 'The Wild', tier: 'S', kind: 'active', description: 'Perform a 5-hit combo. Each hit counts as an auto attack with scaling damage.' },
    { id: 'the-spark', name: 'The Spark', tier: 'S', kind: 'passive', description: 'After Stall, auto attacks inflict Burn and Frost progressively.' },
  ],
  pollen: [
    { id: 'the-bloomer', name: 'The Bloomer', tier: 'B', kind: 'passive', description: 'After Stall, Double Sanctuary of Bloom healing and Shielding.' },
    { id: 'the-faes-kiss', name: "The Fae's Kiss", tier: 'C', kind: 'passive', description: 'After Stall, Sanctuary of Bloom inflicts more Poison and increases Debuffs.' },
    { id: 'the-earths-child', name: "The Earth's Child", tier: 'C', kind: 'passive', description: 'After Stall, Sanctuary of Bloom inflicts Frost and Burn per second.' },
  ],
  niklas: [
    { id: 'the-dealer', name: 'The Dealer', tier: 'C', kind: 'active', description: 'Swing a mace dealing damage and Stunning. Every 4 casts, create a random item.' },
    { id: 'the-executive', name: 'The Executive', tier: 'S', kind: 'passive', extraSlots: 2, description: 'Gain 2 item slots. For Rush, gain Shields per equipped item.' },
    { id: 'the-hoarder', name: 'The Hoarder', tier: 'B', kind: 'passive', description: 'For Rush, Vanguards and Tanks deal damage per Shard. Backup.' },
  ],
  fiona: [
    { id: 'the-right-hand', name: 'The Right Hand', tier: 'D', kind: 'passive', description: 'Every 5 casts, create a random item and gain Shards.' },
    { id: 'the-lustrous', name: 'The Lustrous', tier: 'D', kind: 'passive', description: 'On cast, gain Shields. Inflict Burn when Shielded Heroes are attacked. Backup.' },
    { id: 'the-tycoon', name: 'The Tycoon', tier: 'C', kind: 'passive', description: 'Every 5 casts, gain a Tycoon stack. Heroes gain Max HP per stack. Backup.' },
  ],
  rowan: [
    { id: 'the-tectonic', name: 'The Tectonic', tier: 'B', kind: 'active', description: 'Gain Shields, deal damage and Stun enemies in front of Rowan.' },
    { id: 'the-protector', name: 'The Protector', tier: 'B', kind: 'passive', description: 'On auto attack, gain Shields and deal bonus damage based on Shields.' },
    { id: 'the-friend', name: 'The Friend', tier: 'A', kind: 'passive', description: 'On Stall, permanently gain Max HP and Defense. Shares with Tanks and Vanguards.' },
  ],
  skorn: [
    { id: 'the-haughty', name: 'The Haughty', tier: 'A', kind: 'active', description: 'Taunt all enemies. Gain Shields per Stall trigger. Deal AoE damage after delay.' },
    { id: 'the-winters-bite', name: "The Winter's Bite", tier: 'C', kind: 'passive', description: 'Poison also inflicts Frost. Frost gains Shields per Rank.' },
    { id: 'the-bristleguard', name: 'The Bristleguard', tier: 'D', kind: 'passive', description: 'Per Tank in combat, inflict Poison on all enemies and grant Defense to Heroes. Backup.' },
  ],
  logan: [
    { id: 'the-iron', name: 'The Iron', tier: 'C', kind: 'passive', extraSlots: 1, description: 'Gain 1 item slot. For Rush, Warriors gain Attack and Defense per Rush trigger. Backup.' },
    { id: 'the-juggernaut', name: 'The Juggernaut', tier: 'C', kind: 'passive', description: 'Execution damage grants lasting Shields.' },
    { id: 'the-momentous', name: 'The Momentous', tier: 'B', kind: 'passive', description: 'On kill, gain Mana and permanently gain Attack and Crit.' },
  ],
  funke: [
    { id: 'the-stoked', name: 'The Stoked', tier: 'D', kind: 'passive', description: 'Mages gain Magic when enemies take Burn damage. Funke gains Mana on Burn. Backup.' },
    { id: 'the-inferno', name: 'The Inferno', tier: 'D', kind: 'passive', description: 'Gain Attack Range. At combat start and after Stall, inflict Burn on enemies in range.' },
    { id: 'the-detonator', name: 'The Detonator', tier: 'C', kind: 'passive', description: 'On cast, enemies in range take ticks of Burn damage.' },
  ],
  tilly: [
    { id: 'the-stylish', name: 'The Stylish', tier: 'B', kind: 'passive', extraSlots: 1, description: 'Gain 1 item slot. On auto attack, deal bonus damage per Shard generated.' },
    { id: 'the-sharp', name: 'The Sharp', tier: 'B', kind: 'passive', description: 'For Rush, Warriors gain Attack and Crit. After Stall, Duelists gain Attack Speed. Backup.' },
    { id: 'the-elegant', name: 'The Elegant', tier: 'C', kind: 'active', description: 'Gain Crit and Omnivamp, deal AoE damage to enemies in range.' },
  ],
  gustav: [
    { id: 'the-investor', name: 'The Investor', tier: 'C', kind: 'passive', description: 'At start, spend Shards for Investments. Heroes gain Mana Regen per Investment. Backup.' },
    { id: 'the-glacier', name: 'The Glacier', tier: 'B', kind: 'passive', description: 'Blizzard applies more Shields and targets Gustav. After Stall, gain Defense.' },
    { id: 'the-avalanche', name: 'The Avalanche', tier: 'C', kind: 'passive', description: 'On cast, gain Shard. On Shard generation, gain Mana Regen and Magic.' },
  ],
  ratna: [
    { id: 'the-fashionable', name: 'The Fashionable', tier: 'C', kind: 'passive', extraSlots: 1, description: 'Gain 1 item slot. Gain stats per rarity level of each equipped item.' },
    { id: 'the-ostentatious', name: 'The Ostentatious', tier: 'D', kind: 'passive', description: 'On cast, other Heroes gain Magic and Mana Regen. Mages and Mystics gain more. Backup.' },
    { id: 'the-magnanimous', name: 'The Magnanimous', tier: 'C', kind: 'passive', description: 'Starfall hits the lowest health enemy extra times. On kill, gain Stealth and stats.' },
  ],
  rip: [
    { id: 'the-glutton', name: 'The Glutton', tier: 'A', kind: 'passive', description: 'On Rush, permanently gain Max HP. Shares with Vanguards. Backup.' },
    { id: 'the-enraged', name: 'The Enraged', tier: 'B', kind: 'active', description: 'Enter a rage gaining Max HP, Attack Speed, and Omnivamp. Stacks.' },
    { id: 'the-brute', name: 'The Brute', tier: 'A', kind: 'passive', description: 'On Crit, steal Health from the target.' },
  ],
  karsu: [
    { id: 'the-falling-snow', name: 'The Falling Snow', tier: 'A', kind: 'passive', description: 'On auto attack, reduce Max Mana. After Stall, arrows gain Crit.' },
    { id: 'the-warband', name: 'The Warband', tier: 'A', kind: 'passive', description: 'On cast, permanently gain Crit, Attack, and Attack Speed. Shares with Duelists. Backup.' },
    { id: 'the-frostbite', name: 'The Frostbite', tier: 'B', kind: 'passive', description: 'On auto attack, fire an additional arrow with Frost and partial damage.' },
  ],
  ming: [
    { id: 'the-searing', name: 'The Searing', tier: 'B', kind: 'active', description: 'Channel flames dealing damage, inflicting Burn, and Stunning surrounding enemies.' },
    { id: 'the-tempered', name: 'The Tempered', tier: 'C', kind: 'passive', description: 'For Rush, Vanguards gain Max HP%. Backup.' },
    { id: 'the-enlightened', name: 'The Enlightened', tier: 'D', kind: 'passive', description: 'Increase Rush duration. For Rush, Ming is immune to damage.' },
  ],
  pimenta: [
    { id: 'the-spicy', name: 'The Spicy', tier: 'D', kind: 'passive', description: 'On auto attack, per Debuff type, inflict more and deal bonus damage.' },
    { id: 'the-seasoned', name: 'The Seasoned', tier: 'C', kind: 'passive', description: 'Pepper Spray expands. After Stall, Tanks and Mages gain Defense. Backup.' },
    { id: 'the-lover', name: 'The Lover', tier: 'C', kind: 'passive', description: 'Heroes behind Pimenta gain Attack Speed. Sal gains more.' },
  ],
  sal: [
    { id: 'the-breezy', name: 'The Breezy', tier: 'B', kind: 'passive', description: 'Mages and Duelists gain Attack Speed and Magic on Debuff. Backup.' },
    { id: 'the-lover', name: 'The Lover', tier: 'C', kind: 'passive', description: 'Heroes in front of Sal gain Defense. Pimenta gains more.' },
    { id: 'the-brisk', name: 'The Brisk', tier: 'B', kind: 'passive', description: 'Permafrost can Crit. On Crit, inflict Frost. On cast, gain Crit.' },
  ],
  dragomir: [
    { id: 'the-greedy', name: 'The Greedy', tier: 'D', kind: 'passive', description: 'Devour generates more Shards. On cast, consume Shards for Omnivamp and Crit.' },
    { id: 'the-sanguine', name: 'The Sanguine', tier: 'B', kind: 'passive', description: 'On cast, gain Omnivamp and teleport. On Devour kill, gain Mana and Stealth.' },
    { id: 'the-kingpin', name: 'The Kingpin', tier: 'A', kind: 'passive', description: 'For Rush, Assassins and Vanguards gain Omnivamp and Crit per Shard. Backup.' },
  ],
  kai: [
    { id: 'the-unstoppable', name: 'The Unstoppable', tier: 'C', kind: 'passive', description: 'Gain more Shields from all sources. Shields grant Attack.' },
    { id: 'the-bold', name: 'The Bold', tier: 'C', kind: 'passive', description: 'Resolute Strike is faster and larger. After Stall, gain Shields.' },
    { id: 'the-intrepid', name: 'The Intrepid', tier: 'D', kind: 'passive', description: 'On Crit for Rush, permanently gain Attack and Shields. Warrior Crits reduce target Defense.' },
  ],
  grace: [
    { id: 'the-selfless', name: 'The Selfless', tier: 'A', kind: 'passive', description: 'After Stall, Salvation targets all Heroes. Applies Shields and heals. Backup.' },
    { id: 'the-benevolent', name: 'The Benevolent', tier: 'B', kind: 'passive', description: 'On cast after Stall, permanently give the target primary stats per class.' },
    { id: 'the-radiant', name: 'The Radiant', tier: 'C', kind: 'passive', description: 'When a Mystic Shields a Hero, grant Attack and Magic. Backup.' },
  ],
};

// tiers de rank
export const RANKS = ['C', 'B', 'A', 'S'];
