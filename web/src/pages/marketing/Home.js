import { Link } from "react-router-dom"
import { theme } from "../../theme"
import heroConstruction from "../../assets/images/undraw_under-construction_c2y1.svg"
import sectionBudget from "../../assets/images/undraw_wallet_diag (1).svg"

const Home = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <div style={styles.badge}>✨ Trusted by contractors & homeowners</div>
            <h1 style={styles.heroTitle}>
              Construction Projects Made <span style={styles.highlight}>Transparent</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Stop the confusion. Track every dollar, every update, and every hour worked—all in one simple platform
              that keeps everyone on the same page.
            </p>
            <div style={styles.heroCTA}>
              <Link to="/register" style={styles.primaryButton}>
                Start Free Today →
              </Link>
              <Link to="/how-it-works" style={styles.secondaryButton}>
                See How It Works
              </Link>
            </div>
            <p style={styles.heroNote}>No credit card required • Free forever plan available</p>
          </div>
          <div style={styles.heroImage}>
            <img src={heroConstruction || "/placeholder.svg"} alt="Construction Management" style={styles.heroImg} />
          </div>
        </div>
      </section>

      <section style={styles.statsSection}>
        <div style={styles.container}>
          <div style={styles.statsGrid}>
            {/* <div style={styles.statCard}>
              <div style={styles.statNumber}>$2M+</div>
              <div style={styles.statLabel}>Projects Managed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>500+</div>
              <div style={styles.statLabel}>Active Contractors</div>
            </div> */}
            <div style={styles.statCard}>
              <div style={styles.statNumber}>98%</div>
              <div style={styles.statLabel}>Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>The Challenge</span>
            <h2 style={styles.sectionTitle}>Construction Projects Are Stressful</h2>
            <p style={styles.sectionSubtitle}>Without transparency, small issues become big problems</p>
          </div>
          <div style={styles.problemImageContainer}>
            <img src={sectionBudget || "/placeholder.svg"} alt="Budget Problems" style={styles.sectionImage} />
          </div>
          <div style={styles.problemGrid}>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}>😰</div>
              <h3 style={styles.cardTitle}>Homeowners feel in the dark</h3>
              <p style={styles.cardText}>
                "Where did my money go?" "Is the work actually getting done?" "Did I pay them already?"
              </p>
            </div>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}>📞</div>
              <h3 style={styles.cardTitle}>Too many phone calls</h3>
              <p style={styles.cardText}>
                Constant back-and-forth about expenses, work progress, payments, and schedules wastes everyone's time
              </p>
            </div>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}>💸</div>
              <h3 style={styles.cardTitle}>Budget overruns</h3>
              <p style={styles.cardText}>
                Untracked expenses, disputed payments, and forgotten costs lead to budget chaos and arguments
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, ...styles.solutionSection }}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={{ ...styles.sectionBadge, ...styles.sectionBadgeLight }}>The Solution</span>
            <h2 style={{ ...styles.sectionTitle, color: theme.colors.white }}>One Platform, Complete Transparency</h2>
            <p style={{ ...styles.sectionSubtitle, color: "rgba(255, 255, 255, 0.9)" }}>
              Everyone sees the same information in real-time
            </p>
          </div>
          <div style={styles.solutionGrid}>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>📊</div>
              <h3 style={styles.cardTitle}>Real-time expense tracking</h3>
              <p style={styles.cardText}>Upload receipt photos and track every dollar spent with complete visibility</p>
            </div>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>💳</div>
              <h3 style={styles.cardTitle}>Payment transparency</h3>
              <p style={styles.cardText}>Record payments with confirmation to prevent disputes and build trust</p>
            </div>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>📸</div>
              <h3 style={styles.cardTitle}>Daily progress updates</h3>
              <p style={styles.cardText}>Document work with photos and status updates everyone can see</p>
            </div>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>📍</div>
              <h3 style={styles.cardTitle}>Employee check-in/out</h3>
              <p style={styles.cardText}>GPS tracking and photo verification for complete accountability</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.section, ...styles.finalCtaSection }}>
        <div style={styles.container}>
          <div style={styles.finalCta}>
            <h2 style={styles.finalCtaTitle}>Ready to Build with Confidence?</h2>
            <p style={styles.finalCtaSubtext}>Join hundreds of contractors and homeowners who trust Managrr</p>
            <Link to="/register" style={styles.finalCtaButton}>
              Start Your First Project Free →
            </Link>
            <p style={styles.finalCtaNote}>✓ No credit card required ✓ Setup in 5 minutes ✓ Cancel anytime</p>
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
    background: `linear-gradient(135deg, ${theme.colors.backgroundLight} 0%, #ffffff 100%)`,
    padding: "5rem 0 4rem",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `0 ${theme.spacing.component}`,
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-block",
    padding: "0.5rem 1.25rem",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    color: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
  },
  heroTitle: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.component,
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
  },
  highlight: {
    color: theme.colors.primary,
    position: "relative",
  },
  heroSubtitle: {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: theme.colors.textLight,
    marginBottom: "2rem",
    lineHeight: "1.7",
    maxWidth: "700px",
    margin: "0 auto 2rem",
  },
  heroCTA: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: "1.125rem 2.5rem",
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    fontSize: "1.125rem",
    fontWeight: "600",
    display: "inline-block",
    boxShadow: `0 10px 25px -5px rgba(37, 99, 235, 0.3)`,
    transition: "all 0.3s ease",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: theme.colors.primary,
    padding: "1.125rem 2.5rem",
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    fontSize: "1.125rem",
    fontWeight: "600",
    display: "inline-block",
    border: `2px solid ${theme.colors.primary}`,
    transition: "all 0.3s ease",
  },
  heroNote: {
    fontSize: "0.875rem",
    color: theme.colors.textLight,
    marginTop: "1rem",
  },
  heroImage: {
    maxWidth: "600px",
    margin: "3rem auto 0",
  },
  heroImg: {
    width: "100%",
    height: "auto",
  },
  statsSection: {
    padding: "3rem 0",
    backgroundColor: theme.colors.white,
    borderTop: `1px solid ${theme.colors.borderLight}`,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
    textAlign: "center",
  },
  statCard: {
    padding: "1rem",
  },
  statNumber: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: theme.colors.primary,
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "1rem",
    color: theme.colors.textLight,
    fontWeight: "500",
  },
  section: {
    padding: "5rem 0",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  sectionBadge: {
    display: "inline-block",
    padding: "0.5rem 1.25rem",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    color: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    fontSize: "0.875rem",
    fontWeight: "600",
    marginBottom: "1rem",
  },
  sectionBadgeLight: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: theme.colors.white,
  },
  sectionTitle: {
    fontSize: "clamp(2rem, 4vw, 2.75rem)",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "1rem",
    color: theme.colors.text,
    letterSpacing: "-0.02em",
  },
  sectionSubtitle: {
    fontSize: "1.25rem",
    textAlign: "center",
    color: theme.colors.textLight,
    maxWidth: "600px",
    margin: "0 auto",
  },
  problemImageContainer: {
    maxWidth: "400px",
    margin: "0 auto 3rem",
  },
  sectionImage: {
    width: "100%",
    height: "auto",
  },
  problemGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "2rem",
    marginTop: "3rem",
  },
  problemCard: {
    textAlign: "center",
    padding: "2.5rem 2rem",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.borderLight}`,
    transition: "all 0.3s ease",
  },
  problemIcon: {
    fontSize: "3.5rem",
    marginBottom: "1.5rem",
  },
  cardTitle: {
    fontSize: "1.375rem",
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: "1rem",
    letterSpacing: "-0.01em",
  },
  cardText: {
    fontSize: "1.0625rem",
    color: theme.colors.textLight,
    lineHeight: "1.7",
  },
  solutionSection: {
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1e40af 100%)`,
    position: "relative",
  },
  solutionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "2rem",
    marginTop: "3rem",
  },
  solutionCard: {
    backgroundColor: theme.colors.white,
    padding: "2.5rem 2rem",
    borderRadius: theme.borderRadius.lg,
    textAlign: "center",
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
  },
  solutionIcon: {
    fontSize: "3.5rem",
    marginBottom: "1.5rem",
  },
  finalCtaSection: {
    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1e40af 100%)`,
    padding: "6rem 0",
  },
  finalCta: {
    textAlign: "center",
    color: theme.colors.white,
  },
  finalCtaTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "800",
    marginBottom: "1rem",
    letterSpacing: "-0.02em",
  },
  finalCtaSubtext: {
    fontSize: "1.375rem",
    marginBottom: "2.5rem",
    opacity: 0.95,
  },
  finalCtaButton: {
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    padding: "1.25rem 3rem",
    borderRadius: theme.borderRadius.md,
    textDecoration: "none",
    fontSize: "1.25rem",
    fontWeight: "700",
    display: "inline-block",
    boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
  },
  finalCtaNote: {
    fontSize: "1rem",
    marginTop: "1.5rem",
    opacity: 0.9,
  },
}

export default Home
