import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const employeeService = {
  createEmployee: async (employeeData) => {
    const response = await axios.post(
      `${API_URL}/employees`,
      employeeData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  getAllEmployees: async () => {
    const response = await axios.get(
      `${API_URL}/employees`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  getEmployee: async (employeeId) => {
    const response = await axios.get(
      `${API_URL}/employees/${employeeId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  updateEmployee: async (employeeId, employeeData) => {
    const response = await axios.put(
      `${API_URL}/employees/${employeeId}`,
      employeeData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  deleteEmployee: async (employeeId) => {
    const response = await axios.delete(
      `${API_URL}/employees/${employeeId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  assignProject: async (employeeId, projectId) => {
    const response = await axios.post(
      `${API_URL}/employees/${employeeId}/assign-project`,
      { project_id: projectId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

export default employeeService;