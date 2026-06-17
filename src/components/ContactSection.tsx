import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
          recipientEmail: "info@an-tam.com",
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
      setSuccess(true);
      setFormData({ name: "", email: "", message: "", consent: false });
    } catch (err) {
      console.error("Failed to send inquiry", err);
      toast({
        title: lang === "cs" ? "Něco se nepovedlo" : "Có lỗi xảy ra",
        description:
          lang === "cs"
            ? "Zkuste to prosím znovu nebo nám napište přímo na info@an-tam.com."
            : "Vui lòng thử lại hoặc viết trực tiếp cho chúng tôi qua info@an-tam.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="kontakt" className="py-16 md:py-24 px-6 bg-secondary">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="eyebrow eyebrow-center mb-5">
            {t(lang, "contact_label")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
            {t(lang, "contact_fallback_title")}
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            {t(lang, "contact_fallback_desc")}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-semibold text-[13px] tracking-[0.15em] uppercase rounded-sm hover:bg-charcoal border border-gold/60 ring-1 ring-gold/30 hover:ring-gold/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
