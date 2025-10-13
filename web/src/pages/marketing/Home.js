import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

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
              Track projects, manage employees, and control expenses—all in one place.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/register" style={styles.primaryButton}>
                Get Started Free
              </Link>
              <Link to="/how-it-works" style={styles.secondaryButton}>
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Construction Projects Are Hard to Track</h2>
          <div style={styles.problemGrid}>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}>💸</div>
              <h3 style={styles.cardTitle}>Projects go over budget with hidden costs</h3>
            </div>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}>👁️</div>
              <h3 style={styles.cardTitle}>No visibility into daily progress</h3>
            </div>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}>⏰</div>
              <h3 style={styles.cardTitle}>Hard to track employee hours and work</h3>
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Managrr Makes Construction Transparent</h2>
          <div style={styles.solutionGrid}>
            <div style={styles.solutionCard}>
              <div style={styles.solutionIcon}>📊</div>
              <h3 style={styles.cardTitle}>Real-time expense tracking</h3>
              <p style={styles.cardText}>Upload receipt photos and track every dollar spent</p>
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
          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.cardTitle}>House owners create projects</h3>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.cardTitle}>Contractors track progress and expenses</h3>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.cardTitle}>Everyone stays on the same page</h3>
            </div>
          </div>
          <div style={styles.centerButton}>
            <Link to="/how-it-works" style={styles.secondaryButton}>
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
            </div>
            <div style={styles.pricingCard}>
              <h3 style={styles.pricingTier}>Pay Per Project</h3>
              <div style={styles.price}>$99</div>
              <p style={styles.pricingDescription}>For occasional contractors</p>
            </div>
            <div style={styles.pricingCard}>
              <h3 style={styles.pricingTier}>Pro</h3>
              <div style={styles.price}>$39<span style={styles.priceUnit}>/mo</span></div>
              <p style={styles.pricingDescription}>For active contractors</p>
            </div>
          </div>
          <div style={styles.centerButton}>
            <Link to="/pricing" style={styles.secondaryButton}>
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
  heroButtons: {
    display: 'flex',
    gap: theme.spacing.element,
    justifyContent: 'center',
    flexWrap: 'wrap',
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
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  secondaryButton: {
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    padding: '1rem 2rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'inline-block',
    border: `2px solid ${theme.colors.primary}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  section: {
    padding: '4rem 0',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: '3rem',
  },
  problemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
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
    marginBottom: '0.5rem',
  },
  cardText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    lineHeight: '1.6',
  },
  solutionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
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
    margin: '0 auto 1rem',
  },
  centerButton: {
    textAlign: 'center',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    boxShadow: theme.shadows.sm,
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  pricingCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    boxShadow: theme.shadows.md,
  },
  pricingTier: {
    fontSize: '1.5rem',
    fontWeight: '600',
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
    fontWeight: '400',
  },
  pricingDescription: {
    fontSize: '1rem',
    color: theme.colors.textLight,
  },
  finalCta: {
    textAlign: 'center',
    color: theme.colors.white,
  },
  finalCtaTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
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
    fontSize: '1.25rem',
    fontWeight: '600',
    display: 'inline-block',
  },
};

export default Home;