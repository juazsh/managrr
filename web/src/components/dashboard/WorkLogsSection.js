import React from 'react';
import { theme } from '../../theme';

const WorkLogsSection = ({ projectId, summary, recentCheckIns, isEmployee }) => {
  return (
    <div>
      <h2 style={styles.sectionTitle}>
        {isEmployee ? 'My Work Logs' : 'Work Logs'}
      </h2>

      {summary && (
        <div style={styles.summaryCards}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>⏱️</div>
            <div>
              <p style={styles.summaryLabel}>Hours This Week</p>
              <p style={styles.summaryValue}>
                {summary.total_hours_this_week?.toFixed(1) || '0'} hrs
              </p>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{...styles.summaryIcon, backgroundColor: '#DBEAFE', color: '#1E40AF'}}>
              👷
            </div>
            <div>
              <p style={styles.summaryLabel}>
                {isEmployee ? 'You' : 'Active Employees'}
              </p>
              <p style={styles.summaryValue}>
                {summary.active_employees || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 style={styles.recentTitle}>Recent Check-ins</h3>

      {recentCheckIns && recentCheckIns.length > 0 ? (
        <div style={styles.checkInsList}>
          {recentCheckIns.map((checkIn) => (
            <div key={checkIn.id} style={styles.checkInCard}>
              <div style={styles.checkInHeader}>
                <div style={styles.employeeInfo}>
                  <h4 style={styles.employeeName}>{checkIn.employee_name}</h4>
                  <p style={styles.checkInTime}>
                    {new Date(checkIn.check_in_time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {checkIn.check_in_photo_url && (
                  <div style={styles.photoPreview}>
                    <img 
                      src={checkIn.check_in_photo_url} 
                      alt={`${checkIn.employee_name} check-in`}
                      style={styles.checkInPhoto}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>
            {isEmployee 
              ? 'No check-ins yet. Check in when you arrive at the work site!'
              : 'No employee check-ins yet'
            }
          </p>
        </div>
      )}

      {isEmployee && (
        <div style={styles.mobileHint}>
          <p style={styles.hintText}>
            💡 Use the mobile app to check in and out of work
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '2rem',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: theme.colors.backgroundLight,
    padding: '1.25rem',
    borderRadius: theme.borderRadius.md,
  },
  summaryIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  summaryLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    margin: '0 0 0.25rem 0',
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
  },
  recentTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  checkInsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  checkInCard: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: '1.25rem',
  },
  checkInHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0 0 0.25rem 0',
  },
  checkInTime: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    margin: 0,
  },
  photoPreview: {
    marginLeft: '1rem',
  },
  checkInPhoto: {
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.md,
    objectFit: 'cover',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
  },
  emptyText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
  },
  mobileHint: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#EFF6FF',
    borderRadius: theme.borderRadius.md,
  },
  hintText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#1E40AF',
  },
};

export default WorkLogsSection;