package models

import (
	"time"
)

type ExpenseCategory string

const (
	ExpenseCategoryMaterials ExpenseCategory = "materials"
	ExpenseCategoryLabor     ExpenseCategory = "labor"
	ExpenseCategoryEquipment ExpenseCategory = "equipment"
	ExpenseCategoryOther     ExpenseCategory = "other"
)

type ExpensePaidBy string

const (
	ExpensePaidByContractor ExpensePaidBy = "contractor"
	ExpensePaidByOwner      ExpensePaidBy = "owner"
)

type Expense struct {
	ID              string          `json:"id"`
	ProjectID       string          `json:"project_id"`
	ContractID      *string         `json:"contract_id,omitempty"`
	Amount          float64         `json:"amount"`
	Vendor          *string         `json:"vendor,omitempty"`
	Date            string          `json:"date"`
	Category        ExpenseCategory `json:"category"`
	Description     *string         `json:"description,omitempty"`
	PaidBy          ExpensePaidBy   `json:"paid_by"`
	ReceiptPhotoURL *string         `json:"receipt_photo_url,omitempty"`
	AddedBy         string          `json:"added_by"`
	CreatedAt       time.Time       `json:"created_at"`
}

type CreateExpenseRequest struct {
	ProjectID   string          `json:"project_id"`
	Amount      float64         `json:"amount"`
	Vendor      *string         `json:"vendor,omitempty"`
	Date        string          `json:"date"`
	Category    ExpenseCategory `json:"category"`
	Description *string         `json:"description,omitempty"`
	PaidBy      ExpensePaidBy   `json:"paid_by"`
}
