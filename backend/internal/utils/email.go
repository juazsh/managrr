package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
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
	fromEmail := os.Getenv("FROM_EMAIL")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("SMTP configuration missing")
	}

	verificationLink := fmt.Sprintf("%s/verify-email?token=%s", appURL, token)

	subject := "Verify Your Email"
	body := fmt.Sprintf(`
Hello,

Please verify your email by clicking the link below:

%s

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Thanks,
Construction Management Platform Team
`, verificationLink)

	message := []byte(fmt.Sprintf("Subject: %s\r\n\r\n%s", subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

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
	fromEmail := os.Getenv("FROM_EMAIL")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("SMTP configuration missing")
	}

	resetLink := fmt.Sprintf("%s/reset-password?token=%s", appURL, token)

	subject := "Reset Your Password"
	body := fmt.Sprintf(`
Hello,

You requested to reset your password. Click the link below to reset it:

%s

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Thanks,
Construction Management Platform Team
`, resetLink)

	message := []byte(fmt.Sprintf("Subject: %s\r\n\r\n%s", subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

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
	fromEmail := os.Getenv("FROM_EMAIL")
	appURL := os.Getenv("APP_URL")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("SMTP configuration missing")
	}

	subject := "Welcome to the Team"
	body := fmt.Sprintf(`
Hello %s,

You have been added as an employee on our Construction Management Platform.

Your login credentials are:
Email: %s
Temporary Password: %s

Please log in at: %s

For security, we recommend changing your password after your first login.

Thanks,
Construction Management Platform Team
`, name, toEmail, tempPassword, appURL)

	message := []byte(fmt.Sprintf("Subject: %s\r\n\r\n%s", subject, body))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, message)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
