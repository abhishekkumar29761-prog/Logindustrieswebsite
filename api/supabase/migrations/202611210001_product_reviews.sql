create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_reviews_one_per_customer unique (product_id, user_id)
);

create index if not exists product_reviews_product_status_created_idx
  on public.product_reviews(product_id, status, created_at desc);
create index if not exists product_reviews_user_created_idx
  on public.product_reviews(user_id, created_at desc);
create index if not exists product_reviews_status_created_idx
  on public.product_reviews(status, created_at desc);

drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
create trigger product_reviews_set_updated_at before update on public.product_reviews
for each row execute function public.set_updated_at();

alter table public.product_reviews enable row level security;

grant select on public.product_reviews to anon, authenticated;
grant all on public.product_reviews to service_role;

drop policy if exists product_reviews_public_read_approved on public.product_reviews;
create policy product_reviews_public_read_approved on public.product_reviews
for select using (status = 'approved');

drop policy if exists product_reviews_read_self_or_admin on public.product_reviews;
create policy product_reviews_read_self_or_admin on public.product_reviews
for select using (user_id = auth.uid() or public.is_admin());
