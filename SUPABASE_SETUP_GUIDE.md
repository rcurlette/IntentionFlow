# FlowTracker Supabase Setup Guide

## 🚀 **Quick Setup (5 Minutes)**

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Choose organization, enter project name: "FlowTracker"
6. Generate a strong password
7. Select region closest to your users
8. Click "Create new project"

### 2. Get Your Credentials

After project creation, find your credentials in the project dashboard:

```
Project URL: https://your-project-ref.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configure Environment Variables

Create `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Database Migrations

```bash
# Install Supabase CLI (one time)
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 5. Configure Google OAuth

1. In Supabase dashboard, go to Authentication > Settings
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: Get from Google Cloud Console
   - Client Secret: Get from Google Cloud Console

### 6. Set Redirect URLs

In Authentication > Settings > Redirect URLs, add:

```
http://localhost:5173 (for development)
https://your-domain.com (for production)
```

## 🔧 **Detailed Configuration**

### Google OAuth Setup

1. **Google Cloud Console:**

   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```

2. **Supabase Configuration:**
   - Copy Client ID and Secret to Supabase
   - Save configuration

### Database Schema

Your migrations will create these tables:

```sql
-- Core tables
- tasks (with user_id)
- day_plans (with user_id)
- pomodoro_sessions (with user_id)

-- New tables
- user_profiles
- evening_reflections

-- Features
- Row Level Security (RLS) enabled
- User-specific data isolation
- Automatic profile creation
```

### Security Configuration

1. **Row Level Security:**

   ```sql
   -- All tables have RLS enabled
   -- Users can only access their own data
   -- Policies automatically enforce user_id checks
   ```

2. **Authentication Settings:**
   ```
   - Email confirmation: Optional (can be disabled for faster onboarding)
   - Password requirements: Minimum 6 characters
   - JWT expiry: 3600 seconds (1 hour)
   - Refresh token expiry: 2592000 seconds (30 days)
   ```

## 🧪 **Testing Your Setup**

### 1. Test Database Connection

```bash
# Run development server
npm run dev

# Check browser console for errors
# Should see: "Supabase initialized successfully"
```

### 2. Test Authentication

1. Go to your app
2. Try signing up with email
3. Check Supabase dashboard > Authentication > Users
4. Should see new user created

### 3. Test Google OAuth

1. Click "Continue with Google"
2. Complete OAuth flow
3. Should be redirected back to app
4. User should appear in Supabase dashboard

### 4. Test Data Isolation

1. Create account A, add some tasks
2. Sign out, create account B
3. Account B should not see account A's data

## 🚨 **Troubleshooting**

### Common Issues

**1. "Invalid API key" error:**

```bash
# Check your .env file
# Ensure VITE_ prefix is present
# Restart development server after changes
```

**2. CORS errors:**

```bash
# Check if your domain is in Supabase settings
# For localhost, add: http://localhost:5173
```

**3. OAuth redirect issues:**

```bash
# Verify redirect URLs in both:
# - Google Cloud Console
# - Supabase dashboard
```

**4. Database connection issues:**

```bash
# Run migrations:
supabase db push

# Check project status:
supabase status
```

**5. Users can see other users' data:**

```sql
-- Check RLS is enabled:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Should show rowsecurity = true for all tables
```

### Environment-Specific Issues

**Development:**

```env
# Use localhost URL
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
# Development server: http://localhost:5173
```

**Production:**

```env
# Use production domain
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
# Production site: https://your-domain.com
```

## 📊 **Monitoring Your Setup**

### Supabase Dashboard Metrics

Monitor these in your dashboard:

1. **Authentication:**

   - Total users
   - Sign-ups per day
   - Authentication errors

2. **Database:**

   - Connection count
   - Query performance
   - Storage usage

3. **API:**
   - Request count
   - Response times
   - Error rates

### Health Check Endpoint

Test your setup:

```bash
curl https://your-project-ref.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"

# Should return API information
```

## 🎯 **Production Checklist**

Before going live:

- [ ] ✅ Project created and configured
- [ ] ✅ Environment variables set
- [ ] ✅ Database migrations applied
- [ ] ✅ Google OAuth configured
- [ ] ✅ Redirect URLs updated for production domain
- [ ] ✅ RLS policies tested
- [ ] ✅ User registration flow tested
- [ ] ✅ Data isolation verified
- [ ] ✅ API endpoints responding correctly
- [ ] ✅ Email settings configured (if using email auth)

## 💡 **Tips & Best Practices**

### Performance

- Use indexes on frequently queried columns
- Optimize queries with `select()` to limit data
- Enable connection pooling for high traffic

### Security

- Regularly rotate API keys
- Monitor authentication logs
- Set up alerts for unusual activity
- Keep Supabase client library updated

### Maintenance

- Regular database backups (automatic in Supabase)
- Monitor storage usage
- Review and optimize slow queries
- Update user profiles periodically

## 🆘 **Getting Help**

If you encounter issues:

1. **Check Supabase Logs:**

   - Dashboard > Settings > Logs
   - Look for authentication and database errors

2. **Community Support:**

   - [Supabase Discord](https://discord.supabase.com)
   - [GitHub Discussions](https://github.com/supabase/supabase/discussions)

3. **Documentation:**
   - [Supabase Docs](https://supabase.com/docs)
   - [Authentication Guide](https://supabase.com/docs/guides/auth)

---

## ✅ **You're All Set!**

With this setup complete, your FlowTracker app will have:

- Secure user authentication
- Multi-user data isolation
- Production-ready database
- Scalable architecture

Total setup time: **~15 minutes** for experienced developers, **~30 minutes** for first-time Supabase users.
