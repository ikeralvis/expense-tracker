-- Create recurring_transactions table
create table if not exists recurring_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  amount decimal(12,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  description text,
  frequency text not null check (frequency in ('monthly', 'weekly', 'yearly')),
  start_date date not null default current_date,
  next_run_date date not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table recurring_transactions enable row level security;

-- Create policies
create policy "Users can view their own recurring transactions"
  on recurring_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recurring transactions"
  on recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recurring transactions"
  on recurring_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recurring transactions"
  on recurring_transactions for delete
  using (auth.uid() = user_id);
