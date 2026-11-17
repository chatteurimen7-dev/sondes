// Fonctions de texte sans dépendance : lues aussi directement par les scripts Node.

/** Met un texte sous une forme comparable : minuscules, sans accents ni ponctuation. */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Vrai si deux phrases ne diffèrent que par la casse, les accents ou la ponctuation. */
export function memeTexte(a: string, b: string): boolean {
  return normaliser(a) === normaliser(b);
}
