-- Create transactions table
create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    description text not null,
    amount numeric not null,
    type text not null check (type in ('expense', 'income', 'transfer')),
    date date not null default current_date,
    bank_id uuid not null references public.banks(id),
    to_bank_id uuid references public.banks(id),
    category_id uuid references public.categories(id),
    user_id uuid references auth.users(id),
    created_at timestamptz not null default now(),
    
    -- Add constraint to ensure to_bank_id is set only for transfers
    constraint valid_transfer check (
        (type = 'transfer' and to_bank_id is not null) or
        (type != 'transfer' and to_bank_id is null)
    )
);
