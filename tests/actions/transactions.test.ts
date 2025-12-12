// tests/actions/transactions.test.ts
import { vi, describe, it, expect } from 'vitest';

// Mock revalidatePath from next/cache used by the action
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// Mockear createClient para devolver un supabase stub
// Helper functions to reduce nesting
const singleInsert = async (rows: any[]) => ({ data: rows[0], error: null });
const selectInsert = (rows: any[]) => ({
  single: () => singleInsert(rows),
});
const insert = (rows: any[]) => ({
  select: () => selectInsert(rows),
});

const singleSelect = async () => ({ data: { current_balance: 100 } });
const eqSelect = (_: string, __: any) => ({
  single: singleSelect,
});
const select = (cols?: string) => ({
  eq: eqSelect,
});

const eqUpdate = () => ({});
const update = () => ({
  eq: eqUpdate,
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => {
    const mock = {
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) },
      from: (table: string) => ({
        insert,
        select,
        update,
      }),
    };
    return mock;
  }),
}));

import { createTransaction } from '@/lib/actions/transactions';

describe('createTransaction', () => {
  it('inserta transacción sin lanzar', async () => {
    const res = await createTransaction({
      type: 'expense',
      accountId: '11111111-1111-4111-8111-111111111111',
      categoryId: '22222222-2222-4222-8222-222222222222',
      amount: 10,
      description: 'test',
      transactionDate: '2025-11-19',
    } as any);
    expect(res.error).toBeNull();
    expect(res.data).toBeTruthy();
  });
});