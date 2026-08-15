import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { reveal, revealDelayed } from "@/lib/motion";

const ContactSection = () => {
  const { lang } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !formData.consent) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-inquiry",
          recipientEmail: "antamhomes@gmail.com",
          idempotencyKey: `contact-${Date.now()}-${formData.email}`,
          templateData: {
            name: formData.name,
            email: formData.email,
            phone: "",
            address: "",
            size: "",
            message: formData.message,
          },
        },
      });
      if (error) throw error;
      trackEvent("lead_submit", { form: "contact" });
      setSuccess(true);
      setFormData({ name: "", email: "", message: "", consent: false });
    } catch (err) {
      console.error("Failed to send inquiry", err);
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
    <section id="kontakt" className="section bg-secondary scroll-mt-16">
      <div className="container-prose">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "contact_label")}</p>
          <h2 className="h-section text-foreground">{t(lang, "contact_fallback_title")}</h2>
          <p className="lead">{t(lang, "contact_fallback_desc")}</p>
        </motion.div>

        <motion.form
          {...revealDelayed(0.1)}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-sm p-6 md:p-8 space-y-5"
        >
          {success ? (
            <p className="font-body text-foreground text-center py-6 leading-relaxed">
              {t(lang, "contact_success")}
            </p>
          ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                {t(lang, "contact_name")} <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder={t(lang, "contact_name_placeholder") as string}
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                {t(lang, "contact_email")} <span className="text-gold">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder={t(lang, "contact_email_placeholder") as string}
              />
            </div>
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              {t(lang, "contact_fallback_message")}
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
              placeholder={t(lang, "contact_fallback_message_placeholder") as string}
            />
          </div>
          <label className="flex items-start gap-2.5 cursor-pointer font-body text-sm text-foreground">
            <input
              type="checkbox"
              required
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-primary cursor-pointer shrink-0"
            />
            <span className="leading-relaxed">
              {t(lang, "contact_consent_prefix")}
              <a
                href="/gdpr-informacni-memorandum.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-gold-deep hover:text-gold transition-colors"
              >
                {t(lang, "contact_consent_link")}
              </a>
              {t(lang, "contact_consent_suffix")} <span className="text-gold">*</span>
            </span>
          </label>
          <button
            type="submit"
            disabled={submitting || !formData.consent}
            className="btn btn-primary w-full py-4"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t(lang, "contact_submit")}
          </button>
          </>
          )}
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
