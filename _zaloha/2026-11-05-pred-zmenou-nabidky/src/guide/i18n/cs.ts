/**
 * Veškeré zobrazované texty průvodce příjezdem — čeština.
 * Další jazyk přidáte zkopírováním tohoto souboru (např. en.ts) a registrací
 * v src/guide/i18n/index.ts. Komponenty se nemění.
 *
 * Řetězec "[TEXT]" = viditelný placeholder k doplnění; v UI se vykreslí zvýrazněně.
 */

const cs = {
  langName: "CZ",

  header: {
    title: "Průvodce příjezdem",
  },

  choose: {
    title: "U kterého bytu máte rezervaci?",
    hint: "Označení bytu najdete ve zprávě s potvrzením rezervace.",
  },

  mode: {
    title: "Jak k nám přijíždíte?",
    car: "Přijíždím autem",
    foot: "Přijíždím pěšky",
  },

  nav: {
    back: "Zpět",
    next: "Další",
    stepOf: (step: number, total: number) => `Krok ${step} z ${total}`,
    photoMissing: "FOTO – doplníme",
    textMissing: "[TEXT – doplníme]",
  },

  tabs: {
    arrival: "Příjezd",
    inApartment: "V bytě",
    help: "Pomoc",
  },

  steps: {
    find: {
      title: "Najděte dům",
      body: [
        "Byt se nachází na adrese Dobronická 282/18, Praha 4 – Libuš.",
      ],
      navigate: "Navigovat",
      hotspots: {
        driveway: "Příjezdová cesta k domu",
      },
    },
    entrance: {
      title: "Vchod na pozemek",
      body: [
        "Poznáte ho podle šedého zděného sloupku s červenou cedulí 282 a modrou 18.",
        "Vlevo je branka pro pěší, vpravo velká vjezdová brána.",
      ],
      hotspots: {
        gate: "Branka pro pěší",
        lockboxes: "Schránky na klíče",
        drivewayGate: "Vjezdová brána",
      },
    },
    keys: {
      title: "Vyzvedněte si klíče",
      body: [
        "Na sloupku je 5 schránek, zleva B01, B02, B03, B04, B05.",
        "Otevřete schránku svého bytu kódem, který máte ve zprávě od nás.",
      ],
      lockboxLabel: (label: string) => `Schránka vašeho bytu ${label}`,
    },
    parking: {
      title: "Parkování",
      body: [
        "Projděte brankou – ve zděném výklenku vpravo visí na háčku dálkový ovladač od velké brány.",
        "Otevřete bránu a zaparkujte na místě označeném číslem vašeho bytu. Každý byt má 1 místo.",
        "[TEXT]",
      ],
      hotspots: {
        remote: "Dálkový ovladač od brány",
      },
    },
    pathMain: {
      title: "Cesta k bytu",
      body: [
        "Projděte brankou a pár kroků rovně – vchod do domu je po levé straně.",
        "[TEXT]",
      ],
    },
    pathOwn: {
      title: "Cesta k bytu",
      body: [
        "Váš byt má vlastní vchod zvenku. Dveře jsou jasně označené číslem bytu ve výšce očí.",
        "[TEXT]",
      ],
    },
    done: {
      title: "Vítejte!",
      body: [
        "Jste na místě. Všechno k pobytu najdete v záložce „V bytě“.",
      ],
      cta: "Otevřít „V bytě“",
    },
  },

  sitePlan: {
    street: "Dobronická (ulice)",
    gate: "Branka",
    drivewayGate: "Vjezdová brána",
    house: "Dům (B01–B03)",
    parking: "Parkování",
    ownEntrance: "Vlastní vchod (B04–B05)",
    you: "Vy",
  },

  inApartment: {
    title: "V bytě",
    copy: "Kopírovat",
    copied: "Zkopírováno",
    wifiName: "Název sítě",
    wifiPassword: "Heslo",
    tiles: {
      wifi: { title: "Wi-Fi", body: ["[TEXT]"] },
      lights: { title: "Světla a vypínače", body: ["[TEXT]"] },
      breakers: { title: "Jističe", body: ["[TEXT]"] },
      heating: { title: "Topení", body: ["[TEXT]"] },
      kitchen: { title: "Kuchyň a spotřebiče", body: ["[TEXT]"] },
      waste: {
        title: "Odpad",
        body: ["Popelnice je ve výklenku za brankou."],
        hotspots: { bin: "Popelnice" },
      },
      rules: { title: "Domovní řád", body: ["[TEXT]"] },
      checkout: { title: "Check-out", body: ["[TEXT]"] },
    },
  },

  help: {
    title: "Potřebujete pomoc?",
    body: "Ozveme se co nejdříve.",
    email: "antamhomes@gmail.com",
    phone: "[TEXT]",
    call: "Zavolat",
    whatsapp: "WhatsApp",
    writeEmail: "Napsat e-mail",
  },
};

export type GuideStrings = typeof cs;
export default cs;
