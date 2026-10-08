import Link from "next/link";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <HandCoins className="text-emerald-700 size-20" />
      <h1 className="text-3xl font-bold text-emerald-700">Welcome to Fina</h1>
      <p className="text-muted-foreground">
        Personal finance app with AI
      </p>
      <Link href="/dashboard" className="mt-4">
        <Button className="bg-emerald-700 hover:bg-emerald-800" size="lg">
          Get Started
        </Button>
      </Link>
    </main>
  );
}
