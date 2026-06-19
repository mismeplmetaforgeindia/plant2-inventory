-- =============================================================================
-- Allow free-form rack codes (e.g. R1-C1) on fifo_batches.
-- The original schema had a FK to rack_locations; drop it so any code can be
-- typed from the FIFO board. (rack_locations remains as an optional reference.)
-- Writes happen via the server API route using the service_role key, which
-- bypasses RLS, so no extra write policy is needed.
-- =============================================================================
alter table fifo_batches drop constraint if exists fifo_batches_rack_number_fkey;
