import { useCallback, useEffect, useState } from "react";
import { KeyRound, Home, LifeBuoy, Mail, Phone, MessageCircle } from "lucide-react";
import Wordmark from "@/components/Wordmark";
import { APARTMENTS, getApartment, type Apartment } from "@/guide/config/apartments";
import { GUIDE_LANGS, DEFAULT_GUIDE_LANG } from "@/guide/i18n";
import ArrivalWizard from "@/guide/components/ArrivalWizard";
import InApartment from "@/guide/components/InApartment";

type Tab = "arrival" | "inApartment" | "help";

const pathApartment = (): Apartment | undefined =>
  typeof window === "undefined"
    ? undefined
    : getApartment(window.location.pathname.replace(/^\/guide\/?/i, "").replace(/\/.*$/, ""));

/**
 * Průvodce příjezdem pro hosty (/guide, /guide/b01…b05). Stránka není v menu
 * webu ani v sitemapě; hosté dostanou odkaz ve zprávě po rezervaci.
 * Primárně mobilní, všechny texty v src/guide/i18n, data v src/guide/config.
 */
const Guide = () => {
  const t = GUIDE_LANGS[DEFAULT_GUIDE_LANG];
  const [apartment, setApartment] = useState<Apartment | undefined>(pathApartment);
  const [tab, setTab] = useState<Tab>("arrival");

  // Stránky nemají být dohledatelné přes Google.
  useEffect(() => {
    document.title = `${t.header.title} · Antam Homes`;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [t]);

  useEffect(() => {
    const onPop = () => setApartment(pathApartment());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const select = useCallback((a: Apartment) => {
    window.history.pushState(null, "", `/guide/${a.id}`);
    setApartment(a);
    setTab("arrival");
    window.scrollTo(0, 0);
  }, []);

  const openInApartment = useCallback(() => {
    setTab("inApartment");
    window.scrollTo(0, 0);
  }, []);

  const TABS: Array<{ id: Tab; label: string; Icon: typeof KeyRound }> = [
    { id: "arrival", label: t.tabs.arrival, Icon: KeyRound },
    { id: "inApartment", label: t.tabs.inApartment, Icon: Home },
    { id: "help", label: t.tabs.help, Icon: LifeBuoy },
  ];

  return (
    <div className="min-h-dvh bg-background pb-28">
      {/* Hlavička */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Wordmark on="light" size="sm" />
            {apartment && (
              <span className="rounded-full border border-gold/60 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Byt {apartment.label}
              </span>
            )}
          </div>
          {/* Přepínač jazyků — zatím jen CZ; další viz src/guide/i18n */}
          <div className="flex gap-1" role="group" aria-label="Jazyk">
            {Object.keys(GUIDE_LANGS).map((lang) => (
              <span
                key={lang}
                aria-current="true"
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 pt-6">
        {!apartment ? (
          /* /guide — úvodní výběr bytu */
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl text-primary">{t.choose.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.choose.hint}</p>
            </div>
            <div className="grid gap-3">
              {APARTMENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => select(a)}
                  className="rounded-2xl border border-border bg-card px-5 py-5 text-left font-display text-xl font-semibold text-primary shadow-soft transition-colors active:bg-secondary"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ) : tab === "arrival" ? (
          <ArrivalWizard apartment={apartment} t={t} onOpenInApartment={openInApartment} />
        ) : tab === "inApartment" ? (
          <InApartment apartment={apartment} t={t} />
        ) : (
          /* Pomoc */
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl text-primary">{t.help.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.help.body}</p>
            </div>
            <div className="space-y-3">
              <a
                href={`mailto:${t.help.email}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-soft"
              >
                <Mail className="h-6 w-6 text-gold" aria-hidden />
                <span className="font-medium text-primary">{t.help.email}</span>
              </a>
              <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-soft">
                <div className="mb-3 flex items-center gap-4">
                  <Phone className="h-6 w-6 text-gold" aria-hidden />
                  <span className="rounded-lg border border-dashed border-gold bg-gold/10 px-3 py-1 text-sm font-medium text-gold-deep">
                    {t.help.phone === "[TEXT]" ? t.nav.textMissing : t.help.phone}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground opacity-40">
                    <Phone className="h-4 w-4" aria-hidden />
                    {t.help.call}
                  </span>
                  <span className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground opacity-40">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    {t.help.whatsapp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Spodní lišta */}
      {apartment && (
        <nav
          aria-label="Průvodce"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-lg">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  window.scrollTo(0, 0);
                }}
                aria-current={tab === id ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold ${
                  tab === id ? "text-gold-deep" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-6 w-6" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Guide;
