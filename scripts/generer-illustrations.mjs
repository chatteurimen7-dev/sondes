// Génère les illustrations (SVG, style plat, personnages adultes, sans texte) dans public/images.
// Les images sont originales et libres de droit. On peut les remplacer une par une :
// un fichier du même nom déposé dans public/images prend le dessus, puis `npm run medias:index`.
// Usage : npm run images:generer
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const sortie = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
mkdirSync(sortie, { recursive: true });

// --- Palette : rose, prune, corail, turquoise, lavande, miel ---
const C = {
  encre: '#3a1d38',
  peau1: '#f0bd97',
  peau2: '#c98d63',
  peau3: '#f6d3b6',
  cheveux1: '#2d1b22',
  cheveux2: '#6a3b2c',
  cheveux3: '#8a4a2f',
  teal: '#1fb5a7',
  terre: '#ff7a66',
  violet: '#9d86e0',
  or: '#f5b63d',
  rose: '#d6457e',
  prune: '#7b2d6b',
  blanc: '#fffaf5',
  mur: '#ffe9df',
  sol: '#f0d9c6',
};

const id = (() => {
  let n = 0;
  return () => `g${++n}`;
})();

// --- Éléments ---
function femme({ x, y, s = 1, robe = C.rose, peau = C.peau1, cheveux = C.cheveux1, humeur = 'sourire', gauche = [-60, 150], droit = [60, 150], flip = false, fleur = false }) {
  const bras = (main, sens) => {
    const [mx, my] = main;
    const ex = sens * 44;
    return `<line x1="${ex}" y1="108" x2="${mx}" y2="${my}" stroke="${robe}" stroke-width="30" stroke-linecap="round"/>
      <circle cx="${mx}" cy="${my}" r="16" fill="${peau}"/>`;
  };
  const sourcils =
    humeur === 'perplexe'
      ? `<path d="M-23 -15 L-6 -21 M23 -15 L6 -21" stroke="${C.encre}" stroke-width="3" stroke-linecap="round"/>`
      : `<path d="M-23 -16 Q-14 -22 -6 -17 M23 -16 Q14 -22 6 -17" fill="none" stroke="${C.encre}" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`;
  const bouche =
    humeur === 'perplexe'
      ? `<path d="M-10 19 Q-4 13 2 19 T14 19" fill="none" stroke="#b83a66" stroke-width="3.5" stroke-linecap="round"/>`
      : humeur === 'neutre'
        ? `<path d="M-9 18 H9" stroke="#b83a66" stroke-width="3.5" stroke-linecap="round"/>`
        : `<path d="M-12 12 Q0 27 12 12 Q0 17 -12 12Z" fill="#d6457e" stroke="#b83a66" stroke-width="2.5" stroke-linejoin="round"/>`;
  const fleurCheveux = fleur
    ? `<g transform="translate(-30 -32)">${[0, 72, 144, 216, 288].map((a) => `<circle cx="0" cy="-8" r="6.5" fill="#fffaf8" stroke="#f2b8cc" stroke-width="1.5" transform="rotate(${a})"/>`).join('')}<circle r="4" fill="${C.or}"/></g>`
    : '';
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <path d="M-44 8 Q-64 96 -50 152 Q-18 138 0 104 Q18 138 50 152 Q64 96 44 8Z" fill="${cheveux}"/>
    <path d="M-46 100 Q-52 150 -36 192 Q-70 256 -86 336 L86 336 Q70 256 36 192 Q52 150 46 100 Q0 86 -46 100Z" fill="${robe}"/>
    <path d="M-37 186 Q0 198 37 186 L35 204 Q0 216 -35 204Z" fill="#000" opacity=".14"/>
    <rect x="-12" y="30" width="24" height="34" fill="${peau}"/>
    <path d="M-18 92 L0 130 L18 92 Q0 100 -18 92Z" fill="${peau}"/>
    <circle cx="0" cy="0" r="36" fill="${peau}"/>
    <path d="M-40 8 Q-48 -50 0 -52 Q48 -50 40 8 Q36 -20 10 -30 Q-26 -22 -40 8Z" fill="${cheveux}"/>
    <circle cx="-38" cy="14" r="5" fill="${C.or}"/><circle cx="38" cy="14" r="5" fill="${C.or}"/>
    <circle cx="-23" cy="10" r="8" fill="#ff7a96" opacity=".32"/><circle cx="23" cy="10" r="8" fill="#ff7a96" opacity=".32"/>
    <ellipse cx="-12" cy="-2" rx="4" ry="4.6" fill="${C.encre}"/><ellipse cx="12" cy="-2" rx="4" ry="4.6" fill="${C.encre}"/>
    <path d="M-18 -5 L-22 -9 M18 -5 L22 -9" stroke="${C.encre}" stroke-width="2.4" stroke-linecap="round"/>
    ${sourcils}${bouche}${fleurCheveux}
    ${bras(gauche, -1)}${bras(droit, 1)}
  </g>`;
}

const soleil = (cx, cy, r) =>
  `<g><circle cx="${cx}" cy="${cy}" r="${r * 1.6}" fill="#ffe6a3" opacity="0.5"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#f6b73c"/>${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<line x1="${cx + Math.cos(a) * r * 1.25}" y1="${cy + Math.sin(a) * r * 1.25}" x2="${cx + Math.cos(a) * r * 1.6}" y2="${cy + Math.sin(a) * r * 1.6}" stroke="#f6b73c" stroke-width="7" stroke-linecap="round"/>`;
  }).join('')}</g>`;

const lune = (cx, cy, r) => `<path d="M${cx + r * 0.4} ${cy - r} A${r} ${r} 0 1 0 ${cx + r} ${cy + r * 0.4} A${r * 0.8} ${r * 0.8} 0 1 1 ${cx + r * 0.4} ${cy - r}Z" fill="#fff4c2"/>`;
const etoiles = (pts) => pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff4c2"/>`).join('');

function immeubles(y, { soir = false, couleurs = ['#d9b79a', '#c9a07e', '#e3c7a8'] } = {}) {
  const larg = 150;
  return [0, 1, 2, 3].map((i) => {
    const x = -10 + i * (larg + 10);
    const h = 230 + (i % 2) * 40;
    const fen = [0, 1].flatMap((r) => [0, 1].map((c) => `<rect x="${x + 28 + c * 62}" y="${y - h + 30 + r * 70}" width="38" height="46" rx="4" fill="${soir ? '#ffd37a' : '#9ec5d6'}"/>`)).join('');
    return `<rect x="${x}" y="${y - h}" width="${larg}" height="${h}" fill="${couleurs[i % 3]}"/>${fen}`;
  }).join('');
}

const sol = (y, couleur = '#b9c9a6') => `<rect x="0" y="${y}" width="600" height="${600 - y}" fill="${couleur}"/>`;

function bulle(x, y, w, h, queue, contenu = '', fond = '#ffffff') {
  const qx = queue[0];
  const qy = queue[1];
  return `<g><path d="M${x + 24} ${y} H${x + w - 24} Q${x + w} ${y} ${x + w} ${y + 24} V${y + h - 24} Q${x + w} ${y + h} ${x + w - 24} ${y + h} H${x + 70} L${qx} ${qy} L${x + 40} ${y + h} H${x + 24} Q${x} ${y + h} ${x} ${y + h - 24} V${y + 24} Q${x} ${y} ${x + 24} ${y}Z" fill="${fond}" stroke="#d6ccbd" stroke-width="4"/>${contenu}</g>`;
}

const interro = (cx, cy, s = 1, couleur = C.terre) =>
  `<g transform="translate(${cx} ${cy}) scale(${s})" fill="none" stroke="${couleur}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M-22 -22 C-22 -58 24 -58 24 -22 C24 0 0 2 0 26"/></g><circle cx="${cx}" cy="${cy + 52 * s}" r="${7 * s}" fill="${couleur}"/>`;

const coeur = (cx, cy, s = 1, couleur = '#d64b5a') => `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0 28 C-50 -6 -34 -44 -14 -38 C-6 -35 0 -26 0 -22 C0 -26 6 -35 14 -38 C34 -44 50 -6 0 28Z" fill="${couleur}"/>`;

const baguette = (x, y, rot = 0, s = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-120" y="-22" width="240" height="44" rx="22" fill="#d99a4e"/><g stroke="#a86a2a" stroke-width="5" stroke-linecap="round"><line x1="-70" y1="-12" x2="-50" y2="12"/><line x1="-25" y1="-12" x2="-5" y2="12"/><line x1="20" y1="-12" x2="40" y2="12"/><line x1="65" y1="-12" x2="85" y2="12"/></g></g>`;

const croix = (cx, cy, s, couleur = '#2f9e5b') => `<path transform="translate(${cx} ${cy}) scale(${s})" d="M-18 -50 H18 V-18 H50 V18 H18 V50 H-18 V18 H-50 V-18 H-18Z" fill="${couleur}"/>`;

const sablier = (cx, cy, s = 1) =>
  `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-34 -52 H34 M-34 52 H34" stroke="${C.encre}" stroke-width="10" stroke-linecap="round"/><path d="M-26 -52 C-26 -10 26 -10 26 -52 Z M-26 52 C-26 10 26 10 26 52 Z" fill="#fff4c2" stroke="${C.encre}" stroke-width="7" stroke-linejoin="round"/><path d="M-14 38 H14 L0 20Z" fill="${C.or}"/></g>`;

const ondes = (cx, cy, n = 3, ecart = 22, couleur = C.teal) =>
  Array.from({ length: n }, (_, i) => `<path d="M${cx + i * ecart} ${cy - 24 - i * 8} Q${cx + i * ecart + 16} ${cy} ${cx + i * ecart} ${cy + 24 + i * 8}" fill="none" stroke="${couleur}" stroke-width="8" stroke-linecap="round"/>`).join('');

const fleche_boucle = (cx, cy, s = 1, couleur = C.teal) =>
  `<g transform="translate(${cx} ${cy}) scale(${s})" fill="none" stroke="${couleur}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M44 8 A44 44 0 1 1 22 -38"/><path d="M26 -62 V-34 H54"/></g>`;

const silhouette = (cx, cy, s = 1, couleur = C.teal) => `<g transform="translate(${cx} ${cy}) scale(${s})" fill="${couleur}"><circle cx="0" cy="-18" r="20"/><path d="M-34 38 Q-34 4 0 4 Q34 4 34 38Z"/></g>`;

const smiley = (cx, cy, s = 1) =>
  `<g transform="translate(${cx} ${cy}) scale(${s})"><circle r="34" fill="#f6c94c" stroke="#d9a441" stroke-width="4"/><circle cx="-12" cy="-8" r="4.5" fill="${C.encre}"/><circle cx="12" cy="-8" r="4.5" fill="${C.encre}"/><path d="M-16 8 Q0 26 16 8" fill="none" stroke="${C.encre}" stroke-width="5" stroke-linecap="round"/></g>`;

function etoile(cx, cy, R, r) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rayon = i % 2 === 0 ? R : r;
    return `${(cx + Math.cos(a) * rayon).toFixed(1)},${(cy + Math.sin(a) * rayon).toFixed(1)}`;
  });
  return `<polygon points="${pts.join(' ')}" fill="#e70013"/>`;
}

function drapeauTunisie(x, y, w = 220) {
  const h = (w * 2) / 3;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = h * 0.34;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e70013"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><circle cx="${cx - r * 0.08}" cy="${cy}" r="${r * 0.72}" fill="#e70013"/><circle cx="${cx + r * 0.1}" cy="${cy}" r="${r * 0.58}" fill="#fff"/>${etoile(cx + r * 0.1, cy, r * 0.34, r * 0.14)}</g>`;
}

const epingle = (cx, cy, s = 1, couleur = '#d64b5a') => `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M0 70 C-48 6 -40 -56 0 -56 C40 -56 48 6 0 70Z" fill="${couleur}"/><circle cx="0" cy="-12" r="16" fill="#fff"/></g>`;

const porte = (x, y, w, h, ouverte = false) =>
  ouverte
    ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#bfe0ef"/><path d="M${x} ${y} L${x + w * 0.45} ${y + 14} V${y + h - 6} L${x} ${y + h}Z" fill="#8a5a3c"/><rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 10}" fill="none" stroke="#6e4630" stroke-width="12"/>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8a5a3c"/><rect x="${x + 14}" y="${y + 16}" width="${w - 28}" height="${h * 0.38}" rx="6" fill="#a2704c"/><circle cx="${x + w - 22}" cy="${y + h * 0.55}" r="7" fill="${C.or}"/><rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 10}" fill="none" stroke="#6e4630" stroke-width="12"/>`;

const comptoir = (y) => `<rect x="0" y="${y}" width="600" height="${600 - y}" fill="#a2704c"/><rect x="0" y="${y}" width="600" height="18" fill="#c08a61"/>`;

const sac = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-44 -30 H44 L52 70 H-52Z" fill="#e6d3a9" stroke="#bda26b" stroke-width="4"/><path d="M-22 -30 C-22 -62 22 -62 22 -30" fill="none" stroke="#bda26b" stroke-width="6"/><rect x="-100" y="-4" width="150" height="28" rx="14" fill="#d99a4e" transform="rotate(-18 -30 8) translate(10 -50)"/></g>`;

const voiture = (x, y, s = 1, couleur = C.terre) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-150 40 V-4 Q-150 -16 -136 -20 L-96 -26 L-62 -78 Q-56 -88 -44 -88 H46 Q58 -88 66 -78 L100 -26 L142 -20 Q154 -16 154 -4 V40Z" fill="${couleur}"/><path d="M-52 -72 L-80 -30 H-8 V-72Z M6 -72 V-30 H86 L60 -72Z" fill="#cde7f2"/><circle cx="-80" cy="44" r="34" fill="#2b2320"/><circle cx="-80" cy="44" r="14" fill="#cfd8d6"/><circle cx="84" cy="44" r="34" fill="#2b2320"/><circle cx="84" cy="44" r="14" fill="#cfd8d6"/></g>`;

const bus = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-190" y="-110" width="380" height="170" rx="26" fill="${C.teal}"/><rect x="-190" y="-10" width="380" height="24" fill="#174744"/>${[0, 1, 2, 3].map((i) => `<rect x="${-172 + i * 70}" y="-88" width="56" height="62" rx="8" fill="#cde7f2"/>`).join('')}<rect x="118" y="-88" width="56" height="130" rx="8" fill="#cde7f2"/><line x1="146" y1="-88" x2="146" y2="42" stroke="#174744" stroke-width="4"/><circle cx="-110" cy="62" r="32" fill="#2b2320"/><circle cx="-110" cy="62" r="13" fill="#cfd8d6"/><circle cx="90" cy="62" r="32" fill="#2b2320"/><circle cx="90" cy="62" r="13" fill="#cfd8d6"/></g>`;

const bg = (haut, bas) => {
  const g = id();
  return { defs: `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${haut}"/><stop offset="1" stop-color="${bas}"/></linearGradient>`, fill: `url(#${g})` };
};

function image(nom, fond, corps) {
  const clip = id();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
<defs>${fond.defs ?? ''}<clipPath id="${clip}"><rect width="600" height="600" rx="40"/></clipPath></defs>
<g clip-path="url(#${clip})"><rect width="600" height="600" fill="${fond.fill}"/>${corps}</g>
</svg>
`;
  writeFileSync(join(sortie, `${nom}.svg`), svg);
}

const ciel = (haut, bas) => bg(haut, bas);
const plat = (c) => ({ defs: '', fill: c });

// --- Images ---

// salut-matin : un matin lumineux, une femme salue de la main
image('salut-matin', ciel('#ffd9a3', '#fff2d2'), `${soleil(120, 120, 46)}${immeubles(440)}${sol(440, '#b8c79f')}
${femme({ x: 330, y: 190, s: 0.95, robe: C.rose, droit: [92, 20] })}`);

// salut-soir : même geste, ciel de nuit, fenêtres allumées
image('salut-soir', ciel('#1c2756', '#3d4f8f'), `${etoiles([[80, 80, 5], [180, 140, 4], [260, 60, 5], [470, 90, 5], [540, 170, 4], [400, 150, 3]])}${lune(480, 110, 50)}${immeubles(440, { soir: true, couleurs: ['#5b5d86', '#4d5079', '#66688f'] })}${sol(440, '#4a5a53')}
${femme({ x: 300, y: 190, s: 0.95, robe: C.terre, droit: [92, 20] })}`);

// au-revoir : une femme quitte la maison par la porte ouverte et salue
image('au-revoir', plat(C.mur), `${sol(470, '#cdb89b')}${porte(360, 120, 170, 350, true)}
${femme({ x: 210, y: 200, s: 0.95, robe: C.violet, droit: [92, 22], humeur: 'sourire' })}
<path d="M330 300 H410" stroke="${C.teal}" stroke-width="14" stroke-linecap="round"/><path d="M392 278 L418 300 L392 322" fill="none" stroke="${C.teal}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`);

// merci : une commerçante donne un sac de pain, la cliente reçoit, un cœur
image('merci', plat('#ffd9c7'), `${comptoir(470)}
${femme({ x: 170, y: 190, s: 0.9, robe: C.or, peau: C.peau2, cheveux: C.cheveux2, droit: [96, 128] })}
${sac(330, 380, 0.9)}
${femme({ x: 450, y: 200, s: 0.9, robe: C.rose, gauche: [-70, 130], droit: [-62, 156], flip: false })}
${coeur(450, 90, 1.2)}`);

// s-il-vous-plait : une cliente tend la main vers le pain, geste poli
image('s-il-vous-plait', plat('#fff0c9'), `${comptoir(470)}
<g>${baguette(430, 410, -12)}${baguette(440, 450, 6, 0.9)}</g>
${femme({ x: 170, y: 190, s: 0.95, robe: C.rose, droit: [120, 150], gauche: [-60, 160] })}`);

// je-m-appelle : elle se désigne, bulle avec sa silhouette
image('je-m-appelle', plat('#dcf3ec'), `${sol(470, '#bfe7d6')}
${femme({ x: 230, y: 210, s: 0.95, robe: C.teal, droit: [-6, 150], gauche: [-62, 150] })}
${bulle(340, 70, 210, 150, [310, 230], silhouette(445, 150, 1.5))}`);

// nom-question : la voisine demande le prénom
image('nom-question', plat('#dcf3ec'), `${sol(470, '#bfe7d6')}
${femme({ x: 300, y: 220, s: 0.95, robe: C.violet, cheveux: C.cheveux2, droit: [90, 130], gauche: [-62, 160] })}
${bulle(60, 60, 250, 150, [250, 230], `${silhouette(150, 150, 1.4, '#9bb5b1')}${interro(235, 130, 0.85)}`)}`);

// enchantee : deux femmes se serrent la main, souriantes
image('enchantee', plat('#ffd9c7'), `${sol(470, '#e3cdb8')}
${femme({ x: 190, y: 210, s: 0.9, robe: C.teal, droit: [96, 190], gauche: [-60, 160] })}
${femme({ x: 410, y: 210, s: 0.9, robe: C.terre, peau: C.peau2, cheveux: C.cheveux2, gauche: [-96, 190], droit: [60, 160] })}
${coeur(300, 110, 1)}`);

// ca-va : une femme demande des nouvelles, bulle avec un visage souriant et un point d'interrogation
image('ca-va', plat('#dcf3ec'), `${sol(470, '#bfe7d6')}
${femme({ x: 170, y: 220, s: 0.9, robe: C.teal, droit: [80, 150] })}
${femme({ x: 450, y: 220, s: 0.9, robe: C.or, peau: C.peau2, cheveux: C.cheveux2, flip: true, droit: [80, 150] })}
${bulle(190, 50, 240, 140, [220, 215], `${smiley(270, 120, 1.2)}${interro(360, 112, 0.8)}`)}`);

// tunisie : une femme tient le drapeau tunisien, épingle de lieu
image('tunisie', ciel('#cfe8f4', '#f8efe0'), `${sol(480, '#e8d6b5')}
${femme({ x: 210, y: 210, s: 0.95, robe: C.violet, droit: [100, 120], gauche: [-60, 160] })}
<rect x="320" y="140" width="10" height="330" rx="5" fill="#8a5a3c"/>${drapeauTunisie(330, 140, 200)}
${epingle(150, 90, 0.8)}`);

// incomprehension : elle porte la main à l'oreille, l'air perplexe, bulle de paroles embrouillées
image('incomprehension', plat('#f5e1f0'), `${sol(470, '#dccbbf')}
${femme({ x: 240, y: 220, s: 0.95, robe: C.teal, humeur: 'perplexe', droit: [34, 12], gauche: [-60, 160] })}
${bulle(340, 60, 220, 170, [330, 250], `<path d="M365 150 q22 -40 44 0 t44 0 t44 0" fill="none" stroke="#9bb5b1" stroke-width="8" stroke-linecap="round"/>${interro(450, 120, 0.7, '#b4572a')}`)}`);

// repeter : une bulle avec la flèche de répétition et des ondes sonores
image('repeter', plat('#dcf3ec'), `${sol(470, '#bfe7d6')}
${femme({ x: 210, y: 220, s: 0.95, robe: C.violet, cheveux: C.cheveux2, droit: [60, 160], gauche: [-60, 160] })}
${bulle(310, 70, 240, 190, [300, 245], `${fleche_boucle(410, 165, 1.1)}${ondes(480, 165, 2, 18)}`)}`);

// lentement : bulle avec un sablier et des ondes étirées
image('lentement', plat('#dcf3ec'), `${sol(470, '#bfe7d6')}
${femme({ x: 210, y: 220, s: 0.95, robe: C.or, peau: C.peau2, cheveux: C.cheveux2, droit: [60, 160], gauche: [-60, 160] })}
${bulle(310, 70, 240, 190, [300, 245], `${sablier(390, 165, 1.1)}<path d="M440 165 q22 -26 44 0 t44 0" fill="none" stroke="${C.teal}" stroke-width="8" stroke-linecap="round"/>`)}`);

// pain : baguettes dans un panier, sur un comptoir de boulangerie
image('pain', ciel('#ffe4b8', '#fff3dc'), `${comptoir(440)}
<path d="M120 330 H480 L450 440 H150Z" fill="#b57a4a"/><path d="M120 330 H480" stroke="#8f5c33" stroke-width="12" stroke-linecap="round"/>
${baguette(260, 290, -28, 1.15)}${baguette(340, 280, 12, 1.1)}${baguette(300, 300, -8, 1.1)}`);

// voiture
image('voiture', ciel('#cfe8f4', '#f8efe0'), `<rect x="0" y="430" width="600" height="170" fill="#8b8f93"/><rect x="0" y="500" width="600" height="14" fill="#f5f0e0" opacity="0.7"/>${immeubles(430, { couleurs: ['#d7c4ae', '#c5ae93', '#e0cdb6'] })}
${voiture(300, 390, 1.2)}`);

// bus : arrêt de bus
image('bus', ciel('#cfe8f4', '#f8efe0'), `<rect x="0" y="440" width="600" height="160" fill="#8b8f93"/>
<rect x="76" y="140" width="10" height="310" fill="#6a6e72"/><rect x="40" y="110" width="82" height="62" rx="12" fill="${C.teal}"/>${(() => `<rect x="62" y="128" width="38" height="26" rx="4" fill="#fff"/>`)()}
${bus(350, 370, 0.95)}`);

// pharmacie : devanture avec grande croix verte
image('pharmacie', plat('#dcf3ec'), `${sol(480, '#cdd9c9')}
<rect x="90" y="250" width="420" height="230" fill="#f4f1e8"/><rect x="120" y="300" width="150" height="130" rx="8" fill="#bfe0ef"/><rect x="330" y="300" width="130" height="180" rx="8" fill="#bfe0ef"/><rect x="90" y="236" width="420" height="30" fill="#2f9e5b"/>
<rect x="196" y="40" width="208" height="180" rx="22" fill="#fff" stroke="#2f9e5b" stroke-width="8"/>${croix(300, 130, 1.5)}`);

// medecin : médecin en blouse avec stéthoscope, croix au mur
image('medecin', plat('#dcf3ec'), `${sol(480, '#cdd9c9')}${croix(110, 120, 1.1)}
${femme({ x: 340, y: 210, s: 0.95, robe: '#f7f7f2', peau: C.peau1, cheveux: C.cheveux1, droit: [70, 160], gauche: [-60, 160] })}
<path d="M310 250 C300 330 380 330 370 250" fill="none" stroke="#2f9e5b" stroke-width="10" stroke-linecap="round"/><circle cx="340" cy="322" r="14" fill="#6a6e72"/>`);

// rue-matin : deux femmes se croisent dans une rue ensoleillée
image('rue-matin', ciel('#ffd9a3', '#fff2d2'), `${soleil(100, 110, 42)}${immeubles(440)}${sol(440, '#b8c79f')}
${femme({ x: 170, y: 200, s: 0.8, robe: C.teal, droit: [90, 10] })}
${femme({ x: 420, y: 200, s: 0.8, robe: C.violet, cheveux: C.cheveux2, flip: true, droit: [90, 10] })}`);

// palier-voisine : un palier d'immeuble, la voisine devant sa porte
image('palier-voisine', plat(C.mur), `<rect x="0" y="470" width="600" height="130" fill="#cdb89b"/>
${porte(40, 130, 130, 340)}${porte(430, 130, 130, 340)}
${femme({ x: 250, y: 215, s: 0.85, robe: C.teal, droit: [88, 22] })}
${femme({ x: 400, y: 215, s: 0.85, robe: C.or, peau: C.peau2, cheveux: C.cheveux2, flip: true, droit: [88, 140] })}`);

console.log('Illustrations écrites dans public/images');

export { C, femme, soleil, lune, immeubles, sol, bulle, interro, coeur, baguette, croix, sablier, ondes, fleche_boucle, silhouette, smiley, porte, comptoir, bus, voiture, etoiles, bg, image, ciel, plat, id };
