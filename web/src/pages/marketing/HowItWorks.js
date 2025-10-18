import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import ownersImg from '../../assets/images/undraw_houses_owky.svg';
import contractorsImg from '../../assets/images/undraw_construction-workers_z99i.svg';
import employeesImg from '../../assets/images/undraw_ordinary-day_ak4e.svg';

export const HowItWorks = () => {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>How Managrr Works</h1>
          <p style={styles.subtitle}>
            Simple, transparent project management for everyone involved
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>For House Owners</h2>
          <div style={styles.imageContainer}>
            <img 
              src={ownersImg} 
              alt="For House Owners" 
              style={styles.sectionImage}
            />
          </div>
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Create Your Project</h3>
                <p style={styles.stepText}>
                  Sign up for free and create a project with details, estimated budget, and photos. 
                  No credit card required to start.
                </p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Invite Your Contractor</h3>
                <p style={styles.stepText}>
                  Send an email invitation to your contractor. They'll get access 
                  to the project and can start tracking work immediately.
                </p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Track Everything in Real-Time</h3>
                <p style={styles.stepText}>
                  See daily progress updates with photos, monitor expenses as they happen, 
                  track employee work hours, and record all payments—all from your dashboard.
                </p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>4</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Record Payments</h3>
                <p style={styles.stepText}>
                  Every time you pay your contractor, record it in the system with amount, 
                  payment method, and optional screenshot proof. Your contractor confirms 
                  receipt to create an indisputable payment history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>For Contractors</h2>
          <div style={styles.imageContainer}>
            <img 
              src={contractorsImg} 
              alt="For Contractors" 
              style={styles.sectionImage}
            />
          </div>
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Accept Project Assignment</h3>
                <p style={styles.stepText}>
                  Receive email invitation from house owner and accept the project. 
                  Review project details and estimated costs.
                </p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Add Employees to Project</h3>
                <p style={styles.stepText}>
                  Create employee accounts and assign them to the project. 
                  Set their hourly rates for automatic time tracking.
                </p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Post Daily Updates</h3>
                <p style={styles.stepText}>
                  Share progress with photos, update work status, and add notes 
                  about what was accomplished each day. Keep your client informed.
                </p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>4</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Track Expenses</h3>
                <p style={styles.stepText}>
                  Upload receipts for materials and costs. Tag who paid (owner or contractor) 
                  and categorize expenses. Keep everyone informed about spending.
                </p>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>5</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>Confirm Payments Received</h3>
                <p style={styles.stepText}>
                  When the house owner records a payment, you'll see it immediately. 
                  Click "Received" to confirm and lock the payment record. This creates 
                  a transparent payment history that protects both parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>For Employees</h2>
          <div style={styles.imageContainer}>
            <img 
              src={employeesImg} 
              alt="For Employees" 
              style={styles.sectionImage}
            />
          </div>
          <div style={styles.mobileSection}>
            <div style={styles.mobileSteps}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Get Added by Contractor</h3>
                  <p style={styles.stepText}>
                    Your contractor will create an account for you and assign you to projects. 
                    You'll receive login credentials via email.
                  </p>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Check In When You Arrive</h3>
                  <p style={styles.stepText}>
                    Use the mobile app to check in when you arrive at the work site. 
                    Take a photo and optionally share your GPS location for verification.
                  </p>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>3</div>
                <div style={styles.stepContent}>
                  <h3 style={styles.stepTitle}>Check Out When You Leave</h3>
                  <p style={styles.stepText}>
                    Check out at the end of your shift with another photo. 
                    Hours worked are calculated automatically and visible to your contractor.
                  </p>
                </div>
              </div>
            </div>
            <div style={styles.mobileNote}>
              <p style={styles.noteText}>
                📱 <strong>Mobile app coming soon!</strong> Currently, employees can use the web version 
                on their phones for check-in/out. Native mobile app launching in Q2 2025.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.primary}}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
            <p style={styles.ctaText}>
              Create your free account and start your first project today
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
  subtitle: {
    fontSize: '1.25rem',
    color: theme.colors.textLight,
    maxWidth: '600px',
    margin: '0 auto',
  },
  section: {
    padding: '4rem 0',
  },
  imageContainer: {
    maxWidth: '400px',
    margin: '0 auto 3rem',
  },
  sectionImage: {
    width: '100%',
    height: 'auto',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: '3rem',
  },
  steps: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  step: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '3rem',
    alignItems: 'flex-start',
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
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '0.75rem',
  },
  stepText: {
    fontSize: '1.125rem',
    color: theme.colors.textLight,
    lineHeight: '1.7',
  },
  mobileSection: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  mobileSteps: {
    marginBottom: '2rem',
  },
  mobileNote: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    boxShadow: theme.shadows.md,
  },
  noteText: {
    fontSize: '1.125rem',
    color: theme.colors.text,
    margin: 0,
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