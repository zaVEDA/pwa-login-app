import InvestorHero from "@/components/investor/InvestorHero";
import InvestorProblem from "@/components/investor/InvestorProblem";
import InvestorSolution from "@/components/investor/InvestorSolution";
import InvestorInvest from "@/components/investor/InvestorInvest";

export default function Investor() {
  return (
    <div className="min-h-screen font-golos" style={{ background: "linear-gradient(160deg, hsl(36 25% 96%) 0%, hsl(36 20% 91%) 100%)" }}>
      <InvestorHero />
      <InvestorProblem />
      <InvestorSolution />
      <InvestorInvest />
    </div>
  );
}
