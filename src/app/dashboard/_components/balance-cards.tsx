import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBalanceSummary } from "@/features/transaction/action";
import { convertToIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

export function BalanceCards({
  data,
  error,
}: {
  data:
    { savings: number; totalIncome: number; totalExpense: number } | undefined;
  error: unknown;
}) {
  if (error) {
    return (
      <div className="border-destructive/50 text-destructive bg-destructive/10 w-full rounded-lg border p-4 text-sm">
        Failed to get balance
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <WalletIcon className="size-4" />
            Savings
          </CardTitle>
          <CardDescription className="text-secondary-foreground text-lg font-semibold lg:text-2xl">
            {convertToIDR(Number(data?.savings || 0))}
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-sm">Savings for all time</CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingUpIcon className="size-4" />
            Incomes
          </CardTitle>
          <CardDescription className="text-secondary-foreground text-lg font-semibold lg:text-2xl">
            {convertToIDR(Number(data?.totalIncome || 0))}
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-sm">Total Incomes for all time</CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <TrendingDownIcon className="size-4" />
            Expenses
          </CardTitle>
          <CardDescription className="text-secondary-foreground text-lg font-semibold lg:text-2xl">
            {convertToIDR(Number(data?.totalExpense || 0))}
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-sm">Total expenses for all time</CardFooter>
      </Card>
    </div>
  );
}
