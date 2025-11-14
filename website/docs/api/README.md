# API Documentation

This directory contains documentation about the CRM's API architecture and authentication flows.

## Contents

- **[AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)** - Complete OAuth implementation with Auth0
  - User authentication flow
  - JWT token management
  - Integration with Supabase RLS

## API Philosophy

The CRM API follows RESTful principles with a focus on:
- Security-first approach with OAuth and JWT
- Row Level Security integration
- Consistent error handling
- Comprehensive request/response logging