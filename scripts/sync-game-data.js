// sync-game-data.js — Valida os dados do planner contra a pasta do jogo (fonte da verdade).
//
// Guia de Migração, Apêndice A:
//   - A pasta do jogo é referência para validar HEROES_DATA / ITEMS_DATA / RELICS_DATA
//   - ⚠️ NÃO modifica nada na pasta do jogo — somente leitura (regra A.7)
//   - Este script NÃO altera src/data/ automaticamente: ele valida e reporta.
//     Alterações de stats exigem extração com AssetRipper/UABE (ver A.8) + revisão humana.
//
// Uso:  node scripts/sync-game-data.js [--game "C:\...\Guildrun Demo"]
// Saída: relatório de versão, inventário e validação dos 25 heróis + 7 classes.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { HEROES_DATA, SYNERGY_CONFIG } from '../src/data/data.js';

// ------------------------------------------------------------------
// Configuração
// ------------------------------------------------------------------

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // guildrun-planner/

const argIdx = process.argv.indexOf('--game');
const GAME_DIR = argIdx !== -1 && process.argv[argIdx + 1]
  ? process.argv[argIdx + 1]
  : 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Guildrun Demo';

const DATA_DIR = path.join(GAME_DIR, 'Guildrun_Data');
const AA_DIR = path.join(DATA_DIR, 'StreamingAssets', 'aa');
const BUNDLE_DIR = path.join(AA_DIR, 'StandaloneWindows64');

// ------------------------------------------------------------------
// Utilitários (latin-1 = byte 1:1, mesmo método dos scans da migração)
// ------------------------------------------------------------------

const readLatin1 = (file) => fs.readFileSync(file, 'latin1');
const exists = (p) => fs.existsSync(p);
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

function countOccurrences(haystack, needle) {
  let count = 0;
  let idx = 0;
  const lower = haystack.toLowerCase();
  const target = needle.toLowerCase();
  while ((idx = lower.indexOf(target, idx)) !== -1) {
    count++;
    idx += target.length;
  }
  return count;
}

// ------------------------------------------------------------------
// 1. Versão do jogo (A.1: "Atualizações do jogo → timestamps, version.txt")
// ------------------------------------------------------------------

function readVersionInfo() {
  const info = {};
  if (!exists(GAME_DIR)) {
    console.error(`❌ Pasta do jogo não encontrada: ${GAME_DIR}`);
    console.error('   Use: node scripts/sync-game-data.js --game "<caminho da pasta Guildrun Demo>"');
    process.exit(1);
  }
  const appInfoPath = path.join(DATA_DIR, 'app.info');
  if (exists(appInfoPath)) {
    const lines = readLatin1(appInfoPath).split(/\r?\n/).filter(Boolean);
    info.publisher = lines[0];
    info.game = lines[1];
  }
  const bootPath = path.join(DATA_DIR, 'boot.config');
  if (exists(bootPath)) {
    const m = readLatin1(bootPath).match(/build-guid=([0-9a-f]+)/);
    if (m) info.buildGuid = m[1];
  }
  const stats = fs.statSync(DATA_DIR);
  info.lastModified = stats.mtime.toISOString().slice(0, 10);
  return info;
}

// ------------------------------------------------------------------
// 2. Inventário dos dados (A.2: estrutura típica de jogo Unity)
// ------------------------------------------------------------------

function inventory() {
  const groups = { assets: [], bundles: [], banks: [] };
  if (exists(DATA_DIR)) {
    for (const f of fs.readdirSync(DATA_DIR)) {
      if (f.endsWith('.assets')) groups.assets.push(path.join(DATA_DIR, f));
    }
  }
  if (exists(BUNDLE_DIR)) {
    for (const f of fs.readdirSync(BUNDLE_DIR)) {
      if (f.endsWith('.bundle')) groups.bundles.push(path.join(BUNDLE_DIR, f));
    }
  }
  const saDir = path.join(DATA_DIR, 'StreamingAssets');
  if (exists(saDir)) {
    for (const f of fs.readdirSync(saDir)) {
      if (f.endsWith('.bank')) groups.banks.push(path.join(saDir, f));
    }
  }
  return groups;
}

// ------------------------------------------------------------------
// 3. Corpus legível (mesmas fontes validadas na migração)
// ------------------------------------------------------------------

function buildCorpus(groups) {
  const parts = [];
  for (const f of [...groups.assets, ...groups.bundles]) parts.push(readLatin1(f));
  const catalog = path.join(AA_DIR, 'catalog.bin');
  if (exists(catalog)) parts.push(readLatin1(catalog));
  return parts.join('');
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

const version = readVersionInfo();
console.log('════════════════════════════════════════════════════════════');
console.log('  GuildRun Planner — Sincronização com dados do jogo');
console.log('════════════════════════════════════════════════════════════\n');

console.log('Jogo:');
console.log(`  pasta      : ${GAME_DIR}`);
console.log(`  editora    : ${version.publisher ?? '—'}`);
console.log(`  jogo       : ${version.game ?? '—'}`);
console.log(`  build-guid : ${version.buildGuid ?? '—'}`);
console.log(`  modificado : ${version.lastModified}\n`);

const groups = inventory();
const totalAssets = groups.assets.reduce((s, f) => s + fs.statSync(f).size, 0);
const totalBundles = groups.bundles.reduce((s, f) => s + fs.statSync(f).size, 0);
console.log('Inventário:');
console.log(`  ${groups.assets.length} arquivos .assets (${mb(totalAssets)}) — cenas e objetos Unity serializados`);
console.log(`  ${groups.bundles.length} bundles Addressables (${mb(totalBundles)}) — principalmente localização (string tables)`);
console.log(`  ${groups.banks.length} bancos FMOD (.bank) — áudio\n`);

console.log('Corpus legível sendo carregado...');
const corpus = buildCorpus(groups);
console.log(`  ${mb(corpus.length)} de texto bruto escaneado\n`);

console.log('──────────────────────────────────────────────────────────');
console.log('Validação dos heróis (HEROES_DATA vs. strings do jogo):');
console.log('──────────────────────────────────────────────────────────');
let validados = 0;
for (const hero of HEROES_DATA) {
  const count = countOccurrences(corpus, hero.name);
  const ok = count > 0;
  if (ok) validados++;
  console.log(`  ${ok ? '✔' : '✘'} ${hero.name.padEnd(10)} (${String(count).padStart(5)} ocorrências)`);
}
console.log(`\n  Heróis validados: ${validados}/${HEROES_DATA.length}\n`);

console.log('──────────────────────────────────────────────────────────');
console.log('Validação das classes (SYNERGY_CONFIG):');
console.log('──────────────────────────────────────────────────────────');
let classesOk = 0;
for (const className of Object.keys(SYNERGY_CONFIG)) {
  const count = countOccurrences(corpus, className);
  const ok = count > 0;
  if (ok) classesOk++;
  console.log(`  ${ok ? '✔' : '✘'} ${className}`);
}
console.log(`\n  Classes validadas: ${classesOk}/${Object.keys(SYNERGY_CONFIG).length}\n`);

console.log('──────────────────────────────────────────────────────────');
console.log('Limitações conhecidas (documentadas no CHANGELOG.md):');
console.log('──────────────────────────────────────────────────────────');
console.log('  • Itens e relíquias: os NOMES vivem nos bundles de localização');
console.log('    comprimidos com LZ4 — a maioria não é visível em varredura bruta.');
console.log('    Ex.: "Vampirism" aparece; "Adaptive Sword" não (compressão, não ausência).');
console.log('  • STATS numéricos: serializados em binário Unity (ScriptableObjects).');
console.log('    Extração estruturada requer AssetRipper ou UABE (guia, A.8).');
console.log('  • IMAGENS de heróis: Texture2D empacotada — requer AssetRipper.');
console.log('  • Este script é READ-ONLY na pasta do jogo (guia, A.7).\n');

const exitCode = (validados === HEROES_DATA.length && classesOk === Object.keys(SYNERGY_CONFIG).length) ? 0 : 1;
console.log(exitCode === 0
  ? '✅ Validação de nomes completa. Stats mantidos (sem fonte estruturada legível).'
  : '⚠️ Alguns nomes não foram encontrados no corpus legível — investigar manualmente.');
process.exit(exitCode);
