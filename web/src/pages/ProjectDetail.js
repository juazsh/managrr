import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import { theme } from '../theme';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectById(id);
      setProject(data.project);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error || 'Project not found'}</div>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6B7280',
      active: '#10B981',
      completed: '#3B82F6',
    };
    return colors[status] || '#6B7280';
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
        ← Back to Dashboard
      </button>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{project.title}</h1>
          <p style={styles.address}>📍 {project.address}</p>
        </div>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(project.status),
          }}
        >
          {project.status}
        </span>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Description</h2>
          <p style={styles.description}>{project.description}</p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Project Details</h2>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Estimated Cost:</span>
              <span style={styles.detailValue}>
                ${parseFloat(project.estimated_cost).toLocaleString()}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Created:</span>
              <span style={styles.detailValue}>
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Status:</span>
              <span style={styles.detailValue}>{project.status}</span>
            </div>
          </div>
        </div>

        {project.contractor_id && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Contractor</h2>
            <p style={styles.placeholder}>Contractor information will appear here</p>
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Updates & Progress</h2>
          <p style={styles.placeholder}>Project updates and progress tracking coming soon</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
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
  backButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    backgroundColor: theme.colors.white,
    color: theme.colors.black,
    border: `1px solid ${theme.colors.black}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    marginBottom: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: `2px solid ${theme.colors.backgroundLight}`,
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0 0 0.5rem 0',
  },
  address: {
    fontSize: '1rem',
    color: theme.colors.textLight,
    margin: 0,
  },
  statusBadge: {
    padding: '0.5rem 1.25rem',
    borderRadius: '999px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'capitalize',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1rem',
    color: theme.colors.text,
    lineHeight: '1.6',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '1.125rem',
    color: theme.colors.text,
    fontWeight: '600',
  },
  placeholder: {
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
};

export default ProjectDetail;