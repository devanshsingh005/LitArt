-- Function to create a storage policy
CREATE OR REPLACE FUNCTION create_storage_policy(
  policy_name TEXT,
  table_name TEXT,
  definition TEXT,
  check_expression TEXT,
  operation TEXT
)
RETURNS void AS $$
DECLARE
  policy_statement TEXT;
BEGIN
  policy_statement := format(
    'CREATE POLICY %I ON storage.%I FOR %s TO authenticated USING (%s)',
    policy_name, table_name, operation, definition
  );
  
  IF operation IN ('INSERT', 'UPDATE') AND check_expression IS NOT NULL THEN
    policy_statement := policy_statement || format(' WITH CHECK (%s)', check_expression);
  END IF;
  
  EXECUTE policy_statement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;