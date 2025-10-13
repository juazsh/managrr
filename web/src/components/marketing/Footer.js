import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.column}>
            <h4 style={styles.heading}>Product</h4>
            <Link to="/features" style={styles.link}>Features</Link>
            <Link to="/pricing" style={styles.link}>Pricing</Link>
            <Link to="/how-it-works" style={styles.link}>How It Works</Link>
          </div>

          <div style={styles.column}>
            <h4 style={styles.heading}>Company</h4>
            <Link to="/about" style={styles.link}>About</Link>
            <Link to="/contact" style={styles.link}>Contact</Link>
          </div>

          <div style={styles.column}>
            <h4 style={styles.heading}>Legal</h4>
            <Link to="/terms" style={styles.link}>Terms of Service</Link>
            <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
          </div>

          <div style={styles.column}>
            <h4 style={styles.heading}>Contact</h4>
            <a href="mailto:support@managrr.com" style={styles.link}>
              support@managrr.com
            </a>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {currentYear} Managrr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: theme.colors.text,
    color: theme.colors.white,
    padding: `${theme.spacing.section} 0 ${theme.spacing.component} 0`,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing.component}`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.component,
    marginBottom: theme.spacing.component,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.element,
  },
  heading: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: theme.colors.white,
  },
  link: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    fontSize: theme.typography.small.fontSize,
    transition: 'color 0.2s',
  },
  bottom: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: theme.spacing.component,
    textAlign: 'center',
  },
  copyright: {
    fontSize: theme.typography.small.fontSize,
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

export default Footer;