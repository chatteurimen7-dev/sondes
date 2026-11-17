// Enregistrement en mémoire pour que Sondes puisse s'écouter. Rien n'est stocké :
// l'enregistrement disparaît quand on change d'étape (revoke) ou ferme la page.

export interface Enregistrement {
  /** Arrête et renvoie l'URL temporaire de l'enregistrement (à libérer avec liberer()). */
  arreter(): Promise<string>;
  annuler(): void;
}

export function enregistrementDisponible(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

export async function demarrerEnregistrement(dureeMaxMs = 6000, quandAuto?: (url: string) => void): Promise<Enregistrement> {
  const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
  const morceaux: Blob[] = [];
  const rec = new MediaRecorder(flux);
  let resolu = false;
  const fermer = () => flux.getTracks().forEach((t) => t.stop());

  const fini = new Promise<string>((resolve) => {
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) morceaux.push(e.data);
    };
    rec.onstop = () => {
      fermer();
      resolve(URL.createObjectURL(new Blob(morceaux, { type: rec.mimeType || 'audio/webm' })));
    };
  });
  rec.start();
  const minuteur = setTimeout(() => {
    if (rec.state !== 'inactive') {
      rec.stop();
      void fini.then((u) => {
        if (!resolu) quandAuto?.(u);
      });
    }
  }, dureeMaxMs);

  return {
    async arreter() {
      clearTimeout(minuteur);
      resolu = true;
      if (rec.state !== 'inactive') rec.stop();
      return fini;
    },
    annuler() {
      clearTimeout(minuteur);
      resolu = true;
      if (rec.state !== 'inactive') rec.stop();
      fermer();
    },
  };
}

export function liberer(url: string | undefined): void {
  if (url) URL.revokeObjectURL(url);
}
