comment on column public.guest_reviews.lang_orig is
  'Zdrojový jazyk recenze, ISO 639-1. Plní ho překladač z detekce (DeepL vrací detected_source_language). Web podle něj píše "přeloženo z italštiny", ne jen "přeloženo". Když se zdrojový jazyk rovná jazyku stránky, text se bere jako originál a žádný štítek se nezobrazuje: česká recenze na české stránce přeložená není.';
