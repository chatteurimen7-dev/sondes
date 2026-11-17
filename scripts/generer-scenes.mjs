// Dessine les illustrations de toutes les situations à partir de scripts/scenes.json :
// un décor, un ou deux personnages adultes, quelques objets. Aucun texte dans les images.
// Usage : npm run images:generer   (écrit dans public/images, puis met l'index à jour)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { C, femme, soleil, lune, immeubles, sol, bulle, interro, coeur, baguette, croix, sablier, fleche_boucle, silhouette, smiley, porte, comptoir, bus, image, ciel, plat, id } from './generer-illustrations.mjs';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const specs = JSON.parse(readFileSync(join(racine, 'scripts', 'scenes.json'), 'utf-8'));

const g = (s, x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${s}</g>`;
const trait = (c, w = 6) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

// --- Objets (dessinés autour de 0,0, environ 100 x 100) ---
const rect = (x, y, w, h, r, f, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${extra}/>`;
const pieceSVG = (x, y, r = 22, f = '#f5b63d') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="#d9951a" stroke-width="4"/><circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="none" stroke="#d9951a" stroke-width="3" opacity=".7"/>`;
const billet = (couleur, chiffre) => `${rect(-52, -30, 104, 60, 8, couleur, 'stroke="#fff" stroke-width="4"')}<circle cx="0" cy="0" r="18" fill="#fff" opacity=".5"/><text x="0" y="9" font-size="26" font-weight="700" text-anchor="middle" fill="#3a1d38" font-family="Segoe UI, sans-serif">${chiffre}</text>`;
const nuage = (c = '#d7dde8') => `<g fill="${c}"><circle cx="-22" cy="4" r="22"/><circle cx="6" cy="-8" r="28"/><circle cx="34" cy="6" r="20"/><rect x="-44" y="4" width="98" height="22" rx="11"/></g>`;
const tete = (couleur = C.peau1) => `<circle cx="0" cy="-12" r="26" fill="${couleur}"/><path d="M-42 56 Q-42 18 0 18 Q42 18 42 56Z" fill="${C.rose}"/><path d="M-26 -12 Q-30 -42 0 -42 Q30 -42 26 -12 Q20 -28 0 -30 Q-20 -28 -26 -12Z" fill="${C.cheveux1}"/>`;
const eclairs = (x, y) => `<g ${trait('#e23d3d', 6)}><path d="M${x} ${y} l-8 14 h12 l-8 14"/><path d="M${x + 22} ${y - 6} l-6 10 h9 l-6 10"/></g>`;
const mainSVG = (couleur = C.peau1) => `<path d="M-18 28 V-12 a5 5 0 0 1 10 0 V-30 a5 5 0 0 1 10 0 V-34 a5 5 0 0 1 10 0 V-26 a5 5 0 0 1 10 0 V12 C22 30 12 40 0 40 C-10 40 -16 36 -18 28Z" fill="${couleur}" stroke="#c98d63" stroke-width="3"/>`;
const fleche = (rot, c = C.teal) => `<g transform="rotate(${rot})" ${trait(c, 14)}><path d="M0 40 V-34"/><path d="M-26 -10 L0 -38 L26 -10"/></g>`;

const PROPS = {
  soleil: () => soleil(0, 0, 22),
  lune: () => lune(0, 0, 28),
  pluie: () => nuage() + `<g ${trait('#4c7fd1', 6)}><path d="M-24 34 l-6 14M0 34 l-6 14M24 34 l-6 14"/></g>`,
  flocon: () => `<g ${trait('#6ab4e8', 6)}><path d="M0 -40 V40M-35 -20 L35 20M-35 20 L35 -20"/></g>`,
  pomme: () => `<circle cx="0" cy="6" r="34" fill="#e0453f"/><path d="M0 -26 q4 -14 14 -16" ${trait('#6a3b2c', 5)}/><path d="M2 -24 q16 -16 28 -6 q-12 12 -28 6Z" fill="#3fa98f"/>`,
  banane: () => `<path d="M-40 -14 Q-10 40 42 -16 Q44 -24 36 -22 Q-8 26 -34 -26Z" fill="#f5c93d" stroke="#cf9b1f" stroke-width="4"/>`,
  tomate: () => `<circle cx="0" cy="6" r="34" fill="#e24b3f"/><path d="M-16 -22 L0 -10 L16 -22 L8 -34 L0 -22 L-8 -34Z" fill="#3fa98f"/>`,
  carotte: () => `<path d="M-30 -10 L30 -34 L36 -20 L-20 22Z" fill="none"/><path d="M-36 30 L30 -26 L40 -10 Z" fill="#ff8a2a"/><path d="M30 -26 q10 -16 22 -10 M34 -20 q16 -4 18 10" ${trait('#3fa98f', 6)}/>`,
  orange: () => `<circle r="34" fill="#ff9a2a"/><circle cx="-10" cy="-8" r="3" fill="#e88312"/><circle cx="10" cy="6" r="3" fill="#e88312"/><circle cx="-4" cy="14" r="3" fill="#e88312"/><path d="M0 -34 q10 -10 20 -6 q-8 10 -20 6Z" fill="#3fa98f"/>`,
  panier: () => `<path d="M-46 -4 H46 L36 40 H-36Z" fill="#c88a4f" stroke="#a86a2a" stroke-width="4"/><path d="M-34 -4 Q0 -64 34 -4" ${trait('#a86a2a', 7)}/><path d="M-30 12 H30 M-26 26 H26" stroke="#a86a2a" stroke-width="3"/>`,
  balance: () => `<path d="M0 -40 V34 M-18 38 H18" ${trait('#6a6e72', 7)}/><path d="M-44 -22 H44" ${trait('#6a6e72', 6)}/><path d="M-60 -2 Q-44 16 -28 -2Z M28 -2 Q44 16 60 -2Z" fill="#c9ced3" stroke="#6a6e72" stroke-width="4"/>`,
  'balance-demi': () => PROPS.balance() + `<circle cx="-44" cy="-14" r="10" fill="#e0453f"/>`,
  etiquette: () => `<path d="M-40 -20 L10 -20 L40 0 L10 20 L-40 20Z" fill="#fff" stroke="#c9a98f" stroke-width="4"/><circle cx="-28" cy="0" r="5" fill="#c9a98f"/><path d="M-12 -6 H14 M-12 8 H8" ${trait('#d6457e', 5)}/>`,
  'etiquette-promo': () => `<path d="M0 -44 L10 -16 L40 -22 L20 0 L40 22 L10 16 L0 44 L-10 16 L-40 22 L-20 0 L-40 -22 L-10 -16Z" fill="#e23d3d"/><path d="M-14 6 L14 -6" ${trait('#fff', 7)}/>`,
  pieces1: () => pieceSVG(0, 0, 28),
  pieces2: () => pieceSVG(-26, 0, 24) + pieceSVG(26, 0, 24),
  pieces3: () => pieceSVG(0, -22, 22) + pieceSVG(-26, 18, 22) + pieceSVG(26, 18, 22),
  pieces: () => pieceSVG(-22, 10, 22) + pieceSVG(18, -8, 22, '#e6a52a') + pieceSVG(24, 26, 18, '#f9d06b'),
  piece50: () => pieceSVG(0, 0, 18, '#f1c35e'),
  billet5: () => billet('#8fb5e8', '5'),
  billet10: () => billet('#f08aa8', '10'),
  billets: () => g(billet('#7fd0a4', ''), -8, 10, 0.9) + g(billet('#9bd9b4', ''), 8, -10, 0.9),
  carte: () => `${rect(-48, -30, 96, 60, 10, '#7b2d6b')}${rect(-48, -14, 96, 12, 0, '#3a1d38')}${rect(-34, 8, 24, 16, 4, '#f5b63d')}`,
  'carte-magasin': () => `${rect(-48, -30, 96, 60, 10, '#1fb5a7')}<path d="M0 -14 l6 12 14 2 -10 10 3 14 -13 -7 -13 7 3 -14 -10 -10 14 -2Z" fill="#fff"/>`,
  ticket: () => `<path d="M-46 -26 H46 V-8 a10 10 0 0 0 0 20 V26 H-46 V12 a10 10 0 0 0 0 -20Z" fill="#fff" stroke="#c9a98f" stroke-width="4"/><path d="M-26 -8 H26 M-26 6 H10" ${trait('#d6457e', 5)}/>`,
  'ticket-caisse': () => `<path d="M-26 -44 H26 V40 l-8 -8 -9 8 -9 -8 -9 8 -9 -8 -8 8Z" fill="#fff" stroke="#c9a98f" stroke-width="4"/><path d="M-14 -26 H14 M-14 -12 H14 M-14 2 H6" ${trait('#9aa0a6', 4)}/>`,
  'ticket-sortant': () => `${rect(-50, 20, 100, 24, 8, '#6a6e72')}<path d="M-26 22 V-34 H26 V22" fill="#fff" stroke="#c9a98f" stroke-width="4"/><path d="M-14 -18 H14 M-14 -4 H14" ${trait('#d6457e', 4)}/>`,
  caisse: () => `${rect(-48, -4, 96, 46, 8, '#8b6f93')}${rect(-34, -36, 50, 30, 6, '#cde7f2')}<g fill="#fff">${[-30, -10, 10, 30].map((x) => `<circle cx="${x}" cy="22" r="6"/>`).join('')}</g>`,
  sac: () => `<path d="M-38 -14 H38 L46 44 H-46Z" fill="#e9d6ad" stroke="#bda26b" stroke-width="4"/><path d="M-20 -14 C-20 -46 20 -46 20 -14" ${trait('#bda26b', 6)}/>`,
  'main-offre': () => g(mainSVG(), 0, 6, 1.1) + `<circle cx="0" cy="-34" r="8" fill="${C.or}"/>`,
  'main-salut': () => `<g transform="rotate(-14)">${mainSVG()}</g>`,
  question: () => interro(0, -14, 1.1, C.terre),
  check: () => `<circle r="38" fill="#1e9e6a"/><path d="M-18 2 L-4 16 L20 -12" ${trait('#fff', 10)}/>`,
  'point-exclam': () => `<path d="M0 -40 L42 34 H-42Z" fill="#f5b63d" stroke="#d9951a" stroke-width="5" stroke-linejoin="round"/><path d="M0 -12 V12" ${trait('#3a1d38', 8)}/><circle cx="0" cy="24" r="4.5" fill="#3a1d38"/>`,
  coeur: () => coeur(0, 0, 1.3),
  sourire: () => smiley(0, 0, 1.3),
  valideur: () => `${rect(-30, -44, 60, 88, 10, '#6a6e72')}${rect(-18, -30, 36, 24, 4, '#cde7f2')}<circle cx="0" cy="18" r="8" fill="#34c58a"/><path d="M-30 -10 H30" stroke="#3a3e42" stroke-width="3"/>`,
  distributeur: () => `${rect(-36, -46, 72, 92, 10, '#1f8fa8')}${rect(-24, -32, 48, 30, 5, '#cde7f2')}${rect(-18, 6, 36, 8, 3, '#0f5f73')}${rect(-18, 22, 36, 14, 3, '#0f5f73')}`,
  guichet: () => `${rect(-50, -40, 100, 62, 8, '#cde7f2')}${rect(-56, 18, 112, 22, 6, '#a2704c')}<circle cx="0" cy="-10" r="10" fill="${C.peau1}"/>`,
  plan: () => `${rect(-48, -34, 96, 68, 8, '#fff7e6', 'stroke="#c9a98f" stroke-width="4"')}<path d="M-34 24 L-10 -4 L10 8 L34 -22" ${trait(C.rose, 6)}/><circle cx="34" cy="-22" r="7" fill="#e23d3d"/>`,
  'fleche-droit': () => fleche(0),
  'fleche-gauche': () => fleche(-90),
  'fleche-droite': () => fleche(90),
  'fleche-haut': () => fleche(0, '#e23d3d'),
  'fleche-retour': () => `<g ${trait(C.teal, 12)}><path d="M-36 -14 H30 M12 -34 L34 -14 L12 6"/><path d="M36 22 H-30 M-12 2 L-34 22 L-12 42"/></g>`,
  repeter: () => fleche_boucle(0, 0, 1.1),
  'rue-p': () => `<path d="M-50 40 V-10 H-14 V40Z" fill="#d9b79a"/><path d="M-10 40 V-30 H28 V40Z" fill="#c9a07e"/><path d="M32 40 V0 H56 V40Z" fill="#e3c7a8"/><rect x="-52" y="36" width="110" height="10" fill="#8b8f93"/>`,
  passage: () => `<rect x="-50" y="-36" width="100" height="72" rx="6" fill="#8b8f93"/>${[-36, -18, 0, 18, 36].map((x) => `<rect x="${x - 6}" y="-34" width="12" height="68" fill="#fff"/>`).join('')}`,
  marche: () => `<g fill="#6a3b2c"><ellipse cx="-14" cy="12" rx="10" ry="18" transform="rotate(-12 -14 12)"/><ellipse cx="16" cy="-12" rx="10" ry="18" transform="rotate(-12 16 -12)"/></g>`,
  maison: () => `<path d="M-46 8 L0 -34 L46 8 V42 H-46Z" fill="#f3d9b8" stroke="#c9a07e" stroke-width="4"/>${rect(-10, 14, 20, 28, 3, '#8a5a3c')}`,
  horloge: () => `<circle r="38" fill="#fff" stroke="#6a6e72" stroke-width="6"/><path d="M0 -24 V0 L16 10" ${trait('#3a1d38', 6)}/>`,
  calendrier: () => `${rect(-42, -36, 84, 78, 10, '#fff', 'stroke="#d6457e" stroke-width="5"')}${rect(-42, -36, 84, 22, 8, '#d6457e')}<g fill="#cdb8f0">${[-24, 0, 24].flatMap((x) => [0, 18].map((y) => `<circle cx="${x}" cy="${y}" r="5"/>`)).join('')}</g>`,
  telephone: () => `${rect(-26, -46, 52, 92, 10, '#3a1d38')}${rect(-20, -36, 40, 64, 3, '#cde7f2')}<circle cx="0" cy="36" r="4" fill="#fff"/>`,
  bus: () => bus(0, 4, 0.26),
  arret: () => `<rect x="-5" y="-44" width="10" height="90" rx="4" fill="#6a6e72"/>${rect(-30, -50, 60, 44, 10, C.teal)}${rect(-18, -40, 36, 22, 4, '#fff')}`,
  siege: () => `<path d="M-30 -30 V10 H30 V40 M-30 10 V40" ${trait('#c8643c', 12)}/><rect x="-34" y="4" width="68" height="14" rx="6" fill="#c8643c"/>`,
  train: () => `${rect(-52, -30, 104, 62, 16, '#7b2d6b')}${rect(-40, -20, 28, 22, 4, '#cde7f2')}${rect(-6, -20, 28, 22, 4, '#cde7f2')}${rect(28, -20, 14, 22, 4, '#cde7f2')}<circle cx="-30" cy="38" r="9" fill="#2b2320"/><circle cx="30" cy="38" r="9" fill="#2b2320"/>`,
  'panneau-voie': () => `<rect x="-3" y="10" width="6" height="40" fill="#6a6e72"/>${rect(-34, -42, 68, 56, 10, '#2f6fb8')}<text x="0" y="2" font-size="42" font-weight="700" text-anchor="middle" fill="#fff" font-family="Segoe UI, sans-serif">3</text>`,
  hautparleur: () => `<g ${trait(C.teal, 8)}><path d="M-38 -14 H-20 L6 -36 V36 L-20 14 H-38Z" fill="${C.teal}"/><path d="M20 -16 C32 -4 32 4 20 16 M32 -30 C54 -10 54 10 32 30"/></g>`,
  'hautparleur-fort': () => `<g ${trait(C.rose, 8)}><path d="M-44 -14 H-26 L0 -36 V36 L-26 14 H-44Z" fill="${C.rose}"/><path d="M14 -18 C26 -6 26 6 14 18 M28 -32 C50 -12 50 12 28 32 M42 -44 C74 -18 74 18 42 44"/></g>`,
  croix: () => croix(0, 0, 0.8),
  porte: () => porte(-30, -48, 60, 96, false),
  medicaments: () => `${rect(-40, -26, 80, 52, 8, '#fff', 'stroke="#2f9e5b" stroke-width="5"')}<path d="M0 -16 V16 M-16 0 H16" ${trait('#2f9e5b', 8)}/><ellipse cx="44" cy="30" rx="14" ry="8" fill="#f08aa8" transform="rotate(-24 44 30)"/>`,
  thermometre: () => `<rect x="-8" y="-46" width="16" height="70" rx="8" fill="#fff" stroke="#9aa0a6" stroke-width="4"/><circle cx="0" cy="30" r="16" fill="#e23d3d"/><rect x="-3" y="-20" width="6" height="48" rx="3" fill="#e23d3d"/>`,
  ordonnance: () => `${rect(-34, -46, 68, 92, 6, '#fff', 'stroke="#c9a98f" stroke-width="4"')}<path d="M-20 -20 H20 M-20 -6 H20 M-20 8 H4" ${trait('#9aa0a6', 4)}/><path d="M18 22 v14 M11 29 h14" ${trait('#2f9e5b', 5)}/>`,
  enveloppe: () => `${rect(-46, -30, 92, 60, 6, '#fff7e6', 'stroke="#c9a98f" stroke-width="4"')}<path d="M-44 -26 L0 6 L44 -26" ${trait('#c9a98f', 4)}/>`,
  timbre: () => `${rect(-32, -38, 64, 76, 4, '#fff', 'stroke="#d6457e" stroke-width="5" stroke-dasharray="8 5"')}${rect(-22, -28, 44, 56, 2, '#cdb8f0')}<circle cx="0" cy="-4" r="12" fill="#f5b63d"/>`,
  colis: () => `${rect(-46, -32, 92, 68, 6, '#c88a4f', 'stroke="#a86a2a" stroke-width="4"')}${rect(-8, -32, 16, 68, 0, '#e8c48a')}`,
  'verre-eau': () => `<path d="M-26 -40 H26 L20 40 H-20Z" fill="#cde7f2" stroke="#6ab4e8" stroke-width="4"/><path d="M-23 -10 H23 L20 40 H-20Z" fill="#6ab4e8" opacity=".7"/>`,
  'mal-tete': () => tete() + eclairs(-40, -50),
  'mal-ventre': () => tete() + `<circle cx="0" cy="40" r="12" fill="#e23d3d" opacity=".7"/>`,
  'mal-gorge': () => tete() + `<ellipse cx="0" cy="22" rx="14" ry="8" fill="#e23d3d" opacity=".8"/>`,
  toux: () => tete() + `<g ${trait('#6a6e72', 5)}><path d="M34 -4 h14 M34 8 h20 M32 20 h12"/></g>`,
  escalier: () => `<path d="M-46 40 H-26 V20 H-6 V0 H14 V-20 H34 V-40 H46 V40Z" fill="#d9b79a" stroke="#c9a07e" stroke-width="4"/>`,
  'ascenseur-panne': () => `${rect(-34, -46, 68, 92, 6, '#c9ced3')}<path d="M0 -46 V46" stroke="#6a6e72" stroke-width="4"/><path d="M-22 -24 L22 24 M22 -24 L-22 24" ${trait('#e23d3d', 9)}/>`,
  stylo: () => `<g transform="rotate(-40)"><rect x="-8" y="-46" width="16" height="78" rx="4" fill="#2f6fb8"/><path d="M-8 32 L0 48 L8 32Z" fill="#3a1d38"/><rect x="-8" y="-46" width="16" height="12" rx="4" fill="#f5b63d"/></g>`,
  'bulle-sons': () => `<path d="M-46 -34 H46 V20 H-6 L-26 40 V20 H-46Z" fill="#fff" stroke="#d6ccbd" stroke-width="4"/><path d="M-26 -8 q8 -14 16 0 t16 0 t16 0" ${trait(C.teal, 5)}/>`,
  'bulle-nom': () => `<path d="M-46 -34 H46 V20 H-6 L-26 40 V20 H-46Z" fill="#fff" stroke="#d6ccbd" stroke-width="4"/>` + silhouette(0, -2, 0.7),
  oreille: () => `<path d="M12 -38 C-30 -38 -34 8 -12 18 C-2 24 -4 40 12 40 C28 40 30 22 20 8 C34 -2 40 -38 12 -38Z" fill="${C.peau1}" stroke="#c98d63" stroke-width="4"/>`,
  ampoule: () => `<circle cy="-10" r="26" fill="#ffe9a3" stroke="#f5b63d" stroke-width="5"/><path d="M-12 22 H12 M-9 32 H9" ${trait('#9aa0a6', 6)}/>`,
  sablier: () => sablier(0, 0, 0.8),
  pouce: () => `<path d="M-30 40 V-6 H-8 L4 -40 Q18 -40 16 -22 L12 -6 H40 Q50 -6 46 8 L40 38 Q38 44 30 44 H-10Z" fill="${C.peau1}" stroke="#c98d63" stroke-width="4"/><rect x="-42" y="-8" width="14" height="52" rx="4" fill="${C.teal}"/>`,
  // pain, croissant, pain rond
  baguette: () => baguette(0, 0, -24, 0.4),
  croissant: () => `<path d="M-46 14 Q-34 -34 0 -34 Q34 -34 46 14 Q30 4 22 6 Q10 -10 0 -10 Q-10 -10 -22 6 Q-30 4 -46 14Z" fill="#e0a04e" stroke="#b97a2a" stroke-width="4"/>`,
  'pain-rond': () => `<ellipse cx="0" cy="6" rx="44" ry="32" fill="#d99a4e" stroke="#b97a2a" stroke-width="4"/><path d="M-24 -4 L-8 14 M0 -10 L16 8 M20 -2 L34 12" ${trait('#a86a2a', 5)}/>`,
  // atelier des sons
  bain: () => `<path d="M-52 -2 H52 Q52 40 20 40 H-20 Q-52 40 -52 -2Z" fill="#cde7f2" stroke="#6ab4e8" stroke-width="4"/><path d="M-30 -2 Q-30 -34 -12 -34" ${trait('#9aa0a6', 6)}/><circle cx="20" cy="-18" r="8" fill="#fff" stroke="#9fd6ee" stroke-width="3"/><circle cx="36" cy="-30" r="5" fill="#fff" stroke="#9fd6ee" stroke-width="3"/>`,
  poule: () => `<ellipse cx="0" cy="12" rx="38" ry="30" fill="#fff" stroke="#e0b88a" stroke-width="4"/><circle cx="-28" cy="-22" r="18" fill="#fff" stroke="#e0b88a" stroke-width="4"/><path d="M-40 -42 q6 -12 12 0 q6 -12 12 0" fill="#e23d3d"/><path d="M-46 -22 l-14 6 l14 6Z" fill="#f5b63d"/><circle cx="-30" cy="-26" r="3" fill="#3a1d38"/><path d="M-10 52 V40 M10 52 V40" ${trait('#f5b63d', 5)}/>`,
  boule: () => `<circle r="40" fill="#d6457e"/><path d="M-40 0 Q0 -20 40 0 M-30 -26 Q0 -6 30 -26" ${trait('#fff', 5)} opacity=".7"/>`,
  roue: () => `<circle r="40" fill="#3a1d38"/><circle r="22" fill="#cfd8d6"/><g ${trait('#6a6e72', 4)}><path d="M0 -22 V22 M-22 0 H22 M-15 -15 L15 15 M15 -15 L-15 15"/></g>`,
  banc: () => `${rect(-50, -22, 100, 18, 6, '#a2704c')}${rect(-50, 2, 100, 18, 6, '#c08a61')}<path d="M-38 20 V44 M38 20 V44" ${trait('#6e4630', 8)}/>`,
  riz: () => `<path d="M-46 -4 H46 Q46 44 0 44 Q-46 44 -46 -4Z" fill="#cde7f2" stroke="#6ab4e8" stroke-width="4"/><g fill="#fff" stroke="#e8e0d0" stroke-width="2">${[[-26, -10], [-10, -18], [8, -14], [24, -8], [-16, -4], [2, -6], [18, 0]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" transform="rotate(${x * 3} ${x} ${y})"/>`).join('')}</g>`,
  lit: () => `${rect(-52, -6, 104, 30, 6, '#cdb8f0')}${rect(-52, -34, 18, 58, 5, '#a2704c')}${rect(-30, -22, 36, 18, 8, '#fff')}<path d="M-46 24 V40 M46 24 V40" ${trait('#6e4630', 8)}/>`,
  'bouche-fermee': () => `<path d="M-50 4 Q-26 -26 0 -14 Q26 -26 50 4 Q26 24 0 22 Q-26 24 -50 4Z" fill="#d6457e"/><path d="M-50 4 Q0 10 50 4" ${trait('#8f2757', 5)}/>`,
  'bouche-ou': () => `<ellipse cx="0" cy="4" rx="40" ry="34" fill="#d6457e"/><ellipse cx="0" cy="4" rx="16" ry="14" fill="#5c1f50"/>`,
  'bouche-u': () => `<ellipse cx="0" cy="4" rx="30" ry="26" fill="#d6457e"/><ellipse cx="0" cy="4" rx="9" ry="8" fill="#5c1f50"/><path d="M-30 4 q-8 0 -10 -6 M30 4 q8 0 10 -6" ${trait('#d6457e', 6)}/>`,
  'bouche-ouverte': () => `<path d="M-52 4 Q0 -34 52 4 Q0 52 -52 4Z" fill="#d6457e"/><path d="M-36 4 Q0 -18 36 4 Q0 34 -36 4Z" fill="#5c1f50"/><path d="M-22 10 Q0 24 22 10 Q0 6 -22 10Z" fill="#ff7a96"/>`,
};

// --- Décors ---
const DECORS = {
  palier: () => ({ fond: plat('#ffe9df'), corps: `<rect x="0" y="470" width="600" height="130" fill="#e8cdb6"/>${porte(40, 130, 130, 340)}${porte(430, 130, 130, 340)}` }),
  rue: () => ({ fond: ciel('#ffd9a3', '#fff2d2'), corps: `${soleil(90, 100, 36)}${immeubles(440)}${sol(440, '#b8c79f')}` }),
  boulangerie: () => ({ fond: ciel('#ffe4b8', '#fff3dc'), corps: `<rect x="40" y="90" width="520" height="14" fill="#a2704c"/><rect x="40" y="170" width="520" height="14" fill="#a2704c"/>${[80, 170, 260, 350, 440].map((x) => baguette(x + 40, 80, -8, 0.32)).join('')}${[110, 230, 350, 470].map((x) => `<ellipse cx="${x}" cy="158" rx="34" ry="18" fill="#d99a4e"/>`).join('')}${comptoir(470)}` }),
  marche: () => ({ fond: ciel('#cfe8f4', '#fff3dc'), corps: `<path d="M0 60 H600 V130 Q550 160 500 130 Q450 160 400 130 Q350 160 300 130 Q250 160 200 130 Q150 160 100 130 Q50 160 0 130Z" fill="#ff7a66"/><path d="M0 60 H100 V130 Q50 160 0 130Z M200 60 H300 V130 Q250 160 200 130Z M400 60 H500 V130 Q450 160 400 130Z" fill="#fff"/><rect x="0" y="470" width="600" height="130" fill="#b8c79f"/>${[60, 200, 340, 480].map((x, i) => `<rect x="${x}" y="400" width="110" height="70" rx="6" fill="${['#e0453f', '#f5c93d', '#ff9a2a', '#3fa98f'][i]}"/>`).join('')}` }),
  caisse: () => ({ fond: plat('#ffe9df'), corps: `<rect x="0" y="120" width="600" height="14" fill="#c9a07e"/>${[60, 150, 240].map((x, i) => `<rect x="${x}" y="40" width="70" height="80" rx="8" fill="${['#cdb8f0', '#ffd9c7', '#cfeee5'][i]}"/>`).join('')}${comptoir(470)}` }),
  arret: () => ({ fond: ciel('#cfe8f4', '#f8efe0'), corps: `<rect x="0" y="440" width="600" height="160" fill="#8b8f93"/><rect x="0" y="520" width="600" height="12" fill="#f5f0e0" opacity=".7"/><rect x="76" y="140" width="10" height="310" fill="#6a6e72"/><rect x="40" y="110" width="82" height="62" rx="12" fill="${C.teal}"/><rect x="62" y="128" width="38" height="26" rx="4" fill="#fff"/>` }),
  guichet: () => ({ fond: plat('#ffe9df'), corps: `${comptoir(470)}<rect x="60" y="80" width="480" height="150" rx="14" fill="#cde7f2" stroke="#fff" stroke-width="8"/><rect x="60" y="230" width="480" height="30" fill="#c08a61"/>` }),
  gare: () => ({ fond: ciel('#bcd3ea', '#f3ece6'), corps: `<rect x="0" y="80" width="600" height="40" fill="#7b2d6b"/><rect x="0" y="460" width="600" height="140" fill="#9aa0a6"/><rect x="0" y="480" width="600" height="14" fill="#6a6e72"/><rect x="0" y="540" width="600" height="14" fill="#6a6e72"/>` }),
  pharmacie: () => ({ fond: plat('#dcf3ec'), corps: `<rect x="0" y="470" width="600" height="130" fill="#bfe7d6"/>${croix(300, 80, 0.8)}<rect x="40" y="140" width="520" height="14" fill="#2f9e5b"/>` }),
  bureau: () => ({ fond: plat('#ffe9df'), corps: `${comptoir(470)}<rect x="440" y="50" width="110" height="130" rx="8" fill="#fff" stroke="#d6457e" stroke-width="5"/><rect x="440" y="50" width="110" height="30" rx="6" fill="#d6457e"/>` }),
  poste: () => ({ fond: plat('#fff0c9'), corps: `<rect x="0" y="470" width="600" height="130" fill="#e8cdb6"/><rect x="60" y="260" width="110" height="210" rx="14" fill="#f5c93d"/><rect x="80" y="300" width="70" height="12" rx="6" fill="#3a1d38"/>${comptoir(470)}` }),
  maison: () => ({ fond: plat('#ffe9df'), corps: `<rect x="0" y="470" width="600" height="130" fill="#e8cdb6"/><rect x="40" y="340" width="220" height="130" rx="30" fill="#cdb8f0"/><rect x="40" y="320" width="220" height="40" rx="20" fill="#b9a2e6"/><rect x="380" y="60" width="150" height="150" rx="10" fill="#cde7f2" stroke="#fff" stroke-width="8"/>` }),
  neutre: () => ({ fond: plat('#fff0f5'), corps: `<circle cx="300" cy="300" r="250" fill="#ffe0ea"/>` }),
};

function hash(t) {
  let h = 7;
  for (const c of t) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
const ROBES = [C.rose, C.teal, C.violet, C.terre, C.or, C.prune];
const PEAUX = [C.peau1, C.peau3, C.peau2];
const CHEVEUX = [C.cheveux1, C.cheveux2, C.cheveux3];
const pick = (liste, h, d = 0) => liste[(h >>> d) % liste.length];

function perso(seed, x, y, s, extra = {}, decalage = 0) {
  const h = hash(seed) >>> decalage;
  return femme({ x, y, s, robe: pick(ROBES, h, 1), peau: pick(PEAUX, h, 3), cheveux: pick(CHEVEUX, h, 5), fleur: (h >>> 7) % 3 === 0, ...extra });
}

const emplacements = {
  1: [[0, 0, 1]],
  2: [[-46, 0, 0.8], [46, 0, 0.8]],
  3: [[-60, 0, 0.7], [0, 0, 0.7], [60, 0, 0.7]],
};

function placer(noms, cx, cy, k) {
  const pos = emplacements[Math.min(noms.length, 3)] ?? [];
  return noms.slice(0, 3).map((nom, i) => (PROPS[nom] ? g(PROPS[nom](), cx + pos[i][0] * k, cy + pos[i][1] * k, pos[i][2] * k) : '')).join('');
}

function composer(spec) {
  const decor = DECORS[spec.bg]();
  let corps = decor.corps;
  const props = spec.props ?? [];
  for (const p of props) if (!PROPS[p]) throw new Error(`Objet inconnu : ${p} (image ${spec.id})`);
  if (spec.layout === 'objet') {
    corps += placer(props, 300, 300, props.length === 1 ? 3.4 : props.length === 2 ? 2.4 : 1.9);
  } else if (spec.layout === 'solo') {
    corps += perso(spec.seed, 190, 190, 0.92, { droit: [100, 130], gauche: [-60, 150] });
    corps += props.length ? placer(props, 420, 300, props.length === 1 ? 2.4 : 1.7) : '';
  } else {
    corps += perso(spec.seed, 160, 210, 0.82, { droit: [64, 150] }, 0);
    corps += perso(spec.seed + 'b', 440, 210, 0.82, { flip: true, droit: [64, 150], gauche: [-60, 150] }, 4);
    if (props.length) corps += bulle(150, 24, 300, 150, [412, 214], placer(props, 300, 100, 1.15));
  }
  image(spec.id, decor.fond, corps);
}

let n = 0;
for (const spec of specs) {
  composer(spec);
  n += 1;
}
console.log(`${n} illustrations écrites dans public/images`);
void id; void lune; void coeur; void sablier; void silhouette; void smiley;
