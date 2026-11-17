// Sauvegarde et restauration sur le même PC.
// Format : un fichier JSON daté, écrit dans un dossier choisi une fois par l'accompagnante.
import { migrer } from '../domain/etat';
import type { Etat } from '../domain/types';

export interface Sauvegarde {
  format: 'sondes-sauvegarde';
  version: 1;
  date: string;
  etat: Etat;
}

export const PREFIXE = 'sondes-sauvegarde-';
export const PREFIXE_SECURITE = 'sondes-avant-restauration-';
export const NOMBRE_A_GARDER = 10;

export function horodatage(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
}

export function nomFichier(date: Date, prefixe = PREFIXE): string {
  return `${prefixe}${horodatage(date)}.json`;
}

export function creerSauvegarde(etat: Etat, maintenant: Date = new Date()): Sauvegarde {
  return { format: 'sondes-sauvegarde', version: 1, date: maintenant.toISOString(), etat };
}

/** Lit et vérifie le contenu d'un fichier de sauvegarde. Lève une erreur s'il n'est pas valide. */
export function lireSauvegarde(texte: string): Etat {
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    throw new Error('fichier-illisible');
  }
  const s = brut as Partial<Sauvegarde> | null;
  if (!s || s.format !== 'sondes-sauvegarde' || s.version !== 1 || !s.etat) throw new Error('fichier-invalide');
  return migrer(s.etat);
}

// Sous-ensemble de FileSystemDirectoryHandle dont on a besoin (facilite les tests).
export interface DossierLike {
  name?: string;
  getFileHandle(
    nom: string,
    options?: { create?: boolean },
  ): Promise<{
    createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }>;
    getFile(): Promise<{ text(): Promise<string> }>;
  }>;
  removeEntry(nom: string): Promise<void>;
  values(): AsyncIterable<{ kind: string; name: string }>;
}

export async function listerSauvegardes(dossier: DossierLike): Promise<string[]> {
  const noms: string[] = [];
  for await (const entree of dossier.values()) {
    if (entree.kind === 'file' && entree.name.startsWith(PREFIXE) && entree.name.endsWith('.json')) noms.push(entree.name);
  }
  return noms.sort().reverse(); // la plus récente d'abord
}

async function ecrireFichier(dossier: DossierLike, nom: string, contenu: string): Promise<void> {
  const fichier = await dossier.getFileHandle(nom, { create: true });
  const flux = await fichier.createWritable();
  await flux.write(contenu);
  await flux.close();
}

/** Écrit une nouvelle sauvegarde puis ne garde que les plus récentes. */
export async function ecrireSauvegarde(dossier: DossierLike, etat: Etat, maintenant: Date = new Date(), garder = NOMBRE_A_GARDER): Promise<string> {
  const nom = nomFichier(maintenant);
  await ecrireFichier(dossier, nom, JSON.stringify(creerSauvegarde(etat, maintenant)));
  const toutes = await listerSauvegardes(dossier);
  for (const ancienne of toutes.slice(garder)) await dossier.removeEntry(ancienne);
  return nom;
}

/** Copie de sécurité de l'état courant, écrite avant toute restauration. Jamais supprimée automatiquement. */
export async function ecrireCopieSecurite(dossier: DossierLike, etat: Etat, maintenant: Date = new Date()): Promise<string> {
  const nom = nomFichier(maintenant, PREFIXE_SECURITE);
  await ecrireFichier(dossier, nom, JSON.stringify(creerSauvegarde(etat, maintenant)));
  return nom;
}

export async function lireSauvegardeDuDossier(dossier: DossierLike, nom: string): Promise<Etat> {
  const fichier = await (await dossier.getFileHandle(nom)).getFile();
  return lireSauvegarde(await fichier.text());
}

/** Plan B quand le dossier n'est pas disponible : téléchargement d'un fichier. */
export function telecharger(etat: Etat, maintenant: Date = new Date()): void {
  const blob = new Blob([JSON.stringify(creerSauvegarde(etat, maintenant))], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier(maintenant);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Permission = 'granted' | 'denied' | 'prompt';
interface DossierAvecPermission {
  queryPermission?(d: { mode: 'readwrite' }): Promise<Permission>;
  requestPermission?(d: { mode: 'readwrite' }): Promise<Permission>;
}

/** Vérifie l'autorisation d'écrire dans le dossier. `demander` n'est possible qu'après un clic. */
export async function autorisationDossier(dossier: FileSystemDirectoryHandle, demander: boolean): Promise<boolean> {
  const d = dossier as unknown as DossierAvecPermission;
  try {
    if ((await d.queryPermission?.({ mode: 'readwrite' })) === 'granted') return true;
    if (demander && (await d.requestPermission?.({ mode: 'readwrite' })) === 'granted') return true;
  } catch {
    /* refusé */
  }
  return false;
}

export function selecteurDeDossierDisponible(): boolean {
  return typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function';
}

export async function choisirDossier(): Promise<FileSystemDirectoryHandle | undefined> {
  try {
    const choisir = (window as unknown as { showDirectoryPicker: (o: { mode: 'readwrite' }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
    return await choisir({ mode: 'readwrite' });
  } catch {
    return undefined; // annulé
  }
}
