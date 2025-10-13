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
        <Link to="/" style={styles.brand}>Managrr</Link>
        <div style={styles.menu}>
          {isAuthenticated ? (
            <>
              <span style={styles.username}>{user?.name}</span>
              <button onClick={handleLogout} style={styles.button}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: theme.colors.primary,
    padding: `${theme.spacing.element} 0`,
    boxShadow: theme.shadows.md,
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
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.white,
    textDecoration: 'none',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.element,
  },
  link: {
    color: theme.colors.white,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
  },
  username: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
  },
  button: {
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    border: 'none',
    padding: `0.5rem ${theme.spacing.element}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
};

export default Navbar;