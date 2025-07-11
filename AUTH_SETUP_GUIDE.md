# FlowTracker Authentication Setup Guide

## Current Issues & Solutions

### Issue: "Unsupported provider: provider is not enabled"

This error indicates that Google OAuth is not properly enabled in your Supabase project.

## Step-by-Step Setup Instructions

### 1. Supabase Console Configuration

1. **Go to your Supabase Dashboard**

   - Visit: https://supabase.com/dashboard
   - Select your project: `iqxkrkzdvepjufmvjdaf`

2. **Enable Google OAuth Provider**
   - Navigate to: **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it **ON** (enabled)
   - Configure the settings:
     - **Client ID**: Get from Google Cloud Console
     - **Client Secret**: Get from Google Cloud Console
     - **Redirect URL**: Should be auto-populated as `https://iqxkrkzdvepjufmvjdaf.supabase.co/auth/v1/callback`

### 2. Google Cloud Console Setup

1. **Create/Configure Google OAuth App**

   - Go to: https://console.cloud.google.com/
   - Navigate to: **APIs & Services** → **Credentials**
   - Create **OAuth 2.0 Client ID** or use existing one

2. **Configure OAuth Consent Screen**

   - **Application name**: FlowTracker
   - **User support email**: robert.curlette@gmail.com
   - **Developer contact**: robert.curlette@gmail.com

3. **Set Authorized Redirect URIs**

   ```
   https://iqxkrkzdvepjufmvjdaf.supabase.co/auth/v1/callback
   http://localhost:5173 (for local development)
   ```

4. **Note down credentials**
   - Copy **Client ID** and **Client Secret**
   - Add these to Supabase Google provider settings

### 3. Netlify Deployment Configuration

1. **Environment Variables in Netlify**

   - Go to: Netlify Dashboard → Your Site → **Site Settings** → **Environment Variables**
   - Add these variables:

   ```
   VITE_SUPABASE_URL=https://iqxkrkzdvepjufmvjdaf.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeGtya3pkdmVwanVmbXZqZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzgxNjYsImV4cCI6MjA2NjUxNDE2Nn0.Z-PvKRMu1RNS3R5_DC-IkfYjbEf_27fhkcx9A4l4O7k
   VITE_ADMIN_EMAIL=robert.curlette@gmail.com
   VITE_APP_URL=https://your-netlify-domain.netlify.app
   ```

2. **Update Google OAuth Redirect URIs**
   - Add your Netlify domain to Google Cloud Console authorized URIs
   - Add your Netlify domain to Supabase Auth settings

### 4. Database Schema Verification

Ensure your Supabase database has the required tables by running the SQL from `database-setup.sql`:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'tasks', 'flow_sessions', 'flow_actions', 'user_settings');
```

### 5. Testing Authentication

1. **Local Development**

   - Run: `npm run dev`
   - Visit: http://localhost:5173/auth
   - Try both Google OAuth and Email sign-up

2. **Production Testing**
   - Deploy to Netlify
   - Test auth on production domain
   - Verify redirect URLs work correctly

## Authentication Methods Now Available

### 1. Google OAuth (Primary)

- One-click sign-in with Google account
- Requires Google Cloud Console setup

### 2. Email/Password (Backup)

- Sign up with email and password
- Immediate access without OAuth setup
- Email verification optional

### 3. Admin Access

- Admin user: `robert.curlette@gmail.com`
- Has special privileges in the app
- Can access admin panel (when implemented)

## Troubleshooting Common Issues

### Issue: "Invalid redirect URL"

**Solution**: Ensure redirect URLs in Google Cloud Console match exactly:

- Supabase: `https://iqxkrkzdvepjufmvjdaf.supabase.co/auth/v1/callback`
- Local: `http://localhost:5173`
- Production: `https://your-domain.netlify.app`

### Issue: "Email not confirmed"

**Solution**:

- Check Supabase Auth settings
- Enable "Enable email confirmations" if needed
- Check spam folder for confirmation emails

### Issue: "User already registered"

**Solution**:

- Use Sign In tab instead of Sign Up
- Or reset password if forgotten

### Issue: OAuth popup blocked

**Solution**:

- Allow popups for your domain
- Try disabling popup blockers
- Use email sign-in as alternative

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Admin privileges** are based on email matching
3. **Environment variables** should never be committed to Git
4. **API keys** are public-safe (anon keys only)

## Next Steps After Setup

1. Test authentication thoroughly
2. Verify user profiles are created automatically
3. Check admin access works for robert.curlette@gmail.com
4. Implement admin panel features
5. Add additional OAuth providers if needed (GitHub, Discord, etc.)

## Admin Panel Features (Future)

With admin access configured, you can later implement:

- User management dashboard
- Flow session analytics across all users
- System-wide settings and configuration
- User support and debugging tools
- Database management interface
