"use client"

import { useState } from "react"
import { theme } from "../../theme"
import contactHero from "../../assets/images/undraw_add-information_06qr.svg"

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const mailtoLink = `mailto:support@managrr.com?subject=${encodeURIComponent(
      `[${formData.subject}] ${formData.name}`,
    )}&body=${encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`

    window.location.href = mailtoLink

    setSubmitted(true)
    setFormData({
      name: "",
      email: "",
      subject: "general",
      message: "",
    })

    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroBadge}>💬 We're Here to Help</div>
          <h1 style={styles.title}>Contact Us</h1>
          <p style={styles.subtitle}>Have questions? We typically respond within 24 hours</p>
          <div style={styles.heroImageContainer}>
            <img src={contactHero || "/placeholder.svg"} alt="Contact Us" style={styles.heroImage} />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.contentGrid}>
            <div style={styles.formContainer}>
              <h2 style={styles.formTitle}>Send Us a Message</h2>

              {submitted && (
                <div style={styles.successMessage}>
                  ✓ Your email client should open. If not, please email us directly at support@managrr.com
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="name">
                    Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="Your name"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="email">
                    Email <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="subject">
                    Subject <span style={styles.required}>*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={styles.select}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Support</option>
                    <option value="sales">Sales</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="message">
                    Message <span style={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    style={styles.textarea}
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button type="submit" style={styles.submitButton}>
                  Send Message
                </button>
              </form>
            </div>

            <div style={styles.infoContainer}>
              <div style={styles.infoCardPrimary}>
                <h3 style={styles.infoTitle}>📧 Email Us Directly</h3>
                <p style={styles.infoText}>For immediate assistance, you can email us at:</p>
                <a href="mailto:support@managrr.com" style={styles.emailLink}>
                  support@managrr.com
                </a>
                <p style={styles.responseTime}>⏱️ We typically respond within 24 hours</p>
              </div>

              <div style={styles.infoCard}>
                <h3 style={styles.infoCardTitle}>💬 General Inquiry</h3>
                <p style={styles.infoCardText}>
                  Questions about Managrr, our features, or how we can help your project
                </p>
              </div>

              <div style={styles.infoCard}>
                <h3 style={styles.infoCardTitle}>🛠️ Support</h3>
                <p style={styles.infoCardText}>Technical issues, account problems, or help using the platform</p>
              </div>

              <div style={styles.infoCard}>
                <h3 style={styles.infoCardTitle}>💼 Sales</h3>
                <p style={styles.infoCardText}>Pricing questions, plan comparisons, or enterprise inquiries</p>
              </div>

              <div style={styles.infoCard}>
                <h3 style={styles.infoCardTitle}>🤝 Partnership</h3>
                <p style={styles.infoCardText}>Interested in partnering with Managrr or integration opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, backgroundColor: theme.colors.backgroundLight }}>
        <div style={styles.container}>
          <div style={styles.noteBox}>
            <div style={styles.noteIcon}>ℹ️</div>
            <h3 style={styles.noteTitle}>Note on Contact Form</h3>
            <p style={styles.noteText}>
              Currently, clicking "Send Message" will open your email client with a pre-filled message. A dedicated
              contact form with backend integration is planned for version 1.5. For now, you can also email us directly
              at support@managrr.com.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

const styles = {
  page: {
    fontFamily: theme.typography.fontFamily,
  },
  hero: {
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    padding: "clamp(3rem, 8vw, 5rem) 0",
    textAlign: "center",
    color: theme.colors.white,
  },
  heroBadge: {
    display: "inline-block",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: theme.colors.white,
    padding: "0.5rem 1.25rem",
    borderRadius: "50px",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    backdropFilter: "blur(10px)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `0 ${theme.spacing.component}`,
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: "700",
    marginBottom: theme.spacing.element,
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
    opacity: 0.95,
    lineHeight: "1.6",
  },
  heroImageContainer: {
    maxWidth: "350px",
    margin: "2rem auto 0",
  },
  heroImage: {
    width: "100%",
    height: "auto",
    filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))",
  },
  section: {
    padding: "clamp(3rem, 8vw, 5rem) 0",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "clamp(2rem, 5vw, 3rem)",
    alignItems: "start",
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    padding: "clamp(1.5rem, 4vw, 2.5rem)",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    border: `1px solid ${theme.colors.border}`,
  },
  formTitle: {
    fontSize: "clamp(1.5rem, 3vw, 1.75rem)",
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: "2rem",
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "1rem",
    borderRadius: theme.borderRadius.md,
    marginBottom: "1.5rem",
    border: "1px solid #c3e6cb",
    fontSize: "0.9375rem",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.5rem",
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    width: "100%",
    padding: "0.875rem",
    fontSize: "1rem",
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontFamily: theme.typography.fontFamily,
    transition: "all 0.3s ease",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "0.875rem",
    fontSize: "1rem",
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.white,
    transition: "all 0.3s ease",
    outline: "none",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "0.875rem",
    fontSize: "1rem",
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontFamily: theme.typography.fontFamily,
    resize: "vertical",
    transition: "all 0.3s ease",
    outline: "none",
    lineHeight: "1.6",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: "1rem",
    fontSize: "1.125rem",
    fontWeight: "600",
    border: "none",
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: theme.shadows.md,
  },
  infoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  infoCardPrimary: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: "clamp(1.5rem, 3vw, 2rem)",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
  },
  infoTitle: {
    fontSize: "1.375rem",
    fontWeight: "700",
    marginBottom: "1rem",
  },
  infoText: {
    fontSize: "1rem",
    lineHeight: "1.6",
    marginBottom: "1rem",
    opacity: 0.95,
  },
  emailLink: {
    display: "block",
    fontSize: "1.25rem",
    color: theme.colors.white,
    textDecoration: "none",
    fontWeight: "700",
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.md,
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  responseTime: {
    fontSize: "0.9375rem",
    fontStyle: "italic",
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    padding: "1.5rem",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border}`,
    transition: "all 0.3s ease",
  },
  infoCardTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.75rem",
  },
  infoCardText: {
    fontSize: "0.9375rem",
    color: theme.colors.textLight,
    lineHeight: "1.6",
  },
  noteBox: {
    backgroundColor: theme.colors.white,
    padding: "clamp(1.5rem, 4vw, 2rem)",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
    border: `1px solid ${theme.colors.border}`,
  },
  noteIcon: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  noteTitle: {
    fontSize: "1.375rem",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "1rem",
  },
  noteText: {
    fontSize: "1rem",
    color: theme.colors.textLight,
    lineHeight: "1.7",
  },
}
