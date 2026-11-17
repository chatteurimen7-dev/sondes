// Stockage local (IndexedDB). Rien ne quitte le PC de Sondes.
import { etatInitial, migrer } from '../domain/etat';
import type { Etat } from '../domain/types';

const NOM_BASE = 'mon-francais';
const STORE = 'kv';
const CLE_ETAT = 'etat';
const CLE_DOSSIER = 'dossier-sauvegarde';

let connexion: Promise<IDBDatabase> | undefined;

function ouvrir(): Promise<IDBDatabase> {
  connexion ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(NOM_BASE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return connexion;
}

export async function lire<T>(cle: string): Promise<T | undefined> {
  const db = await ouvrir();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(cle);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function ecrire(cle: string, valeur: unknown): Promise<void> {
  const db = await ouvrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(valeur, cle);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function chargerEtat(): Promise<Etat> {
  const brut = await lire<unknown>(CLE_ETAT);
  if (brut === undefined) return etatInitial();
  try {
    return migrer(brut);
  } catch {
    // Données illisibles : on ne les écrase pas silencieusement, on repart d'un état neuf
    // et on garde l'ancien contenu sous une autre clé pour que l'accompagnante puisse le récupérer.
    await ecrire(`${CLE_ETAT}-illisible-${Date.now()}`, brut);
    return etatInitial();
  }
}

export async function sauverEtat(etat: Etat): Promise<void> {
  await ecrire(CLE_ETAT, etat);
}

export async function lireDossier(): Promise<FileSystemDirectoryHandle | undefined> {
  return lire<FileSystemDirectoryHandle>(CLE_DOSSIER);
}

export async function memoriserDossier(dossier: FileSystemDirectoryHandle): Promise<void> {
  await ecrire(CLE_DOSSIER, dossier);
}

/** Efface toutes les données de Sondes sur ce PC (progression, réglages, dossier mémorisé). */
export async function toutEffacer(): Promise<void> {
  if (connexion) {
    (await connexion).close();
    connexion = undefined;
  }
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(NOM_BASE);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

/** Demande au navigateur de ne pas effacer ces données automatiquement. */
export async function demanderStockagePersistant(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* sans effet */
  }
  return false;
}
