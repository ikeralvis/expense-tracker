'use server';

import { createClient } from '@/lib/supabase/server';
import { analyzeSpending } from '@/lib/utils/analysis';
import { Database } from '@/types/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export async function getSpendingAnalysis() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: 'No autenticado' };
    }

    try {
        // 1. Fetch Categories
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id);

        if (catError) throw catError;

        // 2. Fetch Transactions (Last 6 months)
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1); // Go back 5 months + current = 6
        const dateStr = sixMonthsAgo.toISOString().split('T')[0];

        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'expense')
            .gte('transaction_date', dateStr);

        if (transError) throw transError;

        // 3. Run Analysis
        const analysis = analyzeSpending(
            transactions as Transaction[],
            categories as Category[]
        );

        return { data: analysis, error: null };

    } catch (error: any) {
        console.error('Error getting analysis:', error);
        return { data: null, error: error.message };
    }
}
