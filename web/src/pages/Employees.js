import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import employeeService from '../services/employeeService';

const Employees = () => {
  const navigate = useNavigate(); 
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await employeeService.getAllEmployees();
      setEmployees(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeAdded = () => {
    setShowAddModal(false);
    fetchEmployees();
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <p className="text-center text-text-light text-lg py-12 px-4">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <button onClick={() => navigate('/contractor/dashboard')} className="py-2.5 px-5 bg-transparent text-text border-2 border-border rounded-md cursor-pointer text-base font-semibold mb-4 transition-all duration-200">
      ← Back to Dashboard
    </button>
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <h1 className="text-[2rem] font-bold text-text m-0 tracking-tight">Employees</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-3.5 px-7 bg-primary text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm"
        >
          + Add Employee
        </button>
      </div>

      {error && <div className="bg-error-light text-error p-4 rounded-md mb-8 border border-error text-base">{error}</div>}

      {employees.length === 0 ? (
        <div className="text-center py-16 px-5 bg-white rounded-lg border border-border-light">
          <p className="text-text-light text-lg leading-relaxed">No employees yet. Add your first employee to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {employees.map((employee) => (
            <Link
              key={employee.id}
              to={`/contractor/employees/${employee.id}`}
              className="bg-white border border-border-light rounded-lg p-8 no-underline transition-all duration-200 shadow-sm"
            >
              <div className="flex justify-between items-start gap-5 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xl font-semibold text-text m-0 mb-2">{employee.name}</h3>
                  <p className="text-base text-text-light m-0 mb-1">{employee.email}</p>
                  {employee.phone && (
                    <p className="text-sm text-text-light m-0">📞 {employee.phone}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2.5">
                  <div className="text-xl font-bold text-primary">
                    ${employee.hourly_rate}/hr
                  </div>
                  {employee.is_active ? (
                    <span className="py-1.5 px-3.5 bg-success text-white rounded-full text-sm font-semibold">Active</span>
                  ) : (
                    <span className="py-1.5 px-3.5 bg-text-light text-white rounded-full text-sm font-semibold">Inactive</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleEmployeeAdded}
        />
      )}
    </div>
  );
};

const AddEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hourly_rate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
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
      await employeeService.createEmployee(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] flex justify-center items-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-8 border-b border-border-light">
          <h2 className="text-[1.5rem] font-bold text-text m-0 tracking-tight">Add New Employee</h2>
          <button onClick={onClose} className="bg-none border-none text-[2rem] text-text-light cursor-pointer p-0 w-8 h-8 flex items-center justify-center leading-none transition-colors duration-200">×</button>
        </div>

        {error && <div className="bg-error-light text-error py-3.5 px-4 border border-error my-4 mx-8 rounded-md text-base">{error}</div>}

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-5">
            <label className="block text-base font-semibold text-text mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full py-3.5 px-4 border-2 border-border rounded-md text-base font-sans box-border transition-all duration-200"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-base font-semibold text-text mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full py-3.5 px-4 border-2 border-border rounded-md text-base font-sans box-border transition-all duration-200"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-base font-semibold text-text mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full py-3.5 px-4 border-2 border-border rounded-md text-base font-sans box-border transition-all duration-200"
            />
          </div>

          <div className="mb-5">
            <label className="block text-base font-semibold text-text mb-2">Hourly Rate ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
              className="w-full py-3.5 px-4 border-2 border-border rounded-md text-base font-sans box-border transition-all duration-200"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 flex-wrap">
            <button
              type="button"
              onClick={onClose}
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
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Employees;