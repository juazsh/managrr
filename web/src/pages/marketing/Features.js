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
                in real-time. View project status, recent updates, expenses, payments, and employee activity 
                all in one place. No more back-and-forth emails or wondering what's happening.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Real-time project overview</li>
                <li>✓ Progress photos timeline</li>
                <li>✓ Daily and weekly updates</li>
                <li>✓ Expense tracking</li>
                <li>✓ Payment history</li>
                <li>✓ Work log summaries</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={dashTech} 
                alt="Project Dashboard" 
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
                Contractors can add employees to their account, assign them to specific projects, 
                and set hourly rates. Keep track of your entire crew in one system.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Add unlimited employees</li>
                <li>✓ Assign to multiple projects</li>
                <li>✓ Set hourly rates</li>
                <li>✓ Track employee activity</li>
                <li>✓ View work history</li>
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
              <h2 style={styles.featureTitle}>Time Tracking with Photo Verification</h2>
              <p style={styles.featureText}>
                Employees check in and out with photo verification and optional GPS tracking. 
                Automatic calculation of hours worked ensures accurate time records and reduces disputes.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Photo check-in/check-out</li>
                <li>✓ GPS location stamps</li>
                <li>✓ Automatic hours calculation</li>
                <li>✓ Daily work logs</li>
                <li>✓ Weekly summaries</li>
                <li>✓ Accountability through transparency</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={timeTrackingImg} 
                alt="Time Tracking" 
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
                alt="Expense Tracking" 
                style={styles.mockupImage}
              />
            </div>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>💰</div>
              <h2 style={styles.featureTitle}>Complete Expense Tracking</h2>
              <p style={styles.featureText}>
                Upload receipt photos and track every expense with detailed categorization. 
                See running totals, filter by category or payer, and keep a complete financial record 
                of your project. No more lost receipts or forgotten costs.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Receipt photo uploads</li>
                <li>✓ Categorize by materials, labor, equipment</li>
                <li>✓ Track who paid (owner/contractor)</li>
                <li>✓ Running totals by category</li>
                <li>✓ Date range filtering</li>
                <li>✓ Expense breakdown reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>💳</div>
              <h2 style={styles.featureTitle}>Payment Summary & Tracking</h2>
              <p style={styles.featureText}>
                House owners record every payment made to contractors with full transparency. 
                Contractors confirm receipt to lock the record, creating an indisputable payment history. 
                Track payment methods, dates, and amounts all in one place.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Record payments with proof</li>
                <li>✓ Multiple payment methods (cash, bank transfer, Zelle, PayPal, etc.)</li>
                <li>✓ Contractor confirmation system</li>
                <li>✓ Payment screenshot uploads</li>
                <li>✓ Running total of confirmed payments</li>
                <li>✓ Dispute resolution workflow</li>
                <li>✓ Complete payment history</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={expenseImg} 
                alt="Payment Tracking" 
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
                src={photosImg} 
                alt="Progress Photos" 
                style={styles.mockupImage}
              />
            </div>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>📷</div>
              <h2 style={styles.featureTitle}>Progress Photo Documentation</h2>
              <p style={styles.featureText}>
                Create a visual timeline of your project's progress. Upload photos with captions 
                to document work as it happens. Perfect for insurance, quality assurance, and 
                keeping house owners informed.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Unlimited photo uploads</li>
                <li>✓ Add captions and notes</li>
                <li>✓ Chronological timeline view</li>
                <li>✓ Before and after documentation</li>
                <li>✓ Shared between owner and contractor</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.feature}>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>📝</div>
              <h2 style={styles.featureTitle}>Daily & Weekly Updates</h2>
              <p style={styles.featureText}>
                Contractors post daily summaries and weekly plans to keep house owners in the loop. 
                Add multiple photos to each update and provide detailed progress notes. 
                Communication that builds trust.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Daily progress summaries</li>
                <li>✓ Weekly work plans</li>
                <li>✓ Multiple photos per update</li>
                <li>✓ Instant notifications</li>
                <li>✓ Update history timeline</li>
              </ul>
            </div>
            <div style={styles.featureMockup}>
              <img 
                src={updatesImg} 
                alt="Project Updates" 
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
                src={transparencyImg} 
                alt="Transparency" 
                style={styles.mockupImage}
              />
            </div>
            <div style={styles.featureContent}>
              <div style={styles.featureIcon}>🤝</div>
              <h2 style={styles.featureTitle}>Complete Transparency</h2>
              <p style={styles.featureText}>
                The biggest challenge in construction projects is miscommunication and hidden information. 
                With Managrr, all parties see the same information at the same time. No surprises, 
                no hidden costs, no miscommunication. Build trust through transparency.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Shared view of all project data</li>
                <li>✓ Real-time updates for everyone</li>
                <li>✓ No information asymmetry</li>
                <li>✓ Payment confirmation system</li>
                <li>✓ Build trust through openness</li>
                <li>✓ Reduce disputes and misunderstandings</li>
              </ul>
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
    fontSize: '1.0625rem',
    lineHeight: '2',
    color: theme.colors.text,
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