ALTER TABLE expenses ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_contract_id ON expenses(contract_id);

ALTER TABLE payment_summaries ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payment_summaries_contract_id ON payment_summaries(contract_id);

ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_work_logs_contract_id ON work_logs(contract_id);
