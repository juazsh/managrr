import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeService';
import projectService from '../services/projectService';

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
      <div className="max-w-[900px] mx-auto p-6">
        <p className="text-center text-text-light text-lg py-12 px-4">Loading employee...</p>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="max-w-[900px] mx-auto p-6">
        <div className="bg-error-light text-error p-4 rounded-md mb-6 border border-error text-base">{error}</div>
        <button onClick={() => navigate('/contractor/employees')} className="py-2.5 px-5 bg-transparent text-text border-2 border-border rounded-md cursor-pointer text-base font-semibold mb-4 transition-all duration-200">
          ← Back to Employees
        </button>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="max-w-[900px] mx-auto p-6">
      <button onClick={() => navigate('/contractor/employees')} className="py-2.5 px-5 bg-transparent text-text border-2 border-border rounded-md cursor-pointer text-base font-semibold mb-4 transition-all duration-200">
        ← Back to Employees
      </button>

      {error && <div className="bg-error-light text-error p-4 rounded-md mb-6 border border-error text-base">{error}</div>}

      <div className="bg-white border border-border-light rounded-lg p-8 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <h1 className="text-3xl font-bold text-text m-0 tracking-tight">{employee.name}</h1>
          {employee.is_active ? (
            <span className="py-2 px-4 bg-success text-white rounded-full text-base font-semibold">Active</span>
          ) : (
            <span className="py-2 px-4 bg-text-light text-white rounded-full text-base font-semibold">Inactive</span>
          )}
        </div>

        {!isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-center py-3 border-b border-border-light">
              <span className="text-base text-text-light font-semibold min-w-[120px]">Email:</span>
              <span className="text-lg text-text font-medium">{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex gap-3 items-center py-3 border-b border-border-light">
                <span className="text-base text-text-light font-semibold min-w-[120px]">Phone:</span>
                <span className="text-lg text-text font-medium">{employee.phone}</span>
              </div>
            )}
            <div className="flex gap-3 items-center py-3 border-b border-border-light">
              <span className="text-base text-text-light font-semibold min-w-[120px]">Hourly Rate:</span>
              <span className="text-lg text-text font-medium">${employee.hourly_rate}/hr</span>
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              <button onClick={() => setIsEditing(true)} className="py-3.5 px-7 bg-primary text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm">
                Edit Details
              </button>
              <button onClick={handleDeactivate} className="py-3.5 px-7 bg-white text-error border-2 border-error rounded-md text-base font-semibold cursor-pointer transition-all duration-200">
                Deactivate Employee
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="text-base font-semibold text-text mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="py-3.5 px-3.5 border-2 border-border rounded-md text-base transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-base font-semibold text-text mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="py-3.5 px-3.5 border-2 border-border rounded-md text-base transition-all duration-200"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-base font-semibold text-text mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="py-3.5 px-3.5 border-2 border-border rounded-md text-base transition-all duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-base font-semibold text-text mb-2">Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                className="py-3.5 px-3.5 border-2 border-border rounded-md text-base transition-all duration-200"
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-2 flex-wrap">
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
                className="py-3.5 px-7 bg-white text-text border-2 border-border rounded-md text-base font-semibold cursor-pointer transition-all duration-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3.5 px-7 bg-primary text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white border border-border-light rounded-lg p-8 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-text mb-4 tracking-tight">Assigned Projects</h2>
        {employee.assigned_projects && employee.assigned_projects.length > 0 ? (
          <div className="flex flex-col gap-3">
            {employee.assigned_projects.map((project) => (
              <div key={project.id} className="py-3.5 px-4 bg-background-light rounded-md border border-border-light">
                <span className="text-base text-text font-medium">{project.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-light text-base">No projects assigned yet.</p>
        )}
      </div>

      <div className="bg-white border border-border-light rounded-lg p-8 mb-6 shadow-sm">
        <h2 className="text-xl font-bold text-text mb-4 tracking-tight">Assign to Projects</h2>
        {availableProjects.length === 0 ? (
          <p className="text-text-light text-base">No projects available.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-4">
            {availableProjects.map((project) => {
              const isAssigned = isProjectAssigned(project.id);
              return (
                <div key={project.id} className="p-4 border border-border-light rounded-md flex flex-col gap-3 bg-white transition-all duration-200">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-text m-0 mb-2">{project.title}</h3>
                    {project.address && (
                      <p className="text-sm text-text-light m-0">📍 {project.address}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAssignProject(project.id)}
                    disabled={isAssigned}
                    className={isAssigned ?
                      "py-2.5 px-5 bg-background-light text-text-light border border-border-light rounded-md text-sm font-semibold cursor-not-allowed" :
                      "py-2.5 px-5 bg-primary text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-200"}
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

export default EmployeeDetail;