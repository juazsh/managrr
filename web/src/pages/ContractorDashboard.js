import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../services/projectService';
import { theme } from '../theme';

const ContractorDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: theme.colors.textLight,
      active: theme.colors.success,
      completed: theme.colors.primary,
    };
    return colors[status] || theme.colors.textLight;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Loading projects...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Assigned Projects</h1>
        <div style={styles.headerActions}>
          <Link to="/contractor/employees" style={styles.manageButton}>
            👥 Manage Employees
          </Link>
          <Link to="/contractor/work-logs" style={styles.workLogsLink}>
            Work Logs
          </Link>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No projects assigned yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}/dashboard`}
              style={styles.card}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.projectTitle}>{project.title}</h3>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(project.status)
                }}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p style={styles.description}>{project.description}</p>
              )}

              {project.estimated_cost && (
                <div style={styles.cost}>
                  Budget: ${project.estimated_cost.toLocaleString()}
                </div>
              )}

              {project.address && (
                <div style={styles.address}>📍 {project.address}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
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
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  manageButton: {
    padding: '12px 24px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  workLogsLink: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.2s',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.borderRadius.lg,
    padding: '24px',
    textDecoration: 'none',
    display: 'block',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '12px',
  },
  projectTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0',
    flex: 1,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: theme.borderRadius.sm,
    fontSize: '12px',
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: '15px',
    color: theme.colors.textLight,
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  cost: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '8px',
  },
  address: {
    fontSize: '14px',
    color: theme.colors.textLight,
  },
};

export default ContractorDashboard;