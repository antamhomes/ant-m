/**
 * Brand wordmark — matches the business card: Playfair Display, uppercase,
 * wide letter-spacing. Gold on dark surfaces; deep green on light surfaces
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
  md: "text-[15px] md:text-[17px]",
  lg: "text-lg md:text-xl",
};

const Wordmark = ({ on = "dark", size = "md", className = "" }: Props) => (
  <span
    className={`font-display font-medium uppercase tracking-[0.24em] leading-none whitespace-nowrap ${SIZES[size]} ${
      on === "dark" ? "text-gold-on-dark" : "text-primary"
    } ${className}`}
  >
    Antam Homes
  </span>
);

export default Wordmark;
