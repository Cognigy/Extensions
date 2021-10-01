# Supabase

With this Extension, the open-source database [Supabase](https://supabase.io/) can be connected to a Cognigy.AI virtual agent in order to retrieve **data** or **files** from the database or storage.

## Connection

One has to provide the

- **SupabaseURL** and
- **SupabaseKey**

in a Connection in order to authenticate the virtual agent. Please find more information about the authentication here: https://supabase.io/docs/guides/auth

## Nodes

All Flow Nodes follow the API documentation of Supabase:

- Database
    - [Insert](https://supabase.io/docs/reference/javascript/insert)
    - [Select](https://supabase.io/docs/reference/javascript/select)
- Storage
    - [Get Public URL](https://supabase.io/docs/reference/javascript/storage-from-getpublicurl)
    - [List Files](https://supabase.io/docs/reference/javascript/storage-from-list)
