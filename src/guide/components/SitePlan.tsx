import type { Apartment } from "../config/apartments";
import type { GuideStrings } from "../i18n";

/**
 * Schematický plánek pozemku (SVG): ulice dole, branka a vjezdová brána,
 * dům vlevo za brankou, parkovací místa za vjezdovou bránou. Zvýrazněná
 * zlatá trasa vede k vybranému bytu (B01–B03 dům, B04–B05 vlastní vchod).
 */
interface Props {
  apartment: Apartment;
  t: GuideStrings;
}

const SitePlan = ({ apartment, t }: Props) => {
  const p = t.sitePlan;
  const toHouse = apartment.entrance === "main";
  // Trasa: od ulice (bod „Vy“) brankou k domu, nebo k vlastnímu vchodu.
  const route = toHouse
    ? "M 60 330 L 60 250 L 60 150 L 110 110"
    : "M 60 330 L 60 250 L 250 250 L 250 180";

  return (
    <figure className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <svg
        viewBox="0 0 360 360"
        role="img"
        aria-label="Plánek pozemku"
        className="h-auto w-full"
      >
        {/* Pozemek */}
        <rect x="20" y="20" width="320" height="290" rx="10" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
        {/* Dům vlevo za brankou */}
        <rect x="40" y="50" width="130" height="110" rx="6" fill="hsl(var(--primary))" />
        <text x="105" y="110" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="12" fontWeight="600">
          {p.house}
        </text>
        {/* Vlastní vchody B04/B05 */}
        <rect x="215" y="150" width="90" height="60" rx="6" fill="hsl(var(--charcoal-light))" />
        <text x="260" y="177" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="600">
          {p.ownEntrance.split(" (").map((part, i) => (
            <tspan key={i} x="260" dy={i ? 14 : 0}>{i ? `(${part}` : part}</tspan>
          ))}
        </text>
        {/* Parkovací místa za vjezdovou bránou */}
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i}>
            <rect
              x={215 + (i % 3) * 40}
              y={i < 3 ? 40 : 85}
              width="34"
              height="38"
              rx="4"
              fill="hsl(var(--secondary))"
              stroke={apartment.label === `B0${i + 1}` ? "hsl(var(--gold))" : "hsl(var(--border))"}
              strokeWidth={apartment.label === `B0${i + 1}` ? 3 : 1}
            />
            <text
              x={232 + (i % 3) * 40}
              y={i < 3 ? 64 : 109}
              textAnchor="middle"
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
            >
              {`B0${i + 1}`}
            </text>
          </g>
        ))}
        <text x="260" y="140" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
          {p.parking}
        </text>

        {/* Ulice dole */}
        <rect x="0" y="310" width="360" height="50" fill="hsl(var(--secondary))" />
        <text x="180" y="345" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">
          {p.street}
        </text>
        {/* Branka a vjezdová brána */}
        <rect x="50" y="298" width="20" height="14" fill="hsl(var(--primary))" />
        <text x="60" y="292" textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))">
          {p.gate}
        </text>
        <rect x="150" y="298" width="60" height="14" fill="hsl(var(--primary))" />
        <text x="180" y="292" textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))">
          {p.drivewayGate}
        </text>

        {/* Zvýrazněná trasa k vybranému bytu */}
        <path d={route} fill="none" stroke="hsl(var(--gold))" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
        {/* Výchozí bod „Vy“ */}
        <circle cx="60" cy="330" r="9" fill="hsl(var(--gold))" />
        <text x="60" y="334" textAnchor="middle" fontSize="8" fontWeight="700" fill="hsl(var(--accent-foreground))">
          {p.you}
        </text>
      </svg>
    </figure>
  );
};

export default SitePlan;
