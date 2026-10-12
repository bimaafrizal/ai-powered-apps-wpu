import { createClient } from "@/lib/supabase/server";

export async function getBalanceSummary() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('transactions').select('amount, type');

    if (error) {
        console.error('Error fetching balance summary:', error);
        return { totalIncome: 0, totalExpense: 0, savings: 0 };
    }


    const {totalIncome, totalExpense, savings} = data?.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
            acc.totalIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
            acc.totalExpense += transaction.amount;
        }

        acc.savings = acc.totalIncome - acc.totalExpense;
        return acc;

    }, { totalIncome: 0, totalExpense: 0, savings: 0 }) 

    return { totalIncome, totalExpense, savings };
};