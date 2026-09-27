import GetawayHero from "@/components/getaway/GetawayHero";
import GetawayFormat from "@/components/getaway/GetawayFormat";
import GetawayItinerary from "@/components/getaway/GetawayItinerary";
import GetawayIncluded from "@/components/getaway/GetawayIncluded";
import GetawayLogistics from "@/components/getaway/GetawayLogistics";
import GetawayAtmosphere from "@/components/getaway/GetawayAtmosphere";
import GetawayRequestForm from "@/components/getaway/GetawayRequestForm";
import GetawayFooter from "@/components/getaway/GetawayFooter";

export default function Getaway() {
  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "linear-gradient(160deg, hsl(120 20% 97%) 0%, hsl(36 20% 93%) 100%)" }}
    >
      <GetawayHero />
      <GetawayFormat />
      <GetawayItinerary />
      <GetawayIncluded />
      <GetawayLogistics />
      <GetawayAtmosphere />
      <section id="signup" className="px-5 py-14">
        <GetawayRequestForm />
      </section>
      <GetawayFooter />
    </div>
  );
}