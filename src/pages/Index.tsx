import { lazy, Suspense } from "react";
import PageShell from "@/components/PageShell";
import LeaseHero from "@/components/lease/LeaseHero";
import { LeaseProblem, LeaseFlow, LeaseOffer, LeaseGuarantee, LeaseWhy, LeaseWhich, LeaseFaq } from "@/components/lease/LeaseSections";

const LeaseCalc = lazy(() => import("@/components/lease/LeaseCalc"));
const ContactSection = lazy(() => import("@/components/ContactSection"));

/**
 * HOMEPAGE = NABÍDKA NÁJMU (5. 11. 2026). Správa za 20 % je z webu pryč;
 * Antam si byt od investora pronajme na 3 roky a platí nájem ve výši jeho
 * splátky. Pořadí podle toho, na co se investor ptá: slib a příklad → proč
 * mu to dnes nejde → smyčka → co dostane → co kdyby → z čeho to platíme →
 * jeho číslo → které byty → otázky → poslat byt. Vlastní provoz (270 000 Kč)
 * zůstává na /vlastni-provoz s odkazem v patičce.
 */
const Index = () => (
  <PageShell page="home">
    <LeaseHero />
    <LeaseProblem />
    <LeaseFlow />
    <LeaseOffer />
    <LeaseGuarantee />
    <LeaseWhy />
    <Suspense fallback={null}><LeaseCalc /></Suspense>
    <LeaseWhich />
    <LeaseFaq />
    <Suspense fallback={null}><ContactSection /></Suspense>
  </PageShell>
);

export default Index;
