import { Metadata } from "next";
import { BalanceCards } from "./_components/balance-cards";

export const metadata: Metadata = {
  title: "Fina",
  description: "Your personal finance dashboard",
};

export default function DashboardPage() {
  return (
    <main className="p-2 space-y-4">
      <section id="header">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p>Get insight into your financial health.</p>
      </section>
       <section id="content">
        <BalanceCards />
      </section>
    </main>
  );
}