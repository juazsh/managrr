INSERT INTO contracts (project_id, contractor_id, owner_id, status, start_date, created_at, updated_at)
SELECT
    pc.project_id,
    pc.contractor_id,
    p.owner_id,
    'active',
    pc.assigned_at,
    pc.assigned_at,
    pc.assigned_at
FROM project_contractors pc
JOIN projects p ON pc.project_id = p.id
ON CONFLICT (project_id, contractor_id) DO NOTHING;
