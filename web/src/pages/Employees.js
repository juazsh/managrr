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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    marginBottom: theme.spacing.element,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0',
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  message: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: '16px',
  },
  error: {
    backgroundColor: '#FEE',
    color: '#C00',
    padding: '16px',
    borderRadius: theme.borderRadius.md,
    marginBottom: '24px',
    border: '1px solid #FCC',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyText: {
    color: theme.colors.textLight,
    fontSize: '18px',
  },
  employeeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  employeeCard: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    padding: '24px',
    textDecoration: 'none',
    transition: 'box-shadow 0.2s',
  },
  employeeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0 0 8px 0',
  },
  employeeEmail: {
    fontSize: '15px',
    color: theme.colors.textLight,
    margin: '0 0 4px 0',
  },
  employeePhone: {
    fontSize: '14px',
    color: theme.colors.textLight,
    margin: '0',
  },
  employeeMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  hourlyRate: {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.text,
  },
  activeBadge: {
    padding: '4px 12px',
    backgroundColor: theme.colors.success,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    fontSize: '12px',
    fontWeight: '600',
  },
  inactiveBadge: {
    padding: '4px 12px',
    backgroundColor: theme.colors.textLight,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    fontSize: '12px',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    color: theme.colors.textLight,
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalError: {
    backgroundColor: '#FEE',
    color: '#C00',
    padding: '12px 24px',
    border: '1px solid #FCC',
    margin: '16px 24px 0',
    borderRadius: theme.borderRadius.sm,
  },
  form: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontFamily: theme.typography.fontFamily,
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Employees;