UPDATE expenses e
SET contract_id = c.id
FROM contracts c
WHERE e.project_id = c.project_id
  AND e.contract_id IS NULL
  AND (
    e.added_by = c.contractor_id
    OR e.added_by IN (
      SELECT emp.user_id
      FROM employees emp
      WHERE emp.contractor_id = c.contractor_id
    )
  );
