import { Link } from "react-router-dom"
import { theme } from "../../theme"
import ownersImg from "../../assets/images/undraw_houses_owky.svg"
import contractorsImg from "../../assets/images/undraw_construction-workers_z99i.svg"
import employeesImg from "../../assets/images/undraw_ordinary-day_ak4e.svg"

export const HowItWorks = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.badge}>Simple & Transparent</div>
          <h1 style={styles.title}>How Managrr Works</h1>
          <p style={styles.subtitle}>Project management made simple for house owners, contractors, and employees</p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.roleIcon}>🏠</div>
            <h2 style={styles.sectionTitle}>For House Owners</h2>
            <p style={styles.sectionSubtitle}>Stay informed and in control of your construction project</p>
          </div>

          <div style={styles.imageContainer}>
            <img src={ownersImg || "/placeholder.svg"} alt="For House Owners" style={styles.sectionImage} />
          </div>

          <div style={styles.steps}>
            {[
              {
                number: 1,
                title: "Create Your Project",
                text: "Sign up for free and create a project with details, estimated budget, and photos. No credit card required to start.",
                icon: "📝",
              },
              {
                number: 2,
                title: "Invite Your Contractor",
                text: "Send an email invitation to your contractor. They'll get access to the project and can start tracking work immediately.",
                icon: "✉️",
              },
              {
                number: 3,
                title: "Track Everything in Real-Time",
                text: "See daily progress updates with photos, monitor expenses as they happen, track employee work hours, and record all payments—all from your dashboard.",
                icon: "📊",
              },
              {
                number: 4,
                title: "Record Payments",
                text: "Every time you pay your contractor, record it in the system with amount, payment method, and optional screenshot proof. Your contractor confirms receipt to create an indisputable payment history.",
                icon: "💳",
              },
            ].map((step) => (
              <div key={step.number} style={styles.step}>
                <div style={styles.stepIcon}>{step.icon}</div>
                <div style={styles.stepNumber}>{step.number}</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, backgroundColor: theme.colors.backgroundLight }}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.roleIcon}>👷</div>
            <h2 style={styles.sectionTitle}>For Contractors</h2>
            <p style={styles.sectionSubtitle}>Manage projects efficiently and build trust with transparency</p>
          </div>

          <div style={styles.imageContainer}>
            <img src={contractorsImg || "/placeholder.svg"} alt="For Contractors" style={styles.sectionImage} />
          </div>

          <div style={styles.steps}>
            {[
              {
                number: 1,
                title: "Accept Project Assignment",
                text: "Receive email invitation from house owner and accept the project. Review project details and estimated costs.",
                icon: "✅",
              },
              {
                number: 2,
                title: "Add Employees to Project",
                text: "Create employee accounts and assign them to the project. Set their hourly rates for automatic time tracking.",
                icon: "👥",
              },
              {
                number: 3,
                title: "Post Daily Updates",
                text: "Share progress with photos, update work status, and add notes about what was accomplished each day. Keep your client informed.",
                icon: "📸",
              },
              {
                number: 4,
                title: "Track Expenses",
                text: "Upload receipts for materials and costs. Tag who paid (owner or contractor) and categorize expenses. Keep everyone informed about spending.",
                icon: "🧾",
              },
              {
                number: 5,
                title: "Confirm Payments Received",
                text: 'When the house owner records a payment, you\'ll see it immediately. Click "Received" to confirm and lock the payment record. This creates a transparent payment history that protects both parties.',
                icon: "✔️",
              },
            ].map((step) => (
              <div key={step.number} style={styles.step}>
                <div style={styles.stepIcon}>{step.icon}</div>
                <div style={styles.stepNumber}>{step.number}</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div style={styles.roleIcon}>⚒️</div>
            <h2 style={styles.sectionTitle}>For Employees</h2>
            <p style={styles.sectionSubtitle}>Simple check-in/check-out system for accurate time tracking</p>
          </div>

          <div style={styles.imageContainer}>
            <img src={employeesImg || "/placeholder.svg"} alt="For Employees" style={styles.sectionImage} />
          </div>

          <div style={styles.steps}>
            {[
              {
                number: 1,
                title: "Get Added by Contractor",
                text: "Your contractor will create an account for you and assign you to projects. You'll receive login credentials via email.",
                icon: "👤",
              },
              {
                number: 2,
                title: "Check In When You Arrive",
                text: "Use the mobile app to check in when you arrive at the work site. Take a photo and optionally share your GPS location for verification.",
                icon: "⏰",
              },
              {
                number: 3,
                title: "Check Out When You Leave",
                text: "Check out at the end of your shift with another photo. Hours worked are calculated automatically and visible to your contractor.",
                icon: "🏁",
              },
            ].map((step) => (
              <div key={step.number} style={styles.step}>
                <div style={styles.stepIcon}>{step.icon}</div>
                <div style={styles.stepNumber}>{step.number}</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.mobileNote}>
            <div style={styles.mobileNoteIcon}>📱</div>
            <div>
              <h4 style={styles.mobileNoteTitle}>Mobile App Coming Soon!</h4>
              <p style={styles.mobileNoteText}>
                Currently, employees can use the web version on their phones for check-in/out. Native mobile app
                launching in Q2 2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
            <p style={styles.ctaText}>
              Create your free account and start your first project today. No credit card required.
            </p>
            <div style={styles.ctaButtons}>
              <Link to="/register" style={styles.ctaButton}>
                Get Started Free
              </Link>
              <Link to="/features" style={styles.ctaButtonSecondary}>
                View All Features
              </Link>
            </div>
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
    padding: "4rem 0",
    textAlign: "center",
    color: theme.colors.white,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `0 ${theme.spacing.component}`,
  },
  badge: {
    display: "inline-block",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: theme.colors.white,
    padding: "0.5rem 1.5rem",
    borderRadius: "50px",
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: "700",
    marginBottom: theme.spacing.element,
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
    opacity: 0.95,
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  section: {
    padding: "clamp(3rem, 8vw, 5rem) 0",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  roleIcon: {
    fontSize: "3.5rem",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "clamp(2rem, 4vw, 2.75rem)",
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: "1rem",
  },
  sectionSubtitle: {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: theme.colors.textLight,
    maxWidth: "600px",
    margin: "0 auto",
  },
  imageContainer: {
    maxWidth: "450px",
    margin: "0 auto 4rem",
  },
  sectionImage: {
    width: "100%",
    height: "auto",
  },
  steps: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
  },
  step: {
    display: "grid",
    gridTemplateColumns: "auto auto 1fr",
    gap: "1.5rem",
    alignItems: "start",
    padding: "2rem",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },
  stepIcon: {
    fontSize: "2.5rem",
    gridColumn: "1",
  },
  stepNumber: {
    width: "50px",
    height: "50px",
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
    flexShrink: 0,
    gridColumn: "2",
  },
  stepContent: {
    gridColumn: "3",
  },
  stepTitle: {
    fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.75rem",
  },
  stepText: {
    fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
    color: theme.colors.textLight,
    lineHeight: "1.7",
  },
  mobileNote: {
    backgroundColor: theme.colors.white,
    padding: "2rem",
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    maxWidth: "800px",
    margin: "3rem auto 0",
    display: "flex",
    gap: "1.5rem",
    alignItems: "start",
  },
  mobileNoteIcon: {
    fontSize: "3rem",
    flexShrink: 0,
  },
  mobileNoteTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.5rem",
  },
  mobileNoteText: {
    fontSize: "1rem",
    color: theme.colors.textLight,
    lineHeight: "1.6",
    margin: 0,
  },
  ctaSection: {
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
    padding: "clamp(3rem, 8vw, 5rem) 0",
  },
  cta: {
    textAlign: "center",
    color: theme.colors.white,
  },
  ctaTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "700",
    marginBottom: "1rem",
  },
  ctaText: {
    fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
    marginBottom: "2.5rem",
    opacity: 0.95,
    maxWidth: "600px",
    margin: "0 auto 2.5rem",
  },
  ctaButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaButton: {
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    padding: "1rem 2.5rem",
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    fontSize: "1.125rem",
    fontWeight: "600",
    display: "inline-block",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  ctaButtonSecondary: {
    backgroundColor: "transparent",
    color: theme.colors.white,
    padding: "1rem 2.5rem",
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    fontSize: "1.125rem",
    fontWeight: "600",
    display: "inline-block",
    border: `2px solid ${theme.colors.white}`,
    transition: "transform 0.2s, background-color 0.2s",
  },
}
