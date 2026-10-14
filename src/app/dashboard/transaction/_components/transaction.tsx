'use client';

import { getTransactions } from '@/features/transaction/action';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import TransactionTable from './transaction-table';

export function Transaction() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', page, limit, search],
    queryFn: () => getTransactions({ page, limit, search }),
  });

  return (
    <TransactionTable
      transactions={data}
      isLoading={isLoading}
      refetch={refetch}
      page={page}
      limit={limit}
      search={search}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
    />
  );
}
