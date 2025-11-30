# Supabase Setup Instructions

## Setting up your Supabase Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw

2. Navigate to **Database > SQL Editor**

3. Copy and run the SQL commands from `supabase-schema.sql` to create the necessary CRM tables

4. After running the SQL, you should have the following tables:
   - `contacts` - Store customer contact information
   - `companies` - Store company information
   - `deals` - Track sales opportunities
   - `interactions` - Log all customer interactions

## Testing the Connection

Once you've created the tables in your Supabase dashboard, you can test the connection by running:

```bash
node test-supabase-contacts.js
```

This will insert sample data into your newly created contacts table.

## Using Supabase in Your Application

The backend now includes:
- A Supabase client configuration in `backend/config/supabase-client.js`
- A sample contact service in `backend/services/supabase-contact-service.js`
- Health check that verifies the Supabase connection

## Environment Variables

Your `.env` file should contain your Supabase credentials. See `.env.example` for the required variables.
- `VITE_SUPABASE_URL=your_supabase_project_url`
- `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`

## Notes about Row Level Security (RLS)

The SQL script enables RLS on all tables with permissive policies for testing. For production use, you should configure more restrictive policies based on your application's authentication system.