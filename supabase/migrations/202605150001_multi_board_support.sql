alter table public.boards
  add column if not exists position integer not null default 0;

with ordered_boards as (
  select
    id,
    row_number() over (partition by user_id order by created_at, id) - 1 as board_position
  from public.boards
)
update public.boards
set position = ordered_boards.board_position
from ordered_boards
where public.boards.id = ordered_boards.id;

alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'boards' and policyname = 'boards_owner_all'
  ) then
    create policy boards_owner_all
      on public.boards
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'columns' and policyname = 'columns_owner_all'
  ) then
    create policy columns_owner_all
      on public.columns
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cards' and policyname = 'cards_owner_all'
  ) then
    create policy cards_owner_all
      on public.cards
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
