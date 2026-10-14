import { Metadata } from 'next';
import { Transaction } from './_components/transaction';

export const metadata: Metadata = {
  title: 'Fina | Transaction',
  description: 'Manage your transactions',
};

export default function TransactionPage() {
  return (
    <main className="p-2 space-y-4">
      <section id="header">
        <h1 className="text-2xl font-bold text-primary">Transaction</h1>
        <p>Manage your transactions.</p>
      </section>
      <section id="content">
        <Transaction />
      </section>
    </main>
  );
}
