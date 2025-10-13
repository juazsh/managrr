import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'house_owner',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.userType);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Registration Successful!</h2>
          <p style={styles.successMessage}>
            Please check your email to verify your account. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
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
          <div style={styles.formGroup}>
            <label style={styles.label}>User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="house_owner">House Owner</option>
              <option value="contractor">Contractor</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <button type="submit" style={styles.button}>Register</button>
        </form>
        <p style={styles.linkText}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
  successMessage: {
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: theme.typography.body.fontSize,
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

export default Register;