import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationLabel: string;
  sizeLabel: string;
}

const CalculatorLeadDialog = ({ open, onOpenChange, locationLabel, sizeLabel }: Props) => {
  const { lang } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", consent: false });

  const reset = () => {
    setForm({ name: "", email: "", phone: "", consent: false });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !form.consent) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-inquiry",
          recipientEmail: "antamhomes@gmail.com",
          idempotencyKey: `calc-lead-${Date.now()}-${form.email}`,
          templateData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: locationLabel,
            size: sizeLabel,
            message:
              lang === "cs"
                ? `Žádost o přesnější odhad z kalkulačky. Lokalita: ${locationLabel}, dispozice: ${sizeLabel}.`
                : `Yêu cầu ước tính chính xác hơn từ bảng tính. Vị trí: ${locationLabel}, loại căn hộ: ${sizeLabel}.`,
          },
        },
      });
      if (error) throw error;
      trackEvent("lead_submit", { form: "calculator" });
      setSuccess(true);
    } catch (err) {
      console.error("Failed to send lead", err);
      toast({
        title: lang === "cs" ? "Něco se nepovedlo" : "Có lỗi xảy ra",
        description:
          lang === "cs"
            ? "Zkuste to prosím znovu nebo nám napište přímo na antamhomes@gmail.com."
            : "Vui lòng thử lại hoặc viết trực tiếp cho chúng tôi qua antamhomes@gmail.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="bg-card border-border max-w-md sm:rounded-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold text-foreground tracking-tight">
            {success
              ? lang === "cs" ? "Děkujeme." : "Cảm ơn cô chú."
              : (t(lang, "calc_lead_title") as string)}
          </DialogTitle>
          {!success && (
            <DialogDescription className="font-body text-sm text-muted-foreground">
              {t(lang, "calc_lead_desc")}
            </DialogDescription>
          )}
        </DialogHeader>

        {success ? (
          <p className="font-body text-sm text-foreground leading-relaxed py-2">
            {t(lang, "calc_lead_success")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-sm border border-border bg-muted/40 px-3 py-2 font-body text-xs text-muted-foreground">
              <span className="text-gold-deep font-semibold uppercase tracking-[0.15em] mr-2">
                {t(lang, "calc_lead_prefill_note")}
              </span>
              <span className="text-foreground">{locationLabel} · {sizeLabel}</span>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                {t(lang, "calc_lead_name")} <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 text-[15px] bg-background border border-border rounded-sm font-body text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                {t(lang, "calc_lead_email")} <span className="text-gold">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 text-[15px] bg-background border border-border rounded-sm font-body text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                {t(lang, "calc_lead_phone")}{" "}
                <span className="text-muted-foreground font-normal">
                  {t(lang, "calc_lead_phone_optional")}
                </span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 text-[15px] bg-background border border-border rounded-sm font-body text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer font-body text-sm text-foreground">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer shrink-0"
              />
              <span className="leading-relaxed">
                {t(lang, "calc_lead_consent_prefix")}
                <a
                  href="/gdpr-informacni-memorandum.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-gold-deep hover:text-gold transition-colors"
                >
                  {t(lang, "calc_lead_consent_link")}
                </a>
                {t(lang, "calc_lead_consent_suffix")} <span className="text-gold">*</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !form.consent}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body font-semibold text-[13px] tracking-[0.15em] uppercase rounded-sm hover:bg-charcoal border border-gold/60 ring-1 ring-gold/30 hover:ring-gold/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t(lang, "calc_lead_submit")}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CalculatorLeadDialog;