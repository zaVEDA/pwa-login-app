import WelcomeHero from "@/components/welcome/WelcomeHero";
import WelcomeBenefits from "@/components/welcome/WelcomeBenefits";
import WelcomePricing from "@/components/welcome/WelcomePricing";
import WelcomeCta from "@/components/welcome/WelcomeCta";
import CookieBanner from "@/components/welcome/CookieBanner";

export default function Welcome() {
  return (
    <div className="min-h-screen font-golos" style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}>
      <WelcomeHero />
      <WelcomeBenefits />
      <WelcomePricing />
      <WelcomeCta />
      <CookieBanner />
    </div>
  );
}