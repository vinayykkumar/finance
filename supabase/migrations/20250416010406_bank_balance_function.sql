-- Create function to update bank balance
create or replace function public.update_bank_balance(bank_id uuid, amount_change numeric)
returns void
language plpgsql
security definer
as $$
begin
  -- Update the bank balance
  update public.banks
  set balance = balance + amount_change
  where id = bank_id;
  
  -- Raise exception if bank not found
  if not found then
    raise exception 'Bank with ID % not found', bank_id;
  end if;
end;
$$;
