import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.linkText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
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
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    marginBottom: theme.spacing.component,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.element,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    color: theme.colors.text,
    fontWeight: '500',
    fontSize: theme.typography.small.fontSize,
  },
  input: {
    padding: `0.75rem ${theme.spacing.element}`,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
  },
  button: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: `0.75rem ${theme.spacing.element}`,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: theme.spacing.element,
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: `0.75rem ${theme.spacing.element}`,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.element,
    fontSize: theme.typography.small.fontSize,
  },
  linkText: {
    textAlign: 'center',
    marginTop: theme.spacing.component,
    color: theme.colors.textLight,
    fontSize: theme.typography.small.fontSize,
  },
  link: {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Login;