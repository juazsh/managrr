import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { theme } from '../theme';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <h2 style={styles.title}>Verifying Email...</h2>
            <p style={styles.message}>Please wait while we verify your email.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h2 style={styles.titleSuccess}>Email Verified!</h2>
            <p style={styles.message}>{message}</p>
            <Link to="/login" style={styles.button}>Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={styles.titleError}>Verification Failed</h2>
            <p style={styles.messageError}>{message}</p>
            <Link to="/register" style={styles.button}>Back to Register</Link>
          </>
        )}
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
    fontFamily: theme.typography.fontFamily,
    padding: theme.spacing.component,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.section,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    marginBottom: theme.spacing.element,
  },
  titleSuccess: {
    color: theme.colors.success,
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    marginBottom: theme.spacing.element,
  },
  titleError: {
    color: theme.colors.error,
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    marginBottom: theme.spacing.element,
  },
  message: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    marginBottom: theme.spacing.component,
  },
  messageError: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
    marginBottom: theme.spacing.component,
  },
  button: {
    display: 'inline-block',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: `0.75rem ${theme.spacing.component}`,
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
};

export default VerifyEmail;