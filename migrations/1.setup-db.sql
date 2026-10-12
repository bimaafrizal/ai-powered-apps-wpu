-- setup pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- create table transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- aktivasi rls
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- policy
CREATE POLICY "Permissive rules for all " ON public.transactions
    FOR ALL USING (true);


-- jika suda ada sistem auth
-- CREATE POLICY "User can only access their own transactions" ON public.transactions
--     FOR ALL USING (user_id = auth.uid());