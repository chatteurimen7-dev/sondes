// Génère la documentation pédagogique à partir des contenus :
//  - docs/cartographie-situations.md : vue d'ensemble des situations ;
//  - docs/situations/NN-<situation>.md : une fiche par situation (contexte, objectif, personnages,
//    phrases et explications en derja, dialogues, imprévus, exercices, simulation, mission, suivi).
// Les fiches suivent toujours les contenus : on ne les modifie pas à la main.
// Usage : npm run docs:situations
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = (c) => JSON.parse(readFileSync(join(racine, c), 'utf-8'));
const situations = readdirSync(join(racine, 'content/situations'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(racine, 'content/situations', d.name, 'situation.json')))
  .map((d) => lire(`content/situations/${d.name}/situation.json`))
  .sort((a, b) => a.ordre - b.ordre);
const parId = new Map(situations.flatMap((s) => s.items.map((i) => [i.id, i])));
const parcours = situations.filter((s) => s.type === 'parcours');

const UNIVERS = {
  maison: 'Maison et voisinage',
  courses: 'Courses',
  deplacements: 'Déplacements',
  services: 'Services et démarches',
  echanges: 'Échanges quotidiens',
  sons: 'Atelier des sons',
};
const PERSONNAGES = {
  saluer: "Une voisine et un voisin adultes, aimables, qui croisent Sondes dans l'immeuble ou dans la rue. Un voisin pressé qui parle vite (imprévu).",
  pain: 'La boulangère ou le boulanger, adulte, qui sert Sondes derrière le comptoir.',
  prix: 'Un vendeur ou une vendeuse dans un magasin ou au marché.',
  fruits: 'Une marchande de fruits et légumes au marché.',
  caisse: 'Un caissier ou une caissière.',
  voisin: 'Un voisin ou une voisine adulte, dans le hall, l\'escalier ou sur le palier.',
  service: 'Un voisin ou une voisine adulte, qui demande ou rend un petit service.',
  bus: 'Le chauffeur de bus, un passager ou une passagère.',
  ticket: "Une employée au guichet ou à l'accueil des transports.",
  chemin: 'Un passant ou une passante adulte dans la rue.',
  gare: 'Un agent de la gare, adulte, et les annonces dans la gare.',
  pharmacie: 'Un pharmacien ou une pharmacienne.',
  rdv: "La personne qui répond à l'accueil ou au téléphone d'un cabinet.",
  renseignement: "La personne à l'accueil d'un lieu public.",
  poste: "Une employée de la poste, derrière le guichet.",
  repeter: 'Des personnes adultes qui parlent vite, bas ou de façon peu claire.',
  comprendre: 'Des personnes adultes avec qui Sondes explique qu’elle apprend le français.',
  conversation: 'Une voix dans une annonce, ou deux adultes qui parlent entre eux.',
  telephone: 'Une personne adulte qui appelle (mairie, cabinet, voisin).',
};
const SEANCE_TYPES = { sons: 'Atelier' };
const imprevus = (s) => s.seances.flatMap((x) => x.dialogue ?? []).filter((t) => t.qui === 'autre' && 'texte' in t && t.texte.length > 60);
const nbDerja = (s) => 1 + s.items.length + s.seances.length * 2 + s.seances.filter((x) => x.missionIntention).length;

// --- Cartographie ---
let carto = `# Cartographie des situations

Vue d'ensemble des ${parcours.length} situations du parcours et de l'atelier des sons. Les situations sont fictives mais réalistes : elles représentent des échanges courants de la vie en France. Elles ne sont jamais présentées comme des événements vécus par Sondes.

Ce document est généré depuis \`content/situations\` (\`npm run docs:situations\`). Chaque situation a sa fiche détaillée dans \`docs/situations\`.

## Parcours

| N° | Situation | Univers | Objectif de communication | Éléments | Séances | Durée indicative |
|---|---|---|---|---|---|---|
`;
parcours.forEach((s, i) => {
  carto += `| ${i + 1} | ${s.titreInterne} | ${UNIVERS[s.univers] ?? ''} | ${s.objectif} | ${s.items.length} | ${s.seances.length} | ${s.dureeIndicativeMinutes} min |\n`;
});
const totalItems = parcours.reduce((t, s) => t + s.items.length, 0);
const totalMin = parcours.reduce((t, s) => t + s.dureeIndicativeMinutes, 0);
carto += `\nTotal : ${totalItems} phrases à comprendre et à dire, environ ${Math.round(totalMin / 60)} heures de séances (séance de découverte non comprise), à étaler sur plusieurs mois.\n`;
carto += `\nLa situation 1 regroupe « saluer une voisine » et « se présenter ». Les stratégies d'interaction (faire répéter, parler plus lentement, dire qu'on ne comprend pas) sont introduites dès la situation 1, puis reprises dans chaque situation lors de la séance « Variante et imprévu ».\n`;
const sons = situations.find((s) => s.type === 'sons');
if (sons) {
  carto += `\n## Atelier des sons\n\n${sons.seances.length} séances de paires de mots qui se ressemblent. Les choix des sons sont des hypothèses à valider avec une enseignante de FLE.\n\n| Séance | Mots |\n|---|---|\n`;
  for (const x of sons.seances) carto += `| ${x.titreInterne} | ${x.items.map((id) => parId.get(id).entend).join(', ')} |\n`;
}
carto += `
## Modèle commun à chaque situation

Chaque situation suit la même forme, ce qui permet de comparer la qualité des situations entre elles :

1. Une série de séances « Écouter, comprendre et dire » (trois phrases par séance au plus), chacune en sept temps : consigne en derja, scène illustrée, phrase française, sens, répétition, réponse orale, retour rassurant.
2. Une séance « Simulation orale » : un dialogue complet avec une interlocutrice ou un interlocuteur, où Sondes tient son rôle.
3. Une séance « Variante et imprévu » : le même contexte avec une surprise (réponse longue, changement, rupture de stock). Sondes peut utiliser les phrases de secours.
4. Une mission facultative dans la vie réelle.

## Compétences communes

| Compétence | Où elle se travaille |
|---|---|
| Reconnaître les salutations et les formules de politesse | Toutes les situations, dès la situation 1 |
| Comprendre une question simple et y répondre oui, non ou par une courte phrase | Courses, services, voisinage |
| Demander quelque chose avec « je voudrais » ou « s'il vous plaît » | Pain, fruits et légumes, pharmacie, poste, tickets |
| Comprendre et dire des nombres et des prix | Demander un prix, payer à la caisse, ticket, poste |
| Comprendre le temps (jours, heures, délais) | Rendez-vous, gare, renseignement, comprendre une conversation |
| Se repérer dans l'espace (directions, lieux) | Chemin, bus, gare, renseignement |
| Dire où l'on a mal | Pharmacie |
| Faire répéter, parler plus lentement, dire qu'on ne comprend pas | Situation 1 puis chaque séance « Variante et imprévu », et situations de la section Échanges |
| Saisir l'information principale d'une annonce | Gare, comprendre une conversation, téléphone |

## Vocabulaire et formules communes

- Politesse : bonjour, bonsoir, au revoir, merci, s'il vous plaît, excusez-moi, je vous en prie, bonne journée.
- Demander : je voudrais, vous pouvez m'aider, où est, combien, à quelle heure.
- Répondre : oui, non, d'accord, bien sûr, c'est tout, merci.
- Stratégies : répétez s'il vous plaît, plus lentement, je ne comprends pas, vous pouvez dire autrement.
- Nombres de un à dix et quelques centimes, jours de la semaine, heures rondes.

## Suivi par situation

Pour chaque situation, l'espace accompagnante du tableau de bord montre : la durée indicative et le temps réel passé, les séances faites, les phrases par statut (découverte, en cours, elle sait le dire, on y revient), les éléments à revoir et la mission facultative dans la vie réelle. Le tableau regarde le parcours et le rythme séparément et ne note pas Sondes.

## À valider

- Les intentions en derja de chaque message, par la locutrice tunisienne (liste dans \`docs/fiche-enregistrement.csv\`).
- Les phrases françaises et les dialogues, par une personne qui enseigne le français à des adultes.
- Le choix des paires de sons.
`;
writeFileSync(join(racine, 'docs/cartographie-situations.md'), carto);

// --- Fiches ---
mkdirSync(join(racine, 'docs/situations'), { recursive: true });
const phrase = (id) => parId.get(id);
const fiches = [];
for (const s of situations) {
  if (s.type !== 'parcours') continue;
  const n = String(s.ordre).padStart(2, '0');
  let md = `# Situation ${s.ordre} : ${s.titreInterne}

Univers : ${UNIVERS[s.univers]}.

## Contexte de la scène

${s.contexte[0].toUpperCase() + s.contexte.slice(1)}. Scène fictive mais réaliste, jouée comme un jeu de rôle oral.

## Objectif de communication

À la fin de la situation, Sondes sait ${s.objectif}.

## Personnages

${PERSONNAGES[s.id] ?? ''}

## Phrases françaises utiles et explication en derja

Chaque ligne est un élément à écouter, comprendre, répéter, puis dire. La colonne de droite est l'intention de l'explication en derja : la locutrice tunisienne la formule à sa façon et l'enregistre (identifiant \`aeb/sens-<élément>\`).

| Elle entend | Elle dit | Intention de l'explication en derja |
|---|---|---|
`;
  for (const it of s.items) md += `| ${it.entend} | ${it.dit} | ${it.sensIntention} |\n`;

  md += `\n## Réponses possibles de Sondes\n\nLa reconnaissance vocale accepte ces variantes (sans accents ni ponctuation) :\n\n`;
  for (const it of s.items) md += `- ${it.dit} : ${it.acceptees.join(' ; ')}\n`;

  const dial = s.seances.filter((x) => x.dialogue);
  md += `\n## Dialogues enregistrés\n\n`;
  const noms = ['Dialogue principal', 'Variante avec imprévu'];
  dial.forEach((x, k) => {
    md += `### ${noms[k] ?? x.titreInterne} (séance ${x.id})\n\n`;
    for (const t of x.dialogue) {
      if (t.qui === 'autre') md += `- Interlocuteur : ${'itemId' in t ? phrase(t.itemId).entend : t.texte}\n`;
      else if ('itemId' in t) md += `- Sondes : ${phrase(t.itemId).dit}\n`;
      else md += `- Sondes (au choix) : ${t.choix.map((c) => phrase(c).dit).join(' / ')}\n`;
    }
    md += '\n';
  });

  md += `## Imprévus\n\nRéplique longue ou rapide, hors du niveau de Sondes. Elle utilise alors les phrases de secours (« répétez, s'il vous plaît », « plus lentement, s'il vous plaît », « je ne comprends pas »), apprises dans la situation 1.\n\n`;
  for (const t of imprevus(s)) md += `- « ${t.texte} »\n`;

  md += `\n## Exercices par séance\n\n| Séance | Titre | Contenu |\n|---|---|---|\n`;
  for (const x of s.seances) {
    const contenu = x.items.length
      ? `${x.items.length} phrase(s) : écoute de la phrase (normale puis lente), choix de l'image qui donne le sens, répétition avec écoute de sa voix, réponse orale. Phrases : ${x.items.map((id) => phrase(id).entend).join(' | ')}`
      : x.dialogue
        ? `${x.dialogue.filter((t) => t.qui === 'soundes').length} tours de parole à tenir à l'oral, avec droit de recommencer`
        : '';
    md += `| ${x.id} | ${x.titreInterne} | ${contenu} |\n`;
  }

  md += `\n## Mission facultative dans la vie réelle\n\n${s.mission}\n\nLe lendemain, l'application demande à Sondes, avec trois images (facile, moyen, difficile), comment cela s'est passé. Elle choisit d'en parler ou non.\n\n`;
  md += `## Suivi\n\n- Durée indicative : ${s.dureeIndicativeMinutes} minutes, soit ${s.seances.length} séances d'environ 12 minutes.\n- Temps réel, séances faites, compétences travaillées, progression et éléments à revoir : tableau de bord de l'espace accompagnante.\n- Éléments à revoir : l'application propose en début de séance les phrases dont la révision est due.\n- Enregistrements nécessaires : environ ${nbDerja(s)} messages en derja et ${s.items.length * 2 + imprevus(s).length} phrases en français (voir \`docs/fiche-enregistrement.csv\`).\n`;
  writeFileSync(join(racine, 'docs/situations', `${n}-${s.id}.md`), md);
  fiches.push(`${n}-${s.id}.md`);
}
console.log(`Cartographie et ${fiches.length} fiches écrites dans docs/`);
