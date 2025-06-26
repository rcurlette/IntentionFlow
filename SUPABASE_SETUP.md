# Supabase Setup Instructions

FlowTracker now uses Supabase as its backend database. Follow these steps to set up your Supabase project:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/sign in
3. Click "New Project"
4. Choose your organization and enter:
   - Project name: `flowtracker` (or any name you prefer)
   - Database password: Choose a strong password
   - Region: Select the closest region to you
5. Click "Create new project"

## 2. Get Your Project Credentials

Once your project is created:

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (something like `https://abcdefghijk.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Run the Database Migration

In your Supabase dashboard:

1. Go to the SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL editor and click "Run"

This will create all the necessary tables and policies for FlowTracker.

## 5. Verify the Setup

The database schema includes:

- **users** - User profiles (for future auth)
- **tasks** - Central task entity with type, period, priority, status
- **pomodoro_sessions** - Focus session tracking with flow scores
- **user_settings** - Theme, timer preferences, notifications
- **achievements** - Milestone tracking
- **user_streaks** - Productivity streak tracking

## 6. Test the Application

1. Start your development server: `npm run dev`
2. The app will now use Supabase for data storage
3. If there are any connection issues, the app will gracefully fall back to localStorage

## Features Now Database-Backed

✅ **Task Management** - All tasks stored in database with full CRUD  
✅ **Pomodoro Sessions** - Session history and analytics  
✅ **User Settings** - Themes, preferences, timer settings  
✅ **Achievements** - Milestone tracking and history  
✅ **Streak Tracking** - Productivity streaks and statistics  
✅ **Day Plans** - Computed dynamically from tasks and sessions

## Row Level Security (RLS)

The database is configured with RLS policies that are currently open (allowing all operations) since authentication isn't implemented yet. When you add authentication, these policies will automatically enforce user-specific data access.

## Offline Support

The app includes localStorage fallback, so it will continue working even if the database connection fails. Data will sync back to Supabase when the connection is restored.

## Next Steps

- Add user authentication (Supabase Auth)
- Implement real-time subscriptions for live updates
- Add data export/import features
- Implement cloud sync and backup
