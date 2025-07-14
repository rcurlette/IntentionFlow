# Admin Login Guide

## Admin User Setup

### Current Admin Configuration

**Admin Email**: `robert.curlette@gmail.com`  
**Admin Password**: **You need to create one!**

### Why No Default Password?

The admin system is configured to identify admin users by email address, but you need to create an account first. There's no default password for security reasons.

## How to Set Up Admin Login

### Option 1: Sign Up with Email (Recommended)

1. **Go to the login page**
2. **Click "Sign Up" tab**
3. **Enter admin details**:
   - Email: `robert.curlette@gmail.com`
   - Password: Choose a secure password (e.g., `FlowTracker2024!`)
4. **Complete signup**
5. **Admin privileges will be automatically granted** based on email match

### Option 2: Google OAuth (If Configured)

1. **Click "Continue with Google"**
2. **Sign in with the Google account**: `robert.curlette@gmail.com`
3. **Admin privileges granted automatically**

## Recommended Admin Password

For development/testing, you can use: `FlowTracker2024!`

For production, use a strong, unique password.

## Where User Data Gets Stored

### Authentication Data (Supabase `auth.users` table)

```sql
-- Supabase automatically manages this table
auth.users {
  id: UUID (primary key)
  email: TEXT
  encrypted_password: TEXT (bcrypt hashed)
  email_confirmed_at: TIMESTAMP
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  user_metadata: JSONB (name, avatar_url, etc.)
  app_metadata: JSONB (roles, etc.)
}
```

### Profile Data (Custom `user_profiles` table)

```sql
user_profiles {
  id: UUID (references auth.users.id)
  email: TEXT
  full_name: TEXT
  avatar_url: TEXT
  plan_type: TEXT ('free', 'pro', 'enterprise')
  plan_cost: INTEGER
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Flow Data (Custom tables with user isolation)

```sql
-- All these tables have user_id foreign key for data isolation
profiles       -- Flow-specific profile data
tasks          -- User tasks and subtasks
flow_sessions  -- Daily flow rituals and state
flow_actions   -- Quick flow actions
user_settings  -- App preferences
```

## Security Features

### Password Security

- ✅ **Bcrypt hashing** (handled by Supabase)
- ✅ **Minimum 6 characters** required
- ✅ **Rate limiting** on login attempts
- ✅ **Session management** with JWT tokens

### Data Isolation

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **User-scoped queries** - users can only see their own data
- ✅ **Admin detection** based on email address
- ✅ **Automatic profile creation** on first login

### Admin Privileges

- ✅ **Email-based identification**: `robert.curlette@gmail.com`
- ✅ **Automatic admin status** when logged in with admin email
- ✅ **Future admin panel access** (when implemented)
- ✅ **Database access** for debugging and management

## Testing the Setup

### Manual Testing Steps

1. **Create admin account**:

   ```
   Email: robert.curlette@gmail.com
   Password: FlowTracker2024!
   ```

2. **Verify admin status**:

   - Login should succeed
   - Check browser console for admin status logs
   - Admin badge should appear in navigation (if implemented)

3. **Test data creation**:
   - Create flow sessions
   - Add tasks
   - Verify data persists in Supabase

### Unit Tests

Run the authentication tests:

```bash
npm test src/tests/auth.test.ts
```

Tests cover:

- ✅ User registration flow
- ✅ Login authentication
- ✅ Profile creation
- ✅ Admin user detection
- ✅ Data storage verification
- ✅ Security policy validation

## Database Verification

### Check User Creation in Supabase

1. **Go to Supabase Dashboard**
2. **Navigate to Authentication > Users**
3. **Verify user appears** with correct email
4. **Check user metadata** for profile information

### Check Profile Data

1. **Go to Table Editor**
2. **Check `user_profiles` table**
3. **Verify profile record** created with correct user_id reference

### Check Flow Data Tables

1. **Verify RLS policies** are active
2. **Check data isolation** - each user sees only their data
3. **Test admin access** to all user data (future feature)

## Troubleshooting

### "User already exists" Error

- User might already be registered
- Try logging in instead of signing up
- Check Supabase dashboard for existing users

### Admin Privileges Not Working

- Verify email exactly matches: `robert.curlette@gmail.com`
- Check environment variable: `VITE_ADMIN_EMAIL`
- Restart development server after env changes

### Data Not Persisting

- Check Supabase connection
- Verify RLS policies are configured
- Check browser network tab for API errors

## Next Steps

1. **Create admin account** using the signup flow
2. **Test login** with the created credentials
3. **Verify admin status** in the application
4. **Run unit tests** to ensure everything works
5. **Implement admin panel** features as needed

The admin user will have the same authentication flow as regular users, but with additional privileges based on the email address match.
