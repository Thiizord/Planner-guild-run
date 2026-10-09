// ClassIcon.jsx - Ícones SVG nativos para cada classe de herói.
// Substituem os emojis que estavam corrompidos por mojibake (PowerShell
// leu UTF-8 como Windows-1252). SVG é puro ASCII — zero problema de encoding.

const PATHS = {
  Warrior:
    'M3 3l7 7m11-7l-7 7M3 21l7-7m11 7l-7-7' +
    'M12 7v2m0 6v2M7 12h2m6 0h2',
  Tank:
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' +
    'M12 8v6',
  Vanguard:
    'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z',
  Assassin:
    'M12 2v13M7 15h10M12 15v7M9 22h6' +
    'M10 5l2-3 2 3',
  Duelist:
    'M13 2L3 14h7l-1 8 11-14h-7l1-6z',
  Mystic:
    'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 11a1 1 0 1 0 1 1',
  Mage:
    'M12 2l2.5 7.5H22l-6 4.5l2.3 7.5L12 17.3l-6.3 4.2L8 14L2 9.5h7.5z',
};

export default function ClassIcon({ name, size = 20, className = '' }) {
  const d = PATHS[name];
  if (!d) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
