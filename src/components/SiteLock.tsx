import { useEffect, useState, type FormEvent } from "react";
import { SITE_LOCK_HASH, markUnlocked, sha256Hex } from "@/lib/siteLock";

const inputCls =
  "w-full px-4 py-3 text-base bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors";

/** Heslová závora (viz src/lib/siteLock.ts). Bez obsahu webu: nic k prerenderu. */
const SiteLock = ({ onUnlock }: { onUnlock: () => void }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  // Žádný hero, který by zvedl brand splash: zvedneme ho sami.
  useEffect(() => {
    window.dispatchEvent(new Event("antam:hero-ready"));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = (await sha256Hex(value)) === SITE_LOCK_HASH;
    setBusy(false);
    if (!ok) {
      setError(true);
      return;
    }
    markUnlocked();
    onUnlock();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <form onSubmit={submit} className="w-full max-w-xs" noValidate>
        <p className="font-display text-lg tracking-[0.18em] uppercase text-foreground text-center mb-10">
          Antam Homes
        </p>
        <label htmlFor="site-lock" className="block font-body text-sm font-medium text-foreground mb-2">
          Heslo
        </label>
        <input
          id="site-lock"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          className={inputCls}
          aria-invalid={error}
          aria-describedby={error ? "site-lock-error" : undefined}
        />
        {error && (
          <p id="site-lock-error" className="mt-2 font-body text-sm text-muted-foreground" role="alert">
            Nesprávné heslo.
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full mt-5" disabled={busy}>
          Vstoupit
        </button>
      </form>
    </main>
  );
};

export default SiteLock;
