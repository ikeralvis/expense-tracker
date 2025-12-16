import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateAccountForm from '@/components/dashboard/CreateAccountForm';

// Mock server actions
vi.mock('@/lib/actions/accounts', () => ({
    createAccount: vi.fn(),
}));

describe('CreateAccountForm', () => {
    const mockBanks = [
        { id: '1', name: 'Banco Santander' },
        { id: '2', name: 'BBVA' },
    ];

    it('renders the create account button initially', () => {
        render(<CreateAccountForm banks={mockBanks} />);
        expect(screen.getByText('Nueva Cuenta')).toBeDefined();
    });

    it('opens the modal and shows form fields', async () => {
        render(<CreateAccountForm banks={mockBanks} />);

        // Open modal
        fireEvent.click(screen.getByText('Nueva Cuenta'));

        // Check if modal title exists - there are two "Nueva Cuenta" texts (button and header)
        expect(screen.getAllByText('Nueva Cuenta').length).toBeGreaterThan(0);

        // Check if inputs are present
        expect(screen.getByLabelText(/Saldo Inicial/i)).toBeDefined();

        // We look for "Nombre de la Cuenta" text which is in label
        expect(screen.getByText('Nombre de la Cuenta')).toBeDefined();

        // Check if bank selector is present
        expect(screen.getByText('Selecciona un banco...')).toBeDefined();
    });
});
