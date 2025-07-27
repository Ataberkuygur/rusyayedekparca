# Environment Setup Guide

This guide will help you set up the required environment variables for the car parts e-commerce application.

## Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Shopier Account** - Register at [shopier.com](https://shopier.com) (for Turkish payments)
3. **Email Account** - For sending notifications

## Environment Variables Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the following values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Key (anon/public)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Set Up Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Run the migration files in order:
   ```
   database/migrations/001_initial_schema.sql
   database/migrations/002_user_profile_schema.sql
   database/migrations/003_admin_schema.sql
   ```
3. Run the seed data:
   ```
   database/seeds/001_initial_data.sql
   ```

### 4. Configure Shopier Payment Gateway

1. Log into your [Shopier Merchant Panel](https://merchant.shopier.com)
2. Go to **API Settings**
3. Copy the following values:
   - **API Key** → `SHOPIER_API_KEY`
   - **API Secret** → `SHOPIER_API_SECRET`
   - **Merchant ID** → `SHOPIER_MERCHANT_ID`

### 5. Configure Email Settings

For Gmail (recommended):
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [instructions](https://support.google.com/mail/answer/185833)
3. Update `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-generated-app-password
   ```

### 6. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the result to `NEXTAUTH_SECRET` in `.env.local`.

## Development Mode

For development without full setup, the application will run with limited functionality:
- Authentication will be disabled
- Payments will show mock responses
- Email notifications will be logged to console

## Production Deployment

1. Set `NODE_ENV=production`
2. Update `NEXTAUTH_URL` to your production domain
3. Ensure all environment variables are configured
4. Set up proper HTTPS certificates

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check `.env.local` exists and has correct variable names
   - Restart development server after adding variables

2. **Database connection errors**
   - Verify Supabase project is active
   - Check database URL and credentials
   - Ensure migrations have been run

3. **Payment integration errors**
   - Verify Shopier API credentials
   - Check merchant account status
   - Test with Shopier sandbox first

## Support

For additional help:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Shopier API Documentation](https://shopier.com/api)
- Open an issue in the project repository
