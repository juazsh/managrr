import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import dashTech from '../../assets/images/undraw_visionary-technology_f6b3.svg';
import employeesImg from '../../assets/images/undraw_construction-workers_z99i.svg';
import timeTrackingImg from '../../assets/images/undraw_ordinary-day_ak4e.svg';
import expenseImg from '../../assets/images/undraw_wallet_diag (1).svg';
import photosImg from '../../assets/images/undraw_add-information_06qr.svg';
import updatesImg from '../../assets/images/undraw_building_burz.svg';
import transparencyImg from '../../assets/images/undraw_small-town_76a2.svg';

export const Features = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Powerful Features for Construction Management</h1>
          <p style={styles.subtitle}>
            Everything you need to manage construction projects transparently
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>📋</div>
              <h2 style={styles.featureTitle}>Project Dashboard</h2>
              <p style={styles.featureText}>
                A centralized hub where house owners and contractors see the same information 
                in real-time. View project status, recent updates, expenses, and employee activity 
                all in one place. No more back-and-forth emails or wondering what's happening.
              </p>
              <ul style={styles.featureList}>
                <li>Real-time project status updates</li>
                <li>Shared view for owners and contractors</li>
                <li>Photo timeline of progress</li>
                <li>Quick access to all project details</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={dashTech} 
                alt="Dashboard Preview" 
                style={styles.mockupImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <div style={{...styles.feature, ...styles.featureReverse}}>
            <div style={styles.featureMockup}>
              <img 
                src={employeesImg} 
                alt="Employee Management" 
                style={styles.mockupImage}
              />
            </div>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>👷</div>
              <h2 style={styles.featureTitle}>Employee Management</h2>
              <p style={styles.featureText}>
                Add employees to your team and assign them to specific projects. Set hourly 
                rates for each employee, and their work hours are automatically tracked and 
                calculated when they check in and out.
              </p>
              <ul style={styles.featureList}>
                <li>Add unlimited employees</li>
                <li>Assign to multiple projects</li>
                <li>Set custom hourly rates</li>
                <li>Track hours automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>⏰</div>
              <h2 style={styles.featureTitle}>Time Tracking</h2>
              <p style={styles.featureText}>
                Employees check in with a photo when they arrive at the work site, and check 
                out with another photo when they leave. GPS location is automatically captured 
                for verification. Hours are calculated automatically—no manual timesheets needed.
              </p>
              <ul style={styles.featureList}>
                <li>Photo verification on check-in/out</li>
                <li>GPS location tracking</li>
                <li>Automatic hour calculation</li>
                <li>View daily, weekly, or total hours</li>
                <li>Instant earnings calculation</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={timeTrackingImg} 
                alt="Mobile Check-in" 
                style={styles.mockupImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <div style={{...styles.feature, ...styles.featureReverse}}>
            <div style={styles.featureMockup}>
              <img 
                src={expenseImg} 
                alt="Expense Tracker" 
                style={styles.mockupImage}
              />
            </div>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>💰</div>
              <h2 style={styles.featureTitle}>Expense Tracking</h2>
              <p style={styles.featureText}>
                Upload receipt photos for every expense. Track who paid (owner or contractor), 
                categorize expenses (materials, labor, equipment), and see running totals. 
                Everyone sees the same numbers—complete transparency.
              </p>
              <ul style={styles.featureList}>
                <li>Upload receipt photos</li>
                <li>Track who paid for each expense</li>
                <li>Categorize by type</li>
                <li>Filter and search expenses</li>
                <li>Running totals vs. estimated cost</li>
                <li>Export expense reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>📸</div>
              <h2 style={styles.featureTitle}>Photo Documentation</h2>
              <p style={styles.featureText}>
                Build a complete visual timeline of your project. Every check-in, update, and 
                expense includes photos. See exactly what work was done, when it was done, and 
                by whom. Perfect for quality control and documentation.
              </p>
              <ul style={styles.featureList}>
                <li>Unlimited photo uploads</li>
                <li>Automatic timestamps</li>
                <li>Organized by date and type</li>
                <li>Before/after comparisons</li>
                <li>Download all project photos</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={photosImg} 
                alt="Photo Gallery" 
                style={styles.mockupImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <div style={{...styles.feature, ...styles.featureReverse}}>
            <div style={styles.featureMockup}>
              <img 
                src={updatesImg} 
                alt="Daily Updates" 
                style={styles.mockupImage}
              />
            </div>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>📅</div>
              <h2 style={styles.featureTitle}>Daily Updates</h2>
              <p style={styles.featureText}>
                Contractors post daily progress updates with photos and notes. Share what was 
                accomplished, what's planned for the next week, and any issues or changes. 
                House owners stay informed without having to visit the site daily.
              </p>
              <ul style={styles.featureList}>
                <li>Daily progress notes</li>
                <li>Multiple photos per update</li>
                <li>Weekly planning section</li>
                <li>Status updates (on track, delayed, etc.)</li>
                <li>Email notifications to owners</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>🤝</div>
              <h2 style={styles.featureTitle}>Transparent Communication</h2>
              <p style={styles.featureText}>
                The key to successful construction projects is trust and transparency. With 
                Managrr, all parties see the same information at the same time. No surprises, 
                no hidden costs, no miscommunication. Build trust through transparency.
              </p>
              <ul style={styles.featureList}>
                <li>Shared view of all project data</li>
                <li>Real-time updates for everyone</li>
                <li>No information asymmetry</li>
                <li>Build trust through openness</li>
                <li>Reduce disputes and misunderstandings</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={transparencyImg} 
                alt="Transparency Dashboard" 
                style={styles.mockupImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.primary}}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Start Using These Features Today</h2>
            <p style={styles.ctaText}>
              All features available on the free tier—no credit card required
            </p>
            <Link to="/register" style={styles.ctaButton}>
              Create Free Account
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
  subtitle: {
    fontSize: '1.25rem',
    color: theme.colors.textLight,
    maxWidth: '700px',
    margin: '0 auto',
  },
  section: {
    padding: '4rem 0',
  },
  feature: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '3rem',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  featureReverse: {
    direction: 'ltr',
  },
  featureContent: {
    direction: 'ltr',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  featureText: {
    fontSize: '1.125rem',
    color: theme.colors.textLight,
    lineHeight: '1.7',
    marginBottom: '1.5rem',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
  },
  featureMockup: {
    direction: 'ltr',
  },
  mockupImage: {
    width: '100%',
    height: 'auto',
    maxWidth: '400px',
    margin: '0 auto',
    display: 'block',
  },
  mockupPlaceholder: {
    backgroundColor: theme.colors.backgroundLight,
    border: `2px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.lg,
    padding: '4rem 2rem',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.textLight,
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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