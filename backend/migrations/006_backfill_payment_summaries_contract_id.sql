UPDATE payment_summaries ps
SET contract_id = c.id
FROM contracts c
WHERE ps.project_id = c.project_id
  AND ps.contract_id IS NULL
  AND ps.confirmed_by = c.contractor_id;

UPDATE payment_summaries ps
SET contract_id = (
    SELECT c.id
    FROM contracts c
    WHERE c.project_id = ps.project_id
    LIMIT 1
)
WHERE ps.contract_id IS NULL
  AND ps.confirmed_by IS NULL
  AND (
    SELECT COUNT(*)
    FROM contracts c
    WHERE c.project_id = ps.project_id
  ) = 1;
