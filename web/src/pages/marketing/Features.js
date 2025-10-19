import { Link } from "react-router-dom"
import { theme } from "../../theme"
import dashTech from "../../assets/images/undraw_visionary-technology_f6b3.svg"
import employeesImg from "../../assets/images/undraw_construction-workers_z99i.svg"
import timeTrackingImg from "../../assets/images/undraw_ordinary-day_ak4e.svg"
import expenseImg from "../../assets/images/undraw_wallet_diag (1).svg"
import photosImg from "../../assets/images/undraw_add-information_06qr.svg"
import updatesImg from "../../assets/images/undraw_building_burz.svg"
import transparencyImg from "../../assets/images/undraw_small-town_76a2.svg"

export const Features = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroBadge}>✨ All Features Included Free</div>
          <h1 style={styles.title}>Powerful Features for Construction Management</h1>
          <p style={styles.subtitle}>
            Everything you need to manage construction projects with complete transparency and real-time visibility
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>📋</div>
              <h2 style={styles.featureTitle}>Project Dashboard</h2>
              <p style={styles.featureText}>
                A centralized hub where house owners and contractors see the same information in real-time. View project
                status, recent updates, expenses, payments, and employee activity all in one place. No more
                back-and-forth emails or wondering what's happening.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Real-time project overview</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Progress photos timeline</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Daily and weekly updates</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Expense tracking</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Payment history</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Work log summaries</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={dashTech || "/placeholder.svg"} alt="Project Dashboard" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, backgroundColor: theme.colors.backgroundLight }}>
        <div style={styles.container}>
          <div style={{ ...styles.feature, flexDirection: "row-reverse" }}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>👷</div>
              <h2 style={styles.featureTitle}>Employee Management</h2>
              <p style={styles.featureText}>
                Contractors can add employees to their account, assign them to specific projects, and set hourly rates.
                Keep track of your entire crew in one system.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Add unlimited employees</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Assign to multiple projects</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Set hourly rates</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Track employee activity</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>View work history</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={employeesImg || "/placeholder.svg"} alt="Employee Management" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>⏰</div>
              <h2 style={styles.featureTitle}>Time Tracking with Photo Verification</h2>
              <p style={styles.featureText}>
                Employees check in and out with photo verification and optional GPS tracking. Automatic calculation of
                hours worked ensures accurate time records and reduces disputes.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Photo check-in/check-out</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>GPS location stamps</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Automatic hours calculation</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Daily work logs</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Weekly summaries</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Accountability through transparency</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={timeTrackingImg || "/placeholder.svg"} alt="Time Tracking" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, backgroundColor: theme.colors.backgroundLight }}>
        <div style={styles.container}>
          <div style={{ ...styles.feature, flexDirection: "row-reverse" }}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>💰</div>
              <h2 style={styles.featureTitle}>Complete Expense Tracking</h2>
              <p style={styles.featureText}>
                Upload receipt photos and track every expense with detailed categorization. See running totals, filter
                by category or payer, and keep a complete financial record of your project. No more lost receipts or
                forgotten costs.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Receipt photo uploads</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Categorize by materials, labor, equipment</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Track who paid (owner/contractor)</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Running totals by category</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Date range filtering</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Expense breakdown reports</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={expenseImg || "/placeholder.svg"} alt="Expense Tracking" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>💳</div>
              <h2 style={styles.featureTitle}>Payment Summary & Tracking</h2>
              <p style={styles.featureText}>
                House owners record every payment made to contractors with full transparency. Contractors confirm
                receipt to lock the record, creating an indisputable payment history. Track payment methods, dates, and
                amounts all in one place.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Record payments with proof</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Multiple payment methods</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Contractor confirmation system</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Payment screenshot uploads</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Running total of confirmed payments</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Complete payment history</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={expenseImg || "/placeholder.svg"} alt="Payment Tracking" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, backgroundColor: theme.colors.backgroundLight }}>
        <div style={styles.container}>
          <div style={{ ...styles.feature, flexDirection: "row-reverse" }}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>📷</div>
              <h2 style={styles.featureTitle}>Progress Photo Documentation</h2>
              <p style={styles.featureText}>
                Create a visual timeline of your project's progress. Upload photos with captions to document work as it
                happens. Perfect for insurance, quality assurance, and keeping house owners informed.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Unlimited photo uploads</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Add captions and notes</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Chronological timeline view</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Before and after documentation</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Shared between owner and contractor</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={photosImg || "/placeholder.svg"} alt="Progress Photos" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>📝</div>
              <h2 style={styles.featureTitle}>Daily & Weekly Updates</h2>
              <p style={styles.featureText}>
                Contractors post daily summaries and weekly plans to keep house owners in the loop. Add multiple photos
                to each update and provide detailed progress notes. Communication that builds trust.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Daily progress summaries</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Weekly work plans</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Multiple photos per update</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Instant notifications</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Update history timeline</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={updatesImg || "/placeholder.svg"} alt="Project Updates" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, backgroundColor: theme.colors.backgroundLight }}>
        <div style={styles.container}>
          <div style={{ ...styles.feature, flexDirection: "row-reverse" }}>
            <div style={styles.featureContent}>
              <div style={styles.featureIconLarge}>🤝</div>
              <h2 style={styles.featureTitle}>Complete Transparency</h2>
              <p style={styles.featureText}>
                The biggest challenge in construction projects is miscommunication and hidden information. With Managrr,
                all parties see the same information at the same time. No surprises, no hidden costs, no
                miscommunication. Build trust through transparency.
              </p>
              <div style={styles.featureListContainer}>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Shared view of all project data</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Real-time updates for everyone</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>No information asymmetry</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Payment confirmation system</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Build trust through openness</span>
                </div>
                <div style={styles.featureListItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>Reduce disputes and misunderstandings</span>
                </div>
              </div>
            </div>
            <div style={styles.featureMockup}>
              <img src={transparencyImg || "/placeholder.svg"} alt="Transparency" style={styles.mockupImage} />
            </div>
          </div>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Start Using These Features Today</h2>
            <p style={styles.ctaText}>All features available on the free tier—no credit card required</p>
            <div style={styles.ctaButtons}>
              <Link to="/register" style={styles.ctaButtonPrimary}>
                Create Free Account
              </Link>
              <Link to="/how-it-works" style={styles.ctaButtonSecondary}>
                See How It Works
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
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: "1.6",
    opacity: 0.95,
  },
  section: {
    padding: "clamp(3rem, 8vw, 5rem) 0",
  },
  feature: {
    display: "flex",
    flexDirection: "row",
    gap: "clamp(2rem, 5vw, 4rem)",
    alignItems: "center",
    marginBottom: "2rem",
    "@media (max-width: 768px)": {
      flexDirection: "column",
    },
  },
  featureContent: {
    flex: "1",
    minWidth: "300px",
  },
  featureIconLarge: {
    fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
    marginBottom: "1rem",
  },
  featureTitle: {
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: "1rem",
    lineHeight: "1.3",
  },
  featureText: {
    fontSize: "clamp(1rem, 2vw, 1.125rem)",
    color: theme.colors.textLight,
    lineHeight: "1.7",
    marginBottom: "1.5rem",
  },
  featureListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  featureListItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)",
    color: theme.colors.text,
    lineHeight: "1.6",
  },
  checkIcon: {
    color: theme.colors.success,
    fontWeight: "700",
    fontSize: "1.25rem",
    flexShrink: 0,
  },
  featureMockup: {
    flex: "1",
    minWidth: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  mockupImage: {
    width: "100%",
    height: "auto",
    maxWidth: "450px",
    filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))",
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
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
    fontWeight: "700",
    marginBottom: "1rem",
    lineHeight: "1.2",
  },
  ctaText: {
    fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
    marginBottom: "2rem",
    opacity: 0.95,
    lineHeight: "1.6",
  },
  ctaButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaButtonPrimary: {
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    padding: "clamp(0.875rem, 2vw, 1rem) clamp(1.75rem, 4vw, 2.5rem)",
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    fontWeight: "600",
    display: "inline-block",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  ctaButtonSecondary: {
    backgroundColor: "transparent",
    color: theme.colors.white,
    padding: "clamp(0.875rem, 2vw, 1rem) clamp(1.75rem, 4vw, 2.5rem)",
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    fontWeight: "600",
    display: "inline-block",
    transition: "all 0.3s ease",
    border: `2px solid ${theme.colors.white}`,
  },
}
