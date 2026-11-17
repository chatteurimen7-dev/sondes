import type { ReactNode } from 'react';

// Pictogrammes de travail (provisoires). Ils sont remplacés par de vraies illustrations
// dès qu'un fichier du même nom est ajouté dans public/images (voir docs/images.md).

export type NomPicto =
  | 'soleil' | 'lune' | 'main' | 'personne' | 'coeur' | 'maison' | 'bulle' | 'interro' | 'sablier'
  | 'repeter' | 'micro' | 'hautparleur' | 'epingle' | 'porte' | 'pain' | 'voiture' | 'bus' | 'croix'
  | 'oreille' | 'ampoule' | 'bouche' | 'check' | 'play' | 'oeil' | 'calendrier' | 'disque' | 'dossier' | 'poubelle' | 'fleche';

export const TRACES: Record<NomPicto, ReactNode> = {
  soleil: (
    <>
      <circle cx="50" cy="50" r="16" />
      <path d="M50 14V26M50 74V86M14 50H26M74 50H86M24 24L33 33M67 67L76 76M76 24L67 33M33 67L24 76" />
    </>
  ),
  lune: <path d="M62 18A34 34 0 1 0 82 64A28 28 0 1 1 62 18Z" />,
  main: <path d="M32 54V34a4.5 4.5 0 0 1 9 0V50M41 50V22a4.5 4.5 0 0 1 9 0V48M50 48V18a4.5 4.5 0 0 1 9 0V48M59 48V24a4.5 4.5 0 0 1 9 0V62C68 78 60 88 48 88C38 88 31 82 27 72L19 56a4.5 4.5 0 0 1 8-4L32 60" />,
  personne: (
    <>
      <circle cx="50" cy="30" r="14" />
      <path d="M22 88C22 60 78 60 78 88" />
    </>
  ),
  coeur: <path d="M50 84C18 62 16 34 34 28C44 25 50 34 50 38C50 34 56 25 66 28C84 34 82 62 50 84Z" />,
  maison: <path d="M18 50L50 20L82 50V82H18ZM42 82V58H58V82" />,
  bulle: <path d="M16 24H84V64H48L30 80V64H16Z" />,
  interro: (
    <>
      <path d="M36 38C36 20 64 20 64 38C64 52 50 52 50 64" />
      <circle cx="50" cy="80" r="2.5" />
    </>
  ),
  sablier: <path d="M28 16H72M28 84H72M31 16C31 46 69 46 69 16M31 84C31 54 69 54 69 84" />,
  repeter: <path d="M78 52A28 28 0 1 1 64 28M64 12V30H82" />,
  micro: (
    <>
      <rect x="38" y="12" width="24" height="46" rx="12" />
      <path d="M24 46C24 74 76 74 76 46M50 72V88M36 88H64" />
    </>
  ),
  hautparleur: (
    <>
      <path d="M16 38H32L54 20V80L32 62H16Z" />
      <path d="M66 36C75 45 75 55 66 64M74 26C90 42 90 58 74 74" />
    </>
  ),
  epingle: (
    <>
      <path d="M50 88C22 56 26 16 50 16C74 16 78 56 50 88Z" />
      <circle cx="50" cy="42" r="9" />
    </>
  ),
  porte: (
    <>
      <path d="M28 14H72V86H28Z" />
      <circle cx="60" cy="52" r="3" />
    </>
  ),
  pain: <path d="M14 64L62 16C72 8 86 22 78 30L30 78C22 86 6 72 14 64ZM40 40L52 52M50 30L62 42M30 50L42 62" />,
  voiture: (
    <>
      <path d="M10 64H90V50L78 36H30L18 50V64ZM34 36L40 24H64L72 36" />
      <circle cx="30" cy="68" r="8" />
      <circle cx="70" cy="68" r="8" />
    </>
  ),
  bus: (
    <>
      <rect x="14" y="22" width="72" height="50" rx="7" />
      <path d="M14 46H86M40 22V46M62 22V46" />
      <circle cx="32" cy="78" r="6" />
      <circle cx="68" cy="78" r="6" />
    </>
  ),
  croix: <path d="M40 18H60V40H82V60H60V82H40V60H18V40H40Z" />,
  oreille: <path d="M64 38C64 14 30 14 30 46C30 60 42 64 44 74C46 86 62 86 64 72M50 40C50 32 42 32 42 44" />,
  ampoule: (
    <>
      <circle cx="50" cy="40" r="22" />
      <path d="M40 66H60M43 76H57" />
    </>
  ),
  bouche: <path d="M14 50C32 32 68 32 86 50C68 68 32 68 14 50ZM20 50H80" />,
  check: <path d="M22 54L42 74L80 30" />,
  play: <path d="M34 20L80 50L34 80Z" />,
  oeil: (
    <>
      <path d="M10 50C28 24 72 24 90 50C72 76 28 76 10 50Z" />
      <circle cx="50" cy="50" r="10" />
    </>
  ),
  calendrier: <path d="M16 26H84V84H16ZM16 42H84M32 14V30M68 14V30" />,
  disque: <path d="M18 18H72L82 28V82H18ZM34 18V40H64V18M32 82V58H68V82" />,
  dossier: <path d="M12 30H40L48 40H88V80H12Z" />,
  poubelle: <path d="M24 28H76M40 28V18H60V28M30 28L34 84H66L70 28M44 42V70M56 42V70" />,
  fleche: <path d="M20 50H80M56 26L80 50L56 74" />,
};

export function Picto({ nom, taille = 64, couleur = 'currentColor', epaisseur = 5 }: { nom: NomPicto; taille?: number; couleur?: string; epaisseur?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={taille}
      height={taille}
      fill="none"
      stroke={couleur}
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TRACES[nom]}
    </svg>
  );
}
