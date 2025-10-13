import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 2rem',
    textAlign: 'center',
  },
  message: {
    fontSize: '1.125rem',
    color: '#6B7280',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '2rem',
    borderRadius: '0.5rem',
  },
};

export default ProtectedRoute;