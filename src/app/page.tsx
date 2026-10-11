import Link from "next/link";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fina",
  description: "Personal finance app with AI",
};

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <HandCoins className=" text-primary size-20" />
      <h1 className="text-3xl font-bold  text-primary">Welcome to Fina</h1>
      <p className="text-muted-foreground">
        Personal finance app with AI
      </p>
      <Link href="/dashboard" className="mt-4">
        <Button className="bg-primary hover:bg-primary/80" size="lg">
          Get Started
        </Button>
      </Link>
    </main>
  );
}
