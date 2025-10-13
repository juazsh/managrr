import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

export const About = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>About Managrr</h1>
          <p style={styles.mission}>
            Making construction projects transparent and stress-free
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.content}>
            <h2 style={styles.sectionTitle}>The Problem We Solve</h2>
            <div style={styles.problemGrid}>
              <div style={styles.problemCard}>
                <h3 style={styles.problemTitle}>💸 Budget Overruns</h3>
                <p style={styles.problemText}>
                  Construction projects frequently exceed their estimated costs, often due to 
                  hidden expenses, miscommunication, or lack of real-time tracking. House 
                  owners are left in the dark about where their money is going.
                </p>
              </div>
              <div style={styles.problemCard}>
                <h3 style={styles.problemTitle}>🤝 Poor Communication</h3>
                <p style={styles.problemText}>
                  Disputes arise from misunderstandings between house owners and contractors. 
                  Without a shared source of truth, each party may have different expectations 
                  and information about the project.
                </p>
              </div>
              <div style={styles.problemCard}>
                <h3 style={styles.problemTitle}>📊 Tracking Challenges</h3>
                <p style={styles.problemText}>
                  It's difficult to track actual expenses versus estimates, monitor daily 
                  progress, and verify employee work hours. Manual methods are time-consuming 
                  and prone to errors.
                </p>
              </div>
              <div style={styles.problemCard}>
                <h3 style={styles.problemTitle}>👁️ Lack of Visibility</h3>
                <p style={styles.problemText}>
                  House owners have no daily visibility into project progress without visiting 
                  the site. Contractors struggle to document work and keep owners informed in 
                  a timely manner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <div style={styles.content}>
            <h2 style={styles.sectionTitle}>Our Solution</h2>
            <div style={styles.solutionContent}>
              <div style={styles.solutionCard}>
                <div style={styles.solutionIcon}>📱</div>
                <h3 style={styles.solutionTitle}>Simple, Mobile-First Platform</h3>
                <p style={styles.solutionText}>
                  Designed for ease of use on mobile devices. Contractors and employees can 
                  update projects, upload photos, and track time directly from their phones 
                  at the work site.
                </p>
              </div>
              <div style={styles.solutionCard}>
                <div style={styles.solutionIcon}>🏗️</div>
                <h3 style={styles.solutionTitle}>Built for Small Contractors</h3>
                <p style={styles.solutionText}>
                  Unlike enterprise software with complicated features, Managrr focuses on 
                  what small contractors and homeowners actually need: simple project tracking, 
                  expense management, and communication.
                </p>
              </div>
              <div style={styles.solutionCard}>
                <div style={styles.solutionIcon}>💎</div>
                <h3 style={styles.solutionTitle}>Transparent Expense Tracking</h3>
                <p style={styles.solutionText}>
                  Every expense is documented with receipt photos. Both owners and contractors 
                  see the same information in real-time. No surprises, no hidden costs, just 
                  complete transparency.
                </p>
              </div>
              <div style={styles.solutionCard}>
                <div style={styles.solutionIcon}>⚡</div>
                <h3 style={styles.solutionTitle}>Real-Time Progress Updates</h3>
                <p style={styles.solutionText}>
                  Contractors share daily updates with photos. House owners see progress 
                  immediately without having to visit the site. Everyone stays on the same page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.content}>
            <h2 style={styles.sectionTitle}>Who We Serve</h2>
            <div style={styles.audienceGrid}>
              <div style={styles.audienceCard}>
                <div style={styles.audienceIcon}>👷</div>
                <h3 style={styles.audienceTitle}>Small Contractors</h3>
                <p style={styles.audienceText}>
                  Independent contractors and small construction companies with 1-10 employees. 
                  Those who need simple tools to manage projects, track expenses, and keep 
                  clients informed without the complexity of enterprise software.
                </p>
              </div>
              <div style={styles.audienceCard}>
                <div style={styles.audienceIcon}>🏠</div>
                <h3 style={styles.audienceTitle}>Homeowners</h3>
                <p style={styles.audienceText}>
                  House owners doing renovations, additions, or new construction. Those who 
                  want visibility into their project without micromanaging, and who value 
                  transparency in expenses and progress.
                </p>
              </div>
              <div style={styles.audienceCard}>
                <div style={styles.audienceIcon}>🔨</div>
                <h3 style={styles.audienceTitle}>Residential Projects</h3>
                <p style={styles.audienceText}>
                  Projects ranging from $10,000 to $100,000. Kitchen remodels, bathroom 
                  renovations, home additions, basement finishing, and similar residential 
                  construction work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <div style={styles.contactBox}>
            <h2 style={styles.contactTitle}>Get in Touch</h2>
            <p style={styles.contactText}>
              Have questions about Managrr? Want to learn more about how we can help your 
              construction projects? We'd love to hear from you.
            </p>
            <div style={styles.contactInfo}>
              <a href="mailto:support@managrr.com" style={styles.contactEmail}>
                support@managrr.com
              </a>
            </div>
            <Link to="/contact" style={styles.contactButton}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.primary}}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Ready to Transform Your Projects?</h2>
            <p style={styles.ctaText}>
              Join contractors and homeowners who are building with transparency
            </p>
            <Link to="/register" style={styles.ctaButton}>
              Get Started Free
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
    padding: '3rem 0',
    textAlign: 'center',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing.component}`,
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.element,
  },
  mission: {
    fontSize: '1.5rem',
    color: theme.colors.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  section: {
    padding: '4rem 0',
  },
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '2rem',
  },
  problemCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
  },
  problemTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  problemText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    lineHeight: '1.7',
  },
  solutionContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '2rem',
  },
  solutionCard: {
    textAlign: 'center',
    padding: '1.5rem',
  },
  solutionIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  solutionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  solutionText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    lineHeight: '1.7',
  },
  audienceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  audienceCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    textAlign: 'center',
  },
  audienceIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  audienceTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  audienceText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    lineHeight: '1.7',
  },
  contactBox: {
    backgroundColor: theme.colors.white,
    padding: '3rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto',
  },
  contactTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  contactText: {
    fontSize: '1.125rem',
    color: theme.colors.textLight,
    lineHeight: '1.7',
    marginBottom: '2rem',
  },
  contactInfo: {
    marginBottom: '2rem',
  },
  contactEmail: {
    fontSize: '1.25rem',
    color: theme.colors.primary,
    textDecoration: 'none',
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: '1rem 2rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    display: 'inline-block',
  },
  cta: {
    textAlign: 'center',
    color: theme.colors.white,
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  ctaText: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    opacity: 0.9,
  },
  ctaButton: {
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