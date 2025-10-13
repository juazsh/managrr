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

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav style={styles.navbar}>
      <style>{mediaQueries}</style>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>Managrr</Link>

        <button 
          className="hamburger"
          style={styles.hamburger}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </button>

        <div 
          className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          style={styles.navLinks}
        >
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              style={{
                ...styles.navLink,
                ...(isActive(link.path) ? styles.navLinkActive : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="mobile-cta-buttons" style={styles.mobileCtaButtons}>
            <Link to="/login" style={styles.mobileSignInButton} onClick={handleLinkClick}>
              Sign In
            </Link>
            <Link to="/register" style={styles.mobileGetStartedButton} onClick={handleLinkClick}>
              Get Started
            </Link>
          </div>
        </div>

        <div className="cta-buttons" style={styles.ctaButtons}>
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

const mediaQueries = `
  @media (max-width: 768px) {
    .hamburger {
      display: flex !important;
    }
    
    .nav-links {
      display: none !important;
    }
    
    .nav-links.mobile-open {
      display: flex !important;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      gap: 0;
      z-index: 1000;
    }
    
    .cta-buttons {
      display: none !important;
    }
    
    .mobile-cta-buttons {
      display: flex !important;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #f0f0f0;
      margin-top: 1rem;
    }
    
    .nav-links.mobile-open a {
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
  }
  
  @media (min-width: 769px) {
    .hamburger {
      display: none !important;
    }
    
    .mobile-cta-buttons {
      display: none !important;
    }
  }
`;

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
    position: 'relative',
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
  mobileCtaButtons: {
    display: 'none',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  mobileSignInButton: {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
    padding: '0.75rem 0',
    textAlign: 'center',
    fontWeight: '500',
  },
  mobileGetStartedButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
    padding: '0.75rem 1.5rem',
    borderRadius: theme.borderRadius.md,
    fontWeight: '500',
    textAlign: 'center',
  },
};

export default Navbar;