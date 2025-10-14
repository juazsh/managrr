import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theme } from '../theme';
import workLogService from '../services/workLogService';

const WorkLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workLog, setWorkLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchWorkLog();
  }, [id]);

  const fetchWorkLog = async () => {
    try {
      setLoading(true);
      const data = await workLogService.getWorkLogById(id);
      setWorkLog(data);
    } catch (err) {
      setError('Failed to load work log details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkOut) return 'In Progress';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = (diff / (1000 * 60 * 60)).toFixed(2);
    return `${hours} hours`;
  };

  const handleBack = () => {
    navigate('/contractor/work-logs');
  };

  const openPhotoModal = (photoUrl) => {
    setSelectedPhoto(photoUrl);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading work log details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          {error}
          <button onClick={handleBack} style={styles.backButton}>
            Back to Work Logs
          </button>
        </div>
      </div>
    );
  }

  if (!workLog) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Work log not found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backButton}>
          ← Back to Work Logs
        </button>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Work Log Details</h1>

        <div style={styles.infoSection}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Employee:</span>
            <span style={styles.infoValue}>{workLog.employee_name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Project:</span>
            <span style={styles.infoValue}>{workLog.project_title}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Hours Worked:</span>
            <span style={styles.infoValue}>
              {calculateHours(workLog.check_in_time, workLog.check_out_time)}
            </span>
          </div>
        </div>

        <div style={styles.timeSection}>
          <h2 style={styles.sectionTitle}>Time Log</h2>
          <div style={styles.timeGrid}>
            <div style={styles.timeCard}>
              <div style={styles.timeLabel}>Check-in</div>
              <div style={styles.timeValue}>{formatDateTime(workLog.check_in_time)}</div>
              {workLog.check_in_latitude && workLog.check_in_longitude && (
                <div style={styles.gpsInfo}>
                  📍 GPS: {workLog.check_in_latitude.toFixed(6)}, {workLog.check_in_longitude.toFixed(6)}
                  <a
                    href={`https://www.google.com/maps?q=${workLog.check_in_latitude},${workLog.check_in_longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.mapLink}
                  >
                    View on Map
                  </a>
                </div>
              )}
            </div>

            {workLog.check_out_time && (
              <div style={styles.timeCard}>
                <div style={styles.timeLabel}>Check-out</div>
                <div style={styles.timeValue}>{formatDateTime(workLog.check_out_time)}</div>
                {workLog.check_out_latitude && workLog.check_out_longitude && (
                  <div style={styles.gpsInfo}>
                    📍 GPS: {workLog.check_out_latitude.toFixed(6)}, {workLog.check_out_longitude.toFixed(6)}
                    <a
                      href={`https://www.google.com/maps?q=${workLog.check_out_latitude},${workLog.check_out_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.mapLink}
                    >
                      View on Map
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={styles.photosSection}>
          <h2 style={styles.sectionTitle}>Photos</h2>
          <div style={styles.photosGrid}>
            {workLog.check_in_photo_url && (
              <div style={styles.photoCard}>
                <div style={styles.photoHeader}>
                  <span style={styles.photoLabel}>Check-in Photo</span>
                  <span style={styles.photoTime}>
                    {new Date(workLog.check_in_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <img
                  src={workLog.check_in_photo_url}
                  alt="Check-in"
                  style={styles.photo}
                  onClick={() => openPhotoModal(workLog.check_in_photo_url)}
                />
              </div>
            )}

            {workLog.check_out_photo_url && (
              <div style={styles.photoCard}>
                <div style={styles.photoHeader}>
                  <span style={styles.photoLabel}>Check-out Photo</span>
                  <span style={styles.photoTime}>
                    {new Date(workLog.check_out_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <img
                  src={workLog.check_out_photo_url}
                  alt="Check-out"
                  style={styles.photo}
                  onClick={() => openPhotoModal(workLog.check_out_photo_url)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <div style={styles.modal} onClick={closePhotoModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closePhotoModal}>
              ×
            </button>
            <img src={selectedPhoto} alt="Full size" style={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: theme.spacing.component,
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.textLight,
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    color: theme.colors.error,
    fontSize: theme.typography.bodyLarge.fontSize,
  },
  header: {
    marginBottom: theme.spacing.component,
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.backgroundLight,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  card: {
    background: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    margin: '0 0 2rem 0',
  },
  infoSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  infoLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '600',
  },
  timeSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.element,
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing.element,
  },
  timeCard: {
    padding: '1.5rem',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${theme.colors.border}`,
  },
  timeLabel: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  timeValue: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  gpsInfo: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  mapLink: {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: theme.typography.small.fontSize,
  },
  photosSection: {
    marginBottom: '1rem',
  },
  photosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing.element,
  },
  photoCard: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  photoHeader: {
    padding: '1rem',
    backgroundColor: theme.colors.background,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  photoTime: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  photo: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  closeButton: {
    position: 'absolute',
    top: '-3rem',
    right: '0',
    background: 'none',
    border: 'none',
    color: theme.colors.white,
    fontSize: '3rem',
    cursor: 'pointer',
    fontWeight: '300',
    lineHeight: '1',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '90vh',
    objectFit: 'contain',
    borderRadius: theme.borderRadius.md,
  },
};

export default WorkLogDetail;