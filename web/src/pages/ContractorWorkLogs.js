import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';
import workLogService from '../services/workLogService';
import employeeService from '../services/employeeService';
import projectService from '../services/projectService';

const ContractorWorkLogs = () => {
  const navigate = useNavigate();
  const [workLogs, setWorkLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [projectSummary, setProjectSummary] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchWorkLogs();
  }, [selectedEmployee, selectedProject, startDate, endDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [employeesData, projectsData, weeklyData, empSummary, projSummary] = await Promise.all([
        employeeService.getAllEmployees(),
        projectService.getAllProjects(),
        workLogService.getWeeklySummary(),
        workLogService.getSummaryByEmployee(),
        workLogService.getSummaryByProject(),
      ]);

      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
      const allProjects = projectsData?.projects || projectsData || [];
      setProjects(Array.isArray(allProjects) ? allProjects.filter(p => p.contractor_id) : []);
      
      setWeeklySummary(weeklyData || { total_hours: 0 });
      setEmployeeSummary(Array.isArray(empSummary) ? empSummary : []);
      setProjectSummary(Array.isArray(projSummary) ? projSummary : []);
      
      await fetchWorkLogs();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load data';
      setError(errorMsg);
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLogs = async () => {
    try {
      const filters = {
        employeeId: selectedEmployee,
        projectId: selectedProject,
        startDate,
        endDate,
      };
      const data = await workLogService.getWorkLogs(filters);
      setWorkLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch work logs:', err);
      setWorkLogs([]);
    }
  };

  const handleViewDetails = (workLogId) => {
    navigate(`/contractor/work-logs/${workLogId}`);
  };

  const clearFilters = () => {
    setSelectedEmployee('');
    setSelectedProject('');
    setStartDate('');
    setEndDate('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkOut) return 'In Progress';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = (diff / (1000 * 60 * 60)).toFixed(2);
    return `${hours} hrs`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading work logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Unable to Load Work Logs</h2>
          <div style={styles.error}>{error}</div>
          <p style={styles.errorHint}>
            This could be due to:
          </p>
          <ul style={styles.errorList}>
            <li>Network connectivity issues</li>
            <li>Server is temporarily unavailable</li>
            <li>Missing API endpoints (check if migration was run)</li>
          </ul>
          <button onClick={fetchInitialData} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/contractor/dashboard')} style={styles.backButton}>
            ← Back to Dashboard
          </button>
          <h1 style={styles.title}>Employee Work Logs</h1>
        </div>
      </div>

      <div style={styles.summarySection}>
        <h2 style={styles.sectionTitle}>Summary Statistics</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{(weeklySummary?.total_hours || 0).toFixed(1)} hrs</div>
            <div style={styles.statLabel}>Total Hours This Week</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{employeeSummary?.length || 0}</div>
            <div style={styles.statLabel}>Active Employees</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{workLogs?.length || 0}</div>
            <div style={styles.statLabel}>Total Work Sessions</div>
          </div>
        </div>

        {(employeeSummary?.length > 0 || projectSummary?.length > 0) && (
          <div style={styles.summaryTables}>
            {employeeSummary?.length > 0 && (
              <div style={styles.summaryTableContainer}>
                <h3 style={styles.summaryTableTitle}>Hours by Employee</h3>
                <div style={styles.summaryTable}>
                  {employeeSummary.map((emp) => (
                    <div key={emp.employee_id} style={styles.summaryRow}>
                      <span style={styles.summaryName}>{emp.employee_name}</span>
                      <span style={styles.summaryHours}>{(emp.total_hours || 0).toFixed(1)} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSummary?.length > 0 && (
              <div style={styles.summaryTableContainer}>
                <h3 style={styles.summaryTableTitle}>Hours by Project</h3>
                <div style={styles.summaryTable}>
                  {projectSummary.map((proj) => (
                    <div key={proj.project_id} style={styles.summaryRow}>
                      <span style={styles.summaryName}>{proj.project_title}</span>
                      <span style={styles.summaryHours}>{(proj.total_hours || 0).toFixed(1)} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.filtersSection}>
        <h2 style={styles.sectionTitle}>Filter Work Logs</h2>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={styles.select}
            >
              <option value="">All Employees</option>
              {employees && employees.length > 0 && employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={styles.select}
            >
              <option value="">All Projects</option>
              {projects && projects.length > 0 && projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.title}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.clearButtonContainer}>
            <button onClick={clearFilters} style={styles.clearButton}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div style={styles.logsSection}>
        <h2 style={styles.sectionTitle}>Work Logs</h2>
        {!workLogs || workLogs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No work logs found{(selectedEmployee || selectedProject || startDate || endDate) ? ' with the current filters.' : ' yet.'}</p>
            {(selectedEmployee || selectedProject || startDate || endDate) && (
              <button onClick={clearFilters} style={styles.clearFiltersButton}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={styles.logsGrid}>
            {workLogs.map((log) => (
              <div key={log.id} style={styles.logCard}>
                <div style={styles.logHeader}>
                  <div>
                    <div style={styles.employeeName}>{log.employee_name}</div>
                    <div style={styles.projectName}>{log.project_title}</div>
                  </div>
                  <div style={styles.dateInfo}>{formatDate(log.check_in_time)}</div>
                </div>

                <div style={styles.logContent}>
                  <div style={styles.photoSection}>
                    {log.check_in_photo_url && (
                      <div style={styles.photoContainer}>
                        <div style={styles.photoLabel}>Check-in</div>
                        <img
                          src={log.check_in_photo_url}
                          alt="Check-in"
                          style={styles.thumbnail}
                        />
                        <div style={styles.photoTime}>{formatTime(log.check_in_time)}</div>
                      </div>
                    )}
                    {log.check_out_photo_url && (
                      <div style={styles.photoContainer}>
                        <div style={styles.photoLabel}>Check-out</div>
                        <img
                          src={log.check_out_photo_url}
                          alt="Check-out"
                          style={styles.thumbnail}
                        />
                        <div style={styles.photoTime}>{formatTime(log.check_out_time)}</div>
                      </div>
                    )}
                  </div>

                  <div style={styles.logDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Hours:</span>
                      <span style={styles.detailValue}>
                        {calculateHours(log.check_in_time, log.check_out_time)}
                      </span>
                    </div>
                    {log.check_in_latitude && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>GPS:</span>
                        <span style={styles.detailValue}>Available</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(log.id)}
                  style={styles.viewButton}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
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
    padding: '2rem',
    color: theme.colors.error,
    fontSize: theme.typography.bodyLarge.fontSize,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.error}`,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.element,
    padding: '3rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  errorTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    margin: '0 0 1rem 0',
  },
  errorHint: {
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
    marginTop: theme.spacing.element,
    marginBottom: '0.5rem',
  },
  errorList: {
    textAlign: 'left',
    color: theme.colors.textLight,
    fontSize: theme.typography.small.fontSize,
    marginBottom: theme.spacing.element,
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  header: {
    marginBottom: theme.spacing.component,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    margin: 0,
  },
  summarySection: {
    marginBottom: theme.spacing.component,
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.element,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.element,
    marginBottom: theme.spacing.component,
  },
  statCard: {
    background: theme.colors.white,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  summaryTables: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing.element,
  },
  summaryTableContainer: {
    background: theme.colors.white,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
  },
  summaryTableTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.element,
  },
  summaryTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  summaryName: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.text,
  },
  summaryHours: {
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filtersSection: {
    background: theme.colors.white,
    padding: '1.5rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    marginBottom: theme.spacing.component,
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.element,
    alignItems: 'end',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.typography.small.fontSize,
  },
  input: {
    padding: '0.75rem',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.inputBg,
  },
  select: {
    padding: '0.75rem',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.inputBg,
    cursor: 'pointer',
  },
  clearButtonContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  clearButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.backgroundLight,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    width: '100%',
  },
  logsSection: {
    marginBottom: theme.spacing.component,
  },
  emptyState: {
    background: theme.colors.white,
    padding: '3rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    textAlign: 'center',
    color: theme.colors.textLight,
    fontSize: theme.typography.body.fontSize,
  },
  clearFiltersButton: {
    marginTop: theme.spacing.element,
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  logsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: theme.spacing.element,
  },
  logCard: {
    background: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    overflow: 'hidden',
  },
  logHeader: {
    padding: '1.25rem',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  employeeName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '0.25rem',
  },
  projectName: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  dateInfo: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  logContent: {
    padding: '1.25rem',
  },
  photoSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  photoContainer: {
    flex: 1,
    textAlign: 'center',
  },
  photoLabel: {
    fontSize: theme.typography.tiny.fontSize,
    color: theme.colors.textLight,
    marginBottom: '0.5rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  thumbnail: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: theme.borderRadius.md,
    marginBottom: '0.5rem',
  },
  photoTime: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.text,
    fontWeight: '600',
  },
  logDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.typography.small.fontSize,
  },
  detailLabel: {
    color: theme.colors.textLight,
  },
  detailValue: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  viewButton: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    border: 'none',
    borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`,
    cursor: 'pointer',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
};

export default ContractorWorkLogs;