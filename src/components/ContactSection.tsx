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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    size: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
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
            phone: formData.phone,
            address: formData.address,
            size: formData.size,
            message: formData.message,
          },
        },
      });
      if (error) throw error;
      toast({ title: t(lang, "contact_success") as string });
      setFormData({ name: "", email: "", phone: "", address: "", size: "", message: "" });
    } catch (err) {
      console.error("Failed to send inquiry", err);
      toast({
        title: "Něco se nepovedlo",
        description: "Zkuste to prosím znovu nebo nám napište přímo na info@an-tam.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="kontakt" className="py-16 md:py-24 px-6 bg-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            {t(lang, "contact_label")}
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
            {t(lang, "contact_title")}
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(lang, "contact_desc")}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-sm p-8 md:p-12 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                {t(lang, "contact_phone")}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder={t(lang, "contact_phone_placeholder") as string}
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                {t(lang, "contact_address")} <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                placeholder={t(lang, "contact_address_placeholder") as string}
              />
            </div>
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              {t(lang, "contact_size")}
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
            >
              <option value="">{t(lang, "contact_size_placeholder") as string}</option>
              <option value="1+kk">1+kk</option>
              <option value="1+1">1+1</option>
              <option value="2+kk">2+kk</option>
              <option value="2+1">2+1</option>
              <option value="3+kk">3+kk</option>
              <option value="3+1">3+1</option>
              <option value="4+kk">4+kk</option>
              <option value="4+1">4+1</option>
              <option value="5+kk a větší">5+kk a větší</option>
            </select>
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              {t(lang, "contact_message")}
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 text-base md:text-[15px] bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
              placeholder={t(lang, "contact_message_placeholder") as string}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-semibold text-[13px] tracking-[0.15em] uppercase rounded-sm hover:bg-charcoal border border-gold/60 ring-1 ring-gold/30 hover:ring-gold/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t(lang, "contact_submit")}
          </button>
          <p className="font-body text-xs text-muted-foreground text-center">
            {t(lang, "contact_small")}
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default ContactSection;
