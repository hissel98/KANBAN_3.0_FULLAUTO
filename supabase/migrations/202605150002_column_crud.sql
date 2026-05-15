alter table public.columns
  add column if not exists position integer not null default 0;

with ordered_columns as (
  select
    id,
    row_number() over (partition by board_id order by position, created_at, id) - 1 as column_position
  from public.columns
)
update public.columns
set position = ordered_columns.column_position
from ordered_columns
where public.columns.id = ordered_columns.id;
