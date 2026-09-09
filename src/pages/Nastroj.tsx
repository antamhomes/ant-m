/**
 * /nastroj — interní vyhodnocovač bytu, fáze 1.
 *
 * Odpovídá na JEDINOU otázku: stojí ten byt za další práci? Nikdy ACCEPT,
 * nikdy nabídka. Běží na mobilu jednou rukou během hovoru, proto tři pole,
 * jedno tlačítko a verdikt čitelný bez čtení čísel.
 *
 * Oprávnění hlídá RLS v databázi, ne tahle komponenta. Veřejná kalkulačka
 * jede dál po public cestě, tady se počítá výhradně internal screening.
 */
import { useEffect, useMemo, useState } from "react";
import { screen, defaultArea, WORTH_MIN, REVIEW_MIN, type ScreeningResult } from "@/lib/screening";
import { ctvrtiOf, type LocationKey, type SizeKey } from "@/lib/yield";
import { admin, checkAdmin, saveEvaluation, setAction, toRow } from "@/lib/adminClient";

const DISTRICTS: LocationKey[] = ["praha1","praha2","praha3","praha4","praha5","praha6","praha7","praha8","praha9","praha10"];
const SIZES: SizeKey[] = ["1kk","2kk","3kk","4kk"];
const SIZE_LABEL: Record<SizeKey, string> = { "1kk": "1+kk", "2kk": "2+kk", "3kk": "3+kk", "4kk": "4+kk" };
const SOURCES = [
  { id: "phone", label: "Telefon" }, { id: "agent", label: "Makléř" },
  { id: "vn_network", label: "VN síť" }, { id: "referral", label: "Doporučení" }, { id: "web", label: "Web" },
];
const kc = (n: number | null) => (n === null ? "—" : n.toLocaleString("cs-CZ").replace(/ /g, " ") + " Kč");
const pct = (n: number | null) => (n === null ? "—" : Math.round(n * 100) + " %");
/** Desetinná čárka, ne tečka: faktor a násobek jsou čísla, na kterých visí rozhodnutí. */
const dec = (n: number, places = 2) => n.toLocaleString("cs-CZ", { minimumFractionDigits: places, maximumFractionDigits: places });

const VERDICT = {
  worth:     { dot: "#1F7A45", bg: "#E8F4EC", label: "STOJÍ ZA PROVĚŘENÍ" },
  review:    { dot: "#9A6B12", bg: "#FBF1DC", label: "K RUČNÍMU POSOUZENÍ" },
  not_worth: { dot: "#96352E", bg: "#F8E9E7", label: "NESTOJÍ" },
} as const;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block mb-3">
    <span className="block text-[11px] uppercase tracking-[0.09em] text-neutral-500 mb-1.5">{label}</span>
    {children}
  </label>
);
const chip = (on: boolean) =>
  `px-3 py-2 rounded text-sm border min-w-[52px] ${on ? "bg-[#12352E] text-white border-[#12352E]" : "bg-white text-neutral-700 border-neutral-300"}`;
const inputCls = "w-full rounded border border-neutral-300 px-3 py-2.5 text-base bg-white";

const Login = ({ onIn }: { onIn: () => void }) => {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    const { error } = await admin().auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) setErr("Přihlášení neprošlo."); else onIn();
  };
  return (
    <form onSubmit={submit} className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-lg font-semibold mb-1">Antam · nástroj</h1>
      <p className="text-sm text-neutral-500 mb-6">Interní. Přihlas se stejným účtem jako do portálu.</p>
      <Field label="E-mail"><input className={inputCls} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
      <Field label="Heslo"><input className={inputCls} type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></Field>
      {err && <p className="text-sm text-[#96352E] mb-3">{err}</p>}
      <button disabled={busy} className="w-full rounded bg-[#12352E] text-white py-3 text-sm uppercase tracking-[0.08em] disabled:opacity-50">
        {busy ? "Přihlašuji" : "Přihlásit"}
      </button>
    </form>
  );
};

const Result = ({ r, saving, savedId, onAction }: {
  r: ScreeningResult; saving: boolean; savedId: string | null;
  onAction: (a: "continue" | "discard") => void;
}) => {
  const v = VERDICT[r.verdict];
  return (
    <div className="mt-6">
      <div className="rounded px-4 py-3 flex items-center gap-2.5" style={{ background: v.bg }}>
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.dot }} />
        <b className="text-[13px] tracking-[0.06em]">{v.label}</b>
      </div>

      <dl className="mt-4 text-sm">
        {[
          ["Screeningový baseline", r.consLow === null ? "—" : `${kc(r.consLow)} až ${kc(r.consHigh)}`],
          ["Podlaha: nájem + energie", kc(r.floorMonthly)],
          ["Samotný nájem", kc(r.ltrMonthly)],
          ["Rozdíl proti podlaze", r.bufferCzk === null ? "—" : `${kc(r.bufferCzk)} / měsíc · ${kc(r.deltaYear)} / rok`],
          ["Násobek proti nájmu bez energií", r.ratioToRent === null ? "—" : `${dec(r.ratioToRent)}×`],
          ["Rezerva nad podlahou (s energiemi)", pct(r.bufferPct)],
        ].map(([k, val]) => (
          <div key={k} className="flex justify-between gap-3 py-2 border-b border-neutral-200">
            <dt className="text-neutral-500">{k}</dt><dd className="tabular-nums text-right font-medium">{val}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-[12.5px] text-neutral-500 leading-relaxed">
        Veřejná kalkulačka ukazuje {kc(r.publicMonthly)}, jen pro srovnání.<br />
        Data: {r.cellDerived ? "dopočtená buňka" : "měřená buňka"} · vzorek n={r.nMin ?? "—"} · {r.dataWindow}<br />
        Faktor: {r.operatorMeasured ? "naměřený" : "bez měření"} → interní {dec(r.operatorFactorUsed, 3)}<br />
        Jistota: {r.confidence === "high" ? "vysoká" : r.confidence === "medium" ? "střední" : "nízká"}
      </p>
      <p className="mt-2 text-[12.5px] text-neutral-700">{r.why}</p>
      <p className="mt-3 text-[11.5px] text-neutral-400 leading-relaxed">
        Násobek je proti samotnému nájmu, rezerva proti podlaze, tedy nájem plus energie.
        Různé jmenovatele, proto se ta dvě čísla nedají porovnávat mezi sebou.
      </p>
      <p className="mt-2 text-[12px] text-[#9A6B12]">
        Před branami a před konkrétním bytem. Není to nabídka ani finální underwriting.
      </p>

      <div className="mt-5 flex gap-2">
        <button onClick={() => onAction("continue")} disabled={saving || !savedId}
          className="flex-1 rounded bg-[#12352E] text-white py-3 text-[12.5px] uppercase tracking-[0.07em] disabled:opacity-40">
          Pokračovat v prověření
        </button>
        <button onClick={() => onAction("discard")} disabled={saving || !savedId}
          className="flex-1 rounded border border-neutral-300 py-3 text-[12.5px] uppercase tracking-[0.07em] disabled:opacity-40">
          Zahodit
        </button>
      </div>
      <p className="mt-2 text-[11.5px] text-neutral-400">
        {saving ? "Ukládám…" : savedId ? "Vyhodnocení uloženo." : "Neuloženo."}
      </p>
    </div>
  );
};

const Tool = () => {
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState<LocationKey>("praha1");
  const [ctvrt, setCtvrt] = useState<string | null>(null);
  const [size, setSize] = useState<SizeKey>("2kk");
  const [m2, setM2] = useState<string>(String(defaultArea("praha1", "2kk")));
  const [rent, setRent] = useState("");
  const [source, setSource] = useState("phone");
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const ctvrti = useMemo(() => ctvrtiOf(district), [district]);
  useEffect(() => { setCtvrt(null); setM2(String(defaultArea(district, size))); }, [district, size]);

  const run = async () => {
    const input = {
      addressRaw: address.trim(), district, ctvrt, size,
      m2: Number(m2) || defaultArea(district, size),
      currentRent: rent ? Number(rent) : null,
    };
    const r = screen(input);
    setResult(r); setSavedId(null); setSaving(true);
    const id = await saveEvaluation(toRow(input, r, source));
    setSavedId(id); setSaving(false);
  };

  return (
    <div className="max-w-md mx-auto px-5 py-8 pb-24">
      <header className="flex items-baseline justify-between mb-6">
        <h1 className="text-base font-semibold">Antam · nástroj</h1>
        <button className="text-[11.5px] text-neutral-400 underline"
          onClick={() => admin().auth.signOut().then(() => window.location.reload())}>odhlásit</button>
      </header>

      <Field label="Adresa (jen text, do výpočtu nevstupuje)">
        <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Vinohradská 123" />
      </Field>

      <Field label="Praha">
        <div className="flex flex-wrap gap-1.5">
          {DISTRICTS.map((d) => (
            <button key={d} type="button" className={chip(district === d)} onClick={() => setDistrict(d)}>{d.replace("praha", "")}</button>
          ))}
        </div>
      </Field>

      <Field label="Čtvrť">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={chip(ctvrt === null)} onClick={() => setCtvrt(null)}>Ostatní</button>
          {ctvrti.map((c) => (
            <button key={c.id} type="button" className={chip(ctvrt === c.id)} onClick={() => setCtvrt(c.id)}>{c.label}</button>
          ))}
        </div>
      </Field>

      <Field label="Dispozice">
        <div className="flex gap-1.5">
          {SIZES.map((s) => (
            <button key={s} type="button" className={chip(size === s)} onClick={() => setSize(s)}>{SIZE_LABEL[s]}</button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Plocha m²">
          <input className={inputCls} inputMode="numeric" value={m2} onChange={(e) => setM2(e.target.value.replace(/[^\d]/g, ""))} />
        </Field>
        <Field label="Nájem (nepovinné)">
          <input className={inputCls} inputMode="numeric" value={rent} onChange={(e) => setRent(e.target.value.replace(/[^\d]/g, ""))} placeholder="—" />
        </Field>
      </div>

      <Field label="Zdroj">
        <div className="flex flex-wrap gap-1.5">
          {SOURCES.map((s) => (
            <button key={s.id} type="button" className={chip(source === s.id)} onClick={() => setSource(s.id)}>{s.label}</button>
          ))}
        </div>
      </Field>

      <button onClick={run} className="w-full rounded bg-[#BC9252] text-[#12352E] py-3.5 text-sm font-semibold uppercase tracking-[0.08em]">
        Vyhodnotit
      </button>

      {result && <Result r={result} saving={saving} savedId={savedId}
        onAction={(a) => { if (savedId) { setAction(savedId, a); setResult(null); setAddress(""); } }} />}

      <p className="mt-8 text-[11px] text-neutral-400 leading-relaxed">
        Prahy v0: zelená od {Math.round(WORTH_MIN * 100)} %, červená pod {Math.round(REVIEW_MIN * 100)} %.
        Neladit před 20 až 30 vyhodnocenými byty.
      </p>
    </div>
  );
};

const Nastroj = () => {
  const [state, setState] = useState<"loading" | "anon" | "denied" | "ok">("loading");
  const gate = async () => {
    const { data } = await admin().auth.getSession();
    if (!data.session) return setState("anon");
    setState((await checkAdmin()) ? "ok" : "denied");
  };
  useEffect(() => {
    document.title = "Antam · nástroj";
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    void gate();
    return () => { m.remove(); };
  }, []);

  if (state === "loading") return <div className="px-5 py-16 text-sm text-neutral-400">Načítám…</div>;
  if (state === "anon") return <Login onIn={() => void gate()} />;
  if (state === "denied") return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <p className="text-sm">Tenhle účet nemá oprávnění.</p>
      <button className="mt-3 text-[12px] underline text-neutral-500"
        onClick={() => admin().auth.signOut().then(() => window.location.reload())}>odhlásit</button>
    </div>
  );
  return <Tool />;
};
export default Nastroj;
