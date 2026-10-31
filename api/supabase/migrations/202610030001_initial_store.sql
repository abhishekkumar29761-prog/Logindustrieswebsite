create extension if not exists pgcrypto;

create sequence if not exists public.order_number_seq;

create table if not exists public.categories (
  slug text primary key,
  name text not null unique,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text not null references public.categories(slug) on update cascade,
  price numeric(12, 2),
  original_price numeric(12, 2),
  image_url text,
  description text,
  stock integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_nonnegative check (price is null or price >= 0),
  constraint products_original_price_nonnegative check (original_price is null or original_price >= 0),
  constraint products_stock_nonnegative check (stock is null or stock >= 0)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  shipping_address jsonb not null default '{}'::jsonb,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  currency text not null default 'INR' check (currency = 'INR'),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  shipping_address jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  stock_reserved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.order_items add column if not exists stock_reserved boolean not null default false;

create index if not exists products_category_active_idx on public.products(category_slug, is_active);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.products to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant all on public.categories, public.products, public.profiles, public.orders, public.order_items to service_role;
grant usage, select on sequence public.order_number_seq to service_role;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_public_read_active on public.products;
create policy products_public_read_active on public.products for select using (is_active or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_read_self_or_admin on public.profiles;
create policy profiles_read_self_or_admin on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check ((id = auth.uid() and role = 'customer') or public.is_admin());

drop policy if exists orders_read_owner_or_admin on public.orders;
create policy orders_read_owner_or_admin on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists order_items_read_owner_or_admin on public.order_items;
create policy order_items_read_owner_or_admin on public.order_items for select
using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

create or replace function public.place_order(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text := 'LI-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  v_subtotal numeric(12, 2) := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_line_total numeric(12, 2);
begin
  if p_user_id is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Invalid order payload';
  end if;
  if p_shipping_address is null or jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'Shipping address is required';
  end if;

  insert into public.orders (id, order_number, user_id, shipping_address)
  values (v_order_id, v_order_number, p_user_id, p_shipping_address);

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity < 1 or v_quantity > 100 then raise exception 'Quantity must be between 1 and 100'; end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid and is_active
    for update;

    if not found then raise exception 'Product is unavailable'; end if;
    if v_product.price is null then raise exception 'Product price requires confirmation'; end if;
    if v_product.stock is not null and v_product.stock < v_quantity then raise exception 'Insufficient stock for %', v_product.name; end if;

    v_line_total := v_product.price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into public.order_items (order_id, product_id, product_name, product_image, quantity, unit_price, line_total, stock_reserved)
    values (v_order_id, v_product.id, v_product.name, v_product.image_url, v_quantity, v_product.price, v_line_total, v_product.stock is not null);

    if v_product.stock is not null then
      update public.products set stock = stock - v_quantity where id = v_product.id;
    end if;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'status', 'pending',
    'payment_status', 'pending',
    'currency', 'INR',
    'subtotal', v_subtotal,
    'shipping_fee', 0,
    'total', v_subtotal
  );
end;
$$;

create or replace function public.update_order_status(p_order_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_status not in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Invalid order status';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status = 'cancelled' and p_status <> 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened';
  end if;
  if v_order.status = 'delivered' and p_status <> 'delivered' then
    raise exception 'Delivered orders cannot be moved to another status';
  end if;
  if v_order.status = 'pending' and p_status not in ('pending', 'confirmed', 'cancelled') then
    raise exception 'Pending orders can only be confirmed or cancelled';
  end if;
  if v_order.status = 'confirmed' and p_status not in ('confirmed', 'processing', 'cancelled') then
    raise exception 'Confirmed orders can only be processed or cancelled';
  end if;
  if v_order.status = 'processing' and p_status not in ('processing', 'shipped', 'cancelled') then
    raise exception 'Processing orders can only be shipped or cancelled';
  end if;
  if v_order.status = 'shipped' and p_status not in ('shipped', 'delivered', 'cancelled') then
    raise exception 'Shipped orders can only be delivered or cancelled';
  end if;

  if v_order.status <> 'cancelled' and p_status = 'cancelled' then
    update public.products p
    set stock = p.stock + oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.stock_reserved
      and oi.product_id = p.id;
  end if;

  update public.orders set status = p_status where id = p_order_id;
  return jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'status', p_status,
    'payment_status', v_order.payment_status,
    'currency', v_order.currency,
    'total', v_order.total
  );
end;
$$;

revoke all on function public.place_order(uuid, jsonb, jsonb) from public;
grant execute on function public.place_order(uuid, jsonb, jsonb) to service_role;
revoke all on function public.update_order_status(uuid, text) from public;
grant execute on function public.update_order_status(uuid, text) to service_role;

insert into public.categories (slug, name, image_url, sort_order) values
('water-controllers', 'Water Controllers', 'https://logindustries.com/wp-content/uploads/2025/11/1.product_1-300x300.png', 1),
('sanitizer-dispensers', 'Sanitizer Dispensers', 'https://logindustries.com/wp-content/uploads/2026/05/AutoSan-DUal-Toweer-300x300.jpeg', 2),
('smartphones-security-lock', 'Smartphone Security Lock', 'https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-12-at-10.21.06-PM-300x300.jpeg', 3),
('automatic-hydraulic-door-close', 'Automatic Hydraulic Door Closer', 'https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-13-at-10.43.36-AM-600x600.jpeg', 4)
on conflict (slug) do update set name = excluded.name, image_url = excluded.image_url, sort_order = excluded.sort_order;

insert into public.products (slug, name, category_slug, price, original_price, image_url, is_active) values
('tank-mate-corporation-water-controller', 'Tank Mate – Automatic Water Level Controller for Corporation Water Supply | Smart Water Detection | 1.5HP Motor Protection', 'water-controllers', 4199, 8500, 'https://logindustries.com/wp-content/uploads/2025/11/5.product_5.2-300x300.png', true),
('tank-mate-auto-plus', 'Tank Mate Auto Plus – Automatic Water Level Controller for Borewell | 1.5HP Motor Protection', 'water-controllers', 4999, 9999, 'https://logindustries.com/wp-content/uploads/2025/11/4.product_4.2-300x300.png', true),
('tank-mate-plus', 'Tank Mate Plus – Automatic Water Level Controller | Corporation Water Supply | 1.5HP Motor Protection', 'water-controllers', 5999, 10999, 'https://logindustries.com/wp-content/uploads/2025/11/1.product_1-300x300.png', true),
('tank-mate-pro-2', 'Tank Mate Pro – Water Level Controller | Half Tank Auto Refill | 1.5HP Motor Protection', 'water-controllers', 3499, 6999, 'https://logindustries.com/wp-content/uploads/2025/11/5.product_5.2-300x300.png', true),
('tank-mate-pro-timer', 'Tank Mate Pro-Timer', 'water-controllers', 3499, 6999, 'https://logindustries.com/wp-content/uploads/2025/11/6.product_6-300x300.png', true),
('autosan-dual-tower-sanitizer-dispenser', 'AutoSan Dual Tower', 'sanitizer-dispensers', 7999, 15999, 'https://logindustries.com/wp-content/uploads/2026/05/AutoSan-DUal-Toweer-300x300.jpeg', true),
('floor-standing-hand-sanitizer-dispenser', 'AutoSan Stand Pro', 'sanitizer-dispensers', 3499, 7999, 'https://logindustries.com/wp-content/uploads/2026/05/WhatsApp-Image-2026-05-13-at-6.56.42-PM-300x300.jpeg', true),
('automatic-floor-standing-sanitizer-dispenser', 'AutoSan Tower Pro', 'sanitizer-dispensers', 5999, 11999, 'https://logindustries.com/wp-content/uploads/2026/05/AutoSanTOwerr-300x300.jpeg', true),
('wall-mount-hand-sanitizer-dispenser', 'AutoSan Wall Pro', 'sanitizer-dispensers', 2499, 4999, 'https://logindustries.com/wp-content/uploads/2026/05/AutoSan-Wall-Pro-600x600.png', true),
('smart-lock', 'Smart Lock', 'smartphones-security-lock', 3000, 6500, 'https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-12-at-10.21.06-PM-300x300.jpeg', true),
('automatic-hydraulic-door-closer', 'Automatic Hydraulic Door Closer', 'automatic-hydraulic-door-close', null, null, 'https://logindustries.com/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-13-at-10.43.36-AM-600x600.jpeg', true)
on conflict (slug) do update set
  name = excluded.name,
  category_slug = excluded.category_slug,
  price = excluded.price,
  original_price = excluded.original_price,
  image_url = excluded.image_url,
  is_active = excluded.is_active;