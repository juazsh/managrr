package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/smtp"
	"os"
)

func GenerateVerificationToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func SendVerificationEmail(toEmail, token string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	log.Printf("📧 EMAIL CONFIG CHECK:")
	log.Printf("  SMTP_HOST: %s", smtpHost)
	log.Printf("  SMTP_PORT: %s", smtpPort)
	log.Printf("  SMTP_USER: %s", smtpUser)
	log.Printf("  SMTP_PASS: %s", maskPassword(smtpPass))
	log.Printf("  APP_URL: %s", appURL)
	log.Printf("  Recipient: %s", toEmail)

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing!")
		return fmt.Errorf("SMTP configuration missing")
	}

	verificationLink := fmt.Sprintf("%s/verify-email?token=%s", appURL, token)

	subject := "Verify Your Email - Managrr"
	body := fmt.Sprintf(`
Hello,

Please verify your email by clicking the link below:

%s

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Thanks,
Managrr Team
`, verificationLink)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Attempting to send verification email to %s via %s", toEmail, addr)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ SMTP ERROR: Failed to send verification email to %s: %v", toEmail, err)
		log.Printf("   Host: %s, Port: %s, User: %s", smtpHost, smtpPort, smtpUser)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Verification email sent successfully to %s", toEmail)
	return nil
}

func GenerateResetToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func SendPasswordResetEmail(toEmail, token string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	log.Printf("📧 PASSWORD RESET EMAIL CONFIG CHECK:")
	log.Printf("  SMTP_HOST: %s", smtpHost)
	log.Printf("  SMTP_PORT: %s", smtpPort)
	log.Printf("  SMTP_USER: %s", smtpUser)
	log.Printf("  SMTP_PASS: %s", maskPassword(smtpPass))
	log.Printf("  APP_URL: %s", appURL)
	log.Printf("  Recipient: %s", toEmail)

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing!")
		return fmt.Errorf("SMTP configuration missing")
	}

	resetLink := fmt.Sprintf("%s/reset-password?token=%s", appURL, token)

	subject := "Reset Your Password - Managrr"
	body := fmt.Sprintf(`
Hello,

You requested to reset your password. Click the link below to reset it:

%s

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Thanks,
Managrr Team
`, resetLink)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Attempting to send password reset email to %s via %s", toEmail, addr)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ SMTP ERROR: Failed to send password reset email to %s: %v", toEmail, err)
		log.Printf("   Host: %s, Port: %s, User: %s", smtpHost, smtpPort, smtpUser)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Password reset email sent successfully to %s", toEmail)
	return nil
}

func GenerateRandomPassword() (string, error) {
	const passwordLength = 12
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"

	password := make([]byte, passwordLength)
	for i := range password {
		randomByte := make([]byte, 1)
		if _, err := rand.Read(randomByte); err != nil {
			return "", err
		}
		password[i] = charset[int(randomByte[0])%len(charset)]
	}

	return string(password), nil
}

func SendEmployeeWelcomeEmail(toEmail, name, tempPassword string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	log.Printf("📧 EMPLOYEE WELCOME EMAIL CONFIG CHECK:")
	log.Printf("  SMTP_HOST: %s", smtpHost)
	log.Printf("  SMTP_PORT: %s", smtpPort)
	log.Printf("  SMTP_USER: %s", smtpUser)
	log.Printf("  SMTP_PASS: %s", maskPassword(smtpPass))
	log.Printf("  APP_URL: %s", appURL)
	log.Printf("  Recipient: %s", toEmail)

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing!")
		return fmt.Errorf("SMTP configuration missing")
	}

	subject := "Welcome to Managrr - Your Account Details"
	body := fmt.Sprintf(`
Hello %s,

You have been added as an employee on Managrr.

Your login credentials are:
Email: %s
Temporary Password: %s

Please log in at: %s

For security, we recommend changing your password after your first login.

Thanks,
Managrr Team
`, name, toEmail, tempPassword, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Attempting to send employee welcome email to %s via %s", toEmail, addr)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ SMTP ERROR: Failed to send employee welcome email to %s: %v", toEmail, err)
		log.Printf("   Host: %s, Port: %s, User: %s", smtpHost, smtpPort, smtpUser)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Employee welcome email sent successfully to %s", toEmail)
	return nil
}

func maskPassword(pass string) string {
	if pass == "" {
		return "(not set)"
	}
	if len(pass) <= 4 {
		return "****"
	}
	return pass[:2] + "************" + pass[len(pass)-2:]
}

func SendPhotoUploadNotification(toEmail, toName, uploaderName, uploaderType, projectTitle string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing for photo upload notification")
		return fmt.Errorf("SMTP configuration missing")
	}

	subject := fmt.Sprintf("New Photo Uploaded - %s", projectTitle)
	body := fmt.Sprintf(`
Hello %s,

%s (%s) has uploaded a new photo to the project "%s".

You can view the photo in your project dashboard at: %s

Thanks,
Managrr Team
`, toName, uploaderName, uploaderType, projectTitle, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Sending photo upload notification to %s", toEmail)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ Failed to send photo upload notification to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Photo upload notification sent to %s", toEmail)
	return nil
}

func SendExpenseAddedNotification(toEmail, toName, adderName, adderType, projectTitle string, amount float64, category, description string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing for expense notification")
		return fmt.Errorf("SMTP configuration missing")
	}

	descText := description
	if descText == "" {
		descText = "No description provided"
	}

	subject := fmt.Sprintf("New Expense Added - %s", projectTitle)
	body := fmt.Sprintf(`
Hello %s,

%s (%s) has added a new expense to the project "%s".

Expense Details:
- Amount: $%.2f
- Category: %s
- Description: %s

You can view all expenses in your project dashboard at: %s

Thanks,
Managrr Team
`, toName, adderName, adderType, projectTitle, amount, category, descText, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Sending expense added notification to %s", toEmail)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ Failed to send expense added notification to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Expense added notification sent to %s", toEmail)
	return nil
}

func SendExpenseUpdatedNotification(toEmail, toName, updaterName, updaterType, projectTitle string, amount float64, category, description string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing for expense update notification")
		return fmt.Errorf("SMTP configuration missing")
	}

	descText := description
	if descText == "" {
		descText = "No description provided"
	}

	subject := fmt.Sprintf("Expense Updated - %s", projectTitle)
	body := fmt.Sprintf(`
Hello %s,

%s (%s) has updated an expense in the project "%s".

Updated Expense Details:
- Amount: $%.2f
- Category: %s
- Description: %s

You can view all expenses in your project dashboard at: %s

Thanks,
Managrr Team
`, toName, updaterName, updaterType, projectTitle, amount, category, descText, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Sending expense updated notification to %s", toEmail)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ Failed to send expense updated notification to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Expense updated notification sent to %s", toEmail)
	return nil
}

func SendPaymentAddedNotification(toEmail, toName, ownerName, projectTitle string, amount float64, paymentMethod, paymentDate string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing for payment notification")
		return fmt.Errorf("SMTP configuration missing")
	}

	subject := fmt.Sprintf("Payment Awaiting Confirmation - %s", projectTitle)
	body := fmt.Sprintf(`
Hello %s,

%s has recorded a payment for the project "%s" that requires your confirmation.

Payment Details:
- Amount: $%.2f
- Payment Method: %s
- Payment Date: %s

Please log in to your dashboard to confirm or dispute this payment: %s

Thanks,
Managrr Team
`, toName, ownerName, projectTitle, amount, paymentMethod, paymentDate, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Sending payment added notification to %s", toEmail)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ Failed to send payment added notification to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Payment added notification sent to %s", toEmail)
	return nil
}

func SendPaymentConfirmedNotification(toEmail, toName, contractorName, projectTitle string, amount float64, paymentDate string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing for payment confirmation notification")
		return fmt.Errorf("SMTP configuration missing")
	}

	subject := fmt.Sprintf("Payment Confirmed - %s", projectTitle)
	body := fmt.Sprintf(`
Hello %s,

Good news! %s has confirmed the payment for the project "%s".

Payment Details:
- Amount: $%.2f
- Payment Date: %s
- Status: Confirmed

You can view the payment details in your project dashboard at: %s

Thanks,
Managrr Team
`, toName, contractorName, projectTitle, amount, paymentDate, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Sending payment confirmed notification to %s", toEmail)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ Failed to send payment confirmed notification to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Payment confirmed notification sent to %s", toEmail)
	return nil
}

func SendPaymentDisputedNotification(toEmail, toName, contractorName, projectTitle string, amount float64, paymentDate, disputeReason string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing for payment dispute notification")
		return fmt.Errorf("SMTP configuration missing")
	}

	subject := fmt.Sprintf("Payment Disputed - %s", projectTitle)
	body := fmt.Sprintf(`
Hello %s,

%s has disputed a payment for the project "%s".

Payment Details:
- Amount: $%.2f
- Payment Date: %s
- Status: Disputed
- Reason: %s

Please log in to your dashboard to review and resolve this dispute: %s

Thanks,
Managrr Team
`, toName, contractorName, projectTitle, amount, paymentDate, disputeReason, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Sending payment disputed notification to %s", toEmail)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ Failed to send payment disputed notification to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Payment disputed notification sent to %s", toEmail)
	return nil
}

func SendProjectUpdateNotification(toEmail, toName, contractorName, projectTitle, updateType, content string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	fromEmail := os.Getenv("SMTP_USER")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("❌ ERROR: SMTP configuration missing for project update notification")
		return fmt.Errorf("SMTP configuration missing")
	}

	updateTypeText := "update"
	if updateType == "daily_summary" {
		updateTypeText = "Daily Summary"
	} else if updateType == "weekly_plan" {
		updateTypeText = "Weekly Plan"
	}

	subject := fmt.Sprintf("New Project Update - %s", projectTitle)
	body := fmt.Sprintf(`
Hello %s,

%s has posted a new %s for the project "%s".

Update Content:
%s

You can view the full update with photos in your project dashboard at: %s

Thanks,
Managrr Team
`, toName, contractorName, updateTypeText, projectTitle, content, appURL)

	message := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", fromEmail, toEmail, subject, body))
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	log.Printf("📤 Sending project update notification to %s", toEmail)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		log.Printf("❌ Failed to send project update notification to %s: %v", toEmail, err)
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("✅ Project update notification sent to %s", toEmail)
	return nil
}
