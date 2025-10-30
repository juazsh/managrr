import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="max-w-[1200px] mx-auto py-10 px-5">
        <div className="text-center py-12 text-text-light text-base">Loading work logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto py-10 px-5">
        <div>
          <h2>Unable to Load Work Logs</h2>
          <div className="bg-[#FEE] text-[#C00] p-4 rounded-md mb-6 border border-[#FCC]">{error}</div>
          <p>
            This could be due to:
          </p>
          <ul>
            <li>Network connectivity issues</li>
            <li>Server is temporarily unavailable</li>
            <li>Missing API endpoints (check if migration was run)</li>
          </ul>
          <button onClick={fetchInitialData} className="mt-4 py-3 px-6 bg-black text-white border-none rounded-md cursor-pointer text-base font-semibold">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-5">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div>
          <button onClick={() => navigate('/contractor/dashboard')} className="py-2 px-4 bg-transparent text-text border border-border rounded-md cursor-pointer text-base font-medium mb-4">
            ← Back to Dashboard
          </button>
          <h1 className="text-[32px] font-bold text-text m-0">Employee Work Logs</h1>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-text mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-[2rem] font-bold text-text mb-2">{(weeklySummary?.total_hours || 0).toFixed(1)} hrs</div>
            <div className="text-sm text-text-light">Total Hours This Week</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-[2rem] font-bold text-text mb-2">{employeeSummary?.length || 0}</div>
            <div className="text-sm text-text-light">Active Employees</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-[2rem] font-bold text-text mb-2">{workLogs?.length || 0}</div>
            <div className="text-sm text-text-light">Total Work Sessions</div>
          </div>
        </div>

        {(employeeSummary?.length > 0 || projectSummary?.length > 0) && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
            {employeeSummary?.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-base font-semibold text-text mb-4">Hours by Employee</h3>
                <div className="flex flex-col gap-2">
                  {employeeSummary.map((emp) => (
                    <div key={emp.employee_id} className="flex justify-between py-3 px-3 bg-background rounded-md">
                      <span className="text-sm text-text">{emp.employee_name}</span>
                      <span className="text-sm font-semibold text-text">{(emp.total_hours || 0).toFixed(1)} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectSummary?.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-base font-semibold text-text mb-4">Hours by Project</h3>
                <div className="flex flex-col gap-2">
                  {projectSummary.map((proj) => (
                    <div key={proj.project_id} className="flex justify-between py-3 px-3 bg-background rounded-md">
                      <span className="text-sm text-text">{proj.project_title}</span>
                      <span className="text-sm font-semibold text-text">{(proj.total_hours || 0).toFixed(1)} hrs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold text-text mb-4">Filter Work Logs</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 items-end">
          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="py-3 px-3 border border-border rounded-md text-base bg-background cursor-pointer"
            >
              <option value="">All Employees</option>
              {employees && employees.length > 0 && employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="py-3 px-3 border border-border rounded-md text-base bg-background cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects && projects.length > 0 && projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.title}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-3 px-3 border border-border rounded-md text-base bg-background"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-text font-semibold text-sm">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-3 px-3 border border-border rounded-md text-base bg-background"
            />
          </div>

          <div className="flex items-end">
            <button onClick={clearFilters} className="py-3 px-6 bg-background-light text-text border border-border rounded-md cursor-pointer text-base font-semibold w-full">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-text mb-4">Work Logs</h2>
        {!workLogs || workLogs.length === 0 ? (
          <div className="bg-white py-12 px-12 rounded-lg shadow-md text-center text-text-light text-base">
            <p>No work logs found{(selectedEmployee || selectedProject || startDate || endDate) ? ' with the current filters.' : ' yet.'}</p>
            {(selectedEmployee || selectedProject || startDate || endDate) && (
              <button onClick={clearFilters} className="mt-4 py-3 px-6 bg-black text-white border-none rounded-md cursor-pointer text-base font-semibold">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
            {workLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="py-5 px-5 border-b border-border-light flex justify-between items-start">
                  <div>
                    <div className="text-base font-semibold text-text mb-1">{log.employee_name}</div>
                    <div className="text-sm text-text-light">{log.project_title}</div>
                  </div>
                  <div className="text-sm text-text-light">{formatDate(log.check_in_time)}</div>
                </div>

                <div className="py-5 px-5">
                  <div className="flex gap-4 mb-4">
                    {log.check_in_photo_url && (
                      <div className="flex-1 text-center">
                        <div className="text-xs text-text-light mb-2 font-semibold uppercase">Check-in</div>
                        <img
                          src={log.check_in_photo_url}
                          alt="Check-in"
                          className="w-full h-[120px] object-cover rounded-md mb-2"
                        />
                        <div className="text-sm text-text font-semibold">{formatTime(log.check_in_time)}</div>
                      </div>
                    )}
                    {log.check_out_photo_url && (
                      <div className="flex-1 text-center">
                        <div className="text-xs text-text-light mb-2 font-semibold uppercase">Check-out</div>
                        <img
                          src={log.check_out_photo_url}
                          alt="Check-out"
                          className="w-full h-[120px] object-cover rounded-md mb-2"
                        />
                        <div className="text-sm text-text font-semibold">{formatTime(log.check_out_time)}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-light">Hours:</span>
                      <span className="text-text font-semibold">
                        {calculateHours(log.check_in_time, log.check_out_time)}
                      </span>
                    </div>
                    {log.check_in_latitude && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-light">GPS:</span>
                        <span className="text-text font-semibold">Available</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(log.id)}
                  className="w-full py-3.5 px-3.5 bg-black text-white border-none rounded-b-lg cursor-pointer text-base font-semibold transition-colors"
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

export default ContractorWorkLogs;
