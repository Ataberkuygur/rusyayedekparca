# Database Setup Guide

This directory contains the database schema, migrations, and seed data for the car parts e-commerce application.

## Structure

```
database/
├── migrations/
│   └── 001_initial_schema.sql    # Initial database schema
├── seeds/
│   └── 001_initial_data.sql      # Sample data for development
├── functions/
│   └── update_product_quantity.sql # Database functions
└── README.md                     # This file
```

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run Database Migrations

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Run the migration to create all tables, indexes, and triggers

### 3. Create Database Functions

1. In the SQL Editor, copy and paste the contents of `functions/update_product_quantity.sql`
2. Run the function creation script

### 4. Seed Initial Data (Optional)

1. In the SQL Editor, copy and paste the contents of `seeds/001_initial_data.sql`
2. Run the seed script to populate the database with sample data

## Database Schema Overview

### Core Tables

- **users**: User profiles (extends Supabase auth.users)
- **addresses**: User shipping and billing addresses
- **product_categories**: Product categorization hierarchy
- **products**: Car parts inventory
- **product_images**: Product image gallery
- **vehicle_compatibility**: Vehicle compatibility data
- **cart_items**: Shopping cart contents
- **orders**: Customer orders
- **order_items**: Individual items within orders

### Key Features

- **UUID Primary Keys**: All tables use UUID for better security and scalability
- **Automatic Timestamps**: Created/updated timestamps with triggers
- **Data Validation**: Check constraints for data integrity
- **Optimized Indexes**: Performance indexes for common queries
- **Full-Text Search**: Search indexes for product discovery
- **Referential Integrity**: Foreign key constraints with appropriate cascade rules

### Security

- **Row Level Security (RLS)**: Enable RLS policies in Supabase dashboard
- **User Isolation**: Users can only access their own data
- **Admin Access**: Admin users have elevated permissions
- **Secure Functions**: Database functions use SECURITY DEFINER

## Environment Variables

Required environment variables for the application:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development Workflow

1. **Schema Changes**: Update migration files and run in Supabase SQL Editor
2. **Type Generation**: Regenerate TypeScript types after schema changes
3. **Testing**: Use seed data for consistent testing environment
4. **Backup**: Regular database backups through Supabase dashboard

## Production Considerations

- Enable Row Level Security (RLS) policies
- Set up database backups
- Monitor query performance
- Configure connection pooling
- Set up monitoring and alerting

## Troubleshooting

### Common Issues

1. **Migration Errors**: Check for syntax errors and dependency order
2. **Permission Errors**: Verify RLS policies and user roles
3. **Performance Issues**: Check query plans and index usage
4. **Data Integrity**: Validate foreign key relationships

### Useful Queries

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public';

-- Monitor active connections
SELECT * FROM pg_stat_activity;

-- Check index usage
SELECT 
  indexrelname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes;
```

## Support

For database-related issues:
1. Check Supabase documentation
2. Review error logs in Supabase dashboard
3. Verify environment variables
4. Test with sample data