// Écrit docs/revue-voix-derja.html : une page à ouvrir pour écouter chaque message en derja,
// avec son texte. Une personne qui parle tunisien dit lesquels sont naturels et lesquels sont à refaire.
// Usage : npm run voix:revue
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const textes = JSON.parse(readFileSync(join(racine, 'content/derja/textes.json'), 'utf-8'));
const interf = JSON.parse(readFileSync(join(racine, 'content/interface/interface.json'), 'utf-8')).derja;
const intentions = new Map(interf.map((i) => [`aeb/${i.id}`, i.intention]));
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lignes = Object.entries(textes)
  .filter(([id]) => id.startsWith('aeb/'))
  .map(([id, t]) => {
    const fichier = `../public/audio/${id}.mp3`;
    const present = existsSync(join(racine, 'public/audio', `${id}.mp3`));
    return `<tr><td>${esc(id)}</td><td>${esc(intentions.get(id) ?? '')}</td><td dir="rtl" lang="ar-TN" class="ar">${esc(t.texte)}</td><td>${present ? `<audio controls preload="none" src="${fichier}"></audio>` : 'pas encore généré'}</td><td>${esc(t.statut)}</td></tr>`;
  });
writeFileSync(
  join(racine, 'docs/revue-voix-derja.html'),
  `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Voix en derja à écouter</title>
<style>body{font:16px system-ui;margin:24px;color:#3a1d38}table{border-collapse:collapse;width:100%}td,th{border:1px solid #f0cfd9;padding:8px;vertical-align:top}th{background:#ffe0ea;text-align:left}.ar{font-size:1.25rem}</style>
<h1>Voix en derja à écouter</h1>
<p>Pour chaque message : écouter, puis dire s'il est naturel en tunisien, compréhensible et respectueux. Noter les numéros à refaire.</p>
<table><tr><th>Identifiant</th><th>Intention</th><th>Texte donné à la voix</th><th>Écoute</th><th>Statut</th></tr>${lignes.join('')}</table></html>
`,
);
console.log(`${lignes.length} message(s) dans docs/revue-voix-derja.html`);
