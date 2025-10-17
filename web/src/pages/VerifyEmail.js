import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { theme } from '../theme';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        if (!hasVerified.current) return;
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verifyEmail();
  }, []);

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
            <div style={styles.spinner}></div>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={styles.titleError}>Verification Failed</h2>
            <p style={styles.messageError}>{message}</p>
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
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto',
    border: '4px solid ' + theme.colors.border,
    borderTop: '4px solid ' + theme.colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default VerifyEmail;