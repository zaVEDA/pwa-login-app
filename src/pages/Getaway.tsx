import GetawayHero from "@/components/getaway/GetawayHero";
import GetawayFormat from "@/components/getaway/GetawayFormat";
import GetawayItinerary from "@/components/getaway/GetawayItinerary";
import GetawayLogistics from "@/components/getaway/GetawayLogistics";
import GetawayAtmosphere from "@/components/getaway/GetawayAtmosphere";

export default function Getaway() {
  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "linear-gradient(160deg, hsl(120 20% 97%) 0%, hsl(36 20% 93%) 100%)" }}
    >
      <GetawayHero />
      <GetawayFormat />
      <GetawayItinerary />
      <GetawayLogistics />
      <GetawayAtmosphere />
    </div>
  );
}