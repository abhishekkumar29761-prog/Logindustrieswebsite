alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;

update public.products
set images = jsonb_build_array(image_url)
where image_url is not null
  and images = '[]'::jsonb;
