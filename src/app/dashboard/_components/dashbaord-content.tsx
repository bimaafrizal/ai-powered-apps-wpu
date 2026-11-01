import { BalanceCards } from "./balance-cards";
import WizardInput from "./wizard-input";

export default function DashboardContent() {
  return (
    <section id="content" className="space-y-4">
      <WizardInput />
      <BalanceCards />
    </section>
  );
}
