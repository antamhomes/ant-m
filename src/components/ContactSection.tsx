import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

const ContactSection = () => {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t(lang, "contact_success"));
  };

  return (
    <section id="kontakt" className="py-24 md:py-32 px-6 bg-secondary">
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
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
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
                {t(lang, "contact_name")}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                placeholder={t(lang, "contact_name_placeholder") as string}
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                {t(lang, "contact_email")}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
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
                className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                placeholder={t(lang, "contact_phone_placeholder") as string}
              />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-2">
                {t(lang, "contact_address")}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                placeholder={t(lang, "contact_address_placeholder") as string}
              />
            </div>
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-2">
              {t(lang, "contact_message")}
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder={t(lang, "contact_message_placeholder") as string}
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gold text-accent-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-sm hover:brightness-110 transition-all duration-300"
          >
            <Send className="w-4 h-4" />
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
