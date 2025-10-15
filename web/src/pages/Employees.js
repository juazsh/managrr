import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeService';
import { theme } from '../theme';

const Employees = () => {
  const navigate = useNavigate(); 
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await employeeService.getAllEmployees();
      setEmployees(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeAdded = () => {
    setShowAddModal(false);
    fetchEmployees();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Loading employees...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/contractor/dashboard')} style={styles.backButton}>
      ← Back to Dashboard
    </button>
      <div style={styles.header}>
        <h1 style={styles.title}>Employees</h1>
        <button 
          onClick={() => setShowAddModal(true)} 
          style={styles.addButton}
        >
          + Add Employee
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {employees.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No employees yet. Add your first employee to get started.</p>
        </div>
      ) : (
        <div style={styles.employeeList}>
          {employees.map((employee) => (
            <Link 
              key={employee.id} 
              to={`/contractor/employees/${employee.id}`}
              style={styles.employeeCard}
            >
              <div style={styles.employeeHeader}>
                <div style={styles.employeeInfo}>
                  <h3 style={styles.employeeName}>{employee.name}</h3>
                  <p style={styles.employeeEmail}>{employee.email}</p>
                  {employee.phone && (
                    <p style={styles.employeePhone}>📞 {employee.phone}</p>
                  )}
                </div>
                <div style={styles.employeeMeta}>
                  <div style={styles.hourlyRate}>
                    ${employee.hourly_rate}/hr
                  </div>
                  {employee.is_active ? (
                    <span style={styles.activeBadge}>Active</span>
                  ) : (
                    <span style={styles.inactiveBadge}>Inactive</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleEmployeeAdded}
        />
      )}
    </div>
  );
};

const AddEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hourly_rate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        hourly_rate: parseFloat(formData.hourly_rate)
      };
      await employeeService.createEmployee(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Add New Employee</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        {error && <div style={styles.modalError}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Hourly Rate ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.modalActions}>
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelButton}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: theme.spacing.component,
  },
  backButton: {
    padding: "0.625rem 1.25rem",
    backgroundColor: "transparent",
    color: theme.colors.text,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: "pointer",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    marginBottom: theme.spacing.element,
    transition: "all 0.2s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.section,
    gap: theme.spacing.element,
    flexWrap: "wrap",
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    margin: "0",
    letterSpacing: "-0.02em",
  },
  addButton: {
    padding: "0.875rem 1.75rem",
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.sm,
  },
  message: {
    textAlign: "center",
    color: theme.colors.textLight,
    fontSize: theme.typography.bodyLarge.fontSize,
    padding: "3rem 1rem",
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: theme.spacing.element,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.component,
    border: `1px solid ${theme.colors.error}`,
    fontSize: theme.typography.body.fontSize,
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 1.25rem",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  emptyText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.bodyLarge.fontSize,
    lineHeight: "1.6",
  },
  employeeList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.element,
  },
  employeeCard: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.component,
    textDecoration: "none",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.sm,
  },
  employeeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1.25rem",
    flexWrap: "wrap",
  },
  employeeInfo: {
    flex: 1,
    minWidth: "200px",
  },
  employeeName: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    margin: "0 0 0.5rem 0",
  },
  employeeEmail: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textLight,
    margin: "0 0 0.25rem 0",
  },
  employeePhone: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    margin: "0",
  },
  employeeMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.625rem",
  },
  hourlyRate: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  activeBadge: {
    padding: "0.375rem 0.875rem",
    backgroundColor: theme.colors.success,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
  },
  inactiveBadge: {
    padding: "0.375rem 0.875rem",
    backgroundColor: theme.colors.textLight,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.small.fontSize,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: theme.shadows.xl,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.component,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "700",
    color: theme.colors.text,
    margin: "0",
    letterSpacing: "-0.01em",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    color: theme.colors.textLight,
    cursor: "pointer",
    padding: "0",
    width: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "1",
    transition: "color 0.2s ease",
  },
  modalError: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: "0.875rem",
    border: `1px solid ${theme.colors.error}`,
    margin: `${theme.spacing.element} ${theme.spacing.component} 0`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
  },
  form: {
    padding: theme.spacing.component,
  },
  formGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.875rem",
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: theme.spacing.component,
    flexWrap: "wrap",
  },
  cancelButton: {
    padding: "0.875rem 1.75rem",
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  submitButton: {
    padding: "0.875rem 1.75rem",
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows.sm,
  },
}

export default Employees;