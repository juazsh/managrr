import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import heroConstruction from '../../assets/images/undraw_under-construction_c2y1.svg';
import sectionBudget from '../../assets/images/undraw_wallet_diag (1).svg';
import sectionTech from '../../assets/images/undraw_visionary-technology_f6b3.svg';
import sectionHouses from '../../assets/images/undraw_houses_owky.svg';

const Home = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Transparent Construction Project Management
            </h1>
            <p style={styles.heroSubtitle}>
              Track projects, manage employees, control expenses, and record payments—all in one place.
            </p>
            <div style={styles.heroCTA}>
              <Link to="/register" style={styles.primaryButton}>
                Get Started Free
              </Link>
              <Link to="/how-it-works" style={styles.secondaryButton}>
                See How It Works
              </Link>
            </div>
          </div>
          <div style={styles.heroImage}>
            <img 
              src={heroConstruction} 
              alt="Construction Management" 
              style={styles.heroImg}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>The Problem</h2>
          <div style={styles.problemImageContainer}>
            <img 
              src={sectionBudget} 
              alt="Budget Problems" 
              style={styles.sectionImage}
            />
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

      <section style={{...styles.section, backgroundColor: theme.colors.primary}}>
        <div style={styles.container}>
          <h2 style={{...styles.sectionTitle, color: theme.colors.white}}>Our Solution</h2>
          <p style={{...styles.sectionSubtitle, color: theme.colors.white}}>
            One platform where everyone sees the same information in real-time
          </p>
          <div style={styles.solutionGrid}>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>📊</div>
              <h3 style={styles.cardTitle}>Real-time expense tracking</h3>
              <p style={styles.cardText}>Upload receipt photos and track every dollar spent</p>
            </div>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>💳</div>
              <h3 style={styles.cardTitle}>Payment transparency</h3>
              <p style={styles.cardText}>Record payments with confirmation to prevent disputes</p>
            </div>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>📸</div>
              <h3 style={styles.cardTitle}>Daily progress updates</h3>
              <p style={styles.cardText}>Document work with photos and status updates</p>
            </div>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>📍</div>
              <h3 style={styles.cardTitle}>Employee check-in/out</h3>
              <p style={styles.cardText}>GPS tracking and photo verification for accountability</p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.problemImageContainer}>
            <img 
              src={sectionHouses} 
              alt="House Owners and Projects" 
              style={styles.sectionImage}
            />
          </div>
          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.cardTitle}>House owners create projects</h3>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.cardTitle}>Contractors track progress, expenses, and payments</h3>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.cardTitle}>Everyone stays on the same page</h3>
            </div>
          </div>
          <div style={styles.centerButton}>
            <Link to="/how-it-works" style={styles.secondaryButtonDark}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Features</h2>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📋</div>
              <h3 style={styles.cardTitle}>Project Dashboard</h3>
              <p style={styles.cardText}>Centralized view of all project information</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>👷</div>
              <h3 style={styles.cardTitle}>Employee Time Tracking</h3>
              <p style={styles.cardText}>Automatic tracking with check-in/out system</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💰</div>
              <h3 style={styles.cardTitle}>Expense Management</h3>
              <p style={styles.cardText}>Track costs with receipt photos and categories</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>💳</div>
              <h3 style={styles.cardTitle}>Payment Tracking</h3>
              <p style={styles.cardText}>Record and confirm all payments with proof</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📷</div>
              <h3 style={styles.cardTitle}>Photo Documentation</h3>
              <p style={styles.cardText}>Visual timeline of project progress</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📅</div>
              <h3 style={styles.cardTitle}>Daily Updates</h3>
              <p style={styles.cardText}>Keep everyone informed with regular updates</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🤝</div>
              <h3 style={styles.cardTitle}>Transparent Communication</h3>
              <p style={styles.cardText}>All parties see the same information</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>✅</div>
              <h3 style={styles.cardTitle}>Payment Confirmation</h3>
              <p style={styles.cardText}>Contractor confirms receipt to lock records</p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Start Free, Pay As You Grow</h2>
          <div style={styles.pricingGrid}>
            <div style={styles.pricingCard}>
              <h3 style={styles.pricingTier}>Free</h3>
              <div style={styles.price}>$0</div>
              <p style={styles.pricingDescription}>Try before you buy</p>
              <ul style={styles.pricingFeatures}>
                <li>1 Project</li>
                <li>All Core Features</li>
                <li>Payment Tracking</li>
                <li>Email Support</li>
              </ul>
              <Link to="/register" style={styles.pricingButton}>
                Get Started
              </Link>
            </div>
            <div style={styles.pricingCard}>
              <h3 style={styles.pricingTier}>Pay Per Project</h3>
              <div style={styles.price}>$99</div>
              <p style={styles.pricingDescription}>For occasional contractors</p>
              <ul style={styles.pricingFeatures}>
                <li>6 Months Active</li>
                <li>All Features</li>
                <li>Payment Tracking</li>
                <li>Email Support</li>
              </ul>
              <Link to="/pricing" style={styles.pricingButton}>
                View Details
              </Link>
            </div>
            <div style={styles.pricingCard}>
              <h3 style={styles.pricingTier}>Pro</h3>
              <div style={styles.price}>$39<span style={styles.priceUnit}>/mo</span></div>
              <p style={styles.pricingDescription}>For active contractors</p>
              <ul style={styles.pricingFeatures}>
                <li>Unlimited Projects</li>
                <li>All Features</li>
                <li>Payment Tracking</li>
                <li>Priority Support</li>
              </ul>
              <Link to="/pricing" style={styles.pricingButton}>
                Get Started
              </Link>
            </div>
          </div>
          <div style={styles.centerButton}>
            <Link to="/pricing" style={styles.secondaryButtonDark}>
              View Full Pricing
            </Link>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.primary}}>
        <div style={styles.container}>
          <div style={styles.finalCta}>
            <h2 style={styles.finalCtaTitle}>Ready to Get Started?</h2>
            <p style={styles.finalCtaSubtext}>No credit card required</p>
            <Link to="/register" style={styles.finalCtaButton}>
              Start Your First Project Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: theme.typography.fontFamily,
  },
  hero: {
    backgroundColor: theme.colors.backgroundLight,
    padding: '4rem 0',
    textAlign: 'center',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing.component}`,
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.component,
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: theme.colors.textLight,
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  heroCTA: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: '1rem 2rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'inline-block',
    boxShadow: theme.shadows.md,
    transition: 'all 0.2s ease',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    padding: '1rem 2rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'inline-block',
    border: `2px solid ${theme.colors.primary}`,
    transition: 'all 0.2s ease',
  },
  secondaryButtonDark: {
    backgroundColor: 'transparent',
    color: theme.colors.text,
    padding: '1rem 2rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'inline-block',
    border: `2px solid ${theme.colors.border}`,
    transition: 'all 0.2s ease',
  },
  heroImage: {
    maxWidth: '500px',
    margin: '2rem auto',
  },
  heroImg: {
    width: '100%',
    height: 'auto',
  },
  section: {
    padding: '4rem 0',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '1rem',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: '1.25rem',
    textAlign: 'center',
    marginBottom: '3rem',
    color: theme.colors.textLight,
  },
  problemImageContainer: {
    maxWidth: '400px',
    margin: '0 auto 3rem',
  },
  sectionImage: {
    width: '100%',
    height: 'auto',
  },
  problemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  problemCard: {
    textAlign: 'center',
    padding: '2rem',
  },
  problemIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '0.75rem',
  },
  cardText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    lineHeight: '1.6',
  },
  solutionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  solutionCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    boxShadow: theme.shadows.md,
  },
  solutionIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  stepCard: {
    textAlign: 'center',
    padding: '2rem',
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 auto 1.5rem',
  },
  centerButton: {
    textAlign: 'center',
    marginTop: '3rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  featureCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
  },
  pricingCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  pricingTier: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  price: {
    fontSize: '3rem',
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: '0.5rem',
  },
  priceUnit: {
    fontSize: '1.5rem',
    color: theme.colors.textLight,
  },
  pricingDescription: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    marginBottom: '1.5rem',
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '2rem',
    textAlign: 'left',
    fontSize: '0.9375rem',
    color: theme.colors.text,
    lineHeight: '2',
  },
  pricingButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: '0.875rem 2rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'inline-block',
    transition: 'all 0.2s ease',
  },
  finalCta: {
    textAlign: 'center',
    color: theme.colors.white,
  },
  finalCtaTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  finalCtaSubtext: {
    fontSize: '1.125rem',
    marginBottom: '2rem',
    opacity: 0.9,
  },
  finalCtaButton: {
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    padding: '1rem 2.5rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'inline-block',
    boxShadow: theme.shadows.lg,
    transition: 'all 0.2s ease',
  },
};

export default Home;