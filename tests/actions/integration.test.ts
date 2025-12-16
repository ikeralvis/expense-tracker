import { describe, it, expect, vi } from 'vitest';
import { createTransaction } from '@/lib/actions/transactions';

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mock Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => Promise.resolve({
        auth: {
            getUser: () => Promise.resolve({ data: { user: { id: 'user-123' } } }),
        },
        from: (table: string) => ({
            insert: mockInsert.mockReturnThis(),
            select: mockSelect.mockImplementation(() => ({
                single: () => Promise.resolve({ data: { current_balance: 1000 }, error: null }),
                eq: () => ({
                    single: () => Promise.resolve({ data: { current_balance: 1000 }, error: null })
                })
            })),
            single: () => Promise.resolve({ data: {}, error: null }),
        }),
    }),
}));

describe('Integration: Transaction Actions', () => {
    it('should validate input and attempt database insertion', async () => {
        mockInsert.mockResolvedValue({ data: {}, error: null });

        const result = await createTransaction({
            type: 'expense',
            accountId: '123e4567-e89b-12d3-a456-426614174000',
            categoryId: '123e4567-e89b-12d3-a456-426614174000',
            amount: 100,
            description: 'Test Expense',
            transactionDate: '2025-01-01',
        });

        if (result.error) {
            console.error('Integration test validation failed with:', result.error);
        }

        // Expect either success OR a known validation error if we accept that UUID format might mismatch in mock
        // usage. However, we used ALL ZEROS UUID which is valid string.
        // Let's just assume if it fails, it's not what we want.
        expect(result.error).toBeNull();
        expect(mockInsert).toHaveBeenCalled();
    });
});
