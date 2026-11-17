// Décor de fond : jasmin (fleur emblématique de la Tunisie), feuilles, petits points dorés.
// Purement décoratif : masqué aux lecteurs d'écran, jamais cliquable.

function Jasmin({ x, y, r = 1, rot = 0 }: { x: number; y: number; r?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="0" cy="-26" rx="13" ry="26" transform={`rotate(${a})`} fill="#fffaf8" stroke="#f2b8cc" strokeWidth="2.5" />
      ))}
      <circle r="10" fill="#f5b63d" />
      <circle r="4" fill="#e08a1e" />
    </g>
  );
}

function Feuille({ x, y, r = 1, rot = 0, couleur = '#3fb59d' }: { x: number; y: number; r?: number; rot?: number; couleur?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>
      <path d="M0 0 C30 -26 78 -22 96 0 C78 22 30 26 0 0Z" fill={couleur} />
      <path d="M6 0 H84" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

export function Decor() {
  return (
    <div className="decor" aria-hidden="true">
      <svg className="decor-haut" viewBox="0 0 360 300" width="360" height="300">
        <Feuille x={20} y={70} r={1.15} rot={35} />
        <Feuille x={40} y={20} r={1} rot={72} couleur="#2aa18c" />
        <Feuille x={96} y={120} r={0.9} rot={8} couleur="#6ccdb8" />
        <Jasmin x={120} y={70} r={1.1} rot={10} />
        <Jasmin x={60} y={150} r={0.8} rot={30} />
        <Jasmin x={170} y={14} r={0.7} rot={0} />
        <circle cx="220" cy="90" r="6" fill="#f5b63d" />
        <circle cx="250" cy="52" r="4" fill="#ff7a66" />
        <circle cx="190" cy="140" r="4" fill="#cdb8f0" />
      </svg>
      <svg className="decor-bas" viewBox="0 0 360 300" width="360" height="300">
        <Feuille x={340} y={230} r={1.15} rot={215} />
        <Feuille x={330} y={290} r={1} rot={252} couleur="#2aa18c" />
        <Feuille x={270} y={190} r={0.9} rot={190} couleur="#6ccdb8" />
        <Jasmin x={236} y={226} r={1.1} rot={20} />
        <Jasmin x={300} y={150} r={0.8} rot={0} />
        <Jasmin x={186} y={286} r={0.7} rot={40} />
        <circle cx="130" cy="210" r="6" fill="#f5b63d" />
        <circle cx="100" cy="250" r="4" fill="#d6457e" />
        <circle cx="170" cy="160" r="4" fill="#cdb8f0" />
      </svg>
    </div>
  );
}
