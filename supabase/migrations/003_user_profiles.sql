-- Create user_profiles table
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan_type text not null default 'free' check (plan_type in ('free', 'pro', 'enterprise')),
  plan_cost decimal(10,2) not null default 0.00,
  timezone text default 'UTC',
  preferences jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Create indexes
create index user_profiles_email_idx on public.user_profiles(email);
create index user_profiles_plan_type_idx on public.user_profiles(plan_type);

-- Create trigger to automatically update updated_at
create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- Update existing tables to include user_id where missing

-- Add user_id to tasks table if not exists
alter table public.tasks add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists tasks_user_id_idx on public.tasks(user_id);

-- Add user_id to day_plans table if not exists  
alter table public.day_plans add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists day_plans_user_id_idx on public.day_plans(user_id);

-- Add user_id to pomodoro_sessions table if not exists
alter table public.pomodoro_sessions add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists pomodoro_sessions_user_id_idx on public.pomodoro_sessions(user_id);

-- Update RLS policies for existing tables to include user_id checks

-- Tasks table policies
drop policy if exists "Users can view their own tasks" on public.tasks;
drop policy if exists "Users can insert their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;

create policy "Users can view their own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks" on public.tasks
  for delete using (auth.uid() = user_id);

-- Day plans table policies
drop policy if exists "Users can view their own day plans" on public.day_plans;
drop policy if exists "Users can insert their own day plans" on public.day_plans;
drop policy if exists "Users can update their own day plans" on public.day_plans;
drop policy if exists "Users can delete their own day plans" on public.day_plans;

create policy "Users can view their own day plans" on public.day_plans
  for select using (auth.uid() = user_id);

create policy "Users can insert their own day plans" on public.day_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own day plans" on public.day_plans
  for update using (auth.uid() = user_id);

create policy "Users can delete their own day plans" on public.day_plans
  for delete using (auth.uid() = user_id);

-- Pomodoro sessions table policies  
drop policy if exists "Users can view their own pomodoro sessions" on public.pomodoro_sessions;
drop policy if exists "Users can insert their own pomodoro sessions" on public.pomodoro_sessions;
drop policy if exists "Users can update their own pomodoro sessions" on public.pomodoro_sessions;
drop policy if exists "Users can delete their own pomodoro sessions" on public.pomodoro_sessions;

create policy "Users can view their own pomodoro sessions" on public.pomodoro_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own pomodoro sessions" on public.pomodoro_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own pomodoro sessions" on public.pomodoro_sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own pomodoro sessions" on public.pomodoro_sessions
  for delete using (auth.uid() = user_id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.user_profiles to anon, authenticated;

-- Function to automatically create user profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
