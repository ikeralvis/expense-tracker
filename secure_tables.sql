-- 1. FIX FUNCTION SECURITY (Mutable search_path)
-- Fixing "Function has a role mutable search_path" warning
ALTER FUNCTION public.update_account_balance() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- 3. CREATE OPTIMIZED POLICIES (Using (select auth.uid()) for performance)

-- Helper macro logic not available in standard SQL script without functions, 
-- so writing explicit policies for each table.

-- === ACCOUNTS ===
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (user_id = (select auth.uid()));

-- === BANKS ===
DROP POLICY IF EXISTS "Users can view own banks" ON banks;
CREATE POLICY "Users can view own banks" ON banks FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own banks" ON banks;
CREATE POLICY "Users can insert own banks" ON banks FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own banks" ON banks;
CREATE POLICY "Users can update own banks" ON banks FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own banks" ON banks;
CREATE POLICY "Users can delete own banks" ON banks FOR DELETE USING (user_id = (select auth.uid()));

-- === BUDGETS ===
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (user_id = (select auth.uid()));

-- === CATEGORIES ===
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (user_id = (select auth.uid()));

-- === TRANSACTIONS ===
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (user_id = (select auth.uid()));

-- === RECURRING TRANSACTIONS ===
-- Dropping potential old policies to standardize formatting
DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON recurring_transactions;
DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON recurring_transactions;
DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON recurring_transactions;

CREATE POLICY "Users can view own recurring_transactions" ON recurring_transactions FOR SELECT USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own recurring_transactions" ON recurring_transactions FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own recurring_transactions" ON recurring_transactions FOR UPDATE USING (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own recurring_transactions" ON recurring_transactions FOR DELETE USING (user_id = (select auth.uid()));
