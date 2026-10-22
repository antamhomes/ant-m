import type { GuideStrings } from "../i18n";
import type { Apartment } from "./apartments";
import houseStreet from "../assets/house-street.png.asset.json";
import driveway from "../assets/driveway.png.asset.json";
import aerial from "../assets/aerial.png.asset.json";
import entrance from "../assets/entrance.jpg.asset.json";
import lockboxes from "../assets/lockboxes.jpg.asset.json";
import remote from "../assets/remote.jpg.asset.json";
import type { ArrivalMode, GuideStep } from "../types";

/**
 * Sestavení kroků průvodce. Fotky jsou zatím pracovní (src null = šedý
 * placeholder); až budou reálné fotky, stačí sem doplnit cesty a doladit
 * pozice hotspotů v procentech — komponenty se nemění.
 *
 * Fotky 1–5 z briefu:
 *   1 = vchod (sloupek, branka, vjezdová brána, schránky)
 *   2 = schránky na klíče detail
 *   3 = výklenek s ovladačem / popelnice
 *   4 = dům z ulice
 *   5 = příjezdová cesta
 */
export const buildSteps = (
  t: GuideStrings,
  apartment: Apartment,
  mode: ArrivalMode,
): GuideStep[] => {
  const s = t.steps;
  const steps: GuideStep[] = [
    {
      id: "find",
      title: s.find.title,
      body: s.find.body,
      showNavigate: true,
      photos: [
        { src: houseStreet.url, alt: "Dům z ulice" },
        {
          src: driveway.url,
          alt: "Příjezdová cesta",
          hotspots: [{ x: 45, y: 75, label: s.find.hotspots.driveway }],
        },
      ],
    },
    {
      id: "entrance",
      title: s.entrance.title,
      body: s.entrance.body,
      photos: [
        {
          src: entrance.url,
          alt: "Vchod na pozemek",
          hotspots: [
            { x: 19, y: 65, label: s.entrance.hotspots.gate },
            { x: 36, y: 52, label: s.entrance.hotspots.lockboxes },
            { x: 72, y: 65, label: s.entrance.hotspots.drivewayGate },
          ],
        },
      ],
    },
    {
      id: "keys",
      title: s.keys.title,
      body: s.keys.body,
      photos: [
        {
          src: lockboxes.url,
          alt: "Schránky na klíče",
          // Zvýrazňujeme JEN schránku vybraného bytu; kód se nikdy nezobrazuje.
          hotspots: [
            { x: apartment.lockboxX, y: 52, label: s.keys.lockboxLabel(apartment.label) },
          ],
        },
      ],
    },
    {
      id: "parking",
      title: s.parking.title,
      body: s.parking.body,
      carOnly: true,
      photos: [
        {
          src: remote.url,
          alt: "Výklenek s dálkovým ovladačem",
          hotspots: [{ x: 59, y: 43, label: s.parking.hotspots.remote }],
        },
      ],
    },
    {
      id: "path",
      title: apartment.entrance === "own" ? s.pathOwn.title : s.pathMain.title,
      body: apartment.entrance === "own" ? s.pathOwn.body : s.pathMain.body,
      showSitePlan: true,
      photos: [{ src: aerial.url, alt: "Cesta k bytu" }],
    },
    {
      id: "done",
      title: s.done.title,
      body: s.done.body,
      photos: [],
    },
  ];
  return steps.filter((step) => !step.carOnly || mode === "car");
};
