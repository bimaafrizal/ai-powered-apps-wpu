import { Metadata } from "next";
import DashboardContent from "./_components/dashbaord-content";

export const metadata: Metadata = {
  title: "Fina",
  description: "Your personal finance dashboard",
};

export default function DashboardPage() {
  return (
    <main className="space-y-4 p-2">
      <section id="header">
        <h1 className="text-primary text-2xl font-bold">Dashboard</h1>
        <p>Get insight into your financial health.</p>
      </section>
      <DashboardContent />
    </main>
  );
}
