import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import { Send, Loader2, ChevronDown, ShieldCheck, CalendarClock, KeyRound, Receipt } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { sendInquiry } from "@/lib/inquiry";
import { mirrorInquiryToPortal } from "@/lib/portalLead";
import { trackEvent } from "@/lib/analytics";

const LOCATIONS = [
  "Praha 1", "Praha 2", "Praha 3", "Praha 4", "Praha 5",
  "Praha 6", "Praha 7", "Praha 8", "Praha 9", "Praha 10",
];
const SIZES = ["1+kk", "2+kk", "3+kk", "4+kk"];

const inputCls =
  "w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors";
const labelCls = "block font-body text-sm font-medium text-foreground mb-2";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  street: "",
  location: "",
  size: "",
  status: "",
  contactPref: "",
  units: "",
  energy: "",
  message: "",
  consent: false,
};

type Option = { value: string; label: string };

const SelectField = ({
  id, value, onChange, placeholder, options,
}: { id: string; value: string; onChange: (v: string) => void; placeholder: string; options: Option[] }) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} appearance-none pr-10 ${value ? "" : "text-muted-foreground"}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  </div>
);

const ContactSection = () => {
  const { lang } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const set = (k: keyof typeof emptyForm, v: string | boolean) => setFormData((f) => ({ ...f, [k]: v }));

  // The calculator CTA pre-fills district + layout so the owner doesn't type them
  // twice; the floor area lands visibly (and editably) in the message field.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<{ location?: string; size?: string; m2?: number; guests?: number }>).detail || {};
      const calcLine =
        d.m2
          ? lang === "cs"
            ? `Z kalkulačky: ${d.size ?? ""} ${d.m2} m²${d.guests ? `, počítáno s ${d.guests} hosty` : ""}.`.replace(":  ", ": ")
            : `Theo phần tính thử: ${d.size ?? ""} ${d.m2} m²${d.guests ? `, tính với ${d.guests} khách` : ""}.`.replace(":  ", ": ")
          : "";
      setFormData((f) => ({
        ...f,
        location: d.location && LOCATIONS.includes(d.location) ? d.location : f.location,
        size: d.size && SIZES.includes(d.size) ? d.size : f.size,
        message: f.message || calcLine,
      }));
    };
    window.addEventListener("antam:prefill-contact", onPrefill);
    return () => window.removeEventListener("antam:prefill-contact", onPrefill);
  }, [lang]);

  const locationOptions: Option[] = [
    ...LOCATIONS.map((l) => ({ value: l, label: l })),
    { value: "other", label: t(lang, "contact_location_other") },
  ];
  const sizeOptions: Option[] = [
    ...SIZES.map((s) => ({ value: s, label: s })),
    { value: "other", label: t(lang, "contact_size_other") },
  ];
  const statusOptions: Option[] = [
    { value: "long_term", label: t(lang, "contact_status_long") },
    { value: "short_term", label: t(lang, "contact_status_short") },
    { value: "empty", label: t(lang, "contact_status_empty") },
    { value: "buying", label: t(lang, "contact_status_buying") },
  ];
  const prefOptions: Option[] = [
    { value: "phone", label: t(lang, "contact_pref_phone") },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "zalo", label: "Zalo" },
    { value: "email", label: "E-mail" },
  ];
  // Better lead context at zero extra friction: how many flats the owner runs.
  const unitsOptions: Option[] = [
    { value: "1", label: t(lang, "contact_units_one") },
    { value: "2-4", label: t(lang, "contact_units_few") },
    { value: "5-9", label: t(lang, "contact_units_mid") },
    { value: "10+", label: t(lang, "contact_units_many") },
  ];
  const labelOf = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.label ?? v;
  // If the owner wants to be contacted by e-mail, the e-mail field becomes mandatory.
  const emailRequired = formData.contactPref === "email";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !formData.consent) return;
    setSubmitting(true);
    setSendError(false);
    try {
      await sendInquiry({
        templateName: "contact-inquiry",
        recipientEmail: "antamhomes@gmail.com",
        idempotencyKey: `contact-${Date.now()}-${formData.phone || formData.email}`,
        templateData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          // Ulice + čtvrť; web slibuje „pošlete adresu", tak ať ji má kam napsat.
          address: [formData.street, labelOf(locationOptions, formData.location)].filter(Boolean).join(", "),
          size: labelOf(sizeOptions, formData.size),
          status: labelOf(statusOptions, formData.status),
          contactPref: labelOf(prefOptions, formData.contactPref),
          language: lang === "cs" ? "čeština" : "Tiếng Việt",
          // The e-mail template has fixed fields, so the energy and unit-count
          // answers ride inside the message body instead of template keys.
          message: [
            formData.message,
            formData.units ? `Počet bytů: ${labelOf(unitsOptions, formData.units)}` : "",
            formData.energy ? `Energie: ${formData.energy}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      });
      // The e-mail above is the delivery that counts; this only mirrors the same
      // enquiry into the portal pipeline and is never awaited for the success state.
      void mirrorInquiryToPortal({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: [formData.street, labelOf(locationOptions, formData.location)].filter(Boolean).join(", "),
        size: labelOf(sizeOptions, formData.size),
        status: labelOf(statusOptions, formData.status),
        contact_pref: labelOf(prefOptions, formData.contactPref),
        energy: formData.energy,
        message: [formData.message, formData.units ? `Počet bytů: ${labelOf(unitsOptions, formData.units)}` : ""]
          .filter(Boolean)
          .join("\n"),
        lang,
      });
      trackEvent("lead_submit", { form: "contact", status: formData.status || "n/a" });
      setSuccess(true);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Failed to send inquiry", err);
      setSendError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="kontakt" className="section bg-background scroll-mt-16">
      <div className="container-prose md:max-w-[calc(46rem+3rem)]">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "contact_label")}</p>
          <h2 className="h-section text-foreground">{t(lang, "contact_fallback_title")}</h2>
          <p className="lead">{t(lang, "contact_fallback_desc")}</p>
        </Reveal>

        {/* Assurance strip — the four things that take the fear out of saying yes */}
        <Reveal as="ul" delay={0.05} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-3 mb-6 sm:mb-8">
          {[
            { icon: ShieldCheck, key: "assure1" as const },
            { icon: CalendarClock, key: "assure2" as const },
            { icon: KeyRound, key: "assure3" as const },
            { icon: Receipt, key: "assure4" as const },
          ].map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center justify-start md:justify-center gap-2 px-3 py-2 sm:py-2.5 rounded-sm bg-card/70 border border-border/70 font-body text-[13px] text-foreground/85 whitespace-nowrap">
              <Icon className="w-4 h-4 text-gold shrink-0" strokeWidth={1.8} />
              <span>{t(lang, key)}</span>
            </li>
          ))}
        </Reveal>

        <Reveal as="form" delay={0.1}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-sm p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5"
        >
          {success ? (
            <p className="font-body text-foreground text-center py-6 leading-relaxed">
              {t(lang, "contact_success")}
            </p>
          ) : (
            <>
              {/* Who */}
              {/* Phones stack the four contact fields: a 167 px cell cut the phone placeholder
                  and let the two labels sit on different lines. Two columns from sm, like the rest. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="c-name" className={labelCls}>
                    {t(lang, "contact_name")} <span className="text-gold-deep">*</span>
                  </label>
                  <input
                    id="c-name" type="text" required autoComplete="name" value={formData.name}
                    onChange={(e) => set("name", e.target.value)} className={inputCls}
                    placeholder={t(lang, "contact_name_placeholder") as string}
                  />
                </div>
                <div>
                  <label htmlFor="c-phone" className={labelCls}>
                    {t(lang, "contact_phone")} <span className="text-gold-deep">*</span>
                  </label>
                  <input
                    id="c-phone" type="tel" required autoComplete="tel" inputMode="tel" value={formData.phone}
                    onChange={(e) => set("phone", e.target.value)} className={inputCls}
                    placeholder={t(lang, "contact_phone_placeholder") as string}
                  />
                </div>
                <div>
                  <label htmlFor="c-email" className={labelCls}>
                    {t(lang, "contact_email")}{" "}
                    {emailRequired ? (
                      <span className="text-gold-deep">*</span>
                    ) : (
                      <span className="text-muted-foreground font-normal">{t(lang, "contact_optional")}</span>
                    )}
                  </label>
                  <input
                    id="c-email" type="email" autoComplete="email" value={formData.email} required={emailRequired}
                    onChange={(e) => set("email", e.target.value)} className={inputCls}
                    placeholder={t(lang, "contact_email_placeholder") as string}
                  />
                </div>
                <div>
                  <label htmlFor="c-pref" className={labelCls}>{t(lang, "contact_pref")}</label>
                  <SelectField
                    id="c-pref" value={formData.contactPref} onChange={(v) => set("contactPref", v)}
                    placeholder={t(lang, "contact_pref_placeholder") as string} options={prefOptions}
                  />
                </div>
              </div>

              {/* The apartment */}
              <div className="pt-1">
                <label htmlFor="c-street" className={labelCls}>
                  {t(lang, "contact_street")}{" "}
                  <span className="text-muted-foreground font-normal">{t(lang, "contact_optional")}</span>
                </label>
                <input
                  id="c-street" type="text" autoComplete="street-address" value={formData.street}
                  onChange={(e) => set("street", e.target.value)} className={inputCls}
                  placeholder={t(lang, "contact_street_placeholder") as string}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="c-loc" className={labelCls}>{t(lang, "contact_address")}</label>
                  <SelectField
                    id="c-loc" value={formData.location} onChange={(v) => set("location", v)}
                    placeholder={t(lang, "contact_address_placeholder") as string} options={locationOptions}
                  />
                </div>
                <div>
                  <label htmlFor="c-size" className={labelCls}>{t(lang, "contact_size")}</label>
                  <SelectField
                    id="c-size" value={formData.size} onChange={(v) => set("size", v)}
                    placeholder={t(lang, "contact_size_placeholder") as string} options={sizeOptions}
                  />
                </div>
                <div>
                  <label htmlFor="c-status" className={labelCls}>{t(lang, "contact_status")}</label>
                  <SelectField
                    id="c-status" value={formData.status} onChange={(v) => set("status", v)}
                    placeholder={t(lang, "contact_status_placeholder") as string} options={statusOptions}
                  />
                </div>
                <div>
                  <label htmlFor="c-units" className={labelCls}>{t(lang, "contact_units")}</label>
                  <SelectField
                    id="c-units" value={formData.units} onChange={(v) => set("units", v)}
                    placeholder={t(lang, "contact_units_placeholder") as string} options={unitsOptions}
                  />
                </div>
              </div>

              {/* Volitelné detaily za rozbalovákem: kratší formulář, stejná data. */}
              <details className="group">
                <summary className="list-none cursor-pointer font-body text-sm text-gold-deep underline underline-offset-4 decoration-gold/40 [&::-webkit-details-marker]:hidden">
                  {t(lang, "contact_more")}
                </summary>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5">
                <div>
                  <label htmlFor="c-energy" className={labelCls}>
                    {t(lang, "contact_energy")}{" "}
                    <span className="text-muted-foreground font-normal">{t(lang, "contact_optional")}</span>
                  </label>
                  <input
                    id="c-energy" type="text" inputMode="numeric" value={formData.energy}
                    onChange={(e) => set("energy", e.target.value)} className={inputCls}
                    placeholder={t(lang, "contact_energy_placeholder") as string}
                  />
                </div>
              </div>
              </details>

              <div>
                <label htmlFor="c-msg" className={labelCls}>
                  {t(lang, "contact_message")}{" "}
                  <span className="text-muted-foreground font-normal">{t(lang, "contact_optional")}</span>
                </label>
                <textarea
                  id="c-msg" rows={3} value={formData.message}
                  onChange={(e) => set("message", e.target.value)} className={`${inputCls} resize-none`}
                  placeholder={t(lang, "contact_message_placeholder") as string}
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer font-body text-sm text-foreground">
                <input
                  type="checkbox" required checked={formData.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary cursor-pointer shrink-0"
                />
                <span className="leading-relaxed">
                  {t(lang, "contact_consent_prefix")}
                  <a
                    href="/gdpr-informacni-memorandum.pdf" target="_blank" rel="noopener noreferrer"
                    className="underline text-gold-deep hover:text-primary transition-colors"
                  >
                    {t(lang, "contact_consent_link")}
                  </a>
                  {t(lang, "contact_consent_suffix")} <span className="text-gold-deep">*</span>
                </span>
              </label>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full py-4">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {t(lang, "contact_submit")}
              </button>
              {sendError && (
                <p role="alert" className="font-body text-sm text-center text-destructive">
                  {t(lang, "contact_error")}
                </p>
              )}
              <p className="font-body text-[13px] md:text-sm text-muted-foreground text-center">{t(lang, "contact_small")}</p>
              {/* The no-form path: one tap to a call (VI copy mentions Zalo). */}
              <p className="font-body text-[13px] md:text-sm text-muted-foreground text-center">
                {t(lang, "contact_phone_line")}{" "}
                <a href="tel:+420727952459" className="text-gold-deep font-medium whitespace-nowrap hover:text-primary transition-colors">
                  +420&nbsp;727&nbsp;952&nbsp;459
                </a>
              </p>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
