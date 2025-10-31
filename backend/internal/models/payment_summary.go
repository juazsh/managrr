package models

import (
	"time"
)

type PaymentMethod string

const (
	PaymentMethodCash         PaymentMethod = "cash"
	PaymentMethodBankTransfer PaymentMethod = "bank_transfer"
	PaymentMethodZelle        PaymentMethod = "zelle"
	PaymentMethodPaypal       PaymentMethod = "paypal"
	PaymentMethodCashApp      PaymentMethod = "cash_app"
	PaymentMethodVenmo        PaymentMethod = "venmo"
	PaymentMethodOther        PaymentMethod = "other"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusConfirmed PaymentStatus = "confirmed"
	PaymentStatusDisputed  PaymentStatus = "disputed"
)

type PaymentSummary struct {
	ID            string        `json:"id"`
	ProjectID     string        `json:"project_id"`
	ContractID    *string       `json:"contract_id,omitempty"`
	Amount        float64       `json:"amount"`
	PaymentMethod PaymentMethod `json:"payment_method"`
	PaymentDate   string        `json:"payment_date"`
	ScreenshotURL *string       `json:"screenshot_url,omitempty"`
	Notes         *string       `json:"notes,omitempty"`
	AddedBy       string        `json:"added_by"`
	Status        PaymentStatus `json:"status"`
	ConfirmedBy   *string       `json:"confirmed_by,omitempty"`
	ConfirmedAt   *time.Time    `json:"confirmed_at,omitempty"`
	DisputedAt    *time.Time    `json:"disputed_at,omitempty"`
	DisputeReason *string       `json:"dispute_reason,omitempty"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
}
