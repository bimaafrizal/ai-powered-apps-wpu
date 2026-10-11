CREATE OR REPLACE FUNCTION match_transactions (
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)

RETURNS TABLE (
    id uuid,
    type text,
    category text,
    amount numeric,
    description text,
    date date,
    user_id uuid,
    similarity float
)

LANGUAGE sql STABLE
AS $$
    SELECT
        t.id,
        t.type,
        t.category,
        t.amount,
        t.description,
        t.date,
        t.user_id,
        1 - (t.embedding <=> query_embedding) AS similarity
    FROM public.transactions AS t
    WHERE 1 - (t.embedding <=> query_embedding) > match_threshold
    ORDER BY t.embedding <=> query_embedding
    LIMIT match_count;
$$;