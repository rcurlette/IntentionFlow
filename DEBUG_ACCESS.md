# Debug Access Instructions

## Accessing Debug Page

Since you're experiencing authentication issues, you can access the debug dashboard directly:

### Local Development:

```
http://localhost:5173/debug
```

### Production (Fly.dev):

```
https://475f29e31bfa4eb4bfb36e6fa854e10c-7fe27e975e3342169c8b8c25b.fly.dev/debug
```

## What the Debug Page Does

1. **Environment Check**: Verifies all required environment variables are set
2. **Network Test**: Tests basic internet connectivity
3. **Supabase Connectivity**: Tests if your Supabase instance is reachable
4. **Auth Service Test**: Checks if Supabase authentication service is working
5. **CORS Test**: Verifies CORS configuration

## Quick Diagnosis

Based on your error (`TypeError: Failed to fetch`), the most likely causes are:

### 1. **Environment Variables Missing in Production**

Your local .env file isn't deployed to Fly.dev. You need to set environment variables in your deployment.

**For Fly.dev:**

```bash
fly secrets set VITE_SUPABASE_URL=https://iqxkrkzdvepjufmvjdaf.supabase.co
fly secrets set VITE_SUPABASE_ANON_KEY=your_anon_key_here
fly secrets set VITE_ADMIN_EMAIL=robert.curlette@gmail.com
```

### 2. **Supabase CORS Configuration**

Your production domain needs to be added to Supabase allowed origins:

**In Supabase Dashboard:**

1. Go to Authentication > Settings
2. Add your production URL to "Site URL" and "Additional URLs":
   - `https://475f29e31bfa4eb4bfb36e6fa854e10c-7fe27e975e3342169c8b8c25b.fly.dev`

### 3. **Network/Service Issues**

- Supabase service might be temporarily down
- Network connectivity issues
- DNS resolution problems

## Immediate Troubleshooting Steps

1. **Visit the debug page** to see detailed diagnostics
2. **Check environment variables** in production
3. **Verify Supabase configuration** in dashboard
4. **Test with a simple curl command**:
   ```bash
   curl -v https://iqxkrkzdvepjufmvjdaf.supabase.co/rest/v1/
   ```

## Enhanced Error Logging

I've added enhanced error logging to the auth system. Check your browser console for detailed error information when attempting to sign up.

## Alternative Testing

If authentication continues to fail, you can:

1. **Test locally first** - ensure it works in development
2. **Use the debug page** to identify the specific issue
3. **Check Supabase project status** in their dashboard
4. **Verify all environment variables** are properly set in production

The debug page will provide specific guidance based on what tests pass or fail.
