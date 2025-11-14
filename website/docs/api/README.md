# API Documentation

This directory contains documentation about the CRM's API architecture and authentication flows.

## Contents

- **[AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)** - Details on Supabase authentication flow
  - User authentication flow
  - JWT token management
  - Integration with Supabase RLS

## API Philosophy

The CRM API follows RESTful principles with a focus on:
- Security-first approach with Supabase Auth and JWT
- Row Level Security integration
- Consistent error handling
- Comprehensive request/response logging