// Dresse la liste des audios et images présents dans public/ et l'écrit dans index.json.
// À relancer chaque fois qu'on ajoute ou remplace un fichier (npm run medias:index).
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const EXT_AUDIO = new Set(['.mp3', '.ogg', '.wav', '.m4a', '.webm']);
const EXT_IMAGE = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp']);

function ecrire(sousDossier, extensions, langues) {
  const fichiers = {};
  if (langues) {
    for (const l of langues) {
      for (const nom of readdirSync(join(racine, sousDossier, l), { withFileTypes: true })) {
        if (!nom.isFile() || !extensions.has(extname(nom.name).toLowerCase())) continue;
        fichiers[`${l}/${basename(nom.name, extname(nom.name))}`] = `${sousDossier}/${l}/${nom.name}`;
      }
    }
  } else {
    for (const nom of readdirSync(join(racine, sousDossier), { withFileTypes: true })) {
      if (!nom.isFile() || !extensions.has(extname(nom.name).toLowerCase())) continue;
      fichiers[basename(nom.name, extname(nom.name))] = `${sousDossier}/${nom.name}`;
    }
  }
  writeFileSync(join(racine, sousDossier, 'index.json'), JSON.stringify({ fichiers }, null, 2) + '\n');
  return Object.keys(fichiers).length;
}

const nAudio = ecrire('audio', EXT_AUDIO, ['fr', 'aeb']);
const nImages = ecrire('images', EXT_IMAGE, undefined);
console.log(`Index écrit : ${nAudio} audio(s), ${nImages} image(s).`);
