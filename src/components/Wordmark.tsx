/**
 * Brand wordmark — matches the business card: Playfair Display Bold, uppercase,
 * letter-spacing 0.18em (medium weight read too thin at navbar size). Gold on dark surfaces; deep green on light surfaces
 * (plain gold on cream is only 3.1:1 and too faint for older eyes).
 *
 * The DOM text stays "Antam Homes" (screen readers, copy/paste, SEO); the
 * caps come from CSS.
 */
type Props = {
  /** Which surface the wordmark sits on. */
  on?: "dark" | "light";
  /** Tailwind size preset. */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-[13px] md:text-sm",
  md: "text-base md:text-[18px]",
  lg: "text-lg md:text-[22px]",
};

const Wordmark = ({ on = "dark", size = "md", className = "" }: Props) => (
  <span
    className={`font-display font-bold uppercase tracking-[0.18em] leading-none whitespace-nowrap ${SIZES[size]} ${
      on === "dark" ? "text-gold-on-dark" : "text-primary"
    } ${className}`}
  >
    Antam Homes
  </span>
);

export default Wordmark;
