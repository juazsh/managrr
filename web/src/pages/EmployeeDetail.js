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
      maxWidth: "900px",
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
    card: {
      backgroundColor: theme.colors.white,
      border: `1px solid ${theme.colors.borderLight}`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.section,
      marginBottom: theme.spacing.component,
      boxShadow: theme.shadows.sm,
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.component,
      gap: theme.spacing.element,
      flexWrap: "wrap",
    },
    title: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      margin: "0",
      letterSpacing: "-0.02em",
    },
    activeBadge: {
      padding: "0.5rem 1.125rem",
      backgroundColor: theme.colors.success,
      color: theme.colors.white,
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
    },
    inactiveBadge: {
      padding: "0.5rem 1.125rem",
      backgroundColor: theme.colors.textLight,
      color: theme.colors.white,
      borderRadius: theme.borderRadius.full,
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
    },
    detailsView: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing.element,
    },
    detailRow: {
      display: "flex",
      gap: "0.75rem",
      alignItems: "center",
      padding: "0.75rem 0",
      borderBottom: `1px solid ${theme.colors.borderLight}`,
    },
    detailLabel: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.textLight,
      fontWeight: "600",
      minWidth: "120px",
    },
    detailValue: {
      fontSize: theme.typography.bodyLarge.fontSize,
      color: theme.colors.text,
      fontWeight: "500",
    },
    actions: {
      display: "flex",
      gap: "0.75rem",
      marginTop: theme.spacing.component,
      flexWrap: "wrap",
    },
    editButton: {
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
    deactivateButton: {
      padding: "0.875rem 1.75rem",
      backgroundColor: theme.colors.white,
      color: theme.colors.error,
      border: `2px solid ${theme.colors.error}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: "0.5rem",
    },
    input: {
      padding: "0.875rem",
      border: `2px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontFamily: theme.typography.fontFamily,
      transition: "all 0.2s ease",
    },
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      marginTop: "0.5rem",
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
    saveButton: {
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
    sectionTitle: {
      fontSize: theme.typography.h4.fontSize,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.element,
      letterSpacing: "-0.01em",
    },
    projectList: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    projectItem: {
      padding: "0.875rem 1.125rem",
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: theme.borderRadius.md,
      border: `1px solid ${theme.colors.borderLight}`,
    },
    projectName: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text,
      fontWeight: "500",
    },
    noProjects: {
      color: theme.colors.textLight,
      fontSize: theme.typography.body.fontSize,
    },
    projectGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))",
      gap: theme.spacing.element,
    },
    projectCard: {
      padding: theme.spacing.element,
      border: `1px solid ${theme.colors.borderLight}`,
      borderRadius: theme.borderRadius.md,
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      backgroundColor: theme.colors.white,
      transition: "all 0.2s ease",
    },
    projectInfo: {
      flex: 1,
    },
    projectTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: "600",
      color: theme.colors.text,
      margin: "0 0 0.5rem 0",
    },
    projectAddress: {
      fontSize: theme.typography.small.fontSize,
      color: theme.colors.textLight,
      margin: "0",
    },
    assignButton: {
      padding: "0.625rem 1.25rem",
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.small.fontSize,
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    assignedButton: {
      padding: "0.625rem 1.25rem",
      backgroundColor: theme.colors.backgroundLight,
      color: theme.colors.textLight,
      border: `1px solid ${theme.colors.borderLight}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.small.fontSize,
      fontWeight: "600",
      cursor: "not-allowed",
    },
  }
  

export default EmployeeDetail;