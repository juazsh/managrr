import React from 'react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>
          <span style={styles.titleAccent}>Secure, simple</span><br />
          Construction Management
        </h1>
        {user && (
          <div style={styles.userCard}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={styles.greeting}>Welcome back, {user.name}!</p>
                <p style={styles.userType}>{user.user_type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}
        <p style={styles.description}>
          Build, manage, and track construction projects with complete transparency. 
          Connect house owners, contractors, and employees in one seamless platform.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.section,
    fontFamily: theme.typography.fontFamily,
  },
  hero: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    lineHeight: theme.typography.h1.lineHeight,
    marginBottom: theme.spacing.component,
    letterSpacing: '-0.03em',
  },
  titleAccent: {
    color: theme.colors.primary,
  },
  userCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.component,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.component,
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: theme.shadows.md,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.element,
    justifyContent: 'center',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  greeting: {
    color: theme.colors.text,
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: '0.25rem',
  },
  userType: {
    color: theme.colors.textLight,
    fontSize: theme.typography.small.fontSize,
    textTransform: 'capitalize',
    textAlign: 'left',
  },
  description: {
    color: theme.colors.textLight,
    fontSize: theme.typography.bodyLarge.fontSize,
    lineHeight: '1.8',
    maxWidth: '600px',
    margin: '0 auto',
  },
};

export default Home;