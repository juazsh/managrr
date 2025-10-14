import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../services/projectService';
import { theme } from '../theme';

const Dashboard = () => {
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
      draft: '#6B7280',
      active: '#10B981',
      completed: '#3B82F6',
    };
    return colors[status] || '#6B7280';
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
        <h1 style={styles.title}>My Projects</h1>
        <Link to="/projects/new" style={styles.createButton}>
          + Create New Project
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No projects yet. Create your first project to get started!</p>
          <Link to="/projects/new" style={styles.emptyButton}>
            Create Project
          </Link>
        </div>
      ) : (
        <div style={styles.projectsGrid}>
          {projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.projectTitle}>{project.title}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(project.status),
                  }}
                >
                  {project.status}
                </span>
              </div>

              <p style={styles.projectDescription}>{project.description}</p>

              <div style={styles.cardFooter}>
                <div style={styles.costSection}>
                  <span style={styles.costLabel}>Estimated Cost:</span>
                  <span style={styles.costValue}>
                    ${parseFloat(project.estimated_cost).toLocaleString()}
                  </span>
                </div>
                <div style={styles.addressSection}>
                  <span style={styles.addressIcon}>📍</span>
                  <span style={styles.address}>{project.address}</span>
                </div>
              </div>

              <div style={styles.cardActions}>
                <Link to={`/projects/${project.id}/dashboard`} style={styles.dashboardButton}>
                  📊 View Dashboard
                </Link>
                <Link to={`/projects/${project.id}`} style={styles.detailsButton}>
                  Details →
                </Link>
              </div>
            </div>
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
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
  },
  createButton: {
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    padding: '0.75rem 1.5rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  message: {
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: '1.125rem',
    padding: '3rem',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
  },
  emptyText: {
    fontSize: '1.25rem',
    color: theme.colors.textLight,
    marginBottom: '2rem',
  },
  emptyButton: {
    display: 'inline-block',
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    padding: '1rem 2rem',
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  projectCard: {
    backgroundColor: theme.colors.white,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    textDecoration: 'none',
    color: theme.colors.text,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows.lg,
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  projectTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
    flex: 1,
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'capitalize',
    marginLeft: '0.5rem',
  },
  projectDescription: {
    color: theme.colors.textLight,
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  cardFooter: {
    borderTop: `1px solid ${theme.colors.backgroundLight}`,
    paddingTop: '1rem',
  },
  costSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  costLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
  costValue: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: theme.colors.primary,
  },
  addressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  addressIcon: {
    fontSize: '1rem',
  },
  address: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${theme.colors.backgroundLight}`,
  },
  dashboardButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detailsButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.backgroundDark}`,
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
};

export default Dashboard;