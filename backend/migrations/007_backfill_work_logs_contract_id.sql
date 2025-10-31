UPDATE work_logs wl
SET contract_id = c.id
FROM contracts c
JOIN employees e ON e.contractor_id = c.contractor_id
WHERE wl.project_id = c.project_id
  AND wl.employee_id = e.user_id
  AND wl.contract_id IS NULL;
