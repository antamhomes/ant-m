import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyticsEnabled, getStoredConsent, setConsent } from "@/lib/analytics";

const copy = {
  cs: {
    text: "Používáme analytické cookies (Google Analytics), abychom věděli, jak návštěvníci web používají a co zlepšit. Žádná reklama, žádné sdílení s třetími stranami.",
    more: "Více o zpracování údajů",
    accept: "Přijmout",
    decline: "Odmítnout",
  },
  vi: {
    text: "Chúng tôi dùng cookie phân tích (Google Analytics) để biết khách truy cập dùng trang web như thế nào và cần cải thiện gì. Không quảng cáo, không chia sẻ với bên thứ ba.",
    more: "Thông tin về xử lý dữ liệu",
    accept: "Đồng ý",
    decline: "Từ chối",
  },
};

/** Cookie banner shown once until the visitor decides. Nothing loads before consent. */
const CookieConsent = () => {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled()) return;
    if (getStoredConsent() === null) setOpen(true);
  }, []);

  if (!open) return null;
  const c = copy[lang];

  const choose = (state: "granted" | "denied") => {
    setConsent(state);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={lang === "cs" ? "Souhlas s cookies" : "Đồng ý cookie"}
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-md shadow-[var(--shadow-elegant)] p-5 md:p-6 md:flex md:items-center md:gap-6">
        <p className="font-body text-sm text-foreground/85 leading-relaxed md:flex-1">
          {c.text}{" "}
          <a
            href="/gdpr-informacni-memorandum.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gold transition-colors"
          >
            {c.more}
          </a>
        </p>
        <div className="mt-4 md:mt-0 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-sm border border-border font-body text-xs font-semibold tracking-wider uppercase text-foreground hover:bg-muted transition-colors"
          >
            {c.decline}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-sm bg-primary text-primary-foreground font-body text-xs font-semibold tracking-wider uppercase hover:brightness-110 transition-all"
          >
            {c.accept}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
