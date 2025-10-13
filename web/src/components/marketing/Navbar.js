import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { theme } from '../../theme';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>Managrr</Link>

        <button 
          style={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </button>

        <div style={{
          ...styles.navLinks,
          ...(isMobileMenuOpen ? styles.navLinksMobile : {}),
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) ? styles.navLinkActive : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.ctaButtons}>
          <Link to="/login" style={styles.signInButton}>
            Sign In
          </Link>
          <Link to="/register" style={styles.getStartedButton}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: theme.colors.white,
    boxShadow: theme.shadows.sm,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${theme.spacing.element} ${theme.spacing.component}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.colors.primary,
    textDecoration: 'none',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  hamburgerLine: {
    width: '24px',
    height: '2px',
    backgroundColor: theme.colors.text,
    borderRadius: '2px',
  },
  navLinks: {
    display: 'flex',
    gap: theme.spacing.component,
    alignItems: 'center',
  },
  navLinksMobile: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    boxShadow: theme.shadows.md,
    padding: theme.spacing.component,
    gap: theme.spacing.element,
  },
  navLink: {
    color: theme.colors.text,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
    transition: 'color 0.2s',
  },
  navLinkActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  ctaButtons: {
    display: 'flex',
    gap: theme.spacing.element,
    alignItems: 'center',
  },
  signInButton: {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
    padding: `0.5rem ${theme.spacing.element}`,
  },
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
    padding: `0.75rem 1.5rem`,
    borderRadius: theme.borderRadius.md,
    fontWeight: '500',
  },
};

export default Navbar;