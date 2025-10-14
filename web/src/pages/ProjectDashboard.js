import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import PhotosSection from '../components/dashboard/PhotosSection';
import UpdatesSection from '../components/dashboard/UpdatesSection';
import ExpensesSection from '../components/dashboard/ExpensesSection';
import WorkLogsSection from '../components/dashboard/WorkLogsSection';
import { theme } from '../theme';

const ProjectDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('photos');

  useEffect(() => {
    loadDashboard();
  }, [id]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjectDashboard(id);
      setDashboard(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this project dashboard.');
      } else if (err.response?.status === 404) {
        setError('Project not found.');
      } else {
        setError('Failed to load project dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading project dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          Back to Projects
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  const isContractor = user?.user_type === 'contractor' && 
                       dashboard.project.contractor_id === user.id;
  const isOwner = user?.user_type === 'house_owner' && 
                  dashboard.project.owner_id === user.id;
  const isEmployee = user?.user_type === 'employee';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Back
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>{dashboard.project.title}</h1>
          <span style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(dashboard.project.status)
          }}>
            {dashboard.project.status}
          </span>
        </div>
      </div>

      <div style={styles.projectInfo}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Project Details</h3>
          <p style={styles.description}>{dashboard.project.description}</p>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Estimated Cost:</span>
              <span style={styles.value}>
                ${parseFloat(dashboard.project.estimated_cost).toLocaleString()}
              </span>
            </div>
            {dashboard.project.address && (
              <div style={styles.infoItem}>
                <span style={styles.label}>Address:</span>
                <span style={styles.value}>{dashboard.project.address}</span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Owner</h3>
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{dashboard.owner_info.name}</span>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{dashboard.owner_info.email}</span>
            </div>
            {dashboard.owner_info.phone && (
              <div style={styles.contactItem}>
                <span style={styles.label}>Phone:</span>
                <span style={styles.value}>{dashboard.owner_info.phone}</span>
              </div>
            )}
          </div>
        </div>

        {dashboard.contractor && (
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Contractor</h3>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.label}>Name:</span>
                <span style={styles.value}>{dashboard.contractor.name}</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.label}>Email:</span>
                <span style={styles.value}>{dashboard.contractor.email}</span>
              </div>
              {dashboard.contractor.phone && (
                <div style={styles.contactItem}>
                  <span style={styles.label}>Phone:</span>
                  <span style={styles.value}>{dashboard.contractor.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isEmployee && (
        <>
          <div style={styles.tabs}>
            <button
              style={activeTab === 'photos' ? {...styles.tab, ...styles.activeTab} : styles.tab}
              onClick={() => setActiveTab('photos')}
            >
              📷 Progress Photos
            </button>
            <button
              style={activeTab === 'updates' ? {...styles.tab, ...styles.activeTab} : styles.tab}
              onClick={() => setActiveTab('updates')}
            >
              📝 Updates
            </button>
            <button
              style={activeTab === 'expenses' ? {...styles.tab, ...styles.activeTab} : styles.tab}
              onClick={() => setActiveTab('expenses')}
            >
              💰 Expenses
            </button>
            <button
              style={activeTab === 'worklogs' ? {...styles.tab, ...styles.activeTab} : styles.tab}
              onClick={() => setActiveTab('worklogs')}
            >
              ⏰ Work Logs
            </button>
          </div>

          <div style={styles.content}>
            {activeTab === 'photos' && (
              <PhotosSection
                projectId={id}
                photos={dashboard.recent_photos}
                canUpload={isOwner || isContractor}
                onPhotoUploaded={loadDashboard}
              />
            )}
            {activeTab === 'updates' && (
              <UpdatesSection
                projectId={id}
                updates={dashboard.latest_updates}
                isContractor={isContractor}
                onUpdateCreated={loadDashboard}
              />
            )}
            {activeTab === 'expenses' && (
              <ExpensesSection
                projectId={id}
                expenses={dashboard.recent_expenses}
                summary={dashboard.expense_summary}
                canAdd={isOwner || isContractor}
                onExpenseAdded={loadDashboard}
              />
            )}
            {activeTab === 'worklogs' && (
              <WorkLogsSection
                projectId={id}
                summary={dashboard.work_logs_summary}
                recentCheckIns={dashboard.recent_check_ins}
              />
            )}
          </div>
        </>
      )}

      {isEmployee && (
        <div style={styles.content}>
          <WorkLogsSection
            projectId={id}
            summary={dashboard.work_logs_summary}
            recentCheckIns={dashboard.recent_check_ins}
            isEmployee={true}
          />
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    draft: '#6B7280',
    active: '#10B981',
    completed: '#3B82F6',
  };
  return colors[status] || '#6B7280';
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.125rem',
    color: theme.colors.textLight,
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1rem',
  },
  header: {
    marginBottom: '2rem',
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.primary,
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.5rem 0',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.colors.white,
    textTransform: 'capitalize',
  },
  projectInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
  },
  infoTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  description: {
    color: theme.colors.textLight,
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  contactItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  value: {
    fontSize: '0.95rem',
    color: theme.colors.text,
    fontWeight: '600',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: `2px solid ${theme.colors.backgroundLight}`,
    marginBottom: '2rem',
    overflowX: 'auto',
  },
  tab: {
    padding: '1rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: theme.colors.textLight,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  activeTab: {
    color: theme.colors.primary,
    borderBottom: `3px solid ${theme.colors.primary}`,
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    padding: '2rem',
    minHeight: '400px',
  },
};

export default ProjectDashboard;