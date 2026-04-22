-- ─── DealerPro · Supabase Schema ─────────────────────────────────────────────
-- Run this in the Supabase SQL editor for your project.
-- Idempotent: uses IF NOT EXISTS / OR REPLACE everywhere safe to do so.

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Sequences & helpers ──────────────────────────────────────────────────────
create sequence if not exists property_id_seq start 1;

create or replace function generate_property_id() returns text
  language sql as $$
    select 'DP-' || lpad(nextval('property_id_seq')::text, 4, '0');
  $$;

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- Properties
create table if not exists properties (
  id            uuid        primary key default gen_random_uuid(),
  property_id   text        unique not null,
  title         text        not null,
  description   text,
  city          text        not null,
  locality      text        not null,
  price         bigint      not null,
  property_type text        not null,
  category      text        default 'residential',
  area          integer,
  bedrooms      smallint,
  bathrooms     smallint,
  owner_name    text        not null,
  owner_phone   text,
  status        text        not null default 'available'
                            check (status in ('available','sold','hold','requirement')),
  featured      boolean     default false,
  latitude      double precision,
  longitude     double precision,
  created_by    uuid        references auth.users(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Property images
create table if not exists property_images (
  id            uuid        primary key default gen_random_uuid(),
  property_id   uuid        not null references properties(id) on delete cascade,
  image_url     text        not null,
  storage_path  text,
  is_primary    boolean     default false,
  sort_order    smallint    default 0
);

-- Leads
create table if not exists leads (
  id                  uuid        primary key default gen_random_uuid(),
  lead_number         text        unique not null,
  client_name         text        not null,
  client_phone        text,
  client_email        text,
  budget_min          bigint,
  budget_max          bigint,
  preferred_location  text,
  preferred_type      text,
  property_interest   uuid        references properties(id) on delete set null,
  stage               text        not null default 'new_inquiry'
                                  check (stage in ('new_inquiry','contacted','visit_scheduled','negotiation','closed','lost')),
  source              text        not null,
  priority            text        not null default 'medium'
                                  check (priority in ('low','medium','high','urgent')),
  assigned_to         text,
  follow_up_date      timestamptz,
  last_contacted      timestamptz,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- User profiles (extends auth.users)
create table if not exists user_profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  full_name       text        not null,
  phone           text,
  company_name    text,
  role            text        default 'dealer' check (role in ('admin','dealer','staff')),
  approval_status text        default 'pending' check (approval_status in ('pending','approved','suspended')),
  created_at      timestamptz default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_properties_status        on properties(status);
create index if not exists idx_properties_city          on properties(city);
create index if not exists idx_properties_property_type on properties(property_type);
create index if not exists idx_properties_featured      on properties(featured) where featured = true;
create index if not exists idx_property_images_prop_id  on property_images(property_id);
create index if not exists idx_leads_stage              on leads(stage);
create index if not exists idx_leads_priority           on leads(priority);
create index if not exists idx_leads_follow_up_date     on leads(follow_up_date);
create index if not exists idx_leads_assigned_to        on leads(assigned_to);

-- ─── Row-Level Security ───────────────────────────────────────────────────────
alter table properties    enable row level security;
alter table property_images enable row level security;
alter table leads         enable row level security;
alter table user_profiles enable row level security;

-- Properties: any authenticated user can read; only creator (or admin) can write
create policy "Properties: read for authenticated"
  on properties for select
  using (auth.role() = 'authenticated');

create policy "Properties: insert for authenticated"
  on properties for insert
  with check (auth.role() = 'authenticated');

create policy "Properties: update own or admin"
  on properties for update
  using (
    auth.uid() = created_by
    or exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Properties: delete own or admin"
  on properties for delete
  using (
    auth.uid() = created_by
    or exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Property images: follow parent property rules
create policy "Images: read for authenticated"
  on property_images for select
  using (auth.role() = 'authenticated');

create policy "Images: insert for authenticated"
  on property_images for insert
  with check (auth.role() = 'authenticated');

-- Leads: any authenticated user can read/write (team-shared CRM)
create policy "Leads: full access for authenticated"
  on leads for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- User profiles: users can read their own profile; admins can read all
create policy "Profiles: read own"
  on user_profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Profiles: update own"
  on user_profiles for update
  using (auth.uid() = id);

-- ─── Trigger: auto-create profile on signup ───────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Storage bucket (run once, or via Supabase dashboard) ─────────────────────
-- insert into storage.buckets (id, name, public)
-- values ('property-images', 'property-images', true)
-- on conflict (id) do nothing;
