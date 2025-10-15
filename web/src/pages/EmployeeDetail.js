import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeService';
import projectService from '../services/projectService';
import { theme } from '../theme';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      setError('');
      const [empData, projectsData] = await Promise.all([
        employeeService.getEmployee(id),
        projectService.getAllProjects()
      ]);
      setEmployee(empData);
      setFormData({
        name: empData.name,
        email: empData.email,
        phone: empData.phone || '',
        hourly_rate: empData.hourly_rate
      });
      setAvailableProjects(projectsData.projects || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
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
      await employeeService.updateEmployee(id, payload);
      await loadEmployeeData();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) {
      return;
    }

    try {
      await employeeService.deleteEmployee(id);
      navigate('/contractor/employees');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate employee');
    }
  };

  const handleAssignProject = async (projectId) => {
    try {
      setError('');
      await employeeService.assignProject(id, projectId);
      await loadEmployeeData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign project');
    }
  };

  const isProjectAssigned = (projectId) => {
    return employee?.assigned_projects?.some(p => p.id === projectId);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Loading employee...</p>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => navigate('/contractor/employees')} style={styles.backButton}>
          ← Back to Employees
        </button>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/contractor/employees')} style={styles.backButton}>
        ← Back to Employees
      </button>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>{employee.name}</h1>
          {employee.is_active ? (
            <span style={styles.activeBadge}>Active</span>
          ) : (
            <span style={styles.inactiveBadge}>Inactive</span>
          )}
        </div>

        {!isEditing ? (
          <div style={styles.detailsView}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Email:</span>
              <span style={styles.detailValue}>{employee.email}</span>
            </div>
            {employee.phone && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Phone:</span>
                <span style={styles.detailValue}>{employee.phone}</span>
              </div>
            )}
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Hourly Rate:</span>
              <span style={styles.detailValue}>${employee.hourly_rate}/hr</span>
            </div>

            <div style={styles.actions}>
              <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                Edit Details
              </button>
              <button onClick={handleDeactivate} style={styles.deactivateButton}>
                Deactivate Employee
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
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
              <label style={styles.label}>Hourly Rate ($)</label>
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

            <div style={styles.formActions}>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone || '',
                    hourly_rate: employee.hourly_rate
                  });
                }} 
                style={styles.cancelButton}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={styles.saveButton}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Assigned Projects</h2>
        {employee.assigned_projects && employee.assigned_projects.length > 0 ? (
          <div style={styles.projectList}>
            {employee.assigned_projects.map((project) => (
              <div key={project.id} style={styles.projectItem}>
                <span style={styles.projectName}>{project.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noProjects}>No projects assigned yet.</p>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Assign to Projects</h2>
        {availableProjects.length === 0 ? (
          <p style={styles.noProjects}>No projects available.</p>
        ) : (
          <div style={styles.projectGrid}>
            {availableProjects.map((project) => {
              const isAssigned = isProjectAssigned(project.id);
              return (
                <div key={project.id} style={styles.projectCard}>
                  <div style={styles.projectInfo}>
                    <h3 style={styles.projectTitle}>{project.title}</h3>
                    {project.address && (
                      <p style={styles.projectAddress}>📍 {project.address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAssignProject(project.id)}
                    disabled={isAssigned}
                    style={isAssigned ? styles.assignedButton : styles.assignButton}
                  >
                    {isAssigned ? '✓ Assigned' : 'Assign'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
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
  card: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.lg,
    padding: '32px',
    marginBottom: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0',
  },
  activeBadge: {
    padding: '6px 16px',
    backgroundColor: theme.colors.success,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    fontSize: '14px',
    fontWeight: '600',
  },
  inactiveBadge: {
    padding: '6px 16px',
    backgroundColor: theme.colors.textLight,
    color: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    fontSize: '14px',
    fontWeight: '600',
  },
  detailsView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  detailRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '15px',
    color: theme.colors.textLight,
    fontWeight: '600',
    minWidth: '120px',
  },
  detailValue: {
    fontSize: '16px',
    color: theme.colors.text,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  editButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deactivateButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.white,
    color: '#DC2626',
    border: '1px solid #DC2626',
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '8px',
  },
  input: {
    padding: '12px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontFamily: theme.typography.fontFamily,
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
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
  saveButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '20px',
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  projectItem: {
    padding: '12px 16px',
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
  },
  projectName: {
    fontSize: '16px',
    color: theme.colors.text,
    fontWeight: '500',
  },
  noProjects: {
    color: theme.colors.textLight,
    fontSize: '15px',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
  },
  projectCard: {
    padding: '16px',
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0 0 8px 0',
  },
  projectAddress: {
    fontSize: '14px',
    color: theme.colors.textLight,
    margin: '0',
  },
  assignButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  assignedButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.borderLight,
    color: theme.colors.textLight,
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
};

export default EmployeeDetail;