-- Helper functions for Supabase

-- Function to increment a column value
CREATE OR REPLACE FUNCTION increment_column(table_name TEXT, column_name TEXT, row_id UUID)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = %L', table_name, column_name, column_name, row_id);
END;
$$ LANGUAGE plpgsql;
