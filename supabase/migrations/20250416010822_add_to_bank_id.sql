-- Add to_bank_id column to transactions table
alter table public.transactions
add column if not exists to_bank_id uuid references public.banks(id);

-- Add comment
comment on column public.transactions.to_bank_id is 'The destination bank account for transfer transactions';
