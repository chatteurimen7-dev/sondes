// Génère les voix en derja avec la voix tunisienne ar-TN-ReemNeural (Microsoft Azure AI Speech).
// Les messages sont synthétisés une seule fois, puis stockés dans public/audio/aeb : l'application
// n'appelle jamais le service pendant que Sondes l'utilise, donc aucun coût récurrent ni envoi de données.
//
// Prérequis : une ressource Azure AI Speech. Variables d'environnement :
//   AZURE_SPEECH_KEY     clé de la ressource (jamais écrite dans un fichier)
//   AZURE_SPEECH_REGION  région de la ressource, par exemple francecentral (défaut)
// Options : --seulement=aeb/bravo-1,aeb/suite   --forcer (refaire même si le fichier existe)   --a-blanc (liste seulement)
// Usage   : npm run voix:generer
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aSynthetiser, adresseSynthese, construireSsml } from '../src/domain/voixDerja.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (nom) => args.find((a) => a.startsWith(`--${nom}=`))?.split('=')[1];
const drapeau = (nom) => args.includes(`--${nom}`);

const textes = JSON.parse(readFileSync(join(racine, 'content/derja/textes.json'), 'utf-8'));
const seulement = option('seulement')?.split(',');
const dossierSortie = process.env.SORTIE_AUDIO ?? join(racine, 'public/audio');
const region = process.env.AZURE_SPEECH_REGION ?? 'francecentral';
const adresse = process.env.AZURE_SPEECH_ADRESSE ?? adresseSynthese(region);
const cle = process.env.AZURE_SPEECH_KEY;

const aFaire = Object.entries(textes)
  .filter(([id]) => id.startsWith('aeb/'))
  .filter(([id, t]) => (seulement ? seulement.includes(id) : true) && aSynthetiser(t))
  .filter(([id]) => drapeau('forcer') || !existsSync(join(dossierSortie, `${id}.mp3`)));

const caracteres = aFaire.reduce((n, [, t]) => n + t.texte.length, 0);
console.log(`${aFaire.length} message(s) à synthétiser, ${caracteres} caractères.`);
if (drapeau('a-blanc') || aFaire.length === 0) process.exit(0);
if (!cle) {
  console.error('AZURE_SPEECH_KEY est absente : rien n’est envoyé.');
  process.exit(1);
}

let ok = 0;
for (const [id, t] of aFaire) {
  const rep = await fetch(adresse, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': cle,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'sondes-voix',
    },
    body: construireSsml(t.texte),
  });
  if (!rep.ok) {
    console.error(`Échec pour ${id} : ${rep.status} ${rep.statusText}`);
    if (rep.status === 401 || rep.status === 403) process.exit(1);
    continue;
  }
  const chemin = join(dossierSortie, `${id}.mp3`);
  mkdirSync(dirname(chemin), { recursive: true });
  writeFileSync(chemin, Buffer.from(await rep.arrayBuffer()));
  ok += 1;
  console.log(`écrit : ${id}`);
}
console.log(`${ok} fichier(s) écrit(s). Lancez ensuite : npm run medias:index`);
