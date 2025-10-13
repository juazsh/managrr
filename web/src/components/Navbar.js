import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to={isAuthenticated ? '/dashboard' : '/'} style={styles.brand}>
          <span style={styles.logo}>managrr</span>
        </Link>
        <div style={styles.menu}>
          {isAuthenticated ? (
            <>
              <span style={styles.username}>{user?.name}</span>
              <button onClick={handleLogout} style={styles.button}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.buttonLink}>Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: theme.colors.white,
    padding: `${theme.spacing.element} 0`,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing.component}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    textDecoration: 'none',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: '-0.02em',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.component,
  },
  link: {
    color: theme.colors.text,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  username: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  button: {
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
  },
  buttonLink: {
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    textDecoration: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    display: 'inline-block',
  },
};

export default Navbar;