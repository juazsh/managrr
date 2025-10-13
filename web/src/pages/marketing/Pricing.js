import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import pricingHero from '../../assets/images/undraw_wallet_diag (1).svg';

export const Pricing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Can I switch plans?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, your account will be credited for the next billing cycle.',
    },
    {
      question: 'What happens if I cancel?',
      answer: 'You can cancel anytime. For monthly subscriptions, you\'ll have access until the end of your billing period. For pay-per-project, you\'ll have access for the full 6 months.',
    },
    {
      question: 'Do I need a credit card for the free tier?',
      answer: 'No! The free tier requires no credit card. You can start using Managrr immediately and upgrade when you\'re ready.',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees, ever. What you see is what you pay. No setup fees, no cancellation fees, no surprise charges.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes! We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund your payment, no questions asked.',
    },
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Simple, Transparent Pricing</h1>
          <p style={styles.subtitle}>
            Start free, upgrade when you're ready. No credit card required to start.
          </p>
          <div style={styles.heroImageContainer}>
            <img 
              src={pricingHero} 
              alt="Pricing Plans" 
              style={styles.heroImage}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.pricingGrid}>
            <div style={styles.pricingCard}>
              <h3 style={styles.tierName}>Free</h3>
              <div style={styles.price}>
                <span style={styles.priceAmount}>$0</span>
                <span style={styles.pricePeriod}> forever</span>
              </div>
              <p style={styles.tierDescription}>Perfect for: Try before you buy</p>
              
              <ul style={styles.features}>
                <li style={styles.feature}>✓ 1 project (lifetime)</li>
                <li style={styles.feature}>✓ All core features</li>
                <li style={styles.feature}>✓ Email support</li>
                <li style={styles.feature}>✓ Unlimited employees</li>
                <li style={styles.feature}>✓ Photo uploads</li>
              </ul>
              
              <Link to="/register" style={styles.button}>
                Get Started Free
              </Link>
            </div>

            <div style={styles.pricingCard}>
              <h3 style={styles.tierName}>Pay Per Project</h3>
              <div style={styles.price}>
                <span style={styles.priceAmount}>$99</span>
                <span style={styles.pricePeriod}> per project</span>
              </div>
              <p style={styles.tierDescription}>Perfect for: Occasional contractors</p>
              
              <ul style={styles.features}>
                <li style={styles.feature}>✓ One-time payment</li>
                <li style={styles.feature}>✓ Active for 6 months</li>
                <li style={styles.feature}>✓ All features included</li>
                <li style={styles.feature}>✓ Priority support</li>
                <li style={styles.feature}>✓ Unlimited employees</li>
              </ul>
              
              <Link to="/register" style={styles.button}>
                Start a Project
              </Link>
            </div>

            <div style={{...styles.pricingCard, ...styles.recommendedCard}}>
              <div style={styles.recommendedBadge}>Recommended</div>
              <h3 style={styles.tierName}>Pro</h3>
              <div style={styles.price}>
                <span style={styles.priceAmount}>$39</span>
                <span style={styles.pricePeriod}> /month</span>
              </div>
              <p style={styles.tierDescription}>Perfect for: Active contractors</p>
              
              <ul style={styles.features}>
                <li style={styles.feature}>✓ Unlimited projects</li>
                <li style={styles.feature}>✓ All features</li>
                <li style={styles.feature}>✓ Priority support</li>
                <li style={styles.feature}>✓ Advanced analytics (coming soon)</li>
                <li style={styles.feature}>✓ Unlimited employees</li>
              </ul>
              
              <Link to="/register" style={{...styles.button, ...styles.primaryButton}}>
                Start Free Trial
              </Link>
              <p style={styles.trialNote}>14-day free trial available in V1.5</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.backgroundLight}}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Feature Comparison</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{...styles.tableCell, ...styles.tableCellLeft}}>Feature</th>
                  <th style={styles.tableCell}>Free</th>
                  <th style={styles.tableCell}>Pay Per Project</th>
                  <th style={styles.tableCell}>Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Number of Projects</td>
                  <td style={styles.tableCell}>1</td>
                  <td style={styles.tableCell}>1 per payment</td>
                  <td style={styles.tableCell}>Unlimited</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Project Duration</td>
                  <td style={styles.tableCell}>Unlimited</td>
                  <td style={styles.tableCell}>6 months</td>
                  <td style={styles.tableCell}>Unlimited</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Employees</td>
                  <td style={styles.tableCell}>Unlimited</td>
                  <td style={styles.tableCell}>Unlimited</td>
                  <td style={styles.tableCell}>Unlimited</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Photo Uploads</td>
                  <td style={styles.tableCell}>✓</td>
                  <td style={styles.tableCell}>✓</td>
                  <td style={styles.tableCell}>✓</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Expense Tracking</td>
                  <td style={styles.tableCell}>✓</td>
                  <td style={styles.tableCell}>✓</td>
                  <td style={styles.tableCell}>✓</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Daily Updates</td>
                  <td style={styles.tableCell}>✓</td>
                  <td style={styles.tableCell}>✓</td>
                  <td style={styles.tableCell}>✓</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Support</td>
                  <td style={styles.tableCell}>Email</td>
                  <td style={styles.tableCell}>Priority</td>
                  <td style={styles.tableCell}>Priority</td>
                </tr>
                <tr style={styles.tableRow}>
                  <td style={{...styles.tableCell, ...styles.tableCellLeft}}>Advanced Analytics</td>
                  <td style={styles.tableCell}>-</td>
                  <td style={styles.tableCell}>-</td>
                  <td style={styles.tableCell}>Coming Soon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div key={index} style={styles.faqItem}>
                <button
                  onClick={() => toggleFaq(index)}
                  style={styles.faqQuestion}
                >
                  <span>{faq.question}</span>
                  <span style={styles.faqIcon}>{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div style={styles.faqAnswer}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{...styles.section, backgroundColor: theme.colors.primary}}>
        <div style={styles.container}>
          <div style={styles.cta}>
            <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
            <p style={styles.ctaText}>
              Start with our free tier and upgrade when you're ready
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
    maxWidth: '600px',
    margin: '0 auto',
  },
  heroImageContainer: {
    maxWidth: '350px',
    margin: '2rem auto 0',
  },
  heroImage: {
    width: '100%',
    height: 'auto',
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
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  pricingCard: {
    backgroundColor: theme.colors.white,
    padding: '2.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    position: 'relative',
  },
  recommendedCard: {
    border: `3px solid ${theme.colors.primary}`,
    transform: 'scale(1.05)',
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: '0.5rem 1.5rem',
    borderRadius: theme.borderRadius.full,
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  tierName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '1rem',
    textAlign: 'center',
  },
  price: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  priceAmount: {
    fontSize: '3.5rem',
    fontWeight: '700',
    color: theme.colors.primary,
  },
  pricePeriod: {
    fontSize: '1.125rem',
    color: theme.colors.textLight,
  },
  tierDescription: {
    textAlign: 'center',
    fontSize: '1rem',
    color: theme.colors.textLight,
    marginBottom: '2rem',
    fontStyle: 'italic',
  },
  features: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '2rem',
  },
  feature: {
    fontSize: '1rem',
    color: theme.colors.text,
    marginBottom: '0.75rem',
    paddingLeft: '0.5rem',
  },
  button: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
  },
  trialNote: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    marginTop: '0.75rem',
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: theme.colors.backgroundLight,
  },
  tableRow: {
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  tableCell: {
    padding: '1.25rem',
    textAlign: 'center',
    fontSize: '1rem',
    color: theme.colors.text,
  },
  tableCellLeft: {
    textAlign: 'left',
    fontWeight: '600',
  },
  faqContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  faqItem: {
    backgroundColor: theme.colors.white,
    marginBottom: '1rem',
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.shadows.sm,
    overflow: 'hidden',
  },
  faqQuestion: {
    width: '100%',
    padding: '1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqIcon: {
    fontSize: '1.5rem',
    color: theme.colors.primary,
    fontWeight: '400',
  },
  faqAnswer: {
    padding: '0 1.5rem 1.5rem 1.5rem',
    fontSize: '1rem',
    color: theme.colors.textLight,
    lineHeight: '1.7',
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