// Voix en derja : fabrication de la requête de synthèse (Azure AI Speech, voix ar-TN-ReemNeural).
// Fonctions pures, sans réseau, lues aussi par les scripts Node.

export const VOIX_DERJA = 'ar-TN-ReemNeural';
export const LANGUE_DERJA = 'ar-TN';
/** Un peu plus lent que la normale : Sondes débute et doit pouvoir suivre. */
export const VITESSE_PAR_DEFAUT = -8;

export interface TexteDerja {
  texte: string;
  statut: 'brouillon' | 'valide' | 'a_refaire';
}

export function echapperXml(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** Vrai si le texte contient au moins une lettre arabe : le derja se donne à la voix en écriture arabe. */
export function aUnTexteArabe(texte: string): boolean {
  return /[؀-ۿ]/.test(texte);
}

export function construireSsml(texte: string, vitesse: number = VITESSE_PAR_DEFAUT, voix: string = VOIX_DERJA): string {
  const signe = vitesse > 0 ? '+' : '';
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${LANGUE_DERJA}">` +
    `<voice name="${voix}"><prosody rate="${signe}${vitesse}%">${echapperXml(texte.trim())}</prosody></voice></speak>`
  );
}

export function adresseSynthese(region: string): string {
  return `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

/** Le texte est-il à synthétiser ? Les messages à refaire attendent une nouvelle version. */
export function aSynthetiser(t: TexteDerja | undefined): t is TexteDerja {
  return !!t && t.statut !== 'a_refaire' && aUnTexteArabe(t.texte);
}
