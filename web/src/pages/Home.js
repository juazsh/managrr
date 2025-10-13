import React from 'react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Managrr</h1>
        {user && (
          <div style={styles.userInfo}>
            <p style={styles.greeting}>Hello, {user.name}!</p>
            <p style={styles.userType}>User Type: {user.user_type}</p>
          </div>
        )}
        <p style={styles.description}>
          Construction project management platform connecting house owners, contractors, and employees.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 100px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    fontFamily: theme.typography.fontFamily,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xxl,
    borderRadius: theme.borderRadius.xl,
    boxShadow: theme.shadows.lg,
    maxWidth: '600px',
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    marginBottom: theme.spacing.lg,
  },
  userInfo: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    color: theme.colors.primary,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    marginBottom: theme.spacing.sm,
  },
  userType: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
  },
  description: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
    lineHeight: '1.6',
  },
};

export default Home;