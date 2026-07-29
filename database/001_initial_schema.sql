create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('member','premium','editor','admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.ai_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text not null,
  pricing_model text not null default 'freemium',
  website_url text,
  affiliate_url text,
  rating numeric(2,1) check (rating between 0 and 5),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tool_categories (
  tool_id uuid references public.ai_tools(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (tool_id, category_id)
);

create table public.favorites (
  user_id uuid references auth.users(id) on delete cascade,
  tool_id uuid references public.ai_tools(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.ai_tools enable row level security;
alter table public.categories enable row level security;

create policy "Published tools are public" on public.ai_tools for select using (status = 'published');
create policy "Categories are public" on public.categories for select using (true);
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users manage own favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
