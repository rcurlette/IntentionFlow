# Supabase Database Setup Checklist

## Prerequisites
- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] New Supabase project created

## 1. Environment Configuration
- [ ] Copy project URL from Supabase dashboard → Settings → API
- [ ] Copy anon public key from Supabase dashboard → Settings → API  
- [ ] Create `.env.local` file in project root with:
  ```env
  VITE_SUPABASE_URL=your_project_url_here
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```

## 2. Database Schema Setup
- [ ] Go to Supabase dashboard → SQL Editor
- [ ] Go to FlowTracker app → `/debug` page
- [ ] Click "Check Setup" under Database Setup Status
- [ ] Click "Copy Setup SQL" button
- [ ] Paste the SQL into Supabase SQL Editor
- [ ] Run the SQL to create all tables and policies
- [ ] Verify no errors in execution

## 3. Verify Database Setup
- [ ] Return to FlowTracker `/debug` page
- [ ] Click "Check Setup" again
- [ ] Verify all tables show "Ready" status
- [ ] Look for the green "✅ All database tables are set up correctly!" message

## 4. Test Database Operations
- [ ] On debug page, go to "Database Tests" tab
- [ ] Click "Create Profile" - should pass (verifies admin_test user exists)
- [ ] Click "Create Task" - should pass (tests foreign key relationships)
- [ ] Click "Create Flow Session" - should pass
- [ ] Click "Create User Settings" - should pass
- [ ] All tests should show green "Pass" badges

## 5. Storage Mode Configuration
- [ ] On debug page, check "System Status" shows Database: ✓
- [ ] In debug page "Storage" tab, verify storage mode is "database" or "auto"
- [ ] Test storage mode switching if needed

## 6. Authentication Setup (Optional)
- [ ] Go to Supabase dashboard → Authentication → Settings
- [ ] Configure email templates if needed
- [ ] Set up OAuth providers if desired
- [ ] Test user registration flow

## 7. Row Level Security (RLS) Verification
- [ ] Verify RLS policies are active (debug tests show "RLS Active" is normal)
- [ ] Test that users can only access their own data
- [ ] Confirm admin_test user can perform all operations

## 8. Production Deployment
- [ ] Add environment variables to production hosting (Vercel, Netlify, etc.)
- [ ] Test database connectivity in production
- [ ] Monitor logs for any connection issues
- [ ] Set up database backups in Supabase if needed

## Common Issues & Solutions

### "Database connection failed"
- Check environment variables are set correctly
- Verify Supabase project is not paused
- Check network connectivity

### "Foreign key constraint violations"
- Ensure admin_test user was created in database setup
- Run database setup SQL if not done yet
- Check that all required tables exist

### "RLS policy errors"
- Normal for admin operations to show "RLS Active"
- Policies are working correctly if tests pass
- Admin_test user bypasses some RLS restrictions

### "Storage mode issues"
- Debug page shows current storage mode
- Can manually switch modes in Storage tab
- localStorage fallback works if database unavailable

## Verification Complete
- [ ] All database tests pass
- [ ] FlowTracker app works with database storage
- [ ] Can create and manage tasks, flow sessions, and settings
- [ ] Debug page shows all green status indicators

## Notes
- The `admin_test` user is automatically created for testing
- Row Level Security (RLS) is enabled for data protection
- The app automatically falls back to localStorage if database is unavailable
- Debug page provides comprehensive testing and monitoring tools
