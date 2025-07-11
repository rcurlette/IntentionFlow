-- Create evening_reflections table for "Tomorrow I will..." forms
create table public.evening_reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  tomorrow_plans text not null default '',
  preparation text not null default '',
  random_thoughts text not null default '',
  dont_forget text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create unique constraint on user_id and date (one reflection per day per user)
alter table public.evening_reflections add constraint evening_reflections_user_date_unique unique (user_id, date);

-- Set up Row Level Security (RLS)
alter table public.evening_reflections enable row level security;

-- Create policies
create policy "Users can view their own evening reflections" on public.evening_reflections
  for select using (auth.uid() = user_id);

create policy "Users can insert their own evening reflections" on public.evening_reflections
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own evening reflections" on public.evening_reflections
  for update using (auth.uid() = user_id);

create policy "Users can delete their own evening reflections" on public.evening_reflections
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index evening_reflections_user_id_idx on public.evening_reflections(user_id);
create index evening_reflections_date_idx on public.evening_reflections(date);
create index evening_reflections_user_date_idx on public.evening_reflections(user_id, date);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger handle_evening_reflections_updated_at
  before update on public.evening_reflections
  for each row execute procedure public.handle_updated_at();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.evening_reflections to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
