// Génère la fiche d'enregistrement (CSV) : une ligne par audio à enregistrer.
// Usage : npm run audio:fiche  ->  docs/fiche-enregistrement.csv
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventaireAudio } from '../src/domain/inventaire.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const json = (chemin) => JSON.parse(readFileSync(join(racine, chemin), 'utf-8'));

const situations = readdirSync(join(racine, 'content/situations'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(racine, 'content/situations', d.name, 'situation.json')))
  .map((d) => json(`content/situations/${d.name}/situation.json`))
  .sort((a, b) => a.ordre - b.ordre);
const decouverte = json('content/situations/saluer/decouverte.json');
const intentions = json('content/interface/interface.json').derja;
const indexChemin = join(racine, 'public/audio/index.json');
const present = existsSync(indexChemin) ? json('public/audio/index.json').fichiers : {};

const guillemets = (t) => `"${String(t).replaceAll('"', '""')}"`;
const lignes = [
  ['Identifiant', 'Langue', 'Type', 'Phrase à dire (français) ou intention (derja)', 'Phrase en derja (à compléter par la locutrice)', 'Durée visée', 'Nom du fichier attendu', 'Statut'],
];
const besoins = inventaireAudio(situations, intentions, decouverte);
for (const b of besoins) {
  const derja = b.langue === 'aeb';
  lignes.push([
    b.id,
    derja ? 'derja tunisien' : 'français',
    b.type,
    b.texteOuIntention,
    '',
    derja ? '5 à 15 secondes' : b.type.includes('naturelle') ? '3 à 6 secondes' : '1 à 4 secondes',
    `${b.id}.mp3`,
    present[b.id] ? 'enregistré' : 'à enregistrer',
  ]);
}
const csv = '﻿' + lignes.map((l) => l.map(guillemets).join(';')).join('\r\n') + '\r\n';
writeFileSync(join(racine, 'docs/fiche-enregistrement.csv'), csv);
const d = besoins.filter((b) => b.langue === 'aeb').length;
console.log(`Fiche écrite : ${besoins.length} lignes (${d} en derja, ${besoins.length - d} en français).`);
